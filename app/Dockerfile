# dev
FROM node:20.12.0-alpine AS dev
RUN apk add --no-cache tzdata
ENV TZ Europe/Moscow
ENV NODE_PATH /opt/server/node_modules

COPY /*.json ./
RUN npm i --legacy-peer-deps

WORKDIR /opt/server/

# production
FROM node:20.12.0-alpine AS production
RUN apk add --no-cache tzdata supervisor
ENV TZ Europe/Moscow
ENV NODE_PATH /opt/server/node_modules

WORKDIR /opt/server/

COPY supervisor/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

COPY /*.json ./
RUN npm i --legacy-peer-deps

COPY /. ./
RUN npm run build

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]