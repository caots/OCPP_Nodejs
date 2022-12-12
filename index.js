const express = require('express');
const path = require('path');
const WebSocket = require('ws');
const requestHandler = require('./center-system/requestHandler');

const app = express();
app.use(express.static(path.join(__dirname, 'app')));
app.listen(2022, () => {
  console.log('OCPP 1.6 client');
});

// server for ws connections from browser
// one port for all connections
const server = app.listen(5001);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log(`CP connected`);
  ws.on('error', (error) => console.log(error));
  ws.on('message', (rawData) => {
    const msgFromUI = JSON.parse(rawData);
    // pass requests from UI to the handler
    requestHandler(msgFromUI, ws);
  });
});
