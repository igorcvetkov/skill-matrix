#!/bin/sh

# Generate config.js based on environment variables
echo "window.env = {" > /usr/share/nginx/html/config.js
echo "  API_URL: '${API_URL:-http://localhost:3000/api}'" >> /usr/share/nginx/html/config.js
echo "};" >> /usr/share/nginx/html/config.js

# Start Nginx
nginx -g 'daemon off;'
