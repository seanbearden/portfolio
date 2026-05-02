# ---- Build stage ----
FROM node:25-slim AS build

WORKDIR /app

# Copy content that Vite imports at build time
COPY content/ content/

# Install frontend dependencies
COPY frontend/package.json frontend/package-lock.json frontend/
RUN cd frontend && npm ci

# Copy frontend source
COPY frontend/ frontend/

ARG VITE_ASSETS_BASE_URL
RUN cd frontend && npm run build

# ---- Serve stage ----
FROM nginx:1.29-alpine AS production

COPY --from=build /app/frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 8080
