const CB_API = 'https://f-hossain-3.ce.washington.edu/scb/api/chat';

const CB_MODELS = {
  local:      { id: 'phi3:mini',                label: '🏠 Local AI'   },
  groq:       { id: 'llama-3.3-70b-versatile',  label: '⚡ Groq'       },
  openrouter: { id: 'openai/gpt-oss-20b:free',  label: '🌐 OpenRouter' },
  cerebras:   { id: 'llama3.1-8b',              label: '🧠 Cerebras'   },
};

const CB_WELCOME = "Hi there! 👋 I'm Pikachu, Sanchit's personal AI assistant, trained on his research, publications, and projects. What would you like to know?";

const CB_SUGGESTIONS = [
  "What is Sanchit researching? 🔬",
  "What is Sanchit's expertise? 🛰️",
  "Most impactful project? 🚀",
  "Background & Education? 🎓"
];

// Change CB_CLOUD_LIMIT to adjust how many cloud messages before switching to Local AI
const CB_CLOUD_LIMIT = 15;

// Change these to adjust response length token limits
const CB_MAX_TOKENS = { short: 500, long: 800 };

let cbModel = 'groq';
let cbConvId = null;
let cbCloudMsgCount = 0;

/* ── Image registry ── */
const P = 'assets/img/chat_icon/';
const CB_IMG = {
  launcherCycle:  [`${P}pikachu-bounce.gif`, `${P}pikachu_ears.gif`, `${P}pikachu_ya.gif`],
  launcherHover:  `${P}pikachu-hey.png`,
  launcherActive: `${P}pikachu.png`,
  headerCycle:    [`${P}pikachu_wave.gif`, `${P}pikachu_vibing.gif`, `${P}pikachu_ya.gif`, `${P}pikachu_ears.gif`],
  think:          `${P}pikachu-think.png`,
  excited:        `${P}pikachu_excitedq.gif`,
  grateful:       `${P}pikachulovedance.gif`,
  default:        `${P}pikachu.png`,
};

let headerCycleTimer   = null;
let launcherCycleTimer = null;
let headerIdx   = 0;
let launcherIdx = 0;
let launcherImg = null;   // shared ref so hover handlers can always find it
let headerImg   = null;

/* ── Helpers ── */
function cbMakeImg(src, cls) {
  const img = document.createElement('img');
  img.src = src; img.className = cls || ''; img.alt = 'Pikachu'; img.draggable = false;
  return img;
}

function cbDetectEmotion(text) {
  const t = text.toLowerCase();
  if (/\b(thank|grateful|appreciat|welcome|means a lot|wonderful|kind)\b/.test(t)) return 'grateful';
  if (/\b(wow|amazing|excit|incredible|awesome|outstanding|breakthrough|significant)\b/.test(t)) return 'excited';
  return 'default';
}

function cbStartHeaderCycle(img) {
  if (headerCycleTimer) clearInterval(headerCycleTimer);
  img.src = CB_IMG.headerCycle[headerIdx];
  headerCycleTimer = setInterval(() => {
    headerIdx = (headerIdx + 1) % CB_IMG.headerCycle.length;
    img.src = CB_IMG.headerCycle[headerIdx];
  }, 5000);
}

function cbStopHeaderCycle() {
  if (headerCycleTimer) { clearInterval(headerCycleTimer); headerCycleTimer = null; }
}

function cbFlashEmotion(emotion) {
  if (!headerImg) return;
  cbStopHeaderCycle();
  headerImg.src = CB_IMG[emotion];
  setTimeout(() => cbStartHeaderCycle(headerImg), 5000);
}

function cbStartLauncherCycle(img) {
  if (launcherCycleTimer) clearInterval(launcherCycleTimer);
  launcherCycleTimer = setInterval(() => {
    launcherIdx = (launcherIdx + 1) % CB_IMG.launcherCycle.length;
    if (img === launcherImg && !document.getElementById('cb-window')?.classList.contains('open')) {
      img.src = CB_IMG.launcherCycle[launcherIdx];
    }
  }, 9000);
}

