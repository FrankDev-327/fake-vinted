FROM golang:1.25-alpine AS build
RUN apk add --no-cache git
ENV GOBIN=/usr/local/bin
RUN go install go.k6.io/xk6/cmd/xk6@latest
WORKDIR /build
# socket.io extension for the chat ws test — https://github.com/XEmAX32/xk6-socket.io
# pinned to the v1.x k6 core (module path go.k6.io/k6, not go.k6.io/k6/v2):
# the extension's go.mod requires go.k6.io/k6 v1.4.2, and building against
# xk6's default "latest" (v2.x) puts a conflicting k6 module in the graph,
# causing xk6-foundry to silently drop the extension from the binary.
RUN xk6 build --k6-version v1.8.1 --with github.com/xemax32/xk6-socket.io@latest --output /build/k6

FROM alpine:3.20
# iproute2 gives us `ip addr add`, needed to bind the --local-ips pool onto eth0
RUN apk add --no-cache iproute2 ca-certificates
COPY --from=build /build/k6 /usr/local/bin/k6
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

WORKDIR /reports
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
