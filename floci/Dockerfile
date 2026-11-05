# Packages the image-processor Lambda inside the Floci image, so the init hook can
# deploy it on boot. Runs on glibc like the Lambda runtime, which matters for sharp.
FROM node:22-slim AS lambda
WORKDIR /build
RUN apt-get update && apt-get install -y --no-install-recommends zip
COPY lambdas/image-processor/package.json lambdas/image-processor/package-lock.json lambdas/image-processor/tsconfig.json ./
COPY lambdas/image-processor/src ./src
RUN npm ci \
    && npm run build \
    && npm prune --omit=dev \
    && cd dist && zip -qr ../image-processor.zip . \
    && cd .. && zip -qr image-processor.zip node_modules

FROM floci/floci:latest-compat
COPY --from=lambda /build/image-processor.zip /opt/lambda/image-processor.zip
