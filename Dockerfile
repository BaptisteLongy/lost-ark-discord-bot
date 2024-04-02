FROM arm64v8/node:latest
# FROM node:16

WORKDIR /usr/lost-ark-bot

# Node dependencies / install
COPY package*.json ./
RUN npm ci --omit=dev

# Code transfer
COPY . .

ENTRYPOINT [ "node", "index.js" ]