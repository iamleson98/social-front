FROM node:22-alpine AS base

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy only package files first for better caching
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the SvelteKit app
RUN pnpm run build:node

# Use a smaller base image for the production stage
FROM node:22-alpine AS production

WORKDIR /app

# Copy only the necessary files from the build stage
COPY --from=base /app/build ./build
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/pnpm-lock.yaml ./pnpm-lock.yaml

# Reinstall only production dependencies
RUN corepack enable && corepack prepare pnpm@latest --activate && \
  pnpm install --frozen-lockfile --prod

EXPOSE 3000
CMD ["node", "build"]

