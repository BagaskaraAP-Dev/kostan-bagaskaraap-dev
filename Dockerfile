# -------------------------------------------------------------------
# Multi-Stage Unified Production Dockerfile
# Ideal for 1-click cloud deploy (Render, Railway, Fly.io, Cloud Run)
# -------------------------------------------------------------------

# Stage 1: Build React + Tailwind Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Production Backend & Runtime
FROM node:20-alpine AS runner
RUN apk add --no-cache python3 make g++ wget
WORKDIR /app

# Install backend production dependencies
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm ci --only=production

# Copy backend source
COPY backend/ /app/backend/

# Copy built frontend assets
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Ensure persistence directories exist
RUN mkdir -p /app/backend/data /app/backend/uploads/rooms /app/backend/uploads/complaints /app/backend/uploads/bookings /app/backend/uploads/general

ENV PORT=5000
ENV NODE_ENV=production
ENV DATA_DIR=/app/backend/data
ENV UPLOAD_DIR=/app/backend/uploads

EXPOSE 5000

HEALTHCHECK --interval=15s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

CMD ["node", "src/server.js"]
