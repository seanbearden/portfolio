terraform {
  required_version = ">= 1.5"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 7.30"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# -----------------------------------------------------------
# Enable required APIs
# -----------------------------------------------------------
locals {
  apis = [
    "run.googleapis.com",
    "artifactregistry.googleapis.com",
    "storage.googleapis.com",
    "iam.googleapis.com",
    "iamcredentials.googleapis.com",
    "cloudresourcemanager.googleapis.com",
  ]
}

resource "google_project_service" "apis" {
  for_each = toset(local.apis)
  service  = each.value

  disable_dependent_services = false
  disable_on_destroy         = false
}

# -----------------------------------------------------------
# Artifact Registry
# -----------------------------------------------------------
resource "google_artifact_registry_repository" "portfolio" {
  repository_id = "portfolio"
  location      = var.region
  format        = "DOCKER"
  description   = "Container images for seanbearden.com"

  cleanup_policies {
    id     = "keep-recent"
    action = "KEEP"
    most_recent_versions {
      keep_count = 5
    }
  }

  depends_on = [google_project_service.apis["artifactregistry.googleapis.com"]]
}

# -----------------------------------------------------------
# Cloud Storage — public assets (images, PDFs)
# -----------------------------------------------------------
resource "google_storage_bucket" "assets" {
  name     = var.assets_bucket_name
  location = var.region

  uniform_bucket_level_access = true
  public_access_prevention    = "inherited"

  cors {
    origin          = ["https://${var.domain}", "https://www.${var.domain}", "http://localhost:5173", "http://localhost:4173"]
    method          = ["GET", "HEAD"]
    response_header = ["Content-Type", "Cache-Control"]
    max_age_seconds = 3600
  }

  depends_on = [google_project_service.apis["storage.googleapis.com"]]
}

resource "google_storage_bucket_iam_member" "public_read" {
  bucket = google_storage_bucket.assets.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}

# -----------------------------------------------------------
# Deploy service account (used by GitHub Actions + Cloud Run)
# -----------------------------------------------------------
resource "google_service_account" "deploy" {
  account_id   = "portfolio-deploy"
  display_name = "Portfolio Deploy"
  description  = "CI/CD deployment for seanbearden.com"
}

locals {
  deploy_roles = [
    "roles/run.admin",
    "roles/artifactregistry.writer",
    "roles/iam.serviceAccountUser",
    "roles/storage.admin",
  ]
}

resource "google_project_iam_member" "deploy_roles" {
  for_each = toset(local.deploy_roles)

  project = var.project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.deploy.email}"
}

# -----------------------------------------------------------
# Workload Identity Federation (GitHub Actions OIDC)
# -----------------------------------------------------------
resource "google_iam_workload_identity_pool" "github" {
  workload_identity_pool_id = "github-pool"
  display_name              = "GitHub Actions"

  depends_on = [google_project_service.apis["iam.googleapis.com"]]
}

resource "google_iam_workload_identity_pool_provider" "github_oidc" {
  workload_identity_pool_id          = google_iam_workload_identity_pool.github.workload_identity_pool_id
  workload_identity_pool_provider_id = "github-oidc"
  display_name                       = "GitHub OIDC"

  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }

  attribute_mapping = {
    "google.subject"       = "assertion.sub"
    "attribute.repository" = "assertion.repository"
  }

  attribute_condition = "assertion.repository == '${var.github_repo}'"
}

resource "google_service_account_iam_member" "wif_binding" {
  service_account_id = google_service_account.deploy.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.github.name}/attribute.repository/${var.github_repo}"
}

# -----------------------------------------------------------
# Cloud Run public access (allUsers as invoker)
# Service itself is created by GitHub Actions deploy, but
# binding the invoker role here keeps it idempotent.
# -----------------------------------------------------------
resource "google_cloud_run_v2_service_iam_member" "public_invoker" {
  project  = var.project_id
  location = var.region
  name     = var.cloud_run_service_name
  role     = "roles/run.invoker"
  member   = "allUsers"

  depends_on = [google_project_service.apis["run.googleapis.com"]]
}
