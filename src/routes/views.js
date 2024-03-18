import { Router } from "express";
import path from "path";

const viewRouter = Router();

function getPath(relativeFilePath) {
    const workdir = path.resolve();
    return path.join(workdir + relativeFilePath);
}

viewRouter.get('/', (req, res) => {
    res.sendFile(getPath('/public/index.html'));
});

viewRouter.get('/name', (req, res) => {
    res.sendFile(getPath('/public/name.html'));
});

viewRouter.get('/enter-room', (req, res) => {
    res.sendFile(getPath('/public/enter-room.html'));
});

viewRouter.get('/room/:roomId', (req, res) => {
    res.sendFile(getPath('/public/room.html'));
});

export {viewRouter};