/* ── Drag utility ── */
function cbMakeDraggable(el, handle, { onMove: onMoveCb, onEnd: onEndCb } = {}) {
  let ox, oy, x0, y0, dragging = false, justDragged = false;

  function xy(e) {
    return e.touches ? [e.touches[0].clientX, e.touches[0].clientY] : [e.clientX, e.clientY];
  }
  function onStart(e) {
    if (e.button && e.button !== 0) return;
    const [cx, cy] = xy(e);
    const r = el.getBoundingClientRect();
    ox = cx - r.left; oy = cy - r.top;
    x0 = cx; y0 = cy; dragging = false;
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup',   onStop);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend',  onStop);
  }
  function onMove(e) {
    e.preventDefault();
    const [cx, cy] = xy(e);
    if (!dragging) {
      if (Math.hypot(cx - x0, cy - y0) < 6) return;
      dragging = true;
      el.style.transition = 'box-shadow 0.2s, opacity 0.2s';
      el.style.right = 'auto'; el.style.bottom = 'auto';
      el.style.opacity = '0.88';
    }
    const nl = Math.max(0, Math.min(cx - ox, window.innerWidth  - el.offsetWidth));
    const nt = Math.max(0, Math.min(cy - oy, window.innerHeight - el.offsetHeight));
    el.style.left = nl + 'px'; el.style.top = nt + 'px';
    onMoveCb && onMoveCb();
  }
  function onStop() {
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup',   onStop);
    document.removeEventListener('touchmove', onMove);
    document.removeEventListener('touchend',  onStop);
    el.style.opacity = '';
    if (dragging) {
      el.style.transition = ''; dragging = false;
      justDragged = true;
      setTimeout(() => { justDragged = false; }, 80);
      onEndCb && onEndCb({ left: el.style.left, top: el.style.top });
    }
  }
  handle.style.cursor = 'grab';
  handle.addEventListener('mousedown',  onStart);
  handle.addEventListener('touchstart', onStart, { passive: false });
  return () => justDragged;
}

function cbRestorePos(el, key) {
  try {
    const p = JSON.parse(sessionStorage.getItem(key));
    if (p) { el.style.right = 'auto'; el.style.bottom = 'auto'; el.style.left = p.left; el.style.top = p.top; }
  } catch (_) {}
}

function cbDockWindow(winEl, launcher) {
  const lr  = launcher.getBoundingClientRect();
  const wW  = Math.min(375, window.innerWidth - 20);
  const wH  = 550; const gap = 14;
  let top  = lr.top - wH - gap;
  if (top < 10) top = lr.bottom + gap;
  let left = lr.right - wW;
  top  = Math.max(10, Math.min(top,  window.innerHeight - wH - 10));
  left = Math.max(10, Math.min(left, window.innerWidth  - wW - 10));
  winEl.style.right = 'auto'; winEl.style.bottom = 'auto';
  winEl.style.left  = left + 'px'; winEl.style.top = top + 'px';
}

/* ── Init ── */
function cbInit() {
  const launcher     = document.getElementById('cb-launcher');
  const winEl        = document.getElementById('cb-window');
  const header       = winEl?.querySelector('.cb-header');
  const closeBtn     = document.getElementById('cb-close');
  const messages     = document.getElementById('cb-messages');
  const input        = document.getElementById('cb-input');
  const sendBtn      = document.getElementById('cb-send');
  const popup        = document.getElementById('cb-popup');
  const popupDismiss = document.getElementById('cb-popup-dismiss');
  const modelSelect  = document.getElementById('cb-model-select');
  const headerAvatar = document.getElementById('cb-header-avatar');

  if (!launcher) return;

  /* Launcher image */
  launcherImg = cbMakeImg(CB_IMG.launcherCycle[0], 'cb-launcher-img');
  launcher.appendChild(launcherImg);
  cbStartLauncherCycle(launcherImg);

  /* Launcher hover swap */
  launcher.addEventListener('mouseenter', () => {
    if (!winEl.classList.contains('open')) launcherImg.src = CB_IMG.launcherHover;
  });
  launcher.addEventListener('mouseleave', () => {
    if (!winEl.classList.contains('open')) launcherImg.src = CB_IMG.launcherCycle[launcherIdx];
  });

  /* Header avatar with cycling */
  if (headerAvatar) {
    headerImg = cbMakeImg(CB_IMG.headerCycle[0], 'cb-header-img');
    headerAvatar.appendChild(headerImg);
  }

  /* Welcome + chips */
  cbAddMsg(messages, CB_WELCOME, 'ai', CB_IMG.default);
  cbShowChips(messages, input);

  cbRestorePos(launcher, 'cb-launcher-pos');

  /* Drag — window follows launcher */
  const isLauncherDragging = cbMakeDraggable(launcher, launcher, {
    onMove: () => { if (winEl.classList.contains('open')) cbDockWindow(winEl, launcher); },
    onEnd:  pos => sessionStorage.setItem('cb-launcher-pos', JSON.stringify(pos))
  });
  if (header) cbMakeDraggable(winEl, header, {});

  /* Launcher click */
  launcher.addEventListener('click', () => {
    if (isLauncherDragging()) return;
    const isOpen = winEl.classList.toggle('open');
    cbHidePopup(popup, false);
    launcher.classList.toggle('active', isOpen);
    if (isOpen) {
      launcherImg.src = CB_IMG.launcherActive;
      cbDockWindow(winEl, launcher);
      cbStartHeaderCycle(headerImg);
      setTimeout(() => input.focus(), 320);
    } else {
      launcherImg.src = CB_IMG.launcherCycle[launcherIdx];
      cbStopHeaderCycle();
    }
  });

  closeBtn.addEventListener('click', () => {
    winEl.classList.remove('open');
    launcher.classList.remove('active');
    launcherImg.src = CB_IMG.launcherCycle[launcherIdx];
    cbStopHeaderCycle();
  });

  sendBtn.addEventListener('click', () => cbHandleSend(messages, input));
  input.addEventListener('keypress', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); cbHandleSend(messages, input); }
  });
  input.addEventListener('input', () => {
    sendBtn.classList.toggle('has-text', input.value.trim().length > 0);
  });

  /* Model dropdown */
  if (modelSelect) {
    modelSelect.value = cbModel;
    modelSelect.addEventListener('change', () => {
      cbModel = modelSelect.value;
      cbCloudMsgCount = 0;
    });
  }

  /* Popup */
  popupDismiss.addEventListener('click', () => cbHidePopup(popup, true));
  if (!sessionStorage.getItem('cb-shown')) {
    setTimeout(() => {
      popup.classList.add('show');
      setTimeout(() => cbHidePopup(popup, false), 9000);
    }, 3500);
  }
}

