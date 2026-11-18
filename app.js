/* App de inglés de Amy · todo funciona en el móvil y sin servidor.
   Los datos se guardan en este dispositivo (localStorage + IndexedDB para audios). */

// ================= utilidades =================
const $ = s => document.querySelector(s);
const z = n => String(n).padStart(2, '0');
const dk = (d = new Date()) => d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate());
const addDays = (k, n) => { const d = new Date(k + 'T12:00:00'); d.setDate(d.getDate() + n); return dk(d); };
const diffDays = (a, b) => Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 864e5);
const fmt = k => new Date(k + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const lvl = n => n == null ? '—' : LEVELS[Math.round(n * 2) / 2] || '—';
let toastT;
function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2800); }

// ================= estado =================
const KEY = 'amy-english-v2';
const fresh = () => ({ accent: 'en-GB', rate: 0.95, track: 'both', start: START, days: {}, cards: {}, mine: [], err: {}, itemMiss: {}, shadow: {}, speak: [], tests: [], grades: [], answers: {}, prepared: {}, ms: {}, listen: [], friends: { eps: 0 } });
let S;
try { S = Object.assign(fresh(), JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { S = fresh(); }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast('No se pudo guardar'); } };
const today = () => dk();
const day = (k = today()) => S.days[k] || (S.days[k] = { done: {}, min: 0 });
const dayNum = () => Math.max(1, diffDays(S.start, today()) + 1);
const weekNum = () => Math.ceil(dayNum() / 7);
const allTests = () => [DIAGNOSIS, ...S.tests];

// ================= bloques del día =================
const BLOCKS = {
  cards: { n: 'Tarjetas', min: 8, i: '🗂️', go: '#vocab' },
  drill: { n: 'Tus errores', min: 8, i: '🎯', go: '#drill' },
  listen: { n: 'Listening nuevo', min: 12, i: '🎧', go: '#listen' },
  shadow: { n: 'Shadowing', min: 7, i: '🗣️', go: '#shadow' },
  speak: { n: 'Speaking', min: 10, i: '🎙️', go: '#speak' }
};
function markDone(id, on = true) {
  const d = day(), was = !!d.done[id];
  if (on === was) return;
  d.done[id] = on; d.min += (on ? 1 : -1) * (BLOCKS[id] ? BLOCKS[id].min : 0);
  save();
  if (on) { const n = Object.keys(BLOCKS).filter(b => d.done[b]).length; toast(n === 5 ? '🔥 ¡Día completo! 45 min activos hechos' : '✓ ' + (BLOCKS[id] ? BLOCKS[id].n : 'Hecho') + ' (' + n + '/5)'); }
}
const activeDone = k => S.days[k] ? Object.keys(BLOCKS).filter(b => S.days[k].done[b]).length : 0;
function streak() { let k = today(), n = 0; if (activeDone(k) < 3) k = addDays(k, -1); while (activeDone(k) >= 3) { n++; k = addDays(k, -1); } return n; }

// ================= errores: dominio y prioridad =================
const errState = id => S.err[id] || (S.err[id] = { hist: [], det: 0 });
function mastery(id) { const h = errState(id).hist.slice(-12); return h.length < 3 ? null : h.reduce((a, b) => a + b, 0) / h.length; }
function priority(e) { const m = mastery(e.id); return e.w * (1 - (m == null ? 0.25 : m)) + Math.min(errState(e.id).det, 6) * 0.3; }
function focusErrors() {
  const ranked = ERRORS.map(e => ({ e, p: priority(e) })).sort((a, b) => b.p - a.p);
  const top = ranked.slice(0, 4), off = dayNum() % 2; // rota entre los 4 más urgentes para no repetir
  return [top[0].e, top[1 + off].e];
}

