variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "GCP region"
  type        = string
  default     = "us-central1"
}

variable "github_repo" {
  description = "GitHub repository in owner/repo format"
  type        = string
  default     = "seanbearden/portfolio"
}

variable "assets_bucket_name" {
  description = "Name for the public assets bucket"
  type        = string
  default     = "seanbearden-assets"
}

variable "domain" {
  description = "Custom domain for the portfolio site"
  type        = string
  default     = "seanbearden.com"
}

variable "cloud_run_service_name" {
  description = "Name of the Cloud Run service (created by GitHub Actions deploy)"
  type        = string
  default     = "portfolio-frontend"
}

variable "agent_service_name" {
  description = "Name of the Agent Cloud Run service"
  type        = string
  default     = "portfolio-agent"
}
