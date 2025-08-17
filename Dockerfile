# Stage 1: Build the app
FROM node:22-alpine AS builder

# Install pnpm via corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy only lockfile first for better caching
COPY pnpm-lock.yaml package.json ./

# Install dependencies (cached)
RUN pnpm install --frozen-lockfile

# Copy rest of the source
COPY . .

# Build the SvelteKit app and bundle using Nodejs adapter
RUN pnpm run build:node

# Stage 2: Serve with NGINX
FROM nginx:stable-alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx/prod/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static files
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
