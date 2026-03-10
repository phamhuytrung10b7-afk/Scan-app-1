import Database from "better-sqlite3";
const db = new Database("factory.db");
const layouts = db.prepare("SELECT name, layout FROM layouts").all();
console.log(JSON.stringify(layouts, null, 2));
