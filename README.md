# convrt.io

Convrt.io is an alternative chatting interface for the messenger provided by LinkedIn. Along with a well arranged design, convrt.io offers the possibility to sort your different contacts via a labeling functionality. Getting and sending messages via LinkedIn is realized with the refreshing button on the top right, which calls a python script that scrapes the data from LinkedIn, using the Selenium framework. The long-term goal is to implement an intelligent assistant, which helps the user organizing his messaging as well as his appointment scheduling. 

The application is currently running inside several docker containers which are ready to be deployed on an AWS EC2 cloud instance. 

## Running the project

You can either run the project locally, locally with Docker or deploy it to a cloud provider, such as AWS.
Local deployment is recommended for bugfixing and testing issues, while delivering to the cloud is good for providing the program to others. 

### Local deployment

- Install npm on your system
- Clone the repository
- cd into the project folder
- run `npm run dev` to launch the API
- cd into the "client" folder
- run `npm run serve` to launch the Vue.js frontend
- to build, run `npm run build` which will create a "dist" folder
- install "serve" by running `npm i -g serve`
- deploy with `serve -s dist`

### Local Docker deployment

- Install and launch Docker on your system 
- Clone the project, start a terminal session and 'cd' into the project folder
- Switch to branch 'experimental'
- Run `make run`, which takes a few seconds to build the project
- As soon as the setup has finished, visit http://localhost:5000 to access the applications frontend

### Cloud deployment

- Sign up for a free cloud provider (AWS, Google...)
- Create a cloud instance, e.g. an AWS free tier which provides a 1GB storage Linux instance
- Expose ports 5000 and 3000 for frontend and api access
- create a .pem key-file for authorization
- Use SSH to start a terminal session inside your cloud instance. For AWS, run: ```ssh -i <path/to/your/key.pem> ec2-user@<instances-public-DNS>``` 
- Once in your cloud instance, you have to install Git, Docker and Docker-Compose 
```sudo yum update -y 
sudo yum install git -y
sudo amazon-linux-extras install docker
sudo usermod -a -G docker ec2-user
sudo curl -L "https://github.com/docker/compose/releases/download/1.28.4/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```
- Clone repository `git clone https://github.com/dvahn/convrt.io.git`
- Close terminal session and log back in to adopt all changes
- Open another terminal, ssh to instance and run `sudo dockerd` to start a docker daemon
- Head back to your first terminal session, cd into project folder and run `make run`
- After the setup, you can access the convrt application on instances-public-DNS:5000

## Debugging

As mentioned before it is highly recommended to develop new features using on of the local deployment methods, because you can see the impact of your changes straightaway. When deploying to the cloud, there should only be minor bugs left, as building and deploying each time you make a change is not that efficient.
The most error-prone part of the application is scraping the data from LinkedIn. The elements read are specified as xpaths, which change every few days and thus lead to errors and disfunctionality of the program. To better see what exactly goes wrong in such a case, the VNC Viewer is recommended. Depending on the type of deployment, you can connect to either `localhost:9001` or `instances-public-IP:9001` and see live how the scraper acts and where exactly it screws up.


