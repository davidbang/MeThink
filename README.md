# MeThink

##Description:
**Hosted on http://104.236.41.235/**

A real time pictionary game made with Node.js and Socket.io to provide real time communication functionality, with Express used as the web framework. Multiple users are able to join a game room and have the ability to draw on the canvas when it is their turn, while other players attempt to guess the depiction/word combination. Each player gains a point when they win the round. The players with the most points are declared the winners after two rounds of gameplay. 

##Installation Instructions:
1. Install Node.js from https://nodejs.org/ on your server
2. Install MongoDB on your server
3. Clone MeThink onto your server
4. Run `npm install express` to install all the dependencies
5. Change the IP addresses that io connects to in lobby.js and client.js from 127.0.0.1:5000 to your server's IP address
6. Configure your server to deploy server.js: [An example tutorial](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-14-04)

##Improvements To-do:
* Refactor code
* Create profiles and display user statistics on them
* Add different color and brush options for the canvas
* Move game notifications out of chat into popups
* Fix CSS and JavaScript bugs
* Add further restrictions on register fields
* Allow games to be password-ed
* Place a chat that allows for private chat onto the lobby page
* Improve styling

##Roles:

Alex Libman: Database + Websocket + Game Logic

David Bang: CSS + backup routing

David Dvorkin: Routing + Game Logic
