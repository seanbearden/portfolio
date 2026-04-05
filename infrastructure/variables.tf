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
