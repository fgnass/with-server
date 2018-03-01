const cp = require('child_process');

function getUrl(s) {
  const url = s.match(/https?:\/\/\S+/);
  if (url) return url[0];

  const addr = s.match(/[\d.]:\d{4}/);
  if (addr) return `http://${addr[0]}`;

  const port = s.match(/\d{4}/);
  if (port) return `http://localhost:${port[0]}`;
}

function find(pattern) {
  return s => s.match(pattern);
}

function watchStream(stream, test) {
  return new Promise(resolve => {
    let out = '';
    function handle(buffer) {
      out += buffer;
      const match = test(out);
      if (match) {
        stream.removeListener('data', handle);
        resolve(match[0]);
      }
    }
    stream.on('data', handle);
  });
}

function run(opts) {
  const child = cp.spawn('npm', ['run', opts.run], { detached: true });

  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
  return watchStream(child.stdout, find(opts.grep)).then(match => {
    return {
      match,
      stop() {
        return new Promise(resolve => {
          child.once('exit', () => {
            resolve();
          });
          process.kill(-child.pid);
        });
      },
    };
  });  
};

function executor(cmd) {
  if (typeof cmd == 'function') return cmd;
  if (!Array.isArray(cmd)) cms = String(cmd).split(' ');
  const [bin, ...args] = cmd;
  return url => new Promise(resolve => {
    process.env.SERVER_URL = url;
    const res = cp.spawnSync(bin, args, { shell: true, stdio: 'inherit' });
    resolve(res);
  });
}

module.exports = function(cmd, opts) {
  const fn = executor(cmd);
  return run(opts).then(({ match, stop }) => {
    const url = getUrl(match);
    const res = Promise.resolve(fn(url));
    return stop().then(() => res);
  })
}
