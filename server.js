const express = require('express');
const WebSocket = require('ws');
const uuid = require('node-uuid');
const PORT = 3005;

// Create a new express server
const server = express()
   // Make the express server serve static assets (html, javascript, css) from the /public folder
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on ${ PORT }`));


// Create the WebSockets server
const wss = new WebSocket.Server({ server });

// Broadcast to all.
wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

wss.on('connection', (ws) => {
  const connectedUsers = {
    action: 'USER-COUNT',
    number: wss.clients.size
  };
  wss.broadcast(JSON.stringify(connectedUsers));
  ws.on('message', function(data) {
    let mssg = JSON.parse(data);
    if (mssg.hasOwnProperty('content')) {
      mssg.action = 'CHAT';
      mssg.id = uuid.v1();
      return wss.broadcast(JSON.stringify(mssg));
    }
    ws.send(JSON.stringify(mssg));
  });

  ws.on('close', () => {
    const connectedUsers = {
      action: 'USER-COUNT',
      number: wss.clients.size
    };
    wss.broadcast(JSON.stringify(connectedUsers));
  });
});

