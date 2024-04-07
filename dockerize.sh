#!/bin/bash

# Wait for the 'app' service to become available on port 3000
echo "Waiting for 'app' service to become available..."
dockerize -wait tcp://app:3000 -timeout 60s

# Start Nginx after the 'app' service is ready
echo "'app' service is available. Starting Nginx..."
nginx -g "daemon off;"