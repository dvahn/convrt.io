#!/bin/bash
apt update
yes | apt install python3-pip
cd Backend
pip3 install selenium
python3 -m pip install pymongo==3.5.1
cd ..
python Backend/clearDB.py
echo 'CLEARED DB.'
# nohup python3 Backend/crawl.py $1 $2 &> crawl_log.txt 
# kill $( pgrep -fl Backend/chromedriver | awk '{print $1}')
echo 'FILLED DB.'
npm run dev
echo 'LAUNCHED CONVRT AT LOCALHOST:3000.'