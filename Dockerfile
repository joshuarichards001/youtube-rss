FROM node:22-slim AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# --- Install dependencies ---
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# --- Build server + web ---
FROM deps AS build
COPY tsconfig.json ./
COPY src/ ./src/
COPY web/ ./web/
RUN pnpm build

# --- Production image ---
FROM base AS production
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod
COPY --from=build /app/dist/ ./dist/
COPY --from=build /app/web/dist/ ./web/dist/

EXPOSE 3000
CMD ["node", "dist/index.js"]
