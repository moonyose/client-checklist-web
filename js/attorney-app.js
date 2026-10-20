/* Attorney dashboard (real version). Sign-in: Supabase magic link. Every read/write goes through the attorney-api
 * edge function with the session token - the same tools her AI assistant uses over MCP. */
(function () {
  'use strict';
  var APP = window.CC_APP, CC = window.CC, LIB = window.CC_LIBRARY;
  var $ = function (id) { return document.getElementById(id); };
  var esc = CC.esc;
  var sb = window.supabase.createClient(APP.supabaseUrl, APP.anonKey, { auth: { flowType: 'pkce', detectSessionInUrl: true, persistSession: true } });
  var session = null, clients = [], current = null, preview = [];
  var TYPE = { doc: 'Document', email: 'Email', phone: 'Phone', online: 'Online/mail', custom: 'Custom' };
  var narrow = window.matchMedia('(max-width: 860px)');

  function toast(msg) {
    var el = document.querySelector('.toast') || document.body.appendChild(Object.assign(document.createElement('div'), { className: 'toast' }));
    el.textContent = msg; el.classList.remove('hidden'); clearTimeout(toast.t); toast.t = setTimeout(function () { el.classList.add('hidden'); }, 3000);
  }
  function call(tool, args) {
    return sb.auth.getSession().then(function (r) {
      var tok = r.data.session && r.data.session.access_token; if (!tok) throw new Error('signed out');
      return fetch(APP.functionsUrl + '/attorney-api', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + tok, apikey: APP.anonKey }, body: JSON.stringify({ tool: tool, args: args || {} }) });
    }).then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.message || j.error || ('HTTP ' + r.status)); return j.result; }); });
  }
  function fail(e) { toast('Error: ' + e.message); }

  /* ---------- auth ---------- */
  function show(view) { $('loginView').classList.toggle('hidden', view !== 'login'); $('appView').classList.toggle('hidden', view !== 'app'); ['settingsBtn', 'signOut'].forEach(function (id) { $(id).classList.toggle('hidden', view !== 'app'); }); }
  $('loginForm').onsubmit = function (e) {
    e.preventDefault();
    var redirect = location.origin + location.pathname;
    $('loginMsg').textContent = 'Sending…';
    sb.auth.signInWithOtp({ email: $('loginEmail').value.trim(), options: { shouldCreateUser: false, emailRedirectTo: redirect } }).then(function (r) {
      $('loginMsg').textContent = r.error ? ('Could not send: ' + r.error.message) : 'Check your email for the sign-in link (open it on this device).';
    });
  };
  $('signOut').onclick = function () { sb.auth.signOut().then(function () { location.reload(); }); };
  sb.auth.onAuthStateChange(function (_ev, s) { var was = !!session; session = s; if (s && !was) start(); if (!s) show('login'); });
  sb.auth.getSession().then(function (r) { session = r.data.session; if (session) start(); else show('login'); });

  function start() {
    show('app'); $('who').textContent = session.user.email;
    if (/[?&]code=/.test(location.search)) history.replaceState(null, '', location.pathname);
    loadClients();
  }

  /* ---------- client list ---------- */
  function loadClients(selectId) {
    return call('list_clients').then(function (list) { clients = list; renderList(); if (selectId) openClient(selectId); }).catch(fail);
  }
  function renderList() {
    var q = $('clientSearch').value.trim().toLowerCase();
    var rows = clients.filter(function (c) { return !q || c.display_name.toLowerCase().indexOf(q) >= 0; });
    $('clientList').innerHTML = rows.length ? rows.map(function (c) {
      var pct = c.total ? Math.round(c.done / c.total * 100) : 0;
      return '<button class="cl-item' + (current && current.id === c.id ? ' active' : '') + '" data-id="' + c.id + '"><span class="t"><b>' + esc(c.display_name) + '</b><small>' +
        c.done + ' of ' + c.total + ' done' + (c.next_due ? ' · next due ' + esc(CC.fmtDate(c.next_due, 'en')) : '') + (c.link_active ? '' : ' · no link') + '</small>' +
        '<span class="mini-prog"><span style="width:' + pct + '%"></span></span></span></button>';
    }).join('') : '<p class="muted small">' + (clients.length ? 'No match.' : 'No clients yet. Tap “+ New”, or ask your AI assistant.') + '</p>';
  }
  $('clientSearch').oninput = renderList;
  $('clientList').onclick = function (e) { var b = e.target.closest('.cl-item'); if (b) openClient(b.getAttribute('data-id')); };

  /* ---------- client detail ---------- */
  function openClient(id) {
    return call('get_client', { client_id: id }).then(function (c) { current = c; renderDetail(); renderList(); $('cols').classList.add('has-client'); $('bar').classList.remove('hidden'); if (narrow.matches) window.scrollTo(0, 0); }).catch(fail);
  }
  function refresh() { return openClient(current.id).then(function () { return loadClients(); }); }

  function caseOptions(sel) { return Object.keys(LIB.CASE_TYPES).map(function (k) { return '<option value="' + k + '"' + (k === sel ? ' selected' : '') + '>' + esc(LIB.CASE_TYPES[k].label) + '</option>'; }).join(''); }
  function renderDetail() {
    var c = current, done = c.tasks.filter(function (t) { return t.done; }).length, total = c.tasks.length, pct = total ? Math.round(done / total * 100) : 0, r = c.reminders;
    var h = '<div class="card"><div class="row"><button class="btn small ghost" id="backBtn">← All clients</button><span class="grow"></span><span class="badge">' + (c.language === 'es' ? 'Español' : 'English') + '</span></div>' +
      '<h1 style="margin:.3rem 0">' + esc(c.display_name) + '</h1><div class="progress" aria-label="progress"><span style="width:' + pct + '%"></span></div>' +
      '<p class="small muted" id="progText">' + done + ' of ' + total + ' done (checked off by the client)</p></div>';
    // link
    h += '<div class="card" id="linkCard"><div class="row"><h2 class="grow" style="margin:0">Client link</h2>' + (c.link ? '<span class="badge ok">active · expires ' + esc(c.link.expires_at.slice(0, 10)) + '</span>' : '<span class="badge warn">none</span>') + '</div>' +
      '<div id="linkOut" class="hidden" style="margin-top:.6rem"><div class="linkbox" id="linkText"></div><p class="small muted" id="shareMsg"></p>' +
      '<div class="row"><button class="btn primary" id="shareLink">Share…</button><button class="btn" id="copyLink">Copy</button><a class="btn" id="openLink" target="_blank" rel="noopener noreferrer">Open</a></div></div>' +
      '<div class="row" style="margin-top:.6rem"><button class="btn" id="getLink">' + (c.link ? 'Show link' : 'Create link') + '</button><button class="btn" id="rotateLink">Replace link</button>' + (c.link ? '<button class="btn ghost" id="revokeLink">Turn off</button>' : '') + '</div>' +
      '<p class="small muted" style="margin:.4rem 0 0">Anyone with the link can see and check off this list. Send it only to the client.</p></div>';
    // tasks
    h += '<div class="card"><h2>Tasks</h2>' + (c.tasks.length ? c.tasks.map(function (t) {
      return '<div class="trow' + (t.done ? ' done' : '') + '" data-id="' + t.id + '"><span class="st" title="' + (t.done ? 'Done by client' : 'Open') + '">' + (t.done ? '✅' : '⬜') + '</span>' +
        '<div><div class="ttl">' + esc(t.title) + '</div><span class="badge ' + t.type + '">' + TYPE[t.type] + '</span>' + (t.done && t.done_at ? ' <span class="small muted">done ' + esc(t.done_at.slice(0, 10)) + '</span>' : '') + '</div>' +
        '<button class="btn small ghost icon" data-act="remove" aria-label="Remove task">✕</button>' +
        '<div class="opts"><input type="date" data-k="due_date" value="' + (t.due_date || '') + '" aria-label="Due date"><input data-k="note" placeholder="Note to client (optional)" value="' + esc(t.note || '') + '" aria-label="Note">' +
        (t.type === 'email' ? '<input data-k="to" type="email" placeholder="Recipient email" value="' + esc((t.overrides && t.overrides.to) || '') + '" aria-label="Recipient email">' : '') + '</div></div>';
    }).join('') : '<p class="muted">No tasks yet.</p>') + '</div>';
    // quick add
    h += '<div class="card" id="quickCard"><h2>Quick add — type or dictate</h2><textarea id="dictation" rows="3" placeholder="e.g. birth certificate and tax transcripts by Nov 15; letter from her pastor by Friday"></textarea>' +
      '<div class="row" style="margin-top:.5rem"><button class="btn mic" id="micBtn">🎤 Dictate</button><button class="btn primary" id="previewBtn">Preview tasks</button><span class="small muted" id="parseMsg"></span></div><div id="pvRows"></div></div>';
    // library
    h += '<details class="card sec" id="libCard"><summary><h2>Task library</h2></summary><div class="sec-body"><input id="libSearch" type="search" placeholder="Search templates…" aria-label="Search templates"><div class="lib-list" id="library"></div></div></details>';
    // details + reminders
    h += '<details class="card sec" id="detailsCard"><summary><h2>Client details & reminders</h2></summary><div class="sec-body"><form id="clientForm">' +
      '<div class="grid3"><div><label for="f_name">Name the client sees</label><input id="f_name" name="display_name" value="' + esc(c.display_name) + '"></div>' +
      '<div><label for="f_lang">Language</label><select id="f_lang" name="language"><option value="en"' + (c.language === 'en' ? ' selected' : '') + '>English</option><option value="es"' + (c.language === 'es' ? ' selected' : '') + '>Español</option></select></div>' +
      '<div><label for="f_case">Case type</label><select id="f_case" name="case_type">' + caseOptions(c.case_type) + '</select></div></div>' +
      '<label for="f_msg">Message at the top of the checklist</label><textarea id="f_msg" name="message" rows="2"></textarea>' +
      '<div class="grid3"><div><label for="f_email">Client email</label><input id="f_email" name="contact_email" type="email" value="' + esc(c.contact_email || '') + '"></div>' +
      '<div><label for="f_phone">Client mobile (+1…)</label><input id="f_phone" name="contact_phone" type="tel" placeholder="+15555550123" value="' + esc(c.contact_phone || '') + '"></div>' +
      '<div><label for="f_time">Reminder time</label><input id="f_time" name="reminder_time" type="time" value="' + esc(r.time) + '"></div></div>' +
      '<label class="chk"><input type="checkbox" name="reminder_email"' + (r.email ? ' checked' : '') + '> Daily email reminder</label>' +
      '<label class="chk"><input type="checkbox" name="email_consent"' + (r.email_consent_at ? ' checked' : '') + '> Client agreed to email reminders</label>' +
      '<label class="chk"><input type="checkbox" name="reminder_sms"' + (r.sms ? ' checked' : '') + '> Daily text reminder <span class="badge warn">not active until SMS registration</span></label>' +
      '<label class="chk"><input type="checkbox" name="sms_consent"' + (r.sms_consent_at ? ' checked' : '') + '> Client agreed in writing to text reminders</label>' +
      '<label for="f_consent">How consent was given</label><input id="f_consent" name="consent_note" value="' + esc(r.consent_note || '') + '">' +
      (r.email_opted_out_at ? '<p class="notice">Client unsubscribed from emails on ' + esc(r.email_opted_out_at.slice(0, 10)) + ' (only they can re-subscribe).</p>' : '') +
      (r.sms_opted_out_at ? '<p class="notice">Client replied STOP on ' + esc(r.sms_opted_out_at.slice(0, 10)) + ' (only they can opt back in).</p>' : '') +
      '<div class="row" style="margin-top:.6rem"><button class="btn primary" type="submit">Save details</button><button class="btn ghost" type="button" id="archiveBtn">Archive client</button><button class="btn ghost" type="button" id="deleteBtn">Delete permanently…</button></div></form></div></details>';
    $('detail').innerHTML = h;
    $('f_msg').value = (c.checklist && c.checklist.message) || '';
    bindDetail(); renderLibrary();
  }

  function bindDetail() {
    var c = current;
    $('backBtn').onclick = function () { current = null; $('cols').classList.remove('has-client'); $('bar').classList.add('hidden'); $('detail').innerHTML = ''; renderList(); };
    $('getLink').onclick = function () { call('get_client_link', { client_id: c.id }).then(showLink).catch(fail); };
    $('rotateLink').onclick = function () { if (confirm('Replace the link? The old link stops working.')) call('rotate_link', { client_id: c.id }).then(function (l) { showLink(l); toast('New link created'); loadClients(); }).catch(fail); };
    if ($('revokeLink')) $('revokeLink').onclick = function () { if (confirm('Turn off the link? The client will not be able to open the checklist.')) call('revoke_link', { client_id: c.id }).then(refresh).catch(fail); };
    $('detail').querySelectorAll('.trow').forEach(function (row) {
      var id = row.getAttribute('data-id');
      row.querySelector('[data-act=remove]').onclick = function () { if (confirm('Remove this task from the client\'s list?')) call('remove_task', { task_id: id }).then(refresh).catch(fail); };
      row.querySelectorAll('input[data-k]').forEach(function (inp) {
        inp.onchange = function () {
          var k = inp.getAttribute('data-k'), a = { task_id: id };
          if (k === 'to') a.overrides = { to: inp.value.trim() }; else a[k] = k === 'due_date' ? (inp.value || null) : inp.value;
          call('edit_task', a).then(function () { toast('Saved'); loadClients(); }).catch(fail);
        };
      });
    });
    $('previewBtn').onclick = doPreview;
    bindMic();
    $('libSearch').oninput = renderLibrary;
    $('library').onclick = function (e) { var b = e.target.closest('[data-add]'); if (!b || b.disabled) return; call('add_tasks', { client_id: c.id, tasks: [{ library_id: b.getAttribute('data-add') }] }).then(function () { toast('Added'); refresh(); }).catch(fail); };
    $('clientForm').onsubmit = function (e) {
      e.preventDefault(); var f = e.target, v = function (n) { return f.elements[n]; };
      var patch = { client_id: c.id, display_name: v('display_name').value.trim(), language: v('language').value, case_type: v('case_type').value, message: v('message').value,
        contact_email: v('contact_email').value.trim() || null, contact_phone: v('contact_phone').value.trim() || null, reminder_time: v('reminder_time').value || '09:00',
        reminder_email: v('reminder_email').checked, reminder_sms: v('reminder_sms').checked, email_consent: v('email_consent').checked, sms_consent: v('sms_consent').checked, consent_note: v('consent_note').value };
      call('update_client', patch).then(function () { toast('Saved'); refresh(); }).catch(fail);
    };
    $('deleteBtn').onclick = function () {
      var n = prompt('This permanently deletes ' + c.display_name + '\'s checklist, progress, and links. Type the client name to confirm:');
      if (n === null) return;
      call('delete_client', { client_id: c.id, confirm_name: n }).then(function () { toast('Deleted'); current = null; $('detail').innerHTML = ''; $('cols').classList.remove('has-client'); $('bar').classList.add('hidden'); loadClients(); }).catch(fail);
    };
    $('archiveBtn').onclick = function () { if (confirm('Archive this client? Their link stops working.')) call('update_client', { client_id: c.id, archived: true }).then(function () { current = null; $('detail').innerHTML = ''; $('cols').classList.remove('has-client'); loadClients(); }).catch(fail); };
  }

  function showLink(l) {
    $('linkOut').classList.remove('hidden'); $('linkText').textContent = l.url; $('openLink').href = l.url; $('shareMsg').textContent = l.share_message;
    $('copyLink').onclick = function () { CC.copyText(l.share_message).then(function () { toast('Message with link copied'); }); };
    $('shareLink').textContent = navigator.share ? 'Share…' : 'Copy & share';
    $('shareLink').onclick = function () {
      if (navigator.share) navigator.share({ title: 'Your checklist', text: l.share_message }).catch(function () {});
      else CC.copyText(l.share_message).then(function () { toast('Copied — paste it into a text or email'); });
    };
    $('linkCard').scrollIntoView({ block: 'nearest' });
  }

  /* ---------- dictation preview (same parser as the AI tools) ---------- */
  function doPreview() {
    preview = window.CC_PARSE.parse($('dictation').value).map(function (p) { return { library_id: p.libId || '', title: p.title || '', due_date: p.due || '', heard: p.src || '' }; });
    $('parseMsg').textContent = preview.length ? 'Check, then add.' : 'Nothing recognized — try one task per line.';
    renderPreview();
  }
  function libOptions(sel) {
    return '<option value="">Custom task</option>' + ['doc', 'email', 'phone', 'online'].map(function (ty) {
      return '<optgroup label="' + TYPE[ty] + '">' + LIB.ITEMS.filter(function (it) { return it.type === ty; }).map(function (it) { return '<option value="' + it.id + '"' + (it.id === sel ? ' selected' : '') + '>' + esc(it.title.en) + '</option>'; }).join('') + '</optgroup>';
    }).join('');
  }
  function renderPreview() {
    if (!preview.length) { $('pvRows').innerHTML = ''; return; }
    $('pvRows').innerHTML = '<h3 style="margin:.8rem 0 .4rem">Check before adding</h3>' + preview.map(function (p, i) {
      return '<div class="pv-row" data-i="' + i + '"><div class="pv-main"><select data-pk="library_id" aria-label="Task ' + (i + 1) + '">' + libOptions(p.library_id) + '</select>' +
        (p.library_id ? '' : '<input data-pk="title" value="' + esc(p.title) + '" placeholder="Custom task title" aria-label="Custom task title">') + '</div>' +
        '<div class="pv-side"><input type="date" data-pk="due_date" value="' + p.due_date + '" aria-label="Due date"><button class="btn ghost icon" data-pv="remove" aria-label="Drop">✕</button></div>' +
        (p.heard ? '<div class="small muted pv-src">Heard: “' + esc(p.heard) + '”</div>' : '') + '</div>';
    }).join('') + '<div class="row"><button class="btn primary" id="addPreview">Add ' + preview.length + ' task' + (preview.length === 1 ? '' : 's') + '</button><button class="btn" id="cancelPreview">Cancel</button></div>';
    $('pvRows').querySelectorAll('[data-pk]').forEach(function (el) {
      el.addEventListener('change', function () { var p = preview[+el.closest('.pv-row').getAttribute('data-i')]; p[el.getAttribute('data-pk')] = el.value; if (el.getAttribute('data-pk') === 'library_id') renderPreview(); });
      el.addEventListener('input', function () { preview[+el.closest('.pv-row').getAttribute('data-i')][el.getAttribute('data-pk')] = el.value; });
    });
    $('pvRows').querySelectorAll('[data-pv=remove]').forEach(function (b) { b.onclick = function () { preview.splice(+b.closest('.pv-row').getAttribute('data-i'), 1); renderPreview(); }; });
    $('cancelPreview').onclick = function () { preview = []; renderPreview(); $('parseMsg').textContent = ''; };
    $('addPreview').onclick = function () {
      var tasks = preview.map(function (p) { var o = p.library_id ? { library_id: p.library_id } : { title: (p.title || '').trim() || 'Custom task' }; if (p.due_date) o.due_date = p.due_date; return o; });
      call('add_tasks', { client_id: current.id, tasks: tasks }).then(function (r) { toast('Added ' + r.added.length + (r.skipped.length ? ' (' + r.skipped.length + ' already on the list)' : '')); preview = []; refresh(); }).catch(fail);
    };
  }
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition, rec = null;
  function bindMic() {
    var btn = $('micBtn');
    btn.onclick = function () {
      if (!SR) { $('dictation').focus(); toast('Use your keyboard\'s 🎤 to dictate'); return; }
      if (rec) { rec.stop(); return; }
      rec = new SR(); rec.lang = 'en-US'; rec.continuous = true; var base = $('dictation').value;
      rec.onresult = function (ev) { var s = ''; for (var i = 0; i < ev.results.length; i++) s += ev.results[i][0].transcript + ' '; $('dictation').value = (base ? base + '\n' : '') + s.trim(); };
      rec.onend = function () { rec = null; btn.classList.remove('on'); btn.textContent = '🎤 Dictate'; };
      rec.onerror = function () { $('dictation').focus(); };
      try { rec.start(); btn.classList.add('on'); btn.textContent = '■ Stop'; } catch (e) { rec = null; $('dictation').focus(); }
    };
  }
  $('barDictate').onclick = function () { if (!current) return; $('quickCard').scrollIntoView({ block: 'start', behavior: 'smooth' }); $('micBtn').click(); };
  $('barLink').onclick = function () { if (current) $('getLink').click(); };

  function renderLibrary() {
    var q = ($('libSearch').value || '').trim().toLowerCase(), used = {};
    current.tasks.forEach(function (t) { if (t.library_id) used[t.library_id] = 1; });
    $('library').innerHTML = LIB.ITEMS.filter(function (it) { return !q || (it.title.en + ' ' + it.summary.en + ' ' + it.keywords.join(' ')).toLowerCase().indexOf(q) >= 0; }).map(function (it) {
      return '<button type="button" class="lib-item' + (used[it.id] ? ' added' : '') + '" data-add="' + it.id + '"' + (used[it.id] ? ' disabled' : '') + '><span class="t"><b>' + esc(it.title.en) + '</b><span class="badge ' + it.type + '">' + TYPE[it.type] + '</span>' +
        (it.phoneDisplay ? '<span class="small muted"> · ' + esc(it.phoneDisplay) + (it.verified ? ' ✓' : '') + '</span>' : '') + '</span><span class="add-pill">' + (used[it.id] ? '✓ Added' : '+ Add') + '</span></button>';
    }).join('');
  }

  /* ---------- new client ---------- */
  $('newClientBtn').onclick = function () {
    current = null; $('cols').classList.add('has-client'); $('bar').classList.add('hidden');
    $('detail').innerHTML = '<div class="card"><button class="btn small ghost" id="backBtn2">← All clients</button><h2>New client</h2><form id="newForm">' +
      '<label for="n_name">Name the client sees</label><input id="n_name" required placeholder="First name is enough">' +
      '<div class="grid2"><div><label for="n_lang">Language</label><select id="n_lang"><option value="en">English</option><option value="es">Español</option></select></div>' +
      '<div><label for="n_case">Case type</label><select id="n_case">' + caseOptions('family_gc') + '</select></div></div>' +
      '<label class="chk"><input type="checkbox" id="n_suggest" checked> Start with the suggested tasks for this case type</label>' +
      '<label for="n_dict">Tasks (optional) — type or dictate</label><textarea id="n_dict" rows="2" placeholder="birth certificate and tax transcripts by Nov 15"></textarea>' +
      '<p class="small muted">No SSNs, A-numbers, or case facts here.</p><button class="btn primary block" type="submit">Create checklist + link</button></form></div>';
    $('backBtn2').onclick = function () { $('cols').classList.remove('has-client'); $('detail').innerHTML = ''; };
    $('newForm').onsubmit = function (e) {
      e.preventDefault();
      var ct = $('n_case').value, args = { display_name: $('n_name').value.trim(), language: $('n_lang').value, case_type: ct };
      if ($('n_suggest').checked) args.tasks = (LIB.CASE_TYPES[ct].suggested || []).map(function (id) { return { library_id: id }; });
      if ($('n_dict').value.trim()) args.dictation = $('n_dict').value.trim();
      call('create_client', args).then(function (r) { toast('Created'); loadClients(r.client.id).then(function () { if (r.link) setTimeout(function () { showLink(r.link); }, 50); }); }).catch(fail);
    };
    $('n_name').focus();
  };

  /* ---------- settings: office profile + AI assistant connection ---------- */
  $('settingsBtn').onclick = function () {
    current = null; $('cols').classList.add('has-client'); $('bar').classList.add('hidden');
    Promise.all([call('get_profile'), call('list_api_keys')]).then(function (res) {
      var p = res[0] || {}, keys = res[1] || [];
      $('detail').innerHTML = '<div class="card"><button class="btn small ghost" id="backBtn3">← All clients</button><h2>Office profile (shown to clients)</h2><form id="profForm">' +
        '<div class="grid3"><div><label for="p_name">Office name</label><input id="p_name" value="' + esc(p.office_name || '') + '"></div><div><label for="p_phone">Office phone</label><input id="p_phone" value="' + esc(p.office_phone || '') + '"></div>' +
        '<div><label for="p_email">Office email</label><input id="p_email" type="email" value="' + esc(p.office_email || '') + '"></div></div><button class="btn primary" style="margin-top:.6rem">Save</button></form></div>' +
        '<div class="card"><h2>Connect your AI assistant</h2><p class="small">Server URL (MCP, Streamable HTTP):</p><div class="keybox" id="mcpUrl">' + esc(APP.mcpUrl) + '</div>' +
        '<p class="small">Header: <code>Authorization: Bearer &lt;key&gt;</code>. Make one key per assistant so you can revoke them separately.</p>' +
        '<form id="keyForm" class="row"><input id="k_label" placeholder="Key name, e.g. Claude" class="grow" style="width:auto" required><button class="btn primary">Create key</button></form><div id="newKey"></div>' +
        '<h3 style="margin-top:1rem">Keys</h3>' + (keys.length ? keys.map(function (k) {
          return '<div class="row" style="border-top:1px solid var(--line);padding:.4rem 0"><span class="grow"><b>' + esc(k.label) + '</b> <code>' + esc(k.key_prefix) + '…</code><br><span class="small muted">created ' + esc(k.created_at.slice(0, 10)) +
            (k.last_used_at ? ' · last used ' + esc(k.last_used_at.slice(0, 10)) : ' · never used') + (k.revoked_at ? ' · revoked' : '') + '</span></span>' + (k.revoked_at ? '' : '<button class="btn small" data-revoke="' + k.id + '">Revoke</button>') + '</div>';
        }).join('') : '<p class="muted small">No keys yet.</p>') + '</div>';
      $('backBtn3').onclick = function () { $('cols').classList.remove('has-client'); $('detail').innerHTML = ''; };
      $('profForm').onsubmit = function (e) { e.preventDefault(); call('update_profile', { office_name: $('p_name').value, office_phone: $('p_phone').value, office_email: $('p_email').value }).then(function () { toast('Saved'); }).catch(fail); };
      $('keyForm').onsubmit = function (e) {
        e.preventDefault();
        call('create_api_key', { label: $('k_label').value.trim() }).then(function (k) {
          $('newKey').innerHTML = '<p class="notice" style="margin-top:.6rem">Copy this key now — it is not shown again.</p><div class="keybox" id="keyText">' + esc(k.key) + '</div><button class="btn small" id="copyKey" style="margin-top:.4rem">Copy key</button>';
          $('copyKey').onclick = function () { CC.copyText(k.key).then(function () { toast('Key copied'); }); };
        }).catch(fail);
      };
      $('detail').querySelectorAll('[data-revoke]').forEach(function (b) { b.onclick = function () { if (confirm('Revoke this key? The assistant using it stops working.')) call('revoke_api_key', { key_id: b.getAttribute('data-revoke') }).then(function () { $('settingsBtn').click(); }).catch(fail); }; });
    }).catch(fail);
  };

  window.__attorney = { call: call, sb: sb, current: function () { return current; } };
})();
