# Sales Notes Framework Service Server: Nginx Reverse Proxy Node Server

The Sales Notes Framework Service Server contains CRUD micro service api for Frameworks which define the Sales Coach work flows.

## Development getting started

- $ nvm use node@>=12.20.0

### Create the docker network

- $ docker network create --driver bridge skillup-network
- See if docker network has already been created
- $ docker network ls
- See network details
- $ docker network inspect skillup-network
- To delete the network and start over
- $ docker network rm skillup-network

### Build image and run docker container

- Build the nginx reverse node proxy server image
- $ docker build -t app-server:sales-notes-app-server . --no-cache
  
- Run the image as a standalone container on localhost
- $ docker run -v ${PWD}/server:/AUTHN-AUTHZ-SERVER/server -p 8080:80 -it app-server:sales-notes-app-server bash
  
- Run the image as a container on a docker user defined network
- $ docker run -v ${PWD}/server:/AUTHN-AUTHZ-SERVER/server -p 8080:80 --network sales-notes-network -it app-server:sales-notes-app-server bash
  
- Check if nginx is running
- $ service nginx status
- Start the nginx proxy server
- $ service nginx start
- Start node server in production mode
- $ npm start
- Start node server in development mode
- $ npm run dev
- Go to "localhost:8080"
- "Express... welcome to express... Docker, nginx and node reverse proxy running..."

### Build image and run docker container with docker-compose

- Build and run mongo and mongo-express
- $ docker-compose up --build --force-recreate --remove-orphans

- Connect to the mongo db with a terminal
- docker exec -it {container} bash

- open Sales Notes AuthN AuthZ server in the browser for a quick health check
- http://localhost:7070

### To run the server in debug mode

- uncomment the `npm run debug` command in the startup-script.sh

### ToDo

- add to github
- track the users devices and verify with the user its theirs via email.
- set up 2 factor authentication via sms and Google Authenticator.
- get and verify users phone number via sms.
- change the docker container and image names in this file
- use a make file to run the project in different mode dev, debug and prod
- change the name of the docker network
