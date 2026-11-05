#!/bin/sh
# Floci runs this once S3 is ready. With persistent storage the bucket survives
# restarts, so only create it when it's missing: hooks are fail-fast.
set -eu

if ! aws s3api head-bucket --bucket "$S3_BUCKET" 2>/dev/null; then
  aws s3 mb "s3://$S3_BUCKET"
fi
