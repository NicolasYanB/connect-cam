import express from "express";

const port = 3000;
const app = express();

app.listen(port, () => {
    console.clear();
    console.log(`app running on port ${port}`);
});