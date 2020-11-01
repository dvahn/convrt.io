#!/bin/bash
function downloadchrome {
  version="87.0.4280.20"
  download_location="https://chromedriver.storage.googleapis.com/$version/chromedriver_linux64.zip"
  rm /tmp/chromedriver_linux64.zip
  wget -P /tmp $download_location
  unzip /tmp/chromedriver_linux64.zip -d .
  mv ./chromedriver ./Backend/chromedriver_linux
  chmod u+x ./Backend/chromedriver_linux
}
downloadchrome

./chromedriver_linux --args --profile-directory="Default" &
python Backend/clearDB.py
python3 Backend/crawl.py
kill $( pgrep -fl Backend/chromedriver | awk '{print $1}')

npm run dev