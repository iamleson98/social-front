# build
FROM node:20-alpine AS builder
RUN corepack enable
RUN corepack prepare pnpm@9.6.0 --activate

WORKDIR /app
COPY package.json pnpm-lock.yaml svelte.config.js ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build
RUN pnpm prune --production

# deploy
FROM node:20-alpine
ENV VITE_GRAPHQL_API_END_POINT="https://sitename.saleor.cloud/graphql/"
ENV VITE_LOCAL_URL="http://localhost:5173"
WORKDIR /app
COPY --from=builder /app/build build/
COPY --from=builder /app/node_modules node_modules/
COPY package.json .
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "build"]
