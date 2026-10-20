/* Client view (real version). Derived from the public prototype's js/client.js (same UI), with:
 *  - data loaded from the client-get edge function using the private link token (#k=<token>, from /c/<token>)
 *  - check-offs saved locally first, then synced to the server through an offline queue (client-progress)
 *  - per-task updatedAt merge both ways: newest wins, never a blanket overwrite, so check-offs never reappear. */
(function () {
  'use strict';
  var LIB = window.CC_LIBRARY, CC = window.CC;
  var $ = function (id) { return document.getElementById(id); };
  var NS = 'cc.app.v1.';  // separate namespace from the prototype
  var APP = window.CC_APP;

  var S = {
    en: {
      hi: 'Hi {name},', defaultMsg: 'Here is what we need from you. Take it one step at a time — we will guide you through each one.',
      progress: '{done} of {total} done', next: 'Up next', start: 'Start', open: 'To do', doneSec: 'Done ({n})', undo: 'Restore',
      allDone: 'Everything is done!', allDoneTxt: 'Thank you. Please send anything you gathered to your attorney\'s office. We will be in touch.',
      back: '← All tasks', markDone: 'Mark as done ✓', haveIt: 'I have it ✓', skip: 'Skip for now →', reopen: 'Not done yet — move back to my list',
      movedDone: 'Moved to Done. Nice work!', restored: 'Moved back to your list.', undoBtn: 'Undo',
      dueToday: 'Due today', dueTomorrow: 'Due tomorrow', dueIn: 'Due in {n} days — coming up soon', due: 'Due {date}',
      overdue: 'Was due {date}. That\'s OK — please do it as soon as you can.', noDue: 'No due date',
      fromAtt: 'Note from your attorney', what: 'What this is', where: 'Where to find it', accepted: 'What we can accept', tips: 'Helpful tips',
      yourInfo: 'Your information (fills in the blanks below)', yourInfoNote: 'Saved only on this device.',
      emailDraft: 'Your email is ready', to: 'To', subject: 'Subject', recipientPh: 'their email address', copy: 'Copy email', copied: 'Email copied',
      openMail: 'Open in my email app', emailHow: 'Send it to: {who}', afterSend: 'After you send it, tap "Mark as done".',
      call: 'Call', hours: 'When to call', haveReady: 'Have this ready', script: 'What to say — step by step', noNumber: 'Your attorney will give you this number. Ask the office if you don\'t have it.',
      openSite: 'Open the website', steps: 'Steps', links: 'Useful links',
      remTitle: 'Daily reminder', remTxt: 'Add a reminder to your phone\'s calendar. It repeats every day at {time} until {date}. Delete it when you finish.',
      remBtn: 'Add daily reminder to my calendar', remDl: 'Reminder downloaded — open the file to add it to your calendar.',
      remSoon: 'You will also get a daily reminder from your attorney\'s office until everything is done.',
      newTasks: 'Your attorney added {n} new task(s) to your list.', olderLink: 'You opened an older link. Showing the newest version of your checklist.',
      badLink: 'This link looks incomplete.', badLinkTxt: 'Please open the full link your attorney sent you, or ask the office to send it again.',
      device: 'Your progress is saved and shared with your attorney\'s office.', syncSaving: 'Saving…', syncSaved: 'Saved', syncOffline: 'Offline — your check-offs are kept on this phone and will be saved when you are back online.',
      linkGone: 'This link is no longer active.', linkGoneTxt: 'Please ask your attorney\'s office for a new link.',
      clear: 'Erase my information from this device', clearConfirm: 'Erase your progress and information from this device?',
      taskOf: 'Task {i} of {n}', proto: 'Instructions from your attorney\'s office. This page is not legal advice.',
      icsSummary: 'Checklist: {n} task(s) left', icsOpen: 'Open your checklist:', icsAlarm: 'Time for your checklist — just one task today is great!',
      icsFooter: 'When everything is done you can delete this reminder.', icsTasks: 'Still to do:'
    },
    es: {
      hi: 'Hola {name}:', defaultMsg: 'Esto es lo que necesitamos de usted. Vaya paso a paso — le guiaremos en cada uno.',
      progress: '{done} de {total} listos', next: 'Lo siguiente', start: 'Empezar', open: 'Pendientes', doneSec: 'Listos ({n})', undo: 'Restaurar',
      allDone: '¡Todo está listo!', allDoneTxt: 'Gracias. Envíe a la oficina de su abogada todo lo que reunió. Nos pondremos en contacto.',
      back: '← Todas las tareas', markDone: 'Marcar como hecho ✓', haveIt: 'Ya lo tengo ✓', skip: 'Dejar para después →', reopen: 'Todavía no — regresar a mi lista',
      movedDone: 'Pasó a "Listos". ¡Muy bien!', restored: 'Regresó a su lista.', undoBtn: 'Deshacer',
      dueToday: 'Vence hoy', dueTomorrow: 'Vence mañana', dueIn: 'Vence en {n} días — ya se acerca', due: 'Vence el {date}',
      overdue: 'Vencía el {date}. No se preocupe — hágalo en cuanto pueda.', noDue: 'Sin fecha límite',
      fromAtt: 'Nota de su abogada', what: 'Qué es', where: 'Dónde encontrarlo', accepted: 'Qué podemos aceptar', tips: 'Consejos útiles',
      yourInfo: 'Sus datos (completan los espacios en blanco)', yourInfoNote: 'Se guardan solo en este dispositivo.',
      emailDraft: 'Su correo está listo', to: 'Para', subject: 'Asunto', recipientPh: 'su correo electrónico', copy: 'Copiar correo', copied: 'Correo copiado',
      openMail: 'Abrir en mi aplicación de correo', emailHow: 'Envíelo a: {who}', afterSend: 'Después de enviarlo, toque "Marcar como hecho".',
      call: 'Llamar', hours: 'Cuándo llamar', haveReady: 'Tenga esto a la mano', script: 'Qué decir — paso a paso', noNumber: 'Su abogada le dará este número. Pídalo a la oficina si no lo tiene.',
      openSite: 'Abrir la página web', steps: 'Pasos', links: 'Enlaces útiles',
      remTitle: 'Recordatorio diario', remTxt: 'Agregue un recordatorio al calendario de su teléfono. Se repite cada día a las {time} hasta el {date}. Bórrelo cuando termine.',
      remBtn: 'Agregar recordatorio diario a mi calendario', remDl: 'Recordatorio descargado — abra el archivo para agregarlo a su calendario.',
      remSoon: 'También recibirá un recordatorio diario de la oficina de su abogada hasta terminar todo.',
      newTasks: 'Su abogada agregó {n} tarea(s) nueva(s) a su lista.', olderLink: 'Abrió un enlace anterior. Le mostramos la versión más reciente de su lista.',
      badLink: 'Este enlace parece incompleto.', badLinkTxt: 'Abra el enlace completo que le envió su abogada, o pida a la oficina que se lo envíe otra vez.',
      device: 'Su progreso se guarda y se comparte con la oficina de su abogada.', syncSaving: 'Guardando…', syncSaved: 'Guardado', syncOffline: 'Sin conexión — sus tareas marcadas se guardan en este teléfono y se enviarán cuando vuelva a tener conexión.',
      linkGone: 'Este enlace ya no está activo.', linkGoneTxt: 'Pida a la oficina de su abogada un enlace nuevo.',
      clear: 'Borrar mis datos de este dispositivo', clearConfirm: '¿Borrar su progreso y sus datos de este dispositivo?',
      taskOf: 'Tarea {i} de {n}', proto: 'Instrucciones de la oficina de su abogada. Esta página no es asesoría legal.',
      icsSummary: 'Lista: le quedan {n} tarea(s)', icsOpen: 'Abra su lista:', icsAlarm: 'Hora de su lista — ¡con una tarea hoy es suficiente!',
      icsFooter: 'Cuando termine todo, puede borrar este recordatorio.', icsTasks: 'Pendiente:'
    }
  };
  var ICON = { doc: '📄', email: '✉️', phone: '📞', online: '🌐', custom: '📝' };

  /* ---------------- load checklist (never touches done-state) ----------------
   * /c/<token> redirects to client.html#k=<token>. The token only travels in POST bodies to the API. */
  var app = $('app');
  var params = new URLSearchParams(location.search);
  var token = (/[#&]k=([A-Za-z0-9_-]{22})(?:&|$)/.exec(location.hash) || [])[1] || null;
  window.addEventListener('hashchange', function () { location.reload(); });

  function showBad(gone) {
    document.documentElement.lang = 'en';
    var en = gone ? [S.en.linkGone, S.en.linkGoneTxt] : [S.en.badLink, S.en.badLinkTxt], es = gone ? [S.es.linkGone, S.es.linkGoneTxt] : [S.es.badLink, S.es.badLinkTxt];
    app.innerHTML = '<div class="card" style="margin-top:1rem"><h1>' + en[0] + '</h1><p>' + en[1] + '</p><hr><h1>' + es[0] + '</h1><p>' + es[1] + '</p></div>';
  }
  function pick(incoming, notices) {
    var stored = CC.lsGet(NS + 'list.' + incoming.id, null);
    if (stored && (stored.rev || 0) > (incoming.rev || 0)) return stored;
    CC.lsSet(NS + 'list.' + incoming.id, incoming); return incoming;
  }
  // Server document -> the prototype's internal checklist shape. Each task carries its full content snapshot (cu).
  function toList(d) {
    return { v: 1, id: d.checklistId, rev: d.rev, c: d.client.name, l: d.client.language, ct: d.caseType, m: d.message, a: d.attorney, r: d.reminders,
      t: d.tasks.map(function (t) {
        var cu = t.content || {};
        return { id: t.id, i: 'custom', d: t.due || undefined, n: t.note || undefined, o: cu.overrides || undefined, ti: t.title,
                 tx: cu.type === 'custom' ? (cu.text || '') : undefined, cu: cu.type ? cu : { type: t.type, title: { en: t.title } } };
      }) };
  }
  function api(fn, body) {
    return fetch(APP.functionsUrl + '/' + fn, { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: APP.anonKey }, body: JSON.stringify(body), cache: 'no-store', referrerPolicy: 'no-referrer' })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok) { var e = new Error(j.error || ('http ' + r.status)); e.status = r.status; throw e; } return j; }); });
  }
  function tokenKey(t) { return crypto.subtle.digest('SHA-256', new TextEncoder().encode(t)).then(function (h) { return NS + 'tok.' + Array.from(new Uint8Array(h).slice(0, 8), function (b) { return ('0' + b.toString(16)).slice(-2); }).join(''); }); }

  if (!token) showBad(false);
  else {
    app.innerHTML = '<p class="muted" id="loading" style="margin-top:2rem;text-align:center">…</p>';
    tokenKey(token).then(function (tk) {
      return api('client-get', { token: token }).then(function (d) {
        var list = pick(toList(d), []); localStorage.setItem(tk, list.id);
        window.__loadedVia = 'server'; boot(list, [], d.progress || {});
      }).catch(function (e) {
        if (e.status === 404) { var cid = localStorage.getItem(tk); if (cid) { [NS + 'list.' + cid].forEach(function (k) { localStorage.removeItem(k); }); localStorage.removeItem(tk); } showBad(true); return; }
        var cid2 = localStorage.getItem(tk), cached = cid2 && CC.lsGet(NS + 'list.' + cid2, null);   // offline: last version we saw
        if (cached) { window.__loadedVia = 'cache'; boot(cached, [], null); } else showBad(false);
      });
    });
  }

  function boot(list, notices, serverProgress) {
  var CID = list.id;
  var K = { done: NS + 'done.' + CID, fields: NS + 'fields.' + CID, lang: NS + 'lang.' + CID, seen: NS + 'seen.' + CID, view: NS + 'view.' + CID, queue: NS + 'queue.' + CID };
  var doneMap = CC.lsGet(K.done, {});          // { taskId: {done, doneAt, updatedAt} }
  var fields = CC.lsGet(K.fields, {});
  var lang = CC.lsGet(K.lang, null) || (list.l === 'es' ? 'es' : 'en');
  var seen = CC.lsGet(K.seen, null);
  var tasks = list.t.filter(function (t) { return t.i === 'custom' || LIB.byId[t.i]; }); // removed tasks are not sent by the server
  if (seen) { var nNew = tasks.filter(function (t) { return seen.indexOf(t.id) < 0; }).length; if (nNew) notices.push(['newTasks', nNew]); }
  CC.lsSet(K.seen, tasks.map(function (t) { return t.id; }));
  // Which task is expanded (one at a time). Deep links: #d=…&t=<taskId> (or the old per-screen view key) open
  // the list with that task expanded. On refresh, the last expanded task stays open.
  var nav = (performance.getEntriesByType && performance.getEntriesByType('navigation')[0]) || {};
  var hashTask = (/[#&]t=([^&]+)/.exec(location.hash) || [])[1] || params.get('t') || null;
  var legacyView = sessionStorage.getItem(K.view);
  var expanded = hashTask || (nav.type === 'reload' ? sessionStorage.getItem(K.view + '.exp') : null) ||
                 (legacyView && legacyView !== 'overview' ? legacyView : null);
  var userCollapsed = false;   // true once the client closes everything on purpose
  sessionStorage.removeItem(K.view);

  function T(key, vars) { var s = (S[lang][key] || S.en[key] || key); Object.keys(vars || {}).forEach(function (k) { s = s.split('{' + k + '}').join(vars[k]); }); return s; }
  function tr(o) { return !o ? '' : (typeof o === 'string' ? o : (o[lang] || o.en || '')); }
  function isDone(t) { return !!(doneMap[t.id] && doneMap[t.id].done); }
  function setDone(t, val) {
    // Re-read before writing so another open tab's changes are not lost.
    doneMap = CC.lsGet(K.done, {});
    var now = new Date().toISOString(), prev = doneMap[t.id] || {};
    doneMap[t.id] = { done: !!val, doneAt: val ? now : (prev.doneAt || null), updatedAt: now };
    CC.lsSet(K.done, doneMap);
    enqueue(t.id, doneMap[t.id]); flush();
  }

  /* ---------------- server sync (offline queue + per-task newest-wins merge) ---------------- */
  var syncState = 'saved', inFlight = false, retryT = null;
  function enqueue(id, entry) { var q = CC.lsGet(K.queue, {}); q[id] = { taskId: id, done: entry.done, doneAt: entry.doneAt, updatedAt: entry.updatedAt }; CC.lsSet(K.queue, q); }
  function ts(x) { var v = x && x.updatedAt ? Date.parse(x.updatedAt) : 0; return isNaN(v) ? 0 : v; }
  function newer(a, b) { return ts(a) > ts(b); }
  // Merge server progress into the device copy: for each task the newest updatedAt wins.
  // Device entries that are newer than the server's (or unknown to it) are queued for upload.
  function mergeServer(sp) {
    if (!sp) return false;
    doneMap = CC.lsGet(K.done, {}); var changed = false, q = CC.lsGet(K.queue, {});
    Object.keys(sp).forEach(function (id) {
      var s = sp[id], l = doneMap[id], pend = q[id];
      if (pend && newer(pend, s)) return;                     // our pending change is newer: keep it
      if (pend && !newer(pend, s)) delete q[id];              // server already has this or newer
      if (!l || newer(s, l)) { doneMap[id] = { done: !!s.done, doneAt: s.doneAt || null, updatedAt: s.updatedAt }; changed = true; }
    });
    tasks.forEach(function (t) { var l = doneMap[t.id]; if (l && !q[t.id] && (!sp[t.id] || newer(l, sp[t.id]))) q[t.id] = { taskId: t.id, done: l.done, doneAt: l.doneAt, updatedAt: l.updatedAt }; });
    CC.lsSet(K.done, doneMap); CC.lsSet(K.queue, q); return changed;
  }
  function setSync(s) { syncState = s; var el = $('syncState'); if (el) { el.textContent = T(s === 'saving' ? 'syncSaving' : s === 'offline' ? 'syncOffline' : 'syncSaved'); el.className = 'small sync ' + s; } }
  function flush() {
    if (inFlight || !token) return;
    var q = CC.lsGet(K.queue, {}), items = Object.keys(q).filter(function (id) { return byId(id); }).map(function (id) { return q[id]; });
    Object.keys(q).forEach(function (id) { if (!byId(id)) delete q[id]; }); CC.lsSet(K.queue, q);
    if (!items.length) { setSync('saved'); return; }
    inFlight = true; setSync('saving');
    api('client-progress', { token: token, items: items }).then(function (res) {
      inFlight = false;
      var cur = CC.lsGet(K.queue, {});
      items.forEach(function (it) { if (cur[it.taskId] && cur[it.taskId].updatedAt === it.updatedAt) delete cur[it.taskId]; });
      CC.lsSet(K.queue, cur);
      // Adopt the server's copy of what we just sent (it may have clamped a future clock or kept a newer change), so nothing loops.
      var sp = res.progress || {}, dm = CC.lsGet(K.done, {}), adopted = false;
      items.forEach(function (it) { var s = sp[it.taskId]; if (s && !cur[it.taskId]) { var l = dm[it.taskId]; if (!!(l && l.done) !== !!s.done) adopted = true; dm[it.taskId] = { done: !!s.done, doneAt: s.doneAt || null, updatedAt: s.updatedAt }; } });
      CC.lsSet(K.done, dm); doneMap = dm;
      if (mergeServer(sp) || adopted) renderOverview();
      if (Object.keys(CC.lsGet(K.queue, {})).length) flush(); else setSync('saved');
    }).catch(function (e) {
      inFlight = false;
      if (e.status === 404) { setSync('offline'); return; }   // link revoked: keep local state, stop retrying
      setSync('offline'); clearTimeout(retryT); retryT = setTimeout(flush, 30000);
    });
  }
  window.addEventListener('online', flush);
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') flush(); });
  window.addEventListener('storage', function (e) { if (e.key === K.done) { doneMap = CC.lsGet(K.done, {}); render(); } });

  // Library task, or a custom task the attorney's AI wrote with full content (same shape as a library item).
  function item(t) { if (LIB.byId[t.i]) return LIB.byId[t.i]; var cu = t.cu; return cu && cu.type && cu.type !== 'custom' && LIB.TYPES[cu.type] ? cu : null; }
  function typeOf(t) { var it = item(t); return it ? it.type : 'custom'; }
  function title(t) { var it = item(t); return (it && tr(it.title)) || t.ti || tr(t.cu && t.cu.title) || 'Task'; }
  function sortKey(t) { return t.d || '9999-12-31'; }
  function openTasks() { return tasks.filter(function (t) { return !isDone(t); }).map(function (t, i) { return [t, i]; })
    .sort(function (a, b) { return sortKey(a[0]).localeCompare(sortKey(b[0])) || a[1] - b[1]; }).map(function (x) { return x[0]; }); }
  function doneTasks() { return tasks.filter(isDone).sort(function (a, b) { return (doneMap[b.id].doneAt || '').localeCompare(doneMap[a.id].doneAt || ''); }); }

  function dueInfo(d) {
    if (!d) return { cls: '', txt: T('noDue') };
    var n = CC.daysUntil(d), date = CC.fmtDate(d, lang);
    if (n < 0) return { cls: 'overdue', txt: T('overdue', { date: date }) };
    if (n === 0) return { cls: 'soon', txt: T('dueToday') };
    if (n === 1) return { cls: 'soon', txt: T('dueTomorrow') };
    if (n <= 3) return { cls: 'soon', txt: T('dueIn', { n: n }) };
    return { cls: '', txt: T('due', { date: date }) };
  }

  /* ---------------- language ---------------- */
  function renderLang(l) {
    document.documentElement.lang = l;
    document.querySelectorAll('.lang button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === l)); });
  }
  document.querySelectorAll('.lang button').forEach(function (b) {
    b.onclick = function () { lang = b.getAttribute('data-lang'); CC.lsSet(K.lang, lang); render(); };
  });

  /* ---------------- views (single list with inline accordions) ---------------- */
  function setExpanded(id) { expanded = id; if (id) sessionStorage.setItem(K.view + '.exp', id); else sessionStorage.removeItem(K.view + '.exp'); }
  function byId(id) { return tasks.filter(function (x) { return x.id === id; })[0]; }

  function render() {
    renderLang(lang);
    $('firm').textContent = (list.a && list.a.name) || '';
    document.title = lang === 'es' ? 'Su lista' : 'Your checklist';
    if (expanded && !byId(expanded)) setExpanded(null);
    if (!expanded && !userCollapsed) { var first = openTasks()[0]; if (first) setExpanded(first.id); }
    renderOverview();
  }

  function accHTML(t, opts) {
    var di = dueInfo(t.d), ty = typeOf(t), isOpen = expanded === t.id, pid = 'p_' + t.id;
    return '<div class="acc' + (isOpen ? ' open' : '') + (opts.next ? ' next' : '') + (opts.done ? ' is-done' : '') + '" data-task="' + t.id + '">' +
      '<h3 class="acc-h"><button class="acc-head" aria-expanded="' + isOpen + '" aria-controls="' + pid + '" id="h_' + t.id + '">' +
      '<span class="ic">' + (opts.done ? '✅' : ICON[ty]) + '</span><span class="body">' +
      (opts.next ? '<span class="upnext">' + T('next') + '</span>' : '') +
      '<b>' + CC.esc(title(t)) + '</b><span class="due ' + (opts.done ? '' : di.cls) + '">' + CC.esc(opts.done ? tr(LIB.TYPES[ty]) : di.txt) + '</span></span>' +
      '<span class="chev" aria-hidden="true">⌄</span></button></h3>' +
      '<div class="acc-panel" id="' + pid + '" role="region" aria-labelledby="h_' + t.id + '"' + (isOpen ? '' : ' hidden') + '>' + (isOpen ? panelHTML(t) : '') + '</div></div>';
  }

  function renderOverview() {
    var open = openTasks(), done = doneTasks(), total = tasks.length, pct = total ? Math.round(done.length / total * 100) : 0;
    var name = (list.c || '').split(' ')[0];
    var h = '';
    notices.forEach(function (n) { h += '<div class="notice info" style="margin-bottom:.6rem">' + (Array.isArray(n) ? T(n[0], { n: n[1] }) : T(n)) + '</div>'; });
    h += '<div class="hello"><h1>' + CC.esc(T('hi', { name: name })) + '</h1><p class="muted" style="margin:0">' + CC.esc(list.m || T('defaultMsg')) + '</p></div>';
    h += '<div style="margin:1rem 0"><div class="progress" role="progressbar" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100"><span style="width:' + pct + '%"></span></div>' +
         '<div class="small muted" id="progressText">' + T('progress', { done: done.length, total: total }) + '</div></div>';
    if (open.length) {
      h += '<h2 style="margin-top:1rem">' + T('open') + ' (' + open.length + ')</h2><div class="acc-list" id="activeList">' +
           open.map(function (t, i) { return accHTML(t, { next: i === 0 }); }).join('') + '</div>';
    } else {
      h += '<div class="card allset"><div class="big">🎉</div><h1>' + T('allDone') + '</h1><p>' + T('allDoneTxt') + '</p></div>';
    }
    var doneOpen = sessionStorage.getItem(K.view + '.doneOpen') === '1' || (expanded && done.some(function (t) { return t.id === expanded; }));
    h += '<details class="done-sec" id="doneSec"' + (doneOpen ? ' open' : '') + '><summary>' + T('doneSec', { n: done.length }) + '</summary><div class="acc-list" id="doneList">' +
         (done.length ? done.map(function (t) { return accHTML(t, { done: true }); }).join('') : '<p class="muted small">—</p>') + '</div></details>';
    if (open.length) {
      var last = open.reduce(function (m, t) { return t.d && t.d > m ? t.d : m; }, '');
      var until = remUntil(last), time = (list.r && list.r.time) || '09:00';
      h += '<div class="card" style="margin-top:1rem"><h2>🔔 ' + T('remTitle') + '</h2><p class="small" style="margin:.2rem 0 .6rem">' +
           CC.esc(T('remTxt', { time: fmtTime(time), date: CC.fmtDate(until, lang) })) + '</p><button class="btn teal block" id="icsBtn">' + T('remBtn') + '</button>' +
           ((list.r && (list.r.email || list.r.sms)) ? '<p class="small muted" style="margin:.5rem 0 0">' + T('remSoon') + '</p>' : '') + '</div>';
    }
    h += contactHTML();
    h += '<footer class="c-foot"><p>' + T('device') + ' <span id="syncState" class="small sync" aria-live="polite"></span></p><p>' + T('proto') + '</p><button class="btn small ghost" id="clearBtn">' + T('clear') + '</button></footer>';
    app.innerHTML = h;
    $('doneSec').addEventListener('toggle', function () { sessionStorage.setItem(K.view + '.doneOpen', $('doneSec').open ? '1' : '0'); });
    if ($('icsBtn')) $('icsBtn').onclick = downloadICS;
    $('clearBtn').onclick = function () {
      if (!confirm(T('clearConfirm'))) return;
      [K.done, K.fields, K.lang, K.seen, K.queue, NS + 'list.' + CID].forEach(function (k) { localStorage.removeItem(k); });
      sessionStorage.clear(); location.reload();
    };
    var ex = expanded && app.querySelector('.acc[data-task="' + expanded + '"]');
    if (ex) bindPanel(byId(expanded), ex);
    setSync(syncState);
  }

  function scrollToTask(id) {
    var el = app.querySelector('.acc[data-task="' + id + '"]'); if (!el) return;
    var r = el.getBoundingClientRect();
    if (r.top < 8 || r.top > window.innerHeight * 0.6) window.scrollTo({ top: window.scrollY + r.top - 12, behavior: 'smooth' });
  }

  function toggle(id) {
    if (expanded === id) { setExpanded(null); userCollapsed = true; } else { setExpanded(id); }
    renderOverview();
    if (expanded) scrollToTask(expanded);
  }

  function contactHTML() {
    var a = list.a || {}; if (!a.phone && !a.email) return '';
    return '<div class="card" style="margin-top:1rem"><h3>' + CC.esc(a.name || '') + '</h3><div class="row">' +
      (a.phone ? '<a class="btn small" href="tel:' + a.phone.replace(/[^\d+]/g, '') + '">📞 ' + CC.esc(a.phone) + '</a>' : '') +
      (a.email ? '<a class="btn small" href="mailto:' + CC.esc(a.email) + '">✉️ ' + CC.esc(a.email) + '</a>' : '') + '</div></div>';
  }
  function fmtTime(hm) { var p = hm.split(':'), d = new Date(2000, 0, 1, +p[0], +p[1]); return d.toLocaleTimeString(lang === 'es' ? 'es-US' : 'en-US', { hour: 'numeric', minute: '2-digit' }); }
  function remUntil(lastDue) { var min = CC.ymd(CC.addDays(CC.today(), 7)); return lastDue && lastDue > min ? lastDue : min; }

  function fieldsHTML(t, keys) {
    if (!keys.length) return '';
    return '<section class="card soft"><h4>' + T('yourInfo') + '</h4><div class="fields">' + keys.map(function (k) {
      var id = 'f_' + t.id + '_' + k;
      return '<div><label for="' + id + '">' + CC.esc(CC.fieldLabel(k, lang)) + '</label><input id="' + id + '" data-field="' + k + '" value="' + CC.esc(fields[k] || '') + '"></div>';
    }).join('') + '</div><p class="small muted" style="margin:.4rem 0 0">' + T('yourInfoNote') + '</p></section>';
  }
  function listHTML(arr, check, cls) {
    if (!arr || !arr.length) return '';
    return check ? '<ul class="checklist' + (cls ? ' ' + cls : '') + '">' + arr.map(function (x) { return '<li><label><input type="checkbox"> <span>' + CC.fillHTML(tr(x), fields, lang) + '</span></label></li>'; }).join('') + '</ul>'
                 : '<ul>' + arr.map(function (x) { return '<li>' + CC.fillHTML(tr(x), fields, lang) + '</li>'; }).join('') + '</ul>';
  }
  function olHTML(arr) { return arr.map(function (x) { return '<li>' + CC.fillHTML(tr(x), fields, lang) + '</li>'; }).join(''); }

  function panelHTML(t) {
    var it = item(t), ty = typeOf(t), done = isDone(t), open = openTasks();
    var h = '<div class="panel-in">';
    if (t.n) h += '<section class="att-note"><b>' + T('fromAtt') + ':</b> ' + CC.esc(t.n) + '</section>';
    if (!it) {
      h += '<section><p style="white-space:pre-wrap;margin:0">' + CC.esc(t.tx || tr(t.cu && (t.cu.text || t.cu.summary)) || '') + '</p></section>';
    } else {
      if (it.summary) h += '<section><p style="margin:0">' + CC.esc(tr(it.summary)) + '</p></section>';
      var keys = (it.fields || []).slice();
      [it.subject, it.body].forEach(function (x) { if (x) CC.fieldsIn(tr(x)).forEach(function (k) { if (keys.indexOf(k) < 0) keys.push(k); }); });
      if (ty === 'doc') {
        h += '<section><h4>' + T('where') + '</h4>' + listHTML(it.where) + '</section>';
        h += '<section><h4>' + T('accepted') + '</h4>' + listHTML(it.accepted, true) + '</section>';
      }
      if (ty === 'email') {
        h += '<section><h4>' + T('emailDraft') + '</h4><p class="small muted" style="margin:0 0 .4rem">' + CC.esc(T('emailHow', { who: (t.o && t.o.toName) || tr(it.toLabel) })) + '</p>' +
             (tr(it.bodyNote) ? '<p class="small notice info" style="margin:0 0 .5rem">' + CC.esc(tr(it.bodyNote)) + '</p>' : '') +
             '<div class="email-box"><div class="hdr"><label class="inl" for="to_' + t.id + '">' + T('to') + ':</label> <input class="emailTo" id="to_' + t.id + '" type="email" placeholder="' + T('recipientPh') + '" value="' + CC.esc(fields['__to_' + t.id] || (t.o && t.o.to) || '') + '"></div>' +
             '<div class="hdr"><b>' + T('subject') + ':</b> <span class="emailSubj"></span></div><pre class="emailBody"></pre></div>' +
             '<div class="row" style="margin-top:.6rem"><button class="btn copyEmail">📋 ' + T('copy') + '</button><a class="btn primary grow mailtoBtn">✉️ ' + T('openMail') + '</a></div>' +
             '<p class="small muted" style="margin:.4rem 0 0">' + T('afterSend') + '</p></section>' + fieldsHTML(t, keys);
      }
      if (ty === 'phone') {
        var num = it.phone || (t.o && t.o.phone ? '+1' + t.o.phone.replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '') : '');
        var disp = it.phoneDisplay || (t.o && t.o.phone) || '';
        h += '<section>' + (num ? '<a class="callbtn" href="tel:' + num + '"><small>📞 ' + T('call') + '</small>' + CC.esc(disp) + '</a>' : '<div class="notice">' + T('noNumber') + '</div>') + '</section>';
        if (it.hours) h += '<section><h4>' + T('hours') + '</h4><p style="margin:0">' + CC.esc(tr(it.hours)) + '</p></section>';
        h += '<section><h4>' + T('haveReady') + '</h4>' + listHTML(it.haveReady, true, 'ready') + '</section>';
        h += '<section><h4>' + T('script') + '</h4><ol class="script">' + olHTML(it.script || []) + '</ol></section>';
        h += fieldsHTML(t, keys);
      }
      if (ty === 'online') {
        if (it.url && /^https?:\/\//.test(it.url)) h += '<section><a class="btn primary block" href="' + CC.esc(it.url) + '" target="_blank" rel="noopener noreferrer">🌐 ' + T('openSite') + '</a><p class="small muted" style="margin:.3rem 0 0;word-break:break-all">' + CC.esc(it.url) + '</p></section>';
        h += '<section><h4>' + T('steps') + '</h4><ol class="steps">' + olHTML(it.steps || []) + '</ol></section>';
        h += fieldsHTML(t, keys);
      }
      if (it.tips && it.tips.length) h += '<section><h4>' + T('tips') + '</h4>' + listHTML(it.tips) + '</section>';
      if (it.links && it.links.length) h += '<section><h4>' + T('links') + '</h4><ul>' + it.links.filter(function (l) { return /^https?:\/\//.test(l.url); }).map(function (l) { return '<li><a href="' + l.url + '" target="_blank" rel="noopener noreferrer">' + CC.esc(tr(l.label)) + '</a></li>'; }).join('') + '</ul></section>';
    }
    h += '<div class="acc-actions">' + (done
      ? '<button class="btn act-reopen">' + T('reopen') + '</button>'
      : '<button class="btn primary act-done">' + (ty === 'doc' ? T('haveIt') : T('markDone')) + '</button>' + (open.length > 1 ? '<button class="btn act-skip">' + T('skip') + '</button>' : '')) + '</div>';
    return h + '</div>';
  }

  function bindPanel(t, root) {
    var q = function (sel) { return root.querySelector(sel); };
    if (q('.act-done')) q('.act-done').onclick = function () {
      var before = openTasks(); setDone(t, true);
      var i = before.indexOf(t), rest = openTasks(), nextT = rest[i] || rest[0] || null;
      setExpanded(nextT ? nextT.id : null);
      toast(T('movedDone'), function () { setDone(t, false); setExpanded(t.id); renderOverview(); scrollToTask(t.id); });
      renderOverview(); if (nextT) scrollToTask(nextT.id);
    };
    if (q('.act-skip')) q('.act-skip').onclick = function () {
      var open = openTasks(), i = open.indexOf(t); var nx = open[(i + 1) % open.length];
      setExpanded(nx.id); renderOverview(); scrollToTask(nx.id);
    };
    if (q('.act-reopen')) q('.act-reopen').onclick = function () { setDone(t, false); toast(T('restored')); renderOverview(); scrollToTask(t.id); };
    root.querySelectorAll('input[data-field]').forEach(function (inp) {
      inp.addEventListener('input', function () { fields[inp.getAttribute('data-field')] = inp.value; CC.lsSet(K.fields, fields); refreshFills(t, root); });
    });
    if (q('.emailTo')) q('.emailTo').addEventListener('input', function () { fields['__to_' + t.id] = q('.emailTo').value.trim(); CC.lsSet(K.fields, fields); refreshFills(t, root); });
    if (q('.copyEmail')) q('.copyEmail').onclick = function () { var e = emailParts(t); CC.copyText((e.to ? T('to') + ': ' + e.to + '\n' : '') + T('subject') + ': ' + e.subject + '\n\n' + e.body).then(function () { toast(T('copied')); }); };
    refreshFills(t, root);
  }

  function emailParts(t) {
    var it = item(t);
    return { to: fields['__to_' + t.id] || (t.o && t.o.to) || '', subject: CC.fillText(tr(it.subject), fields, lang), body: CC.fillText(tr(it.body), fields, lang) };
  }
  function refreshFills(t, root) {
    var it = item(t); if (!it) return;
    var q = function (sel) { return root.querySelector(sel); };
    if (it.type === 'email') {
      q('.emailSubj').innerHTML = CC.fillHTML(tr(it.subject), fields, lang);
      q('.emailBody').innerHTML = CC.fillHTML(tr(it.body), fields, lang);
      var e = emailParts(t); q('.mailtoBtn').href = CC.buildMailto(e.to, e.subject, e.body);
    }
    if (q('.script') && it.script) q('.script').innerHTML = olHTML(it.script || []);
    if (q('.steps') && it.steps) q('.steps').innerHTML = olHTML(it.steps || []);
    if (q('.ready') && it.haveReady) q('.ready').querySelectorAll('li span').forEach(function (sp, i) { sp.innerHTML = CC.fillHTML(tr(it.haveReady[i]), fields, lang); });
  }

  /* ---------------- calendar reminder (.ics) ---------------- */
  function downloadICS() {
    var open = openTasks(); if (!open.length) return;
    var last = open.reduce(function (m, t) { return t.d && t.d > m ? t.d : m; }, '');
    var time = (list.r && list.r.time) || '09:00', p = time.split(':'), now = new Date();
    var start = CC.today(); if (now.getHours() * 60 + now.getMinutes() >= +p[0] * 60 + +p[1]) start = CC.addDays(start, 1);
    var desc = T('icsTasks') + '\n' + open.map(function (t) { return '• ' + title(t) + (t.d ? ' (' + CC.fmtDate(t.d, lang) + ')' : ''); }).join('\n') +
      '\n\n' + T('icsOpen') + '\n' + location.href + '\n\n' + T('icsFooter');
    var ics = CC.buildICS({ uid: CID + '-daily@client-checklist.app', summary: T('icsSummary', { n: open.length }), description: desc,
      url: location.href, time: time, startDate: start, untilYMD: remUntil(last), alarmText: T('icsAlarm') });
    CC.download('checklist-reminder.ics', ics, 'text/calendar;charset=utf-8');
    toast(T('remDl'));
    window.__lastICS = ics;
  }

  /* ---------------- toast ---------------- */
  var tt;
  function toast(msg, undo) {
    var el = document.querySelector('.toast') || document.body.appendChild(Object.assign(document.createElement('div'), { className: 'toast' }));
    el.innerHTML = '<span>' + CC.esc(msg) + '</span>' + (undo ? '<button>' + T('undoBtn') + '</button>' : '');
    el.classList.remove('hidden'); if (undo) el.querySelector('button').onclick = function () { el.classList.add('hidden'); undo(); };
    clearTimeout(tt); tt = setTimeout(function () { el.classList.add('hidden'); }, 4000);
  }

  // Accordion toggles
  app.addEventListener('click', function (e) {
    var h = e.target.closest('.acc-head'); if (h) { toggle(h.closest('.acc').getAttribute('data-task')); }
  });

  mergeServer(serverProgress);
  render(); flush();
  window.__client = { source: 'server', queue: function () { return CC.lsGet(K.queue, {}); }, flush: flush, expanded: function () { return expanded; }, doneMap: function () { return CC.lsGet(K.done, {}); }, list: list, checklistId: CID };
  }
})();
