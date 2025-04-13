# Base image with Node.js
FROM node:20-alpine AS base
WORKDIR /usr/src/app
EXPOSE 3000

# Dependencies stage
FROM base AS dependencies
COPY package*.json ./
RUN npm ci

# Install DragonFly
RUN apk add --no-cache \
    dragonfly \
    && mkdir -p /var/lib/dragonfly

# Builder stage
FROM dependencies AS builder
COPY . .
RUN npm run build

# Production stage
FROM base AS production
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/build ./build
COPY static ./static

# Set permissions
RUN chown -R node:node /usr/src/app
USER node

# Start the application
CMD ["npm", "start"]