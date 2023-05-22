# Base image
FROM node:14-alpine

# Set working directory
WORKDIR /app

# Copy root directory to working directory
COPY . .

# Install frontend dependencies and build
WORKDIR /app/frontend
RUN npm install
RUN npm run build

# Expose the port node.js is running on
EXPOSE 3000

# Install backend dependencies and start
WORKDIR /app/backend
RUN npm install
CMD ["npm", "start"]

