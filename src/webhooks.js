/**
 * Github webhooks related endpoints
 */
const express = require("express");
const { secret, projects } = require("./config");
const crypto = require("crypto");
const { executeDeployment, loadJson } = require("./deploy");
const createLogger = require("./logger");
const app = express.Router();
let logger;
createLogger("Webhooks").then((y) => (logger = y));
app.use(express.raw({ type: "application/json" }));
app.post("/", async function (req, res, next) {
  const sig = req.get("x-hub-signature-256");
  const event = req.get("x-github-event");
  if (!sig) {
    logger?.("Dropped a request as the signature is missing");
    res.status(400).end("No signature");
    return;
  }
  const expected =
    "sha256=" +
    crypto.createHmac("sha256", secret).update(req.body).digest("hex");
  let loops = Math.min(expected.length, sig.length);
  let isValidInv = 0;
  for (let i = 0; i < loops; i++) {
    isValidInv |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  if (isValidInv) {
    logger?.("Dropped a request as the signature is invalid");
    res.status(400).end("Invalid signature");
    return;
  }
  try {
    const body = JSON.parse(req.body.toString());
    const fullname = body.repository.full_name;
    const project = projects.find((z) => z.name === fullname);
    if (!project) {
      logger?.("Dropped a request as the request is not for the repos");
      res.status(200).end("Not for us, bye2");
      return;
    }
    //set the event
    project.event = project.event ?? "push";
    if (event !== (project.event ?? "push")) {
      res.status(200).end("Not expected event bye2");
      return;
    }
    switch (event) {
      case "push":
        {
          if (body.ref !== "/refs/heads/master") {
            logger?.("Dropped a request as the request is not for the master");
            res.status(200).end("Not for master, bye2");
            return;
          }
        }
        break;
      case "workflow_run": {
        if (
          body.action !== "completed" ||
          body.workflow_run.conclusion !== "success"
        ) {
          logger?.("Dropped a request as the request from the successfull CI");
          res.status(200).end("Not a successful run. Bye2");
          return;
        }
        if (body.head_branch !== "master") {
          logger?.("Dropped a request as the request is not for the master");
          res.status(200).end("Not for master, bye2");
          return;
        }
      }
      default:
        res.status(500).end("Unsupported event");
        return;
    }
    logger?.(`Deploy started for ${fullname}`);
    //run
    executeDeployment(await loadJson(project.path), project.path);
  } catch (e) {
    next(e);
  }
});
app.use(function (err, req, res, next) {
  console.log(err);
  if (res.headersSent) {
    next();
    return;
  }
  res.status(500).end();
});

module.exports = app;
