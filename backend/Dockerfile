# Backend Dockerfile for Node.js Express API
FROM node:20-alpine AS base

# Install build dependencies for sqlite3 native compile if needed
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Install dependencies first for layer caching
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Ensure data and uploads directories exist with right permissions
RUN mkdir -p data uploads/rooms uploads/complaints uploads/bookings uploads/general

ENV PORT=5000
ENV NODE_ENV=production
ENV DATA_DIR=/app/data
ENV UPLOAD_DIR=/app/uploads

EXPOSE 5000

CMD ["node", "src/server.js"]
