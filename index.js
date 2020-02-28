const cp = require("child_process");
const getPort = require("get-port");

/**
 * Extracts a URL from the given string.
 **/
function getUrl(s) {
  // Look for a fully qualified URL first...
  const url = s.match(/https?:\/\/\S+/);
  if (url) return url[0];

  // if not found, look for a IPv4 address with a port number ...
  const addr = s.match(/[\d.]:\d{4,5}/);
  if (addr) return `http://${addr[0]}`;

  // or a single 4 or 5 digit port number
  const port = s.match(/\d{4,5}/);
  if (port) return `http://localhost:${port[0]}`;
}

function find(pattern) {
  return s => s.match(pattern);
}

/**
 * Read text from the given stream until test returns a truthy value.
 **/
function watchStream(stream, test) {
  return new Promise(resolve => {
    let out = "";
    function handle(buffer) {
      out += buffer;
      const match = test(out);
      if (match) {
        stream.removeListener("data", handle);
        resolve(match[0]);
      }
    }
    stream.on("data", handle);
  });
}

/**
 * Spawn `npm run <script>` and scan the output for an address/port.
 **/
async function run(opts) {
  const child = cp.spawn("npm", ["run", opts.run], { detached: true });

  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
  const match = await watchStream(child.stdout, find(opts.grep));
  return {
    match,
    stop() {
      return new Promise(resolve => {
        child.once("exit", () => {
          resolve();
        });
        process.kill(-child.pid);
      });
    }
  };
}

/**
 * Create a function that invokes the given command synchronously.
 **/
function executor(cmd) {
  if (typeof cmd == "function") return cmd;
  if (!Array.isArray(cmd)) cmd = String(cmd).split(" ");
  const [bin, ...args] = cmd;
  return url =>
    new Promise(resolve => {
      process.env.SERVER_URL = url;
      const res = cp.spawnSync(bin, args, { shell: true, stdio: "inherit" });
      resolve(res);
    });
}

module.exports = async function(cmd, opts) {
  if (!process.env.PORT) {
    // expose a free port
    process.env.PORT = await getPort({ port: [3000, 5000, 8000] });
  }

  const exec = executor(cmd);
  const { match, stop } = await run(opts);

  const url = getUrl(match);
  const res = await exec(url);
  await stop();

  return res;
};
