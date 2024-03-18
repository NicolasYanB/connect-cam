import express from "express";
import path from "path";

import { viewRouter } from "./routes/views.js";


const port = 3000;
const app = express();

app.use(express.static(path.join(path.resolve() + '/public')));
app.use(express.static(path.join(path.resolve() + '/public/styles')));
app.use(express.static(path.join(path.resolve() + '/public/scripts')));
app.use(express.static(path.join(path.resolve() + '/public/images')));

app.use(viewRouter);

app.listen(port, () => {
    console.clear();
    console.log(`app running on port ${port}`);
});