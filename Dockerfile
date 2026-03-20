FROM node:22-alpine

RUN apk add --no-cache git git-daemon

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --production

COPY . .

ENV QUICKGIT_ROOT=/data/repos
ENV PORT=3000

EXPOSE 3000

VOLUME /data/repos

CMD ["node", "server.js"]
