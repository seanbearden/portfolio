#!/usr/bin/env bash
# Upload static assets to GCS bucket (one-time setup)
set -euo pipefail

BUCKET="${1:-seanbearden-assets}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$SCRIPT_DIR/.."

echo "Uploading images to gs://$BUCKET/images/..."
gcloud storage cp -r "$ROOT/site-data/assets/images/*" "gs://$BUCKET/images/"

echo "Uploading PDFs to gs://$BUCKET/pdfs/..."
gcloud storage cp -r "$ROOT/site-data/assets/pdfs/*" "gs://$BUCKET/pdfs/"

echo "Done. Assets available at: https://storage.googleapis.com/$BUCKET/"
