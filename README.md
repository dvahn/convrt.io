# convrt.io

Convrt.io is an alternative chatting interface for the messenger provided by LinkedIn. Along with a well arranged design, convrt.io offers the possibility to sort your different contacts via a labeling functionality. The long-term goal is to implement an intelligent assistant, which helps the user organizing his messaging as well as his appointment scheduling.

## Prerequisities

You need to have docker installed on your system.

## Running the project

Simply run:

`make run`

After running through the setup CONVRT should be available at localhost:3000. Enter your LinkedIn Credentials and wait for convrt
to transfer your conversations. This can take up to a few minutes, depending on how many conversations you have.

The application will be updating and inserting your messages back to LinkedIn every 5 minutes.
