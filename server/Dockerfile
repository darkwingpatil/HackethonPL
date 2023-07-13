FROM harbor.vnerd.com/proxy/library/node:16.20.0-alpine

WORKDIR /usr/app
COPY package.json .
RUN npm install --quiet
COPY . .