# convrt.io

## Prerequisites

- node.js
- express.js
- mongoDB
- python 3.x

## Running the project

### Crawling messages from LinkedIn

Go into project folder. Then:
`cd Backend`

Execute crawling script:
`python3 crawl.py`

Wait for the script to finish. When having no errors your MongoDB should now hold collections of all your LinkedIn message feeds.

### Running the chat

Go into your project folder and run:
`npm run dev`

You should be able to access the chat frontend on localhost:3000.
