# SpotifySyncServer - Setup

1. Locate the auth.js file 

2. At the top of the file there are three variables that need to be set, these are found/set when you setup a developer spotify account 

3. Set the variables 

For more information on being a spotify developer:

The information needed to setup the server can be found in the developer dashboard

eg. 

const client_id = '0551b10288a641de83c34ad655185652'; // YOUR_CLIENT_ID

const client_secret = '5e7252d481554c45ee747f4367d4e227'; // YOUR_SECRET

const redirect_uri = 'http://localhost:8888/callback/'; // YOUR_REDIRECT_URI

https://developer.spotify.com/dashboard/

# SpotifySyncServer - How to use

1. run cd server

2. run node app
