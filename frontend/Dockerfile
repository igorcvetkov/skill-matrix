# frontend/Dockerfile
FROM --platform=linux/amd64 node:22-alpine AS build

ARG NODE_ENV

ENV NODE_ENV=${NODE_ENV}

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Vue.js application
RUN npm run build -- --mode ${NODE_ENV}

# Serve the application using a lightweight server
FROM --platform=linux/amd64 nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY start.sh /usr/local/bin/start.sh  
RUN chmod +x /usr/local/bin/start.sh  



# Expose port 80
EXPOSE 80

CMD ["/usr/local/bin/start.sh"]
