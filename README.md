# convrt.io

Convrt.io is an alternative chatting interface for the messenger provided by LinkedIn. Along with a well arranged design, convrt.io offers the possibility to sort your different contacts via a labeling functionality. The long-term goal is to implement an intelligent assistant, which helps the user organizing his messaging as well as his appointment scheduling.

## Prerequisites

- node.js
- express.js
- mongoDB
- python 3.x

## Running the project

### Setup

From the project folder simply run:
`npm run setup`

This will automatically erase all data from the database and crawl it freshly from your LinkedIn messenger feed.

### Running the chat

Go into your project folder and run:
`npm run dev`

You should be able to access the chat frontend on localhost:3000.
