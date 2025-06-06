# FROM docker.io/library/node:22.15.0-alpine3.21 AS base

# RUN apk --no-cache add build-base && \
#     rm -rf /var/cache/apk/*

# RUN corepack enable pnpm

# WORKDIR /app

# COPY ./package.json .
# COPY ./pnpm-lock.yaml .

# RUN pnpm install

# FROM base AS builder

# # COPY . ./

# RUN pnpm build

# ENV NODE_ENV=production
# ENV PORT=3000

# COPY --from=builder /app/build /app/build
# COPY --from=builder /app/node_modules /app/node_modules
# COPY --from=builder /app/static /app/static

# EXPOSE 3000

# FROM builder AS prod

# ENTRYPOINT ["node", "build"]

# FROM nginx:1.28-alpine3.21 AS mermaid

# COPY ./nginx.conf /etc/nginx/conf.d/default.conf
# COPY --from=builder /app/docs /usr/share/nginx/html

# Build stage
FROM docker.io/library/node:22.15.0-alpine3.21 AS builder

# Install build dependencies
RUN apk --no-cache add build-base && \
  rm -rf /var/cache/apk/*

# Enable pnpm
RUN corepack enable pnpm

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the app
RUN pnpm run build

# Production stage with Nginx
FROM nginx:1.28-alpine3.21

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy nginx config
COPY ./nginx/prod/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder
COPY --from=builder /app/build /usr/share/nginx/html

# Copy static files if you have any
COPY --from=builder /app/static /usr/share/nginx/html/static

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
