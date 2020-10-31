FROM node:12

WORKDIR /app

COPY package.json ./

COPY get-pip.py ./ 

RUN npm install

COPY . .

ENV PORT=3000

EXPOSE 3000

# FROM python:3

# # COPY requirements.txt ./
# # RUN pip install --no-cache-dir -r requirements.txt

# # RUN [ "python3", "get-pip.py" ]
# RUN curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
# RUN python get-pip.py
# RUN python -m pip install pymongo

# COPY . .

# RUN chmod +x Backend/setup.sh

CMD [ "npm", "run", "dev" ]
