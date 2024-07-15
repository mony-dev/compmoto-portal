#!/bin/sh
# wait-for.sh

set -e

host="$1"
shift
cmd="$@"

until PING=$(ping -c1 $host 2>&1); do
  echo "Waiting for $host - $PING"
  sleep 1
done

>&2 echo "$host is up - executing command"
exec $cmd
