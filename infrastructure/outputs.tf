output "artifact_registry_repo" {
  description = "Full path to the Artifact Registry repository"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.portfolio.repository_id}"
}

output "assets_bucket_url" {
  description = "Public URL for the assets bucket"
  value       = "https://storage.googleapis.com/${google_storage_bucket.assets.name}"
}

output "deploy_service_account" {
  description = "Email of the deploy service account"
  value       = google_service_account.deploy.email
}

output "wif_provider" {
  description = "Full WIF provider resource name (for GitHub Actions auth)"
  value       = google_iam_workload_identity_pool_provider.github_oidc.name
}

output "github_actions_vars" {
  description = "Variables to set in GitHub repo settings (Settings > Secrets and variables > Actions > Variables)"
  value = {
    GCP_PROJECT_ID      = var.project_id
    GCP_PROJECT_NUMBER  = data.google_project.current.number
    GCP_SERVICE_ACCOUNT = google_service_account.deploy.email
    GCP_REGION          = var.region
    GAR_REPO            = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.portfolio.repository_id}"
    WIF_POOL            = google_iam_workload_identity_pool.github.workload_identity_pool_id
    WIF_PROVIDER        = google_iam_workload_identity_pool_provider.github_oidc.workload_identity_pool_provider_id
    ASSETS_BUCKET_URL   = "https://storage.googleapis.com/${google_storage_bucket.assets.name}"
    AGENT_SERVICE_NAME  = var.portfolio_agent_service_name
    AGENT_SERVICE_ACCOUNT = google_service_account.agent.email
  }
}

data "google_project" "current" {
  project_id = var.project_id
}
