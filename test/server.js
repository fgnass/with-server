const http = require("http");

console.log("SERVER: Started");

const requestListener = function (req, res) {
  console.log("SERVER:", req.url, "requested");
  res.writeHead(200);
  setTimeout(() => res.end("Hello, World!"), 100);
};

const server = http.createServer(requestListener);
server.listen(process.env.PORT, () => {
  console.log("Server listening on port", server.address().port);
});
