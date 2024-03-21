import 'dotenv/config';

import http from 'node:http';
import path from "path";

import {server as WebSocketServer} from 'websocket';
import express from "express";

import { viewRouter } from "./routes/views.js";
import { apiRouter } from "./routes/api.js";
import { ConnectionManager } from './utils/connection-manager.js';


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
    console.log('connection made');

    connection.on('message', function (message) {
        const parsed = JSON.parse(message.utf8Data);
        const {event, payload} = parsed;
        this.emit(event, payload);
    });

    connection.on('open', function (payload) {
        const {roomId} = payload;
        connectionManager.createConnection(roomId, this);
    });
});

export {server};