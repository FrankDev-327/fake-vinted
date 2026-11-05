FROM golang:1.25-alpine AS build
RUN apk add --no-cache git
ENV GOBIN=/usr/local/bin
RUN go install go.k6.io/xk6/cmd/xk6@latest
WORKDIR /build
RUN xk6 build --k6-version v1.8.1 --with github.com/xemax32/xk6-socket.io@latest --output /build/k6

FROM alpine:3.20
RUN apk add --no-cache iproute2 ca-certificates
COPY --from=build /build/k6 /usr/local/bin/k6
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

WORKDIR /reports
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
