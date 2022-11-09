/**
 * Deployment related code here
 */

const child_process = require("child_process");
const { existsSync } = require("fs");
const createLogger = require("./logger");
const fs = require("fs").promises;

/**
 * load the naru configuration for the project
 * @param {string} projectBase
 */
async function loadJson(projectBase) {
  const config = await fs
    .readFile(`${projectBase}/package.json`, { encoding: "utf8" })
    .then((z) => JSON.parse(z));
  if (!config.naru) {
    throw new Error("Cannot load naru configuration from the package.json");
  }
  return config.naru;
}

/**
 * exec but in promise
 * @param {*} cmd
 * @returns {Promise<{err?:Error:stdout:string,stderr:string}>}
 */
function execPromisified(cmd, options) {
  return new Promise((r) =>
    child_process.exec(cmd, options, function (err, stdout, stderr) {
      r({ err, stdout, stderr });
    })
  );
}

async function executeDeployment(config, base) {
  console.log(config);
  if (!config || !config.deploy) {
    throw new Error("Missing command to run for the deployment");
  }
  const pwd = process.cwd();
  const log = await createLogger(config.tag ?? "UNKNOWN");
  //change into the deployment
  process.chdir(base ?? "./");
  //run git pull if the dir refers to a git directory
  if (existsSync("./.git")) {
    await log("Executing the git pull");
    let result = await execPromisified("git pull");
    if (result.err) {
      await log("git pull failed!!!", "ERROR");
    }
    if (result.stderr) {
      for (const g of result.stderr.split("\n")) {
        await log(g, "ERROR");
      }
    }
    for (const g of result.stdout.split("\n")) {
      await log(g);
    }
    process.chdir(pwd);
    return;
  }
  //run the command
  await log("Executing the deployment command");
  let result = await execPromisified(config.deploy);
  if (result.err) {
    await log(`DEPLOYMENT FAILED WITH CODE ${result.err.code}`, "ERROR");
  }
  if (result.stderr) {
    for (const g of result.stderr.split("\n")) {
      await log(g, "ERROR");
    }
  }
  for (const g of result.stdout.split("\n")) {
    await log(g);
  }
  process.chdir(pwd);
}

module.exports = { loadJson, executeDeployment, execPromisified };
