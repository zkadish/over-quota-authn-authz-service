# OverQuota Authn Authz Service Server Set Up

- Create droplet with ssh access on DigitalOcean
  
- Loosely Following this tutorial to set up the server: <https://blog.nodeswat.com/set-up-a-secure-node-js-web-application-9256b8790f11>

- Set up a user with limited privileges <https://www.digitalocean.com/community/questions/how-to-enable-ssh-access-for-non-root-users>
  
- Set user bash <https://www.tecmint.com/change-a-users-default-shell-in-linux/>

- Used this post to install node and npm <https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-20-04>

- Here is a good tutorial on systemd services and node <https://www.cloudbees.com/blog/running-node-js-linux-systemd> & <https://www.shubhamdipt.com/blog/how-to-create-a-systemd-service-in-linux/>
  
- Used this post to install nginx <https://www.linuxbabe.com/ubuntu/install-nginx-latest-version-ubuntu-18-04>

## For the secure session cookie to be passed to the server the follow config settings need to be set

- nginx default.conf settings for reverse proxy

````nginx
location / {
  proxy_set_header   X-Forwarded-For $remote_addr; # required to pass secure cookie
  proxy_set_header   X-Forwarded-Proto $scheme; # required to pass secure cookie
  proxy_set_header   Host $http_host;
  proxy_pass   http://127.0.0.1:7777; # running node locally outside of docker
  # proxy_pass         http://0.0.0.0:7777; # node is running at 0.0.0.0:7777 inside of docker
}
````

- Express app settings
  
````javascript
const session = require('express-session');
const cookieParser = require('cookie-parser');
...
app.use(cookieParser()); // required to pass secure cookie
...
app.set('trust proxy', true); // required to pass secure cookie
...
app.use(cors({
  origin: ['https://domain.com', 'localhost'], // required to pass secure cookie
  credentials: true, // required to pass secure cookie
  exposedHeaders: ['set-cookie'] // required to pass secure cookie
}));
````

- Express session cookie

````javascript
cookie: {
  domain: cookieDomain, // '.viewportmedia.org' || 'localhost' // required to pass secure cookie
  secure: cookieSecure, // true || false // required to pass secure cookie
}
````

## Deploying changes to the live auth server

- <https://dev.auth.service.viewportmedia.org/>

- $ deploy/scp-devAuthService.sh

- $ ssh zsysadmin@143.198.232.218

- $ cd /var/appdata/authServiceDev/

- $ npm ci
  
## Restart the node and nginx services

- $ pm2 restart pm2.config.js --env development --attach && pm2 save

- $ pm2 restart pm2.config.js --env production --attach && pm2 save

- $ sudo systemctl restart nginx
