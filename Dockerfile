FROM node:18.13.0

WORKDIR choas

COPY . .

RUN npm install


cmd ["npm","run","dev"]