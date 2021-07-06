const net = require("net");
const cp = require("child_process");
const portfinder = require("portfinder");

/**
 * Wait for a local tcp port to become available.
 */
function waitForPort(port, timeout = 60000) {
  const delay = 100;
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let retries = 0;
    const connect = () => {
      socket.connect({ port });
    };
    const retry = () => {
      if (++retries > timeout / delay) {
        throw new Error(
          `Timeout while waiting for port ${port} to become available.`
        );
      }
      setTimeout(connect, delay);
    };
    socket.on("error", retry);
    socket.on("connect", () => {
      socket.destroy();
      resolve();
    });
    connect();
  });
}

/**
 * Spawn `npm run <script>` and return a function to kill the process.
 */
function runScript(opts) {
  const child = cp.spawn("npm", ["run", opts.run], {
    detached: true,
  });

  if (opts.redirect !== "null") {
    const out = opts.redirect === "stdout" ? process.stdout : process.stderr;
    child.stdout.pipe(out);
    child.stderr.pipe(process.stderr);
  }

  return () => {
    return new Promise((resolve) => {
      child.once("exit", () => {
        resolve();
      });
      try {
        process.kill(-child.pid);
      } catch (err) {
        // silently ignore if kill fails
      }
    });
  };
}

/**
 * Invoke the given command and return a Promise that resolves to its exit code.
 */
function exec(cmd) {
  if (!Array.isArray(cmd)) cmd = String(cmd).split(" ");
  const [bin, ...args] = cmd;
  return new Promise((resolve) => {
    const child = cp.spawn(bin, args, {
      shell: true,
      stdio: "inherit",
    });
    child.once("exit", () => {
      resolve(child.exitCode);
    });
  });
}

module.exports = async function (cmd, opts) {
  let port = process.env.PORT;
  if (!port) {
    port = await portfinder.getPortPromise();
  }
  process.env.PORT = port;

  const stop = runScript(opts);
  await waitForPort(port);

  process.env.SERVER_URL = `http://localhost:${port}`;
  const exitCode = await exec(cmd);
  await stop();
  return exitCode;
};
