import fs from "fs";
const stats = fs.statSync("factory.db");
console.log(stats.size);
