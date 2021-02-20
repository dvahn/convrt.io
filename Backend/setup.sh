#!/bin/bash
apt update
yes | apt install python3-pip
cd Backend
pip3 install selenium
python3 -m pip install pymongo==3.5.1
cd ..
python3 Backend/clearDB.py
npm run dev
echo 'LAUNCHED CONVRT AT LOCALHOST:8080.'