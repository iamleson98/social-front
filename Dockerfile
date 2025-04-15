# Base image
FROM node:22-alpine AS base
WORKDIR /app
EXPOSE 3000
ENV NODE_ENV=production

# Dependencies stage
FROM base AS dependencies
# Install pnpm
RUN apk add --no-cache npm && npm install -g pnpm
# Copy package files
COPY pnpm-lock.yaml package.json ./
# Install dependencies
RUN pnpm install

# Builder stage
FROM dependencies AS builder
# Copy and build
COPY . .
RUN pnpm run build

# Production stage
FROM dependencies AS production
# Copy the build output
COPY --from=builder /app/build build/
COPY --from=builder /app/node_modules ./node_modules

# Start the application
CMD [ "node", "build" ]