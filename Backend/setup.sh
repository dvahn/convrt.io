#!/bin/bash
Backend/chromedriver --args --profile-directory="Default" &
python Backend/clearDB.py
python3 Backend/crawl.py
kill $( pgrep -fl Backend/chromedriver | awk '{print $1}')