#!/bin/sh
set -e

# Pool of source IPs k6 rotates VUs across, so nginx's per-IP limit_req zones
# see distinct clients instead of every VU sharing this container's one address.
# Must stay inside loadtest_network's subnet (10.90.0.0/16, see docker-compose.yaml)
# and must not overlap the low range Docker hands out to real containers on that
# network, so it's pinned to the network's upper half.
LOCAL_IPS="${K6_LOCAL_IPS:-10.90.128.0/17}"
IFACE="${K6_IFACE:-eth0}"

echo "binding local IP pool ${LOCAL_IPS} to ${IFACE} for source-IP rotation"
# `ip addr add` only assigns the single base address of the CIDR, not the
# whole range, so every other source IP k6 rotates through fails to bind
# with EADDRNOTAVAIL. `ip route add local` marks the entire prefix as
# locally bindable instead.
ip route add local "$LOCAL_IPS" dev "$IFACE"

exec k6 run --local-ips="$LOCAL_IPS" "$@"
