FROM node:20-alpine

WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package manifests first for cached installs
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the source
COPY . .

# Build both client and server
RUN npm run build

# Expose default port
EXPOSE 3000

ENV PORT=3000

CMD ["node", "dist/server/node-build.mjs"]
