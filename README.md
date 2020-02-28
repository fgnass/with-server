# with-server (1)

[![Build Status](https://travis-ci.org/cellular/with-server.svg?branch=master)](https://travis-ci.org/cellular/with-server)

Command line utility to start/stop a local server
in order to execute end-to-end tests. Here is what it does:

- Find a free TCP port, expose it as `$PORT` for convenience
- Run `npm start` (or a custom npm script) to launch the server under test
- Scan the output for a URL (or a custom pattern)
- Expose that URL as `$SERVER_URL`
- Execute an arbitrary command (your test suite)
- Gracefully shut down the server

## Usage

`with-server [options] cmd`

### Options

- `--run` The npm script to run (defaults to `start`)
- `--grep` regular expression to look for (defaults to `https?://\\S+`)

## Example

Lets say you have the following script in your `package.json`:

```json
{
  "scripts": {
    "start": "webpack-dev-server"
  }
}
```

Then `npx with-server jest` will launch a webpack-dev-server, expose its URL as `$SERVER_URL` and invoke `jest`.

# API

```js
const withServer = require("with-server");

withServer("npm test", {
  grep: /https?:\/\/\S+/,
  run: "start"
}).then(result => {
  console.log("Exit code", result.status);
});
```

Once the run-script has finished and the server was stopped, the Promise will resolve to the [result](https://nodejs.org/docs/latest/api/child_process.html#child_process_child_process_spawnsync_command_args_options)
of the spawned child process.

# License

MIT
