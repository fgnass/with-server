#!/usr/bin/env node

const parseArgs = require("minimist");
const withServer = require("..");

const argv = parseArgs(process.argv.slice(2), {
  string: ["run", "redirect"],
  default: {
    run: "start",
  },
});

withServer(argv._, argv).then((code) => {
  process.exitCode = code;
});
