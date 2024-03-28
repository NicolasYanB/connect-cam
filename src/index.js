import http from 'node:http';
import path from "path";

import {server as WebSocketServer} from 'websocket';
import express from "express";

import { ConnectionManager } from './utils/connection-manager.js';
import { viewRouter } from "./routes/views.js";
import { apiRouter } from "./routes/api.js";
import { disconnectVisitor, endRoom, join, open, sendSdp, sendIceCandidate } from './events/index.js';


const port = 3000;
const app = express();

app.use(express.static(path.join(path.resolve() + '/public')));
app.use(express.static(path.join(path.resolve() + '/public/styles')));
app.use(express.static(path.join(path.resolve() + '/public/scripts')));
app.use(express.static(path.join(path.resolve() + '/public/images')));

app.use(viewRouter);
app.use('/api', apiRouter);

const server = http.createServer(app);

server.listen(port, function () {
    console.clear();
    console.log(`app running on port ${port}`);
});

const connectionManager = ConnectionManager.getConnectionManager();
const wsServer = new WebSocketServer({
    httpServer: server
});

wsServer.on('request', (request) => {
    const connection = request.accept(null, request.origin);

    connection.on('message', function (message) {
        const parsed = JSON.parse(message.utf8Data);
        const {event, payload} = parsed;
        this.emit(event, payload);
    });

    connection.on('open', (payload) => open(payload, connection));

    connection.on('join', (payload) => join(payload, connection));

    connection.on('send', sendSdp);

    connection.on('candidate', sendIceCandidate);

    connection.on('end', endRoom);

    connection.on('disconnect', disconnectVisitor);
});

export {server};