#!/bin/bash

# Set the path to the .env.local file
ENV_FILE=".env.local"

# Get the value to update from the command-line argument
NEW_H9_API_PROXY_URL="$1"

# Change the working directory to the project directory
cd /home/X/h9-saas/orch/orch-ui

# Update the .env.local file with the new value
TEMP_FILE=$(mktemp)
grep -v '^H9_API_PROXY_URL=' "$ENV_FILE" > "$TEMP_FILE"
echo "H9_API_PROXY_URL=$NEW_H9_API_PROXY_URL" >> "$TEMP_FILE"
mv "$TEMP_FILE" "$ENV_FILE"


# Run the yarn command
sleep 1s

# cat /home/X/h9-saas/orch/orch-ui/.env.local
yarn preview --host &

child=$!
echo "PID: $child"
wait "$child"
