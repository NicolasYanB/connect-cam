import { db } from "../database/db";

async function clean() {
    const raw = 'delete from room';
    await db.query(raw);
}

export {clean};