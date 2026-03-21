FROM node:22-alpine

RUN apk add --no-cache git git-daemon dcron \
 && git config --system init.defaultBranch main

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .
RUN npm run build

# Copy cleanup script and set up daily cron (runs at midnight)
COPY scripts/cleanup.mjs /app/scripts/cleanup.mjs
RUN echo "0 0 * * * GITBIT_ROOT=/data/repos /usr/local/bin/node /app/scripts/cleanup.mjs >> /var/log/gitbit-cleanup.log 2>&1" \
    > /etc/crontabs/root

ENV HOST=0.0.0.0
ENV NUXT_HOST=0.0.0.0
ENV GITBIT_ROOT=/data/repos
ENV PORT=4000

EXPOSE 4000

VOLUME /data/repos

# Start cron in background, then the app
CMD ["sh", "-c", "crond -b && node .output/server/index.mjs"]
