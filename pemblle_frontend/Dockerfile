# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM caddy:2-alpine

# Copy built files from builder stage
COPY --from=builder /app/dist /srv

# Create Caddyfile with SPA routing and API proxies
RUN printf '{\n\
  auto_https off\n\
  admin off\n\
}\n\
\n\
:3008 {\n\
  root * /srv\n\
  encode gzip zstd\n\
  \n\
  # Handle API proxy\n\
  handle /api/* {\n\
    reverse_proxy https://api.pemblle.ink {\n\
       header_up Host api.pemblle.ink\n\
    }\n\
  }\n\
  \n\
  # Handle Uploads proxy\n\
  handle /uploads/* {\n\
    reverse_proxy https://api.pemblle.ink {\n\
       header_up Host api.pemblle.ink\n\
    }\n\
  }\n\
  \n\
  # Handle WebSocket proxy\n\
  handle /ws/* {\n\
    reverse_proxy https://api.pemblle.ink {\n\
       header_up Host api.pemblle.ink\n\
    }\n\
  }\n\
  \n\
  # Handle SPA routing (fallback)\n\
  handle {\n\
    try_files {path} /index.html\n\
    file_server\n\
  }\n\
  \n\
  log {\n\
    output stdout\n\
    format json\n\
  }\n\
}\n' > /etc/caddy/Caddyfile

EXPOSE 3008

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]
