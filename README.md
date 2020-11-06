# convrt.io

Convrt.io is an alternative chatting interface for the messenger provided by LinkedIn. Along with a well arranged design, convrt.io offers the possibility to sort your different contacts via a labeling functionality. The long-term goal is to implement an intelligent assistant, which helps the user organizing his messaging as well as his appointment scheduling.

## Running the project

After cloning the repo, insert the path of your Chrome-profile-folder (e.g. /Users/[USERNAME]/Library/Application Support/Google/Chrome/Default) into the docker-compose.yml at services/chrome/volumes.
Then run:

`docker-compose build`

and

`docker-compose up`

After that, CONVRT should be available at localhost:3000.
