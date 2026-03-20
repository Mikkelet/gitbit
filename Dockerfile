FROM node:22-alpine

RUN apk add --no-cache git git-daemon \
 && git config --system init.defaultBranch main

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .
RUN npm run build

ENV HOST=0.0.0.0
ENV NUXT_HOST=0.0.0.0
ENV GITBIT_ROOT=/data/repos
ENV PORT=3000

EXPOSE 3000

VOLUME /data/repos

CMD ["node", ".output/server/index.mjs"]
