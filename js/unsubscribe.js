(function () {
  'use strict';
  var q = new URLSearchParams(location.search), st = document.getElementById('status'), btn = document.getElementById('resub');
  var body = { c: q.get('c'), ch: q.get('ch') || 'email', s: q.get('s') };
  function send(action) {
    body.action = action;
    return fetch(window.CC_APP.functionsUrl + '/unsubscribe', { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: window.CC_APP.anonKey }, body: JSON.stringify(body), referrerPolicy: 'no-referrer' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
  }
  if (!body.c || !body.s) { st.textContent = 'This link is incomplete. / Este enlace está incompleto.'; return; }
  send('unsubscribe').then(function () {
    st.textContent = 'You will not get reminder emails anymore. Your checklist link still works. / Ya no recibirá recordatorios por correo. Su enlace sigue funcionando.';
    btn.classList.remove('hidden');
  }).catch(function () { st.textContent = 'Sorry, this link did not work. Please contact the office. / Lo sentimos, el enlace no funcionó. Comuníquese con la oficina.'; });
  btn.onclick = function () {
    send('resubscribe').then(function () { st.textContent = 'Reminder emails are back on. / Los recordatorios están activados de nuevo.'; btn.classList.add('hidden'); })
      .catch(function () { st.textContent = 'Sorry, that did not work. / Lo sentimos, no funcionó.'; });
  };
})();
