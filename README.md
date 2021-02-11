# with-server (1)

[![Build Status](https://travis-ci.org/cellular/with-server.svg?branch=master)](https://travis-ci.org/cellular/with-server)

Command line utility to start/stop a local server
in order to execute end-to-end tests once the server is ready.

## How the server is started

The server is started by running an npm script from the project's package.json. By default the `start` script is used but you can specify another script using the `--run <script>` option.

## Picking a port

The server is expected to listen on the local TCP port specified by the `$PORT` environment variable. If the var isn't set, _with-server_ will pick a free random port and expose it as `$PORT`.

After starting the server _with-server_ tries to connect to `$PORT` and waits until it becomes available.

## Running the tests

Once the server is listening the given `command` is executed. Inside the tests `$PORT` or `$SERVER_URL` can be used to access the server.

When the test are finished the server is gracefully shut down and _with-server_ will exit with the test command's exit code.

## Redirecting the server output

By default the server's stdout is redirected to stderr so it doesn't get mixed up with the actual test output.

You can use the `--redirect stdout` option to write it to stdout instead or `--redirect null` to silence the output completely.

# Usage

`with-server [options] command`

### Options

- `--run` The npm script to run (defaults to `start`)
- `--redirect` Redirect the server's output to `stdout`, `stderr` or `null` (defaults to `stderr`)

## Example

Lets say you have the following script in your `package.json`:

```json
{
  "scripts": {
    "start": "react-scripts start",
    "test:e2e": "with-server cypress"
  }
}
```

Then `npm run test:e2e` will launch a server, expose its URL as `$SERVER_URL` and invoke `cypress` once the server is listening.

# API

You can also use _with-server_ programmatically:

```js
const withServer = require("with-server");

const exitCode = await withServer("cypress", {
  run: "start",
  redirect: "stdout",
});
```

# License

MIT
