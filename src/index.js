import 'dotenv/config';

import http from 'node:http';
import path from "path";

import express from "express";

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

server.listen(port, () => {
    console.clear();
    console.log(`app running on port ${port}`);
});

export {server};