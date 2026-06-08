#!/bin/bash
set -e

# Start backend in background
node server.js &
BACKEND_PID=$!

# Start Caddy in background
caddy run --config /etc/caddy/Caddyfile --adapter caddyfile &
CADDY_PID=$!

# Exit if either process exits
wait -n $BACKEND_PID $CADDY_PID
exit $?
