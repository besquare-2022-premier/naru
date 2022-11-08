/**
 * deployment logger
 */
const fs = require("fs").promises;

/**
 * Create a logger using a tag
 * @param {string} tag
 */
async function createLogger(tag = "UNKNOWN") {
  //establish the file name
  const filename = `${process.cwd()}/deployment_logs/${tag}-${new Date().toISOString()}.log`;
  await fs.appendFile(
    filename,
    `=========LOGGING STARTED FOR ${tag} ON ${new Date().toString()}========\n`
  );
  return async function (message, tag = "INFO") {
    await fs.appendFile(
      filename,
      `${new Date().toString()}\t${tag}\t${message}\n`
    );
  };
}

module.exports = createLogger;
