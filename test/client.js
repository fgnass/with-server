const http = require("http");
const assert = require("assert");

console.log("CLIENT: Started");
const baseUrl = process.env.SERVER_URL;
assert(!!baseUrl, "$SERVER_URL must be set");

async function get(path) {
  return new Promise((resolve) => {
    http.get(`${baseUrl}${path}`, (res) => {
      console.log("CLIENT: Got a response");
      resolve(res);
    });
  });
}

async function run() {
  await get("/hello1");
  await get("/hello2");
  await get("/hello3");
}

run();
