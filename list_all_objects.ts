import Database from "better-sqlite3";
const db = new Database("factory.db");
const objects = db.prepare("SELECT * FROM sqlite_master").all();
console.log(JSON.stringify(objects, null, 2));
