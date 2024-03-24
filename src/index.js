import 'dotenv/config';

import http from 'node:http';
import path from "path";

import {server as WebSocketServer} from 'websocket';
import express from "express";

import { ConnectionManager } from './utils/connection-manager.js';
import { ConnectionError } from './errors/connection-error.js';
import { viewRouter } from "./routes/views.js";
import { apiRouter } from "./routes/api.js";


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

    connection.on('open', function (payload) {
        const {roomId} = payload;
        connectionManager.createConnection(roomId, this);
    });

    connection.on('join', function (payload) {
        const {roomId} = payload;
        try {
            connectionManager.addVisitorToConnection(roomId, this);
        } catch(e) {
            if (e instanceof ConnectionError) {
                const response = {
                    event: 'reject',
                    payload: {
                        message: 'This room is already full'
                    }
                };
                connection.sendUTF(JSON.stringify(response));
            }
        }
    });

    connection.on('send', function (payload) {
        const {roomId, type, data} = payload;
        const conn = connectionManager.getConnection(roomId);
        let peerConection;
        if (type === 'offer') {
            peerConection = conn.visitorConnection;
        } else if (type === 'answer') {
            peerConection = conn.ownerConnection;
        } else {
            throw new Error('type field is not valid');
        }

        const response = {
            event: 'receive',
            payload: {type, data}
        };

        peerConection.sendUTF(JSON.stringify(response));
    });

    connection.on('candidate', function (payload) {
        const {roomId, client, candidate} = payload;
        const conn = connectionManager.getConnection(roomId);
        let peerConection;
        if (client === 'owner') {
            peerConection = conn.visitorConnection;
        } else if (client === 'visitor') {
            peerConection = conn.ownerConnection;
        } else {
            throw new Error('client field is not valid');
        }

        const response = {
            event: 'new-candidate',
            payload: {candidate}
        };

        peerConection.sendUTF(JSON.stringify(response));
    });
});

export {server};