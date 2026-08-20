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

# docker-compose `depends_on` only waits for containers to start, not for the
# apps inside them to finish building/migrating/booting (chat_vinted, users,
# listing, notifications all run a full build + migration before listening),
# so give them a head start before k6 opens the floodgates.
START_DELAY="${K6_START_DELAY:-30}"
echo "waiting ${START_DELAY}s for backend services to finish starting up"
sleep "$START_DELAY"

exec k6 run --local-ips="$LOCAL_IPS" "$@"
