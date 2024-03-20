# FROM arm64v8/node:latest
# FROM node:latest
# FROM alpine
FROM arm64v8/alpine:latest

# Installs latest Chromium (100) package.
RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont \
      nodejs \
      npm

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
# ENV PUPPETEER_SKIP_DOWNLOAD true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Add user so we don't need --no-sandbox.
RUN addgroup -S pptruser && adduser -S -G pptruser pptruser \
    && mkdir -p /home/pptruser/Downloads /app \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /app

USER pptruser

WORKDIR /home/pptruser

# WORKDIR /usr/lost-ark-bot

# Node dependencies / install
COPY package*.json ./
RUN npm ci --omit=dev

# Code transfer
COPY . .

ENTRYPOINT [ "node", "index.js" ]