(function () {
  const B = window.DevOpsBank; if (!B || !window.SuhbatQ) return;
  if (!B.subjects.some((s) => s.name === 'Suhbat 2026')) B.subjects.push({ name: 'Suhbat 2026', file: 'suhbat.html', key: 'suhbat-progress', color: 'oklch(calc(var(--lk) * 0.5 + var(--lb)) 0.11 68)' });
  window.SuhbatQ.q.forEach((x, i) => B.questions.push({ subject: 'Suhbat 2026', qid: 's' + (i + 1), group: x.g, groupId: '', q: x.q.replace(/<[^>]+>/g, ''), a: x.a }));
  (window.DeepQ || []).forEach((x) => B.questions.push({ subject: 'Suhbat 2026', qid: x.id, group: 'Chuqur arxitektura · ' + x.g, groupId: '', q: x.q, a: x.a }));
  (window.HhQ || []).forEach((x) => B.questions.push({ subject: 'Suhbat 2026', qid: x.id, group: 'hh.uz · ' + x.g, groupId: '', q: x.q, a: x.a }));
})();
