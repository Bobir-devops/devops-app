/* cicd-lab.js — CI/CD mashq muhiti: soxta git + pipeline + kubectl/helm/terraform.
   <div data-clab="ID"></div> ... window.CicdLab.mountAll() */
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
  const sha = () => Math.random().toString(16).slice(2, 9);

  function run(bx, raw) {
    const cmd = raw.trim().replace(/\s+/g, ' ');
    if (!cmd) return '';
    const a = cmd.split(' ');
    const has = (f) => a.indexOf(f) >= 0;
    const argOf = (f) => { const i = a.indexOf(f); return i >= 0 ? a[i + 1] : null; };

    if (a[0] === 'help' || a[0] === '--help') {
      return 'Mashqda ishlaydigan buyruqlar:\n'
        + '  git status · git add <fayl|.> · git commit -m "xabar" · git log [--oneline]\n'
        + '  git branch [nom] · git checkout [-b] <nom> · git diff · git push · git fetch · git pull\n'
        + '  git merge <branch> · git rebase <branch> · git revert <sha> · git reset --hard <sha>\n'
        + '  ci run · ci status · ci logs <bosqich>\n'
        + '  docker build -t <nom:teg> . · docker push <nom:teg>\n'
        + '  kubectl get pods|deploy · kubectl set image deploy/<d> app=<image>\n'
        + '  kubectl rollout status|undo deploy/<d> · kubectl describe pod <p> · kubectl logs <p>\n'
        + '  helm upgrade <rel> ./chart --set image.tag=<teg> · helm history <rel> · helm rollback <rel> <rev>\n'
        + '  terraform plan · terraform apply · terraform state list\n'
        + '  argocd app get <app> · argocd app sync <app>';
    }

    /* ---------- git ---------- */
    if (a[0] === 'git') {
      const g = bx.git;
      const sub = a[1];
      const br = () => g.branches[g.head];
      if (sub === 'status') {
        let out = 'On branch ' + g.head;
        const ahead = br().commits.length - (g.remote[g.head] || []).length;
        if (ahead > 0) out += '\nYour branch is ahead of \'origin/' + g.head + '\' by ' + ahead + ' commit(s).';
        if (g.staged.length) out += '\n\nChanges to be committed:\n' + g.staged.map((f) => '        modified:   ' + f).join('\n');
        if (g.dirty.length) out += '\n\nChanges not staged for commit:\n' + g.dirty.map((f) => '        modified:   ' + f).join('\n');
        if (!g.staged.length && !g.dirty.length) out += '\nnothing to commit, working tree clean';
        return out;
      }
      if (sub === 'add') {
        const f = a[2];
        if (!f) return 'Nothing specified, nothing added.';
        if (f === '.' || f === '-A') { g.staged = g.staged.concat(g.dirty); g.dirty = []; return ''; }
        if (g.dirty.indexOf(f) < 0) return "fatal: pathspec '" + f + "' did not match any files";
        g.dirty = g.dirty.filter((x) => x !== f); g.staged.push(f);
        return '';
      }
      if (sub === 'commit') {
        const m = cmd.match(/-m\s+["']?([^"']+)["']?/);
        if (!g.staged.length) return 'nothing to commit, working tree clean\n(avval "git add" qiling)';
        if (!m) return 'Aborting commit due to empty commit message.';
        const id = sha();
        br().commits.push({ sha: id, msg: m[1], files: g.staged.slice() });
        g.staged = [];
        return '[' + g.head + ' ' + id + '] ' + m[1];
      }
      if (sub === 'log') {
        const list = br().commits.slice().reverse();
        if (!list.length) return 'fatal: your current branch does not have any commits yet';
        if (has('--oneline')) return list.map((x) => x.sha + ' ' + x.msg).join('\n');
        return list.map((x) => 'commit ' + x.sha + '\nAuthor: ali <ali@example.com>\n\n    ' + x.msg).join('\n\n');
      }
      if (sub === 'diff') {
        const files = has('--staged') ? g.staged : g.dirty;
        if (!files.length) return '';
        return files.map((f) => 'diff --git a/' + f + ' b/' + f + '\n--- a/' + f + '\n+++ b/' + f + '\n@@ -1,3 +1,4 @@\n+    yangi qator').join('\n');
      }
      if (sub === 'branch') {
        if (a[2]) { if (!g.branches[a[2]]) g.branches[a[2]] = { commits: br().commits.slice() }; return ''; }
        return Object.keys(g.branches).map((n) => (n === g.head ? '* ' : '  ') + n).join('\n');
      }
      if (sub === 'checkout' || sub === 'switch') {
        const nb = has('-b') || has('-c');
        const name = a[a.length - 1];
        if (nb) { if (g.branches[name]) return "fatal: a branch named '" + name + "' already exists"; g.branches[name] = { commits: br().commits.slice() }; g.head = name; g.created = (g.created || []).concat([name]); return "Switched to a new branch '" + name + "'"; }
        if (!g.branches[name]) return "error: pathspec '" + name + "' did not match any file(s) known to git";
        g.head = name; return "Switched to branch '" + name + "'";
      }
      if (sub === 'push') {
        const ahead = br().commits.length - (g.remote[g.head] || []).length;
        if (ahead <= 0) return 'Everything up-to-date';
        g.remote[g.head] = br().commits.slice();
        g.pushed = (g.pushed || []).concat([g.head]);
        let out = 'To origin\n * [new/updated] ' + g.head + ' -> ' + g.head + ' (' + ahead + ' commit)';
        if (bx.ci) { bx.ci.triggered = true; bx.ci.stages = null; out += '\n(push trigger: pipeline navbatga qo\'yildi — "ci run" bilan ishga tushiring)'; }
        return out;
      }
      if (sub === 'fetch') { g.fetched = true; return g.incoming ? 'From origin\n   ' + g.incoming + '  main -> origin/main' : 'Everything up-to-date'; }
      if (sub === 'pull') { g.fetched = true; if (!g.incoming) return 'Already up to date.'; g.pulled = true; g.incoming = null; return 'Updating..\nFast-forward\n 1 file changed'; }
      if (sub === 'merge') {
        const src = a[2];
        if (!g.branches[src]) return 'merge: ' + src + ' - not something we can merge';
        if (g.conflictOn === src && !g.resolved) { g.inConflict = true; return 'Auto-merging ' + (g.conflictFile || 'app.py') + '\nCONFLICT (content): Merge conflict in ' + (g.conflictFile || 'app.py') + '\nAutomatic merge failed; fix conflicts and then commit the result.'; }
        br().commits.push({ sha: sha(), msg: "Merge branch '" + src + "'", files: [] });
        g.merged = (g.merged || []).concat([src]);
        return 'Merge made by the \'ort\' strategy.';
      }
      if (sub === 'rebase') {
        const onto = a[2];
        if (!g.branches[onto]) return 'fatal: invalid upstream \'' + onto + '\'';
        g.rebased = (g.rebased || []).concat([onto]);
        br().commits = g.branches[onto].commits.concat(br().commits.filter((x) => g.branches[onto].commits.indexOf(x) < 0).map((x) => ({ sha: sha(), msg: x.msg, files: x.files })));
        return 'Successfully rebased and updated refs/heads/' + g.head + '.';
      }
      if (sub === 'revert') {
        const id = a[a.length - 1];
        const t = br().commits.find((x) => x.sha === id);
        if (!t) return 'fatal: bad revision \'' + id + '\'';
        br().commits.push({ sha: sha(), msg: 'Revert "' + t.msg + '"', files: t.files });
        g.reverted = (g.reverted || []).concat([id]);
        return '[' + g.head + '] Revert "' + t.msg + '"';
      }
      if (sub === 'reset') {
        const id = a[a.length - 1];
        const i = br().commits.findIndex((x) => x.sha === id);
        if (i < 0) return 'fatal: ambiguous argument \'' + id + '\'';
        br().commits = br().commits.slice(0, i + 1);
        g.reset = true;
        return 'HEAD is now at ' + id;
      }
      if (sub === 'rm') { const f = a[a.length - 1]; g.removedFile = f; return "rm '" + f + "'\n(diqqat: fayl tarixda qoladi)"; }
      return 'git: \'' + sub + '\' is not a git command (mashqda) — \'help\' deb ko\'ring';
    }

    /* ---------- ci ---------- */
    if (a[0] === 'ci') {
      if (!bx.ci) return 'ci: bu mashqda pipeline yo\'q';
      const ci = bx.ci;
      if (a[1] === 'run') {
        const stages = ci.plan.map((s) => Object.assign({}, s));
        let failed = null;
        const lines = [];
        for (let i = 0; i < stages.length; i++) {
          const s = stages[i];
          if (failed) { s.state = 'skipped'; lines.push(pad(s.name, 20) + 'skipped'); continue; }
          const ok = ci.fixed && ci.fixed[s.name] ? true : !s.fails;
          s.state = ok ? 'passed' : 'failed';
          lines.push(pad(s.name, 20) + (ok ? '✓ passed  ' + (s.dur || '12s') : '✗ FAILED  ' + (s.dur || '8s')));
          if (!ok) failed = s.name;
        }
        ci.stages = stages;
        ci.failedStage = failed;
        ci.ran = (ci.ran || 0) + 1;
        if (!failed && ci.image) { bx.registry = (bx.registry || []).concat([ci.image]); }
        return lines.join('\n') + '\n\n' + (failed ? 'Pipeline FAILED at: ' + failed + '  ("ci logs ' + failed + '" bilan sababni ko\'ring)' : 'Pipeline PASSED — artifact: ' + (ci.image || 'app.jar'));
      }
      if (a[1] === 'status') {
        if (!ci.stages) return 'no pipeline run yet ("ci run")';
        return ci.stages.map((s) => pad(s.name, 20) + s.state).join('\n');
      }
      if (a[1] === 'logs') {
        const name = a[2];
        const s = ci.plan.find((x) => x.name === name);
        if (!s) return 'no such stage: ' + name;
        return (s.log || ['(log bo\'sh)']).join('\n');
      }
      if (a[1] === 'fix') { const name = a[2]; ci.fixed = ci.fixed || {}; ci.fixed[name] = true; return name + ' tuzatildi (mashq uchun) — "ci run" bilan qayta ishlatib ko\'ring'; }
      return 'ci: run / status / logs <bosqich> / fix <bosqich>';
    }

    /* ---------- docker ---------- */
    if (a[0] === 'docker') {
      if (a[1] === 'build') {
        const t = argOf('-t');
        if (!t) return 'docker build: -t bilan nom bering';
        if (/latest/.test(t) && bx.warnLatest) return 'Successfully tagged ' + t + '\n⚠ diqqat: latest o\'zgaruvchi ko\'rsatgich — prodda qaysi image ekani aniq bo\'lmaydi';
        bx.built = (bx.built || []).concat([t]);
        return 'Successfully built ' + sha() + '\nSuccessfully tagged ' + t;
      }
      if (a[1] === 'push') {
        const t = a[2];
        if (!t) return 'docker push: image nomini bering';
        if (!(bx.built || []).some((x) => x === t)) return 'An image does not exist locally with the tag: ' + t;
        bx.registry = (bx.registry || []).concat([t]);
        return 'The push refers to repository [' + t.split(':')[0] + ']\n' + t.split(':')[1] + ': digest: sha256:' + sha() + ' size: 1571';
      }
      if (a[1] === 'images') return pad('REPOSITORY:TAG', 34) + 'SIZE\n' + (bx.built || []).map((t) => pad(t, 34) + '142MB').join('\n');
      return 'docker: mashqda build / push / images';
    }

    /* ---------- kubectl ---------- */
    if (a[0] === 'kubectl') {
      const k = bx.k8s;
      if (!k) return 'kubectl: bu mashqda klaster yo\'q';
      if (a[1] === 'get') {
        if (/^pods?$/.test(a[2])) {
          return pad('NAME', 30) + pad('READY', 8) + pad('STATUS', 20) + pad('RESTARTS', 10) + 'AGE\n'
            + k.pods.map((p) => pad(p.name, 30) + pad(p.ready ? '1/1' : '0/1', 8) + pad(p.status, 20) + pad(p.restarts, 10) + (p.age || '2m')).join('\n');
        }
        if (/^deploy/.test(a[2])) {
          return pad('NAME', 18) + pad('READY', 8) + pad('UP-TO-DATE', 12) + pad('IMAGE', 30) + 'AGE\n'
            + k.deploys.map((d) => pad(d.name, 18) + pad(d.ready + '/' + d.replicas, 8) + pad(d.updated, 12) + pad(d.image, 30) + '5d').join('\n');
        }
        if (/^ep|^endpoints/.test(a[2])) {
          const ready = k.pods.filter((p) => p.ready);
          return pad('NAME', 18) + 'ENDPOINTS\n' + pad(k.deploys[0].name, 18) + (ready.length ? ready.map((p, i) => '10.1.0.' + (5 + i) + ':8080').join(',') : '<none>');
        }
        if (/^events?/.test(a[2])) return (k.events || ['(hodisa yo\'q)']).join('\n');
        return 'kubectl get: mashqda pods / deploy / endpoints / events';
      }
      if (a[1] === 'set' && a[2] === 'image') {
        const spec = a[4] || '';
        const img = spec.split('=')[1];
        const dname = (a[3] || '').split('/')[1] || k.deploys[0].name;
        const d = k.deploys.find((x) => x.name === dname);
        if (!d) return 'Error from server (NotFound): deployments.apps "' + dname + '" not found';
        if (!img) return 'error: image must be specified as CONTAINER=IMAGE';
        if (!(bx.registry || []).some((x) => x === img)) {
          d.prevImage = d.image; d.image = img; d.ready = 0; d.updated = 1;
          k.pods = [{ name: dname + '-' + sha().slice(0, 5), ready: false, status: 'ImagePullBackOff', restarts: 0 }].concat(k.pods.filter((p) => p.ready));
          k.events = (k.events || []).concat(['Warning  Failed  Failed to pull image "' + img + '": not found in registry']);
          return 'deployment.apps/' + dname + ' image updated\n(diqqat: image registryda topilmadi)';
        }
        d.prevImage = d.image; d.image = img; d.updated = d.replicas; d.ready = d.replicas;
        k.pods = Array.from({ length: d.replicas }, (_, i) => ({ name: dname + '-' + sha().slice(0, 5), ready: !d.crashOnNew, status: d.crashOnNew ? 'CrashLoopBackOff' : 'Running', restarts: d.crashOnNew ? 4 : 0 }));
        if (d.crashOnNew) { d.ready = 0; k.events = (k.events || []).concat(['Warning  BackOff  Back-off restarting failed container']); }
        k.deployed = (k.deployed || []).concat([img]);
        return 'deployment.apps/' + dname + ' image updated';
      }
      if (a[1] === 'rollout') {
        const dname = (a[3] || '').split('/')[1] || k.deploys[0].name;
        const d = k.deploys.find((x) => x.name === dname);
        if (!d) return 'Error from server (NotFound): deployment "' + dname + '" not found';
        if (a[2] === 'status') {
          if (d.ready < d.replicas) return 'Waiting for deployment "' + dname + '" rollout to finish: ' + d.ready + ' of ' + d.replicas + ' updated replicas are available...\nerror: deployment "' + dname + '" exceeded its progress deadline';
          return 'deployment "' + dname + '" successfully rolled out';
        }
        if (a[2] === 'undo') {
          if (!d.prevImage) return 'error: no rollout history found for deployment "' + dname + '"';
          d.image = d.prevImage; d.prevImage = null; d.ready = d.replicas; d.updated = d.replicas; d.crashOnNew = false;
          k.pods = Array.from({ length: d.replicas }, () => ({ name: dname + '-' + sha().slice(0, 5), ready: true, status: 'Running', restarts: 0 }));
          k.undone = true;
          return 'deployment.apps/' + dname + ' rolled back';
        }
        if (a[2] === 'history') return 'REVISION  CHANGE-CAUSE\n1         <none>\n2         image update';
        return 'kubectl rollout: status / undo / history';
      }
      if (a[1] === 'describe') {
        const p = k.pods.find((x) => x.name === a[3] || x.name.indexOf(a[3]) === 0) || k.pods[0];
        if (!p) return 'Error from server (NotFound): pods "' + a[3] + '" not found';
        return 'Name:     ' + p.name + '\nStatus:   ' + p.status + '\nRestarts: ' + p.restarts
          + '\nLast State:  Terminated\n  Exit Code: ' + (p.status === 'CrashLoopBackOff' ? '1' : p.status === 'OOMKilled' ? '137' : '0')
          + '\nEvents:\n' + (k.events || ['  (yo\'q)']).map((e) => '  ' + e).join('\n');
      }
      if (a[1] === 'logs') {
        const p = k.pods.find((x) => x.name === a[2] || x.name.indexOf(a[2]) === 0) || k.pods[0];
        if (!p) return 'Error from server (NotFound): pods "' + a[2] + '" not found';
        return (k.podLogs || ['(log bo\'sh)']).join('\n');
      }
      if (a[1] === 'apply') { k.applied = true; return 'deployment.apps/' + k.deploys[0].name + ' configured'; }
      if (a[1] === 'top') return pad('NAME', 30) + pad('CPU(cores)', 12) + 'MEMORY(bytes)\n' + k.pods.map((p) => pad(p.name, 30) + pad((p.cpu || 40) + 'm', 12) + (p.mem || 120) + 'Mi').join('\n');
      return 'kubectl: mashqda get / set image / rollout / describe / logs / apply / top';
    }

    /* ---------- helm ---------- */
    if (a[0] === 'helm') {
      const h = bx.helm;
      if (!h) return 'helm: bu mashqda release yo\'q';
      if (a[1] === 'upgrade' || a[1] === 'install') {
        const tag = (cmd.match(/image\.tag=([\w\.\-]+)/) || [])[1];
        if (!tag) return 'Error: --set image.tag=<teg> kerak';
        h.revisions.push({ rev: h.revisions.length + 1, tag: tag, status: 'deployed' });
        h.current = tag;
        h.upgraded = (h.upgraded || []).concat([tag]);
        return 'Release "' + h.name + '" has been upgraded. Happy Helming!\nREVISION: ' + h.revisions.length + '\nimage.tag: ' + tag;
      }
      if (a[1] === 'history') return pad('REVISION', 10) + pad('STATUS', 12) + 'DESCRIPTION\n' + h.revisions.map((r) => pad(r.rev, 10) + pad(r.status, 12) + 'image.tag=' + r.tag).join('\n');
      if (a[1] === 'rollback') {
        const rev = +a[3];
        const r = h.revisions.find((x) => x.rev === rev);
        if (!r) return 'Error: release: not found';
        h.revisions.push({ rev: h.revisions.length + 1, tag: r.tag, status: 'deployed' });
        h.current = r.tag; h.rolledBack = true;
        return 'Rollback was a success! Happy Helming!\nnow at image.tag=' + r.tag;
      }
      if (a[1] === 'list') return pad('NAME', 14) + pad('REVISION', 10) + 'APP VERSION\n' + pad(h.name, 14) + pad(h.revisions.length, 10) + h.current;
      return 'helm: mashqda upgrade / history / rollback / list';
    }

    /* ---------- terraform ---------- */
    if (a[0] === 'terraform' || a[0] === 'tf') {
      const t = bx.tf;
      if (!t) return 'terraform: bu mashqda konfiguratsiya yo\'q';
      if (a[1] === 'init') { t.inited = true; return 'Terraform has been successfully initialized!'; }
      if (a[1] === 'plan') {
        if (!t.inited) return 'Error: Backend initialization required — "terraform init" bajaring';
        t.planned = true;
        return 'Terraform will perform the following actions:\n'
          + t.pending.map((r) => '  # ' + r.addr + ' will be ' + r.action + '\n  ' + (r.action === 'destroyed' ? '- ' : '+ ') + 'resource "' + r.type + '"').join('\n')
          + '\n\nPlan: ' + t.pending.filter((r) => r.action === 'created').length + ' to add, '
          + t.pending.filter((r) => r.action === 'updated').length + ' to change, '
          + t.pending.filter((r) => r.action === 'destroyed').length + ' to destroy.'
          + (t.pending.some((r) => r.action === 'destroyed') ? '\n⚠ diqqat: destroy bor — apply qilishdan oldin diqqat bilan o\'qing' : '');
      }
      if (a[1] === 'apply') {
        if (!t.planned && !has('-auto-approve')) return 'Error: plan ko\'rilmadi — avval "terraform plan"';
        t.state = (t.state || []).concat(t.pending.filter((r) => r.action !== 'destroyed').map((r) => r.addr));
        t.applied = true;
        return 'Apply complete! Resources: ' + t.pending.filter((r) => r.action === 'created').length + ' added, '
          + t.pending.filter((r) => r.action === 'updated').length + ' changed, '
          + t.pending.filter((r) => r.action === 'destroyed').length + ' destroyed.';
      }
      if (a[1] === 'state' && a[2] === 'list') return (t.state || []).join('\n') || '(state bo\'sh)';
      return 'terraform: mashqda init / plan / apply / state list';
    }

    /* ---------- argocd ---------- */
    if (a[0] === 'argocd') {
      const ar = bx.argo;
      if (!ar) return 'argocd: bu mashqda ilova yo\'q';
      if (a[1] === 'app' && a[2] === 'get') {
        return 'Name:        ' + ar.name + '\nRepo:        ' + ar.repo + '\nTarget:      ' + ar.branch
          + '\nSync Status: ' + (ar.synced ? 'Synced' : 'OutOfSync')
          + '\nHealth:      ' + (ar.healthy ? 'Healthy' : 'Progressing')
          + (ar.synced ? '' : '\n\nDIFF:\n  Deployment/' + ar.name + '  image: ' + ar.live + ' → ' + ar.desired);
      }
      if (a[1] === 'app' && a[2] === 'sync') { ar.live = ar.desired; ar.synced = true; ar.healthy = true; ar.syncedByHand = true; return 'Application ' + ar.name + ' synced\nimage now: ' + ar.live; }
      if (a[1] === 'app' && a[2] === 'history') return 'ID  REVISION\n1   ' + (ar.prevSha || 'a1b2c3d') + '\n2   ' + (ar.sha || '8f31c2a');
      return 'argocd: mashqda app get / app sync / app history';
    }

    if (cmd.indexOf('|') > 0) {
      const parts = cmd.split('|').map((x) => x.trim());
      let lines = run(bx, parts[0]).split('\n');
      for (let i = 1; i < parts.length; i++) {
        const st = parts[i].split(' ');
        if (st[0] === 'grep') { const pat = (st[1] || '').replace(/['"]/g, ''); lines = lines.filter((l) => l.indexOf(pat) >= 0); }
        else if (st[0] === 'head') lines = lines.slice(0, +(st[1] || '').replace('-', '') || 10);
        else if (st[0] === 'wc' && st[1] === '-l') lines = [String(lines.filter((l) => l.trim()).length)];
      }
      return lines.join('\n') || '(mos qator topilmadi)';
    }
    return 'bash: ' + a[0] + ": command not found — 'help' deb ko'ring";
  }

  const gitBase = (extra) => Object.assign({
    head: 'main',
    branches: { main: { commits: [{ sha: 'a1b2c3d', msg: 'initial commit', files: [] }] } },
    remote: { main: [{ sha: 'a1b2c3d', msg: 'initial commit', files: [] }] },
    staged: [], dirty: [],
  }, extra || {});

  const LABS = {
    'git-lab': { title: 'Git — uch ko\'chirish', section: "1–3-bo'lim",
      init: { git: gitBase({ dirty: ['app.py', 'README.md'] }) },
      tasks: [
        { t: 'Holatni ko\'ring — nima o\'zgargan?', v: (b, h) => h.some((x) => /^git status/.test(x)), hint: 'git status' },
        { t: '`app.py`ni staging\'ga qo\'shing', v: (b) => b.git.staged.indexOf('app.py') >= 0 || (b.git.branches[b.git.head].commits || []).some((c) => (c.files || []).indexOf('app.py') >= 0), hint: 'git add app.py' },
        { t: 'Xabar bilan commit qiling', v: (b) => b.git.branches[b.git.head].commits.length > 1, hint: 'git commit -m "fix login"' },
        { t: 'Tarixni qisqa ko\'rinishda ko\'ring', v: (b, h) => h.some((x) => /git log/.test(x)), hint: 'git log --oneline' },
        { t: 'Remote\'ga yuboring — shundan keyin jamoa ko\'radi', v: (b) => (b.git.pushed || []).length > 0, hint: 'git push' },
      ] },
    'branch-lab': { title: 'Branch, merge va konflikt', section: "3–4-bo'lim",
      init: { git: gitBase({ dirty: ['app.py'], conflictOn: 'feature/login', conflictFile: 'app.py' }) },
      tasks: [
        { t: '`feature/login` nomli yangi branch yaratib, unga o\'ting', v: (b) => (b.git.created || []).indexOf('feature/login') >= 0, hint: 'git checkout -b feature/login' },
        { t: 'O\'zgarishni commit qiling', v: (b) => (b.git.branches['feature/login'] || { commits: [] }).commits.length > 1, hint: 'git add . && git commit -m "add login"' },
        { t: 'Branchlar ro\'yxatini ko\'ring — qaysi birida turasiz?', v: (b, h) => h.some((x) => /^git branch$/.test(x)), hint: 'git branch' },
        { t: '`main`ga qaytib, feature branchni merge qiling', v: (b) => b.git.head === 'main' && ((b.git.merged || []).indexOf('feature/login') >= 0 || b.git.inConflict), hint: 'git checkout main  keyin  git merge feature/login' },
        { t: 'Konflikt chiqdi — qaysi faylda ekanini status bilan tasdiqlang', v: (b, h) => b.git.inConflict && h.filter((x) => /^git status/.test(x)).length >= 1, hint: 'git status' },
      ] },
    'secret-lab': { title: 'Secret Gitga tushdi', section: "14-bo'lim",
      init: { git: gitBase({ dirty: ['.env'] }) },
      tasks: [
        { t: 'Holatni ko\'ring — `.env` kuzatilayotganini aniqlang', v: (b, h) => h.some((x) => /^git status/.test(x)), hint: 'git status' },
        { t: 'Xato bilan commit qilib yuboring (senariyni boshlash)', v: (b) => b.git.branches[b.git.head].commits.length > 1, hint: 'git add .env && git commit -m "add config"' },
        { t: 'Remote\'ga push qilindi deb faraz qiling', v: (b) => (b.git.pushed || []).length > 0, hint: 'git push' },
        { t: '`git rm` bilan o\'chirib ko\'ring — natija xabarini o\'qing', v: (b) => !!b.git.removedFile, hint: 'git rm .env' },
        { t: 'Eng muhim qadam: kalitni almashtirish (rotate) — bu yerda `ci fix rotate` deb belgilaymiz', v: (b) => b.ci && b.ci.fixed && b.ci.fixed.rotate, hint: 'ci fix rotate' },
      ],
      extra: { ci: { plan: [{ name: 'rotate', fails: true, log: ['secret hali amalda — rotate qilinmagan'] }] } } },
    'pipeline-lab': { title: 'Pipeline yiqildi — sababni top', section: "5-bo'lim",
      init: { ci: { plan: [
          { name: 'lint', dur: '4s', log: ['app.py:12: line too long', '1 issue found'] },
          { name: 'test', fails: true, dur: '31s', log: ['test_login.py::test_token FAILED', 'AssertionError: expected 200, got 401', '1 failed, 42 passed'] },
          { name: 'build', dur: '48s', log: ['building wheel...'] },
          { name: 'image', dur: '62s', log: ['docker build ...'] },
        ], image: 'backend:8f31c2a' },
        git: gitBase({ dirty: ['app.py'] }) },
      tasks: [
        { t: 'Pipeline\'ni ishga tushiring', v: (b) => b.ci.ran > 0, hint: 'ci run' },
        { t: 'Qaysi bosqichda yiqilganini holatdan o\'qing', v: (b, h) => h.some((x) => /^ci status/.test(x)), hint: 'ci status' },
        { t: 'O\'sha bosqich logini ochib sababni toping', v: (b, h) => h.some((x) => /^ci logs test/.test(x)), hint: 'ci logs test' },
        { t: 'Sababni tuzatib belgilang', v: (b) => b.ci.fixed && b.ci.fixed.test, hint: 'ci fix test' },
        { t: 'Qaytadan ishlatib, hammasi o\'tganini ko\'ring', v: (b) => b.ci.ran > 1 && !b.ci.failedStage, hint: 'ci run' },
      ] },
    'artifact-lab': { title: 'Bir marta build — hamma joyga', section: "7–9-bo'lim",
      init: { warnLatest: true, built: [], registry: [],
        ci: { plan: [{ name: 'test', dur: '22s', log: ['43 passed'] }, { name: 'build', dur: '40s', log: ['ok'] }], image: 'backend:8f31c2a' },
        k8s: { deploys: [{ name: 'backend', replicas: 3, ready: 3, updated: 3, image: 'backend:a1b2c3d' }],
          pods: Array.from({ length: 3 }, (_, i) => ({ name: 'backend-old' + i, ready: true, status: 'Running', restarts: 0 })), events: [] },
        git: gitBase() },
      tasks: [
        { t: 'Git SHA bilan teglab image build qiling', v: (b) => (b.built || []).some((t) => /:[0-9a-f]{6,}/.test(t)), hint: 'docker build -t backend:8f31c2a .' },
        { t: 'Registry\'ga push qiling', v: (b) => (b.registry || []).length > 0, hint: 'docker push backend:8f31c2a' },
        { t: 'Prodda hozir qaysi image ishlayotganini ko\'ring', v: (b, h) => h.some((x) => /kubectl get deploy/.test(x)), hint: 'kubectl get deploy' },
        { t: 'Deployment\'ni yangi tegga o\'tkazing', v: (b) => (b.k8s.deployed || []).length > 0, hint: 'kubectl set image deploy/backend app=backend:8f31c2a' },
        { t: 'Rollout tugaganini tasdiqlang', v: (b, h) => h.some((x) => /rollout status/.test(x)) && b.k8s.deploys[0].ready === b.k8s.deploys[0].replicas, hint: 'kubectl rollout status deploy/backend' },
      ] },
    'rollout-lab': { title: 'Deploy buzildi — qaytar', section: "13-bo'lim",
      init: { built: ['backend:bad999'], registry: ['backend:bad999'],
        k8s: { deploys: [{ name: 'backend', replicas: 3, ready: 3, updated: 3, image: 'backend:a1b2c3d', crashOnNew: true }],
          pods: Array.from({ length: 3 }, (_, i) => ({ name: 'backend-ok' + i, ready: true, status: 'Running', restarts: 0 })),
          events: [], podLogs: ['FATAL: config key DATABASE_URL missing', 'exiting with code 1'] },
        git: gitBase() },
      tasks: [
        { t: 'Yangi (nosoz) image\'ni chiqaring', v: (b) => (b.k8s.deployed || []).indexOf('backend:bad999') >= 0, hint: 'kubectl set image deploy/backend app=backend:bad999' },
        { t: 'Rollout to\'xtaganini tasdiqlang', v: (b, h) => h.some((x) => /rollout status/.test(x)), hint: 'kubectl rollout status deploy/backend' },
        { t: 'Pod holatini ko\'ring — CrashLoopBackOff', v: (b, h) => h.some((x) => /kubectl get pods?/.test(x)), hint: 'kubectl get pods' },
        { t: 'Loglardan sababni o\'qing', v: (b, h) => h.some((x) => /kubectl logs/.test(x)), hint: 'kubectl logs backend-...' },
        { t: 'Tezkor chora: oldingi versiyaga qaytaring', v: (b) => b.k8s.undone, hint: 'kubectl rollout undo deploy/backend' },
      ] },
    'helm-lab': { title: 'Helm — upgrade va rollback', section: "q5 · Helm",
      init: { helm: { name: 'backend', current: 'a1b2c3d', revisions: [{ rev: 1, tag: 'a1b2c3d', status: 'superseded' }] },
        built: [], registry: ['backend:8f31c2a'], git: gitBase() },
      tasks: [
        { t: 'Hozirgi release holatini ko\'ring', v: (b, h) => h.some((x) => /helm (list|history)/.test(x)), hint: 'helm list' },
        { t: 'Yangi tegga upgrade qiling', v: (b) => (b.helm.upgraded || []).length > 0, hint: 'helm upgrade backend ./chart --set image.tag=8f31c2a' },
        { t: 'Revision tarixini ko\'ring', v: (b, h) => h.some((x) => /helm history/.test(x)), hint: 'helm history backend' },
        { t: '1-revisionga qaytaring', v: (b) => b.helm.rolledBack, hint: 'helm rollback backend 1' },
      ] },
    'gitops-lab': { title: 'GitOps — Git yozadi, kontroller bajaradi', section: "10–11-bo'lim",
      init: { argo: { name: 'backend', repo: 'git@github.com:team/infra.git', branch: 'main', live: 'a1b2c3d', desired: '8f31c2a', synced: false, healthy: false, sha: '8f31c2a', prevSha: 'a1b2c3d' },
        git: gitBase({ dirty: ['deploy/backend.yaml'] }) },
      tasks: [
        { t: 'Ilova holatini ko\'ring — Synced yoki OutOfSync?', v: (b, h) => h.some((x) => /argocd app get/.test(x)), hint: 'argocd app get backend' },
        { t: 'Desired state\'ni Git\'ga commit qiling', v: (b) => b.git.branches[b.git.head].commits.length > 1, hint: 'git add . && git commit -m "bump image to 8f31c2a"' },
        { t: 'Git\'ga push qiling — bu GitOps\'da deploy demak', v: (b) => (b.git.pushed || []).length > 0, hint: 'git push' },
        { t: 'Kontrollerni sinxronlashtiring', v: (b) => b.argo.synced, hint: 'argocd app sync backend' },
        { t: 'Holat Synced bo\'lganini tasdiqlang', v: (b, h) => { const i = h.findIndex((x) => /argocd app sync/.test(x)); return i >= 0 && h.slice(i).some((x) => /argocd app get/.test(x)); }, hint: 'argocd app get backend' },
      ] },
    'tf-lab': { title: 'Terraform — plan va apply', section: "15-bo'lim",
      init: { tf: { inited: false, state: ['aws_vpc.main'], pending: [
          { addr: 'aws_instance.web', type: 'aws_instance', action: 'created' },
          { addr: 'aws_lb.public', type: 'aws_lb', action: 'created' },
          { addr: 'aws_security_group.old', type: 'aws_security_group', action: 'destroyed' },
        ] } },
      tasks: [
        { t: 'Ish katalogini tayyorlang (init)', v: (b) => b.tf.inited, hint: 'terraform init' },
        { t: 'Nima o\'zgarishini ko\'ring — destroy borligiga e\'tibor bering', v: (b) => b.tf.planned, hint: 'terraform plan' },
        { t: 'O\'zgarishni qo\'llang', v: (b) => b.tf.applied, hint: 'terraform apply' },
        { t: 'State\'da nimalar borligini ko\'ring', v: (b, h) => h.some((x) => /terraform state list/.test(x)), hint: 'terraform state list' },
      ] },
    'chain-lab-cicd': { title: 'To\'liq konveyer — commitdan prodgacha', section: "22-bo'lim",
      init: { built: [], registry: [], warnLatest: true,
        git: gitBase({ dirty: ['app.py'] }),
        ci: { plan: [
            { name: 'lint', dur: '5s', log: ['ok'] },
            { name: 'test', dur: '28s', log: ['44 passed'] },
            { name: 'build', dur: '41s', log: ['ok'] },
            { name: 'scan', dur: '18s', log: ['0 critical, 2 medium'] },
          ], image: 'backend:8f31c2a' },
        k8s: { deploys: [{ name: 'backend', replicas: 3, ready: 3, updated: 3, image: 'backend:a1b2c3d' }],
          pods: Array.from({ length: 3 }, (_, i) => ({ name: 'backend-old' + i, ready: true, status: 'Running', restarts: 0 })), events: [], podLogs: ['listening on 0.0.0.0:8080'] } },
      tasks: [
        { t: '1. O\'zgarishni commit qilib push qiling', v: (b) => (b.git.pushed || []).length > 0 && b.git.branches[b.git.head].commits.length > 1, hint: 'git add . && git commit -m "feature" && git push' },
        { t: '2. Pipeline\'ni ishga tushirib, hammasi o\'tganini ko\'ring', v: (b) => b.ci.ran > 0 && !b.ci.failedStage, hint: 'ci run' },
        { t: '3. Git SHA bilan image build qiling', v: (b) => (b.built || []).some((t) => /:8f31c2a|:[0-9a-f]{6,}/.test(t)), hint: 'docker build -t backend:8f31c2a .' },
        { t: '4. Registry\'ga push qiling', v: (b) => (b.registry || []).length > 0, hint: 'docker push backend:8f31c2a' },
        { t: '5. Deployment\'ni yangi tegga o\'tkazing', v: (b) => (b.k8s.deployed || []).length > 0, hint: 'kubectl set image deploy/backend app=backend:8f31c2a' },
        { t: '6. Rollout tugaganini va podlar sog\'lom ekanini tasdiqlang', v: (b, h) => h.some((x) => /rollout status/.test(x)) && h.some((x) => /kubectl get pods?/.test(x)) && b.k8s.deploys[0].ready === b.k8s.deploys[0].replicas, hint: 'kubectl rollout status deploy/backend  keyin  kubectl get pods' },
      ] },
  };

  function mount(host, id) {
    const spec = typeof id === 'string' ? LABS[id] : id;
    if (!spec) return;
    const mk = () => { const o = JSON.parse(JSON.stringify(spec.init)); if (spec.extra) Object.assign(o, JSON.parse(JSON.stringify(spec.extra))); return o; };
    let bx = mk();
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
    inp.type = 'text'; inp.placeholder = 'git status';
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
    reset.onclick = () => { bx = mk(); hist = []; Object.keys(doneSet).forEach((k) => delete doneSet[k]); out.textContent = ''; say('muhit boshidan tiklandi'); paint(); };
    help.onclick = () => exec('help');
    say('mashq muhiti tayyor — ' + spec.section + ".  '? Buyruqlar' yordam beradi.");
    paint();
  }

  window.CicdLab = {
    run: function (bx, cmd) { return run(bx, cmd); },
    mountSpec: function (host, spec) { if (host.dataset.mounted) return; host.dataset.mounted = '1'; try { mount(host, spec); } catch (e) { console.warn('seclab', e); } },
    mountAll: function () {
      document.querySelectorAll('[data-clab]').forEach((h) => { if (h.dataset.mounted) return; h.dataset.mounted = '1'; try { mount(h, h.dataset.clab); } catch (e) { console.warn('clab', h.dataset.clab, e); } });
    },
    ids: Object.keys(LABS),
  };
})();
