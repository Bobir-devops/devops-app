(function () {
  var page = (location.pathname.split('/').pop() || 'hub.html').replace('.html', '');
  var SUBJ = { linux: 'Linux', net: 'Networking', docker: 'Docker', k8s: 'Kubernetes', cicd: 'CI/CD' };
  function ready(fn) { if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  ready(function () {
    var a = document.createElement('a');
    a.id = 'kx-home';
    if (page === 'hub') { a.href = '../index.html'; a.innerHTML = '<span aria-hidden="true">‹</span> Ilova'; }
    else { a.href = 'hub.html'; a.innerHTML = '<span aria-hidden="true">‹</span> Kutubxona'; }
    document.body.appendChild(a);
    if (SUBJ[page]) daftar(SUBJ[page]);
  });

  function daftar(subj) {
    var d = document;
    function boot() {
      if (!d.querySelector('div[id="s1"]')) return setTimeout(boot, 700);
      if (d.getElementById('df-btn')) return;
      var KEY = 'daftar:' + subj;
      var st = function () { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } };
      var put = function (id, v) { var n = st(); if (v.trim()) n[id] = v; else delete n[id]; try { localStorage.setItem(KEY, JSON.stringify(n)); } catch (e) {} };
      var mk = function (t, css, txt) { var e = d.createElement(t); if (css) e.style.cssText = css; if (txt != null) e.textContent = txt; return e; };
      var b = mk('button', "position:fixed;left:max(12px,env(safe-area-inset-left));bottom:calc(14px + env(safe-area-inset-bottom));z-index:9990;height:44px;padding:0 16px;border:1px solid var(--acc);background:var(--bg);color:var(--acc-ink);font:500 15px 'Lora',Georgia,serif;border-radius:4px;cursor:pointer;box-shadow:0 2px 10px rgb(var(--ink-rgb) / .12)", 'Daftar');
      b.id = 'df-btn'; b.type = 'button';
      var panel = null;
      b.onclick = function () {
        if (panel) { panel.remove(); panel = null; d.body.style.overflow = ''; return; }
        var arch = (window.ArchQ || {})[subj] || {};
        panel = mk('div', 'position:fixed;inset:0;z-index:9999;background:rgb(var(--ink-rgb) / .45);display:flex;align-items:flex-end;justify-content:center');
        var book = mk('div', "width:min(760px,100%);max-height:92vh;overflow:auto;-webkit-overflow-scrolling:touch;background:var(--bg);color:var(--ink);padding:20px 20px calc(24px + env(safe-area-inset-bottom));border-top:1px solid var(--acc);box-shadow:0 -8px 30px rgb(var(--ink-rgb) / .2);font:400 16px/1.6 'Lora',Georgia,serif;box-sizing:border-box");
        var top = mk('div', 'display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:12px;position:sticky;top:-20px;background:var(--bg);padding:8px 0;border-bottom:1px solid var(--line)');
        top.appendChild(mk('div', "font:500 26px 'Cormorant Garamond',Georgia,serif", subj + ' daftari'));
        var x = mk('button', "min-height:44px;border:1px solid var(--line);background:transparent;padding:0 14px;cursor:pointer;font:500 15px 'Lora',serif;color:var(--ink);border-radius:4px", 'Yopish');
        x.onclick = b.onclick; top.appendChild(x); book.appendChild(top);
        var q = mk('input', "width:100%;box-sizing:border-box;margin:0 0 16px;padding:10px 12px;border:1px solid var(--line);background:var(--card);font:400 16px 'Lora',serif;border-radius:4px;color:var(--ink)");
        q.placeholder = 'Qidirish…'; book.appendChild(q);
        var list = mk('div'); book.appendChild(list);
        var seen = {};
        var secs = Array.prototype.slice.call(d.querySelectorAll('div[id]')).filter(function (s) { return /^s\d+$/.test(s.id) && !seen[s.id] && (seen[s.id] = 1); }).sort(function (a, c) { return +a.id.slice(1) - +c.id.slice(1); });
        var notes = st();
        secs.forEach(function (s) {
          var h2 = s.querySelector('h2');
          var box = mk('div', 'margin:0 0 18px;padding-bottom:14px;border-bottom:1px solid var(--line)');
          box.dataset.t = (s.textContent || '').toLowerCase();
          box.appendChild(mk('div', "font:500 22px 'Cormorant Garamond',Georgia,serif;margin:6px 0", s.id.slice(1) + '. ' + (h2 ? h2.textContent : s.id)));
          s.querySelectorAll('details').forEach(function (dt) {
            var sm = dt.querySelector('summary'); if (!sm || !/Eslab qolish/i.test(sm.textContent)) return;
            dt.querySelectorAll('p').forEach(function (p) { var e = mk('div', 'margin:4px 0;' + (p.hasAttribute('data-mn') ? 'color:var(--acc-ink);font-style:italic' : '')); e.innerHTML = '• ' + p.innerHTML; e.querySelectorAll('*').forEach(function (z) { z.style.color = ''; z.style.background = ''; }); box.appendChild(e); });
          });
          var pre = Array.prototype.slice.call(s.querySelectorAll('pre')).filter(function (p) { return !p.closest('[data-gate-quiz],[data-gate-lab],[data-llab],[data-nlab],[data-dlab],[data-klab],[data-clab]'); })[0];
          if (pre) box.appendChild(mk('pre', "font:13px/1.5 'IBM Plex Mono',monospace;background:var(--bg2);padding:8px 10px;margin:8px 0;white-space:pre-wrap", pre.textContent.split('\n').filter(function (l) { return l.trim(); }).slice(0, 8).join('\n')));
          (arch[s.id] || []).slice(0, 2).forEach(function (a) { var e = mk('div', 'margin:6px 0;padding:6px 0 6px 12px;border-left:1px solid var(--acc)'); e.innerHTML = '<b>' + a.q + '</b><br>' + a.a; e.querySelectorAll('*').forEach(function (z) { z.style.color = ''; z.style.background = ''; }); box.appendChild(e); });
          var ta = mk('textarea', "width:100%;box-sizing:border-box;min-height:64px;margin-top:8px;padding:8px 10px;border:1px solid var(--line);background:var(--card);font:16px 'Lora',serif;border-radius:4px;color:var(--ink)");
          ta.placeholder = "O'z yozuvingiz…"; ta.value = notes[s.id] || '';
          var tt = null; ta.oninput = function () { clearTimeout(tt); tt = setTimeout(function () { put(s.id, ta.value); }, 300); };
          box.appendChild(ta);
          list.appendChild(box);
        });
        q.oninput = function () { var v = q.value.toLowerCase(); Array.prototype.forEach.call(list.children, function (c) { c.style.display = !v || c.dataset.t.indexOf(v) >= 0 || c.querySelector('textarea').value.toLowerCase().indexOf(v) >= 0 ? '' : 'none'; }); };
        panel.appendChild(book);
        panel.onclick = function (e) { if (e.target === panel) b.onclick(); };
        d.body.appendChild(panel); d.body.style.overflow = 'hidden';
      };
      d.body.appendChild(b);
    }
    boot();
  }
})();
