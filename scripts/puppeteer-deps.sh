#!/bin/sh
echo @edge http://dl-cdn.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories && \
echo @edge http://dl-cdn.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories && \

apk add --no-cache \
      chromium@edge \
      nss@edge \
      freetype \
      harfbuzz@edge \
      ca-certificates@edge \
      ttf-freefont@edge \
      harfbuzz@edge
