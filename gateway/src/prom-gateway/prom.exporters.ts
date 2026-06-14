import { Counter, Histogram } from "prom-client";

export const requestCounter = new Counter({
    name: "http_requests_total",
    help: "Total number of HTTP requests",
    labelNames: ["method", "endpoint", "status_code"],
});

export const requestDurationHistogram = new Histogram({
    name: "http_request_duration_seconds",
    help: "Duration of HTTP requests in seconds",
    labelNames: ["method", "endpoint", "status_code"],
    buckets: [0.1, 0.5, 1, 2.5, 5, 10], // Buckets for response time in seconds
});