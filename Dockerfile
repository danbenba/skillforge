# SkillForge MCP server: streamable HTTP on :8765 (put HTTPS in front, e.g. Dokploy/Traefik).
FROM node:22-alpine

# simple-git needs the git binary to clone skill datasources.
RUN apk add --no-cache git

ENV NODE_ENV=production \
    SKILLFORGE_ENV=prod

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --include=dev

COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN npm run build && npm prune --omit=dev

COPY docs ./docs
COPY assets ./assets

EXPOSE 8765
CMD ["node", "dist/index.js", "serve"]
