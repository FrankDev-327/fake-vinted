#!/bin/sh
set -eu

FUNCTION=image-processor
ZIP=fileb:///opt/lambda/image-processor.zip
ENVIRONMENT="Variables={LISTING_INTERNAL_URL=$LISTING_INTERNAL_URL,IMAGE_PROCESSOR_API_KEY=$IMAGE_PROCESSOR_API_KEY}"

if aws lambda get-function --function-name "$FUNCTION" >/dev/null 2>&1; then
  aws lambda update-function-code --function-name "$FUNCTION" --zip-file "$ZIP" >/dev/null
  aws lambda update-function-configuration --function-name "$FUNCTION" \
    --timeout 30 --memory-size 512 --environment "$ENVIRONMENT" >/dev/null
else
  aws lambda create-function --function-name "$FUNCTION" \
    --runtime nodejs22.x --handler index.handler \
    --role arn:aws:iam::000000000000:role/lambda-role \
    --timeout 30 --memory-size 512 --environment "$ENVIRONMENT" \
    --zip-file "$ZIP" >/dev/null
fi

aws s3api put-bucket-notification-configuration --bucket "$S3_BUCKET" --notification-configuration '{
  "LambdaFunctionConfigurations": [{
    "Id": "process-listing-images",
    "LambdaFunctionArn": "arn:aws:lambda:us-east-1:000000000000:function:image-processor",
    "Events": ["s3:ObjectCreated:*"],
    "Filter": { "Key": { "FilterRules": [{ "Name": "prefix", "Value": "listings/" }] } }
  }]
}'
