import Database from "better-sqlite3";
const db = new Database("factory.db");
const info = db.prepare("PRAGMA table_info(layouts)").all();
console.log(JSON.stringify(info, null, 2));