function cbHidePopup(popup, permanent) {
  popup.classList.remove('show');
  if (permanent) sessionStorage.setItem('cb-shown', '1');
}

function cbShowChips(messages, input) {
  const wrap = document.createElement('div');
  wrap.className = 'cb-chips'; wrap.id = 'cb-chips';
  CB_SUGGESTIONS.forEach(text => {
    const chip = document.createElement('button');
    chip.className = 'cb-chip'; chip.textContent = text;
    chip.addEventListener('click', () => { input.value = text; cbHandleSend(messages, input); });
    wrap.appendChild(chip);
  });
  messages.appendChild(wrap);
}

async function cbHandleSend(messages, input) {
  const text = input.value.trim();
  if (!text) return;

  const chips = document.getElementById('cb-chips');
  if (chips) { chips.style.opacity = '0'; setTimeout(() => chips.remove(), 200); }

  input.value = '';
  document.getElementById('cb-send')?.classList.remove('has-text');
  cbAddMsg(messages, text, 'user', null);
  const typing = cbAddTyping(messages);

  try {
    const lengthSel = document.getElementById('cb-length');
    const maxTok    = CB_MAX_TOKENS[(lengthSel?.value) || 'short'];
    const body = { message: text, model: CB_MODELS[cbModel].id, max_tokens: maxTok };
    if (cbConvId) body.conversation_id = cbConvId;

    const res = await fetch(CB_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    typing.remove();

    if (cbModel !== 'local') {
      cbCloudMsgCount++;
      if (cbCloudMsgCount >= CB_CLOUD_LIMIT) {
        cbModel = 'local';
        const sel = document.getElementById('cb-model-select');
        if (sel) sel.value = 'local';
      }
    }
    cbConvId = data.conversation_id || null;

    const emotion = cbDetectEmotion(data.response);
    cbAddMsg(messages, data.response, 'ai', CB_IMG[emotion]);
    if (emotion !== 'default') cbFlashEmotion(emotion);

  } catch (err) {
    typing.remove();
    console.error('[Chatbot]', err);
    cbAddMsg(messages, "Oops, something went wrong. Try again or email msanchit@uw.edu", 'ai error', CB_IMG.default);
  }
}

function cbNow() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function cbAddMsg(container, text, type, avatarSrc) {
  const isAi = type.startsWith('ai');
  const row = document.createElement('div');
  row.className = `cb-row cb-row--${isAi ? 'ai' : 'user'}`;

  if (isAi) {
    const av = document.createElement('div');
    av.className = 'cb-row-avatar';
    if (avatarSrc) av.appendChild(cbMakeImg(avatarSrc, 'cb-msg-pika'));
    row.appendChild(av);
  }

  const bubble = document.createElement('div');
  bubble.className = `cb-bubble cb-bubble--${isAi ? 'ai' : 'user'}`;
  if (type.includes('error')) bubble.classList.add('cb-bubble--error');

  const p = document.createElement('p'); p.textContent = text;
  const t = document.createElement('span'); t.className = 'cb-ts'; t.textContent = cbNow();
  bubble.appendChild(p); bubble.appendChild(t);
  row.appendChild(bubble);
  container.appendChild(row);
  container.scrollTop = container.scrollHeight;
  return row;
}

function cbAddTyping(container) {
  const row = document.createElement('div');
  row.className = 'cb-row cb-row--ai';
  const av = document.createElement('div');
  av.className = 'cb-row-avatar';
  av.appendChild(cbMakeImg(CB_IMG.think, 'cb-msg-pika'));
  row.appendChild(av);
  const bubble = document.createElement('div');
  bubble.className = 'cb-bubble cb-bubble--ai cb-bubble--typing';
  bubble.innerHTML = '<span></span><span></span><span></span>';
  row.appendChild(bubble);
  container.appendChild(row);
  container.scrollTop = container.scrollHeight;
  return row;
}

document.addEventListener('DOMContentLoaded', cbInit);
