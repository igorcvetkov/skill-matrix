#!/bin/sh

# Load environment variables
if [ -f .env.${NODE_ENV} ]; then
  export $(cat .env.${NODE_ENV} | grep -v '#' | awk '/=/ {print $1}')
fi

# Start the application
npm run serve 