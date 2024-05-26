#!/bin/bash

# wait-for-it.sh
# Waits until the specified host and port are available before running the command.

set -e

host="$1"
port="$2"
shift 2
cmd="$@"

until nc -z "$host" "$port"; do
  >&2 echo "$host:$port is unavailable - waiting..."
  sleep 1
done

>&2 echo "$host:$port is available - executing command"
exec "$cmd"
