/* k8s-lab.js — KodeKloud uslubidagi mashq muhiti: soxta cluster + kubectl interpretatori + vazifa tekshiruvi.
   Ishlatish: <div data-klab="pod-create"></div> ... window.K8sLab.mountAll() */
(function () {
  const CY = 'oklch(calc(var(--lk) * 0.48 + var(--lb)) 0.11 68)', YE = 'oklch(calc(var(--lk) * 0.52 + var(--lb)) 0.077 40)', GR = 'oklch(calc(var(--lk) * 0.42 + var(--lb)) 0.15 150)', RD = 'oklch(calc(var(--lk) * 0.4 + var(--lb)) 0.19 25)';
  const INK = 'var(--ink)', SUB = 'rgb(var(--ink-rgb) / 0.86)';
  const SG = "Lora,ui-sans-serif,sans-serif", MO = "'IBM Plex Mono',monospace", NR = 'Lora,Georgia,serif';
  const el = (t, css, txt) => { const d = document.createElement(t); if (css) d.style.cssText = css; if (txt != null) d.textContent = txt; return d; };
  const btn = (label, kind) => {
    const map = { cy: ['oklch(calc(var(--lk) * 0.56 + var(--lb)) 0.11 68 / 0.07)', 'oklch(calc(var(--lk) * 0.56 + var(--lb)) 0.11 68 / 0.45)', 'oklch(calc(var(--lk) * 0.5 + var(--lb)) 0.11 68)'],
      ye: ['oklch(calc(var(--lk) * 0.6 + var(--lb)) 0.077 40 / 0.08)', 'oklch(calc(var(--lk) * 0.6 + var(--lb)) 0.077 40 / 0.5)', 'oklch(calc(var(--lk) * 0.58 + var(--lb)) 0.077 40)'],
      gr: ['oklch(calc(var(--lk) * 0.5 + var(--lb)) 0.15 150 / 0.07)', 'oklch(calc(var(--lk) * 0.5 + var(--lb)) 0.15 150 / 0.45)', 'oklch(calc(var(--lk) * 0.52 + var(--lb)) 0.13 150)'],
      gh: ['transparent', 'rgb(var(--ink-rgb) / 0.22)', 'rgb(var(--ink-rgb) / 0.88)'] };
    const [bg, bd, col] = map[kind] || map.gh;
    const b = el('button', `background:${bg};border:1px solid ${bd};color:${col};font:500 12.5px ${SG};letter-spacing:.04em;padding:8px 14px;cursor:pointer`, label);
    b.type = 'button'; return b;
  };
  const pad = (s, n) => String(s) + ' '.repeat(Math.max(1, n - String(s).length));
  const age = () => Math.floor(Math.random() * 50 + 5) + 's';
  const rid = () => Math.random().toString(36).slice(2, 7);

  /* ---------- cluster modeli ---------- */
  function Cluster(init) {
    this.nodes = (init.nodes || ['node-1', 'node-2']).map((n) => typeof n === 'string' ? { name: n, ready: true, taints: [] } : n);
    this.deployments = (init.deployments || []).map((d) => Object.assign({ replicas: 1, image: 'nginx:1.25', labels: {}, probes: {}, resources: {}, container: 'app', rev: 1 }, d));
    this.services = (init.services || []).map((s) => Object.assign({ type: 'ClusterIP', port: 80, targetPort: 80, selector: {} }, s));
    this.pdbs = init.pdbs || [];
    this.configmaps = init.configmaps || [];
    this.secrets = init.secrets || [];
    this.pods = [];
    this.events = [];
    (init.pods || []).forEach((p) => this.pods.push(Object.assign({ status: 'Running', ready: true, restarts: 0, node: this.nodes[0].name, labels: {}, image: 'nginx:1.25', container: 'app', logs: [], prevLogs: [] }, p)));
    this.sync();
  }
  Cluster.prototype.sync = function () {
    this.deployments.forEach((d) => {
      const own = this.pods.filter((p) => p.owner === d.name);
      for (let i = own.length; i < d.replicas; i++) {
        const nd = this.nodes.filter((n) => n.ready && !n.taints.length);
        this.pods.push({ name: d.name + '-' + rid(), owner: d.name, status: nd.length ? 'Running' : 'Pending',
          ready: !!nd.length, restarts: 0, node: nd.length ? nd[i % nd.length].name : '<none>',
          labels: Object.assign({}, d.labels), image: d.image, container: d.container, logs: ['level=info msg="listening"'], prevLogs: [] });
        if (!nd.length) this.events.push('Warning  FailedScheduling  ' + d.name + '  0/' + this.nodes.length + ' nodes available');
      }
      if (own.length > d.replicas) {
        const cut = own.slice(d.replicas);
        this.pods = this.pods.filter((p) => cut.indexOf(p) < 0);
      }
    });
  };
  Cluster.prototype.resched = function () {
    const nd = this.nodes.filter((n) => n.ready && !n.taints.length && !n.cordoned);
    if (!nd.length) return;
    this.pods.forEach((p, i) => { if (p.status === 'Pending') { p.status = 'Running'; p.ready = true; p.node = nd[i % nd.length].name; } });
  };
  Cluster.prototype.eps = function (svc) {
    const sel = Object.keys(svc.selector || {});
    if (!sel.length) return [];
    return this.pods.filter((p) => p.ready && p.status === 'Running' && sel.every((k) => p.labels[k] === svc.selector[k]));
  };

  /* ---------- kubectl interpretatori ---------- */
  function run(c, raw) {
    let cmd = raw.trim().replace(/^kubectl\s+/, '').replace(/\s+/g, ' ');
    cmd = cmd.replace(/\b(deploy|deployments?)(?:\.apps)?\/([\w-]+)/g, 'deployment $2').replace(/\b(po|pods?|svc|services?|cm|configmaps?|secrets?|nodes?)\/([\w-]+)/g, '$1 $2').replace(/\bdeploy\b/g, 'deployment').replace(/^lab-set res\b/, 'lab-set resources');
    if (!cmd) return '';
    const a = cmd.split(' ');
    const flag = (n) => { const f = a.find((x) => x.indexOf('--' + n + '=') === 0); return f ? f.split('=').slice(1).join('=') : null; };
    const has = (n) => a.indexOf('--' + n) >= 0 || a.some((x) => x.indexOf('--' + n + '=') === 0);
    const kind = (k) => ({ po: 'pods', pod: 'pods', pods: 'pods', deploy: 'deployments', deployment: 'deployments', deployments: 'deployments',
      svc: 'services', service: 'services', services: 'services', node: 'nodes', nodes: 'nodes', ep: 'endpoints', endpoints: 'endpoints',
      cm: 'configmaps', configmap: 'configmaps', configmaps: 'configmaps', secret: 'secrets', secrets: 'secrets', all: 'all' }[k] || null);

    if (a[0] === 'get' && /^events?$|^ev$/.test(a[1] || '')) {
      const ev = (c.events || []).slice();
      c.pods.forEach((p) => {
        if (p.status === 'Pending') ev.push('Warning  FailedScheduling  pod/' + p.name + '  0/' + c.nodes.length + ' nodes are available');
        if (p.status === 'CrashLoopBackOff') ev.push('Warning  BackOff  pod/' + p.name + '  Back-off restarting failed container');
        if (p.status === 'ImagePullBackOff') ev.push('Warning  Failed  pod/' + p.name + '  Failed to pull image "' + p.image + '"');
        if (p.status === 'OOMKilled') ev.push('Warning  OOMKilling  pod/' + p.name + '  Memory limit reached, container killed');
      });
      if (!ev.length) ev.push('Normal  Scheduled  ' + (c.pods[0] ? 'pod/' + c.pods[0].name : 'default') + '  Successfully assigned');
      return 'TYPE     REASON  OBJECT  MESSAGE\n' + ev.join('\n');
    }
    if (a[0] === 'describe' && (kind(a[1]) === 'configmaps' || kind(a[1]) === 'secrets')) {
      const list = kind(a[1]) === 'configmaps' ? c.configmaps : c.secrets;
      const m = list.find((x) => x.name === a[2]);
      if (!m) return 'Error from server (NotFound): ' + kind(a[1]) + ' "' + (a[2] || '') + '" not found';
      const d = m.data || {};
      return 'Name:         ' + m.name + '\nData\n====\n' + Object.keys(d).map((k2) => k2 + ':\n----\n' + (kind(a[1]) === 'secrets' ? String(d[k2]).length + ' bytes' : d[k2])).join('\n');
    }
    if (a[0] === 'get' && (a[1] === 'pdb' || a[1] === 'poddisruptionbudget')) {
      if (!c.pdbs || !c.pdbs.length) return 'No resources found in default namespace.';
      let out = pad('NAME', 18) + pad('MIN AVAILABLE', 16) + pad('ALLOWED DISRUPTIONS', 22) + 'AGE';
      c.pdbs.forEach((pb) => { const live = c.pods.filter((p) => p.ready && p.labels.app === pb.app).length; const allowed = Math.max(0, live - pb.minAvailable);
        out += '\n' + pad(pb.name, 18) + pad(pb.minAvailable, 16) + pad(allowed, 22) + age(); });
      return out;
    }
    if (a[0] === 'get') {
      const k = kind(a[1]);
      if (!k) return 'error: the server doesn\'t have a resource type "' + (a[1] || '') + '"';
      const wide = a.indexOf('wide') > 0;
      if (k === 'pods' || k === 'all') {
        if (!c.pods.length) return 'No resources found in default namespace.';
        let out = pad('NAME', 30) + pad('READY', 8) + pad('STATUS', 20) + pad('RESTARTS', 11) + pad('AGE', 8) + (wide ? pad('NODE', 10) : '');
        c.pods.forEach((p) => { out += '\n' + pad(p.name, 30) + pad(p.ready ? '1/1' : '0/1', 8) + pad(p.status, 20) + pad(p.restarts, 11) + pad(age(), 8) + (wide ? pad(p.node, 10) : ''); });
        return out;
      }
      if (k === 'deployments') {
        if (!c.deployments.length) return 'No resources found in default namespace.';
        let out = pad('NAME', 24) + pad('READY', 9) + pad('UP-TO-DATE', 12) + pad('AVAILABLE', 11) + pad('AGE', 8);
        c.deployments.forEach((d) => { const r = c.pods.filter((p) => p.owner === d.name && p.ready).length; out += '\n' + pad(d.name, 24) + pad(r + '/' + d.replicas, 9) + pad(d.replicas, 12) + pad(r, 11) + pad(age(), 8); });
        return out;
      }
      if (k === 'services') {
        if (!c.services.length) return 'No resources found in default namespace.';
        let out = pad('NAME', 20) + pad('TYPE', 13) + pad('CLUSTER-IP', 16) + pad('PORT(S)', 12) + pad('AGE', 8);
        c.services.forEach((s) => { out += '\n' + pad(s.name, 20) + pad(s.type, 13) + pad('10.96.' + (s.name.length * 7 % 200) + '.10', 16) + pad(s.port + '/TCP', 12) + pad(age(), 8); });
        return out;
      }
      if (k === 'endpoints') {
        if (!c.services.length) return 'No resources found in default namespace.';
        let out = pad('NAME', 20) + pad('ENDPOINTS', 40) + pad('AGE', 8);
        c.services.forEach((s) => { const e = c.eps(s); out += '\n' + pad(s.name, 20) + pad(e.length ? e.map((p, i) => '10.1.2.' + (3 + i) + ':' + s.targetPort).join(',') : '<none>', 40) + pad(age(), 8); });
        return out;
      }
      if (k === 'nodes') {
        let out = pad('NAME', 12) + pad('STATUS', 12) + pad('ROLES', 16) + pad('AGE', 7) + 'VERSION';
        c.nodes.forEach((n) => { out += '\n' + pad(n.name, 12) + pad((n.ready ? 'Ready' : 'NotReady') + (n.cordoned ? ',SchedulingDisabled' : ''), 12) + pad(n.name.indexOf('1') > 0 ? 'control-plane' : '<none>', 16) + pad('9d', 7) + 'v1.29.4'; });
        return out;
      }
      if (k === 'configmaps') return c.configmaps.length ? pad('NAME', 22) + 'DATA\n' + c.configmaps.map((m) => pad(m.name, 22) + Object.keys(m.data || {}).length).join('\n') : 'No resources found in default namespace.';
      if (k === 'secrets') return c.secrets.length ? pad('NAME', 22) + 'TYPE\n' + c.secrets.map((m) => pad(m.name, 22) + (m.type || 'Opaque')).join('\n') : 'No resources found in default namespace.';
    }

    if (a[0] === 'describe') {
      const k = kind(a[1]), n = a[2];
      if (k === 'pods') {
        const p = c.pods.find((x) => x.name === n) || (n && c.pods.find((x) => x.name.indexOf(n) === 0));
        if (!p) return 'Error from server (NotFound): pods "' + n + '" not found';
        let out = 'Name:         ' + p.name + '\nNode:         ' + p.node + '\nStatus:       ' + p.status
          + '\nLabels:       ' + (Object.keys(p.labels).length ? Object.keys(p.labels).map((k2) => k2 + '=' + p.labels[k2]).join(',') : '<none>')
          + '\nContainers:\n  ' + p.container + ':\n    Image:          ' + p.image + '\n    Ready:          ' + p.ready + '\n    Restart Count:  ' + p.restarts;
        if (p.resources) { const r = p.resources; if (r.requests || r.limits) out += '\n    Requests:  ' + JSON.stringify(r.requests || {}) + '\n    Limits:    ' + JSON.stringify(r.limits || {}); }
        if (p.finalizers && p.finalizers.length) out += '\nFinalizers:   [' + p.finalizers.join(', ') + ']';
        if (p.grace) out += '\nTermination Grace Period:  ' + p.grace + 's';
        const nodeObj = c.nodes.find((x) => x.name === p.node);
        out += '\nEvents:\n' + (p.status === 'Pending' ? '  Warning  FailedScheduling  0/' + c.nodes.length + ' nodes available: insufficient resources or taints'
          : p.status === 'Terminating' ? '  Normal  Killing  kubelet  Stopping container ' + p.container + (nodeObj && !nodeObj.ready ? '\n  Warning  NodeNotReady  node ' + p.node + ' is not ready — o' + "'" + 'chirish tasdiqlanmayapti' : '')
          : '  <none>');
        return out;
      }
      if (k === 'deployments') {
        const d = c.deployments.find((x) => x.name === n);
        if (!d) return 'Error from server (NotFound): deployments "' + n + '" not found';
        return 'Name:          ' + d.name + '\nReplicas:      ' + d.replicas + ' desired\nSelector:      ' + Object.keys(d.labels).map((k2) => k2 + '=' + d.labels[k2]).join(',')
          + '\nImage:         ' + d.image + '\nProbes:        ' + (Object.keys(d.probes).length ? JSON.stringify(d.probes) : '<none>')
          + '\nResources:     ' + (Object.keys(d.resources).length ? JSON.stringify(d.resources) : '<none>');
      }
      if (k === 'services') {
        const s = c.services.find((x) => x.name === n);
        if (!s) return 'Error from server (NotFound): services "' + n + '" not found';
        const e = c.eps(s);
        return 'Name:              ' + s.name + '\nType:              ' + s.type + '\nSelector:          ' + (Object.keys(s.selector).length ? Object.keys(s.selector).map((k2) => k2 + '=' + s.selector[k2]).join(',') : '<none>')
          + '\nPort:              ' + s.port + '/TCP\nTargetPort:        ' + s.targetPort + '\nEndpoints:         ' + (e.length ? e.map((p, i) => '10.1.2.' + (3 + i) + ':' + s.targetPort).join(',') : '<none>');
      }
      if (k === 'nodes') {
        const nd = c.nodes.find((x) => x.name === n);
        if (!nd) return 'Error from server (NotFound): nodes "' + n + '" not found';
        return 'Name:               ' + nd.name
          + '\nTaints:             ' + (nd.taints.length ? nd.taints.join(', ') : '<none>')
          + '\nUnschedulable:      ' + (nd.cordoned ? 'true' : 'false')
          + '\nConditions:'
          + '\n  Ready            ' + (nd.ready ? 'True' : 'False')
          + '\n  MemoryPressure   ' + (nd.memPressure ? 'True' : 'False')
          + '\n  DiskPressure     ' + (nd.diskPressure ? 'True' : 'False')
          + (nd.reason ? '\nEvents:\n  Warning  ' + nd.reason : '');
      }
      return 'error: resource not supported in this lab';
    }

    if (a[0] === 'logs') {
      const p = c.pods.find((x) => x.name === a[1]) || c.pods.find((x) => a[1] && x.name.indexOf(a[1]) === 0);
      if (!p) return 'Error from server (NotFound): pods "' + (a[1] || '') + '" not found';
      if (has('previous')) return p.prevLogs.length ? p.prevLogs.join('\n') : 'Error from server: previous terminated container not found';
      return p.logs.length ? p.logs.join('\n') : '';
    }

    if (a[0] === 'create' && kind(a[1]) === 'deployments') {
      const n = a[2], img = flag('image');
      if (!n || !img) return 'error: --image is required';
      if (c.deployments.find((d) => d.name === n)) return 'Error from server (AlreadyExists): deployments.apps "' + n + '" already exists';
      c.deployments.push({ name: n, replicas: +(flag('replicas') || 1), image: img, labels: { app: n }, container: n, probes: {}, resources: {}, rev: 1 });
      c.sync();
      return 'deployment.apps/' + n + ' created';
    }
    if (a[0] === 'run') {
      const n = a[1], img = flag('image');
      if (!n || !img) return 'error: --image is required';
      const labels = {};
      const l = flag('labels');
      if (l) l.split(',').forEach((kv) => { const [k2, v] = kv.split('='); labels[k2] = v; });
      c.pods.push({ name: n, status: 'Running', ready: true, restarts: 0, node: c.nodes[0].name, labels: labels, image: img, container: n, logs: ['level=info msg="listening"'], prevLogs: [] });
      return 'pod/' + n + ' created';
    }
    if (a[0] === 'scale') {
      const m = cmd.match(/deployment(?:\.apps)?[\/ ]([\w-]+)/);
      const r = flag('replicas');
      if (!m || r === null) return 'error: --replicas is required';
      const d = c.deployments.find((x) => x.name === m[1]);
      if (!d) return 'Error from server (NotFound): deployments "' + m[1] + '" not found';
      d.replicas = +r; c.sync();
      return 'deployment.apps/' + d.name + ' scaled';
    }
    if (a[0] === 'set' && a[1] === 'image') {
      const m = cmd.match(/deployment(?:\.apps)?[\/ ]([\w-]+)\s+([\w-]+)=(\S+)/);
      if (!m) return 'error: format: kubectl set image deployment/<nom> <container>=<image>';
      const d = c.deployments.find((x) => x.name === m[1]);
      if (!d) return 'Error from server (NotFound): deployments "' + m[1] + '" not found';
      d.image = m[3]; d.rev++;
      c.pods = c.pods.filter((p) => p.owner !== d.name); c.sync();
      return 'deployment.apps/' + d.name + ' image updated';
    }
    if (a[0] === 'expose' && kind(a[1]) === 'deployments') {
      const d = c.deployments.find((x) => x.name === a[2]);
      if (!d) return 'Error from server (NotFound): deployments "' + (a[2] || '') + '" not found';
      const name = flag('name') || d.name;
      c.services.push({ name: name, type: flag('type') || 'ClusterIP', port: +(flag('port') || 80), targetPort: +(flag('target-port') || flag('port') || 80), selector: Object.assign({}, d.labels) });
      return 'service/' + name + ' exposed';
    }
    if (a[0] === 'delete') {
      const k = kind(a[1]), n = a[2];
      if (k === 'pods') {
        const i = c.pods.findIndex((p) => p.name === n);
        if (i < 0) return 'Error from server (NotFound): pods "' + n + '" not found';
        const p = c.pods[i];
        if ((p.finalizers && p.finalizers.length) || (p.node && !(c.nodes.find((x) => x.name === p.node) || { ready: true }).ready)) {
          p.status = 'Terminating'; p.ready = false;
          if (has('force')) { c.pods.splice(i, 1); c.sync(); return 'warning: Immediate deletion does not wait for confirmation that the running resource has been terminated.\npod "' + n + '" force deleted'; }
          return 'pod "' + n + '" deleted\n... Terminating holatida qoldi (describe bilan sababni ko' + "'" + 'ring)';
        }
        c.pods.splice(i, 1); c.sync(); return 'pod "' + n + '" deleted';
      }
      if (k === 'deployments') { const i = c.deployments.findIndex((d) => d.name === n); if (i < 0) return 'Error from server (NotFound): deployments "' + n + '" not found'; c.pods = c.pods.filter((p) => p.owner !== n); c.deployments.splice(i, 1); return 'deployment.apps "' + n + '" deleted'; }
      if (k === 'services') { const i = c.services.findIndex((s) => s.name === n); if (i < 0) return 'Error from server (NotFound): services "' + n + '" not found'; c.services.splice(i, 1); return 'service "' + n + '" deleted'; }
      return 'error: resource not supported in this lab';
    }
    if (a[0] === 'label') {
      const k = kind(a[1]), n = a[2], kv = a[3];
      if (!kv || kv.indexOf('=') < 0) return 'error: format: kubectl label pod <nom> kalit=qiymat';
      const [lk, lv] = kv.split('=');
      if (k === 'pods') { const p = c.pods.find((x) => x.name === n); if (!p) return 'Error from server (NotFound): pods "' + n + '" not found'; p.labels[lk] = lv; return 'pod/' + n + ' labeled'; }
      if (k === 'deployments') { const d = c.deployments.find((x) => x.name === n); if (!d) return 'Error from server (NotFound): deployments "' + n + '" not found'; d.labels[lk] = lv; c.pods.filter((p) => p.owner === n).forEach((p) => { p.labels[lk] = lv; }); return 'deployment.apps/' + n + ' labeled'; }
      return 'error: resource not supported in this lab';
    }
    if (a[0] === 'patch' && a[1] === 'pod' && cmd.indexOf('finalizers') > 0) {
      const p = c.pods.find((x) => x.name === a[2]);
      if (!p) return 'Error from server (NotFound): pods "' + (a[2] || '') + '" not found';
      p.finalizers = [];
      if (p.status === 'Terminating') { c.pods = c.pods.filter((x) => x !== p); c.sync(); }
      return 'pod/' + p.name + ' patched';
    }
    if (a[0] === 'patch' || a[0] === 'edit') {
      return 'Bu mashqda edit/patch yo\'q. O\'rniga: set image · scale · label · lab-set (quyidagi yordamni ko\'ring).';
    }
    if (a[0] === 'taint' && kind(a[1]) === 'nodes') {
      const nd = c.nodes.find((x) => x.name === a[2]);
      if (!nd) return 'Error from server (NotFound): nodes "' + (a[2] || '') + '" not found';
      if (a[3] && a[3].slice(-1) === '-') { nd.taints = []; c.resched(); c.sync(); return 'node/' + nd.name + ' untainted'; }
      nd.taints.push(a[3] || 'key=value:NoSchedule'); c.sync();
      return 'node/' + nd.name + ' tainted';
    }
    if (a[0] === 'rollout') {
      const m = cmd.match(/deployment(?:\.apps)?[\/ ]([\w-]+)/);
      const d = m && c.deployments.find((x) => x.name === m[1]);
      if (!d) return 'error: deployment topilmadi';
      if (a[1] === 'status') return 'deployment "' + d.name + '" successfully rolled out';
      if (a[1] === 'undo') { d.image = d.prevImage || d.image; d.rev++; return 'deployment.apps/' + d.name + ' rolled back'; }
      if (a[1] === 'restart') { c.pods = c.pods.filter((p) => p.owner !== d.name); c.sync(); return 'deployment.apps/' + d.name + ' restarted'; }
      if (a[1] === 'history') return 'REVISION  CHANGE-CAUSE\n' + Array.from({ length: d.rev }, (_, i) => pad(i + 1, 10) + '<none>').join('\n');
    }
    /* mashq uchun qo'shimcha: probe va resources qo'yish */
    if (a[0] === 'lab-set') {
      const d = c.deployments.find((x) => x.name === a[2]);
      if (!d) return 'error: deployment topilmadi. Format: lab-set probe <deploy> readiness · lab-set resources <deploy> 128Mi 512Mi';
      if (a[1] === 'probe') { d.probes[a[3] || 'readiness'] = { path: '/healthz', timeoutSeconds: +(flag('timeout') || 1), failureThreshold: +(flag('threshold') || 3) }; return a[3] + ' probe qo\'shildi: ' + d.name; }
      if (a[1] === 'resources') { d.resources = { requests: { memory: a[3] || '128Mi' }, limits: { memory: a[4] || '512Mi' } }; c.pods.filter((p) => p.owner === d.name).forEach((p) => { p.resources = d.resources; }); return 'resources qo\'yildi: ' + d.name; }
      return 'error: lab-set probe|resources';
    }
    if (a[0] === 'cordon' || a[0] === 'uncordon') {
      const nd = c.nodes.find((x) => x.name === a[1]);
      if (!nd) return 'Error from server (NotFound): nodes "' + (a[1] || '') + '" not found';
      nd.cordoned = a[0] === 'cordon';
      if (!nd.cordoned) { c.resched(); c.sync(); }
      return 'node/' + nd.name + (nd.cordoned ? ' cordoned' : ' uncordoned');
    }
    if (a[0] === 'drain') {
      const nd = c.nodes.find((x) => x.name === a[1]);
      if (!nd) return 'Error from server (NotFound): nodes "' + (a[1] || '') + '" not found';
      nd.cordoned = true;
      const on = c.pods.filter((p) => p.node === nd.name);
      const ds = on.filter((p) => p.daemon);
      if (ds.length && !has('ignore-daemonsets')) return 'error: cannot delete DaemonSet-managed Pods (use --ignore-daemonsets)';
      const movable = on.filter((p) => !p.daemon);
      const blocked = (c.pdbs || []).filter((pb) => { const live = c.pods.filter((p) => p.ready && p.labels.app === pb.app).length; return movable.some((p) => p.labels.app === pb.app) && live - 1 < pb.minAvailable; });
      if (blocked.length) return 'evicting pod ' + (movable[0] ? movable[0].name : '') + '\nerror when evicting pod: Cannot evict pod as it would violate the pod' + "'" + 's disruption budget.\n(PDB: ' + blocked[0].name + ', minAvailable: ' + blocked[0].minAvailable + ')\n... kutilmoqda';
      const other = c.nodes.find((x) => x.name !== nd.name && x.ready && !x.cordoned);
      if (!other && movable.length) return 'evicting pod ' + movable[0].name + '\nerror: no other node available to reschedule';
      movable.forEach((p) => { p.node = other.name; });
      nd.drained = true;
      return 'node/' + nd.name + ' drained';
    }
    if (a[0] === 'help' || a[0] === '--help') {
      return 'Mashqda ishlaydigan buyruqlar:\n'
        + '  get pods|deploy|svc|endpoints|nodes|cm|secrets [-o wide]\n'
        + '  describe pod|deploy|svc|node <nom>\n'
        + '  logs <pod> [--previous]\n'
        + '  create deployment <nom> --image=<img> [--replicas=n]\n'
        + '  run <nom> --image=<img> [--labels=k=v]\n'
        + '  scale deployment/<nom> --replicas=n\n'
        + '  set image deployment/<nom> <container>=<img>\n'
        + '  expose deployment <nom> --port=n [--target-port=n] [--name=x]\n'
        + '  label pod|deploy <nom> k=v\n'
        + '  delete pod|deploy|svc <nom>\n'
        + '  taint nodes <nom> key=value:NoSchedule  (olib tashlash: key-)\n'
        + '  rollout status|undo|restart|history deployment/<nom>\n'
        + '  lab-set probe <deploy> readiness|liveness|startup\n'
        + '  lab-set resources <deploy> <request> <limit>\n'
        + '  get pdb · cordon/uncordon <node> · drain <node> [--ignore-daemonsets]\n'
        + '  get events · top pods|nodes · exec <pod> -- curl|nslookup|env ...\n'
        + '  patch pod <nom> -p ' + JSON.stringify({ metadata: { finalizers: null } });
    }
    if (a[0] === 'exec') {
      const dd = a.indexOf('--');
      const pn = a.slice(1, dd > 0 ? dd : a.length).filter((x) => !/^-/.test(x))[0];
      const p = c.pods.find((x) => x.name === pn) || c.pods.find((x) => pn && x.name.indexOf(pn) === 0);
      if (!p) return 'Error from server (NotFound): pods "' + (pn || '') + '" not found\n(avval: kubectl run ' + (pn || 'test') + ' --image=busybox)';
      const inner = dd > 0 ? a.slice(dd + 1) : [];
      if (!inner.length) return 'error: you must specify at least one command for the container';
      if (inner[0] === 'curl' || inner[0] === 'wget') {
        const host = (inner.find((x) => !/^-/.test(x) && x !== inner[0]) || '').replace(/^https?:\/\//, '').split(/[:\/]/)[0];
        const s = c.services.find((x) => x.name === host || host.indexOf(x.name + '.') === 0);
        if (!s) return 'curl: (6) Could not resolve host: ' + host;
        if (!c.eps(s).length) return 'curl: (7) Failed to connect to ' + host + ' port ' + s.port + ': Connection refused (endpoints bo\'sh)';
        return 'HTTP/1.1 200 OK\nServer: nginx\nContent-Type: text/html';
      }
      if (inner[0] === 'nslookup' || inner[0] === 'getent') {
        const host = inner[inner.length - 1];
        const s = c.services.find((x) => x.name === host.split('.')[0]);
        return s ? 'Name:    ' + s.name + '.default.svc.cluster.local\nAddress: 10.96.' + (s.name.length * 7 % 200) + '.10' : "** server can't find " + host + ': NXDOMAIN';
      }
      if (inner[0] === 'env' || inner[0] === 'printenv') return 'HOSTNAME=' + p.name + '\nKUBERNETES_SERVICE_HOST=10.96.0.1\n' + c.configmaps.map((m) => Object.keys(m.data || {}).map((k2) => k2 + '=' + m.data[k2]).join('\n')).filter(Boolean).join('\n');
      if (inner[0] === 'cat' || inner[0] === 'ls' || inner[0] === 'sh' || inner[0] === 'bash') return '(' + p.name + ' ichida) ' + inner.join(' ');
      return 'OCI runtime exec: ' + inner[0] + ': executable file not found in $PATH';
    }
    if (a[0] === 'top') {
      if (/^nodes?$/.test(a[1] || '')) return 'NAME        CPU(cores)  CPU%  MEMORY(bytes)  MEMORY%\n' + c.nodes.map((n) => pad(n.name, 12) + pad(n.ready ? '410m' : '<unknown>', 12) + pad(n.ready ? '21%' : '', 6) + pad(n.ready ? '2310Mi' : '<unknown>', 15) + (n.ready ? '60%' : '')).join('\n');
      if (!c.pods.length) return 'No resources found in default namespace.';
      return pad('NAME', 30) + pad('CPU(cores)', 12) + 'MEMORY(bytes)\n' + c.pods.map((p) => pad(p.name, 30) + pad(p.ready ? (12 + p.name.length * 3) + 'm' : '0m', 12) + (p.ready ? (60 + p.name.length * 5) + 'Mi' : '0Mi')).join('\n');
    }
    return 'error: unknown command "' + a[0] + '" — \'kubectl help\' deb ko\'ring';
  }

  /* ---------- mashqlar ---------- */
  const LABS = {
    'pod-create': { title: 'Pod yaratish va tekshirish', section: '7-bo\'lim',
      init: { pods: [], deployments: [], services: [] },
      tasks: [
        { t: 'nginx:1.25 image bilan `web` nomli Pod yarating', v: (c) => !!c.pods.find((p) => p.name === 'web' && p.image.indexOf('nginx') === 0), hint: 'kubectl run web --image=nginx:1.25' },
        { t: '`web` Podiga `app=web` label qo\'shing', v: (c) => { const p = c.pods.find((x) => x.name === 'web'); return !!p && p.labels.app === 'web'; }, hint: 'kubectl label pod web app=web' },
        { t: 'Pod qaysi node\'da ishlayotganini ko\'ring', v: (c, h) => h.some((x) => /get pods.*-o wide|describe pod/.test(x)), hint: 'kubectl get pods -o wide' },
      ] },
    'deploy-scale': { title: 'Deployment va scaling', section: '10-bo\'lim',
      init: { deployments: [{ name: 'backend', replicas: 2, image: 'nginx:1.25', labels: { app: 'backend' }, container: 'backend' }] },
      tasks: [
        { t: '`backend` Deployment\'ini 5 replicaga masshtablang', v: (c) => { const d = c.deployments.find((x) => x.name === 'backend'); return !!d && d.replicas === 5; }, hint: 'kubectl scale deployment/backend --replicas=5' },
        { t: 'Pod soni haqiqatan 5 ga yetganini tekshiring', v: (c, h) => c.pods.filter((p) => p.owner === 'backend').length === 5 && h.some((x) => /get pods|get deploy/.test(x)), hint: 'kubectl get pods' },
        { t: '`frontend` nomli yangi Deployment yarating (image: nginx:1.25, 3 replica)', v: (c) => { const d = c.deployments.find((x) => x.name === 'frontend'); return !!d && d.replicas === 3; }, hint: 'kubectl create deployment frontend --image=nginx:1.25 --replicas=3' },
      ] },
    'self-heal': { title: 'Self-healing — Podni o\'chirib ko\'ring', section: '11-bo\'lim',
      init: { deployments: [{ name: 'api', replicas: 3, image: 'nginx:1.25', labels: { app: 'api' }, container: 'api' }] },
      tasks: [
        { t: '`api` Deployment\'ining bitta Podini o\'chiring', v: (c, h) => h.some((x) => /delete pods?\s+api-/.test(x)), hint: 'kubectl get pods → keyin: kubectl delete pod api-xxxxx' },
        { t: 'Pod soni yana 3 ga qaytganini tekshiring (reconcile)', v: (c, h) => c.pods.filter((p) => p.owner === 'api').length === 3 && h.some((x) => /delete pods?\s+api-/.test(x)) && h.some((x) => /get pods/.test(x)), hint: 'kubectl get pods' },
        { t: 'Deployment\'ni butunlay o\'chirsangiz Podlar ham ketadi — sinab ko\'ring', v: (c) => !c.deployments.find((d) => d.name === 'api') && !c.pods.filter((p) => p.owner === 'api').length, hint: 'kubectl delete deployment api' },
      ] },
    'svc-expose': { title: 'Service yaratish va endpoints', section: '12–13-bo\'lim',
      init: { deployments: [{ name: 'backend', replicas: 2, image: 'nginx:1.25', labels: { app: 'backend' }, container: 'backend' }] },
      tasks: [
        { t: '`backend` Deployment\'ini 8080 portda ClusterIP Service qilib ochib bering', v: (c) => { const s = c.services.find((x) => x.name === 'backend'); return !!s && s.port === 8080; }, hint: 'kubectl expose deployment backend --port=8080' },
        { t: 'Service ortidagi endpoints ro\'yxatini ko\'ring — bo\'sh emasligini tekshiring', v: (c, h) => { const s = c.services.find((x) => x.name === 'backend'); return !!s && c.eps(s).length > 0 && h.some((x) => /get (ep|endpoints)|describe svc/.test(x)); }, hint: 'kubectl get endpoints' },
      ] },
    'svc-broken': { title: 'Buzilgan Service — endpoints bo\'sh', section: '13-bo\'lim',
      init: { deployments: [{ name: 'shop', replicas: 2, image: 'nginx:1.25', labels: { app: 'shop-api' }, container: 'shop' }],
        services: [{ name: 'shop', selector: { app: 'shop' }, port: 80, targetPort: 80 }] },
      tasks: [
        { t: '`shop` Service\'ining endpoints bo\'sh ekanini tasdiqlang', v: (c, h) => h.some((x) => /get (ep|endpoints)|describe svc/.test(x)), hint: 'kubectl get endpoints' },
        { t: 'Sababni toping: Service selector va Pod labellarini solishtiring', v: (c, h) => h.some((x) => /describe svc|describe service/.test(x)) && h.some((x) => /describe pod|get pods/.test(x)), hint: 'kubectl describe svc shop, keyin kubectl describe pod shop-xxxxx' },
        { t: 'Label qo\'shib tuzating — endpoints to\'lishi kerak', v: (c) => { const s = c.services.find((x) => x.name === 'shop'); return !!s && c.eps(s).length > 0; }, hint: 'kubectl label deployment shop app=shop  (yoki Service selector\'ini moslang)' },
      ] },
    'crash-debug': { title: 'CrashLoopBackOff — sababni toping', section: '9-bo\'lim',
      init: { pods: [{ name: 'payments-7c9f', owner: null, status: 'CrashLoopBackOff', ready: false, restarts: 9, labels: { app: 'payments' }, image: 'payments:2.1', container: 'payments',
        logs: [], prevLogs: ['level=fatal msg="config file not found: /etc/app/config.yaml"', 'exit status 1'] }] },
      tasks: [
        { t: '`payments-7c9f` Podining hozirgi logini ko\'ring — bo\'sh chiqadi', v: (c, h) => h.some((x) => /logs payments-7c9f(?!.*--previous)/.test(x)), hint: 'kubectl logs payments-7c9f' },
        { t: 'O\'lgan containerning logini oching va haqiqiy sababni toping', v: (c, h) => h.some((x) => /logs payments-7c9f.*--previous/.test(x)), hint: 'kubectl logs payments-7c9f --previous' },
        { t: 'Restart soni va holatni describe bilan tasdiqlang', v: (c, h) => h.some((x) => /describe pod payments-7c9f/.test(x)), hint: 'kubectl describe pod payments-7c9f' },
      ] },
    'pending-debug': { title: 'Pod Pending — taint va scheduling', section: '8 va 20-bo\'lim',
      init: { nodes: [{ name: 'node-1', ready: true, taints: ['gpu=true:NoSchedule'] }],
        deployments: [{ name: 'trainer', replicas: 2, image: 'trainer:1.0', labels: { app: 'trainer' }, container: 'trainer' }] },
      tasks: [
        { t: 'Podlar nega Pending ekanini describe bilan aniqlang', v: (c, h) => h.some((x) => /describe pod/.test(x)), hint: 'kubectl get pods → kubectl describe pod trainer-xxxxx' },
        { t: 'Node\'dagi taint\'ni ko\'ring', v: (c, h) => h.some((x) => /describe node/.test(x)), hint: 'kubectl describe node node-1' },
        { t: 'Taint\'ni olib tashlang — Podlar Running bo\'lishi kerak', v: (c) => c.nodes.every((n) => !n.taints.length) && c.pods.filter((p) => p.owner === 'trainer' && p.status === 'Running').length === 2, hint: 'kubectl taint nodes node-1 gpu-' },
      ] },
    'rollout-lab': { title: 'Rolling update va rollback', section: '10-bo\'lim',
      init: { deployments: [{ name: 'web', replicas: 3, image: 'nginx:1.24', labels: { app: 'web' }, container: 'web', prevImage: 'nginx:1.24' }] },
      tasks: [
        { t: '`web` Deployment image\'ini nginx:1.26 ga yangilang', v: (c) => { const d = c.deployments.find((x) => x.name === 'web'); return !!d && d.image === 'nginx:1.26'; }, hint: 'kubectl set image deployment/web web=nginx:1.26' },
        { t: 'Yangilanish tugaganini tekshiring', v: (c, h) => h.some((x) => /rollout status/.test(x)), hint: 'kubectl rollout status deployment/web' },
        { t: 'Revision tarixini ko\'ring', v: (c, h) => h.some((x) => /rollout history/.test(x)), hint: 'kubectl rollout history deployment/web' },
        { t: 'Oldingi versiyaga qaytaring', v: (c, h) => h.some((x) => /rollout undo/.test(x)), hint: 'kubectl rollout undo deployment/web' },
      ] },
    'probe-lab': { title: 'Probe qo\'shish', section: '15–16-bo\'lim',
      init: { deployments: [{ name: 'api', replicas: 2, image: 'api:1.0', labels: { app: 'api' }, container: 'api' }] },
      tasks: [
        { t: '`api` Deployment\'iga readiness probe qo\'shing', v: (c) => { const d = c.deployments.find((x) => x.name === 'api'); return !!d && !!d.probes.readiness; }, hint: 'lab-set probe api readiness' },
        { t: 'Sekin ishga tushadigan dastur uchun startup probe ham qo\'shing', v: (c) => { const d = c.deployments.find((x) => x.name === 'api'); return !!d && !!d.probes.startup; }, hint: 'lab-set probe api startup' },
        { t: 'Probe sozlamalarini describe bilan tasdiqlang', v: (c, h) => h.some((x) => /describe deploy/.test(x)), hint: 'kubectl describe deployment api' },
      ] },
    'res-lab': { title: 'Request va limit qo\'yish', section: '19-bo\'lim',
      init: { deployments: [{ name: 'worker', replicas: 2, image: 'worker:1.0', labels: { app: 'worker' }, container: 'worker' }] },
      tasks: [
        { t: '`worker` uchun request 128Mi, limit 512Mi qo\'ying', v: (c) => { const d = c.deployments.find((x) => x.name === 'worker'); return !!d && d.resources.requests && d.resources.requests.memory === '128Mi' && d.resources.limits.memory === '512Mi'; }, hint: 'lab-set resources worker 128Mi 512Mi' },
        { t: 'Podda qo\'llanganini describe bilan tekshiring', v: (c, h) => h.some((x) => /describe pod/.test(x)), hint: 'kubectl describe pod worker-xxxxx' },
      ] },
    'chain-lab': { title: 'To\'liq zanjir — noldan Ingress backendigacha', section: '21–22-bo\'lim',
      init: { deployments: [], services: [] },
      tasks: [
        { t: '`shop` Deployment yarating (image: shop:1.0, 3 replica)', v: (c) => { const d = c.deployments.find((x) => x.name === 'shop'); return !!d && d.replicas === 3; }, hint: 'kubectl create deployment shop --image=shop:1.0 --replicas=3' },
        { t: 'Uni 8080 portda Service qilib ochib bering', v: (c) => { const s = c.services.find((x) => x.name === 'shop'); return !!s && s.port === 8080; }, hint: 'kubectl expose deployment shop --port=8080' },
        { t: 'Endpoints to\'lganini tasdiqlang (Ingress backendga yetadi)', v: (c, h) => { const s = c.services.find((x) => x.name === 'shop'); return !!s && c.eps(s).length === 3 && h.some((x) => /get (ep|endpoints)/.test(x)); }, hint: 'kubectl get endpoints' },
        { t: 'Zanjirni oxirigacha tekshiring: deployment → pods → endpoints', v: (c, h) => ['get deploy', 'get pods', 'get endpoints'].every((k) => h.some((x) => x.indexOf(k) >= 0)), hint: 'kubectl get deploy · get pods · get endpoints' },
      ] },
  };

  Object.assign(LABS, {
    'stuck-term': { title: 'Terminating' + "'" + 'da qotib qolgan Pod', section: '31-bo' + "'" + 'lim',
      init: { nodes: [{ name: 'node-1', ready: true, taints: [] }, { name: 'node-2', ready: false, taints: [], reason: 'NodeNotReady  kubelet stopped posting node status' }],
        pods: [{ name: 'cache-0', node: 'node-2', labels: { app: 'cache' }, finalizers: ['kubernetes.io/pvc-protection'], grace: 30, image: 'redis:7', container: 'cache' }] },
      tasks: [
        { t: '`cache-0` Podini o' + "'" + 'chirishga urinib ko' + "'" + 'ring', v: (c, h) => h.some((x) => /delete pods? cache-0(?!.*--force)/.test(x)), hint: 'kubectl delete pod cache-0' },
        { t: 'Nega Terminating' + "'" + 'da qolganini describe bilan aniqlang (finalizer va node)', v: (c, h) => h.some((x) => /describe pod cache-0/.test(x)), hint: 'kubectl describe pod cache-0' },
        { t: 'Node holatini tekshiring — aloqa bormi?', v: (c, h) => h.some((x) => /get nodes|describe node/.test(x)), hint: 'kubectl get nodes' },
        { t: 'Finalizer' + "'" + 'ni tozalab Podni chiqarib yuboring', v: (c) => !c.pods.find((p) => p.name === 'cache-0'), hint: 'kubectl patch pod cache-0 -p {"metadata":{"finalizers":null}}   (yoki --force, lekin sababni bilib)' },
      ] },
    'drain-pdb': { title: 'Drain tugamayapti — PDB', section: '27 va 31-bo' + "'" + 'lim',
      init: { nodes: [{ name: 'node-1', ready: true, taints: [] }, { name: 'node-2', ready: true, taints: [] }],
        deployments: [{ name: 'api', replicas: 3, image: 'api:1.0', labels: { app: 'api' }, container: 'api' }],
        pdbs: [{ name: 'api-pdb', app: 'api', minAvailable: 3 }] },
      tasks: [
        { t: '`node-1` nodeni drain qilishga urinib ko' + "'" + 'ring', v: (c, h) => h.some((x) => /^drain node-1/.test(x)), hint: 'kubectl drain node-1 --ignore-daemonsets' },
        { t: 'Nega to' + "'" + 'xtaganini PDB orqali aniqlang', v: (c, h) => h.some((x) => /get pdb|get poddisruptionbudget/.test(x)), hint: 'kubectl get pdb' },
        { t: 'Replica sonini oshirib PDB' + "'" + 'ga bo' + "'" + 'sh joy bering (masalan 4)', v: (c) => { const d = c.deployments.find((x) => x.name === 'api'); return !!d && d.replicas >= 4; }, hint: 'kubectl scale deployment/api --replicas=4' },
        { t: 'Endi drain muvaffaqiyatli tugashi kerak', v: (c) => { const n = c.nodes.find((x) => x.name === 'node-1'); return !!n && n.drained; }, hint: 'kubectl drain node-1 --ignore-daemonsets' },
      ] },
    'node-debug': { title: 'Node NotReady — ta' + "'" + 'sir doirasini toping', section: '32-bo' + "'" + 'lim',
      init: { nodes: [{ name: 'node-1', ready: true, taints: [] }, { name: 'node-2', ready: false, taints: [], diskPressure: true, reason: 'DiskPressure  disk usage 94%, image garbage collection failed' }],
        deployments: [{ name: 'web', replicas: 4, image: 'nginx:1.25', labels: { app: 'web' }, container: 'web' }] },
      tasks: [
        { t: 'Qaysi node NotReady ekanini toping', v: (c, h) => h.some((x) => /get nodes/.test(x)), hint: 'kubectl get nodes' },
        { t: 'Node shartlarini (Conditions) o' + "'" + 'qib sababni aniqlang', v: (c, h) => h.some((x) => /describe node node-2/.test(x)), hint: 'kubectl describe node node-2' },
        { t: 'Ta' + "'" + 'sir doirasini ko' + "'" + 'ring — qaysi Podlar shu nodeda', v: (c, h) => h.some((x) => /get pods.*-o wide/.test(x)), hint: 'kubectl get pods -o wide' },
        { t: 'Nodeni cordon qilib yangi Pod tushishini to' + "'" + 'xtating', v: (c) => { const n = c.nodes.find((x) => x.name === 'node-2'); return !!n && n.cordoned; }, hint: 'kubectl cordon node-2' },
      ] },
    'err-dict': { title: 'Xato xabarlarini tanib olish', section: '29-bo' + "'" + 'lim',
      init: { pods: [
        { name: 'shop-a1', status: 'ImagePullBackOff', ready: false, restarts: 0, labels: { app: 'shop' }, image: 'shop:2.9-typo', container: 'shop', logs: [], prevLogs: [] },
        { name: 'shop-b2', status: 'CrashLoopBackOff', ready: false, restarts: 7, labels: { app: 'shop' }, image: 'shop:2.8', container: 'shop', logs: [], prevLogs: ['level=fatal msg="DATABASE_URL is empty"', 'exit status 1'] },
        { name: 'shop-c3', status: 'OOMKilled', ready: false, restarts: 3, labels: { app: 'shop' }, image: 'shop:2.8', container: 'shop', resources: { requests: { memory: '64Mi' }, limits: { memory: '64Mi' } }, logs: [], prevLogs: ['signal: killed'] } ] },
      tasks: [
        { t: 'Uch Podning holatini ko' + "'" + 'rib chiqing', v: (c, h) => h.some((x) => /get pods/.test(x)), hint: 'kubectl get pods' },
        { t: '`shop-a1` — ImagePullBackOff sababini describe bilan toping', v: (c, h) => h.some((x) => /describe pod shop-a1/.test(x)), hint: 'kubectl describe pod shop-a1 → image nomiga qarang' },
        { t: '`shop-b2` — CrashLoop sababini o' + "'" + 'lgan container logidan toping', v: (c, h) => h.some((x) => /logs shop-b2.*--previous/.test(x)), hint: 'kubectl logs shop-b2 --previous' },
        { t: '`shop-c3` — OOMKilled uchun limitni tekshiring', v: (c, h) => h.some((x) => /describe pod shop-c3/.test(x)), hint: 'kubectl describe pod shop-c3 → Limits: memory' },
      ] },
  });

  /* ---------- UI ---------- */
  function mount(host, id) {
    const spec = typeof id === 'string' ? LABS[id] : id;
    if (!spec) return;
    let c = new Cluster(JSON.parse(JSON.stringify(spec.init)));
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
    const out = el('pre', `font:400 12.5px/1.6 ${MO};background:var(--bg2);border:1px solid rgb(var(--ink-rgb) / 0.1);padding:11px 13px;margin:0 0 10px;min-height:170px;max-height:300px;overflow:auto;color:var(--acc-deep);white-space:pre`);
    const line = el('div', 'display:flex;gap:8px;align-items:center');
    const inp = el('input', `flex:1 1 160px;background:var(--bg2);border:1px solid rgb(var(--ink-rgb) / 0.2);color:${INK};font:400 13px ${MO};padding:9px 11px;outline:none`);
    inp.type = 'text'; inp.placeholder = 'kubectl get pods';
    const ctl = el('div', 'display:flex;flex-wrap:wrap;gap:8px;margin-top:10px');
    const check = btn('✓ Tekshir', 'gr'), reset = btn('↻ Boshidan', 'gh'), help = btn('? Buyruqlar', 'gh');
    ctl.append(check, reset, help);
    right.append(out, line, ctl);
    line.append(el('span', `font:500 13px ${MO};color:${YE}`, '$'), inp);
    wrap.append(left, right);
    host.append(head, wrap);

    const say = (t) => { out.textContent += (out.textContent ? '\n' : '') + t + '\n'; out.scrollTop = out.scrollHeight; };
    const exec = (raw) => {
      if (!raw.trim()) return;
      hist.push(raw.trim().replace(/^kubectl\s+/, '').replace(/\s+/g, ' '));
      say('$ ' + (raw.trim().indexOf('lab-set') === 0 ? raw.trim() : 'kubectl ' + raw.trim().replace(/^kubectl\s+/, '')));
      let r;
      try { r = run(c, raw); } catch (e) { r = 'error: ' + e.message; }
      if (r) say(r);
      paint();
    };
    const paint = () => {
      taskList.innerHTML = '';
      let done = 0;
      spec.tasks.forEach((tk, i) => {
        let ok = false;
        try { ok = !!tk.v(c, hist); } catch (e) { ok = false; }
        if (ok) { doneSet[i] = true; }
        const fin = !!doneSet[i];
        if (fin) done++;
        const row = el('div', 'display:flex;gap:10px;align-items:flex-start');
        row.append(el('div', `font:500 13px ${MO};color:${fin ? GR : 'rgb(var(--ink-rgb) / 0.58)'};min-width:16px`, fin ? '✓' : (i + 1) + '.'));
        const body = el('div');
        body.append(el('div', `font:400 15.5px/1.5 ${NR};color:${fin ? GR : INK};text-wrap:pretty`, tk.t));
        const hintBtn = el('button', `background:transparent;border:0;padding:4px 0 0;cursor:pointer;color:rgb(var(--ink-rgb) / 0.63);font:400 12.5px ${SG};text-decoration:underline`, 'yordam');
        hintBtn.type = 'button';
        hintBtn.onclick = () => { hintBtn.replaceWith(el('div', `font:400 12.5px ${MO};color:${CY};padding-top:4px`, tk.hint)); };
        if (!fin) body.appendChild(hintBtn);
        row.appendChild(body);
        taskList.appendChild(row);
      });
      score.textContent = done + ' / ' + spec.tasks.length + ' bajarildi';
      score.style.color = done === spec.tasks.length ? GR : SUB;
    };
    inp.onkeydown = (e) => { if (e.key === 'Enter') { exec(inp.value); inp.value = ''; } };
    check.onclick = () => { paint(); const d = spec.tasks.filter((t, i) => doneSet[i]).length; say(d === spec.tasks.length ? '✓ Hamma vazifa bajarildi.' : '→ ' + d + '/' + spec.tasks.length + ' bajarildi. Qolganini vazifalar ro\'yxatidan ko\'ring.'); };
    reset.onclick = () => { c = new Cluster(JSON.parse(JSON.stringify(spec.init))); hist = []; Object.keys(doneSet).forEach((k) => delete doneSet[k]); out.textContent = ''; say('cluster boshidan tiklandi'); paint(); };
    help.onclick = () => exec('help');
    say('mashq clusteri tayyor — ' + spec.section + '.  \'kubectl get pods\' bilan boshlang, \'? Buyruqlar\' yordam beradi.');
    paint();
  }

  window.K8sLab = {
    newCluster: function (init) { return new Cluster(init || {}); },
    run: function (c, cmd) { return run(c, cmd); },
    mountSpec: function (host, spec) { if (host.dataset.mounted) return; host.dataset.mounted = '1'; try { mount(host, spec); } catch (e) { console.warn('seclab', e); } },
    mountAll: function () {
      document.querySelectorAll('[data-klab]').forEach((h) => { if (h.dataset.mounted) return; h.dataset.mounted = '1'; try { mount(h, h.dataset.klab); } catch (e) { console.warn('klab', h.dataset.klab, e); } });
    },
    ids: Object.keys(LABS),
  };
})();
