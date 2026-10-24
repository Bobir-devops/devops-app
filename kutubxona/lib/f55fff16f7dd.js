/* docker-lab.js — Docker mashq muhiti: soxta docker CLI + vazifa tekshiruvi.
   <div data-dlab="ID"></div> ... window.DockerLab.mountAll() */
(function () {
  const CY = 'oklch(calc(var(--lk) * 0.48 + var(--lb)) 0.11 68)', YE = 'oklch(calc(var(--lk) * 0.52 + var(--lb)) 0.077 40)', GR = 'oklch(calc(var(--lk) * 0.42 + var(--lb)) 0.15 150)';
  const INK = 'var(--ink)', SUB = 'rgb(var(--ink-rgb) / 0.86)';
  const SG = "Lora,ui-sans-serif,sans-serif", MO = "'IBM Plex Mono',monospace", NR = 'Lora,Georgia,serif';
  const el = (t, css, txt) => { const d = document.createElement(t); if (css) d.style.cssText = css; if (txt != null) d.textContent = txt; return d; };
  const btn = (label, kind) => {
    const map = { gr: ['oklch(calc(var(--lk) * 0.5 + var(--lb)) 0.15 150 / 0.07)', 'oklch(calc(var(--lk) * 0.5 + var(--lb)) 0.15 150 / 0.45)', 'oklch(calc(var(--lk) * 0.52 + var(--lb)) 0.13 150)'], gh: ['transparent', 'rgb(var(--ink-rgb) / 0.22)', 'rgb(var(--ink-rgb) / 0.88)'] };
    const [bg, bd, col] = map[kind] || map.gh;
    const b = el('button', `background:${bg};border:1px solid ${bd};color:${col};font:500 12.5px ${SG};letter-spacing:.04em;padding:8px 14px;cursor:pointer`, label);
    b.type = 'button'; return b;
  };
  const pad = (s, n) => String(s) + ' '.repeat(Math.max(1, n - String(s).length));
  const sid = () => Math.random().toString(16).slice(2, 14);

  function run(bx, raw) {
    const cmd = raw.trim().replace(/\s+/g, ' ');
    if (!cmd) return '';
    const a = cmd.split(' ');
    const has = (f) => a.indexOf(f) >= 0;
    const argOf = (f) => { const i = a.indexOf(f); return i >= 0 ? a[i + 1] : null; };
    const find = (ref) => bx.containers.find((x) => x.name === ref || x.id.indexOf(ref) === 0);

    if (a[0] === 'help' || a[0] === '--help') {
      return 'Mashqda ishlaydigan buyruqlar:\n'
        + '  docker ps [-a] · docker images · docker logs [-f|--tail N] <c>\n'
        + '  docker inspect <c> · docker top <c> · docker stats\n'
        + '  docker run [-d] [-p H:C] [-e K=V] [-v vol:/path] [-m 512m] [--name N] [--restart P] <image> [cmd]\n'
        + '  docker start|stop|kill|restart|rm <c> · docker rmi <image>\n'
        + '  docker exec -it <c> <cmd>   (ichida: ss -lntup · curl · env · ps aux · cat)\n'
        + '  docker build -t <nom> . · docker volume ls|create|inspect\n'
        + '  docker network ls|inspect <net> · docker system df\n'
        + '  docker compose up [-d] · docker compose ps · docker compose down';
    }
    if (a[0] !== 'docker') return 'bash: ' + a[0] + ": command not found — 'help' deb ko'ring";

    const sub = a[1];

    if (sub === 'ps') {
      const list = has('-a') ? bx.containers : bx.containers.filter((x) => x.state === 'running');
      if (!list.length) return pad('CONTAINER ID', 14) + pad('IMAGE', 20) + pad('STATUS', 26) + pad('PORTS', 22) + 'NAMES';
      return pad('CONTAINER ID', 14) + pad('IMAGE', 20) + pad('STATUS', 26) + pad('PORTS', 22) + 'NAMES\n'
        + list.map((x) => pad(x.id.slice(0, 12), 14) + pad(x.image, 20)
          + pad(x.state === 'running' ? 'Up 2 minutes' + (x.health ? ' (' + x.health + ')' : '') : 'Exited (' + x.exit + ') 1 minute ago', 26)
          + pad(x.ports || '', 22) + x.name).join('\n');
    }
    if (sub === 'images') {
      return pad('REPOSITORY', 24) + pad('TAG', 12) + pad('IMAGE ID', 14) + 'SIZE\n'
        + bx.images.map((i) => pad(i.repo, 24) + pad(i.tag, 12) + pad(i.id, 14) + i.size).join('\n');
    }
    if (sub === 'logs') {
      const ref = a[a.length - 1];
      const ct = find(ref);
      if (!ct) return 'Error: No such container: ' + ref;
      let lines = ct.logs || [];
      const tail = argOf('--tail');
      if (tail) lines = lines.slice(-(+tail || 10));
      return lines.length ? lines.join('\n') : '';
    }
    if (sub === 'inspect') {
      const ct = find(a[a.length - 1]);
      if (!ct) return 'Error: No such object: ' + a[a.length - 1];
      return JSON.stringify([{
        Id: ct.id, Name: '/' + ct.name,
        State: { Status: ct.state, ExitCode: ct.state === 'running' ? 0 : ct.exit, OOMKilled: !!ct.oom, Restarting: false },
        Config: { Image: ct.image, Cmd: ct.cmd || null, Entrypoint: ct.entrypoint || null, Env: ct.env || [], ExposedPorts: ct.exposed || {} },
        HostConfig: { RestartPolicy: { Name: ct.restart || 'no' }, Memory: ct.mem || 0, PortBindings: ct.portBindings || {} },
        Mounts: ct.mounts || [],
        NetworkSettings: { Networks: (ct.networks || ['bridge']).reduce((o, n) => { o[n] = { IPAddress: ct.ip || '172.17.0.2' }; return o; }, {}) },
      }], null, 2);
    }
    if (sub === 'top') {
      const ct = find(a[2]);
      if (!ct) return 'Error: No such container: ' + a[2];
      if (ct.state !== 'running') return 'Error response from daemon: container ' + ct.name + ' is not running';
      return pad('UID', 8) + pad('PID', 8) + pad('PPID', 8) + 'CMD\n' + (ct.procs || [{ pid: 1, ppid: 0, cmd: (ct.cmd || ['app']).join(' ') }]).map((p) => pad(p.user || 'root', 8) + pad(p.pid, 8) + pad(p.ppid, 8) + p.cmd).join('\n');
    }
    if (sub === 'stats') {
      const list = bx.containers.filter((x) => x.state === 'running');
      return pad('NAME', 16) + pad('CPU %', 9) + pad('MEM USAGE / LIMIT', 22) + pad('MEM %', 9) + 'NET I/O\n'
        + list.map((x) => pad(x.name, 16) + pad((x.cpu || 1.2).toFixed(2) + '%', 9) + pad((x.memUse || '120MiB') + ' / ' + (x.memLimit || '512MiB'), 22) + pad((x.memPct || 23).toFixed(1) + '%', 9) + '1.2MB / 800kB').join('\n');
    }
    if (sub === 'run') {
      const flags = a.slice(2);
      let i = 0, opts = { ports: '', env: [], mounts: [], networks: ['bridge'] };
      while (i < flags.length) {
        const f = flags[i];
        if (f === '-d' || f === '--detach') { opts.detach = true; i++; continue; }
        if (f === '-it' || f === '-i' || f === '-t') { i++; continue; }
        if (f === '--rm') { opts.rm = true; i++; continue; }
        if (f === '-p' || f === '--publish') { opts.publish = flags[i + 1]; i += 2; continue; }
        if (f === '-e' || f === '--env') { opts.env.push(flags[i + 1]); i += 2; continue; }
        if (f === '-v' || f === '--volume') { opts.mounts.push(flags[i + 1]); i += 2; continue; }
        if (f === '-m' || f === '--memory') { opts.memLimit = flags[i + 1]; i += 2; continue; }
        if (f === '--name') { opts.name = flags[i + 1]; i += 2; continue; }
        if (f === '--restart') { opts.restart = flags[i + 1]; i += 2; continue; }
        if (f === '--network') { opts.networks = [flags[i + 1]]; i += 2; continue; }
        if (f === '--entrypoint') { opts.entrypoint = [flags[i + 1]]; i += 2; continue; }
        break;
      }
      const image = flags[i];
      if (!image) return 'docker: "run" requires at least 1 argument.';
      const img = bx.images.find((x) => x.repo === image.split(':')[0] || (x.repo + ':' + x.tag) === image);
      if (!img) return 'Unable to find image \'' + image + '\' locally\ndocker: Error response from daemon: pull access denied.';
      const userCmd = flags.slice(i + 1);
      const ct = {
        id: sid(), name: opts.name || (img.repo.split('/').pop() + '-' + sid().slice(0, 4)),
        image: image, state: 'running', exit: 0,
        cmd: userCmd.length ? userCmd : (img.cmd || ['sh']),
        entrypoint: opts.entrypoint || img.entrypoint || null,
        env: opts.env, restart: opts.restart || 'no', memLimit: opts.memLimit,
        networks: opts.networks, ip: '172.17.0.' + (2 + bx.containers.length),
        bind: img.bind || '0.0.0.0', appPort: img.port || null,
        logs: (img.logs || []).slice(), procs: img.procs || null, files: Object.assign({}, img.files || {}),
      };
      if (opts.publish) { ct.ports = opts.publish.indexOf(':') > 0 ? opts.publish + '/tcp' : opts.publish; ct.portBindings = { [opts.publish.split(':')[1] + '/tcp']: [{ HostPort: opts.publish.split(':')[0] }] }; }
      if (opts.mounts.length) ct.mounts = opts.mounts.map((m) => { const [src, dst] = m.split(':'); if (src.indexOf('/') === 0) return { Type: 'bind', Source: src, Destination: dst }; if (!bx.volumes.find((v) => v.name === src)) bx.volumes.push({ name: src }); return { Type: 'volume', Name: src, Destination: dst }; });
      const effective = (ct.entrypoint || []).concat(ct.cmd);
      if (img.exitsImmediately || /^(echo|ls|true|cat)\b/.test(effective.join(' '))) {
        ct.state = 'exited'; ct.exit = 0;
        if (effective[0] === 'echo') ct.logs.push(effective.slice(1).join(' '));
      }
      if (img.needsEnv && !opts.env.some((e) => e.indexOf(img.needsEnv + '=') === 0)) {
        ct.state = 'exited'; ct.exit = 1;
        ct.logs.push('FATAL: environment variable ' + img.needsEnv + ' is not set');
      }
      bx.containers.push(ct);
      bx.ran = (bx.ran || []).concat([{ image: image, opts: opts, cmd: userCmd }]);
      if (opts.rm && ct.state === 'exited') bx.containers = bx.containers.filter((x) => x !== ct);
      return opts.detach ? ct.id : (ct.logs.join('\n') || ct.id.slice(0, 12));
    }
    if (sub === 'start' || sub === 'stop' || sub === 'kill' || sub === 'restart' || sub === 'rm') {
      const ref = a[a.length - 1];
      const ct = find(ref);
      if (!ct) return 'Error response from daemon: No such container: ' + ref;
      if (sub === 'start') { ct.state = 'running'; }
      if (sub === 'stop') { ct.state = 'exited'; ct.exit = 143; ct.stopped = true; bx.signals = (bx.signals || []).concat([{ name: ct.name, sig: 'SIGTERM' }]); }
      if (sub === 'kill') { ct.state = 'exited'; ct.exit = 137; ct.killed = true; bx.signals = (bx.signals || []).concat([{ name: ct.name, sig: 'SIGKILL' }]); }
      if (sub === 'restart') { ct.state = 'running'; ct.restarted = true; }
      if (sub === 'rm') {
        if (ct.state === 'running' && !has('-f')) return 'Error response from daemon: You cannot remove a running container. Stop the container before attempting removal or force remove';
        bx.containers = bx.containers.filter((x) => x !== ct);
        bx.removed = (bx.removed || []).concat([ct.name]);
      }
      return ct.name;
    }
    if (sub === 'rmi') { const ref = a[a.length - 1]; bx.images = bx.images.filter((x) => x.repo !== ref && (x.repo + ':' + x.tag) !== ref); return 'Untagged: ' + ref; }
    if (sub === 'exec') {
      const idx = a.findIndex((x, k) => k >= 2 && x[0] !== '-');
      const ct = find(a[idx]);
      if (!ct) return 'Error: No such container: ' + a[idx];
      if (ct.state !== 'running') return 'Error response from daemon: container ' + ct.name + ' is not running';
      const inner = a.slice(idx + 1);
      if (!inner.length) return 'docker: "exec" requires at least 2 arguments.';
      const ic = inner.join(' ');
      if (/^(sh|bash)$/.test(inner[0])) return '# (container ichida qobiq ochildi — bu mashqda buyruqni to\'g\'ridan bering:\n#  docker exec -it ' + ct.name + ' ss -lntup)';
      if (/^ss\b/.test(ic)) {
        if (!ct.appPort) return pad('Netid', 7) + pad('State', 9) + pad('Local Address:Port', 24) + 'Process';
        return pad('Netid', 7) + pad('State', 9) + pad('Local Address:Port', 24) + 'Process\n'
          + pad('tcp', 7) + pad('LISTEN', 9) + pad(ct.bind + ':' + ct.appPort, 24) + 'users:(("app",pid=1,fd=3))';
      }
      if (/^env\b/.test(ic)) return (ct.env || []).concat(['PATH=/usr/local/bin:/usr/bin', 'HOSTNAME=' + ct.id.slice(0, 12)]).join('\n');
      if (/^ps\b/.test(ic)) return pad('PID', 7) + pad('USER', 8) + 'COMMAND\n' + (ct.procs || [{ pid: 1, cmd: (ct.cmd || ['app']).join(' ') }]).map((p) => pad(p.pid, 7) + pad(p.user || 'root', 8) + p.cmd).join('\n');
      if (/^cat\b/.test(ic)) { const f = ct.files[inner[1]]; return f != null ? f : 'cat: ' + inner[1] + ': No such file or directory'; }
      if (/^(curl|wget)\b/.test(ic)) {
        const url = inner.find((x) => /^(https?:\/\/)?[\w\.\-]+(:\d+)?/.test(x) && x[0] !== '-') || '';
        const m = url.match(/^(?:https?:\/\/)?([^\/:]+)(?::(\d+))?/);
        if (!m) return 'curl: (3) URL rejected';
        const host = m[1], port = m[2] || '80';
        if (host === 'localhost' || host === '127.0.0.1') {
          if (ct.appPort && String(ct.appPort) === port) return 'HTTP/1.1 200 OK\nServer: app';
          return 'curl: (7) Failed to connect to ' + host + ' port ' + port + ': Connection refused';
        }
        const peer = bx.containers.find((x) => x.name === host && x.state === 'running');
        if (!peer) return 'curl: (6) Could not resolve host: ' + host;
        const shared = (ct.networks || []).some((n) => (peer.networks || []).indexOf(n) >= 0 && n !== 'bridge');
        if (!shared) return 'curl: (6) Could not resolve host: ' + host + '\n(default bridge tarmog\'ida nom orqali topish ishlamaydi)';
        if (String(peer.appPort) !== port) return 'curl: (7) Failed to connect to ' + host + ' port ' + port + ': Connection refused';
        if (peer.bind === '127.0.0.1') return 'curl: (7) Failed to connect to ' + host + ' port ' + port + ': Connection refused\n(peer loopbackka bind qilgan)';
        return 'HTTP/1.1 200 OK\nServer: app';
      }
      return 'sh: ' + inner[0] + ': not found (bu mashqda: ss, curl, env, ps, cat)';
    }
    if (sub === 'build') {
      const t = argOf('-t') || 'unnamed:latest';
      if (!bx.dockerfile) return 'ERROR: failed to solve: failed to read dockerfile';
      const steps = bx.dockerfile.filter((l) => l.trim() && l.trim()[0] !== '#');
      const out = steps.map((l, i) => '#' + (i + 1) + ' [' + (i + 1) + '/' + steps.length + '] ' + l.trim().split(' ')[0] + ' — done').join('\n');
      const df = bx.dockerfile.join('\n');
      const cmdM = df.match(/CMD\s+\[([^\]]+)\]/);
      const epM = df.match(/ENTRYPOINT\s+\[([^\]]+)\]/);
      const parse = (m) => m ? m[1].split(',').map((x) => x.trim().replace(/^["']|["']$/g, '')) : null;
      const [repo, tag] = t.split(':');
      bx.images = bx.images.filter((x) => !(x.repo === repo && x.tag === (tag || 'latest')));
      bx.images.push({ repo: repo, tag: tag || 'latest', id: sid().slice(0, 12), size: '142MB', cmd: parse(cmdM) || ['sh'], entrypoint: parse(epM), port: (df.match(/EXPOSE\s+(\d+)/) || [])[1] || null, bind: /0\.0\.0\.0/.test(df) ? '0.0.0.0' : '0.0.0.0', logs: ['listening on 0.0.0.0:' + ((df.match(/EXPOSE\s+(\d+)/) || [])[1] || 8000)] });
      bx.built = (bx.built || []).concat([t]);
      return out + '\n=> naming to docker.io/library/' + t;
    }
    if (sub === 'volume') {
      if (a[2] === 'ls') return 'DRIVER    VOLUME NAME\n' + bx.volumes.map((v) => pad('local', 10) + v.name).join('\n');
      if (a[2] === 'create') { const nm = a[3] || 'vol-' + sid().slice(0, 4); if (!bx.volumes.find((v) => v.name === nm)) bx.volumes.push({ name: nm }); bx.createdVolume = true; return nm; }
      if (a[2] === 'inspect') { const v = bx.volumes.find((x) => x.name === a[3]); return v ? JSON.stringify([{ Name: v.name, Driver: 'local', Mountpoint: '/var/lib/docker/volumes/' + v.name + '/_data' }], null, 2) : 'Error: No such volume: ' + a[3]; }
      if (a[2] === 'rm') { bx.volumes = bx.volumes.filter((x) => x.name !== a[3]); return a[3]; }
      return 'docker volume: ls / create / inspect / rm';
    }
    if (sub === 'network') {
      if (a[2] === 'ls') return pad('NETWORK ID', 14) + pad('NAME', 18) + 'DRIVER\n' + bx.networks.map((n) => pad(sid().slice(0, 12), 14) + pad(n.name, 18) + n.driver).join('\n');
      if (a[2] === 'create') { const nm = a[a.length - 1]; if (!bx.networks.find((x) => x.name === nm)) bx.networks.push({ name: nm, driver: 'bridge' }); bx.createdNetwork = true; return nm; }
      if (a[2] === 'connect') { const ct = find(a[4]); if (!ct) return 'Error: No such container'; ct.networks = (ct.networks || []).concat([a[3]]); return ''; }
      if (a[2] === 'inspect') {
        const n = bx.networks.find((x) => x.name === a[3]);
        if (!n) return 'Error: No such network: ' + a[3];
        const members = bx.containers.filter((ct) => (ct.networks || []).indexOf(n.name) >= 0);
        return JSON.stringify([{ Name: n.name, Driver: n.driver, Containers: members.reduce((o, ct) => { o[ct.id.slice(0, 12)] = { Name: ct.name, IPv4Address: ct.ip + '/16' }; return o; }, {}) }], null, 2);
      }
      return 'docker network: ls / create / connect / inspect';
    }
    if (sub === 'system') {
      if (a[2] === 'df') return pad('TYPE', 18) + pad('TOTAL', 8) + pad('ACTIVE', 8) + pad('SIZE', 10) + 'RECLAIMABLE\n'
        + pad('Images', 18) + pad(bx.images.length, 8) + pad('1', 8) + pad('4.2GB', 10) + '3.1GB (73%)\n'
        + pad('Containers', 18) + pad(bx.containers.length, 8) + pad(bx.containers.filter((x) => x.state === 'running').length, 8) + pad('820MB', 10) + '790MB (96%)\n'
        + pad('Local Volumes', 18) + pad(bx.volumes.length, 8) + pad('1', 8) + pad('2.4GB', 10) + '1.9GB (79%)\n'
        + pad('Build Cache', 18) + pad('34', 8) + pad('0', 8) + pad('6.8GB', 10) + '6.8GB (100%)';
      if (a[2] === 'prune') { bx.pruned = true; return 'Total reclaimed space: 9.9GB'; }
      return 'docker system: df / prune';
    }
    if (sub === 'compose') {
      if (!bx.compose) return 'no configuration file provided: not found';
      if (a[2] === 'up') {
        bx.compose.services.forEach((s2) => {
          if (bx.containers.find((x) => x.name === s2.name)) return;
          bx.containers.push({ id: sid(), name: s2.name, image: s2.image, state: 'running', exit: 0, appPort: s2.port, bind: s2.bind || '0.0.0.0', networks: ['app-net'], ip: '172.20.0.' + (2 + bx.containers.length), logs: s2.logs || ['ready'], env: s2.env || [], files: {} });
        });
        if (!bx.networks.find((n) => n.name === 'app-net')) bx.networks.push({ name: 'app-net', driver: 'bridge' });
        bx.composeUp = true;
        return bx.compose.services.map((s2) => ' ✔ Container ' + s2.name + '  Started').join('\n');
      }
      if (a[2] === 'ps') return pad('NAME', 16) + pad('IMAGE', 20) + pad('STATUS', 14) + 'PORTS\n' + bx.containers.filter((x) => (x.networks || []).indexOf('app-net') >= 0).map((x) => pad(x.name, 16) + pad(x.image, 20) + pad(x.state === 'running' ? 'Up' : 'Exited', 14) + (x.appPort || '')).join('\n');
      if (a[2] === 'down') { bx.containers = bx.containers.filter((x) => (x.networks || []).indexOf('app-net') < 0); bx.composeDown = true; return ' ✔ Network app-net  Removed'; }
      if (a[2] === 'logs') { const svc = a[a.length - 1]; const ct = bx.containers.find((x) => x.name === svc); return ct ? (ct.logs || []).map((l) => svc + '  | ' + l).join('\n') : 'no such service: ' + svc; }
      return 'docker compose: up / ps / down / logs';
    }
    if (sub === 'pull') { return 'Using default tag: latest\nStatus: Image is up to date for ' + a[2]; }
    return "docker: '" + sub + "' is not a docker command (mashqda) — 'help' deb ko'ring";
  }

  const IMG = {
    web: { repo: 'myapp', tag: 'latest', id: 'a1b2c3d4e5f6', size: '142MB', cmd: ['python', 'app.py'], port: 8000, bind: '0.0.0.0', logs: ['listening on 0.0.0.0:8000'] },
    loop: { repo: 'badapp', tag: 'latest', id: 'b2c3d4e5f6a1', size: '138MB', cmd: ['python', 'app.py'], port: 8000, bind: '127.0.0.1', logs: ['listening on 127.0.0.1:8000'] },
    echo: { repo: 'alpine', tag: '3.19', id: 'c3d4e5f6a1b2', size: '7MB', cmd: ['sh'], exitsImmediately: false },
    pg: { repo: 'postgres', tag: '16', id: 'd4e5f6a1b2c3', size: '412MB', cmd: ['postgres'], port: 5432, bind: '0.0.0.0', logs: ['database system is ready to accept connections'] },
    needenv: { repo: 'api', tag: 'latest', id: 'e5f6a1b2c3d4', size: '156MB', cmd: ['node', 'server.js'], port: 3000, bind: '0.0.0.0', needsEnv: 'DATABASE_URL', logs: [] },
  };
  const base = (extra) => Object.assign({ containers: [], images: [], volumes: [], networks: [{ name: 'bridge', driver: 'bridge' }, { name: 'host', driver: 'host' }, { name: 'none', driver: 'null' }] }, extra);

  const LABS = {
    'run-lab': { title: 'Birinchi container', section: "3 va 7-bo'lim",
      init: base({ images: [IMG.web, IMG.echo] }),
      tasks: [
        { t: 'Lokal image\'larni ko\'ring', v: (b, h) => h.some((x) => /^docker images/.test(x)), hint: 'docker images' },
        { t: '`myapp` image\'idan fon rejimida container yuritib, nomini `web` qo\'ying', v: (b) => b.containers.some((c) => c.name === 'web' && c.state === 'running'), hint: 'docker run -d --name web myapp' },
        { t: 'Ishlayotgan containerlarni ko\'ring', v: (b, h) => h.some((x) => /^docker ps$/.test(x)), hint: 'docker ps' },
        { t: 'Loglarini o\'qing — qaysi manzilda eshityapti?', v: (b, h) => h.some((x) => /^docker logs .*web/.test(x)), hint: 'docker logs web' },
        { t: 'Containerni to\'xtatib, o\'chirilgan holatda ham ko\'rinishini tekshiring', v: (b, h) => b.containers.some((c) => c.name === 'web' && c.state === 'exited') && h.some((x) => /docker ps -a/.test(x)), hint: 'docker stop web  keyin  docker ps -a' },
      ] },
    'exit-lab': { title: 'Container nega darhol chiqib ketdi?', section: "7 va 14-bo'lim",
      init: base({ images: [IMG.needenv],
        containers: [{ id: 'f1a2b3c4d5e6', name: 'api', image: 'api:latest', state: 'exited', exit: 1, cmd: ['node', 'server.js'], env: [], restart: 'no', logs: ['FATAL: environment variable DATABASE_URL is not set'], files: {} }] }),
      tasks: [
        { t: 'To\'xtagan containerni ham ko\'rsatadigan ro\'yxatni oching — exit code qancha?', v: (b, h) => h.some((x) => /docker ps -a/.test(x)), hint: 'docker ps -a' },
        { t: 'Loglarni o\'qing — nima deb chiqdi?', v: (b, h) => h.some((x) => /^docker logs .*api/.test(x)), hint: 'docker logs api' },
        { t: 'Sozlamasini tekshiring (env bo\'sh ekanini ko\'ring)', v: (b, h) => h.some((x) => /^docker inspect .*api/.test(x)), hint: 'docker inspect api' },
        { t: 'Eski containerni o\'chirib tashlang', v: (b) => (b.removed || []).indexOf('api') >= 0, hint: 'docker rm api' },
        { t: 'Kerakli environment o\'zgaruvchisi bilan qaytadan yuritib, ishga tushganini ko\'ring', v: (b) => b.containers.some((c) => c.state === 'running' && (c.env || []).some((e) => /^DATABASE_URL=/.test(e))), hint: 'docker run -d -e DATABASE_URL=postgres://db/app api' },
      ] },
    'bind-lab-docker': { title: '0.0.0.0 va port mapping', section: "10-bo'lim",
      init: base({ images: [IMG.loop, IMG.web] }),
      tasks: [
        { t: '`badapp`ni 8000-portni publish qilib yuritib ko\'ring', v: (b) => b.containers.some((c) => c.image.indexOf('badapp') === 0 && c.ports), hint: 'docker run -d -p 8000:8000 --name bad badapp' },
        { t: 'Container ichidan localhost:8000 ga so\'rov yuboring — ishlaydi', v: (b, h) => h.some((x) => /docker exec .*(curl|wget).*(localhost|127\.0\.0\.1):8000/.test(x)), hint: 'docker exec -it bad curl -I localhost:8000' },
        { t: 'Ichkarida qaysi manzilga bind qilganini toping — sabab shu', v: (b, h) => h.some((x) => /docker exec .*ss/.test(x)), hint: 'docker exec -it bad ss -lntup' },
        { t: 'To\'g\'ri image (`myapp`) bilan qaytadan yuritib, 0.0.0.0 ga bind qilganini tasdiqlang', v: (b, h) => b.containers.some((c) => c.image.indexOf('myapp') === 0 && c.ports) && h.some((x) => /docker exec .*ss/.test(x)), hint: 'docker run -d -p 8000:8000 --name good myapp  keyin  docker exec -it good ss -lntup' },
      ] },
    'build-lab': { title: 'Dockerfile — build va cache', section: "4–6-bo'lim",
      init: base({ images: [{ repo: 'python', tag: '3.12-slim', id: '1a2b3c4d5e6f', size: '128MB', cmd: ['python3'] }],
        dockerfile: ['FROM python:3.12-slim', 'WORKDIR /app', 'COPY requirements.txt .', 'RUN pip install -r requirements.txt', 'COPY . .', 'EXPOSE 8000', 'ENTRYPOINT ["python"]', 'CMD ["app.py"]'] }),
      tasks: [
        { t: 'Dockerfile\'dan `shop:v1` nomli image build qiling', v: (b) => (b.built || []).some((t) => /shop:v1/.test(t)), hint: 'docker build -t shop:v1 .' },
        { t: 'Yangi image ro\'yxatda chiqqanini tasdiqlang', v: (b, h) => h.some((x) => /^docker images/.test(x)) && b.images.some((i) => i.repo === 'shop'), hint: 'docker images' },
        { t: 'Default holda yuritib ko\'ring — ENTRYPOINT va CMD birlashadi', v: (b) => b.containers.some((c) => c.image.indexOf('shop') === 0 && !(c.cmd || []).some((x) => /test\.py/.test(x))), hint: 'docker run -d --name shop shop:v1' },
        { t: 'Endi argument berib yuritib, CMD almashganini ko\'ring (`test.py`)', v: (b) => b.containers.some((c) => (c.cmd || []).some((x) => /test\.py/.test(x))), hint: 'docker run --name shop2 shop:v1 test.py' },
        { t: 'inspect bilan ENTRYPOINT o\'zgarmaganini tasdiqlang', v: (b, h) => h.some((x) => /^docker inspect .*shop2?/.test(x)), hint: 'docker inspect shop2' },
      ] },
    'signal-lab': { title: 'stop va kill — SIGTERM va SIGKILL', section: "8-bo'lim",
      init: base({ images: [IMG.web],
        containers: [
          { id: 'aa11bb22cc33', name: 'graceful', image: 'myapp:latest', state: 'running', exit: 0, cmd: ['python', 'app.py'], appPort: 8000, bind: '0.0.0.0', restart: 'no', logs: ['listening on 0.0.0.0:8000'], procs: [{ pid: 1, ppid: 0, cmd: 'python app.py' }], files: {}, networks: ['bridge'] },
          { id: 'dd44ee55ff66', name: 'shellform', image: 'myapp:latest', state: 'running', exit: 0, cmd: ['sh', '-c', 'python app.py'], appPort: 8000, bind: '0.0.0.0', restart: 'no', logs: ['listening on 0.0.0.0:8000'], procs: [{ pid: 1, ppid: 0, cmd: '/bin/sh -c python app.py' }, { pid: 7, ppid: 1, cmd: 'python app.py' }], files: {}, networks: ['bridge'] },
        ] }),
      tasks: [
        { t: 'Ikki containerda PID 1 kim ekanini solishtiring', v: (b, h) => h.some((x) => /docker top .*graceful/.test(x)) && h.some((x) => /docker top .*shellform/.test(x)), hint: 'docker top graceful  va  docker top shellform' },
        { t: '`graceful`ni muloyim to\'xtatib, exit code 143 bo\'lganini ko\'ring', v: (b) => (b.signals || []).some((s) => s.name === 'graceful' && s.sig === 'SIGTERM'), hint: 'docker stop graceful' },
        { t: '`shellform`ni majburan to\'xtating — exit code 137', v: (b) => (b.signals || []).some((s) => s.name === 'shellform' && s.sig === 'SIGKILL'), hint: 'docker kill shellform' },
        { t: 'Ikkisining exit code\'larini ro\'yxatda solishtiring', v: (b, h) => h.some((x) => /docker ps -a/.test(x)) && (b.signals || []).length >= 2, hint: 'docker ps -a' },
      ] },
    'volume-lab': { title: 'Volume — ma\'lumot qoladi', section: "12-bo'lim",
      init: base({ images: [IMG.pg] }),
      tasks: [
        { t: '`pgdata` nomli volume yarating', v: (b) => b.volumes.some((v) => v.name === 'pgdata'), hint: 'docker volume create pgdata' },
        { t: 'Volume\'larni ro\'yxatda ko\'ring', v: (b, h) => h.some((x) => /docker volume ls/.test(x)), hint: 'docker volume ls' },
        { t: 'Postgres\'ni shu volume ulangan holda yuritib ko\'ring', v: (b) => b.containers.some((c) => c.image.indexOf('postgres') === 0 && (c.mounts || []).some((m) => m.Name === 'pgdata')), hint: 'docker run -d --name db -v pgdata:/var/lib/postgresql/data postgres:16' },
        { t: 'inspect bilan mount o\'rnida turganini tasdiqlang', v: (b, h) => h.some((x) => /^docker inspect .*db/.test(x)), hint: 'docker inspect db' },
        { t: 'Containerni o\'chirib, volume qolganini ko\'ring', v: (b, h) => (b.removed || []).length > 0 && b.volumes.some((v) => v.name === 'pgdata') && h.some((x) => /docker volume ls/.test(x)), hint: 'docker stop db && docker rm db  keyin  docker volume ls' },
      ] },
    'net-lab-docker': { title: 'Containerlar bir-birini topmayapti', section: "9 va 14-bo'lim",
      init: base({ images: [IMG.web, IMG.pg],
        containers: [
          { id: '11aa22bb33cc', name: 'api', image: 'myapp:latest', state: 'running', exit: 0, cmd: ['python', 'app.py'], appPort: 8000, bind: '0.0.0.0', networks: ['bridge'], ip: '172.17.0.2', logs: ['listening on 0.0.0.0:8000'], files: {} },
          { id: '44dd55ee66ff', name: 'db', image: 'postgres:16', state: 'running', exit: 0, cmd: ['postgres'], appPort: 5432, bind: '0.0.0.0', networks: ['bridge'], ip: '172.17.0.3', logs: ['database system is ready to accept connections'], files: {} },
        ] }),
      tasks: [
        { t: '`api` ichidan `db` ga ulanib ko\'ring — nom yechilmaydi', v: (b, h) => h.some((x) => /docker exec .*api .*(curl|wget).*db/.test(x)), hint: 'docker exec -it api curl -I db:5432' },
        { t: 'Qaysi tarmoqlar borligini ko\'ring', v: (b, h) => h.some((x) => /docker network ls/.test(x)), hint: 'docker network ls' },
        { t: '`app-net` nomli yangi tarmoq yarating', v: (b) => b.networks.some((n) => n.name === 'app-net'), hint: 'docker network create app-net' },
        { t: 'Ikki containerni ham shu tarmoqqa ulang', v: (b) => ['api', 'db'].every((nm) => { const c = b.containers.find((x) => x.name === nm); return c && (c.networks || []).indexOf('app-net') >= 0; }), hint: 'docker network connect app-net api  va  docker network connect app-net db' },
        { t: 'Endi qaytadan ulanib ko\'ring — nom orqali ishlaydi', v: (b, h) => { const i = h.findIndex((x) => /docker network connect app-net db|docker network connect app-net api/.test(x)); return i >= 0 && h.slice(i).some((x) => /docker exec .*api .*(curl|wget).*db:5432/.test(x)); }, hint: 'docker exec -it api curl -I db:5432' },
      ] },
    'compose-lab': { title: 'Compose — butun stack', section: "15-bo'lim",
      init: base({ images: [IMG.web, IMG.pg],
        compose: { services: [
          { name: 'db', image: 'postgres:16', port: 5432, bind: '0.0.0.0', logs: ['database system is ready to accept connections'] },
          { name: 'api', image: 'myapp:latest', port: 8000, bind: '0.0.0.0', env: ['DATABASE_URL=postgres://db:5432/app'], logs: ['listening on 0.0.0.0:8000', 'connected to db:5432'] },
        ] } }),
      tasks: [
        { t: 'Butun stack\'ni fon rejimida ko\'taring', v: (b) => b.composeUp, hint: 'docker compose up -d' },
        { t: 'Service\'lar holatini ko\'ring', v: (b, h) => h.some((x) => /docker compose ps/.test(x)), hint: 'docker compose ps' },
        { t: '`api` loglarini o\'qing — DB ga ulanganmi?', v: (b, h) => h.some((x) => /docker compose logs .*api|docker logs .*api/.test(x)), hint: 'docker compose logs api' },
        { t: '`api` ichidan `db` ga nom orqali ulanib ko\'ring', v: (b, h) => h.some((x) => /docker exec .*api .*(curl|wget).*db:5432/.test(x)), hint: 'docker exec -it api curl -I db:5432' },
        { t: 'Stack\'ni tushiring', v: (b) => b.composeDown, hint: 'docker compose down' },
      ] },
    'disk-lab': { title: 'Disk to\'lib qoldi', section: "14-bo'lim",
      init: base({ images: [IMG.web, IMG.pg, IMG.echo, IMG.loop],
        volumes: [{ name: 'pgdata' }, { name: 'old-data' }, { name: 'tmp-cache' }],
        containers: [
          { id: '77aa88bb99cc', name: 'web', image: 'myapp:latest', state: 'running', exit: 0, cmd: ['python', 'app.py'], appPort: 8000, bind: '0.0.0.0', networks: ['bridge'], logs: ['listening on 0.0.0.0:8000'], files: {} },
          { id: 'aa99bb88cc77', name: 'old-job', image: 'alpine:3.19', state: 'exited', exit: 0, cmd: ['sh'], networks: ['bridge'], logs: [], files: {} },
        ] }),
      tasks: [
        { t: 'Docker qancha disk yeganini ko\'ring — eng katta ulush qaysi?', v: (b, h) => h.some((x) => /docker system df/.test(x)), hint: 'docker system df' },
        { t: 'To\'xtagan containerlarni ro\'yxatda toping', v: (b, h) => h.some((x) => /docker ps -a/.test(x)), hint: 'docker ps -a' },
        { t: 'Volume\'larni ko\'rib, keraksizini aniqlang', v: (b, h) => h.some((x) => /docker volume ls/.test(x)), hint: 'docker volume ls' },
        { t: 'Keraksiz containerni o\'chiring', v: (b) => (b.removed || []).indexOf('old-job') >= 0, hint: 'docker rm old-job' },
        { t: 'Ishlatilmayotgan obyektlarni tozalang', v: (b) => b.pruned, hint: 'docker system prune' },
      ] },
    'chain-lab-docker': { title: 'To\'liq zanjir — quti ichidan dasturgacha', section: "17-bo'lim",
      init: base({ images: [IMG.web],
        containers: [{ id: 'cc11dd22ee33', name: 'shop', image: 'myapp:latest', state: 'running', exit: 0, cmd: ['sh', '-c', 'python app.py'], appPort: 8000, bind: '127.0.0.1', ports: '8080:8000/tcp', restart: 'always', networks: ['bridge'], ip: '172.17.0.4', memLimit: '256MiB', memUse: '240MiB', memPct: 93.7, cpu: 4.1, logs: ['listening on 127.0.0.1:8000', 'WARN: memory usage high'], procs: [{ pid: 1, ppid: 0, cmd: '/bin/sh -c python app.py' }, { pid: 9, ppid: 1, cmd: 'python app.py' }], files: { '/app/config.yaml': 'bind: 127.0.0.1\nport: 8000' } }] }),
      tasks: [
        { t: '1. Container tirikmi va qaysi port map qilingan?', v: (b, h) => h.some((x) => /^docker ps/.test(x)), hint: 'docker ps' },
        { t: '2. Loglar nima deydi?', v: (b, h) => h.some((x) => /^docker logs .*shop/.test(x)), hint: 'docker logs shop' },
        { t: '3. PID 1 kim — dasturmi yoki shell?', v: (b, h) => h.some((x) => /docker top .*shop/.test(x)), hint: 'docker top shop' },
        { t: '4. Ichkarida qaysi manzilga bind qilgan? (asosiy sabab)', v: (b, h) => h.some((x) => /docker exec .*shop .*ss/.test(x)), hint: 'docker exec -it shop ss -lntup' },
        { t: '5. Sozlama faylidan tasdiqlang', v: (b, h) => h.some((x) => /docker exec .*shop .*cat/.test(x)), hint: 'docker exec -it shop cat /app/config.yaml' },
        { t: '6. Resurs holati qanday — xotira chegaraga yaqinmi?', v: (b, h) => h.some((x) => /docker stats/.test(x)), hint: 'docker stats' },
      ] },
  };

  function mount(host, id) {
    const spec = typeof id === 'string' ? LABS[id] : id;
    if (!spec) return;
    let bx = JSON.parse(JSON.stringify(spec.init));
    let hist = [];
    const doneSet = {};
    host.style.cssText = 'border:1px solid rgb(var(--ink-rgb) / 0.15);background:var(--bg);padding:0;margin:8px 0 24px';
    const head = el('div', 'border-bottom:1px solid rgb(var(--ink-rgb) / 0.11);padding:16px 18px;display:flex;flex-wrap:wrap;gap:12px;align-items:baseline;justify-content:space-between');
    head.append(el('div', `font:500 11.5px ${SG};letter-spacing:.2em;text-transform:uppercase;color:${GR}`, '▶ Mashq — ' + spec.title));
    const score = el('div', `font:500 12.5px ${MO};color:${SUB}`);
    head.appendChild(score);
    const wrap = el('div', 'display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));gap:0');
    const left = el('div', 'padding:16px 18px;border-right:1px solid rgb(var(--ink-rgb) / 0.09)');
    const right = el('div', 'padding:16px 18px');
    const taskList = el('div', 'display:flex;flex-direction:column;gap:10px');
    left.append(el('div', `font:500 11.5px ${SG};letter-spacing:.2em;text-transform:uppercase;color:${YE};margin-bottom:12px`, 'Vazifalar'), taskList);
    const out = el('pre', `font:400 12.5px/1.6 ${MO};background:var(--bg2);border:1px solid rgb(var(--ink-rgb) / 0.1);padding:11px 13px;margin:0 0 10px;min-height:180px;max-height:320px;overflow:auto;color:var(--acc-deep);white-space:pre`);
    const line = el('div', 'display:flex;gap:8px;align-items:center');
    const inp = el('input', `flex:1 1 160px;background:var(--bg2);border:1px solid rgb(var(--ink-rgb) / 0.2);color:${INK};font:400 13px ${MO};padding:9px 11px;outline:none`);
    inp.type = 'text'; inp.placeholder = 'docker ps';
    const ctl = el('div', 'display:flex;flex-wrap:wrap;gap:8px;margin-top:10px');
    const check = btn('✓ Tekshir', 'gr'), reset = btn('↻ Boshidan', 'gh'), help = btn('? Buyruqlar', 'gh');
    ctl.append(check, reset, help);
    right.append(out, line, ctl);
    line.append(el('span', `font:500 13px ${MO};color:${GR}`, '$'), inp);
    wrap.append(left, right);
    host.append(head, wrap);

    const say = (t) => { out.textContent += (out.textContent ? '\n' : '') + t + '\n'; out.scrollTop = out.scrollHeight; };
    const paint = () => {
      taskList.innerHTML = '';
      let done = 0;
      spec.tasks.forEach((tk, i) => {
        let ok = false;
        try { ok = !!tk.v(bx, hist); } catch (e) { ok = false; }
        if (ok) doneSet[i] = true;
        const fin = !!doneSet[i];
        if (fin) done++;
        const row = el('div', 'display:flex;gap:10px;align-items:flex-start');
        row.append(el('div', `font:500 13px ${MO};color:${fin ? GR : 'rgb(var(--ink-rgb) / 0.58)'};min-width:16px`, fin ? '✓' : (i + 1) + '.'));
        const body = el('div');
        body.append(el('div', `font:400 15.5px/1.5 ${NR};color:${fin ? GR : INK};text-wrap:pretty`, tk.t));
        if (!fin) {
          const hb = el('button', `background:transparent;border:0;padding:4px 0 0;cursor:pointer;color:rgb(var(--ink-rgb) / 0.63);font:400 12.5px ${SG};text-decoration:underline`, 'yordam');
          hb.type = 'button';
          hb.onclick = () => hb.replaceWith(el('div', `font:400 12.5px ${MO};color:${CY};padding-top:4px`, tk.hint));
          body.appendChild(hb);
        }
        row.appendChild(body);
        taskList.appendChild(row);
      });
      score.textContent = done + ' / ' + spec.tasks.length + ' bajarildi';
      score.style.color = done === spec.tasks.length ? GR : SUB;
    };
    const exec = (raw) => {
      if (!raw.trim()) return;
      const parts = raw.split('&&').map((x) => x.trim()).filter(Boolean);
      parts.forEach((one) => {
        hist.push(one.replace(/\s+/g, ' '));
        say('$ ' + one);
        let r;
        try { r = run(bx, one); } catch (e) { r = 'error: ' + e.message; }
        if (r) say(r);
      });
      paint();
    };
    inp.onkeydown = (e) => { if (e.key === 'Enter') { exec(inp.value); inp.value = ''; } };
    check.onclick = () => { paint(); const d = spec.tasks.filter((t, i) => doneSet[i]).length; say(d === spec.tasks.length ? '✓ Hamma vazifa bajarildi.' : '→ ' + d + '/' + spec.tasks.length + ' bajarildi.'); };
    reset.onclick = () => { bx = JSON.parse(JSON.stringify(spec.init)); hist = []; Object.keys(doneSet).forEach((k) => delete doneSet[k]); out.textContent = ''; say('muhit boshidan tiklandi'); paint(); };
    help.onclick = () => exec('help');
    say('mashq muhiti tayyor — ' + spec.section + ".  '? Buyruqlar' yordam beradi.");
    paint();
  }

  window.DockerLab = {
    run: function (bx, cmd) { return run(bx, cmd); },
    mountSpec: function (host, spec) { if (host.dataset.mounted) return; host.dataset.mounted = '1'; try { mount(host, spec); } catch (e) { console.warn('seclab', e); } },
    mountAll: function () {
      document.querySelectorAll('[data-dlab]').forEach((h) => { if (h.dataset.mounted) return; h.dataset.mounted = '1'; try { mount(h, h.dataset.dlab); } catch (e) { console.warn('dlab', h.dataset.dlab, e); } });
    },
    ids: Object.keys(LABS),
  };
})();
