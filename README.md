# with-server (1)

[![Build Status](https://travis-ci.org/cellular/with-server.svg?branch=master)](https://travis-ci.org/cellular/with-server)

## Usage

`with-server [options] cmd`

Runs `npm start` and scans stdout for a given pattern. Once it is found `cmd` is executed.

If the matched text snippet contains an URL, IPv4 address or 4-digit port number the `SERVER_URL` environment variable is set accordingly.

### Options

- `--run` npm script to run (defaults to `start`)
- `--grep` regular expression to look for (defaults to `https?://\\S+`)

## Example

```json
{
  "scripts": {
    "start": "webpack-dev-server",
    "test": "with-server echo testing $SERVER_URL"
  }
}
```

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
