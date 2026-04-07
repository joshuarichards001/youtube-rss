FROM node:22-slim AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY server/package.json server/
COPY packages/types/package.json packages/types/
RUN pnpm install --frozen-lockfile

# Copy source and build
COPY packages/types packages/types
COPY server server
RUN pnpm --filter @youtube-rss/types build && pnpm --filter server build

# Production
FROM node:22-slim AS production
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app
COPY --from=base /app .

EXPOSE 3000
CMD ["node", "server/dist/index.js"]
