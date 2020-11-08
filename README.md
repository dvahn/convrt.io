# convrt.io

Convrt.io is an alternative chatting interface for the messenger provided by LinkedIn. Along with a well arranged design, convrt.io offers the possibility to sort your different contacts via a labeling functionality. The long-term goal is to implement an intelligent assistant, which helps the user organizing his messaging as well as his appointment scheduling.

## Running the project

After cloning the repo you have to change Backend/classes/crawl.config. In line 9 of the file the name of your chrome
profile should be defined. This is important for loading your personal cookies into the application.

After updating crawl.config, run:

`docker-compose build`

and

`docker-compose up`

After that, CONVRT should be available at localhost:3000.
