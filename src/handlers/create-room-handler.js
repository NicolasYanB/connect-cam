import { createRoom } from "../actions/create-room.js";

async function handleCreateRoom(req, res) {
    const {ownerName} = req.query;
    try {
        const id = await createRoom(ownerName);
        res.status(200).send({id});
    } catch (e) {
        console.log(e.message);
        res.sendStatus(500);
    }
}

export {handleCreateRoom};