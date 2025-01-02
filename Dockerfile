# FROM arm64v8/node:latest
# FROM node:latest
# FROM alpine
FROM arm64v8/alpine:latest

# Database persitency mount point
RUN mkdir config
VOLUME /config

# Node dependencies / install
COPY package*.json ./
RUN npm ci --omit=dev

# Code transfer
COPY . .

ENTRYPOINT [ "node", "index.js" ]