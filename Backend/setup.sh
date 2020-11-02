#!/bin/bash
apt update
yes | apt install python3-pip
# apt-get install python3-pip
cd Backend
pip3 install selenium
python3 -m pip install pymongo==3.5.1
cd ..
python Backend/clearDB.py
python3 Backend/crawl.py >crawl_output.txt &
# kill $( pgrep -fl Backend/chromedriver | awk '{print $1}')

npm run dev