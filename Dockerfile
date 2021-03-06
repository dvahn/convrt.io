FROM python:3

COPY . .

RUN chmod +x Backend/setup.sh 
RUN chmod +x crawl.sh 
RUN chmod +x synchronize.sh 
RUN pip3 install selenium


FROM node:12

WORKDIR /app

RUN curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
RUN python get-pip.py
RUN python -m pip install pymongo

COPY package.json ./
COPY public ./

RUN npm install

COPY . .

ENV PORT=3000

EXPOSE 3000


