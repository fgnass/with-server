#!/usr/bin/env node

const parseArgs = require('minimist');
const withServer = require('..');

const argv = parseArgs(process.argv.slice(2), {
  string: ['run', 'grep'],
  default: {
    run: 'start',
    grep: 'https?://\\S+',
  },
});

withServer(argv._, argv).then(res => {
  process.exitCode = res.status;
});
