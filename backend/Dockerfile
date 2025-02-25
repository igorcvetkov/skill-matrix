# Use a lightweight Node.js base image
FROM node:22-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Set environment to production
ENV NODE_ENV=${NODE_ENV}

# Install dependencies with clean and reproducible installs
RUN npm ci --only=production

# Copy the application code
COPY . .

# Use a minimal final runtime image
FROM node:22-alpine AS runtime

# Set the working directory
WORKDIR /app

# Copy only necessary files from the builder stage
COPY --from=builder /app /app

# Set a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Expose the port the app runs on
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]