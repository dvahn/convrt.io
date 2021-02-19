FROM node:10 as ui-build

WORKDIR /shared

COPY . .
RUN npm install && npm run build

ENV PORT=8080

EXPOSE 8080