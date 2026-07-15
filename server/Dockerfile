# ── Build stage ────────────────────────────────────────────────────────────────
FROM node:20.18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ── Runtime stage ──────────────────────────────────────────────────────────────
FROM node:20.18-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

# Production dependencies only.
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Compiled output from the build stage.
COPY --from=build /app/dist ./dist
# Optional: ship migrations alongside the runtime image.
COPY migrations ./migrations

# Run as the built-in non-root user.
USER node

EXPOSE 3001
CMD ["node", "dist/index.js"]
