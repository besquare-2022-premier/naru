/**
 * Naru configuration reader
 */
const config = require("../.naru.config.json");
const fs = require("fs");
for (const entry of config.projects) {
  if (!fs.existsSync(entry.path)) {
    throw new Error(`The project at ${entry.path} is not exists`);
  } else {
    console.log(`${entry.name}:${entry.path}`);
  }
}
module.exports = config;
