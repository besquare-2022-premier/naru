const application = require("../src/index.js");
const request = require("supertest");
describe("Minimal ExpressJS execution environment is up", () => {
  it("The server shall connect", function (done) {
    request(application).get("/").expect(200).end(done);
  });
});
