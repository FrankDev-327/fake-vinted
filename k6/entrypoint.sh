#!/bin/sh
set -e

LOCAL_IPS="${K6_LOCAL_IPS:-10.90.128.0/17}"
IFACE="${K6_IFACE:-eth0}"

echo "binding local IP pool ${LOCAL_IPS} to ${IFACE} for source-IP rotation"
ip route add local "$LOCAL_IPS" dev "$IFACE"

START_DELAY="${K6_START_DELAY:-30}"
echo "waiting ${START_DELAY}s for backend services to finish starting up"
sleep "$START_DELAY"

exec k6 run --local-ips="$LOCAL_IPS" "$@"
