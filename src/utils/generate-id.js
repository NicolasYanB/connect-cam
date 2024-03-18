import { v1 as uuid_v1 } from "uuid";

function generateId() {
    const uuid = uuid_v1();
    const id = uuid.split('-')[0];
    return id;
}

export {generateId};