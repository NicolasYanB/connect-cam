import { Router } from "express";
import { handleCreateRoom } from "../handlers/create-room-handler.js";

const apiRouter = Router();

apiRouter.get('/create-room', handleCreateRoom);

export {apiRouter};
