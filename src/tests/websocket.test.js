import {client as WebSocketClient, connection as WebSocketConnection} from 'websocket';
import { ConnectionManager } from '../utils/connection-manager';

describe('Web Socket Test Suite', () => {
    let httpServer;
    let wsClient;
    let wsConnection;

    const wsUrl = 'ws://localhost:3000';

    function initWebSocketConnection(wsClient, wsUrl) {
        return new Promise((resolve, reject) => {
            wsClient.on('connect', connection => resolve(connection));
            wsClient.on('connectFailed', errorDescription => reject(errorDescription));
            wsClient.connect(wsUrl);
        });
    }

    function sleep(time) {
        return new Promise(resolve => {
            setTimeout(resolve, time);
        });
    };

    beforeAll( async () => {
        httpServer = (await import('../index')).server;
        wsClient = new WebSocketClient();
    });

    beforeEach(async () => {
        wsConnection = await initWebSocketConnection(wsClient, wsUrl);
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
        await sleep(1000);
        const connectionManager = ConnectionManager.getConnectionManager();
        expect(() => connectionManager.getConnection(roomId)).not.toThrow();
        const connection = connectionManager.getConnection(roomId);
        expect(connection.roomId).toBe(roomId);
        expect(connection.ownerConnection).toBeInstanceOf(WebSocketConnection);
        expect(connection.visitorConnection).toBeNull();
    });

    afterEach(() => {
        wsConnection.close();
    });

    afterAll(async () => {
        await httpServer.close();
    });
});