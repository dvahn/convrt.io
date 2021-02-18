FROM node:12 as ui-build

WORKDIR /app

COPY . .
RUN npm install && npm run build

ENV PORT=8080

EXPOSE 8080