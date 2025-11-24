FROM rabbitmq:4.2-rc-management-alpine AS rabbitmq
RUN rabbitmq-plugins enable --offline rabbitmq_management rabbitmq_mqtt
COPY rabbitmq.conf /etc/rabbitmq/rabbitmq.conf
EXPOSE 5672 1883

FROM ghcr.io/astral-sh/uv:python3.13-bookworm AS inference-service-build
WORKDIR /app
COPY apps/inference-service/main.py .
COPY apps/inference-service/leaknet.pt .
COPY apps/inference-service/pyproject.toml .
COPY apps/inference-service/uv.lock .

ENV UV_LINK_MODE=copy
RUN --mount=type=cache,target=/root/.cache/uv uv sync --locked

FROM ghcr.io/astral-sh/uv:python3.13-bookworm AS inference-service
WORKDIR /app
COPY --from=inference-service-build /app .
CMD ["uv", "run", "main.py"]

FROM node:24-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run -r build
RUN pnpm deploy --filter=website --prod /prod/website
RUN pnpm deploy --filter=data-ingestion-service --prod /prod/data-ingestion-service
RUN pnpm deploy --filter=notification-service --prod /prod/notification-service


FROM base AS data-ingestion-service
WORKDIR /prod/data-ingestion-service 
COPY --from=build /prod/data-ingestion-service .
ENV NODE_ENV=production
CMD [ "pnpm", "start" ]

FROM base AS notification-service
WORKDIR /prod/notification-service 
COPY --from=build /prod/notification-service .
ENV NODE_ENV=production
CMD [ "pnpm", "start" ]

FROM base AS website
WORKDIR /prod/website
COPY --from=build /prod/website .

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD [ "pnpm", "start" ]

FROM base AS website-dev-deps
WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
# Copy only workspace package files (no node_modules yet)
COPY apps/website/package.json apps/website/
RUN pnpm install --frozen-lockfile

FROM base AS website-dev
WORKDIR /app

COPY . .
COPY --from=website-dev-deps /app/node_modules ./node_modules
COPY --from=website-dev-deps /app/apps/website/node_modules ./apps/website/node_modules

ENV NODE_ENV=development
EXPOSE 3000

ENV WATCHPACK_POLLING=true
ENV CHOKIDAR_USEPOLLING=true

WORKDIR /app/apps/website

CMD ["pnpm", "start"]