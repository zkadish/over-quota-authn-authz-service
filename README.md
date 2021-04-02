# Authn Authz server boilerplate

## development

- $ nvm use 12.20.0
- $ npm ci
- $ npm run dev
- $ npm start

## Authentication and Authorization architecture

- Server side session cookie maintains a session which lasts for 36 hours and gets refreshed when a user switches routes. After 36 hours of inactivity the user will be logged out and they will have to log back in. The session cookie is checked and then refreshed on every route change.
  
- Encrypted passwords are never passed to the client and user are requested to create a strong password. Emails are used as usernames and are used to identify users.

- All saved emails addresses will eventually have to be verified for authentication.

- Once a user authenticates an access token and a refresh token are generated for the authenticated user.
  
- Refresh token are stored on the server and are never sent to the client and are last for 24 hours??? 12 maybe??? Should be long enough to work all day. Once a Refresh token expires, the user will be assigned a new one if they are still authenticated.

- An access token is generated and passed to the client for api authentication, An access token will expire after one hour??? 15 minutes maybe??? Once an access token expires. If the user is logged in and has a valid refresh token they can get a new access token.

- Once a user signs out or their session expires their session cookie, refresh token and access token are all destroyed and will be recreated when the user signs back in and is Authenticated.

### ToDo

- add to github
- track the users devices and verify with the user its theirs via email.
- set up 2 factor authentication via sms and Google Authenticator.
- get and verify users phone number via sms.
  