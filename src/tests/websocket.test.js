import {
    client as WebSocketClient,
    connection as WebSocketConnection
} from 'websocket';

import { ConnectionManager } from '../utils/connection-manager';
import { generateId } from '../utils/generate-id';

describe('Web Socket Test Suite', () => {
    let httpServer;
    let wsClient;
    let wsConnection;

    const wsUrl = 'ws://localhost:3000';

    function initWebSocketConnection(wsClient, wsUrl) {
        return new Promise((resolve, reject) => {
            wsClient.on('connect', connection => {
                connection.on('message', message => {
                    const parsed = JSON.parse(message.utf8Data);
                    const {event, payload} = parsed;
                    connection.emit(event, payload);
                });
                resolve(connection);
            });
            wsClient.on('connectFailed', errorDescription => reject(errorDescription));
            wsClient.connect(wsUrl);
        });
    }

    function sleep(time) {
        return new Promise(resolve => {
            setTimeout(resolve, time ?? 100);
        });
    };

    beforeAll( async () => {
        httpServer = (await import('../index')).server;
        wsClient = new WebSocketClient();
    });

    beforeEach(async () => {
        wsConnection = await initWebSocketConnection(wsClient, wsUrl);
    });

    afterEach(() => {
        wsConnection.close();
    });

    afterAll(async () => {
        await httpServer.close();
    });

    test('Should create a new connection', async () => {
        const roomId = 'qwertyuiop';
        const createRoomData = {
            event: 'open',
            payload: {
                roomId
            }
        };
        const message = JSON.stringify(createRoomData);
        wsConnection.sendUTF(message);
        await sleep();
        const connectionManager = ConnectionManager.getConnectionManager();
        expect(() => connectionManager.getConnection(roomId)).not.toThrow();
        const connection = connectionManager.getConnection(roomId);
        expect(connection.roomId).toBe(roomId);
        expect(connection.ownerConnection).toBeInstanceOf(WebSocketConnection);
        expect(connection.visitorConnection).toBeNull();
    });

    test('Should add a visitor connection', async () => {
        let message;
        // Creates new connection
        const roomId = generateId();
        const createRoomData = {
            event: 'open',
            payload: {
                roomId
            }
        };
        message = JSON.stringify(createRoomData);
        wsConnection.sendUTF(message);
        await sleep();

        // adds a visitor to the connection
        // create new connection
        const newWsClient = new WebSocketClient();
        const newWsConnection = await initWebSocketConnection(newWsClient, wsUrl);
        // add this connection to the connection object
        const addVisitorData = {
            event: 'join',
            payload: {
                roomId
            }
        };
        message = JSON.stringify(addVisitorData);
        newWsConnection.sendUTF(message);
        await sleep();
        const connectionManager = ConnectionManager.getConnectionManager();
        expect(() => connectionManager.getConnection(roomId)).not.toThrow();
        const connection = connectionManager.getConnection(roomId);
        expect(connection.roomId).toBe(roomId);
        expect(connection.ownerConnection).toBeInstanceOf(WebSocketConnection);
        expect(connection.visitorConnection).toBeInstanceOf(WebSocketConnection);
        newWsConnection.close();
    });

    test('Should receive reject event case the room is full', async () => {
        let message;
        // Creates new connection
        const roomId = generateId();
        const createRoomData = {
            event: 'open',
            payload: {
                roomId
            }
        };
        message = JSON.stringify(createRoomData);
        wsConnection.sendUTF(message);
        await sleep();

        const wsConnection2 = await initWebSocketConnection(new WebSocketClient(), wsUrl);
        const addVisitorData = {
            event: 'join',
            payload: {
                roomId
            }
        };
        message = JSON.stringify(addVisitorData);
        wsConnection2.sendUTF(message);
        await sleep();

        const wsConnection3 = await initWebSocketConnection(new WebSocketClient(), wsUrl);

        wsConnection3.sendUTF(message);

        await new Promise(resolve => {
            wsConnection3.on('reject', payload => {
                expect(payload).toHaveProperty('message');
                expect(payload.message).toBe('This room is already full');
                resolve();
            });
        });

        wsConnection2.close();
        wsConnection3.close();
    });

    test('Should emit receive event to visitor when an offer event is sent', async () => {
        let message;
        // Creates new connection
        const roomId = generateId();
        const createRoomData = {
            event: 'open',
            payload: {
                roomId
            }
        };
        message = JSON.stringify(createRoomData);
        wsConnection.sendUTF(message);
        await sleep();

        const visitorConnection = await initWebSocketConnection(new WebSocketClient(), wsUrl);
        const addVisitorData = {
            event: 'join',
            payload: {
                roomId
            }
        };
        message = JSON.stringify(addVisitorData);
        visitorConnection.sendUTF(message);
        await sleep();

        const offer = "{type: 'offer', sdp: 'v=0\r\no=- 4568981565076271185 2 IN IP4 127.0.0.1\r\ns…0 0\r\na=extmap-allow-mixed\r\na=msid-semantic: WMS\r\n'}";
        const createOfferData = {
            event: 'send',
            payload: {
                roomId,
                type: 'offer',
                data: offer
            }
        };
        message = JSON.stringify(createOfferData);
        wsConnection.sendUTF(message);
        await new Promise(resolve => {
            visitorConnection.on('receive', payload => {
                expect(payload).toHaveProperty('type');
                expect(payload).toHaveProperty('data');
                expect(payload.type).toBe('offer');
                expect(payload.data).toBe(offer);
                resolve();
            });
        });

        visitorConnection.close();
    });

    test('Should emit receive event to owner then an answer event is sent', async () => {
        let message;
        const roomId = generateId();
        const createRoomData = {
            event: 'open',
            payload: {
                roomId
            }
        };
        message = JSON.stringify(createRoomData);
        wsConnection.sendUTF(message);
        await sleep();

        const visitorConnection = await initWebSocketConnection(new WebSocketClient(), wsUrl);
        const addVisitorData = {
            event: 'join',
            payload: {
                roomId
            }
        };
        message = JSON.stringify(addVisitorData);
        visitorConnection.sendUTF(message);
        await sleep();


        const answer = "{type: 'answer', sdp: 'v=0\r\no=- 2634640323328634448 2 IN IP4 127.0.0.1\r\ns…0 0\r\na=extmap-allow-mixed\r\na=msid-semantic: WMS\r\n'}";
        const createAnwswerData = {
            event: 'send',
            payload: {
                roomId,
                type: 'answer',
                data: answer
            }
        };
        message = JSON.stringify(createAnwswerData);
        visitorConnection.sendUTF(message);
        await new Promise(resolve => {
            wsConnection.on('receive', payload => {
                expect(payload).toHaveProperty('type');
                expect(payload).toHaveProperty('data');
                expect(payload.type).toBe('answer');
                expect(payload.data).toBe(answer);
                resolve();
            });
        });

        visitorConnection.close();
    });
});