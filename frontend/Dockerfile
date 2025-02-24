# frontend/Dockerfile
FROM node:22-slim AS build

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
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf


# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
