FROM python:3

COPY . .

RUN chmod +x Backend/setup.sh 
RUN chmod +x synchronize.sh 
RUN pip3 install selenium

FROM node:12

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

ENV PORT=3000

EXPOSE 3000



