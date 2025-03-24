#!/bin/sh

# Load environment variables
if [ -f .env.${NODE_ENV} ]; then
  export $(cat .env.${NODE_ENV} | grep -v '#' | awk '/=/ {print $1}')
fi

# Generate config.js based on environment variables
echo "window.env = {" > /usr/share/nginx/html/config.js
echo "  API_URL: '${API_URL:-https://skill-matrix.ideaportriga.lv/api}'" >> /usr/share/nginx/html/config.js
echo "};" >> /usr/share/nginx/html/config.js

# Start nginx
nginx -g 'daemon off;' 