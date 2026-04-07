FROM node:22-slim AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY server/package.json server/
COPY web/package.json web/
COPY packages/types/package.json packages/types/
RUN pnpm install --frozen-lockfile

# Build args for Vite (inlined at build time)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

# Copy source and build
COPY packages/types packages/types
COPY server server
COPY web web
RUN pnpm --filter @youtube-rss/types build && pnpm --filter youtube-rss build && pnpm --filter server build

# Production
FROM node:22-slim AS production
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app
COPY --from=base /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=base /app/server/package.json server/
COPY --from=base /app/web/package.json web/
COPY --from=base /app/packages/types/package.json packages/types/
RUN pnpm install --frozen-lockfile --prod

COPY --from=base /app/packages/types/dist packages/types/dist
COPY --from=base /app/server/dist server/dist
COPY --from=base /app/web/dist web/dist

EXPOSE 3000
CMD ["node", "server/dist/index.js"]
