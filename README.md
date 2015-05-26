# MeThinkΩ
##Description:

Real Time Pictionary using Node.js. Uses socket.io and express to provide real time communication functionality. Multiple users will be able to join a game room and have the ability to draw on the canvas, while other players attempt to guess the depiction/word. A library of the game objects will be implemented in which users can add objects. Potential extensions to the application are that it can be used as a real time service in which users interact with each other on a communal canvas.

##Timeline:

<i>Done</i> - Have accounts working.

<i>Done</i> - Have routing for various pages. Pretty-ify!

<i>Done</i> - Have lobby on the dual-page screen that allows multiple people to connect.

<i>Chat done, need to end round.</i> - Working chat in lobby. If someone types answer in chat, end round.

5/15 - Keep track of score. When round ends, next person gets to draw.

5/18 - Have two pages on the screen that are interactable. Give word to first player (and placeholder for second player).

--Other stuff, such as upgrades to profile to keep track of stats or even images--

--Additional features with enough time--

##Installation Instructions:
Install Node.js from https://nodejs.org/.
Extract files.
Cd into node-version-<Varies for node version>
Run in virtual enviroment in the node directory
./configure
make
sudo make install

afterwards go to project folder (MeThink) and install all neccessary frameworks.
npm install express
npm install http
npm install swig
npm install path
npm install mongojs
npm install socket.io
npm install body-parser
npm install express-session

After install everything input into command line
node server.js to run our project

##Roles:

Alex Libman: Database + Websocket

David Bang: CSS + backup routing

David Dvorkin: Routing + Game Logic
