#!/bin/sh
set -eu

if ! aws s3api head-bucket --bucket "$S3_BUCKET" 2>/dev/null; then
  aws s3 mb "s3://$S3_BUCKET"
fi
