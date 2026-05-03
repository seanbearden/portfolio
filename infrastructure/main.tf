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
    "secretmanager.googleapis.com",
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
    origin          = ["https://${var.domain}", "https://www.${var.domain}"]
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

# -----------------------------------------------------------
# Portfolio Agent (Chatbot) infrastructure
# -----------------------------------------------------------
resource "google_service_account" "agent" {
  account_id   = "portfolio-agent"
  display_name = "Portfolio Agent"
  description  = "Runtime service account for the portfolio-agent chatbot"
}

resource "google_project_iam_member" "agent_logging" {
  project = var.project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.agent.email}"
}

# -----------------------------------------------------------
# Secret Manager — Agent API Keys
# -----------------------------------------------------------
locals {
  agent_secrets = [
    "ANTHROPIC_API_KEY",
    "GOOGLE_API_KEY",
    "LANGFUSE_PUBLIC_KEY",
    "LANGFUSE_SECRET_KEY",
    "LANGFUSE_HOST",
  ]
}

resource "google_secret_manager_secret" "agent_secrets" {
  for_each  = toset(local.agent_secrets)
  secret_id = each.value

  replication {
    auto {}
  }

  depends_on = [google_project_service.apis["secretmanager.googleapis.com"]]
}

resource "google_secret_manager_secret_iam_member" "agent_accessor" {
  for_each  = toset(local.agent_secrets)
  secret_id = google_secret_manager_secret.agent_secrets[each.value].id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.agent.email}"
}

# -----------------------------------------------------------
# Portfolio Agent Cloud Run Service
# -----------------------------------------------------------
resource "google_cloud_run_v2_service" "agent" {
  name     = var.portfolio_agent_service_name
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    service_account = google_service_account.agent.email

    containers {
      image = "us-docker.pkg.dev/cloudrun/container/hello" # Placeholder

      dynamic "env" {
        for_each = toset(local.agent_secrets)
        content {
          name = env.value
          value_source {
            secret_key_ref {
              secret  = google_secret_manager_secret.agent_secrets[env.value].secret_id
              version = "latest"
            }
          }
        }
      }
    }
  }

  # Ignore changes to the image as it's managed by GitHub Actions
  lifecycle {
    ignore_changes = [
      template[0].containers[0].image,
    ]
  }

  depends_on = [google_project_service.apis["run.googleapis.com"]]
}

# -----------------------------------------------------------
# Portfolio Agent Cloud Run permissions
# -----------------------------------------------------------
resource "google_cloud_run_v2_service_iam_member" "agent_public_invoker" {
  project  = var.project_id
  location = var.region
  name     = var.portfolio_agent_service_name
  role     = "roles/run.invoker"
  member   = "allUsers"

  depends_on = [google_project_service.apis["run.googleapis.com"]]
}

# Allow deploy service account to act as agent service account
resource "google_service_account_iam_member" "deploy_as_agent" {
  service_account_id = google_service_account.agent.name
  role               = "roles/iam.serviceAccountUser"
  member             = "serviceAccount:${google_service_account.deploy.email}"
}

# Allow deploy service account to manage the agent Cloud Run service
# We use a project-level binding for simplicity in CI, but scoped
# to roles/run.admin which is already in deploy_roles.
# If we wanted to scope further, we'd use a per-service binding.
