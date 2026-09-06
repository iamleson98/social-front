FROM oven/bun:1 AS base

WORKDIR /app

# Copy only package files first for better caching
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the SvelteKit app with the node adapter
RUN RUNTIME=node bun run build

# Production stage: node runs the built output
FROM node:22-alpine AS production

WORKDIR /app

# Copy only the necessary files from the build stage
COPY --from=base /app/build ./build
COPY --from=base /app/package.json ./package.json

# Install only production dependencies (node runtime in prod stage)
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY --from=base /app/bun.lock ./bun.lock
# use bun from the base stage for a faithful install
COPY --from=oven/bun:1 /usr/local/bin/bun /usr/local/bin/bun
RUN bun install --frozen-lockfile --production

EXPOSE 3000
CMD ["node", "build"]
