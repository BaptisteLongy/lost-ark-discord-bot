FROM arm64v8/node:alpine3.20
# FROM node:alpine3.20

USER node
RUN mkdir /home/node/la-bot
WORKDIR /home/node/la-bot
# Database persitency mount point
RUN mkdir config
VOLUME /home/node/la-bot/config

# Node dependencies / install
COPY package*.json ./
RUN npm ci --omit=dev

# Code transfer
COPY . .

ENTRYPOINT [ "node", "index.js" ]