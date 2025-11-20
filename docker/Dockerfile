FROM node:22-alpine

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.14.0 --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy all workspace packages (for monorepo)
COPY libs ./libs
COPY apps ./apps
COPY web ./web


# Install dependencies
RUN pnpm install --frozen-lockfile --ignore-scripts --recursive

# Debug: Show what was copied
RUN echo "=== Root directory ===" && ls -la
RUN echo "=== Libs/contracts directory ===" && ls -la libs/contracts
RUN echo "=== Apps/api directory ===" && ls -la apps/api

# # Copy source code
# COPY . .

# Build the application
RUN npx turbo build

EXPOSE 5000

# Start the api application
WORKDIR /app/apps/api
CMD ["pnpm", "start"]