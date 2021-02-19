FROM node:10 as ui-build

WORKDIR /app

COPY . .
RUN npm install && npm run build
RUN npm install -g serve

# RUN serve -s dist 

ENV PORT=5000

EXPOSE 5000