// Detector de TUS errores en lo que escribes o dices
const DETECT = [
  [/\b(i am|i'm) agree\b/i, 'calco', '"I agree" (sin am)'],
  [/\bdepends? of\b/i, 'calco', '"depends on"'],
  [/\bcontact with (me|us|you|him|her)\b/i, 'calco', '"contact me" (sin with)'],
  [/\bin advice\b/i, 'calco', '"in advance"'],
  [/\bexplain(ed|s)? (me|him|her|us|them)\b/i, 'calco', '"explain sth to me"'],
  [/\bsay me\b/i, 'calco', '"tell me"'],
  [/\bdiscuss(ed|ing)? about\b/i, 'calco', '"discuss sth" (sin about)'],
  [/\bi have \d+ years\b/i, 'calco', '"I\'m 26"'],
  [/\bexperience on\b/i, 'calco', '"experience with / in"'],
  [/\bwant that (you|he|she|they|we)\b/i, 'calco', '"want you to…"'],
  [/\b(i|we|they|you) (live|work|study|know)\b[^.]{0,40}\bsince\b/i, 'since', 'con since → "have lived / have worked"'],
  [/\b(he|she) (lives|works|studies|knows)\b[^.]{0,40}\bsince\b/i, 'since', 'con since → "has lived / has worked"'],
  [/\blooking forward to (meet|see|hear|work|talk|speak|start|join)\b/i, 'ing', '"looking forward to meeting / hearing…"'],
  [/\b(am|'m|is|are|get|got|getting) used to (wake|work|speak|do|go|live|get|have|be|make|talk)\b/i, 'ing', '"used to + -ing"'],
  [/\b(interested in|good at) (work|analyse|analyze|learn|start|speak|do|make|use|move|go|be|manage|lead)\b/i, 'ing', 'preposición + -ing'],
  [/\b(before|without) (start|speak|analyse|analyze|learn|use|move|say|finish)\b/i, 'ing', 'preposición + -ing (before starting)'],
  [/\bpeople (is|was|has)\b/i, 'agree', '"people are"'],
  [/\b(informations|advices|an advice|experiences in)\b/i, 'agree', 'information / advice / experience son incontables'],
  [/\bthere was (a lot of|many|lots of) \w+s\b/i, 'agree', '"there were" + plural'],
  [/\bif i would\b/i, 'unreal', '"If I had…" (nunca if I would)'],
  [/\b(when|as soon as|before) (i|we|you) will\b/i, 'future', 'tras when/as soon as → presente'],
  [/\bdespite of\b/i, 'contrast', '"despite" (sin of) o "in spite of"'],
  [/\bdo you know (where|what|when|how) (is|are|does|do)\b/i, 'order', '"Do you know where the office is?"'],
  [/\bi like very much\b/i, 'order', '"I really like…"'],
  [/\b(i am|i'm) (economist|analyst|engineer)\b/i, 'articles', '"I\'m an economist"'],
  [/\bmaster (on|in)\b/i, 'articles', '"a master\'s in…"'],
  [/\bthe (fashion|life) (is|in)\b/i, 'articles', 'en general, sin "the"']
];
function detect(text, count = false) {
  const out = [];
  DETECT.forEach(([re, id, fix]) => { const m = text.match(re); if (m) { out.push({ id, hit: m[0], fix }); if (count) errState(id).det++; } });
  if (count && out.length) save();
  return out;
}
const flagsHtml = f => !f.length ? '<p class="ok">✓ No he detectado ninguno de tus errores típicos.</p>'
  : `<div class="flags"><b>Tus errores típicos aquí:</b>${f.map(x => `<div>✗ <i>${esc(x.hit)}</i> → ${esc(x.fix)} <a href="#drill/${x.id}">practicar</a></div>`).join('')}</div>`;

// ================= voz =================
let voices = [];
const loadVoices = () => { voices = 'speechSynthesis' in window ? speechSynthesis.getVoices() : []; };
if ('speechSynthesis' in window) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
function say(text, rate = S.rate) {
  if (!('speechSynthesis' in window)) { toast('Este navegador no puede leer en voz alta'); return; }
  const u = new SpeechSynthesisUtterance(text); u.lang = S.accent; u.rate = rate;
  const v = voices.find(v => v.lang.replace('_', '-') === S.accent && /natural|enhanced|premium|google/i.test(v.name)) || voices.find(v => v.lang.replace('_', '-') === S.accent) || voices.find(v => v.lang.startsWith('en'));
  if (v) u.voice = v;
  speechSynthesis.cancel(); speechSynthesis.speak(u);
}
const SRC = window.SpeechRecognition || window.webkitSpeechRecognition;
function hearOnce(cb) {
  if (!SRC) { toast('Aquí no hay reconocimiento de voz. Usa Chrome (Android) o Safari (iPhone).'); return; }
  const r = new SRC(); r.lang = S.accent; r.interimResults = false; r.maxAlternatives = 1;
  r.onresult = e => cb(e.results[0][0].transcript);
  r.onerror = e => toast(e.error === 'not-allowed' ? 'Dale permiso al micrófono' : 'No te he oído bien. Prueba otra vez.');
  r.start(); toast('🎙️ Te escucho…');
}
const words = s => s.toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9' ]/g, ' ').split(/\s+/).filter(Boolean);
function matchWords(target, heard) {
  const t = words(target), pool = {};
  words(heard).forEach(w => pool[w] = (pool[w] || 0) + 1);
  let ok = 0;
  const html = target.split(/\s+/).map(tok => { const w = words(tok)[0]; if (w && pool[w]) { pool[w]--; ok++; return esc(tok); } return w ? '<u class="miss">' + esc(tok) + '</u>' : esc(tok); }).join(' ');
  return { pct: Math.round(100 * ok / Math.max(1, t.length)), html };
}

// Speaking libre con transcripción (continuo)
let SP = null; // {prompt, ctx, t0, finals, interim, r, running, timer, result}
function speakStart(prompt, ctx) {
  if (!SRC) { toast('Aquí no hay reconocimiento de voz. Usa Chrome (Android) o Safari (iPhone), o graba audio.'); return; }
  SP = { prompt, ctx, t0: Date.now(), finals: [], interim: '', running: true, result: null };
  const startR = () => {
    const r = new SRC(); r.lang = S.accent; r.interimResults = true; r.continuous = true;
    r.onresult = e => { let im = ''; for (let i = e.resultIndex; i < e.results.length; i++) { if (e.results[i].isFinal) SP.finals.push(e.results[i][0].transcript.trim()); else im += e.results[i][0].transcript; } SP.interim = im; const el = $('#live'); if (el) el.textContent = (SP.finals.join(' ') + ' ' + im).trim() || '…'; };
    r.onerror = e => { if (e.error === 'not-allowed') { SP.running = false; toast('Dale permiso al micrófono'); render(); } };
    r.onend = () => { if (SP && SP.running) { try { startR(); } catch (e) { } } };
    r.start(); SP.r = r;
  };
  startR();
  SP.timer = setInterval(() => { const el = $('#timer'); if (el && SP) el.textContent = clock((Date.now() - SP.t0) / 1000); }, 500);
  render();
}
const clock = s => Math.floor(s / 60) + ':' + z(Math.floor(s % 60));
function speakStop() {
  const sp = SP; if (!sp) return;
  sp.running = false; clearInterval(sp.timer); try { sp.r.stop(); } catch (e) { }
  const secs = (Date.now() - sp.t0) / 1000;
  setTimeout(() => {
    const text = (sp.finals.join(' ') + ' ' + sp.interim).trim(), n = words(text).length;
    const res = { d: today(), prompt: sp.prompt, ctx: sp.ctx, text, secs: Math.round(secs), words: n, wpm: secs > 5 ? Math.round(n / (secs / 60)) : 0 };
    res.flags = detect(text, true);
    sp.result = res;
    if (n >= 15) { S.speak.push(res); if (S.speak.length > 300) S.speak.shift(); markDone('speak'); }
    save(); render();
  }, 600);
}
const speakBox = (prompt, ctx) => {
  if (SP && SP.running && SP.ctx === ctx) return `<div class="live-wrap"><div class="row sp"><span class="rec">● Te escucho</span><b id="timer">0:00</b></div><p id="live" class="live">…</p><button class="btn warn full" data-act="spstop">⏹ Terminar</button></div>`;
  let out = `<button class="btn full" data-act="spstart" data-p="${esc(prompt)}" data-c="${esc(ctx)}">🎙️ Hablar (con transcripción)</button>`;
  if (SP && SP.result && SP.ctx === ctx) {
    const r = SP.result;
    out = `<div class="result"><div class="stats"><div class="stat"><b>${r.wpm}</b><span>palabras/min</span></div><div class="stat"><b>${r.words}</b><span>palabras</span></div><div class="stat"><b>${clock(r.secs)}</b><span>tiempo</span></div></div>
      <p class="muted" style="margin-top:8px">Nativo conversando: ~140–160 · Objetivo semana 6: 100 · semana 9: 110</p>
      <div class="passage">${esc(r.text) || '<i>No he captado nada. Habla un poco más cerca del micro.</i>'}</div>${flagsHtml(r.flags)}
      <button class="btn ghost small" data-act="copy" data-t="${esc('Pregunta: ' + r.prompt + '\n\nMi respuesta (transcripción automática, ' + r.wpm + ' palabras/min):\n' + r.text)}">📋 Copiar para que me lo corrijas</button></div>` + out.replace('🎙️ Hablar (con transcripción)', '🔁 Otra vez');
  }
  return out;
};

// ================= grabaciones (audio) =================
const idb = () => new Promise((res, rej) => { const r = indexedDB.open('amy-english-rec', 1); r.onupgradeneeded = () => r.result.createObjectStore('recs', { keyPath: 'id' }); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
async function recPut(o) { const d = await idb(); return new Promise((res, rej) => { const tx = d.transaction('recs', 'readwrite'); tx.objectStore('recs').put(o); tx.oncomplete = res; tx.onerror = () => rej(tx.error); }); }
async function recAll() { const d = await idb(); return new Promise((res, rej) => { const q = d.transaction('recs').objectStore('recs').getAll(); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); }); }
async function recDel(id) { const d = await idb(); return new Promise(res => { const tx = d.transaction('recs', 'readwrite'); tx.objectStore('recs').delete(id); tx.oncomplete = res; }); }
let MR = null, MRt0 = 0, MRtimer = null;
async function recStart(label) {
  try {
    const st = await navigator.mediaDevices.getUserMedia({ audio: true });
    const m = new MediaRecorder(st), chunks = [];
    m.ondataavailable = e => chunks.push(e.data);
    m.onstop = async () => {
      st.getTracks().forEach(t => t.stop()); clearInterval(MRtimer);
      await recPut({ id: Date.now(), date: today(), day: dayNum(), label, secs: Math.round((Date.now() - MRt0) / 1000), blob: new Blob(chunks, { type: m.mimeType || 'audio/webm' }) });
      markDone('speak'); toast('Grabación guardada'); render();
    };
    m.start(); MR = m; MRt0 = Date.now();
    MRtimer = setInterval(() => { const el = $('#rtimer'); if (el) el.textContent = clock((Date.now() - MRt0) / 1000); }, 500);
    render();
  } catch (e) { toast('No tengo acceso al micrófono'); }
}
function recStop() { if (MR && MR.state !== 'inactive') MR.stop(); MR = null; }
const recBtn = label => MR ? `<button class="btn warn full" data-act="recstop">⏹ Parar y guardar · <span id="rtimer">0:00</span></button>`
  : `<button class="btn ghost full" data-act="recstart" data-l="${esc(label)}">⏺ Grabar audio (antes y después)</button>`;

// ================= router =================
const ROUTES = {
  hoy: ['Hoy', vHoy], practica: ['Practicar', vPractica], drill: ['Tus errores', vDrill], errores: ['Mapa de errores', vErrores],
  vocab: ['Tarjetas', vVocab], shadow: ['Shadowing', vShadow], listen: ['Listening y Friends', vListen], speak: ['Hablar', vSpeak],
  recs: ['Antes y después', vRecs], entrevista: ['Entrevistas', vEntrevista], q: ['Pregunta', vQuestion], sim: ['Simulacro', vSim],
  test: ['Re-test', vTest], progreso: ['Progreso', vProgreso], ajustes: ['Ajustes', vAjustes]
};
const PARENT = { drill: 'practica', errores: 'practica', vocab: 'practica', shadow: 'practica', listen: 'practica', recs: 'speak', q: 'entrevista', sim: 'entrevista', test: 'progreso', ajustes: 'progreso' };
const parse = () => { const [r, a] = location.hash.slice(1).split('/'); return { r: ROUTES[r] ? r : 'hoy', a: a ? decodeURIComponent(a) : '' }; };
let R = parse();
function render() {
  R = parse();
  const [title, fn] = ROUTES[R.r];
  $('#title').textContent = title;
  $('#back').hidden = !PARENT[R.r];
  $('main').innerHTML = fn(R.a);
  const nav = PARENT[R.r] || R.r;
  document.querySelectorAll('nav a').forEach(a => a.classList.toggle('on', a.dataset.r === nav));
  if (R.r === 'recs') fillRecs();
}
window.addEventListener('hashchange', () => { const prev = R.r; if (SP && SP.running) speakStop(); if (prev !== parse().r) { DR = null; CS = null; SIMS = null; } render(); window.scrollTo(0, 0); });

// ================= HOY =================
function listenSuggestion() { const w = weekNum(); return w <= 4 ? LISTEN_SOURCES[0] : w <= 8 ? LISTEN_SOURCES[dayNum() % 2 ? 1 : 0] : LISTEN_SOURCES[1 + dayNum() % 2]; }
function speakPromptToday() {
  const n = dayNum();
  if (n % 2) { const qs = trackQs(); return { p: qs[Math.floor(n / 2) % qs.length].q, why: 'pregunta de entrevista del día' }; }
  const e = focusErrors()[0]; return { p: e.speak[Math.floor(n / 2) % e.speak.length], why: 'para tu error: ' + e.t };
}
const friendsStage = () => FRIENDS.find(f => weekNum() >= f.from && weekNum() <= f.to);
function retestDue() { return RETESTS.find(t => dayNum() >= t.week * 7 - 3 && !S.tests.some(x => x.form === t.id)); }
function vHoy() {
  const d = day(), n = activeDone(today()), fe = focusErrors(), due = dueCards().length, ms = MILESTONES.find(m => m.w === weekNum()), rt = retestDue(), sp = speakPromptToday(), src = listenSuggestion();
  const sub = {
    cards: due ? due + ' para repasar + nuevas' : 'Palabras nuevas de hoy',
    drill: 'Hoy: ' + fe.map(e => e.t).join(' + '),
    listen: src.t + ' · con el método de 5 pasos',
    shadow: '5 frases · ' + SHADOW[dayNum() % SHADOW.length].g,
    speak: '«' + sp.p + '»'
  };
  const missingSpeak = DIAGNOSIS.skills.speaking == null;
  return `
  <div class="hero"><div><div class="muted">Día ${dayNum()} · Semana ${weekNum()} de 12</div><h2>${n === 5 ? '¡Hoy ya está! 🔥' : n ? 'Vas por ' + n + ' de 5' : 'Tu plan de hoy'}</h2></div>
    <div class="ring" style="--p:${n * 20}"><b>${n}/5</b></div></div>
  ${missingSpeak && dayNum() <= 7 ? `<div class="card hi"><h2>🎙️ Falta tu speaking del diagnóstico</h2><p>Graba tus dos respuestas del día 1 (también quedan como tu "antes"):</p><a class="btn full" href="#speak/dia1">Hacerlo ahora</a></div>` : ''}
  ${rt ? `<div class="card hi"><h2>📈 Toca ${rt.title}</h2><p class="muted">35 minutos. Hoy cuenta como tu día completo.</p><a class="btn full" href="#test/${rt.id}">Empezar re-test</a></div>` : ''}
  <div class="card"><div class="row sp"><h2>45 min activos</h2><span class="muted">${d.min} min hechos</span></div>
    ${Object.entries(BLOCKS).map(([id, b]) => `<div class="task"><button class="check ${d.done[id] ? 'on' : ''}" data-act="toggle" data-id="${id}" aria-label="Marcar ${b.n}">${d.done[id] ? '✓' : ''}</button>
      <a class="body" href="${b.go}"><b>${b.i} ${b.n}</b> <span class="tag">${b.min} min</span><div class="muted">${esc(sub[id])}</div></a></div>`).join('')}
  </div>
  <div class="card"><div class="row sp"><h2>📺 45 min pasivos</h2><button class="check ${d.done.friends ? 'on' : ''}" data-act="toggle" data-id="friends" aria-label="Marcar Friends">${d.done.friends ? '✓' : ''}</button></div>
    <p><b>${friendsStage().t}</b></p><p class="muted">${friendsStage().d}</p><a class="go" href="#listen">Plan Friends →</a></div>
  <div class="stats"><div class="stat"><b>${streak()}</b><span>días seguidos</span></div><div class="stat"><b>${learnedCount()}</b><span>palabras aprendidas</span></div><div class="stat"><b>${lastWpm() || '—'}</b><span>palabras/min</span></div></div>
  ${ms ? `<div class="card" style="margin-top:14px"><h2>🎯 Hito de la semana ${ms.w}: ${ms.t}</h2>${ms.k.map((k, i) => msRow(ms.w, i, k)).join('')}</div>` : ''}`;
}
const msRow = (w, i, k) => `<label class="msrow"><input type="checkbox" data-act="ms" data-k="${w}-${i}" ${S.ms[w + '-' + i] ? 'checked' : ''}> <span>${esc(k)}</span></label>`;
const lastWpm = () => { const l = S.speak.filter(s => s.secs >= 30).slice(-5); return l.length ? Math.round(l.reduce((a, b) => a + b.wpm, 0) / l.length) : 0; };

// ================= PRACTICAR =================
function vPractica() {
  const fe = focusErrors();
  return `<div class="grid2">
    <a class="tile" href="#drill"><span class="i">🎯</span><b>Tus errores</b><span>Hoy: ${esc(fe[0].t)}</span></a>
    <a class="tile" href="#vocab"><span class="i">🗂️</span><b>Tarjetas</b><span>${dueCards().length} para repasar</span></a>
    <a class="tile" href="#shadow"><span class="i">🗣️</span><b>Shadowing</b><span>Escucha, repite, puntuación</span></a>
    <a class="tile" href="#listen"><span class="i">🎧</span><b>Listening y Friends</b><span>${esc(friendsStage().t.split('·')[0])}</span></a>
    <a class="tile" href="#errores"><span class="i">🗺️</span><b>Mapa de errores</b><span>Reglas y dominio</span></a>
    <a class="tile" href="#speak"><span class="i">🎙️</span><b>Hablar</b><span>Monólogo + detector</span></a>
  </div>
  <div class="card"><h2>💡 Speaking sin depender de nadie</h2>${SPEAK_IDEAS.map(x => `<details><summary>${esc(x.t)}</summary><div>${esc(x.d)}</div></details>`).join('')}</div>`;
}

// ---------- drill de errores ----------
let DR = null;
const normal = s => ' ' + s.toLowerCase().replace(/[’‘]/g, "'").replace(/[.!?,;:"]/g, ' ').replace(/\s+/g, ' ').trim() + ' ';
const CONTR = [["i'm", 'i am'], ["i've", 'i have'], ["i'll", 'i will'], ["i'd", 'i would'], ["don't", 'do not'], ["didn't", 'did not'], ["it's", 'it is'], ["can't", 'cannot'], ["we're", 'we are'], ["you're", 'you are'], ["that's", 'that is'], ["hadn't", 'had not'], ["wouldn't", 'would not']];
const canon = s => CONTR.reduce((t, [a, b]) => t.split(' ' + a + ' ').join(' ' + b + ' '), normal(s)).trim();
function buildDrill(ids) {
  const items = [];
  ids.forEach(id => {
    const e = ERRORS.find(x => x.id === id); if (!e) return;
    const scored = e.items.map((it, i) => ({ e, it, i, k: id + i, s: (S.itemMiss[id + i] || 0) * 2 + Math.random() }));
    scored.sort((a, b) => b.s - a.s).slice(0, ids.length === 1 ? 8 : 4).forEach(x => items.push(x));
  });
  return { items: shuffle(items), i: 0, ans: null, ok: 0, ids };
}
function vDrill(a) {
  if (!DR || (a && DR.ids.join() !== a)) DR = buildDrill(a ? [a] : focusErrors().map(e => e.id));
  if (DR.i >= DR.items.length) {
    const pct = Math.round(100 * DR.ok / DR.items.length);
    return `<div class="card flash"><div class="big">${DR.ok}/${DR.items.length} · ${pct}%</div><p>${pct >= 80 ? '¡Muy bien! Este error se está yendo.' : 'Bien hecho: los que fallaste volverán más a menudo hasta que salgan solos.'}</p>
      ${DR.ids.map(id => { const e = ERRORS.find(x => x.id === id); const m = mastery(id); return `<p><b>${esc(e.t)}</b>: dominio ${m == null ? '—' : Math.round(m * 100) + '%'}</p>`; }).join('')}
      <div class="row" style="justify-content:center"><button class="btn" data-act="drillagain">Otra ronda</button><a class="btn ghost" href="#hoy">Volver a Hoy</a></div></div>`;
  }
  const x = DR.items[DR.i], it = x.it;
  let body;
  if (it.mc) {
    body = `<p class="q">${esc(it.mc)}</p>` + it.o.map((o, i) => `<button class="opt ${DR.ans != null ? (i === it.c ? 'good' : i === DR.ans ? 'bad' : '') : ''}" data-act="mc" data-i="${i}" ${DR.ans != null ? 'disabled' : ''}>${esc(o)}</button>`).join('');
  } else {
    body = `<p class="muted">Escribe la frase bien${it.h ? ' ' + esc(it.h) : ''}:</p><p class="q wrong">${esc(it.fix)}</p>
      <textarea id="fixin" rows="2" autocapitalize="sentences" ${DR.ans != null ? 'disabled' : ''} placeholder="Escríbela correcta…">${esc(DR.typed || '')}</textarea>`;
    if (DR.ans == null) body += `<button class="btn full" data-act="fixcheck">Comprobar</button>`;
  }
  let fb = '';
  if (DR.ans != null) {
    const good = DR.ans === true || (it.mc && DR.ans === it.c);
    fb = `<div class="fb ${good ? 'good' : 'bad'}">${good ? '✓ ¡Correcto!' : '✗ No exactamente.'}${it.fix ? `<div>Modelo: <b>${esc(it.a[0])}</b></div>` : ''}<div class="muted rule">${x.e.rule}</div></div>`;
    if (it.fix && DR.ans === 'pending') fb = `<div class="fb">Mi respuesta modelo: <b>${esc(it.a[0])}</b><p class="muted">No coincide letra a letra. ¿La tuya era correcta también?</p><div class="row"><button class="btn small" data-act="selfgrade" data-ok="1">Sí, estaba bien</button><button class="btn small ghost" data-act="selfgrade" data-ok="0">No, fallé</button></div></div>`;
    else fb += `<button class="btn full" data-act="drillnext">Siguiente →</button>`;
  }
  return `<div class="row sp"><span class="tag">${esc(x.e.t)}</span><span class="muted">${DR.i + 1}/${DR.items.length}</span></div>
    <div class="bar"><i style="width:${100 * DR.i / DR.items.length}%"></i></div><div class="card">${body}${fb}</div>`;
}
function drillRecord(ok) {
  const x = DR.items[DR.i], st = errState(x.e.id);
  st.hist.push(ok ? 1 : 0); if (st.hist.length > 40) st.hist.shift();
  S.itemMiss[x.k] = ok ? Math.max(0, (S.itemMiss[x.k] || 0) - 1) : (S.itemMiss[x.k] || 0) + 1;
  if (ok) DR.ok++;
  if (DR.i === DR.items.length - 1) markDone('drill');
  save();
}

function vErrores() {
  return `<p class="muted">Tus errores, ordenados por prioridad. Sube el dominio practicando; si el detector los pilla al hablar o escribir, suben de prioridad.</p>` +
    ERRORS.map(e => ({ e, p: priority(e) })).sort((a, b) => b.p - a.p).map(({ e }) => { const m = mastery(e.id); const st = errState(e.id); return `<div class="card"><div class="row sp"><h2>${esc(e.t)}</h2><span class="tag ${m != null && m >= .85 ? '' : 'w'}">${m == null ? 'sin datos' : Math.round(m * 100) + '%'}</span></div>
      <div class="bar"><i style="width:${m == null ? 0 : m * 100}%"></i></div><p class="rule">${e.rule}</p>${st.det ? `<p class="muted">Detectado ${st.det} ${st.det === 1 ? 'vez' : 'veces'} en lo que has dicho o escrito.</p>` : ''}<a class="btn small" href="#drill/${e.id}">Practicar este</a></div>`; }).join('');
}

// ---------- tarjetas (repetición espaciada) ----------
const IV = [0, 1, 3, 7, 14, 30, 60, 120];
const NEW_PER_DAY = 8;
const pool = () => [...VOCAB, ...S.mine];
const dueCards = () => pool().filter(c => S.cards[c.id] && S.cards[c.id].due <= today());
const learnedCount = () => Object.values(S.cards).filter(c => c.box >= 3).length;
let CS = null;
function buildCards() {
  const order = { diag: 0, mine: 0, job: 1, data: S.track === 'buy' ? 3 : 2, buy: S.track === 'data' ? 3 : 2 };
  const newToday = Object.values(S.cards).filter(c => c.added === today()).length;
  const fresh = pool().filter(c => !S.cards[c.id]).sort((a, b) => order[a.t] - order[b.t]).slice(0, Math.max(0, NEW_PER_DAY - newToday));
  return { q: [...shuffle(dueCards()), ...fresh].map(c => c.id), show: false, n: 0 };
}
function vVocab(a) {
  if (a === 'add') return vAddWord();
  if (!CS) CS = buildCards();
  if (!CS.q.length) return `<div class="card flash"><div class="big">✓ Al día</div><p>${CS.n ? 'Has repasado ' + CS.n + ' tarjetas.' : 'No tienes tarjetas pendientes hoy.'} Mañana vuelven las que tocan.</p></div>
    <a class="btn ghost full" href="#vocab/add">＋ Añadir una palabra mía</a>${vocabList()}`;
  const c = pool().find(x => x.id === CS.q[0]), st = S.cards[c.id], isNew = !st;
  return `<div class="row sp"><span class="tag">${isNew ? 'NUEVA' : 'repaso'} · ${({ diag: 'de tu diagnóstico', buy: 'buying', data: 'data', job: 'entrevistas', mine: 'tuya' })[c.t]}</span><span class="muted">${CS.q.length} quedan</span></div>
    <div class="card flash card-word"><div class="big">${esc(c.en)}</div><button class="btn ghost small" data-act="say" data-t="${esc(c.en + '. ' + (c.ex || ''))}">🔊</button>
      <p class="ex">${esc(c.ex || '')}</p>${CS.show ? `<p class="es">${esc(c.es)}</p>` : ''}</div>
    ${CS.show ? `<div class="row3"><button class="btn warn" data-act="card" data-g="0">No me acordaba</button><button class="btn" data-act="card" data-g="1">Bien</button><button class="btn ghost" data-act="card" data-g="2">Fácil</button></div>`
      : `<button class="btn full" data-act="reveal">Ver significado</button><p class="muted" style="text-align:center;margin-top:8px">Antes de girarla, di el significado en voz alta.</p>`}`;
}
function cardGrade(g) {
  const id = CS.q.shift(), st = S.cards[id] || (S.cards[id] = { box: 0, due: today(), added: today() });
  if (g === 0) { st.box = 0; st.due = today(); CS.q.splice(Math.min(3, CS.q.length), 0, id); }
  else { st.box = Math.min(IV.length - 1, st.box + g); st.due = addDays(today(), IV[st.box]); }
  CS.n++; CS.show = false;
  if (CS.n >= 12 || !CS.q.length) markDone('cards');
  save();
}
function vAddWord() {
  return `<div class="card"><h2>Añadir palabra</h2><p class="muted">Lo que oigas en Friends, en un TED o en una oferta de trabajo.</p>
    <label>En inglés</label><input id="wen" autocapitalize="none"><label>En español</label><input id="wes"><label>Frase de ejemplo (opcional)</label><input id="wex">
    <button class="btn full" style="margin-top:12px" data-act="addword">Guardar</button></div>`;
}
function vocabList() {
  const learning = pool().filter(c => S.cards[c.id]);
  return `<div class="card" style="margin-top:14px"><h2>Tu vocabulario (${learning.length}/${pool().length} empezadas)</h2>${learning.slice(-40).reverse().map(c => `<div class="wl"><b>${esc(c.en)}</b> — ${esc(c.es)} <span class="muted">· nivel ${S.cards[c.id].box}</span></div>`).join('') || '<p class="muted">Aún ninguna.</p>'}</div>`;
}

// ---------- shadowing ----------
let SH = null;
function vShadow(a) {
  const gi = a !== '' && !isNaN(+a) ? +a : dayNum() % SHADOW.length;
  if (!SH || SH.g !== gi) SH = { g: gi, i: 0, res: null };
  const grp = SHADOW[gi], p = grp.p[SH.i % grp.p.length], todayN = (S.shadow['_' + today()] || []).length;
  return `<div class="chips">${SHADOW.map((g, i) => `<a class="chip ${i === gi ? 'on' : ''}" href="#shadow/${i}">${esc(g.g)}</a>`).join('')}</div>
  <div class="card"><p class="muted">1) Escucha · 2) Repite <b>imitando ritmo y entonación</b>, no solo las palabras · 3) Mira lo que no se entendió.</p>
    <p class="q big-q">${SH.res ? SH.res.html : esc(p)}</p>
    <div class="row"><button class="btn ghost" data-act="say" data-t="${esc(p)}">🔊 Escuchar</button><button class="btn ghost" data-act="sayslow" data-t="${esc(p)}">🐢 Despacio</button><button class="btn" data-act="shadowgo" data-t="${esc(p)}">🎙️ Repetir</button></div>
    ${SH.res ? `<div class="fb ${SH.res.pct >= 85 ? 'good' : SH.res.pct >= 60 ? '' : 'bad'}"><b>${SH.res.pct}%</b> entendido · <span class="muted">Oí: «${esc(SH.res.heard)}»</span><div class="muted">Las palabras subrayadas no se reconocieron: repítelas más claras.</div></div>` : ''}
    <div class="row sp" style="margin-top:10px"><span class="muted">Hoy: ${todayN}/5 frases ${S.shadow[p] ? '· tu mejor: ' + S.shadow[p] + '%' : ''}</span><button class="btn small" data-act="shadownext">Siguiente →</button></div></div>
  <p class="muted">Truco Friends: como te sabes los diálogos, pon una escena, pausa tras cada frase y repítela igual. Es el shadowing perfecto.</p>`;
}

// ---------- listening y Friends ----------
function vListen() {
  const st = friendsStage(), w = weekNum(), log = S.listen.slice(-8).reverse();
  return `<div class="card hi"><h2>📺 Plan Friends · semana ${w}</h2><p><b>${st.t}</b></p><p>${st.d}</p>
    <div class="row sp"><span class="muted">Episodios vistos con el plan: <b>${S.friends.eps}</b></span><button class="btn small" data-act="ep">＋1 episodio</button></div>
    <details><summary>Las 4 etapas</summary><div>${FRIENDS.map(f => `<p class="${f === st ? '' : 'muted'}"><b>Sem ${f.from}${f.to < 99 ? '–' + f.to : '+'}:</b> ${esc(f.t.split('·')[1])}. ${esc(f.d)}</p>`).join('')}</div></details>
    ${w >= 7 ? `<h3>Series nuevas para ti</h3>${NEW_SHOWS.map(s => `<p><b>${esc(s.t)}</b> — <span class="muted">${esc(s.d)}</span></p>`).join('')}` : `<p class="muted">En la semana 7 se desbloquean series nuevas para ti.</p>`}</div>
  <div class="card"><h2>🎧 Listening nuevo (12 min)</h2><p class="muted">Friends es tu zona de confort porque te lo sabes. El oído crece con audio <b>que no conoces</b>. Método:</p>
    <ol>${LISTEN_METHOD.map(m => `<li>${esc(m)}</li>`).join('')}</ol>
    <h3>Fuentes</h3>${LISTEN_SOURCES.map(s => `<p><a class="go" href="${s.url}" target="_blank" rel="noopener">${esc(s.t)} ↗</a> <span class="tag">${s.lvl}</span><br><span class="muted">${esc(s.d)}</span></p>`).join('')}</div>
  <div class="card"><h2>Apunta lo que escuchaste</h2>
    <label>Qué escuchaste</label><input id="lt" placeholder="p. ej. 6 Minute English: fast fashion">
    <div class="grid2" style="margin:0"><div><label>% entendido 1.ª escucha</label><input id="lp1" type="number" min="0" max="100" inputmode="numeric"></div><div><label>% en la 2.ª</label><input id="lp2" type="number" min="0" max="100" inputmode="numeric"></div></div>
    <label>Palabras nuevas (una por línea: inglés = español)</label><textarea id="lw" rows="3" placeholder="landfill = vertedero"></textarea>
    <button class="btn full" style="margin-top:10px" data-act="listenlog">Guardar y marcar hecho</button></div>
  ${log.length ? `<div class="card"><h2>Tu evolución</h2>${spark(S.listen.map(l => l.p1), 100)}${log.map(l => `<div class="wl">${fmt(l.d)} · ${esc(l.t)} <span class="muted">· ${l.p1}% → ${l.p2}%</span></div>`).join('')}</div>` : ''}`;
}

// ---------- hablar ----------
function vSpeak(a) {
  if (a === 'dia1') {
    const qs = ['Tell me about yourself.', 'What do you think about fast fashion? Would you buy less?'];
    return `<div class="card hi"><h2>Speaking del diagnóstico (día 1)</h2><p>Dos preguntas, 1 minuto cada una, sin preparar nada por escrito. Piensa 30 segundos y habla. No pasa nada si te bloqueas: es tu punto de partida.</p></div>` +
      qs.map((q, i) => `<div class="card"><h2>${i + 1}. ${esc(q)}</h2><button class="btn ghost small" data-act="say" data-t="${esc(q)}">🔊 Oír la pregunta</button><div style="margin-top:10px">${speakBox(q, 'd1-' + i)}</div><div style="margin-top:8px">${recBtn('Día 1 · ' + q)}</div></div>`).join('') +
      `<p class="muted">Al terminar, pulsa «Copiar» en cada respuesta y pégamelo en la sesión de inglés para darte tu nivel de speaking.</p>`;
  }
  const sp = a || speakPromptToday().p, why = a ? '' : speakPromptToday().why;
  const prompts = [...new Set([speakPromptToday().p, ...trackQs().slice(0, 4).map(q => q.q), ...focusErrors().flatMap(e => e.speak)])];
  return `<div class="card"><span class="tag">${esc(why || 'elegida por ti')}</span><h2 style="margin-top:8px">${esc(sp)}</h2>
    <p class="muted">Habla 1–2 minutos sin parar. Si te bloqueas: «Let me think…», «What I mean is…», y sigue.</p>
    ${speakBox(sp, 'free')}<div style="margin-top:8px">${recBtn(sp + ' · día ' + dayNum())}</div></div>
  <div class="card"><h2>Otras preguntas</h2>${prompts.filter(p => p !== sp).slice(0, 8).map(p => `<a class="wl link" href="#speak/${encodeURIComponent(p)}">${esc(p)}</a>`).join('')}</div>
  <a class="btn ghost full" href="#recs">🎧 Antes y después (tus grabaciones)</a>
  ${S.speak.length > 1 ? `<div class="card" style="margin-top:14px"><h2>Palabras por minuto</h2>${spark(S.speak.filter(s => s.secs >= 30).map(s => s.wpm), 160)}<p class="muted">Media últimas 5: ${lastWpm()} · objetivo semana 6: 100</p></div>` : ''}`;
}
function vRecs() {
  return `<div class="card"><p>Tu "antes y después". El día 1, el día 30, el 60 y el 84 graba lo mismo: <b>Tell me about yourself</b>. Escucharte al principio y ahora es la mejor prueba de que avanzas.</p>
    ${recBtn('Tell me about yourself · día ' + dayNum())}</div><div id="recs"><p class="muted">Cargando…</p></div>`;
}
async function fillRecs() {
  const el = $('#recs'); if (!el) return;
  try {
    const rs = (await recAll()).sort((a, b) => a.id - b.id);
    if (!rs.length) { el.innerHTML = '<div class="card"><p class="muted">Aún no tienes grabaciones.</p></div>'; return; }
    el.innerHTML = rs.map(r => { const u = URL.createObjectURL(r.blob); const ext = (r.blob.type.split('/')[1] || 'webm').split(';')[0]; return `<div class="card"><div class="row sp"><b>Día ${r.day || '?'} · ${fmt(r.date)}</b><span class="muted">${r.secs ? clock(r.secs) : ''}</span></div><p class="muted">${esc(r.label)}</p><audio controls preload="none" src="${u}"></audio>
      <div class="row"><a class="btn ghost small" href="${u}" download="amy-dia${r.day || ''}-${r.date}.${ext}">⬇ Descargar</a><button class="btn ghost small" data-act="recdel" data-id="${r.id}">Borrar</button></div></div>`; }).join('');
  } catch (e) { el.innerHTML = '<div class="card"><p class="muted">No se pueden cargar las grabaciones en este navegador.</p></div>'; }
}

// ================= ENTREVISTAS =================
const trackQs = () => INTERVIEW.filter(q => q.tr === 'all' || S.track === 'both' || q.tr === S.track);
function vEntrevista() {
  const qs = trackQs(), prep = qs.filter(q => S.prepared[INTERVIEW.indexOf(q)]).length;
  return `<div class="chips">${[['both', 'Todas'], ['data', 'Data'], ['buy', 'Buying']].map(([k, n]) => `<button class="chip ${S.track === k ? 'on' : ''}" data-act="track" data-k="${k}">${n}</button>`).join('')}</div>
  <div class="card hi"><div class="row sp"><h2>${prep}/${qs.length} preparadas</h2><span class="muted">Objetivo semana 12: 20</span></div><div class="bar"><i style="width:${100 * prep / qs.length}%"></i></div>
    <p class="muted">Una respuesta está "preparada" cuando la has escrito, corregido y dicho en voz alta sin leer.</p>
    <a class="btn full" href="#sim">🎬 Simulacro: 5 preguntas al azar</a></div>
  ${qs.map(q => { const i = INTERVIEW.indexOf(q); return `<a class="qrow" href="#q/${i}"><span class="check ${S.prepared[i] ? 'on' : ''}">${S.prepared[i] ? '✓' : ''}</span><span class="body"><b>${esc(q.q)}</b><span class="muted">${q.tr === 'all' ? 'General' : q.tr === 'data' ? 'Data' : 'Buying'}${S.answers[i] ? ' · borrador escrito' : ''}</span></span></a>`; }).join('')}`;
}
function vQuestion(a) {
  const i = +a, q = INTERVIEW[i]; if (!q) return '<p>No existe.</p>';
  const ans = S.answers[i] || '';
  return `<div class="card"><h2>${esc(q.q)}</h2><button class="btn ghost small" data-act="say" data-t="${esc(q.q)}">🔊 Escuchar como en la entrevista</button>
    <p style="margin-top:10px">💡 ${esc(q.tip)}</p><h3>Frases que te sirven</h3><ul>${q.ph.map(p => `<li>${esc(p)} <button class="mini" data-act="say" data-t="${esc(p)}">🔊</button></li>`).join('')}</ul></div>
  <div class="card"><h2>Tu respuesta</h2>${i === 0 && !ans ? `<button class="btn ghost small" data-act="tmay">Empezar con la plantilla hecha con tu perfil</button>` : ''}
    <textarea id="ans" rows="8" placeholder="Escríbela en inglés, como la dirías.">${esc(ans)}</textarea>
    <div class="row" style="margin-top:8px"><button class="btn small" data-act="saveans" data-i="${i}">Guardar y revisar</button><button class="btn ghost small" data-act="copy" data-t="${esc('Corrígeme esta respuesta de entrevista.\nPregunta: ' + q.q + '\n\n' + ans)}">📋 Copiar para corregir</button></div>
    <div id="ansflags">${ans ? flagsHtml(detect(ans)) : ''}</div></div>
  <div class="card"><h2>Dila en voz alta, sin leer</h2>${speakBox(q.q, 'q' + i)}</div>
  <label class="msrow card"><input type="checkbox" data-act="prep" data-i="${i}" ${S.prepared[i] ? 'checked' : ''}> <span><b>Preparada:</b> la digo sin leer y sin bloquearme</span></label>`;
}
let SIMS = null;
function vSim() {
  if (!SIMS) SIMS = { qs: shuffle(trackQs()).slice(0, 5), i: 0 };
  if (SIMS.i >= SIMS.qs.length) { SIMS = null; return `<div class="card flash"><div class="big">🎬 Simulacro terminado</div><p>Copia las respuestas que te costaron y pégamelas en la sesión de inglés para corregirlas.</p><a class="btn" href="#sim">Otro simulacro</a></div>`; }
  const q = SIMS.qs[SIMS.i];
  return `<div class="row sp"><span class="tag">Pregunta ${SIMS.i + 1}/5</span><span class="muted">Escúchala sin leerla primero</span></div>
    <div class="card"><button class="btn full" data-act="say" data-t="${esc(q.q)}">🔊 Escuchar pregunta</button>
    <details style="margin-top:10px"><summary>No la he entendido: leerla</summary><div><b>${esc(q.q)}</b><p class="muted">Tip: en una entrevista real puedes decir «Sorry, could you repeat the question?»</p></div></details>
    <div style="margin-top:10px">${speakBox(q.q, 'sim' + SIMS.i)}</div><button class="btn ghost full" style="margin-top:10px" data-act="simnext">Siguiente pregunta →</button></div>`;
}

// ================= RE-TEST =================
let RT = null;
const PCT_LVL = p => p < .3 ? 2 : p < .45 ? 2.5 : p < .6 ? 3 : p < .72 ? 3.5 : p < .82 ? 4 : p < .9 ? 4.5 : p < .96 ? 5 : 5.5;
const RT_STEPS = ['grammar', 'vocab', 'reading', 'listening', 'write', 'speak', 'done'];
function vTest(a) {
  const f = RETESTS.find(t => t.id === a);
  if (!f) return `<div class="card"><h2>Re-tests</h2><p class="muted">Cada 4 semanas, para ver tu evolución en la gráfica.</p>${RETESTS.map(t => { const done = S.tests.find(x => x.form === t.id); return `<div class="task"><div class="body"><b>${esc(t.title)}</b><div class="muted">${done ? 'Hecho el ' + fmt(done.date) : 'Disponible desde el día ' + (t.week * 7 - 3)}</div></div><a class="btn small ${done ? 'ghost' : ''}" href="#test/${t.id}">${done ? 'Repetir' : 'Hacer'}</a></div>`; }).join('')}<p class="muted">El de la semana 12 te lo prepararé nuevo en la sesión de inglés.</p></div>`;
  if (!RT || RT.f.id !== f.id) RT = { f, step: 0, ans: {}, plays: 0, write: '' };
  const step = RT_STEPS[RT.step], head = `<div class="row sp"><span class="tag">${esc(f.title)}</span><span class="muted">Parte ${Math.min(RT.step + 1, 6)}/6</span></div><div class="bar"><i style="width:${100 * RT.step / 6}%"></i></div>`;
  const mcList = (key, qs) => qs.map((q, qi) => `<div class="card"><p class="q">${qi + 1}. ${esc(q.q)}</p>${[...q.o, 'No lo sé'].map((o, oi) => { const v = oi === q.o.length ? -1 : oi; return `<button class="opt ${RT.ans[key + qi] === v ? 'sel' : ''} ${v === -1 ? 'idk' : ''}" data-act="rtans" data-k="${key + qi}" data-v="${v}">${esc(o)}</button>`; }).join('')}</div>`).join('');
  const allAns = (key, qs) => qs.every((_, qi) => RT.ans[key + qi] !== undefined);
  const next = (ok) => `<button class="btn full" data-act="rtnext" ${ok ? '' : 'disabled'}>Siguiente parte →</button>`;
  if (step === 'grammar') return head + `<p class="muted">Gramática. Si no lo sabes, «No lo sé»: adivinar falsea tu gráfica.</p>` + mcList('g', f.grammar) + next(allAns('g', f.grammar));
  if (step === 'vocab') return head + `<p class="muted">Vocabulario.</p>` + mcList('v', f.vocab) + next(allAns('v', f.vocab));
  if (step === 'reading') return head + `<div class="card"><p class="muted">Lee una vez con calma, sin traductor.</p><div class="passage">${esc(f.reading.text).replace(/\n\n/g, '<br><br>')}</div></div>` + mcList('r', f.reading.qs) + next(allAns('r', f.reading.qs));
  if (step === 'listening') return head + `<div class="card"><p>Escucha el audio (máximo 2 veces). No hay texto.</p><button class="btn full" data-act="rtplay" ${RT.plays >= 2 ? 'disabled' : ''}>🔊 Reproducir (${2 - RT.plays} restantes)</button></div>` + (RT.plays ? mcList('l', f.listening.qs) + next(allAns('l', f.listening.qs)) : '');
  if (step === 'write') return head + `<div class="card"><h2>Writing</h2><p>${esc(f.write)}</p><p class="muted">20 min, sin traductor. Si no sabes una palabra, ponla en [español].</p><textarea id="rtw" rows="10">${esc(RT.write)}</textarea></div><button class="btn full" data-act="rtwrite">Siguiente parte →</button>`;
  if (step === 'speak') return head + `<div class="card"><h2>Speaking</h2><p>${esc(f.speak)}</p>${speakBox(f.speak, 'rt')}<div style="margin-top:8px">${recBtn('Re-test ' + f.id + ' · ' + f.speak)}</div></div><button class="btn full" data-act="rtfinish">Terminar y ver resultados</button>`;
  // resultados
  const t = S.tests.find(x => x.date === RT.date && x.form === f.id), prev = allTests().filter(x => x !== t).slice(-1)[0];
  return head + `<div class="card hi"><h2>Tus resultados</h2>${['grammar', 'vocab', 'reading', 'listening'].map(k => { const sk = SKILLS.find(s => s.id === k); const d = prev && prev.skills[k] != null ? t.skills[k] - prev.skills[k] : 0; return `<div class="row sp res"><span>${sk.n}</span><b>${lvl(t.skills[k])} <span class="${d > 0 ? 'up' : d < 0 ? 'down' : 'muted'}">${d > 0 ? '▲' : d < 0 ? '▼' : '='}</span></b></div>`; }).join('')}
    <p class="muted">Writing y speaking los evalúo yo: copia y pégamelo en la sesión de inglés y luego apunta tu nota en Progreso.</p>
    <button class="btn ghost full" data-act="copy" data-t="${esc('Re-test ' + f.id + '. Ponme nivel CEFR de writing y speaking.\n\nWRITING (' + f.write + '):\n' + (t.write || '') + '\n\nSPEAKING (' + f.speak + ', transcripción automática):\n' + (t.speakText || ''))}">📋 Copiar writing y speaking</button></div>
    <a class="btn full" href="#progreso">Ver gráfica de evolución</a>`;
}
function rtFinish() {
  const f = RT.f, score = (key, qs) => qs.filter((q, qi) => RT.ans[key + qi] === q.c).length / qs.length;
  RT.date = today();
  const t = { date: RT.date, form: f.id, label: f.title, skills: { grammar: PCT_LVL(score('g', f.grammar)), vocab: PCT_LVL(score('v', f.vocab)), reading: PCT_LVL(score('r', f.reading.qs)), listening: PCT_LVL(score('l', f.listening.qs)), writing: null, speaking: null }, write: RT.write, speakText: SP && SP.result ? SP.result.text : '' };
  S.tests.push(t); Object.keys(BLOCKS).forEach(b => markDone(b)); save();
  RT.step = RT_STEPS.length - 1;
}

// ================= PROGRESO =================
function series(skill) {
  const pts = allTests().filter(t => t.skills[skill] != null).map(t => ({ d: t.date, v: t.skills[skill] }));
  S.grades.filter(g => g.skill === skill).forEach(g => pts.push({ d: g.date, v: g.lvl }));
  return pts.sort((a, b) => a.d < b.d ? -1 : 1);
}
function chart() {
  const W = 600, H = 260, L = 38, Rr = 12, T = 12, B = 30, ymin = 2, ymax = 5.5;
  const end = addDays(S.start, Math.max(84, dayNum()));
  const x = d => L + (W - L - Rr) * Math.max(0, diffDays(S.start, d)) / diffDays(S.start, end);
  const y = v => T + (H - T - B) * (1 - (v - ymin) / (ymax - ymin));
  let g = '';
  [2, 3, 4, 5].forEach(v => { g += `<line x1="${L}" x2="${W - Rr}" y1="${y(v)}" y2="${y(v)}" class="grid"/><text x="4" y="${y(v) + 4}" class="axis">${LEVELS[v]}</text>`; });
  [0, 4, 8, 12].forEach(w => { const d = addDays(S.start, w * 7); g += `<text x="${x(d)}" y="${H - 8}" class="axis" text-anchor="${w === 12 ? 'end' : w ? 'middle' : 'start'}">${w ? 'sem ' + w : 'inicio'}</text>`; });
  g += `<line x1="${x(today())}" x2="${x(today())}" y1="${T}" y2="${H - B}" class="todayline"/>`;
  SKILLS.forEach(s => { const p = series(s.id); if (!p.length) return; g += `<polyline fill="none" stroke="${s.c}" stroke-width="2.5" points="${p.map(q => x(q.d) + ',' + y(q.v)).join(' ')}"/>` + p.map(q => `<circle cx="${x(q.d)}" cy="${y(q.v)}" r="4.5" fill="${s.c}"><title>${s.n}: ${lvl(q.v)} (${fmt(q.d)})</title></circle>`).join(''); });
  return `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="Evolución de tu nivel por destreza">${g}</svg><div class="legend">${SKILLS.map(s => `<span><i style="background:${s.c}"></i>${s.n}</span>`).join('')}</div>`;
}
function spark(vals, max) {
  vals = vals.filter(v => v != null).slice(-20); if (vals.length < 2) return '';
  const W = 300, H = 60, x = i => 4 + (W - 8) * i / (vals.length - 1), y = v => H - 4 - (H - 8) * Math.min(v, max) / max;
  return `<svg viewBox="0 0 ${W} ${H}" class="spark"><polyline fill="none" stroke="var(--accent)" stroke-width="2.5" points="${vals.map((v, i) => x(i) + ',' + y(v)).join(' ')}"/>${vals.map((v, i) => `<circle cx="${x(i)}" cy="${y(v)}" r="3" fill="var(--accent)"/>`).join('')}</svg>`;
}
function vProgreso() {
  const last = allTests().slice(-1)[0], cur = id => { const s = series(id); return s.length ? s[s.length - 1].v : null; };
  const actDays = Object.keys(S.days).filter(k => activeDone(k) >= 3).length, mins = Object.values(S.days).reduce((a, d) => a + (d.min || 0), 0);
  return `<div class="card"><h2>Tu nivel por destreza</h2>${chart()}
    <div class="lv">${SKILLS.map(s => `<div><span>${s.n}</span><b style="color:${s.c}">${lvl(cur(s.id))}</b></div>`).join('')}</div>
    <p class="muted">Último test: ${esc(last.label)} (${fmt(last.date)}). ${retestDue() ? '<a href="#test/' + retestDue().id + '">¡Te toca re-test!</a>' : 'Próximo re-test: ' + (RETESTS.find(t => !S.tests.some(x => x.form === t.id)) ? 'día ' + (RETESTS.find(t => !S.tests.some(x => x.form === t.id)).week * 7 - 3) : 'semana 12')}</p>
    <div class="row"><a class="btn small" href="#test">Re-tests</a><button class="btn ghost small" data-act="gradeform">＋ Apuntar nota de tu entrenadora</button></div><div id="gradeform"></div></div>
  <div class="stats"><div class="stat"><b>${actDays}</b><span>días entrenados</span></div><div class="stat"><b>${Math.round(mins / 60 * 10) / 10}</b><span>horas activas</span></div><div class="stat"><b>${learnedCount()}</b><span>palabras aprendidas</span></div></div>
  <div class="card" style="margin-top:14px"><h2>Tus errores</h2>${ERRORS.map(e => { const m = mastery(e.id); return `<div class="eb"><span>${esc(e.t)}</span><div class="bar"><i style="width:${m == null ? 0 : m * 100}%"></i></div><b>${m == null ? '—' : Math.round(m * 100) + '%'}</b></div>`; }).join('')}</div>
  <div class="card"><h2>Diagnóstico inicial</h2>${SKILLS.map(s => `<p><b>${s.n} · ${lvl(DIAGNOSIS.skills[s.id])}</b><br><span class="muted">${esc(DIAGNOSIS.notes[s.id])}</span></p>`).join('')}</div>
  <div class="card"><h2>Hitos de las 12 semanas</h2>${MILESTONES.map(m => `<details ${m.w === weekNum() ? 'open' : ''}><summary>${m.w === weekNum() ? '👉 ' : m.k.every((_, i) => S.ms[m.w + '-' + i]) ? '✅ ' : ''}Semana ${m.w}: ${esc(m.t)}</summary><div>${m.k.map((k, i) => msRow(m.w, i, k)).join('')}</div></details>`).join('')}</div>
  <a class="btn ghost full" href="#ajustes">⚙️ Ajustes y copia de seguridad</a>`;
}
function vAjustes() {
  return `<div class="card"><h2>Ajustes</h2>
    <label>Acento de la voz y del reconocimiento</label><select id="acc"><option value="en-GB" ${S.accent === 'en-GB' ? 'selected' : ''}>Británico (Londres)</option><option value="en-US" ${S.accent === 'en-US' ? 'selected' : ''}>Americano</option></select>
    <label>Velocidad de la voz</label><select id="rate">${[[0.8, 'Lenta'], [0.95, 'Normal'], [1.1, 'Rápida (real)']].map(([v, n]) => `<option value="${v}" ${S.rate == v ? 'selected' : ''}>${n}</option>`).join('')}</select>
    <label>Día 1 del plan</label><input id="start" type="date" value="${S.start}">
    <button class="btn full" style="margin-top:12px" data-act="savesettings">Guardar</button></div>
  <div class="card"><h2>Copia de seguridad</h2><p class="muted">Tus datos están solo en este móvil. Descarga una copia de vez en cuando (las grabaciones de audio se descargan aparte).</p>
    <div class="row"><button class="btn small" data-act="export">⬇ Descargar copia</button><label class="btn ghost small" style="margin:0">⬆ Restaurar<input type="file" accept=".json" id="imp" hidden></label></div></div>
  <div class="card"><h2>Instalar en el móvil</h2><p class="muted"><b>iPhone (Safari):</b> Compartir → «Añadir a pantalla de inicio».<br><b>Android (Chrome):</b> menú ⋮ → «Instalar aplicación».</p></div>`;
}

// ================= acciones =================
const val = id => ($('#' + id)?.value || '').trim();
const ACT = {
  toggle: el => { const id = el.dataset.id; if (id === 'friends') { const d = day(); d.done.friends = !d.done.friends; save(); } else markDone(id, !day().done[id]); render(); },
  ms: el => { S.ms[el.dataset.k] = el.checked; save(); },
  say: el => say(el.dataset.t), sayslow: el => say(el.dataset.t, 0.75),
  copy: el => { const t = el.dataset.t; (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => toast('Copiado. Pégalo en la sesión de inglés.'), () => { prompt('Copia este texto:', t); }); },
  // drill
  mc: el => { DR.ans = +el.dataset.i; drillRecord(DR.ans === DR.items[DR.i].it.c); render(); },
  fixcheck: () => { const t = val('fixin'); if (!t) return toast('Escribe la frase'); DR.typed = t; const it = DR.items[DR.i].it; if (it.a.some(a => canon(a) === canon(t))) { DR.ans = true; drillRecord(true); } else DR.ans = 'pending'; render(); },
  selfgrade: el => { const ok = el.dataset.ok === '1'; drillRecord(ok); DR.ans = ok ? true : false; render(); },
  drillnext: () => { DR.i++; DR.ans = null; DR.typed = ''; render(); window.scrollTo(0, 0); },
  drillagain: () => { DR = buildDrill(DR.ids); render(); },
  // tarjetas
  reveal: () => { CS.show = true; render(); },
  card: el => { cardGrade(+el.dataset.g); render(); },
  addword: () => { const en = val('wen'), es = val('wes'); if (!en || !es) return toast('Rellena inglés y español'); S.mine.push({ id: 'm' + Date.now(), en, es, ex: val('wex'), t: 'mine' }); save(); CS = null; toast('Añadida a tus tarjetas'); location.hash = '#vocab'; },
  // shadowing
  shadowgo: el => { const p = el.dataset.t; hearOnce(h => { const m = matchWords(p, h); SH.res = { ...m, heard: h }; S.shadow[p] = Math.max(S.shadow[p] || 0, m.pct); const k = '_' + today(); (S.shadow[k] = S.shadow[k] || []).push(m.pct); if (S.shadow[k].length >= 5) markDone('shadow'); save(); render(); }); },
  shadownext: () => { SH.i++; SH.res = null; render(); },
  // listening
  ep: () => { S.friends.eps++; const d = day(); d.done.friends = true; save(); toast('+1 episodio'); render(); },
  listenlog: () => {
    const t = val('lt'); if (!t) return toast('¿Qué escuchaste?');
    const p1 = Math.min(100, +val('lp1') || 0), p2 = Math.min(100, +val('lp2') || 0);
    S.listen.push({ d: today(), t, p1, p2 });
    let n = 0; val('lw').split('\n').forEach(l => { const [en, es] = l.split('='); if (en && es && en.trim() && es.trim()) { S.mine.push({ id: 'm' + Date.now() + n, en: en.trim(), es: es.trim(), ex: 'From: ' + t, t: 'mine' }); n++; } });
    markDone('listen'); save(); toast(n ? 'Guardado · ' + n + ' palabras a tus tarjetas' : 'Guardado'); render();
  },
  // speaking
  spstart: el => speakStart(el.dataset.p, el.dataset.c),
  spstop: () => speakStop(),
  recstart: el => recStart(el.dataset.l), recstop: () => recStop(),
  recdel: async el => { if (!confirm('¿Borrar esta grabación? No se puede deshacer.')) return; await recDel(+el.dataset.id); render(); },
  // entrevistas
  track: el => { S.track = el.dataset.k; save(); CS = null; render(); },
  tmay: () => { $('#ans').value = TMAY; toast('Adáptala con tus palabras y datos reales'); },
  saveans: el => { const i = el.dataset.i, t = $('#ans').value; S.answers[i] = t; const f = detect(t, true); save(); render(); setTimeout(() => { const x = $('#ansflags'); if (x) x.innerHTML = flagsHtml(f); }, 0); toast('Guardada'); },
  prep: el => { S.prepared[el.dataset.i] = el.checked; save(); },
  simnext: () => { if (SP && SP.running) speakStop(); SP = null; SIMS.i++; render(); },
  // re-test
  rtans: el => { RT.ans[el.dataset.k] = +el.dataset.v; const y = window.scrollY; render(); window.scrollTo(0, y); },
  rtnext: () => { RT.step++; render(); window.scrollTo(0, 0); },
  rtplay: () => { if (RT.plays >= 2) return; RT.plays++; say(RT.f.listening.text, 1); render(); },
  rtwrite: () => { RT.write = $('#rtw').value; detect(RT.write, true); RT.step++; render(); window.scrollTo(0, 0); },
  rtfinish: () => { if (SP && SP.running) { speakStop(); setTimeout(() => { rtFinish(); render(); }, 800); return; } rtFinish(); render(); window.scrollTo(0, 0); },
  // progreso
  gradeform: () => { $('#gradeform').innerHTML = `<label>Destreza</label><select id="gs">${SKILLS.map(s => `<option value="${s.id}">${s.n}</option>`).join('')}</select><label>Nivel</label><select id="gl">${Object.entries(LEVELS).map(([v, n]) => `<option value="${v}">${n}</option>`).join('')}</select><button class="btn small" style="margin-top:8px" data-act="gradesave">Guardar</button>`; },
  gradesave: () => { S.grades.push({ date: today(), skill: val('gs'), lvl: +val('gl') }); save(); toast('Nota guardada'); render(); },
  savesettings: () => { S.accent = val('acc'); S.rate = +val('rate'); if (val('start')) S.start = val('start'); save(); toast('Guardado'); render(); },
  export: () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(S)], { type: 'application/json' })); a.download = 'ingles-amy-' + today() + '.json'; a.click(); }
};
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if (!el || el.disabled) return;
  if (el.tagName === 'INPUT' && el.type === 'checkbox') return;
  const f = ACT[el.dataset.act]; if (f) { e.preventDefault(); f(el); }
});
document.addEventListener('change', e => {
  const el = e.target;
  if (el.matches('input[type=checkbox][data-act]')) ACT[el.dataset.act](el);
  if (el.id === 'imp' && el.files[0]) { const r = new FileReader(); r.onload = () => { try { S = Object.assign(fresh(), JSON.parse(r.result)); save(); toast('Copia restaurada'); render(); } catch (x) { toast('Ese archivo no vale'); } }; r.readAsText(el.files[0]); }
});
$('#back').addEventListener('click', () => { location.hash = '#' + (PARENT[R.r] || 'hoy'); });
render();
if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => { });
