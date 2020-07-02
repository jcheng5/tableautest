const handler = require("serve-handler");
const http = require("http");

const port = 2468;

const opts = {
  public: "./public",
  directoryListing: false
};

const server = http.createServer(async (request, response) => {
  await handler(request, response, opts);
});
server.listen(port);
console.log(`Listening on port ${port}`);