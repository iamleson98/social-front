# Base image
FROM node:20-alpine AS base
WORKDIR /app
EXPOSE 3000
ENV NODE_ENV=production

# Builder stage
FROM base AS builder
# Install pnpm
RUN apk add --no-cache npm && npm install -g pnpm
# Copy and build
COPY . .
RUN pnpm install && pnpm run build
RUN pnpm prune --production

# Production stage
FROM base AS production
# Copy the build output
COPY --from=builder /app/build build/
# Clean up any unnecessary files
RUN rm -rf /app/build/.svelte-kit
# Start the application
CMD [ "node", "./build" ]