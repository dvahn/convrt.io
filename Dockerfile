FROM python:3

# COPY requirements.txt ./
# RUN pip install --no-cache-dir -r requirements.txt

# RUN [ "python3", "get-pip.py" ]
# RUN python -m pip install pymongo
# RUN pip install -U selenium

# RUN chromedriver --args --profile-directory="Default" 
# RUN python clearDB.py 
# RUN python3 crawl.py 
# RUN kill $( pgrep -fl Backend/chromedriver | awk '{print $1}')



COPY . .

RUN chmod +x Backend/setup.sh


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


