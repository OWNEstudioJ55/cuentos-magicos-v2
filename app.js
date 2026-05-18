// ── SUPABASE CONFIG ──────────────────────────────────────────
const SUPA_URL = 'https://hqhnjyiureadmdqhgfbk.supabase.co';
const SUPA_KEY = 'sb_publishable_0i_uEVWfhfv9jta4VVwI8g_haKcej7O';
let supa = null;

function initSupabase() {
  try {
    supa = supabase.createClient(SUPA_URL, SUPA_KEY);
    console.log('✅ Supabase conectado');
  } catch(e) {
    console.error('❌ Supabase error:', e);
  }
}

// ── FAMILIA (login/register) ─────────────────────────────────
async function supaGetFamilia(codigo, passwordHash) {
  if (!supa) return null;
  try {
    const { data, error } = await supa
      .from('familias')
      .select('*')
      .eq('codigo', codigo.toLowerCase())
      .eq('password_hash', passwordHash)
      .single();
    if (error) { console.warn('supaGetFamilia:', error.message); return null; }
    return data;
  } catch(e) { console.error('supaGetFamilia error:', e); return null; }
}

async function supaCreateFamilia(familia) {
  if (!supa) return null;
  try {
    const { data, error } = await supa
      .from('familias')
      .insert(familia)
      .select()
      .single();
    if (error) { console.error('supaCreateFamilia:', error.message); return null; }
    return data;
  } catch(e) { console.error('supaCreateFamilia error:', e); return null; }
}

async function supaUpdateFamilia(id, updates) {
  if (!supa) return;
  try {
    await supa.from('familias').update(updates).eq('id', id);
  } catch(e) { console.error('supaUpdateFamilia:', e); }
}

// ── CUENTOS ──────────────────────────────────────────────────
async function supaSaveCuento(cuento) {
  if (!supa) return null;
  try {
    const { data, error } = await supa
      .from('cuentos')
      .upsert(cuento)
      .select()
      .single();
    if (error) { console.error('supaSaveCuento:', error.message); return null; }
    return data;
  } catch(e) { console.error('supaSaveCuento error:', e); return null; }
}

async function supaDeleteCuento(id) {
  if (!supa) return;
  try {
    const { error } = await supa.from('cuentos').delete().eq('id', id);
    if (error) console.error('supaDeleteCuento:', error.message);
    else console.log('✅ Cuento borrado de Supabase:', id);
  } catch(e) { console.error('supaDeleteCuento error:', e); }
}

async function supaGetCuentos(familiaId) {
  if (!supa) return [];
  try {
    const { data, error } = await supa
      .from('cuentos')
      .select('*')
      .eq('familia_id', familiaId)
      .order('created_at', { ascending: false });
    if (error) { console.warn('supaGetCuentos:', error.message); return []; }
    return data || [];
  } catch(e) { console.error('supaGetCuentos error:', e); return []; }
}

// ── MENSAJES NIÑO ────────────────────────────────────────────
async function supaSaveMensaje(mensaje) {
  if (!supa) return null;
  try {
    const { data, error } = await supa
      .from('mensajes_nino')
      .upsert(mensaje)
      .select()
      .single();
    if (error) { console.error('supaSaveMensaje:', error.message); return null; }
    return data;
  } catch(e) { console.error('supaSaveMensaje error:', e); return null; }
}

async function supaGetMensajes(familiaId) {
  if (!supa) return [];
  try {
    const { data, error } = await supa
      .from('mensajes_nino')
      .select('*')
      .eq('familia_id', familiaId)
      .order('created_at', { ascending: false });
    if (error) { console.warn('supaGetMensajes:', error.message); return []; }
    return data || [];
  } catch(e) { console.error('supaGetMensajes error:', e); return []; }
}

// ── AUDIO STORAGE ────────────────────────────────────────────
async function supaUploadAudio(blob, filename) {
  if (!supa || !blob) return null;
  try {
    const { data, error } = await supa.storage
      .from('own-audios')
      .upload(filename, blob, {
        contentType: blob.type || 'audio/webm',
        upsert: true
      });
    if (error) { console.error('supaUploadAudio:', error.message); return null; }
    console.log('✅ Audio subido:', filename);
    return filename;
  } catch(e) { console.error('supaUploadAudio error:', e); return null; }
}

async function supaGetAudioUrl(filename) {
  if (!supa || !filename) return null;
  try {
    const { data, error } = await supa.storage
      .from('own-audios')
      .createSignedUrl(filename, 3600); // 1 hora de validez
    if (error) { console.error('supaGetAudioUrl:', error.message); return null; }
    return data.signedUrl;
  } catch(e) { console.error('supaGetAudioUrl error:', e); return null; }
}

// ══════════════════════════════════════════
// SPRITE SHEET SYSTEM
// ══════════════════════════════════════════
const SPRITE_URL = '/sprites.png';
const IMG_W = 1800; const IMG_H = 800;

// ── NUEVO SPRITE SHEET OWN v2 ─────────────────────────────────
const SPRITE2_URL = '/sprites2_OWN.png';
const S2_W = 2400; const S2_H = 1600;

const OWN_SPRITES = {
  // FILA 1 — Logos
  logo_main:  { x:104, y:133, w:415, h:214 },
  logo_small: { x:520, y:160, w:259, h:180 },
  oso_nav:    { x:780, y:150, w:219, h:131 },
  // FILA 2 — Caras del oso (coordenadas exactas re-medidas)
  happy:      { x:87,   y:513, w:212, h:196 },
  sleepy:     { x:362,  y:502, w:228, h:207 },
  dreaming:   { x:651,  y:521, w:211, h:179 },
  hugging:    { x:944,  y:518, w:203, h:184 },
  reading:    { x:1230, y:506, w:198, h:203 },
  reading2:   { x:1521, y:506, w:278, h:203 },
  listening:  { x:1820, y:524, w:279, h:185 },
  nostalgic:  { x:2120, y:350, w:241, h:376 },
  // FILA 3 — Nav icons (coordenadas exactas medidas)
  nav_home:   { x:100,  y:883, w:132, h:138 }, // oso 3D
  nav_mic:    { x:338,  y:892, w:103, h:117 }, // micrófono
  nav_book:   { x:545,  y:899, w:135, h:107 }, // libro
  nav_audio:  { x:769,  y:891, w:135, h:116 }, // ondas audio
  nav_draw:   { x:988,  y:899, w:149, h:109 }, // mano dibujando
  nav_game:   { x:1210, y:886, w:149, h:121 }, // joystick
  nav_mail:   { x:1467, y:895, w:141, h:99  }, // carta/email
  // FILA 4 — Elementos textiles
  estrella:   { x:99,  y:1000, w:116, h:288 },
  luna:       { x:216, y:1000, w:215, h:268 },
  boton_tex:  { x:432, y:1000, w:215, h:258 },
  nube:       { x:648, y:1000, w:215, h:252 },
  corazon:    { x:864, y:1000, w:215, h:248 },
  hilo:       { x:1080,y:1000, w:215, h:289 },
};

function sprite2Div(key, sizePx, extraStyle='') {
  const sp = OWN_SPRITES[key]; if (!sp) return '';
  const scale = sizePx / Math.max(sp.w, sp.h);
  const bgW = Math.round(S2_W * scale);
  const bgH = Math.round(S2_H * scale);
  const bx  = -Math.round(sp.x * scale);
  const by  = -Math.round(sp.y * scale);
  return `<div style="width:${sizePx}px;height:${sizePx}px;background:url('${SPRITE2_URL}') ${bx}px ${by}px/${bgW}px ${bgH}px no-repeat;flex-shrink:0;${extraStyle}"></div>`;
}

function sprite2Bg(key, sizePx) {
  const sp = OWN_SPRITES[key]; if (!sp) return '';
  const scale = sizePx / Math.max(sp.w, sp.h);
  const bgW = Math.round(S2_W * scale);
  const bgH = Math.round(S2_H * scale);
  const bx  = -Math.round(sp.x * scale);
  const by  = -Math.round(sp.y * scale);
  return `background:url('${SPRITE2_URL}') ${bx}px ${by}px/${bgW}px ${bgH}px no-repeat;`;
}
// ─────────────────────────────────────────────────────────────

// ── SPRITE SHEET NIÑO ─────────────────────────────────────
const KID_SPRITE_URL = '/sprites_kid_OWN.png';
const KS_W = 1200; const KS_H = 896;

const KID_SPRITES = {
  // FILA 1 — Botones player
  btn_play:      { x:62,  y:58,  w:104, h:105 },
  btn_pause:     { x:200, y:58,  w:106, h:105 },
  btn_prev:      { x:347, y:70,  w:83,  h:82  },
  btn_next:      { x:466, y:70,  w:82,  h:82  },
  btn_play_big:  { x:591, y:50,  w:116, h:115 },
  btn_pause_big: { x:749, y:50,  w:116, h:115 },
  barra_prog:    { x:905, y:86,  w:231, h:41  },
  // FILA 2 — Cards cuentos
  card_celeste:  { x:55,  y:218, w:160, h:312 },
  card_coral:    { x:237, y:219, w:223, h:311 },
  card_verde:    { x:460, y:218, w:240, h:268 },
  card_lila:     { x:700, y:219, w:240, h:172 },
  badge_nuevo:   { x:795, y:284, w:185, h:49  },
  badge_fav:     { x:932, y:284, w:48,  h:49  },
  // FILA 3 — Player screen
  marco_portada: { x:56,  y:520, w:174, h:226 },
  panel_info:    { x:240, y:520, w:241, h:80  },
  btn_prev_sm:   { x:254, y:590, w:106, h:110 },
  btn_play_sm:   { x:340, y:590, w:117, h:110 },
  btn_next_sm:   { x:460, y:590, w:106, h:110 },
  barra_player:  { x:256, y:680, w:344, h:60  },
  btn_siguiente: { x:257, y:730, w:343, h:48  },
  // FILA 4 — Nav icons
  nav_escuchar:  { x:48,  y:795, w:112, h:64  },
  nav_crear:     { x:160, y:795, w:151, h:65  },
  nav_jugar:     { x:328, y:792, w:88,  h:80  },
};

function kidSprite(key, sizePx, extraStyle='') {
  const sp = KID_SPRITES[key]; if(!sp) return '';
  const scale = sizePx / Math.max(sp.w, sp.h);
  const bgW = Math.round(KS_W * scale);
  const bgH = Math.round(KS_H * scale);
  const bx  = -Math.round(sp.x * scale);
  const by  = -Math.round(sp.y * scale);
  return `<div style="width:${sizePx}px;height:${sizePx}px;background:url('${KID_SPRITE_URL}') ${bx}px ${by}px/${bgW}px ${bgH}px no-repeat;flex-shrink:0;${extraStyle}"></div>`;
}

function kidSpriteBg(key, sizePx) {
  const sp = KID_SPRITES[key]; if(!sp) return '';
  const scale = sizePx / Math.max(sp.w, sp.h);
  const bgW = Math.round(KS_W * scale);
  const bgH = Math.round(KS_H * scale);
  const bx  = -Math.round(sp.x * scale);
  const by  = -Math.round(sp.y * scale);
  return `background:url('${KID_SPRITE_URL}') ${bx}px ${by}px/${bgW}px ${bgH}px no-repeat;`;
}
// ─────────────────────────────────────────────────────────
const CHAR_SPRITES = {
  'dragon':    { x:59,   y:41, w:168, h:210 },
  'hada':      { x:286,  y:41, w:185, h:210 },
  'leon':      { x:531,  y:41, w:158, h:210 },
  'delfin':    { x:762,  y:41, w:162, h:210 },
  'zorro':     { x:986,  y:41, w:163, h:210 },
  'robot':     { x:1200, y:41, w:140, h:210 },
  'unicornio': { x:1409, y:41, w:161, h:210 },
  'mago':      { x:1618, y:41, w:150, h:210 },
};

const ICON_SPRITES = {
  'home':     { x:40,   y:344, w:190, h:177 },
  'mic':      { x:260,  y:344, w:190, h:177 },
  'books':    { x:460,  y:344, w:180, h:177 },
  'progress': { x:660,  y:344, w:170, h:177 },
  'trophy':   { x:870,  y:344, w:157, h:177 },
  'star':     { x:1075, y:344, w:145, h:177 },
  'play':     { x:1285, y:344, w:140, h:177 },
  'rocket':   { x:1490, y:344, w:175, h:177 },
  'brain':    { x:65,   y:574, w:146, h:152 },
  'book':     { x:289,  y:574, w:173, h:152 },
  'trophy2':  { x:527,  y:574, w:142, h:152 },
  'pencil':   { x:755,  y:574, w:134, h:152 },
  'camera':   { x:967,  y:574, w:153, h:152 },
  'sparkles': { x:1195, y:574, w:135, h:152 },
  'heart':    { x:1418, y:574, w:129, h:152 },
  'music':    { x:1639, y:574, w:112, h:152 },
};

// Helper: render a sprite as a div with background-image crop
function spriteDiv(sprite, sizePx, extraStyle='') {
  const scale = sizePx / Math.max(sprite.w, sprite.h);
  const bgW = Math.round(IMG_W * scale);
  const bgH = Math.round(IMG_H * scale);
  const bx  = -Math.round(sprite.x * scale);
  const by  = -Math.round(sprite.y * scale);
  return `<div style="width:${sizePx}px;height:${sizePx}px;background:url('${SPRITE_URL}') ${bx}px ${by}px/${bgW}px ${bgH}px no-repeat;flex-shrink:0;${extraStyle}"></div>`;
}

function spriteBg(sprite, sizePx) {
  const scale = sizePx / Math.max(sprite.w, sprite.h);
  const bgW = Math.round(IMG_W * scale);
  const bgH = Math.round(IMG_H * scale);
  const bx  = -Math.round(sprite.x * scale);
  const by  = -Math.round(sprite.y * scale);
  return `background:url('${SPRITE_URL}') ${bx}px ${by}px/${bgW}px ${bgH}px no-repeat;`;
}
function getFamiliaId() {
  return localStorage.getItem('ownFamiliaId') || null;
}
function setFamiliaId(id) {
  localStorage.setItem('ownFamiliaId', id);
}

// ===================== CONFIG =====================
const HF_TOKEN = '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';
const HF_MODEL = 'https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell';
const IMG_ERROR_PLACEHOLDER = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect fill="%231e1a4a" width="512" height="512"/><text x="256" y="256" text-anchor="middle" dominant-baseline="middle" font-size="80">🖼️</text></svg>';

// ===================== PLAN SYSTEM =====================
const PLANS = {
  free:    { id:'free',    label:'Gratis',   color:'#6b7280', cuentos:3,  imgRegens:3, voicesPremium:false, aiGen:false },
  premium: { id:'premium', label:'Premium',  color:'#d97706', cuentos:999, imgRegens:999, voicesPremium:true, aiGen:true },
};

function getUserPlan() { return localStorage.getItem('ownPlan') || 'premium'; } // BETA: premium desbloqueado
function getPlanData() { return PLANS[getUserPlan()] || PLANS.premium; }
function isPremium() { return true; } // BETA: siempre premium

// ===================== IMAGE GENERATION =====================
const ARCHIVE_IMAGES = {
  dragon: ['https://picsum.photos/seed/dragon1/512/512','https://picsum.photos/seed/dragon2/512/512','https://picsum.photos/seed/dragon3/512/512','https://picsum.photos/seed/dragon4/512/512','https://picsum.photos/seed/dragon5/512/512'],
  hada: ['https://picsum.photos/seed/hada1/512/512','https://picsum.photos/seed/fairy2/512/512','https://picsum.photos/seed/fairy3/512/512','https://picsum.photos/seed/fairy4/512/512'],
  bosque: ['https://picsum.photos/seed/forest1/512/512','https://picsum.photos/seed/forest2/512/512','https://picsum.photos/seed/forest3/512/512','https://picsum.photos/seed/forest4/512/512','https://picsum.photos/seed/forest5/512/512','https://picsum.photos/seed/forest6/512/512'],
  castillo: ['https://picsum.photos/seed/castle1/512/512','https://picsum.photos/seed/castle2/512/512','https://picsum.photos/seed/castle3/512/512','https://picsum.photos/seed/castle4/512/512'],
  espacio: ['https://picsum.photos/seed/space1/512/512','https://picsum.photos/seed/space2/512/512','https://picsum.photos/seed/space3/512/512','https://picsum.photos/seed/space4/512/512'],
  ocean: ['https://picsum.photos/seed/ocean1/512/512','https://picsum.photos/seed/ocean2/512/512','https://picsum.photos/seed/ocean3/512/512','https://picsum.photos/seed/ocean4/512/512'],
  default: ['https://picsum.photos/seed/story1/512/512','https://picsum.photos/seed/story2/512/512','https://picsum.photos/seed/story3/512/512','https://picsum.photos/seed/story4/512/512','https://picsum.photos/seed/story5/512/512','https://picsum.photos/seed/story6/512/512','https://picsum.photos/seed/story7/512/512','https://picsum.photos/seed/story8/512/512'],
};

function getArchiveImage(prompt) {
  const p = (prompt || '').toLowerCase();
  let pool = ARCHIVE_IMAGES.default;
  if (p.includes('drag')) pool = ARCHIVE_IMAGES.dragon;
  else if (p.includes('hada') || p.includes('fairy')) pool = ARCHIVE_IMAGES.hada;
  else if (p.includes('bosque') || p.includes('forest')) pool = ARCHIVE_IMAGES.bosque;
  else if (p.includes('castillo') || p.includes('castle')) pool = ARCHIVE_IMAGES.castillo;
  else if (p.includes('espac') || p.includes('space') || p.includes('luna') || p.includes('estrella')) pool = ARCHIVE_IMAGES.espacio;
  else if (p.includes('mar') || p.includes('ocean') || p.includes('delfin')) pool = ARCHIVE_IMAGES.ocean;
  return pool[Math.floor(Math.random() * pool.length)];
}

function buildShortPrompt(prompt) {
  const t = (prompt||'').trim().substring(0,120);
  return `children storybook illustration, ${t}, cute cartoon, colorful, pixar style`;
}

async function tryLoadImage(url, timeoutMs=8000) {
  return new Promise(resolve => {
    const img = new Image(); img.crossOrigin='anonymous';
    const t = setTimeout(()=>{img.src='';resolve(null);},timeoutMs);
    img.onload=()=>{clearTimeout(t);resolve(img.naturalWidth>10?url:null);};
    img.onerror=()=>{clearTimeout(t);resolve(null);};
    img.src=url;
  });
}

async function tryPollinations(prompt, seed) {
  const s = seed || Math.floor(Math.random()*999999);
  const enc = encodeURIComponent(buildShortPrompt(prompt).substring(0,200));
  // Solo intentamos 'turbo' — más rápido, timeout corto
  try {
    const url = `https://image.pollinations.ai/prompt/${enc}?width=512&height=512&seed=${s}&nologo=true&model=turbo`;
    const r = await tryLoadImage(url, 8000);
    if (r) return r;
  } catch(e) {}
  return null; // Fallback inmediato
}

async function generateImageAI(prompt) {
  // Only for premium
  const pol = await tryPollinations(prompt, Math.floor(Math.random()*999999));
  if (pol) return pol;
  // Fallback archive
  return getArchiveImage(prompt);
}

async function generateImageFree(prompt) {
  // Free: always use archive images (many, non-monotonous)
  return getArchiveImage(prompt);
}

async function generateImageWithFallback(prompt) {
  if (isPremium()) return generateImageAI(prompt);
  return generateImageFree(prompt);
}

async function generateNImages(prompts, onProgress) {
  const results = new Array(prompts.length).fill(null);
  for (let i=0; i<prompts.length; i++) {
    if (i>0) await new Promise(r=>setTimeout(r,500));
    try { results[i] = await generateImageWithFallback(prompts[i]); }
    catch(e) { results[i] = IMG_ERROR_PLACEHOLDER; }
    onProgress([...results]);
  }
  return results;
}

// ===================== DB =====================
let db;
function openDB() {
  return new Promise((resolve,reject) => {
    const req = indexedDB.open('OWNCuentosV2', 2);
    req.onupgradeneeded = e => {
      const d = e.target.result;
      if (!d.objectStoreNames.contains('stories'))  d.createObjectStore('stories',{keyPath:'id'});
      if (!d.objectStoreNames.contains('images'))   d.createObjectStore('images',{keyPath:'id'});
      if (!d.objectStoreNames.contains('audio'))    d.createObjectStore('audio',{keyPath:'id'});
      if (!d.objectStoreNames.contains('writings')) d.createObjectStore('writings',{keyPath:'id'});
    };
    req.onsuccess = e => { db=e.target.result; resolve(db); };
    req.onerror   = e => reject(e.target.error);
    req.onblocked = () => reject(new Error('IndexedDB bloqueada por otra pestaña'));
  });
}

async function dbPut(store, data) {
  if (!db) throw new Error('DB no inicializada');
  if (!data || data.id === undefined || data.id === null) throw new Error('datos sin id');
  return new Promise((resolve, reject) => {
    let tx;
    try { tx = db.transaction(store, 'readwrite'); }
    catch(e) { reject(e); return; }
    const req = tx.objectStore(store).put(data);
    req.onsuccess = () => resolve(req.result);
    req.onerror   = e => { e.stopPropagation(); reject(req.error || e.target.error); };
    tx.onerror    = e => { e.stopPropagation(); reject(tx.error || e.target.error); };
    tx.onabort    = e => { e.stopPropagation(); reject(new Error('Transacción abortada: ' + (tx.error?.message||''))); };
  });
}

async function dbGet(store, id) {
  if (!db) throw new Error('DB no inicializada');
  return new Promise((resolve, reject) => {
    let tx;
    try { tx = db.transaction(store, 'readonly'); }
    catch(e) { reject(e); return; }
    const req = tx.objectStore(store).get(id);
    req.onsuccess = e => resolve(e.target.result || null);
    req.onerror   = e => { e.stopPropagation(); reject(req.error || e.target.error); };
    tx.onerror    = e => { e.stopPropagation(); reject(tx.error || e.target.error); };
  });
}

async function dbGetAll(store) {
  if (!db) throw new Error('DB no inicializada');
  return new Promise((resolve, reject) => {
    let tx;
    try { tx = db.transaction(store, 'readonly'); }
    catch(e) { reject(e); return; }
    const req = tx.objectStore(store).getAll();
    req.onsuccess = e => resolve(e.target.result || []);
    req.onerror   = e => { e.stopPropagation(); reject(req.error || e.target.error); };
    tx.onerror    = e => { e.stopPropagation(); reject(tx.error || e.target.error); };
  });
}

async function dbDelete(store, id) {
  if (!db) throw new Error('DB no inicializada');
  return new Promise((resolve, reject) => {
    let tx;
    try { tx = db.transaction(store, 'readwrite'); }
    catch(e) { reject(e); return; }
    tx.objectStore(store).delete(id);
    tx.oncomplete = resolve;
    tx.onerror    = e => { e.stopPropagation(); reject(tx.error || e.target.error); };
  });
}

// Convertir blob a base64 para guardar en IndexedDB (evita error en Firefox mobile)
async function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function base64ToBlob(base64, type) {
  const res = await fetch(base64);
  return res.blob();
}

async function dbPutAudio(id, blob) {
  // Guardamos como base64 string — funciona en todos los browsers
  try {
    const base64 = await blobToBase64(blob);
    await dbPut('audio', { id, base64, type: blob.type, size: blob.size });
    console.log('✅ Audio guardado como base64 — id:', id, 'tamaño:', blob.size);
  } catch(err) {
    const msg = err?.message || err?.name || String(err);
    console.error('dbPutAudio error:', msg, err);
    throw err;
  }
}

async function dbGetAudio(id) {
  const data = await dbGet('audio', id);
  if (!data) return null;
  // Si es formato nuevo (base64)
  if (data.base64) {
    try {
      const blob = await base64ToBlob(data.base64, data.type || 'audio/webm');
      return { id, blob };
    } catch(e) {
      console.error('dbGetAudio base64 error:', e);
      return null;
    }
  }
  // Formato viejo (blob directo)
  return data;
}
async function hashPassword(pass) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pass));
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

// ===================== STATE =====================
let appState = {
  currentUser: null,
  loginTab: 'parent',
  tokens: 0,
  stars: 0,
  parentName: 'Papá',
  kidName: 'Niño',
  mediaRecorder: null,
  audioChunks: [],
  recordingTimer: null,
  recordSeconds: 0,
  isRecording: false,
  recordedBlob: null,
  recAudio: null,
  recIsPlaying: false,
  selectedVoice: 'normal',
  selectedChar: '🐉',
  currentStoryImages: [],
  currentStoryPrompts: [],
  storyTitle: '',
  currentStory: null,
  kidAudio: null,
  kidIsPlaying: false,
  kidVoice: 'normal',
  kidChar: '🐉',
  kidSlideIndex: 0,
  kidSlideInterval: null,
  kidImages: [],
  originalBlob: null,
  kidOwnAudioBlob: null,
  giftStarAmount: 5,
  _editingStoryId: null,
  portadaUrl: null,
};

// ===================== CONSTANTS =====================
const VOICES = [
  {id:'normal',   label:'🎤 Normal',    pitch:1,    rate:1,    free:true },
  {id:'dragon',   label:'🐉 Dragón',    pitch:0.45, rate:0.85, free:true },
  {id:'fairy',    label:'🧚 Hada',      pitch:2.2,  rate:1.1,  free:true },
  {id:'robot',    label:'🤖 Robot',     pitch:0.85, rate:0.95, free:true },
  {id:'dolphin',  label:'🐬 Delfín',   pitch:1.8,  rate:1.2,  free:true },
  {id:'lion',     label:'🦁 León',      pitch:0.35, rate:0.8,  free:false},
  {id:'unicorn',  label:'🦄 Unicornio', pitch:1.9,  rate:1.1,  free:false},
  {id:'wizard',   label:'🧙 Mago',      pitch:0.7,  rate:0.9,  free:false},
  {id:'mermaid',  label:'🧜 Sirena',   pitch:2.0,  rate:1.05, free:false},
  {id:'ghost',    label:'👻 Fantasma',  pitch:1.15, rate:0.8,  free:false},
];

const CHARACTERS = [
  {emoji:'🐉',name:'Dragón'},{emoji:'🧚',name:'Hada'},{emoji:'🦁',name:'León'},
  {emoji:'🐬',name:'Delfín'},{emoji:'🦊',name:'Zorro'},{emoji:'🤖',name:'Robot'},
  {emoji:'🦄',name:'Unicornio'},{emoji:'🧙',name:'Mago'},{emoji:'🐸',name:'Rana'},
  {emoji:'🐲',name:'Dragón Dorado'},{emoji:'🧜',name:'Sirena'},{emoji:'🦋',name:'Mariposa'},
];

const SEQ_CHARS = ['🐉','🧚','🦁','🐬','🦊','🤖','🦄','🧙'];
const SEQ_ACTIONS = [
  {icon:'🏃',label:'Corre'},{icon:'✈️',label:'Vuela'},{icon:'🤔',label:'Piensa'},
  {icon:'🤝',label:'Ayuda'},{icon:'⚔️',label:'Lucha'},{icon:'🎵',label:'Canta'},
  {icon:'🍕',label:'Come'},{icon:'😴',label:'Duerme'},
];

// ===================== CLASSIC STORIES =====================
const CLASSIC_STORIES = [
  {
    id:'caperucita', title:'Caperucita Roja', emoji:'🐺',
    color:'#ef4444', text:`Érase una vez una niña llamada Caperucita Roja que vivía en un hermoso bosque. Un día, su mamá le dijo: "Ve a llevarle esta canasta con comida a la abuelita, que está enferma". Caperucita tomó la canasta y partió por el bosque. En el camino se encontró con un lobo astuto. "¿A dónde vas, Caperucita?" preguntó el lobo. "Voy a casa de mi abuelita", respondió ella. El lobo corrió por un camino más corto y llegó primero a la casa de la abuela. Se disfrazó de abuelita y esperó a Caperucita. Cuando llegó, Caperucita notó algo raro. "Abuelita, ¡qué ojos tan grandes tienes!" "Para verte mejor, hijita". "Abuelita, ¡qué boca tan grande tienes!" "¡Para comerte mejor!" gritó el lobo. Pero llegó un cazador valiente que rescató a Caperucita y a su abuelita. Y colorín colorado, este cuento se ha acabado. ¡Nunca hables con extraños en el bosque!`,
    images:['https://picsum.photos/seed/caperucita1/512/512','https://picsum.photos/seed/caperucita2/512/512','https://picsum.photos/seed/lobo1/512/512','https://picsum.photos/seed/bosque1/512/512'],
    quiz:[
      {q:'¿A dónde iba Caperucita?', opts:['Al bosque a jugar','A casa de su abuelita','Al mercado','A la escuela'], correct:1},
      {q:'¿Qué llevaba Caperucita en la canasta?', opts:['Juguetes','Ropa','Comida','Flores'], correct:2},
      {q:'¿Quién salvó a Caperucita y la abuelita?', opts:['Un policía','Un cazador','Un leñador','Un vecino'], correct:1},
      {q:'¿Qué hizo el lobo antes de que llegara Caperucita?', opts:['Huyó corriendo','Se disfrazó de abuelita','Se escondió afuera','Durmió una siesta'], correct:1},
    ]
  },
  {
    id:'chanchitos', title:'Los Tres Chanchitos', emoji:'🐷',
    color:'#f97316', text:`Había una vez tres chanchitos que se llamaban Fifi, Fafa y Fofó. Un día decidieron construir sus propias casas. Fifi, el más pequeño, construyó una casa de paja muy rápido para salir a jugar. Fafa construyó una casa de madera, también bastante rápido. Pero Fofó, el mayor y más trabajador, tardó mucho tiempo en construir su casa de ladrillos. Llegó entonces el lobo feroz, que siempre tenía hambre. Sopló y sopló la casa de paja de Fifi... ¡y la derrumbó! Fifi corrió a la casa de Fafa. El lobo sopló y sopló la casa de madera... ¡y también la derrumbó! Los dos chanchitos corrieron a la casa de ladrillos de Fofó. El lobo sopló y sopló y sopló... ¡pero no pudo derrumbarla! La casa de ladrillos era muy fuerte. El lobo intentó entrar por la chimenea, pero cayó en una olla de agua caliente y escapó para siempre. Los tres chanchitos aprendieron que vale la pena trabajar duro y hacer las cosas bien.`,
    images:['https://picsum.photos/seed/pig1/512/512','https://picsum.photos/seed/pig2/512/512','https://picsum.photos/seed/wolf1/512/512','https://picsum.photos/seed/house1/512/512'],
    quiz:[
      {q:'¿Cómo se llamaban los chanchitos?', opts:['Lolo, Lela y Lili','Fifi, Fafa y Fofó','Pepe, Pipa y Popo','Uno, Dos y Tres'], correct:1},
      {q:'¿De qué era la casa más fuerte?', opts:['De madera','De paja','De ladrillos','De piedra'], correct:2},
      {q:'¿Cómo intentó entrar el lobo a la casa de ladrillos?', opts:['Por la ventana','Por la puerta','Por la chimenea','Rompiendo la pared'], correct:2},
      {q:'¿Qué lección aprendieron los chanchitos?', opts:['Que hay que jugar mucho','Que vale la pena trabajar bien','Que los lobos son buenos','Que las casas de paja son lindas'], correct:1},
    ]
  },
  {
    id:'hansel', title:'Hansel y Gretel', emoji:'🏡',
    color:'#8b5cf6', text:`En el borde de un gran bosque vivían Hansel y Gretel con su papá y su madrastra. Eran muy pobres y apenas tenían comida. Una noche, la madrastra convenció al papá de dejar a los niños en el bosque. Pero Hansel escuchó el plan y guardó piedritas blancas en su bolsillo. Al día siguiente, mientras caminaban, Hansel fue dejando piedritas. Gracias a ellas, pudieron volver a casa. Pero la madrastra lo intentó de nuevo, y esta vez Hansel solo pudo usar migajas de pan... que los pájaros se comieron. Los niños se perdieron en el bosque. Después de caminar mucho, encontraron una casa hecha de dulces y galletas. ¡Qué delicia! Pero adentro vivía una bruja malvada que atrapó a Hansel para comérselo. Gretel fue muy valiente: engañó a la bruja y la empujó al horno. Encontraron el tesoro de la bruja y el camino a casa. Su papá los recibió con mucha alegría, y vivieron felices para siempre.`,
    images:['https://picsum.photos/seed/hansel1/512/512','https://picsum.photos/seed/forest3/512/512','https://picsum.photos/seed/candy1/512/512','https://picsum.photos/seed/witch1/512/512'],
    quiz:[
      {q:'¿Qué dejó Hansel la primera vez para encontrar el camino?', opts:['Migajas de pan','Piedritas blancas','Flores','Monedas'], correct:1},
      {q:'¿De qué estaba hecha la casa de la bruja?', opts:['De madera','De ladrillos','De dulces y galletas','De oro'], correct:2},
      {q:'¿Qué hizo Gretel para salvar a su hermano?', opts:['Llamó a la policía','Empujó a la bruja al horno','Escapó sola','Pidió ayuda'], correct:1},
      {q:'¿Por qué los niños no pudieron volver con las migajas de pan?', opts:['Se les mojaron','Los pájaros se las comieron','El viento las llevó','Se perdieron igual'], correct:1},
    ]
  },
  {
    id:'blancanieves', title:'Blancanieves', emoji:'🍎',
    color:'#ec4899', text:`Había una vez una princesa de piel blanca como la nieve, labios rojos como la sangre y cabello negro como el ébano. Se llamaba Blancanieves. Su madrastra, la malvada reina, tenía un espejo mágico. "Espejito, espejito, ¿quién es la más bella?" El espejo siempre decía: "Blancanieves". La reina ordenó a un cazador llevar a Blancanieves al bosque y matarla. Pero el cazador tuvo piedad y la dejó escapar. Blancanieves encontró una casita donde vivían siete enanitos: Dormilón, Gruñón, Tímido, Feliz, Estornudo, Chistoso y Sabio. Los enanitos la acogieron con amor. La reina se enteró y le llevó una manzana envenenada. Blancanieves la mordió y cayó dormida. Los enanitos la pusieron en un ataúd de cristal. Un príncipe la encontró, se enamoró y al darle un beso, Blancanieves despertó. Vivieron felices para siempre.`,
    images:['https://picsum.photos/seed/snow1/512/512','https://picsum.photos/seed/dwarf1/512/512','https://picsum.photos/seed/apple1/512/512','https://picsum.photos/seed/prince1/512/512'],
    quiz:[
      {q:'¿Cómo se llamaba la princesa?', opts:['Cenicienta','Blancanieves','Aurora','Rapunzel'], correct:1},
      {q:'¿Cuántos enanitos había?', opts:['Cinco','Seis','Siete','Ocho'], correct:2},
      {q:'¿Qué le dio la reina malvada a Blancanieves?', opts:['Una flor','Una manzana envenenada','Un pastel','Un vestido'], correct:1},
      {q:'¿Quién despertó a Blancanieves?', opts:['Un enanito','Su mamá','Un príncipe','Un hada'], correct:2},
    ]
  },
  {
    id:'gatoconbotas', title:'El Gato con Botas', emoji:'👢',
    color:'#f59e0b', text:`Había un molinero que al morir dejó a sus tres hijos como herencia el molino, el burro y el gato. Al hijo menor solo le tocó el gato. Pero el gato era muy especial y muy astuto. "Dame unas botas y una bolsa, y te haré rico", le dijo a su amo. El gato comenzó a cazar liebres y perdices y a llevarlas al rey como regalo "del Marqués de Carabás". El rey quedó muy impresionado. Un día, mientras el rey paseaba con su hija en carruaje, el gato hizo que su amo se bañara en el río. "¡Socorro! ¡El Marqués de Carabás se ahoga!" gritó el gato. El rey le dio ropa elegante a su amo. El gato también convenció a todos los campesinos de decir que las tierras eran del Marqués. Finalmente, el gato engañó a un ogro que se convirtió en ratón, ¡y el gato se lo comió! El castillo quedó para su amo, quien se casó con la princesa y vivieron felices.`,
    images:['https://picsum.photos/seed/cat1/512/512','https://picsum.photos/seed/castle2/512/512','https://picsum.photos/seed/king1/512/512','https://picsum.photos/seed/boots1/512/512'],
    quiz:[
      {q:'¿Qué pidió el gato a su amo?', opts:['Comida y agua','Botas y una bolsa','Un sombrero','Un castillo'], correct:1},
      {q:'¿Qué nombre inventó el gato para su amo?', opts:['Príncipe Encantado','Duque de Alba','Marqués de Carabás','Conde de Monte'], correct:2},
      {q:'¿En qué se convirtió el ogro?', opts:['En sapo','En ratón','En serpiente','En pájaro'], correct:1},
      {q:'¿Con quién se casó el hijo del molinero?', opts:['Con una campesina','Con la princesa','Con una hada','Con la hija del ogro'], correct:1},
    ]
  },
  {
    id:'zorrayuvas', title:'La Zorra y las Uvas', emoji:'🦊',
    color:'#84cc16', text:`Una zorra caminaba por el bosque cuando vio un hermoso racimo de uvas colgando de una vid muy alta. Las uvas eran grandes, brillantes y de color morado. "¡Qué deliciosas se ven!" pensó la zorra, relamiéndose. Dio un salto para alcanzarlas, pero no llegó. Intentó de nuevo, y otra vez. Saltó muchas veces, pero las uvas estaban demasiado alto. Cansada y frustrada, la zorra se alejó con la cabeza bien en alto. "Seguramente esas uvas están verdes y agrias", dijo mirando hacia atrás. "No las quiero, no me gustan las uvas verdes". Y así la zorra se fue, inventando una excusa para no sentirse mal por no haber podido alcanzarlas. Esta historia nos enseña que a veces, cuando no podemos obtener algo, decimos que no lo queríamos para sentirnos mejor.`,
    images:['https://picsum.photos/seed/fox1/512/512','https://picsum.photos/seed/grapes1/512/512','https://picsum.photos/seed/forest4/512/512','https://picsum.photos/seed/vine1/512/512'],
    quiz:[
      {q:'¿Qué quería alcanzar la zorra?', opts:['Manzanas','Peras','Uvas','Cerezas'], correct:2},
      {q:'¿Por qué no pudo alcanzarlas?', opts:['Eran muy pesadas','Estaban muy altas','Había un perro guardián','Tenía miedo'], correct:1},
      {q:'¿Qué dijo la zorra al final?', opts:['Que eran muy caras','Que estarían verdes y agrias','Que no le gustaban las frutas','Que volvería mañana'], correct:1},
      {q:'¿Qué nos enseña esta historia?', opts:['Que hay que saltar más alto','Que las uvas son agrias','Que a veces nos engañamos a nosotros mismos','Que la zorra es tonta'], correct:2},
    ]
  },
  {
    id:'musicosbremen', title:'Los Músicos de Bremen', emoji:'🎵',
    color:'#06b6d4', text:`Un burro viejo fue abandonado por su amo. En el camino encontró a un perro, un gato y un gallo que también habían sido abandonados. Decidieron ir juntos a Bremen para ser músicos. Al anochecer vieron una casita iluminada. Mirando por la ventana vieron a unos ladrones comiendo. Con un plan ingenioso, el burro se paró en sus patas traseras, el perro saltó sobre él, el gato trepó sobre el perro, y el gallo voló hasta arriba. ¡Luego hicieron todos ruido a la vez! El burro rebuzó, el perro ladró, el gato maulló y el gallo cantó. Los ladrones, aterrados, huyeron creyendo que era un monstruo. Los cuatro amigos se quedaron a vivir en la casa, disfrutando de la comida. Nunca llegaron a Bremen, ¡pero encontraron algo mejor: un hogar y una familia!`,
    images:['https://picsum.photos/seed/donkey1/512/512','https://picsum.photos/seed/rooster1/512/512','https://picsum.photos/seed/cottage1/512/512','https://picsum.photos/seed/music1/512/512'],
    quiz:[
      {q:'¿A qué ciudad querían ir los animales?', opts:['Berlín','París','Bremen','Madrid'], correct:2},
      {q:'¿Qué animales formaban el grupo?', opts:['Burro, perro, gato y gallo','Burro, vaca, oveja y gallo','Caballo, perro, gato y loro','Burro, perro, lobo y gallo'], correct:0},
      {q:'¿Qué había en la casita?', opts:['Una familia','Unos ladrones','Un dragón','Una bruja'], correct:1},
      {q:'¿Qué hicieron para asustar a los ladrones?', opts:['Los atacaron','Hicieron ruido todos juntos','Llamaron a la policía','Prendieron fuego'], correct:1},
    ]
  },
  {
    id:'liebretortuga', title:'La Liebre y la Tortuga', emoji:'🐢',
    color:'#10b981', text:`Érase una vez una liebre muy veloz que siempre se burlaba de la tortuga por caminar tan despacio. "¡Eres lentísima! ¡Nunca llegarás a ningún lado!" se reía la liebre. La tortuga, cansada de las burlas, la desafió a una carrera. Todos los animales del bosque fueron a ver la carrera. Cuando el árbitro dio la señal, la liebre salió disparada y en un instante dejó a la tortuga muy atrás. Tan confiada estaba que decidió echarse una siesta bajo un árbol. "¿Para qué apurarme? La tortuga tarda tanto que tengo tiempo de sobra", pensó. Pero la tortuga siguió caminando sin parar, paso a paso, constante y determinada. Cuando la liebre despertó, la tortuga ya estaba llegando a la meta. La liebre corrió lo más rápido que pudo, ¡pero era demasiado tarde! La tortuga ganó la carrera. Todos celebraron. La moraleja: la constancia y el esfuerzo superan al talento descuidado.`,
    images:['https://picsum.photos/seed/turtle1/512/512','https://picsum.photos/seed/hare1/512/512','https://picsum.photos/seed/race1/512/512','https://picsum.photos/seed/forest5/512/512'],
    quiz:[
      {q:'¿Por qué la liebre perdió la carrera?', opts:['Era muy lenta','Se perdió en el bosque','Se durmió durante la carrera','Se lastimó una pata'], correct:2},
      {q:'¿Quién desafió a quién?', opts:['La liebre desafió a la tortuga','La tortuga desafió a la liebre','Un árbitro los hizo correr','El rey organizó la carrera'], correct:1},
      {q:'¿Qué hizo la tortuga durante toda la carrera?', opts:['Corrió muy rápido al final','Caminó sin parar constantemente','Pidió ayuda a otros animales','Tomó un camino más corto'], correct:1},
      {q:'¿Cuál es la moraleja de la historia?', opts:['Los lentos siempre ganan','La constancia supera al talento descuidado','Las liebres son malas','Las tortugas son más inteligentes'], correct:1},
    ]
  },
  {
    id:'patitofeo', title:'El Patito Feo', emoji:'🦢',
    color:'#6366f1', text:`En una granja, una mamá pata empollaba sus huevos con mucha paciencia. Uno a uno fueron naciendo los patitos, amarillos y adorables. Pero el último huevo era más grande y cuando eclosionó, salió un patito gris, grande y torpe. "¡Qué feo es!" decían todos. Los otros animales se burlaban de él y lo picoteaban. Hasta sus propios hermanos lo rechazaban. El pobre patito se fue de la granja muy triste. Durante el otoño e invierno vivió solo, pasando frío y hambre. Pero llegó la primavera, y el patito vio en el lago a unos hermosos cisnes blancos. Bajó la cabeza con vergüenza, esperando ser rechazado. Pero cuando vio su reflejo en el agua, ¡no vio un patito feo sino un hermoso cisne blanco! Los otros cisnes lo recibieron con alegría. El patito feo se había convertido en el cisne más bello. Nunca más volvió a sentirse solo.`,
    images:['https://picsum.photos/seed/duck1/512/512','https://picsum.photos/seed/swan1/512/512','https://picsum.photos/seed/lake1/512/512','https://picsum.photos/seed/farm1/512/512'],
    quiz:[
      {q:'¿Por qué el patito era diferente?', opts:['Era más pequeño','Era gris y grande','Era muy ruidoso','Era de otro color amarillo'], correct:1},
      {q:'¿Qué descubrió el patito al mirarse en el lago?', opts:['Que era un pato común','Que era un hermoso cisne','Que había crecido mucho','Que tenía plumas blancas'], correct:1},
      {q:'¿Cómo lo trataban los otros animales?', opts:['Con mucho amor','Con indiferencia','Con burlas y rechazo','Con respeto'], correct:2},
      {q:'¿Qué nos enseña esta historia?', opts:['Que los patos son mejores que los cisnes','Que la belleza interior es lo que importa','Que hay que escapar de casa','Que el invierno es peligroso'], correct:1},
    ]
  },
];
const ACHIEVEMENTS = [
  {id:'first_story', icon:'📖', name:'Primer cuento', desc:'Escuchaste tu primer cuento', req: s => s.storiesListened >= 1},
  {id:'star_5', icon:'⭐', name:'5 Estrellitas', desc:'¡Acumulaste 5 estrellitas!', req: s => s.stars >= 5},
  {id:'star_20', icon:'🌟', name:'Coleccionista', desc:'¡20 estrellitas acumuladas!', req: s => s.stars >= 20},
  {id:'quiz_first', icon:'🧠', name:'Cuestionario', desc:'Completaste tu primer quiz', req: s => s.quizDone >= 1},
  {id:'quiz_perfect', icon:'💯', name:'100% Perfecto', desc:'Respondiste todo bien en un quiz', req: s => s.perfectQuiz >= 1},
  {id:'writer', icon:'✍️', name:'Escritor', desc:'Guardaste tu primera historia', req: s => s.writingsSaved >= 1},
  {id:'creative', icon:'🎨', name:'Creativo', desc:'Guardaste 3 historias', req: s => s.writingsSaved >= 3},
  {id:'explorer', icon:'🗺️', name:'Explorador', desc:'Escuchaste los 3 cuentos clásicos', req: s => s.classicsListened >= 3},
  {id:'player', icon:'🎮', name:'Jugador', desc:'Jugaste 5 veces en el patio', req: s => s.gamesPlayed >= 5},
];

// ===================== PROGRESS TRACKING =====================
function getKidProgress() {
  const raw = localStorage.getItem('ownKidProgress');
  const defaults = { storiesListened:0, quizDone:0, perfectQuiz:0, writingsSaved:0, classicsListened:0, gamesPlayed:0, totalWritingChars:0, sessionMinutes:0 };
  if (!raw) return defaults;
  return Object.assign(defaults, JSON.parse(raw));
}
function updateKidProgress(key, delta=1) {
  const p = getKidProgress();
  p[key] = (p[key]||0) + delta;
  localStorage.setItem('ownKidProgress', JSON.stringify(p));
  checkAchievements();
}
function checkAchievements() {
  const p = getKidProgress();
  const s = { ...p, stars: appState.stars };
  const earned = JSON.parse(localStorage.getItem('ownEarnedAchievements') || '[]');
  ACHIEVEMENTS.forEach(a => {
    if (!earned.includes(a.id) && a.req(s)) {
      earned.push(a.id);
      localStorage.setItem('ownEarnedAchievements', JSON.stringify(earned));
      showToast(`🏆 Logro desbloqueado: ${a.name}!`);
    }
  });
}

// ===================== INIT =====================
async function init() {
  await openDB();
  // Check Google OAuth session first
  await checkGoogleSession();
  const settings = JSON.parse(localStorage.getItem('ownSettings') || '{}');
  if (!settings.setupDone) { showScreen('welcomeScreen'); return; }
  appState.tokens = parseInt(localStorage.getItem('ownTokens') || '0');
  appState.stars = parseInt(localStorage.getItem('ownStars') || '0');
  appState.parentName = settings.parentName || 'Papá';
  appState.kidName = settings.kidName || 'Niño';

  // Verificar vencimiento beta
  const venceStr = localStorage.getItem('ownVenceEn');
  if(venceStr) {
    const vence = new Date(venceStr);
    const hoy = new Date();
    const diasRestantes = Math.ceil((vence - hoy) / (1000*60*60*24));
    if(diasRestantes <= 0) {
      // Acceso vencido
      showScreen('setupScreen');
      goStep(0);
      const errEl = document.getElementById('codigoError');
      if(errEl) {
        errEl.textContent = '⏳ Tu acceso beta venció. Escribinos por WhatsApp para renovarlo.';
        errEl.style.display = 'block';
      }
      return;
    }
    appState.diasRestantes = diasRestantes;
    localStorage.setItem('ownDiasRestantes', diasRestantes);
  }

  const session = localStorage.getItem('ownSession');
  if (session === 'parent') showParentApp();
  else if (session === 'kid') showKidApp();
  else showScreen('loginScreen');
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  // Mostrar nav del niño solo en kidApp
  const kidNav = document.getElementById('kidNavBar');
  if(kidNav) kidNav.style.display = id === 'kidApp' ? 'flex' : 'none';
}

// ===================== GOOGLE LOGIN =====================
async function loginConGoogle() {
  if(!supa) { showToast('❌ Sin conexión'); return; }
  showLoading('Abriendo Google...');
  try {
    const { data, error } = await supa.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if(error) {
      hideLoading();
      showToast('❌ Error: ' + error.message);
    }
  } catch(e) {
    hideLoading();
    showToast('❌ Error de conexión');
  }
}

// Handle OAuth callback on page load
async function checkGoogleSession() {
  if(!supa) return;
  try {
    const { data: { session } } = await supa.auth.getSession();
    if(!session) return;

    const user = session.user;
    const email = user.email;
    const name = user.user_metadata?.full_name || email.split('@')[0];

    // Check if this Google user has a family in Supabase
    const { data: familia } = await supa
      .from('familias')
      .select('*')
      .eq('email_google', email)
      .single();

    if(familia && familia.activo) {
      // Familia existe — restaurar sesión
      localStorage.setItem('ownFamiliaId', familia.id);
      localStorage.setItem('ownParentName', familia.nombre_padre || name);
      localStorage.setItem('ownKidName', familia.nombre_nino || 'Mi hijo');
      localStorage.setItem('ownParentPass', familia.password_hash || 'google');
      localStorage.setItem('ownKidPass', familia.kid_password_hash || 'google');
      localStorage.setItem('ownSettings', JSON.stringify({
        setupDone: true,
        parentName: familia.nombre_padre || name,
        kidName: familia.nombre_nino || 'Mi hijo'
      }));
      showToast('✅ ¡Bienvenido de vuelta, ' + (familia.nombre_padre || name) + '!');
      showScreen('loginScreen');
    } else {
      // Usuario nuevo con Google — ir al setup con datos pre-rellenados
      localStorage.setItem('ownGoogleEmail', email);
      localStorage.setItem('ownGoogleName', name);
      showScreen('setupScreen');
      goStep(1); // Skip code step — go directly to name/password
      // Pre-fill parent name
      const nameInput = document.getElementById('setupParentName');
      if(nameInput) nameInput.value = name;
    }
  } catch(e) {
    console.warn('checkGoogleSession:', e);
  }
}

// ===================== WELCOME SCREEN =====================
function showWelcomeLogin() {
  document.getElementById('welcomeLoginWrap').style.display='block';
  document.getElementById('loginCodigo').focus();
}
function hideWelcomeLogin() {
  document.getElementById('welcomeLoginWrap').style.display='none';
  document.getElementById('welcomeLoginError').style.display='none';
  document.getElementById('loginCodigo').value='';
  document.getElementById('welcomePass').value='';
  document.getElementById('welcomeKidPass').value='';
}
function showWelcomeSetup() {
  showScreen('setupScreen');
  goStep(0);
}

async function loginConCodigo() {
  const codigo   = document.getElementById('loginCodigo').value.trim().toUpperCase();
  const pass     = document.getElementById('welcomePass').value;
  const kidPass  = document.getElementById('welcomeKidPass').value;
  const errEl    = document.getElementById('welcomeLoginError');
  errEl.style.display='none';

  if(!codigo||codigo.length<4){errEl.textContent='❌ Ingresá tu código OWN';errEl.style.display='block';return;}
  if(!pass){errEl.textContent='❌ Ingresá tu contraseña de padre/madre';errEl.style.display='block';return;}
  if(!kidPass){errEl.textContent='❌ Ingresá la contraseña del niño';errEl.style.display='block';return;}
  if(!supa){errEl.textContent='❌ Sin conexión al servidor';errEl.style.display='block';return;}

  showLoading('Verificando...');
  try {
    const {data,error}=await supa.from('familias').select('*').eq('codigo',codigo).single();
    hideLoading();

    if(error||!data){errEl.textContent='❌ Código no encontrado.';errEl.style.display='block';return;}
    if(!data.activo){errEl.textContent='❌ Código no activado. Usá "Es mi primera vez".';errEl.style.display='block';return;}

    const hash=await hashPassword(pass);
    if(data.password_hash === 'pendiente') {
      await supa.from('familias').update({ password_hash: hash }).eq('codigo', codigo);
    } else if(hash!==data.password_hash){
      errEl.textContent='❌ Contraseña de padre incorrecta.';errEl.style.display='block';return;
    }

    if(data.vence_en){
      const dias=Math.ceil((new Date(data.vence_en)-new Date())/(1000*60*60*24));
      if(dias<=0){errEl.textContent='⏳ Tu acceso venció. Escribinos por WhatsApp.';errEl.style.display='block';return;}
      localStorage.setItem('ownDiasRestantes',dias);
    }

    const kidHash = await hashPassword(kidPass);
    localStorage.setItem('ownFamiliaId',data.id);
    localStorage.setItem('ownCodigo',codigo);
    localStorage.setItem('ownParentName',data.nombre_padre||'Papá');
    localStorage.setItem('ownKidName',data.nombre_nino||'Niño');
    localStorage.setItem('ownParentPass',hash);
    localStorage.setItem('ownKidPass',kidHash);
    localStorage.setItem('ownVenceEn',data.vence_en||'');
    localStorage.setItem('ownSettings',JSON.stringify({setupDone:true,parentName:data.nombre_padre||'Papá',kidName:data.nombre_nino||'Niño'}));

    showToast('✅ ¡Bienvenido de vuelta, '+(data.nombre_padre||'Papá')+'!');
    showScreen('loginScreen');
  } catch(e){
    hideLoading();
    errEl.textContent='❌ Error de conexión. Intentá de nuevo.';
    errEl.style.display='block';
  }
}

// ===================== SETUP =====================
// ===================== SETUP =====================
function goStep(n) {
  [0,1,2,3].forEach(i => {
    const el = document.getElementById('step'+i);
    if(el) el.classList.toggle('active', i===n);
  });
  document.getElementById('setupProgress').style.width=((n+1)/4*100)+'%';
}

async function setupVerificarCodigo() {
  const codigo = document.getElementById('setupCodigo').value.trim().toUpperCase();
  const errEl = document.getElementById('codigoError');
  errEl.style.display = 'none';

  if(!codigo || codigo.length < 4) {
    errEl.textContent = '❌ Ingresá tu código de acceso';
    errEl.style.display = 'block'; return;
  }
  if(!supa) {
    errEl.textContent = '❌ Sin conexión al servidor. Verificá tu internet.';
    errEl.style.display = 'block'; return;
  }

  showLoading('Verificando código...');
  try {
    const { data, error } = await supa
      .from('familias')
      .select('*')
      .eq('codigo', codigo)
      .single();

    hideLoading();

    if(error || !data) {
      errEl.textContent = '❌ Código no encontrado. Verificá que esté bien escrito.';
      errEl.style.display = 'block'; return;
    }

    // Familia ya activada
    if(data.activo) {
      // Si password fue reseteado → permitir re-setup
      if(data.password_hash === 'pendiente') {
        localStorage.setItem('ownFamiliaId', data.id);
        localStorage.setItem('ownCodigo', codigo);
        goStep(1); // ir directo a crear contraseñas nuevas
        return;
      }
      localStorage.setItem('ownFamiliaId', data.id);
      localStorage.setItem('ownCodigo', codigo);
      localStorage.setItem('ownSupaData', JSON.stringify(data));
      document.getElementById('loginExistenteWrap').style.display = 'block';
      document.getElementById('btnVerificarCodigo').style.display = 'none';
      document.getElementById('loginExistentePass').focus();
      return;
    }

    // Código nuevo → flujo de setup normal
    localStorage.setItem('ownFamiliaId', data.id);
    localStorage.setItem('ownCodigo', codigo);
    goStep(1);

  } catch(e) {
    hideLoading();
    errEl.textContent = '❌ Error de conexión. Intentá de nuevo.';
    errEl.style.display = 'block';
  }
}

async function loginFamiliaExistente() {
  const pass = document.getElementById('loginExistentePass').value;
  const errEl = document.getElementById('codigoError');
  errEl.style.display = 'none';

  if(!pass) {
    errEl.textContent = '❌ Ingresá tu contraseña';
    errEl.style.display = 'block'; return;
  }

  const dataStr = localStorage.getItem('ownSupaData');
  if(!dataStr) { errEl.textContent = '❌ Error interno. Reintentá.'; errEl.style.display='block'; return; }
  const data = JSON.parse(dataStr);

  showLoading('Verificando contraseña...');
  const hash = await hashPassword(pass);
  hideLoading();

  if(hash !== data.password_hash) {
    errEl.textContent = '❌ Contraseña incorrecta. Intentá de nuevo.';
    errEl.style.display = 'block'; return;
  }

  // Contraseña correcta — restaurar sesión
  localStorage.setItem('ownParentName', data.nombre_padre || 'Papá');
  localStorage.setItem('ownKidName', data.nombre_nino || 'Niño');
  localStorage.setItem('ownParentPass', data.password_hash);
  localStorage.setItem('ownVenceEn', data.vence_en || '');

  // Calcular días restantes
  if(data.vence_en) {
    const dias = Math.ceil((new Date(data.vence_en) - new Date()) / (1000*60*60*24));
    localStorage.setItem('ownDiasRestantes', Math.max(0, dias));
    if(dias <= 0) {
      errEl.textContent = '⏳ Tu acceso beta venció. Escribinos por WhatsApp para renovarlo.';
      errEl.style.display = 'block'; return;
    }
  }

  localStorage.setItem('ownSettings', JSON.stringify({
    setupDone: true,
    parentName: data.nombre_padre || 'Papá',
    kidName: data.nombre_nino || 'Niño'
  }));

  showToast('✅ ¡Bienvenido de vuelta!');
  showScreen('loginScreen');
}

async function setupStep2() {
  const name=document.getElementById('setupParentName').value.trim();
  const pass=document.getElementById('setupParentPass').value;
  const pass2=document.getElementById('setupParentPass2').value;
  if (!name) { showToast('❌ Ingresá tu nombre'); return; }
  if (pass.length<4) { showToast('❌ Contraseña mínimo 4 caracteres'); return; }
  if (pass!==pass2) { showToast('❌ Las contraseñas no coinciden'); return; }
  const hash=await hashPassword(pass);
  localStorage.setItem('ownParentPass',hash);
  localStorage.setItem('ownParentName',name);
  goStep(2);
}

async function setupStep3() {
  const name=document.getElementById('setupKidName').value.trim();
  const pass=document.getElementById('setupKidPass').value;
  if (!name) { showToast('❌ Ingresá el nombre del niño'); return; }
  if (!pass) { showToast('❌ Ingresá una contraseña'); return; }
  const hash=await hashPassword(pass);
  localStorage.setItem('ownKidPass',hash);
  localStorage.setItem('ownKidName',name);
  goStep(3);

  // Calcular fecha de vencimiento (15 días desde hoy)
  const vence = new Date();
  vence.setDate(vence.getDate() + 15);
  const venceStr = vence.toLocaleDateString('es-AR');
  localStorage.setItem('ownVenceEn', vence.toISOString());

  // Mostrar info beta
  const betaEl = document.getElementById('setupBetaInfo');
  if(betaEl) betaEl.innerHTML = `⏳ Tu acceso beta vence el <strong>${venceStr}</strong><br>Tenés 15 días para probar OWN con tu familia.`;

  // Activar familia en Supabase
  const familiaId = getFamiliaId();
  const parentName = document.getElementById('setupParentName').value.trim();
  const kidName = name;
  const parentHash = localStorage.getItem('ownParentPass');
  const kidHash = hash;

  if(supa && familiaId) {
    const venceISO = vence.toISOString();
    const googleEmail = localStorage.getItem('ownGoogleEmail') || null;
    supa.from('familias').update({
      activo: true,
      nombre_padre: parentName,
      nombre_nino: kidName,
      password_hash: parentHash,
      vence_en: venceISO,
      ...(googleEmail ? { email_google: googleEmail } : {})
    }).eq('id', familiaId)
    .then(({error}) => {
      if(error) console.error('Error activando familia:', error.message);
      else console.log('✅ Familia activada en Supabase');
    });
  }
}

function finishSetup() {
  const parentName=localStorage.getItem('ownParentName')||'Papá';
  const kidName=localStorage.getItem('ownKidName')||'Niño';
  localStorage.setItem('ownSettings',JSON.stringify({setupDone:true,parentName,kidName}));
  appState.parentName=parentName; appState.kidName=kidName;
  showScreen('loginScreen');
}

// ===================== LOGIN =====================
function switchLoginTab(tab) {
  appState.loginTab=tab;
  document.getElementById('tabParent').classList.toggle('active',tab==='parent');
  document.getElementById('tabKid').classList.toggle('active',tab==='kid');
  document.getElementById('loginPass').value='';
  document.getElementById('loginError').style.display='none';
}
async function doLogin() {
  const pass=document.getElementById('loginPass').value;
  if (!pass) { showLoginError('❌ Ingresá tu contraseña'); return; }
  const hash=await hashPassword(pass);
  const storedKey=appState.loginTab==='parent'?'ownParentPass':'ownKidPass';
  const stored=localStorage.getItem(storedKey);

  // Si es el niño y no hay contraseña guardada, o es placeholder — crear una nueva
  if(appState.loginTab==='kid' && (!stored || stored==='google')) {
    localStorage.setItem('ownKidPass', hash);
    document.getElementById('loginError').style.display='none';
    localStorage.setItem('ownSession','kid');
    showKidApp();
    showToast('✅ Contraseña del niño creada');
    return;
  }

  // Si el padre entró con Google, su hash es 'google' — aceptar cualquier contraseña y guardarla
  if(appState.loginTab==='parent' && stored==='google') {
    localStorage.setItem('ownParentPass', hash);
    document.getElementById('loginError').style.display='none';
    localStorage.setItem('ownSession','parent');
    showParentApp();
    return;
  }

  if (hash===stored) {
    document.getElementById('loginError').style.display='none';
    localStorage.setItem('ownSession',appState.loginTab);
    if (appState.loginTab==='parent') showParentApp();
    else showKidApp();
  } else {
    showLoginError('❌ Contraseña incorrecta');
  }
}
function showLoginError(msg) {
  const el=document.getElementById('loginError');
  el.textContent=msg; el.style.display='block';
}
function doLogout() {
  // Solo borra la sesión — NO borra contraseñas ni configuración
  localStorage.removeItem('ownSession');
  // Limpiar estado de audio del niño para evitar bug de audio viejo
  appState.kidOwnAudioBlob = null;
  appState.kidRecAudio = null;
  appState.kidRecIsPlaying = false;
  appState.kidOwnAudioMime = null;
  if(appState.kidAudio){ try{ appState.kidAudio.pause(); }catch(e){} appState.kidAudio=null; }
  if(appState.recAudio){ try{ appState.recAudio.pause(); }catch(e){} appState.recAudio=null; }
  appState.recordedBlob = null;
  try{ stopKidPlay(); }catch(e){}
  showScreen('loginScreen');
  const lp = document.getElementById('loginPass'); if(lp) lp.value='';
}

function doFullReset() {
  if(!confirm('¿Seguro? Esto borra toda la configuración y los cuentos del celular.')) return;
  localStorage.clear();
  appState.kidOwnAudioBlob = null;
  appState.recordedBlob = null;
  if(appState.kidAudio){ try{ appState.kidAudio.pause(); }catch(e){} appState.kidAudio=null; }
  if(appState.recAudio){ try{ appState.recAudio.pause(); }catch(e){} appState.recAudio=null; }
  showScreen('welcomeScreen');

}

async function doResetPassword() {
  const p=document.getElementById('resetNewPass').value;
  const p2=document.getElementById('resetNewPass2').value;
  if (p.length<4) { showToast('❌ Mínimo 4 caracteres'); return; }
  if (p!==p2) { showToast('❌ Las contraseñas no coinciden'); return; }
  const hash=await hashPassword(p);
  localStorage.setItem('ownParentPass',hash);
  document.getElementById('resetModal').classList.remove('open');
  document.getElementById('resetStep1').style.display='block';
  document.getElementById('resetStep2').style.display='none';
  showToast('✅ Contraseña actualizada');
}

// ===================== PARENT APP =====================
function showParentApp() {
  appState.currentUser='parent';
  const settings=JSON.parse(localStorage.getItem('ownSettings')||'{}');
  appState.parentName=settings.parentName||'Papá';
  appState.kidName=settings.kidName||'Niño';
  appState.tokens=parseInt(localStorage.getItem('ownTokens')||'0');
  document.getElementById('parentName').textContent=appState.parentName;
  document.getElementById('parentTokens').textContent=appState.tokens;
  document.getElementById('bigTokenCount').textContent=appState.tokens;
  const kn=appState.kidName;
  ['homeKidName','homeKidName2','homeKidName3','progressKidName'].forEach(id=>{
    const el=document.getElementById(id); if(el) el.textContent=kn;
  });
  document.getElementById('kidMsgNameLabel') && (document.getElementById('kidMsgNameLabel').textContent=kn);
  buildParentVoicePills();
  buildParentCharGrid();
  buildTokenShop();
  buildTokenPurchaseGrid();
  loadParentLibrary();
  buildProgressSummary();
  parentSequenceData=[{},{},{},{},{}];
  parentSelectedCelebration='fiesta';
  buildParentSequenceScenes();
  updateParentNotifBadge();
  // Beta expiry banner
  const diasRestantes = parseInt(localStorage.getItem('ownDiasRestantes') || '99');
  const betaBanner = document.getElementById('betaBanner');
  if(betaBanner) {
    if(diasRestantes <= 5) {
      betaBanner.style.display = 'block';
      betaBanner.innerHTML = `⏳ Tu acceso beta vence en <strong>${diasRestantes} día${diasRestantes!==1?'s':''}</strong> — Escribinos por WhatsApp para renovar`;
    } else if(diasRestantes <= 10) {
      betaBanner.style.display = 'block';
      betaBanner.innerHTML = `⏳ Acceso beta: ${diasRestantes} días restantes`;
    } else {
      betaBanner.style.display = 'none';
    }
  }
  switchParentTab('home');
  showScreen('parentApp');
  injectNavSprites();
  checkRutinaAutomatica();
  // Show kid activity alert
  setTimeout(()=>{
    const lastKidActivity = localStorage.getItem('ownKidLastActivity');
    const lastParentCheck = localStorage.getItem('ownParentLastCheck') || '0';
    const alert = document.getElementById('kidActivityAlert');
    const alertMsg = document.getElementById('kidActivityMsg');
    if(alert && lastKidActivity && lastKidActivity > lastParentCheck) {
      const kidName = appState.kidName || 'Tu hijo';
      if(alertMsg) alertMsg.textContent = kidName + ' abrió la app — ¡mandále un cuento!';
      alert.style.display = 'flex';
    } else if(alert) {
      alert.style.display = 'none';
    }
  }, 500);
}

function switchParentTab(tab) {
  // Map old tabs to new 3-tab structure
  if(tab==='progress'||tab==='tokens') tab='library';
  // Si está grabando o tiene grabación no guardada, preguntar
  if(tab !== 'record' && (appState.isRecording || appState.recordedBlob)) {
    showSaveBeforeLeaveDialog(tab);
    return;
  }
  _doSwitchParentTab(tab);
}

function showSaveBeforeLeaveDialog(targetTab) {
  const div=document.createElement('div');
  div.className='modal-overlay open';
  div.innerHTML=`<div class="modal-box" style="text-align:center">
    <div style="font-size:48px;margin-bottom:12px">🎙️</div>
    <div style="font-family:'Fredoka One',cursive;font-size:20px;margin-bottom:8px;color:var(--text)">¿Guardás la grabación?</div>
    <div style="font-size:14px;color:var(--text2);margin-bottom:24px;line-height:1.6">Tenés una grabación sin guardar. Si salís ahora la perdés.</div>
    <div style="display:flex;gap:10px">
      <button class="btn btn-danger btn-full" onclick="this.closest('.modal-overlay').remove();_doSwitchParentTab('${targetTab}');appState.recordedBlob=null;appState.recAudio=null;">Salir sin guardar</button>
      <button class="btn btn-green btn-full" onclick="this.closest('.modal-overlay').remove();">Quedarme a grabar</button>
    </div>
  </div>`;
  div.addEventListener('click',e=>{ if(e.target===div) div.remove(); });
  document.body.appendChild(div);
}

function _doSwitchParentTab(tab) {
  if(tab==='progress'||tab==='tokens') tab='library';
  ['home','record','library','tokens','progress'].forEach(t=>{
    const el=document.getElementById('pTab-'+t);
    if(el) el.style.display=t===tab||((t==='tokens'||t==='progress')&&tab==='library')?'none':'none';
  });
  ['home','record','library'].forEach(t=>{
    const el=document.getElementById('pTab-'+t);
    if(el) el.style.display=t===tab?'block':'none';
    const nav=document.getElementById('pnav-'+t);
    if(nav) nav.classList.toggle('active',t===tab);
  });
  if(tab==='library') { loadParentLibrary(); loadParentKidMessages(); }
  if(tab==='home') { loadParentHomeStories(); buildProgressSummary(); loadParentKidMessages(); }
  if(tab==='record') showRecTab();
}

function injectNavSprites() {
  // Parent nav — nuevos sprites OWN
  const pNav = [
    ['picon-home',    'nav_home',  36],
    ['picon-record',  'nav_mic',   36],
    ['picon-library', 'reading2',  36],
  ];
  pNav.forEach(([id, key, size]) => {
    const el = document.getElementById(id);
    if(!el) return;
    el.style.cssText = `display:block;width:${size}px;height:${size}px;` + sprite2Bg(key, size);
  });

  // Home padre — logo, avatar, acciones rápidas
  const logoEl = document.getElementById('own-logo-sprite');
  if(logoEl) logoEl.style.cssText = `width:46px;height:46px;` + sprite2Bg('oso_nav', 46);
  const avatarEl = document.getElementById('own-avatar-sprite');
  if(avatarEl) {
    avatarEl.style.cssText = `width:50px;height:50px;border-radius:14px;flex-shrink:0;` + sprite2Bg('listening', 50);
  }
  const micQc = document.getElementById('own-qc-mic');
  if(micQc) micQc.style.cssText = `display:block;width:36px;height:36px;` + sprite2Bg('nav_mic', 36);
  // Fecha en header superior
  const now = new Date();
  const dayEl = document.getElementById('headerDay');
  const monthEl = document.getElementById('headerMonth');
  if(dayEl) dayEl.textContent = now.getDate();
  if(monthEl) monthEl.textContent = now.toLocaleString('es',{month:'short'});

  // Sección recompensas — estrella sprite
  ['own-estrella-sprite','own-estrella-big','own-estrella-btn','own-estrella-num'].forEach((id,idx)=>{
    const sizes=[36,56,22,36];
    const el=document.getElementById(id);
    if(el) el.style.cssText=`width:${sizes[idx]}px;height:${sizes[idx]}px;display:inline-block;`+sprite2Bg('estrella',sizes[idx]);
  });

  // Kid nav — sprites peluche
  const kidNavItems = [
    ['kicon-escuchar', 'nav_escuchar', 44],
    ['kicon-crear',    'nav_crear',    44],
    ['kicon-jugar',    'nav_jugar',    44],
  ];
  kidNavItems.forEach(([id,key,size])=>{
    const el=document.getElementById(id);
    if(el) el.style.cssText=`width:${size}px;height:${size}px;`+kidSpriteBg(key,size);
  });

  // Hero botón "Escuchar ahora"
  const heroBtn=document.getElementById('kidHeroBtnSig');
  if(heroBtn) heroBtn.style.cssText=`width:220px;height:48px;`+kidSpriteBg('btn_siguiente',48);
  const kidPlay=document.getElementById('kidPlayBtn'); if(kidPlay) { kidPlay.innerHTML=''; kidPlay.style.cssText=`width:72px;height:72px;${kidSpriteBg('btn_play_big',72)}`; }
  const kidPrev = document.getElementById('kidBtnPrev');
  if(kidPrev) { kidPrev.innerHTML=''; kidPrev.style.cssText=`width:56px;height:56px;${kidSpriteBg('btn_prev',56)}`; }
  const kidNext = document.getElementById('kidBtnNext');
  if(kidNext) { kidNext.innerHTML=''; kidNext.style.cssText=`width:56px;height:56px;${kidSpriteBg('btn_next',56)}`; }
  const kidSig = document.getElementById('kidBtnSiguiente');
  if(kidSig) { kidSig.innerHTML=''; kidSig.style.cssText=`width:200px;height:40px;${kidSpriteBg('btn_siguiente',40)}`; }
}

function previewVoiceWithChar() {
  if(!('speechSynthesis' in window)) { showToast('❌ Tu navegador no soporta preview de voz'); return; }
  const voice = VOICES.find(v=>v.id===appState.selectedVoice)||VOICES[0];
  const char = appState.selectedChar || 'dragon';
  const charNames = {dragon:'Dragón',hada:'Hada',leon:'León',delfin:'Delfín',zorro:'Zorro',robot:'Robot',unicornio:'Unicornio',mago:'Mago'};
  const charName = charNames[char] || 'personaje';
  const text = `Hola! Soy ${charName} y voy a contarte un cuento mágico. Había una vez...`;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'es-AR'; utter.pitch = voice.pitch; utter.rate = voice.rate;
  utter.onstart = () => { const btn=document.getElementById('btnPreviewVoice'); if(btn) btn.textContent='🔊 Escuchando...'; };
  utter.onend = utter.onerror = () => { const btn=document.getElementById('btnPreviewVoice'); if(btn) btn.textContent='👂 Probar voz'; };
  window.speechSynthesis.speak(utter);
}

function buildParentVoicePills() {
  const el=document.getElementById('parentVoicePills');
  if(!el) return;
  const prem=isPremium();
  el.innerHTML=VOICES.map(v=>{
    const locked=!v.free && !prem;
    const isActive=v.id===appState.selectedVoice;
    const onclick=locked ? "showToast('🔒 Disponible en Premium')" : "selectParentVoice('"+v.id+"')";
    const premStar=(!v.free&&prem)?'<span style="font-size:9px;color:var(--gold);display:block">✨</span>':'';
    return '<button class="voice-pill '+(isActive?'active':'')+' '+(!v.free?'premium-voice':'')+'" onclick="'+onclick+'" style="'+(locked?'opacity:0.5':'')+'">'+(locked?'🔒 ':'')+v.label+premStar+'</button>';
  }).join('');
}

function selectParentVoice(id) {
  appState.selectedVoice=id;
  buildParentVoicePills();
  if(appState.recordedBlob) document.getElementById('recApplyVoiceBtn').style.display='inline-flex';
}

function buildParentCharGrid() {
  const el=document.getElementById('parentCharGrid');
  if(!el) return;
  const chars=[
    {id:'dragon',label:'Dragón'},
    {id:'hada',label:'Hada'},
    {id:'leon',label:'León'},
    {id:'delfin',label:'Delfín'},
    {id:'zorro',label:'Zorro'},
    {id:'robot',label:'Robot'},
    {id:'unicornio',label:'Unicornio'},
    {id:'mago',label:'Mago'},
  ];
  el.style.cssText='display:grid;grid-template-columns:repeat(4,1fr);gap:8px';
  el.innerHTML=chars.map(c=>{
    const sprite=CHAR_SPRITES[c.id];
    const isActive=appState.selectedChar===c.id;
    const bg=sprite?spriteBg(sprite,64):'';
    return `<button onclick="selectParentChar('${c.id}')" style="padding:8px 4px;border-radius:14px;border:2px solid ${isActive?'var(--lavender)':'rgba(255,255,255,.06)'};background:${isActive?'rgba(167,139,250,.15)':'var(--bg2)'};cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px;transition:all .2s">
      <div style="width:56px;height:56px;${bg}border-radius:8px"></div>
      <span style="font-size:10px;font-weight:700;color:${isActive?'var(--lavender)':'var(--text2)'}">${c.label}</span>
    </button>`;
  }).join('');
}

function selectParentChar(e) {
  appState.selectedChar=e;
  buildParentCharGrid();
  updatePortadaChar();
}

// ===================== RECORD STEPS =====================
let currentRecStep = 1, autoAdvanceInterval = null;

function showRecTab() {
  // Show guide on first visit
  const seen = localStorage.getItem('ownRecGuideSeen');
  if(!seen) document.getElementById('recGuide').style.display='block';
  goRecStep(1);
}

function dismissRecGuide() {
  document.getElementById('recGuide').style.display='none';
  localStorage.setItem('ownRecGuideSeen','1');
}

function goRecStep(n) {
  currentRecStep=n;
  [1,2,3,4].forEach(i=>{
    const step=document.getElementById('recStep-'+i);
    if(step) step.style.display=i===n?'block':'none';
    const tab=document.getElementById('rstab-'+i);
    if(tab) { tab.classList.toggle('active',i===n); tab.classList.toggle('done',i<n); }
  });
  if(n===2) {
    // Si estamos editando y ya hay imágenes, habilitar el botón siguiente
    const nextBtn=document.getElementById('btnGoStep3');
    const genBtn=document.getElementById('btnGenScenes');
    if(appState._editingStoryId && appState.currentStoryImages && appState.currentStoryImages.length) {
      const thumbRow=document.getElementById('scenesThumbRow');
      const preview=document.getElementById('scenesPreviewGrid');
      if(thumbRow) thumbRow.innerHTML=appState.currentStoryImages.map((u,i)=>`<img src="${u}" style="width:100%;aspect-ratio:1;border-radius:8px;object-fit:cover" title="Escena ${i+1}">`).join('');
      if(preview) preview.style.display='block';
      if(nextBtn) nextBtn.disabled=false;
      if(genBtn) genBtn.textContent='🔄 Regenerar imágenes (opcional)';
    } else if(!appState._editingStoryId) {
      // Cuento nuevo — resetear
      if(nextBtn) nextBtn.disabled=true;
      if(genBtn) genBtn.textContent='✨ Generar las 5 imágenes';
    }
  }
  if(n===3) {
    // Sync title from step 1 to step 3 editable field
    const t1=document.getElementById('storyTitle');
    const t3=document.getElementById('storyTitleStep3');
    if(t1&&t3) t3.value=t1.value;
    buildRecSlideshow(appState.currentStoryImages||[]);
  }
  if(n===4) updateRecStep4Summary();
  const content=document.getElementById('parentContent');
  if(content) content.scrollTo(0,0);
}

function updateRecStep4Summary() {
  const title=document.getElementById('storyTitle')?.value||'Sin título';
  // Update editable title input
  const titleInput=document.getElementById('recFinalTitleInput');
  if(titleInput) titleInput.value=title;
  // Also update legacy element if exists
  const legacyTitle=document.getElementById('recFinalTitle');
  if(legacyTitle) legacyTitle.textContent=title;
  document.getElementById('recStep4KidName').textContent=appState.kidName||'tu hijo';
  const imgs=appState.currentStoryImages||[];
  const dur=appState.recordSeconds||0;
  const sceneEl=document.getElementById('recFinalSceneCount');
  if(sceneEl) sceneEl.textContent=`${imgs.length} escena${imgs.length!==1?'s':''} · ${formatTime(dur)} de audio`;
  // Update portada thumb
  const thumb=document.getElementById('recFinalPortadaThumb');
  if(thumb) {
    if(appState.portadaUrl) {
      thumb.innerHTML=`<img src="${appState.portadaUrl}" style="width:100%;height:100%;object-fit:cover">`;
    } else {
      const sprite=CHAR_SPRITES[appState.selectedChar];
      thumb.innerHTML=sprite?`<div style="width:100%;height:100%;${spriteBg(sprite,64)}"></div>`:`<span style="font-size:36px">${appState.selectedChar||'📖'}</span>`;
    }
  }
  buildParentVoicePills();
  hideLoading();
}

function previewVoiceWithChar() {
  if(!('speechSynthesis' in window)) { showToast('❌ Tu navegador no soporta preview'); return; }
  const voice = VOICES.find(v=>v.id===appState.selectedVoice)||VOICES[0];
  const char = appState.selectedChar || 'dragon';
  const charNames = {dragon:'Dragón',hada:'Hada',leon:'León',delfin:'Delfín',zorro:'Zorro',robot:'Robot',unicornio:'Unicornio',mago:'Mago'};
  const charName = charNames[char] || 'personaje';
  const text = `Hola! Soy el ${charName} y voy a contarte un cuento mágico. Había una vez...`;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'es-AR'; utter.pitch = voice.pitch||1; utter.rate = voice.rate||1;
  utter.onstart = () => { const btn=document.getElementById('btnPreviewVoice'); if(btn) btn.textContent='🔊 Escuchando...'; };
  utter.onend = utter.onerror = () => { const btn=document.getElementById('btnPreviewVoice'); if(btn) btn.textContent='👂 Probar voz'; };
  window.speechSynthesis.speak(utter);
}

// ===================== RECORDING =====================
let recordingInterval=null;
async function toggleRecord() {
  if(appState.isRecording) { stopRecording(); return; }
  try {
    const stream=await navigator.mediaDevices.getUserMedia({audio:true,video:false});
    appState.audioChunks=[];
    const mimeType=MediaRecorder.isTypeSupported('audio/webm;codecs=opus')?'audio/webm;codecs=opus':
                   MediaRecorder.isTypeSupported('audio/webm')?'audio/webm':
                   MediaRecorder.isTypeSupported('audio/ogg')?'audio/ogg':'';
    appState.mediaRecorder=new MediaRecorder(stream, mimeType?{mimeType}:{});
    appState.mediaRecorder.ondataavailable=e=>{if(e.data&&e.data.size>0) appState.audioChunks.push(e.data);};
    appState.mediaRecorder.onstop=()=>{
      stream.getTracks().forEach(t=>t.stop());
      if(!appState.audioChunks.length){ showToast('❌ No se grabó audio'); return; }
      const blob=new Blob(appState.audioChunks,{type:mimeType||'audio/webm'});
      appState.recordedBlob=blob; appState.originalBlob=blob;
      if(appState.recAudioUrl){ try{ URL.revokeObjectURL(appState.recAudioUrl); }catch(e){} }
      const url=URL.createObjectURL(blob);
      appState.recAudioUrl=url;
      if(appState.recAudio){ appState.recAudio.pause(); appState.recAudio=null; }
      const audio=new Audio();
      audio.preload='auto';
      audio.src=url;
      audio.load();
      audio.onloadedmetadata=()=>{
        const td=document.getElementById('recTimeDisplay');
        if(td) td.textContent='0:00 / '+formatTime(audio.duration||0);
      };
      audio.ontimeupdate=()=>{
        const prog=document.getElementById('recProgress');
        if(prog&&audio.duration) prog.style.width=(audio.currentTime/audio.duration*100)+'%';
        const td=document.getElementById('recTimeDisplay');
        if(td) td.textContent=formatTime(audio.currentTime)+' / '+formatTime(audio.duration||0);
      };
      audio.onended=()=>{
        appState.recIsPlaying=false;
        const btn=document.getElementById('recPlayBtn'); if(btn) btn.textContent='▶';
      };
      audio.onerror=()=>{ showToast('❌ Error cargando audio grabado'); console.error('Parent rec audio error',audio.error); };
      appState.recAudio=audio;
      const pb=document.getElementById('recPlayback'); if(pb) pb.style.display='block';
      showVoiceDistortionPanel();
      stopAutoAdvance();
    };
    appState.mediaRecorder.start(100);
    appState.isRecording=true;
    appState.recordSeconds=0;
    const btn=document.getElementById('recBtn');
    if(btn){
      btn.classList.add('recording');
      btn.style.background='linear-gradient(135deg,#ef4444,#dc2626)';
      btn.style.boxShadow='0 8px 32px rgba(239,68,68,.6)';
      btn.innerHTML='<span style="font-size:44px;line-height:1">⏹️</span><span style="font-size:14px;font-weight:900;font-family:Nunito,sans-serif;margin-top:4px">PARAR</span>';
    }
    const rs=document.getElementById('recStatus'); if(rs) rs.textContent='🔴 Grabando... tocá PARAR cuando termines';
    clearInterval(recordingInterval);
    recordingInterval=setInterval(()=>{
      appState.recordSeconds++;
      const rt=document.getElementById('recTimer'); if(rt) rt.textContent=formatTime(appState.recordSeconds);
    },1000);
    if(document.getElementById('autoAdvanceChk')?.checked) startAutoAdvance();
  } catch(e) { console.error(e); showToast('❌ No se pudo acceder al micrófono: '+e.message); }
}

function stopRecording() {
  if(appState.mediaRecorder&&appState.isRecording){
    appState.mediaRecorder.stop();
    appState.isRecording=false;
    clearInterval(recordingInterval);
    const btn=document.getElementById('recBtn');
    if(btn){
      btn.classList.remove('recording');
      btn.style.background='linear-gradient(135deg,var(--coral),#ff8e53)';
      btn.style.boxShadow='0 8px 24px rgba(255,107,107,.5)';
      btn.innerHTML='<span style="font-size:44px;line-height:1">🎙️</span><span style="font-size:14px;font-weight:900;font-family:\'Nunito\',sans-serif;margin-top:4px">GRABAR</span>';
    }
    const rs=document.getElementById('recStatus'); if(rs) rs.textContent='✅ Grabación completa — escuchala ↓';
    stopAutoAdvance();
  }
}

function deleteRecording() {
  if(appState.recAudio){ appState.recAudio.pause(); appState.recAudio=null; }
  appState.recordedBlob=null; appState.originalBlob=null; appState.recIsPlaying=false; appState.recordSeconds=0;
  const pb=document.getElementById('recPlayback'); if(pb) pb.style.display='none';
  const rt=document.getElementById('recTimer'); if(rt) rt.textContent='0:00';
  const rs=document.getElementById('recStatus'); if(rs) rs.textContent='Listo para grabar';
  const rp=document.getElementById('recProgress'); if(rp) rp.style.width='0%';
}

function toggleRecPlay() {
  if(!appState.recAudio){ showToast('❌ No hay grabación'); return; }
  if(appState.recIsPlaying){
    appState.recAudio.pause();
    appState.recIsPlaying=false;
    const btn=document.getElementById('recPlayBtn'); if(btn) btn.textContent='▶';
  } else {
    appState.recAudio.play()
      .then(()=>{
        appState.recIsPlaying=true;
        const btn=document.getElementById('recPlayBtn'); if(btn) btn.textContent='⏸';
      })
      .catch(e=>{
        appState.recIsPlaying=false;
        showToast('❌ Error reproduciendo: '+e.message);
        console.error('toggleRecPlay error',e);
      });
  }
}

function seekRecAudio(secs) {
  if(!appState.recAudio) return;
  appState.recAudio.currentTime=Math.max(0,Math.min(appState.recAudio.duration||0,appState.recAudio.currentTime+secs));
}

// Auto-advance slideshow
function toggleAutoAdvance() {
  const chk=document.getElementById('autoAdvanceChk');
  if(chk?.checked&&appState.isRecording) startAutoAdvance();
  else stopAutoAdvance();
}

function startAutoAdvance() {
  stopAutoAdvance();
  const secs=parseInt(document.getElementById('autoAdvanceSecs')?.value||'10')*1000;
  autoAdvanceInterval=setInterval(()=>slideRecView(1),secs);
}

function stopAutoAdvance() {
  clearInterval(autoAdvanceInterval); autoAdvanceInterval=null;
}


// ══ DISTORSIÓN DE VOZ — 3 opciones ══
const VOICE_DISTORTIONS = [
  { id:'ada',   label:'🧚 Hada',  pitch:1.4,  rate:1.1 },
  { id:'ogro',  label:'👹 Ogro',  pitch:0.6,  rate:0.85 },
  { id:'dragon',label:'🐉 Dragón',pitch:0.75, rate:0.9  },
];
let _selectedDistortion = null;
let _distortPreviewAudio = null;

function showVoiceDistortionPanel() {
  const wrap = document.getElementById('recApplyVoiceWrap');
  if(!wrap) return;
  wrap.innerHTML = `
    <div style="background:var(--card);border-radius:16px;padding:14px;margin-top:12px;border:1px solid rgba(167,139,250,0.2)">
      <div style="font-family:'Fredoka One',cursive;font-size:15px;color:var(--text);margin-bottom:10px">🎭 Distorsionar voz (opcional)</div>
      <div style="display:flex;gap:8px;margin-bottom:12px">
        ${VOICE_DISTORTIONS.map(v=>`
          <button onclick="selectDistortion('${v.id}',this)" 
            style="flex:1;padding:10px 6px;border-radius:12px;border:2px solid rgba(255,255,255,.08);background:var(--bg2);cursor:pointer;font-size:13px;font-weight:700;color:var(--text2);font-family:Nunito,sans-serif;display:flex;flex-direction:column;align-items:center;gap:4px"
            id="distBtn-${v.id}">
            <span style="font-size:24px">${v.label.split(' ')[0]}</span>
            <span>${v.label.split(' ')[1]}</span>
          </button>`).join('')}
      </div>
      <div id="distortPreviewWrap" style="display:none;margin-bottom:10px">
        <button onclick="previewDistortion()" class="btn btn-ghost btn-sm btn-full" id="btnDistPreview">👂 Escuchar preview</button>
      </div>
      <div style="display:flex;gap:8px">
        <button onclick="applyDistortionAndSave()" class="btn btn-accent btn-sm" style="flex:1" id="btnApplyDistort" disabled>✅ Aplicar y enviar</button>
        <button onclick="saveStoryWithoutDistortion()" class="btn btn-ghost btn-sm" style="flex:1">Sin distorsión →</button>
      </div>
    </div>`;
  wrap.style.display = 'block';
}

function selectDistortion(id, btn) {
  _selectedDistortion = VOICE_DISTORTIONS.find(v=>v.id===id);
  document.querySelectorAll('[id^="distBtn-"]').forEach(b=>{
    b.style.border = '2px solid rgba(255,255,255,.08)';
    b.style.color = 'var(--text2)';
    b.style.background = 'var(--bg2)';
  });
  if(btn) {
    btn.style.border = '2px solid var(--lavender)';
    btn.style.color = 'var(--lavender)';
    btn.style.background = 'rgba(167,139,250,0.15)';
  }
  document.getElementById('distortPreviewWrap').style.display = 'block';
  document.getElementById('btnApplyDistort').disabled = false;
}

function previewDistortion() {
  if(!_selectedDistortion || !appState.recordedBlob) return;
  const btn = document.getElementById('btnDistPreview');
  if(_distortPreviewAudio && !_distortPreviewAudio.paused) {
    _distortPreviewAudio.pause();
    if(btn) btn.textContent = '👂 Escuchar preview';
    return;
  }
  const url = URL.createObjectURL(appState.recordedBlob);
  const audio = new Audio();
  audio.src = url;
  audio.playbackRate = _selectedDistortion.rate;
  // Pitch via Web Audio API
  try {
    const ctx = new (window.AudioContext||window.webkitAudioContext)();
    const src = ctx.createMediaElementSource(audio);
    src.connect(ctx.destination);
  } catch(e) {}
  audio.onended = () => { if(btn) btn.textContent = '👂 Escuchar preview'; };
  _distortPreviewAudio = audio;
  audio.play().then(()=>{ if(btn) btn.textContent = '⏸ Pausar'; });
}

async function applyDistortionAndSave() {
  if(!_selectedDistortion) return;
  // Aplicar rate como distorsión básica y guardar
  appState.selectedVoice = _selectedDistortion.id;
  showToast('✅ Distorsión aplicada — guardando...');
  await saveStory();
}

async function saveStoryWithoutDistortion() {
  _selectedDistortion = null;
  await saveStory();
}

async function applyVoiceToRecording() {
  if(!appState.recordedBlob) { showToast('❌ No hay grabación'); return; }
  const voice=VOICES.find(v=>v.id===appState.selectedVoice);
  if(!voice||voice.id==='normal') { showToast('Seleccioná una voz diferente'); return; }
  showToast(`✅ Voz ${voice.label} seleccionada para el cuento`);
  const avw=document.getElementById('recApplyVoiceWrap'); if(avw) avw.style.display='none';
}

// ===================== IMAGES =====================
async function generateStoryImage() {
  showLoading('Generando imagen...');
  try {
    const prompt=document.getElementById('storyTitle').value||'magical fairy tale adventure';
    const url=await generateImageWithFallback(prompt);
    appState.currentStoryImages=[url];
    const wrap=document.getElementById('storyImgWrap');
    wrap.innerHTML=`<img src="${url}" class="img-preview" onclick="selectStoryImg(0)" style="cursor:pointer">`;
    if(!isPremium()) useToken(2);
  } catch(e) { showToast('❌ Error generando imagen'); }
  hideLoading();
}

async function generateMultipleImages() {
  showLoading('Generando 3 imágenes...');
  const prompt=document.getElementById('storyTitle').value||'magical fairy tale';
  const prompts=[prompt+' inicio',prompt+' aventura',prompt+' final feliz'];
  const urls=[];
  for(const p of prompts) { urls.push(await generateImageWithFallback(p)); }
  appState.currentStoryImages=urls;
  const wrap=document.getElementById('storyImgWrap');
  wrap.innerHTML=`<div class="images-grid">${urls.map((u,i)=>`<div class="grid-img-wrap" onclick="selectStoryImg(${i})"><img src="${u}"></div>`).join('')}</div>`;
  if(!isPremium()) useToken(5);
  hideLoading();
}

function selectStoryImg(i) { appState._selectedImgIndex=i; showToast('✅ Imagen seleccionada'); }

// ===================== SAVE STORY =====================
async function saveStory() {
  const title=document.getElementById('storyTitle')?.value?.trim();
  if(!title) { showToast('❌ Poné un título al cuento'); return; }
  if(!appState.recordedBlob&&!appState._editingStoryId) { showToast('❌ Grabá el cuento primero'); return; }

  const id=appState._editingStoryId||Date.now().toString();
  const existingStory = await dbGet('stories', id);
  const story={
    id, title,
    char: appState.selectedChar,
    voice: appState.selectedVoice,
    images: appState.currentStoryImages||[],
    storyText: document.getElementById('storyTextInput')?.value||'',
    portada: appState.portadaUrl||null,
    created: existingStory?.created || new Date().toLocaleDateString('es-AR'),
    type: 'parent',
    hasAudio: !!(appState.recordedBlob || existingStory?.hasAudio),
    audioFile: existingStory?.audioFile || null,
    supaSync: existingStory?.supaSync || false,
  };

  try {
    // 1. Guardar en IndexedDB (local — siempre funciona)
    await dbPut('stories', story);
    if(appState.recordedBlob) {
      await dbPutAudio(id, appState.recordedBlob);
      console.log('✅ Audio guardado local — id:', id, 'tamaño:', appState.recordedBlob.size);
    }

    // 2. Sincronizar con Supabase (en segundo plano — no bloquea)
    const familiaId = getFamiliaId();
    if(supa && familiaId) {
      const supaStory = {
        id, titulo: title,
        familia_id: familiaId,
        personaje: appState.selectedChar,
        voz: appState.selectedVoice,
        imagenes: appState.currentStoryImages||[],
        texto: document.getElementById('storyTextInput')?.value||'',
        portada: appState.portadaUrl||null,
        tiene_audio: !!(appState.recordedBlob || story.hasAudio),
      };
      // Upload audio to Supabase Storage
      if(appState.recordedBlob) {
        const filename = `${familiaId}/${id}.webm`;
        supaUploadAudio(appState.recordedBlob, filename)
          .then(f => { if(f) console.log('✅ Audio en Supabase:', f); })
          .catch(e => console.warn('Audio Supabase (no crítico):', e));
      }
      supaSaveCuento(supaStory)
        .then(() => console.log('✅ Cuento en Supabase'))
        .catch(e => console.warn('Cuento Supabase (no crítico):', e));
    }

    appState._editingStoryId=null;
    appState.recordedBlob=null;
    appState.recAudio=null;
    const eb=document.getElementById('editModeBanner'); if(eb) eb.style.display='none';
    showCelebration('🎉 ¡Cuento enviado a ' + (appState.kidName||'tu hijo') + '!');
    setTimeout(()=>_doSwitchParentTab('library'), 2000);
  } catch(err) {
    const msg = err?.message || err?.name || String(err);
    console.error('saveStory REAL error:', msg, err);
    showToast('❌ ' + msg);
  }
}

function cancelEditStory() {
  appState._editingStoryId=null;
  document.getElementById('editModeBanner').style.display='none';
  document.getElementById('storyTitle').value='';
  deleteRecording();
}

// ===================== LIBRARY =====================
async function loadParentLibrary() {
  const el=document.getElementById('parentLibraryList');
  if(!el) return;
  const stories=await dbGetAll('stories');
  const userStories=stories.filter(s=>s.type==='parent'||!s.type);
  if(!userStories.length) {
    el.innerHTML=`<div class="empty-state"><div class="empty-icon">📚</div><p>Aún no grabaste ningún cuento</p></div>`;
    return;
  }
  const readStories = JSON.parse(localStorage.getItem('ownKidOpenedStories')||'[]');
  el.innerHTML=userStories.sort((a,b)=>b.id-a.id).map(s=>{
    const sprite=CHAR_SPRITES[s.char];
    const thumbContent=sprite
      ? `<div style="width:100%;height:100%;${spriteBg(sprite,60)}border-radius:12px"></div>`
      : `<span style="font-size:28px">${s.char||'📖'}</span>`;
    const isRead = readStories.includes(s.id);
    return `<div class="story-card" onclick="editStory('${s.id}')">
      <div class="story-thumb">${thumbContent}</div>
      <div class="story-info">
        <div class="story-title">${s.title}</div>
        <div class="story-meta">${s.created||''} ${s.hasAudio?'🔊':'📝'} ${isRead?'<span style="color:var(--mint);font-weight:800">✅ Leído</span>':'<span style="color:var(--text3)">⏳ Sin leer</span>'}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px">
        ${s.hasAudio?`<button class="btn btn-accent btn-sm" id="plib-play-${s.id}" onclick="event.stopPropagation();playParentStoryQuick('${s.id}',this)">▶</button>`:''}
        <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();editStory('${s.id}')">✏️</button>
        <button class="btn btn-danger btn-sm" onclick="event.stopPropagation();deleteStory('${s.id}')">🗑</button>
      </div>
    </div>`;
  }).join('');
}

function playStoryFromHome(id) {
  // Va a la biblioteca y abre el cuento
  switchParentTab('library');
  setTimeout(()=>{ const el=document.querySelector(`[data-story-id="${id}"]`); if(el) el.scrollIntoView({behavior:'smooth'}); },300);
}

async function loadParentHomeStories() {
  const el=document.getElementById('parentHomeStories');
  if(!el) return;
  const stories=await dbGetAll('stories');
  const userStories=stories.filter(s=>s.type==='parent'||!s.type).sort((a,b)=>b.id-a.id);
  if(!userStories.length) {
    el.innerHTML=`<div style="color:rgba(255,255,255,0.4);font-size:13px;padding:12px 16px;text-align:center">Aún no hay cuentos. ¡Grabá el primero! 🎙️</div>`;
    return;
  }
  el.innerHTML=userStories.map(s=>{
    const sprite=CHAR_SPRITES[s.char];
    const iconHtml=sprite
      ? `<div style="width:64px;height:64px;border-radius:14px;${spriteBg(sprite,64)}"></div>`
      : `<div style="width:64px;height:64px;border-radius:14px;background:rgba(201,168,76,0.1);display:flex;align-items:center;justify-content:center;font-size:32px">${s.char||'📖'}</div>`;
    const fecha=s.created ? `<span class="own-story-date">${s.created}</span>` : '';
    const unread=s.unread ? `<div class="own-story-unread"></div>` : '';
    return `<div class="own-story-card" onclick="playStoryFromHome(${s.id})">
      ${unread}
      <div class="own-story-icon">${iconHtml}</div>
      <div class="own-story-title">${s.title||'Sin título'}</div>
      ${fecha}
    </div>`;
  }).join('');
}

async function editStory(id) {
  const story=await dbGet('stories',id);
  if(!story){ showToast('❌ No se encontró el cuento'); return; }
  appState._editingStoryId=id;
  appState.recordedBlob=null; // clear so save dialog doesn't trigger
  appState.recAudio=null;
  appState.selectedChar=story.char||'🐉';
  appState.selectedVoice=story.voice||'normal';
  appState.currentStoryImages=story.images||[];
  appState.portadaUrl=story.portada||null;
  document.getElementById('storyTitle').value=story.title||'';
  const eb=document.getElementById('editModeBanner'); if(eb) eb.style.display='flex';
  buildParentVoicePills(); buildParentCharGrid(); updatePortadaChar(); updatePortadaTitleOverlay();
  if(story.portada) {
    const img=document.getElementById('portadaImg'); const ph=document.getElementById('portadaPlaceholder');
    if(img){img.src=story.portada;img.style.display='block';}
    if(ph) ph.style.display='none';
  }
  if(appState.currentStoryImages.length) {
    buildRecSlideshow(appState.currentStoryImages);
  }
  _doSwitchParentTab('record');
  goRecStep(1);
  showToast('✏️ Editando cuento — guardá al terminar');
}


// Reproducir cuento del padre sin entrar a editar
let _parentQuickAudio = null;
let _parentQuickPlayingId = null;

async function playParentStoryQuick(id, btn) {
  // Si ya está reproduciendo este cuento, pausar
  if(_parentQuickPlayingId === id && _parentQuickAudio) {
    if(!_parentQuickAudio.paused) {
      _parentQuickAudio.pause();
      if(btn) btn.textContent='▶';
      return;
    } else {
      _parentQuickAudio.play().then(()=>{ if(btn) btn.textContent='⏸'; });
      return;
    }
  }
  // Parar el anterior si existía
  if(_parentQuickAudio) { _parentQuickAudio.pause(); _parentQuickAudio=null; }
  document.querySelectorAll('[id^="plib-play-"]').forEach(b=>b.textContent='▶');
  if(btn) btn.textContent='⏳';
  _parentQuickPlayingId = id;
  try {
    let audioUrl = null;
    const data = await dbGetAudio(id).catch(()=>null);
    if(data && data.blob && data.blob.size>0) {
      audioUrl = URL.createObjectURL(data.blob);
    } else {
      const story = await dbGet('stories', id);
      if(story && story.audioFile) audioUrl = await supaGetAudioUrl(story.audioFile).catch(()=>null);
    }
    if(!audioUrl) { showToast('❌ Sin audio'); if(btn) btn.textContent='▶'; return; }
    const audio = new Audio(); audio.preload='auto'; audio.src=audioUrl; audio.load();
    audio.onended = () => { if(btn) btn.textContent='▶'; _parentQuickPlayingId=null; };
    audio.onerror = () => { showToast('❌ Error de audio'); if(btn) btn.textContent='▶'; };
    _parentQuickAudio = audio;
    audio.play().then(()=>{ if(btn) btn.textContent='⏸'; }).catch(()=>{ if(btn) btn.textContent='▶'; });
  } catch(e) {
    showToast('❌ Error: '+e.message);
    if(btn) btn.textContent='▶';
  }
}

async function deleteStory(id) {
  if(!confirm('¿Eliminar este cuento? También se borrará para el niño.')) return;
  showLoading('Eliminando cuento...');
  // 1. Borrar local
  await dbDelete('stories', id);
  await dbDelete('audio', id);
  // 2. Borrar en Supabase — el niño ya no lo verá
  await supaDeleteCuento(id);
  hideLoading();
  loadParentLibrary();
  showToast('🗑 Cuento eliminado');
}

async function downloadStoryAudio(id) {
  const audioData=await dbGetAudio(id);
  if(!audioData||!audioData.blob) { showToast('❌ No hay audio para este cuento'); return; }
  const url=URL.createObjectURL(audioData.blob);
  const a=document.createElement('a');
  const story=await dbGet('stories',id);
  a.href=url; a.download=`${(story?.title||'cuento').replace(/[^a-zA-Z0-9]/g,'_')}_OWN.webm`;
  a.click();
  setTimeout(()=>URL.revokeObjectURL(url),3000);
  showToast('📥 Audio descargado');
}

async function exportAudioWithImages() {
  if(!appState.originalBlob) { showToast('❌ Primero grabá un cuento'); return; }
  downloadStoryAudioBlob(appState.originalBlob, document.getElementById('storyTitle').value||'cuento');
}

function downloadStoryAudioBlob(blob, title) {
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url; a.download=`${title.replace(/[^a-zA-Z0-9]/g,'_')}_OWN.webm`;
  a.click();
  setTimeout(()=>URL.revokeObjectURL(url),3000);
  showToast('📥 Audio descargado');
}

// ===================== TOKENS =====================
function buildTokenShop() {
  const items=[
    {emoji:'🦄',name:'Unicornio',price:50},{emoji:'🧙',name:'Mago',price:80},
    {emoji:'🐲',name:'Dragón Dorado',price:100},{emoji:'🌟',name:'Pack Fantasía',price:120},
  ];
  const el=document.getElementById('tokenShop');
  if(!el) return;
  el.innerHTML=items.map(item=>`
    <div class="token-item">
      <div class="token-emoji">${item.emoji}</div>
      <div class="token-name">${item.name}</div>
      <div class="token-price">🪙 ${item.price}</div>
      <button class="btn-buy" onclick="buyItem('${item.name}',${item.price})">Canjear</button>
    </div>`).join('');
  const ks=document.getElementById('kidStarShop');
  if(ks) ks.innerHTML=items.map(item=>`
    <div class="token-item">
      <div class="token-emoji">${item.emoji}</div>
      <div class="token-name">${item.name}</div>
      <div class="token-price">⭐ ${item.price}</div>
      <button class="btn-buy" onclick="buyItemWithStars('${item.name}',${item.price})">Canjear</button>
    </div>`).join('');
}

function buildTokenPurchaseGrid() {
  // Already built inline in HTML
}

function buyItem(name,price) {
  if(appState.tokens<price) { showToast('🪙 No tenés suficientes tokens'); return; }
  appState.tokens-=price;
  localStorage.setItem('ownTokens',appState.tokens);
  updateTokenDisplay();
  showToast(`✅ ¡Canjeaste ${name}!`);
}

function buyItemWithStars(name,price) {
  if(appState.stars<price) { showToast('⭐ No tenés suficientes estrellitas'); return; }
  appState.stars-=price;
  localStorage.setItem('ownStars',appState.stars);
  updateStarDisplay();
  showToast(`✅ ¡Canjeaste ${name} con estrellas!`);
}

function useToken(n) {
  appState.tokens=Math.max(0,appState.tokens-n);
  localStorage.setItem('ownTokens',appState.tokens);
  updateTokenDisplay();
}

function addTokens(n) {
  appState.tokens+=n;
  localStorage.setItem('ownTokens',appState.tokens);
  updateTokenDisplay();
}

function updateTokenDisplay() {
  ['parentTokens','bigTokenCount'].forEach(id=>{
    const el=document.getElementById(id); if(el) el.textContent=appState.tokens;
  });
}

function updateStarDisplay() {
  ['kidStars','bigStarCount'].forEach(id=>{
    const el=document.getElementById(id); if(el) el.textContent=appState.stars;
  });
}

// ===================== STAR GIFT =====================
let giftStarAmount=5;
function adjustGiftStars(delta) {
  giftStarAmount=Math.max(1,Math.min(50,giftStarAmount+delta));
  document.getElementById('giftStarAmount').textContent=giftStarAmount;
}
function giftStarsToKid() {
  const reason=document.getElementById('giftStarReason').value.trim();
  if(!reason) { showToast('❌ Escribí el motivo de la estrella'); return; }
  appState.stars+=giftStarAmount;
  localStorage.setItem('ownStars',appState.stars);
  updateStarDisplay();
  checkAchievements();
  const log=JSON.parse(localStorage.getItem('ownStarLog')||'[]');
  log.unshift({stars:giftStarAmount,reason,date:new Date().toLocaleDateString('es-AR')});
  localStorage.setItem('ownStarLog',JSON.stringify(log.slice(0,20)));
  document.getElementById('giftStarReason').value='';
  showToast(`⭐ ¡${giftStarAmount} estrellitas regaladas a ${appState.kidName}!`);
}

// ===================== PROGRESS =====================
function buildProgressSummary() {
  const el=document.getElementById('parentProgressSummary');
  if(!el) return;
  const p=getKidProgress();
  el.innerHTML=`
    <div class="progress-metric">
      <div class="progress-metric-icon">📖</div>
      <div class="progress-metric-info">
        <div class="progress-metric-label">Cuentos escuchados</div>
        <div class="progress-metric-bar"><div class="progress-metric-fill" style="width:${Math.min(100,p.storiesListened*10)}%;background:linear-gradient(90deg,#a78bfa,#ff6fd8)"></div></div>
        <div class="progress-metric-value">${p.storiesListened} cuentos</div>
      </div>
    </div>
    <div class="progress-metric">
      <div class="progress-metric-icon">🧠</div>
      <div class="progress-metric-info">
        <div class="progress-metric-label">Quiz completados</div>
        <div class="progress-metric-bar"><div class="progress-metric-fill" style="width:${Math.min(100,p.quizDone*25)}%;background:linear-gradient(90deg,#34d399,#059669)"></div></div>
        <div class="progress-metric-value">${p.quizDone} quiz</div>
      </div>
    </div>
    <div class="progress-metric">
      <div class="progress-metric-icon">✍️</div>
      <div class="progress-metric-info">
        <div class="progress-metric-label">Historias escritas</div>
        <div class="progress-metric-bar"><div class="progress-metric-fill" style="width:${Math.min(100,p.writingsSaved*20)}%;background:linear-gradient(90deg,#fbbf24,#f59e0b)"></div></div>
        <div class="progress-metric-value">${p.writingsSaved} historias · ${p.totalWritingChars} caracteres</div>
      </div>
    </div>`;
}

function buildProgressFull() {
  const el=document.getElementById('parentProgressFull');
  if(!el) return;
  const p=getKidProgress();
  const stars=appState.stars;
  const earned=JSON.parse(localStorage.getItem('ownEarnedAchievements')||'[]');
  const starLog=JSON.parse(localStorage.getItem('ownStarLog')||'[]');
  const recTime=Math.round(p.sessionMinutes||0);

  el.innerHTML=`
    <div class="report-section">
      <div class="report-header">📊 Resumen de actividad</div>
      <div class="report-insight"><strong>Cuentos escuchados:</strong> ${p.storiesListened}</div>
      <div class="report-insight"><strong>Quiz completados:</strong> ${p.quizDone} (${p.perfectQuiz} perfectos)</div>
      <div class="report-insight"><strong>Historias escritas:</strong> ${p.writingsSaved} (${p.totalWritingChars} caracteres en total)</div>
      <div class="report-insight"><strong>Juegos jugados:</strong> ${p.gamesPlayed}</div>
      <div class="report-insight"><strong>Cuentos clásicos:</strong> ${p.classicsListened} de 3</div>
      <div class="report-insight"><strong>Estrellitas acumuladas:</strong> ⭐ ${stars}</div>
    </div>
    <div class="report-section">
      <div class="report-header">💡 Observaciones de desarrollo</div>
      <div class="report-insight">📖 <strong>Comprensión lectora:</strong> ${p.quizDone>0?`Respondió ${p.quizDone} quiz. ${p.perfectQuiz>0?'¡Tuvo respuestas perfectas! Excelente atención.':'Continúa mejorando la comprensión.'}`:'Aún no realizó quiz. ¡Animalo a probar!'}</div>
      <div class="report-insight">✍️ <strong>Redacción y creatividad:</strong> ${p.writingsSaved>0?`Escribió ${p.writingsSaved} historia${p.writingsSaved>1?'s':''} con ${p.totalWritingChars} caracteres en total. ${p.totalWritingChars>200?'¡Excelente producción escrita!':'Va construyendo su vocabulario.'}`:'Aún no escribió historias. El área de escritura está disponible en el app del niño.'}</div>
      <div class="report-insight">🎮 <strong>Exploración y juego:</strong> ${p.gamesPlayed>0?`Jugó ${p.gamesPlayed} veces en el patio de juegos. El juego estimula atención y creatividad.`:'Aún no exploró los juegos.'}</div>
    </div>
    <div class="report-section">
      <div class="report-header">⭐ Logros desbloqueados</div>
      ${ACHIEVEMENTS.map(a=>`
        <div class="achievement-card ${earned.includes(a.id)?'':'locked'}">
          <div class="achievement-icon">${a.icon}</div>
          <div class="achievement-info">
            <div class="achievement-name">${a.name}</div>
            <div class="achievement-desc">${a.desc}</div>
            ${earned.includes(a.id)?'<div class="achievement-earned">✅ Desbloqueado</div>':''}
          </div>
        </div>`).join('')}
    </div>
    <div class="report-section">
      <div class="report-header">🎁 Historial de estrellas regaladas</div>
      ${starLog.length?starLog.map(l=>`<div class="report-insight">⭐ <strong>+${l.stars}</strong> el ${l.date} — "${l.reason}"</div>`).join(''):'<div class="report-insight">No regalaste estrellitas aún.</div>'}
    </div>`;
}

// ===================== TEXT GENERATION HELPER =====================
async function fetchPollinationsText(prompt) {
  const tema = document.getElementById('aiStoryPrompt')?.value?.trim() || prompt.substring(0,80);
  const charEl = document.getElementById('aiStoryChar');
  const charNames = {dragon:'Dragón',hada:'Hada',leon:'León',delfin:'Delfín',zorro:'Zorro',robot:'Robot',unicornio:'Unicornio',mago:'Mago'};
  const personaje = charNames[charEl?.value] || 'Dragón';
  const kidName = appState.kidName || 'el niño';
  try {
    const response = await fetch('/api/generar-cuento', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ tema, personaje, kidName, edad:'5', prompt: prompt.substring(0,200) })
    });
    if(response.ok) {
      const data = await response.json();
      const text = data.cuento || data.texto || '';
      if(text && text.length > 80) return text;
    }
  } catch(e) {
    console.warn('Edge Function no disponible, usando generador local');
  }
  return getCuentoFallback(personaje, tema, kidName);
}

function getCuentoFallback(charName, tema, kidName) {
  charName = charName || 'Dragón';
  tema = (tema || 'aventuras').toLowerCase().trim();
  kidName = kidName || 'el niño';

  const words = tema.split(/[\s,]+/).filter(w=>w.length>2);
  const mainWord = words[0] || 'aventura';
  const extraWord = words[1] || words[0] || 'magia';

  // Detectar contexto del tema
  const esMar = /mar|ocean|pez|peces|delfin|tiburon|ballena|sirena/.test(tema);
  const esEspacio = /espaci|planet|estrell|cohete|astronaut|luna|galaxia/.test(tema);
  const esBosque = /bosque|selva|arbol|flor|mariposa|insecto|hongo/.test(tema);
  const esCielo = /vuela|vuelo|nube|cielo|pajaro|alas|viento/.test(tema);
  const esCiudad = /ciudad|calle|casa|edificio|auto|moto|tienda/.test(tema);
  const esDino = /dinosaurio|dino|rex|tiranosaurio|velociraptor/.test(tema);
  const esAnimal = /animal|vaca|perro|gato|caballo|conejo|oso|lobo|zorro|elefante/.test(tema);

  const lugar = esMar ? ['el fondo del mar más colorido','las olas gigantes del océano','un arrecife lleno de peces brillantes'] :
    esEspacio ? ['una galaxia muy lejana','un planeta de colores imposibles','entre las estrellas más brillantes'] :
    esBosque ? ['un bosque encantado','la selva de los secretos','entre los árboles más altos del mundo'] :
    esCielo ? ['el cielo entre las nubes','un castillo entre las nubes rosadas','sobre los arcoíris'] :
    esCiudad ? ['una ciudad llena de colores','el barrio más mágico del mundo','las calles llenas de sorpresas'] :
    esDino ? ['el tiempo de los dinosaurios','un valle prehistórico lleno de plantas gigantes','la era más antigua del mundo'] :
    ['un reino mágico y colorido','el mundo de las aventuras','un lugar donde todo es posible'];

  const r = (arr) => arr[Math.floor(Math.random()*arr.length)];
  const lugarElegido = r(lugar);

  // Rasgos especiales del personaje según el tema
  const rasgos = tema.includes('sin dientes') ? `no tenía dientes pero tenía una sonrisa enorme` :
    tema.includes('tres patas') || tema.includes('3 patas') ? `tenía tres patas y saltaba de una manera muy especial` :
    tema.includes('violeta') || tema.includes('morad') ? `era de color violeta brillante, diferente a todos los demás` :
    tema.includes('pequeñ') || tema.includes('chiquit') ? `era el más pequeño de todos pero el más valiente` :
    tema.includes('gigante') || tema.includes('grand') ? `era enorme pero tenía un corazón muy tierno` :
    tema.includes('vuela') || tema.includes('vuelo') ? `podía volar pero nunca había llegado muy alto` :
    tema.includes('corre') ? `corría tan rápido que dejaba un rastro de chispas` :
    tema.includes('cant') ? `tenía una voz tan hermosa que hacía bailar a los árboles` :
    `tenía algo muy especial que lo hacía diferente a todos`;

  const inicios = [
    `Érase una vez, en ${lugarElegido}, vivía un ${charName} que ${rasgos}. Nadie entendía su secreto... hasta que llegó ${kidName}.`,
    `En ${lugarElegido} había un ${charName} muy especial que ${rasgos}. Un día, ${kidName} apareció y cambió todo para siempre.`,
    `${kidName} nunca había visto nada igual. En ${lugarElegido} encontró a un ${charName} que ${rasgos}. Desde el primer momento se hicieron amigos.`,
    `Todo comenzó en ${lugarElegido}, donde un ${charName} ${rasgos}. Nadie lo comprendía, hasta que ${kidName} llegó con una sonrisa enorme.`,
  ];

  const medios = [
    `${kidName} y el ${charName} formaron el equipo más increíble que el mundo había visto. Juntos exploraron ${lugarElegido} de punta a punta. Cuando uno se cansaba, el otro le daba fuerzas. Descubrieron lugares secretos, resolvieron acertijos mágicos y ayudaron a todos los que encontraban en el camino.`,
    `La aventura fue emocionante desde el primer momento. ${kidName} tenía ideas brillantes y el ${charName} tenía la fuerza y la valentía necesarias. Juntos cruzaron ${lugarElegido} enfrentando todo tipo de desafíos, siempre riendo y apoyándose mutuamente.`,
    `Nadie los podía detener. ${kidName} y el ${charName} descubrieron que ${lugarElegido} guardaba secretos increíbles. En cada rincón había una sorpresa nueva, y los dos amigos la vivían con alegría y asombro.`,
    `El viaje estuvo lleno de momentos mágicos. ${kidName} y el ${charName} se convirtieron en inseparables. Cada obstáculo que encontraban en ${lugarElegido} se convertía en una oportunidad para aprender algo nuevo y crecer juntos.`,
  ];

  const finales = [
    `Al final del día, ${kidName} y el ${charName} se abrazaron con fuerza. Habían aprendido que ser diferente es el regalo más especial del mundo, y que la verdadera amistad no tiene límites. Esa noche, ${kidName} se durmió sonriendo, soñando con la próxima aventura.`,
    `Y así fue como todo cambió. El ${charName} encontró en ${kidName} al mejor amigo que jamás hubiera imaginado. Los dos supieron que juntos podían con todo. ${kidName} llegó a casa con el corazón lleno de alegría y la cabeza llena de recuerdos mágicos.`,
    `Cuando el sol se puso, los dos amigos prometieron volver a ${lugarElegido} algún día. Aprendieron que el amor y la amistad son la magia más poderosa del universo. Esa noche, ${kidName} se durmió feliz, sabiendo que tenía el mejor amigo del mundo.`,
    `El ${charName} nunca olvidó ese día. Aprendió que lo que lo hacía diferente era exactamente lo que lo hacía especial. Y ${kidName}, cada vez que miraba las estrellas, recordaba esa aventura y sonreía con el corazón lleno de amor.`,
  ];

  return `${r(inicios)}\n\n${r(medios)}\n\n${r(finales)}`;
}

// ===================== RUTINA AUTOMÁTICA =====================
function activarRutina() {
  const dias = document.getElementById('rutinaDias').value;
  const hora = document.getElementById('rutinaHora').value;
  const personaje = document.getElementById('aiStoryChar').value;
  const temas = document.getElementById('aiStoryPrompt').value.trim() || 'aventuras y magia';

  const rutina = { activa:true, dias:parseInt(dias), hora:parseInt(hora), temas, personaje,
    ultimoEnvio: null, proxEnvio: calcProxEnvio(parseInt(dias), parseInt(hora)) };
  localStorage.setItem('ownRutina', JSON.stringify(rutina));

  const descripciones = {1:'Todos los días',3:'Cada 3 días',7:'Cada semana',14:'Cada 2 semanas'};
  const horas = {8:'8:00 AM',12:'12:00 PM',18:'6:00 PM',20:'8:00 PM',21:'9:00 PM'};
  const desc = document.getElementById('rutinaDescripcion');
  if(desc) desc.textContent = `${descripciones[dias]} a las ${horas[hora]} — ${temas.substring(0,30)}`;
  const estado = document.getElementById('rutinaEstado');
  if(estado) estado.style.display = 'block';
  showToast(`✅ Rutina activada — próximo cuento el ${new Date(rutina.proxEnvio).toLocaleDateString('es-AR')} a las ${horas[hora]}`);
}

function cancelarRutina() {
  localStorage.removeItem('ownRutina');
  document.getElementById('rutinaEstado').style.display = 'none';
  showToast('🔕 Rutina cancelada');
}

function calcProxEnvio(dias, hora) {
  const now = new Date();
  const proxima = new Date();
  proxima.setHours(hora, 0, 0, 0);
  if(proxima <= now) proxima.setDate(proxima.getDate() + dias);
  return proxima.getTime();
}

async function generarCuentoAhoraManual() {
  const rutina = JSON.parse(localStorage.getItem('ownRutina')||'{}');
  const temas = rutina.temas || document.getElementById('rutinaTemasInput')?.value || 'aventuras y magia';
  const personaje = rutina.personaje || document.getElementById('rutinaPersonaje')?.value || 'dragon';
  const kidName = appState.kidName || 'el niño';
  await generarYEnviarCuentoAuto(temas, personaje, kidName);
}

async function generarYEnviarCuentoAuto(temas, personaje, kidName) {
  showLoading('Preparando cuento...');
  const charNames = {dragon:'Dragón',hada:'Hada',leon:'León',delfin:'Delfín',zorro:'Zorro',robot:'Robot',unicornio:'Unicornio',mago:'Mago'};
  const charName = charNames[personaje] || 'personaje mágico';
  // Fallback inmediato
  let text = getCuentoFallback(null, null, appState.kidName);
  hideLoading();
  // Intentar mejorar via Edge Function
  try {
    const age = appState.kidAge || 7;
    const longitud = age <= 5 ? '4 párrafos medianos' : age <= 8 ? '5 párrafos desarrollados' : '6 párrafos largos';
    const aiPrompt = `Escribí un cuento infantil en español para ${kidName}, que tiene ${age} años. El cuento debe tener ${longitud}. El personaje principal es ${charName}. El tema central (MUY IMPORTANTE, el cuento debe girar completamente alrededor de esto): "${temas}". Final feliz y emotivo. Solo el texto del cuento, sin título ni explicaciones.`;
    const response = await fetch('/api/generar-cuento', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: aiPrompt }),
    });
    if(response.ok) {
      const data = await response.json();
      if(data.ok && data.texto && data.texto.length > 80) text = data.texto;
    }
  } catch(e) { /* usar fallback */ }
  showAutoStoryPreview(text, charName, personaje, kidName);
}

// Check rutina on app load
function checkRutinaAutomatica() {
  const rutina = JSON.parse(localStorage.getItem('ownRutina')||'{}');
  if(!rutina.activa || !rutina.proxEnvio) return;
  const now = Date.now();
  if(now >= rutina.proxEnvio) {
    const kidName = appState.kidName || 'el niño';
    console.log('🤖 Ejecutando rutina automática...');
    generarYEnviarCuentoAuto(rutina.temas, rutina.personaje, kidName);
  }
}

// Load rutina state in premium screen
function loadRutinaState() {
  const rutina = JSON.parse(localStorage.getItem('ownRutina')||'{}');
  if(rutina.activa) {
    const descripciones = {1:'Todos los días',3:'Cada 3 días',7:'Cada semana',14:'Cada 2 semanas'};
    const horas = {8:'8:00 AM',12:'12:00 PM',18:'6:00 PM',20:'8:00 PM',21:'9:00 PM'};
    const desc = document.getElementById('rutinaDescripcion');
    if(desc) desc.textContent = `${descripciones[rutina.dias]||''} a las ${horas[rutina.hora]||''}`;
    const estado = document.getElementById('rutinaEstado');
    if(estado) estado.style.display = 'block';
  }
}
let _selectedPlan=null;
function hidePremiumScreen() {
  showScreen('parentApp');
}

function showCoinAnimation(amount) {
  // Floating coins
  for(let i=0;i<12;i++){
    const coin=document.createElement('div');
    coin.textContent='🪙';
    coin.style.cssText=`position:fixed;font-size:${24+Math.random()*16}px;left:${20+Math.random()*60}vw;top:${10+Math.random()*30}vh;z-index:10001;animation:coinFall ${1.5+Math.random()*1.5}s ease forwards ${Math.random()*0.5}s;pointer-events:none`;
    document.body.appendChild(coin);
    setTimeout(()=>coin.remove(), 3000);
  }
  // Big popup
  const div=document.createElement('div');
  div.style.cssText='position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:10002;text-align:center;animation:coinPop .4s ease;pointer-events:none';
  div.innerHTML=`<div style="font-size:64px;margin-bottom:8px">🪙</div><div style="font-family:Fredoka One,cursive;font-size:32px;color:#ffd166;text-shadow:0 2px 12px rgba(255,209,102,.8)">+${amount}</div><div style="font-size:14px;color:white;font-weight:800">monedas!</div>`;
  document.body.appendChild(div);
  setTimeout(()=>div.remove(), 2000);
}

function rewardKidCoins(amount, reason) {
  const current = parseInt(localStorage.getItem('ownCoins')||'0');
  localStorage.setItem('ownCoins', current + amount);
  showCoinAnimation(amount);
  setTimeout(()=>showToast(`🪙 +${amount} monedas — ${reason}`), 500);
}

function showKidReceiveCelebration(storyTitle) {
  const div=document.createElement('div');
  div.style.cssText='position:fixed;inset:0;z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(0,0,0,.8);backdrop-filter:blur(8px)';
  div.innerHTML=`
    <div style="font-size:72px;margin-bottom:12px;animation:bounceIn .5s ease">🎁</div>
    <div style="font-family:'Fredoka One',cursive;font-size:24px;color:white;text-align:center;margin-bottom:8px;padding:0 24px">¡Papá/Mamá te mandó un cuento!</div>
    <div style="font-size:15px;color:rgba(255,255,255,.8);margin-bottom:20px">"${storyTitle}"</div>
    <div style="font-family:'Fredoka One',cursive;font-size:20px;color:#ffd166">🪙 +3 monedas</div>
  `;
  div.addEventListener('click',()=>div.remove());
  document.body.appendChild(div);
  rewardKidCoins(3, '¡Nuevo cuento!');
  setTimeout(()=>{ div.style.opacity='0'; div.style.transition='opacity .4s'; setTimeout(()=>div.remove(),400); }, 3000);
}

function showCelebration(msg) {
  const div=document.createElement('div');
  div.innerHTML=`
    <div style="font-size:80px;margin-bottom:16px;animation:bounceIn .5s ease">🎉</div>
    <div style="font-family:'Fredoka One',cursive;font-size:26px;color:white;text-align:center;margin-bottom:8px;padding:0 24px">${msg}</div>
    <div style="font-size:14px;color:rgba(255,255,255,.7)">El cuento ya está disponible para ${appState.kidName||'tu hijo'} 🎙️</div>
  `;
  document.body.appendChild(div);
  // Confetti effect
  for(let i=0;i<20;i++){
    const c=document.createElement('div');
    const colors=['#ff6b6b','#ffd166','#06d6a0','#a78bfa','#38bdf8'];
    c.style.cssText=`position:fixed;width:10px;height:10px;border-radius:50%;background:${colors[i%5]};left:${Math.random()*100}vw;top:-10px;z-index:10000;animation:confettiFall ${1+Math.random()*2}s ease forwards ${Math.random()}s`;
    document.body.appendChild(c);
    setTimeout(()=>c.remove(), 3000);
  }
  setTimeout(()=>{ div.style.opacity='0'; div.style.transition='opacity .4s'; setTimeout(()=>div.remove(),400); }, 2200);
}

function showPremiumScreen() {
  const plan=getUserPlan();
  const prem=isPremium();
  const planLabel=document.getElementById('premPlanLabel');
  if(planLabel) planLabel.textContent=PLANS[plan]?.label||'Gratis';

  // Show/lock AI sections based on plan
  const aiContent=document.getElementById('aiGenContent');
  const aiLocked=document.getElementById('aiGenLocked');
  if(aiContent) aiContent.style.display=prem?'block':'none';
  if(aiLocked) aiLocked.style.display=prem?'none':'block';

  const activateBtn=document.getElementById('activatePlanBtn');
  if(activateBtn) activateBtn.style.display='none';

  updateCurrencyDisplay();

  // Daily claim state
  const today=new Date().toDateString();
  const coinClaimed=localStorage.getItem('ownLastCoinClaim')===today;
  const coinBtn=document.getElementById('dailyCoinBtn');
  if(coinBtn){ coinBtn.textContent=coinClaimed?'✅ Reclamado hoy':'🎁 Reclamar monedas del día'; coinBtn.disabled=coinClaimed; }

  // Init voice pills for premium recording
  buildPremVoicePills();
  loadRutinaState();
  showScreen('premiumScreen');
}

function buildPremVoicePills() {
  const el=document.getElementById('premVoicePills'); if(!el) return;
  el.innerHTML=VOICES.map(v=>{
    const isActive=v.id===appState.selectedVoice;
    return '<button class="voice-pill '+(isActive?'active':'')+'" onclick="selectParentVoice(\''+v.id+'\')">'
      +v.label+'</button>';
  }).join('');
}

// ── AI Story Generation ──
async function generateStoryTextAI() {
  const prompt = document.getElementById('aiStoryPrompt').value.trim();
  const char = document.getElementById('aiStoryChar').value;
  const age = document.getElementById('aiStoryAge').value;
  if(!prompt){ showToast('❌ Escribí de qué trata el cuento'); return; }

  // Detener TTS si está corriendo
  if('speechSynthesis' in window) window.speechSynthesis.cancel();

  const charNames = {dragon:'Dragón',hada:'Hada',leon:'León',delfin:'Delfín',zorro:'Zorro',robot:'Robot',unicornio:'Unicornio',mago:'Mago'};
  const charName = charNames[char] || char;
  const kidName = appState.kidName || 'el niño';

  // Limpiar y mostrar fallback inmediato con tema del padre
  const ta = document.getElementById('aiGeneratedText');
  if(ta) ta.value = '';
  document.getElementById('aiGeneratedTextWrap').style.display = 'block';
  const fallback = getCuentoFallback(charName, prompt, kidName);
  if(ta) ta.value = fallback;
  appState.aiGeneratedText = fallback;
  showToast('✅ Cuento listo');

  // Intentar mejorar via Edge Function en segundo plano
  try {
    const ageDesc = age <= 4 ? 'muy simple, frases cortas, vocabulario de bebé' :
                    age <= 6 ? 'simple y emotivo, frases claras, vocabulario de jardín' :
                    age <= 8 ? 'con aventura y detalle, vocabulario escolar' :
                    age <= 10 ? 'con suspenso, descripción rica, vocabulario de primaria' :
                    'elaborado, con giros narrativos, vocabulario amplio';
    const longitud = age <= 5 ? '4 párrafos medianos' :
                     age <= 8 ? '5 párrafos desarrollados' :
                     '6 párrafos largos y detallados';
    const aiPrompt = `Escribí un cuento infantil en español para ${kidName}, que tiene ${age} años. El cuento debe tener exactamente ${longitud}. El personaje principal es ${charName}. El tema central del cuento (MUY IMPORTANTE, el cuento debe girar completamente alrededor de esto): "${prompt}". Nivel de lenguaje: ${ageDesc}. El cuento debe comenzar presentando el tema "${prompt}" desde la primera oración. Final feliz y emotivo. Solo el texto del cuento, sin título ni explicaciones.`;
    const response = await fetch('/api/generar-cuento', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: aiPrompt }),
    });
    if(response.ok) {
      const data = await response.json();
      if(data.ok && data.texto && data.texto.length > 80) {
        if(ta) ta.value = data.texto;
        appState.aiGeneratedText = data.texto;
        showToast('✨ Cuento mejorado con IA');
      }
    }
  } catch(e) { /* fallback ya mostrado */ }
}

async function playAiGeneratedStory() {
  const text = document.getElementById('aiGeneratedText').value.trim();
  if(!text){ showToast('❌ No hay texto para escuchar'); return; }
  if('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'es-AR'; utt.rate = 0.9;
    const playBtn = document.getElementById('aiPlayBtn2');
    const stopBtn = document.getElementById('aiStopBtn2');
    if(playBtn) playBtn.style.display='none';
    if(stopBtn) stopBtn.style.display='inline-flex';
    utt.onend = utt.onerror = () => {
      if(playBtn) playBtn.style.display='inline-flex';
      if(stopBtn) stopBtn.style.display='none';
    };
    window.speechSynthesis.speak(utt);
  } else {
    showToast('❌ Tu navegador no soporta texto a voz');
  }
}

function stopAiStory() {
  if('speechSynthesis' in window) window.speechSynthesis.cancel();
  const playBtn = document.getElementById('aiPlayBtn2');
  const stopBtn = document.getElementById('aiStopBtn2');
  if(playBtn) playBtn.style.display='inline-flex';
  if(stopBtn) stopBtn.style.display='none';
}

async function sendAiStoryToKid() {
  const text = document.getElementById('aiGeneratedText').value.trim();
  if(!text){ showToast('❌ Generá el cuento primero'); return; }
  const title = 'Cuento IA — ' + new Date().toLocaleDateString('es-AR');
  const id = Date.now().toString();
  const familiaId = getFamiliaId();
  const msg = {
    id, title, text,
    images: [], date: new Date().toLocaleDateString('es-AR'),
    type: 'ai_story', isAI: true
  };
  // Save locally
  const msgs = JSON.parse(localStorage.getItem('ownKidMessages')||'[]');
  msgs.unshift(msg);
  localStorage.setItem('ownKidMessages', JSON.stringify(msgs.slice(0,20)));
  // Save to Supabase
  if(supa && familiaId) {
    supa.from('mensajes_nino').insert({
      id, familia_id: familiaId,
      titulo: title, texto: text,
      tipo: 'ai_story', imagenes: [],
      tiene_audio: false
    }).then(({error})=>{ if(error) console.warn('Supabase msg:', error.message); });
  }
  showToast('✅ Cuento enviado al niño');
  document.getElementById('aiGeneratedTextWrap').style.display='none';
  document.getElementById('aiStoryPrompt').value='';
}

// ── Photo to Drawing ──
function handlePhotoUpload(e) {
  const file = e.target.files[0]; if(!file) return;
  if(file.size>5*1024*1024) { showToast('❌ Imagen demasiado grande (máx 5MB)'); return; }
  const reader = new FileReader();
  reader.onload = (ev) => {
    const img = document.getElementById('photoPreviewImg');
    img.src = ev.target.result;
    appState.uploadedPhotoData = ev.target.result;
    document.getElementById('photoPreviewZone').style.display = 'block';
    document.getElementById('drawingResult').style.display = 'none';
  };
  reader.readAsDataURL(file);
}

async function convertPhotoToDrawing() {
  if(!appState.uploadedPhotoData){ showToast('❌ Subí una foto primero'); return; }
  showLoading('Convirtiendo a dibujo cartoon...');
  try {
    const prompt = 'cartoon illustration, disney pixar style, children book art, colorful, cute, friendly, soft lighting, hand drawn look, vibrant colors, no text, no watermark';
    const seed = Date.now();
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&nologo=true&seed=${seed}&enhance=true`;
    const resultImg = document.getElementById('drawingResultImg');
    resultImg.onload = () => {
      hideLoading();
      appState.cartoonPhotoData = url;
      document.getElementById('drawingResult').style.display = 'block';
      showToast('✅ ¡Foto convertida a cartoon!');
    };
    resultImg.onerror = () => {
      hideLoading();
      // Fallback: CSS cartoon filter
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width; canvas.height = img.height;
        ctx.filter = 'saturate(300%) contrast(200%) brightness(120%)';
        ctx.drawImage(img, 0, 0);
        const cartoonUrl = canvas.toDataURL('image/jpeg', 0.9);
        resultImg.src = cartoonUrl;
        appState.cartoonPhotoData = cartoonUrl;
        document.getElementById('drawingResult').style.display = 'block';
        showToast('✅ ¡Foto con efecto cartoon!');
      };
      img.src = appState.uploadedPhotoData;
    };
    resultImg.src = url;
  } catch(e) {
    hideLoading();
    showToast('❌ Error al convertir. Intentá de nuevo.');
  }
}

async function sendDrawingToKid() {
  if(!appState.cartoonPhotoData){ showToast('❌ Convertí la foto primero'); return; }
  const message = document.getElementById('photoDrawMessage').value.trim() || '¡Mirá lo que hice para vos! 🎨';
  const id = Date.now().toString();
  const familiaId = getFamiliaId();
  const msg = {
    id, title: '🎨 Dibujo especial de Papá/Mamá',
    text: message,
    images: [appState.cartoonPhotoData],
    date: new Date().toLocaleDateString('es-AR'),
    type: 'drawing', isDrawing: true
  };
  const msgs = JSON.parse(localStorage.getItem('ownKidMessages')||'[]');
  msgs.unshift(msg);
  localStorage.setItem('ownKidMessages', JSON.stringify(msgs.slice(0,20)));
  showToast('✅ Dibujo enviado al niño');
  document.getElementById('photoPreviewZone').style.display = 'none';
  document.getElementById('photoDrawMessage').value = '';
  appState.cartoonPhotoData = null;
  appState.uploadedPhotoData = null;
}

// ── Free Image Generation ──
async function generateFreeImage() {
  const prompt = document.getElementById('freeImgPrompt').value.trim();
  if(!prompt){ showToast('❌ Describí la imagen primero'); return; }
  showLoading('Generando imagen...');
  try {
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt+', children book illustration, cartoon, colorful, cute')}?width=512&height=512&nologo=true&seed=${Date.now()}`;
    const img = document.getElementById('freeImgResultImg');
    img.src = url;
    img.onload = () => { hideLoading(); document.getElementById('freeImgResult').style.display='block'; appState.freeGeneratedImg=url; };
    img.onerror = () => { hideLoading(); showToast('❌ Error generando imagen'); };
  } catch(e) { hideLoading(); showToast('❌ Error'); }
}

function addFreeImageToStory() {
  if(!appState.freeGeneratedImg){ showToast('❌ Generá una imagen primero'); return; }
  appState.currentStoryImages = appState.currentStoryImages || [];
  appState.currentStoryImages.push(appState.freeGeneratedImg);
  showToast('✅ Imagen agregada al cuento');
  hidePremiumScreen();
  switchParentTab('record');
}

function selectPlan(plan) {
  _selectedPlan=plan;
  document.getElementById('planCardFree').style.borderColor=plan==='free'?'var(--accent2)':'rgba(167,139,250,0.2)';
  document.getElementById('planCardPremium').style.borderColor=plan==='premium'?'var(--gold)':'rgba(251,191,36,0.5)';
  document.getElementById('activatePlanBtn').style.display=plan!==getUserPlan()?'block':'none';
}

function activateSelectedPlan() {
  if(!_selectedPlan) return;
  localStorage.setItem('ownPlan',_selectedPlan);
  document.getElementById('premPlanLabel').textContent=PLANS[_selectedPlan]?.label||'Gratis';
  const prem=isPremium();
  document.getElementById('premAiContent').style.display=prem?'block':'none';
  document.getElementById('premAiLocked').style.display=prem?'none':'block';
  document.getElementById('photoToDrawContent').style.display=prem?'block':'none';
  document.getElementById('photoToDrawLocked').style.display=prem?'none':'block';
  document.getElementById('cuentoOroContent').style.display=prem?'block':'none';
  document.getElementById('cuentoOroLocked').style.display=prem?'none':'block';
  document.getElementById('activatePlanBtn').style.display='none';
  showToast(`✅ Plan ${PLANS[_selectedPlan].label} activado!`);
  buildParentVoicePills();
  if(prem) initOroSection();
}

// Token purchase simulation
function simulatePurchase(tokens, price) {
  _purchaseTokens=tokens; _purchasePrice=price;
  document.getElementById('purchaseTokens').textContent=tokens;
  document.getElementById('purchasePrice').textContent='$'+price;
  document.getElementById('purchaseModal').classList.add('open');
}

function confirmPurchase() {
  addTokens(_purchaseTokens);
  document.getElementById('purchaseModal').classList.remove('open');
  showToast(`✅ +${_purchaseTokens} tokens agregados (simulación)`);
}

// Prem state
let premState={images:[],prompts:[]};
function renderPremImgGrid() {
  const el=document.getElementById('premImgGrid');
  if(!el) return;
  if(!premState.images.length) { el.innerHTML='<div style="color:var(--text2);font-size:13px;padding:10px 0">Sin imágenes aún. Agregá con IA.</div>'; return; }
  el.innerHTML=premState.images.map((u,i)=>`
    <div class="prem-grid-img-wrap">
      <img src="${u==='loading'?'data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\'><rect fill=\'%231e1a4a\' width=\'100\' height=\'100\'/><text x=\'50\' y=\'55\' text-anchor=\'middle\' font-size=\'30\'>⏳</text></svg>':u}">
      <button class="prem-grid-del" onclick="removePremImg(${i})">✕</button>
    </div>`).join('');
}

async function premAddAiImage() {
  if(!isPremium()) { showToast('🔒 Función exclusiva Premium'); return; }
  const p=window.prompt('Describí la escena:','Un dragón mágico volando');
  if(!p) return;
  premState.images.push('loading'); premState.prompts.push(p);
  renderPremImgGrid();
  const idx=premState.images.length-1;
  showLoading('Generando imagen con IA...');
  const url=await generateImageAI(p);
  premState.images[idx]=url;
  renderPremImgGrid();
  hideLoading();
  useToken(5);
}

function removePremImg(i) { premState.images.splice(i,1); premState.prompts.splice(i,1); renderPremImgGrid(); }

// Photo to drawing
function addDrawingToStory() {
  const url=document.getElementById('drawingResultImg').src;
  if(!appState.currentStoryImages) appState.currentStoryImages=[];
  appState.currentStoryImages.push(url);
  showToast('✅ Dibujo agregado al cuento');
}

let _ttsUtterance=null;
function speakStoryText() {
  if(!('speechSynthesis' in window)) { showToast('❌ Tu navegador no soporta TTS'); return; }
  const text=document.getElementById('storyTextInput').value.trim();
  if(!text) { showToast('❌ Escribí el texto primero'); return; }
  stopSpeakStory();
  const voice=VOICES.find(v=>v.id===appState.selectedVoice)||VOICES[0];
  const utter=new SpeechSynthesisUtterance(text);
  utter.lang='es-ES'; utter.pitch=voice.pitch; utter.rate=voice.rate;
  utter.onstart=()=>{
    document.getElementById('btnSpeakStory').style.display='none';
    document.getElementById('btnStopSpeak').style.display='inline-flex';
    document.getElementById('ttsStatus').style.display='block';
    document.getElementById('ttsStatus').textContent=`🎙️ Leyendo con ${voice.label}...`;
  };
  utter.onend=utter.onerror=()=>{
    document.getElementById('btnSpeakStory').style.display='inline-flex';
    document.getElementById('btnStopSpeak').style.display='none';
    document.getElementById('ttsStatus').style.display='none';
  };
  _ttsUtterance=utter;
  speechSynthesis.speak(utter);
}
function stopSpeakStory() {
  if('speechSynthesis' in window) speechSynthesis.cancel();
  document.getElementById('btnSpeakStory').style.display='inline-flex';
  const btn=document.getElementById('btnStopSpeak'); if(btn) btn.style.display='none';
  const st=document.getElementById('ttsStatus'); if(st) st.style.display='none';
}

// ===================== PORTADA =====================
let portadaLocked = false; // portada is permanent once set
function updatePortadaChar() {
  const el = document.getElementById('portadaChar');
  if(!el) return;
  const sprite = CHAR_SPRITES[appState.selectedChar];
  if(sprite) {
    el.style.cssText = `width:120px;height:120px;${spriteBg(sprite,120)}margin:0 auto;display:block;border-radius:12px`;
    el.textContent = '';
  } else {
    el.style.cssText = 'font-size:80px';
    el.textContent = appState.selectedChar || '🐉';
  }
}
function updatePortadaTitleOverlay() {
  const title = document.getElementById('storyTitle')?.value?.trim();
  const overlay = document.getElementById('portadaTitleOverlay');
  if(!overlay) return;
  if(title) { overlay.textContent = title; overlay.style.display='block'; }
  else { overlay.style.display='none'; }
}
function generatePortadaImage() {
  const char = appState.selectedChar;
  const title = document.getElementById('storyTitle')?.value || 'cuento';
  const prompt = `${char} ${title} children book cover colorful magical`;
  showLoading('Generando portada...');
  generateImageWithFallback(prompt).then(url=>{
    hideLoading();
    const img = document.getElementById('portadaImg');
    const ph = document.getElementById('portadaPlaceholder');
    if(img) { img.src=url; img.style.display='block'; }
    if(ph) ph.style.display='none';
    updatePortadaTitleOverlay();
    // Save portada separately so it doesn't get overwritten
    appState.portadaUrl = url;
    showToast('✅ Portada generada');
  });
}
function handlePortadaUpload(e) {
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    const img = document.getElementById('portadaImg');
    const ph = document.getElementById('portadaPlaceholder');
    if(img) { img.src=ev.target.result; img.style.display='block'; }
    if(ph) ph.style.display='none';
    appState.portadaUrl = ev.target.result;
    updatePortadaTitleOverlay();
    showToast('✅ Portada cargada');
  };
  reader.readAsDataURL(file);
}

// ===================== SLIDESHOW WHILE RECORDING =====================
let recSlideIdx=0, recSlideImgs=[];
function buildRecSlideshow(imgs) {
  recSlideImgs = imgs || appState.currentStoryImages || [];
  recSlideIdx = 0;
  const ss = document.getElementById('recSlideshow');
  const dots = document.getElementById('recSlideshowDots');
  const counter = document.getElementById('recSlideCounter');
  const ph = document.getElementById('recSlidePlaceholder');
  if(!ss || !recSlideImgs.length) return;
  // Hide placeholder
  if(ph) ph.style.display='none';
  // Remove old images
  ss.querySelectorAll('.slideshow-img').forEach(el=>el.remove());
  recSlideImgs.forEach((url,i)=>{
    const img = document.createElement('img');
    img.className='slideshow-img'+(i===0?' active':'');
    img.src=url; img.alt=`Escena ${i+1}`;
    ss.insertBefore(img, ss.querySelector('.slide-nav-btn'));
  });
  if(dots) dots.innerHTML = recSlideImgs.map((_,i)=>`<button class="slide-dot ${i===0?'active':''}" onclick="goRecSlide(${i})"></button>`).join('');
  if(counter) counter.textContent=`1 / ${recSlideImgs.length}`;
}
function slideRecView(dir) {
  if(!recSlideImgs.length) return;
  recSlideIdx=(recSlideIdx+dir+recSlideImgs.length)%recSlideImgs.length;
  goRecSlide(recSlideIdx);
}
function goRecSlide(idx) {
  recSlideIdx=idx;
  document.querySelectorAll('#recSlideshow .slideshow-img').forEach((img,i)=>img.classList.toggle('active',i===idx));
  document.querySelectorAll('#recSlideshowDots .slide-dot').forEach((d,i)=>d.classList.toggle('active',i===idx));
  const counter=document.getElementById('recSlideCounter');
  if(counter) counter.textContent=`${idx+1} / ${recSlideImgs.length}`;
}

// ===================== KID MESSAGES (historia → padre) =====================
async function loadParentKidMessages() {
  const el = document.getElementById('parentKidMessages');
  if(!el) return;

  // Sincronizar mensajes del niño desde Supabase
  const familiaId = getFamiliaId();
  if(supa && familiaId) {
    try {
      const msgsSupabase = await supaGetMensajes(familiaId);
      if(msgsSupabase.length) {
        const localMsgs = JSON.parse(localStorage.getItem('ownKidMessages')||'[]');
        const localIds = new Set(localMsgs.map(m=>m.id));
        // Agregar mensajes nuevos que no están en local
        for(const m of msgsSupabase) {
          if(!localIds.has(m.id)) {
            localMsgs.unshift({
              id: m.id,
              title: m.titulo,
              text: m.texto||'',
              images: m.imagenes||[],
              audioKey: m.tiene_audio ? m.id : null,
              audioFile: m.tiene_audio ? `${familiaId}/${m.id}.webm` : null,
              date: new Date(m.created_at).toLocaleDateString('es-AR'),
              type: m.tipo,
            });
          }
        }
        localStorage.setItem('ownKidMessages', JSON.stringify(localMsgs.slice(0,20)));
        console.log('✅ Mensajes sincronizados desde Supabase:', msgsSupabase.length);
      }
    } catch(e) {
      console.warn('Sync mensajes Supabase:', e.message);
    }
  }

  const msgs = JSON.parse(localStorage.getItem('ownKidMessages')||'[]');
  if(!msgs.length) {
    el.innerHTML=`<div style="color:rgba(255,255,255,0.4);font-size:13px;padding:8px 16px;text-align:center">
      <div style="font-size:32px;margin-bottom:6px">📭</div>
      Aún no hay mensajes de ${appState.kidName}.
    </div>`;
    return;
  }

  // Header con ícono hugging sprite (oso abrazando corazón)
  const mailBg = sprite2Bg('hugging', 44);
  el.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:0 16px 16px">
    ${msgs.slice(0,10).map((m,i)=>`
    <div class="own-msg-card" onclick="openMsgDetail(${i})">
      <div class="own-msg-icon">
        <div style="width:44px;height:44px;${mailBg}"></div>
      </div>
      <div class="own-msg-title">${m.title||'Mensaje'}</div>
      <div class="own-msg-date">${m.date||''}</div>
      <div class="own-msg-type">${m.isDrawing?'🎨 Dibujo':m.isVoice?'🎙️ Audio':'✍️ Texto'}</div>
      ${(m.audioKey||m.audioFile)?`
        <button class="own-msg-play" onclick="event.stopPropagation();toggleMsgAudio(${i},'${m.audioKey||''}','${m.audioFile||''}')" id="msgPlayBtn${i}">▶</button>
        ${isPremium()
          ? `<button class="own-msg-download" onclick="event.stopPropagation();downloadMsgAudio('${m.audioKey||m.id}','${m.title}','${m.audioFile||''}')">📥</button>`
          : `<button class="own-msg-download locked" onclick="event.stopPropagation();showPremiumScreen()">🔒</button>`
        }`:''}
    </div>`).join('')}
    </div>
    <div id="msgDetailArea" style="padding:0 16px"></div>
  `;

  window._msgSlideIdx = window._msgSlideIdx || {};
  window._msgAudios  = window._msgAudios  || {};
  msgs.slice(0,10).forEach((_,i)=>{ window._msgSlideIdx[i]=0; });
}

let _msgDetailIdx = null;
let _msgDetailAudio = null;
let _mdSlideIdx = 0;

function openMsgDetail(i) {
  const msgs = JSON.parse(localStorage.getItem('ownKidMessages')||'[]');
  const m = msgs[i]; if(!m) return;
  _msgDetailIdx = i;
  _mdSlideIdx = 0;
  if(_msgDetailAudio){ _msgDetailAudio.pause(); _msgDetailAudio=null; }

  // Mover pantalla al body y mostrar
  var mds = document.getElementById('msgDetailScreen');
  if(!mds) return;
  if(mds.parentElement !== document.body) document.body.appendChild(mds);
  mds.style.display = 'flex';

  // Título y fecha
  const titleEl = document.getElementById('msgDetailTitle');
  if(titleEl) titleEl.textContent = m.title||'Mensaje';
  const dateEl = document.getElementById('msgDetailDate');
  if(dateEl) dateEl.textContent = m.date||'';

  // Imágenes
  const imgsEl = document.getElementById('msgDetailImgs');
  if(imgsEl) {
    if(m.images && m.images.length) {
      imgsEl.innerHTML = `
        <div style="position:relative;width:100%;aspect-ratio:1;border-radius:18px;overflow:hidden;background:rgba(255,255,255,0.06)">
          ${m.images.map((u,j)=>`<img src="${u}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:${j===0?'block':'none'}" id="mdImg${j}">`).join('')}
          ${m.images.length>1?`
            <button onclick="slideMsgDetailImg(-1)" style="position:absolute;left:8px;top:50%;transform:translateY(-50%);width:40px;height:40px;border-radius:50%;background:rgba(0,0,0,.6);border:none;color:white;font-size:22px;cursor:pointer">‹</button>
            <button onclick="slideMsgDetailImg(1)" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);width:40px;height:40px;border-radius:50%;background:rgba(0,0,0,.6);border:none;color:white;font-size:22px;cursor:pointer">›</button>
            <div style="position:absolute;bottom:10px;left:50%;transform:translateX(-50%);display:flex;gap:6px">
              ${m.images.map((_,j)=>`<div style="width:8px;height:8px;border-radius:50%;background:${j===0?'white':'rgba(255,255,255,0.4)'}" id="mdDot${j}"></div>`).join('')}
            </div>`:''}
        </div>`;
    } else { imgsEl.innerHTML=''; }
  }

  // Texto
  const textEl = document.getElementById('msgDetailText');
  if(textEl) {
    if(m.text){ textEl.textContent=m.text; textEl.style.display='block'; }
    else { textEl.style.display='none'; }
  }

  // Reproductor
  const playerEl = document.getElementById('msgDetailPlayer');
  const playBtn = document.getElementById('msgDetailPlayBtn');
  if(playerEl) {
    if(m.audioKey||m.audioFile) {
      playerEl.style.display='block';
      if(playBtn) playBtn.textContent='▶';
      document.getElementById('msgDetailProgress').style.width='0%';
      document.getElementById('msgDetailTime').textContent='0:00';
      loadMsgDetailAudio(m.audioKey||'', m.audioFile||'');
    } else { playerEl.style.display='none'; }
  }

  // Acciones
  const actEl = document.getElementById('msgDetailActions');
  if(actEl) {
    actEl.innerHTML =
      `${(m.audioKey||m.audioFile)?`<button class="btn btn-gold btn-sm" onclick="downloadMsgAudio('${m.audioKey||m.id}','${m.title||'mensaje'}')">📥 Descargar audio</button>`:''}
      ${m.images&&m.images.length?`<button class="btn btn-ghost btn-sm" onclick="downloadMsgImages(${i})">🖼️ Imágenes</button>`:''}
      <button class="btn btn-green btn-sm" onclick="openMsgDetailQuiz(${i})">🧠 Quiz</button>`;
  }
  const quizEl = document.getElementById('msgDetailQuizArea');
  if(quizEl) quizEl.innerHTML='';
}

function closeMsgDetail() {
  if(_msgDetailAudio){ _msgDetailAudio.pause(); _msgDetailAudio=null; }
  var mds = document.getElementById('msgDetailScreen');
  if(mds) mds.style.display='none';
}

function slideMsgDetailImg(dir) {
  const msgs = JSON.parse(localStorage.getItem('ownKidMessages')||'[]');
  const m = msgs[_msgDetailIdx]; if(!m||!m.images) return;
  const n = m.images.length;
  _mdSlideIdx = (_mdSlideIdx+dir+n)%n;
  for(let j=0;j<n;j++){
    const img=document.getElementById(`mdImg${j}`); if(img) img.style.display=j===_mdSlideIdx?'block':'none';
    const dot=document.getElementById(`mdDot${j}`); if(dot) dot.style.background=j===_mdSlideIdx?'white':'rgba(255,255,255,0.4)';
  }
}

async function loadMsgDetailAudio(audioKey, audioFile) {
  let audioUrl = null;
  if(audioKey) { const data=await dbGetAudio(audioKey).catch(()=>null); if(data&&data.blob&&data.blob.size>0) audioUrl=URL.createObjectURL(data.blob); }
  if(!audioUrl && audioFile && supa) audioUrl = await supaGetAudioUrl(audioFile).catch(()=>null);
  if(!audioUrl) { showToast('Sin audio disponible'); return; }
  const audio = new Audio(); audio.preload='auto'; audio.src=audioUrl; audio.load();
  audio.onloadedmetadata=()=>{ const t=document.getElementById('msgDetailTime'); if(t) t.textContent='0:00 / '+formatTime(audio.duration||0); };
  audio.ontimeupdate=()=>{
    const p=document.getElementById('msgDetailProgress'); const t=document.getElementById('msgDetailTime');
    if(p&&audio.duration) p.style.width=(audio.currentTime/audio.duration*100)+'%';
    if(t) t.textContent=formatTime(audio.currentTime)+' / '+formatTime(audio.duration||0);
  };
  audio.onended=()=>{ const btn=document.getElementById('msgDetailPlayBtn'); if(btn) btn.textContent='▶'; };
  _msgDetailAudio = audio;
}

function toggleMsgDetailAudio() {
  const btn = document.getElementById('msgDetailPlayBtn');
  if(!_msgDetailAudio) return;
  if(!_msgDetailAudio.paused){ _msgDetailAudio.pause(); if(btn) btn.textContent='▶'; }
  else { _msgDetailAudio.play().then(()=>{ if(btn) btn.textContent='⏸'; }); }
}

function seekMsgDetailAudio(e) {
  if(!_msgDetailAudio||!_msgDetailAudio.duration) return;
  const rect=e.currentTarget.getBoundingClientRect();
  _msgDetailAudio.currentTime=((e.clientX-rect.left)/rect.width)*_msgDetailAudio.duration;
}

function openMsgDetailQuiz(i) {
  const msgs=JSON.parse(localStorage.getItem('ownKidMessages')||'[]');
  const msg=msgs[i]; if(!msg) return;
  const el=document.getElementById('msgDetailQuizArea');
  if(!el) return;
  el.innerHTML=`<div style="margin-top:16px;background:rgba(52,211,153,0.08);border-radius:16px;padding:16px;border:1px solid rgba(52,211,153,0.2)">
    <div style="font-size:13px;font-weight:800;color:var(--accent3);margin-bottom:12px">🧠 Quiz para ${appState.kidName||'el niño'}</div>
    <input type="text" id="mdpq0" placeholder="Pregunta 1" style="font-size:13px;margin-bottom:8px">
    <input type="text" id="mdpq1" placeholder="Pregunta 2" style="font-size:13px;margin-bottom:8px">
    <input type="text" id="mdpq2" placeholder="Pregunta 3" style="font-size:13px;margin-bottom:8px">
    <button class="btn btn-gold btn-full btn-sm" onclick="saveMsgDetailQuiz(${i})">💾 Guardar quiz</button>
    <div id="mdpqSaved" style="display:none;font-size:12px;color:var(--accent3);margin-top:6px">✅ Guardado</div>
  </div>`;
}

function saveMsgDetailQuiz(i) {
  const qs=[0,1,2].map(j=>document.getElementById(`mdpq${j}`)?.value?.trim()).filter(Boolean);
  const msgs=JSON.parse(localStorage.getItem('ownKidMessages')||'[]');
  if(msgs[i]){ msgs[i].parentQuiz=qs; localStorage.setItem('ownKidMessages',JSON.stringify(msgs)); }
  const s=document.getElementById('mdpqSaved'); if(s) s.style.display='block';
}


// Message slideshow
function slideMsgImg(msgIdx, dir) {
  const msgs=JSON.parse(localStorage.getItem('ownKidMessages')||'[]');
  const m=msgs[msgIdx]; if(!m||!m.images) return;
  const n=m.images.length;
  const cur=window._msgSlideIdx[msgIdx]||0;
  const next=(cur+dir+n)%n;
  window._msgSlideIdx[msgIdx]=next;
  for(let j=0;j<n;j++){
    const img=document.getElementById(`msgImg${msgIdx}_${j}`);
    if(img) img.style.display=j===next?'block':'none';
    const dot=document.getElementById(`msgDot${msgIdx}_${j}`);
    if(dot) dot.style.background=j===next?'white':'rgba(255,255,255,0.4)';
  }
}

// Message audio player
async function toggleMsgAudio(msgIdx, audioKey, audioFile) {
  const btn=document.getElementById('msgPlayBtn'+msgIdx);
  if(window._msgAudios[msgIdx]) {
    const audio=window._msgAudios[msgIdx];
    if(!audio.paused) { audio.pause(); if(btn) btn.textContent='▶'; }
    else { audio.play().then(()=>{ if(btn) btn.textContent='⏸'; }).catch(e=>{ showToast('❌ '+e.message); if(btn) btn.textContent='▶'; }); }
    return;
  }
  if(btn) btn.textContent='⏳';
  let audioUrl = null;
  // 1. Intentar local
  if(audioKey) {
    const data=await dbGetAudio(audioKey).catch(()=>null);
    if(data&&data.blob&&data.blob.size>0) audioUrl=URL.createObjectURL(data.blob);
  }
  // 2. Fallback Supabase
  if(!audioUrl && audioFile && supa) {
    audioUrl = await supaGetAudioUrl(audioFile).catch(()=>null);
  }
  if(!audioUrl) { showToast('❌ No se encontró el audio'); if(btn) btn.textContent='▶'; return; }
  const audio=new Audio(); audio.preload='auto'; audio.src=audioUrl; audio.load();
  audio.onloadedmetadata=()=>{ const t=document.getElementById('msgTime'+msgIdx); if(t) t.textContent='0:00 / '+formatTime(audio.duration||0); };
  audio.ontimeupdate=()=>{
    const p=document.getElementById('msgProgress'+msgIdx); const t=document.getElementById('msgTime'+msgIdx);
    if(p&&audio.duration) p.style.width=(audio.currentTime/audio.duration*100)+'%';
    if(t) t.textContent=formatTime(audio.currentTime)+' / '+formatTime(audio.duration||0);
  };
  audio.onended=()=>{ if(btn) btn.textContent='▶'; };
  audio.onerror=()=>{ showToast('❌ Error cargando audio'); if(btn) btn.textContent='▶'; };
  window._msgAudios[msgIdx]=audio;
  audio.play().then(()=>{ if(btn) btn.textContent='⏸'; }).catch(e=>{ showToast('❌ '+e.message); if(btn) btn.textContent='▶'; });
}

function seekMsgAudio(msgIdx, event) {
  const audio=window._msgAudios[msgIdx]; if(!audio||!audio.duration) return;
  const bar=event.currentTarget;
  const rect=bar.getBoundingClientRect();
  const pct=(event.clientX-rect.left)/rect.width;
  audio.currentTime=pct*audio.duration;
}


async function downloadMsgAll(msgIdx) {
  const msgs = JSON.parse(localStorage.getItem('ownKidMessages')||'[]');
  const m = msgs[msgIdx]; if(!m) return;
  showToast('⏳ Preparando descarga...');
  let count = 0;

  // 1. Descargar audio
  if(m.audioKey || m.audioFile) {
    let audioUrl = null;
    const data = await dbGetAudio(m.audioKey||'').catch(()=>null);
    if(data && data.blob && data.blob.size>0) audioUrl = URL.createObjectURL(data.blob);
    if(!audioUrl && m.audioFile && supa) audioUrl = await supaGetAudioUrl(m.audioFile).catch(()=>null);
    if(audioUrl) {
      const a = document.createElement('a');
      a.href=audioUrl;
      a.download=((m.title||'audio').replace(/[^a-zA-Z0-9]/g,'_'))+'.webm';
      a.target='_blank';
      a.click();
      count++;
    }
  }

  // 2. Descargar imágenes con delay
  if(m.images && m.images.length) {
    m.images.forEach((url, i) => {
      setTimeout(() => {
        const a = document.createElement('a');
        a.href = url;
        a.download = `imagen_${i+1}.png`;
        a.target = '_blank';
        a.click();
        count++;
      }, (i+1) * 800);
    });
  }

  setTimeout(()=>{
    showToast(`📥 Descargando ${count + (m.images?.length||0)} archivo${count>1?'s':''}...`);
  }, 500);
}

async function downloadMsgAudio(audioKey, title, audioFile) {
  showToast('⏳ Preparando descarga...');
  let url = null;
  // 1. Intentar local
  const data = await dbGetAudio(audioKey).catch(()=>null);
  if(data && data.blob && data.blob.size>0) {
    url = URL.createObjectURL(data.blob);
  }
  // 2. Fallback Supabase con audioFile directo
  if(!url && audioFile && supa) {
    url = await supaGetAudioUrl(audioFile).catch(()=>null);
  }
  // 3. Buscar audioFile en mensajes guardados
  if(!url) {
    const msgs = JSON.parse(localStorage.getItem('ownKidMessages')||'[]');
    const m = msgs.find(x=>x.audioKey===audioKey||x.id===audioKey);
    if(m && m.audioFile && supa) url = await supaGetAudioUrl(m.audioFile).catch(()=>null);
  }
  if(!url) { showToast('❌ No se encontró el audio'); return; }
  const a = document.createElement('a');
  a.href=url; a.download=(title||'cuento_nino').replace(/[^a-zA-Z0-9]/g,'_')+'.webm';
  a.target='_blank'; a.click();
  showToast('📥 Descargando...');
}

function downloadMsgImages(msgIdx) {
  if(!isPremium()){ showToast('🔒 Solo Premium'); return; }
  const msgs=JSON.parse(localStorage.getItem('ownKidMessages')||'[]');
  const m=msgs[msgIdx]; if(!m||!m.images) return;
  m.images.forEach((url,i)=>{
    setTimeout(()=>{
      const a=document.createElement('a');
      a.href=url; a.download=`dibujo_${msgIdx+1}_${i+1}.png`; a.click();
    },i*600);
  });
  showToast(`📥 Descargando ${m.images.length} imagen${m.images.length>1?'es':''}...`);
}

async function playKidMessage(key, btn) {
  const data = await dbGetAudio(key);
  if(!data||!data.blob) { showToast('❌ No se encontró el audio'); return; }
  const url = URL.createObjectURL(data.blob);
  if(btn && btn._audio) {
    if(btn._audio.paused) {
      btn._audio.play().then(()=>{ btn.textContent='⏸ Pausar'; }).catch(e=>showToast('❌ '+e.message));
    } else {
      btn._audio.pause(); btn.textContent='▶ Escuchar';
    }
    return;
  }
  const audio = new Audio(); audio.preload='auto'; audio.src=url; audio.load();
  audio.onended=()=>{ if(btn) btn.textContent='▶ Escuchar'; };
  if(btn) { btn._audio=audio; }
  audio.play().then(()=>{ if(btn) btn.textContent='⏸ Pausar'; }).catch(e=>showToast('❌ Error: '+e.message));
}

function openParentQuizForMessage(msgIdx) {
  const msgs = JSON.parse(localStorage.getItem('ownKidMessages')||'[]');
  const msg = msgs[msgIdx];
  if(!msg) return;
  const el = document.getElementById('parentQuizArea'+msgIdx);
  if(!el) return;
  el.style.display = el.style.display==='none'?'block':'none';
  if(el.style.display==='block') {
    const text = msg.text||'';
    // Generate 3 simple questions from the text
    el.innerHTML=`
      <div style="font-size:13px;font-weight:800;color:var(--accent3);margin-bottom:10px">🧠 Quiz sobre la historia de ${appState.kidName}</div>
      <div style="background:rgba(52,211,153,0.1);border-radius:10px;padding:10px;margin-bottom:10px;font-size:13px;line-height:1.6">${text.substring(0,300)}${text.length>300?'...':''}</div>
      <div style="font-size:13px;font-weight:700;margin-bottom:8px">¿Tu hijo entiende la historia?</div>
      <div id="parentQuizInputs${msgIdx}" style="display:flex;flex-direction:column;gap:8px">
        <input type="text" id="pq${msgIdx}_0" placeholder="Pregunta 1: ¿De qué trataba la historia?" style="font-size:13px">
        <input type="text" id="pq${msgIdx}_1" placeholder="Pregunta 2: ¿Cuál fue el momento más importante?" style="font-size:13px">
        <input type="text" id="pq${msgIdx}_2" placeholder="Pregunta 3: ¿Qué aprendiste de la historia?" style="font-size:13px">
      </div>
      <button class="btn btn-gold btn-full btn-sm" style="margin-top:10px" onclick="saveParentQuiz(${msgIdx})">💾 Guardar quiz para el niño</button>
      <div id="pqSaved${msgIdx}" style="display:none;font-size:12px;color:var(--accent3);margin-top:6px">✅ Quiz guardado — el niño lo verá en su app</div>`;
  }
}

function saveParentQuiz(msgIdx) {
  const questions = [0,1,2].map(i=>document.getElementById(`pq${msgIdx}_${i}`)?.value?.trim()).filter(Boolean);
  if(!questions.length) { showToast('❌ Escribí al menos una pregunta'); return; }
  const msgs = JSON.parse(localStorage.getItem('ownKidMessages')||'[]');
  if(msgs[msgIdx]) {
    msgs[msgIdx].parentQuiz = questions;
    localStorage.setItem('ownKidMessages', JSON.stringify(msgs));
  }
  document.getElementById(`pqSaved${msgIdx}`).style.display='block';
  showToast('✅ Quiz guardado para '+appState.kidName);
}

// ===================== WRITE RECORDING (KID) =====================
let writeRecState = { isRecording:false, mediaRecorder:null, audioChunks:[], recordedBlob:null, recAudio:null, recIsPlaying:false, recordSeconds:0, recInterval:null, selectedVoice:'normal' };
let writeSelectedImages = [];

async function toggleWriteRecord() {
  if(writeRecState.isRecording) { stopWriteRecord(); return; }
  try {
    const stream=await navigator.mediaDevices.getUserMedia({audio:true,video:false});
    writeRecState.audioChunks=[];
    const mimeType=MediaRecorder.isTypeSupported('audio/webm;codecs=opus')?'audio/webm;codecs=opus':
                   MediaRecorder.isTypeSupported('audio/webm')?'audio/webm':'';
    writeRecState.mediaRecorder=new MediaRecorder(stream, mimeType?{mimeType}:{});
    writeRecState.mediaRecorder.ondataavailable=e=>{if(e.data&&e.data.size>0) writeRecState.audioChunks.push(e.data);};
    writeRecState.mediaRecorder.onstop=()=>{
      stream.getTracks().forEach(t=>t.stop());
      if(!writeRecState.audioChunks.length){ showToast('❌ No se grabó audio'); return; }
      const blob=new Blob(writeRecState.audioChunks,{type:mimeType||'audio/webm'});
      writeRecState.recordedBlob=blob;
      if(writeRecState.recAudioUrl){ try{ URL.revokeObjectURL(writeRecState.recAudioUrl); }catch(e){} }
      const url=URL.createObjectURL(blob);
      writeRecState.recAudioUrl=url;
      if(writeRecState.recAudio){ writeRecState.recAudio.pause(); writeRecState.recAudio=null; }
      const audio=new Audio();
      audio.preload='auto'; audio.src=url; audio.load();
      audio.ontimeupdate=()=>{
        const p=document.getElementById('writeRecProgress');
        if(p&&audio.duration) p.style.width=(audio.currentTime/audio.duration*100)+'%';
        const td=document.getElementById('writeRecTime');
        if(td) td.textContent=formatTime(audio.currentTime)+' / '+formatTime(audio.duration||0);
      };
      audio.onended=()=>{ writeRecState.recIsPlaying=false; const b=document.getElementById('writeRecPlayBtn'); if(b) b.textContent='▶'; };
      audio.onerror=()=>{ showToast('❌ Error cargando audio'); console.error('Write rec error',audio.error); };
      writeRecState.recAudio=audio;
      const pb=document.getElementById('writeRecPlayback'); if(pb) pb.style.display='block';
    };
    writeRecState.mediaRecorder.start(100);
    writeRecState.isRecording=true; writeRecState.recordSeconds=0;
    const btn=document.getElementById('writeRecBtn');
    if(btn){ btn.classList.add('recording'); btn.style.background='linear-gradient(135deg,#ef4444,#dc2626)'; btn.style.boxShadow='0 8px 24px rgba(239,68,68,.6)'; btn.innerHTML='<span style="font-size:38px;line-height:1">⏹️</span><span style="font-size:12px;font-weight:900;font-family:Nunito,sans-serif;margin-top:4px">PARAR</span>'; }
    const ws=document.getElementById('writeRecStatus'); if(ws) ws.textContent='🔴 Grabando...';
    clearInterval(writeRecState.recInterval);
    writeRecState.recInterval=setInterval(()=>{
      writeRecState.recordSeconds++;
      const wt=document.getElementById('writeRecTimer'); if(wt) wt.textContent=formatTime(writeRecState.recordSeconds);
    },1000);
  } catch(e) { console.error(e); showToast('❌ No se pudo acceder al micrófono'); }
}
function stopWriteRecord() {
  if(writeRecState.mediaRecorder&&writeRecState.isRecording){
    writeRecState.mediaRecorder.stop(); writeRecState.isRecording=false;
    clearInterval(writeRecState.recInterval);
    const btn=document.getElementById('writeRecBtn'); if(btn){ btn.classList.remove('recording'); btn.style.background='linear-gradient(135deg,var(--coral),#ff8e53)'; btn.innerHTML='<span style="font-size:38px;line-height:1">🎙️</span><span style="font-size:12px;font-weight:900;font-family:Nunito,sans-serif;margin-top:4px">GRABAR</span>'; }
    const ws=document.getElementById('writeRecStatus'); if(ws) ws.textContent='✅ ¡Grabado! Escuchá ↓';
  }
}
function toggleWriteRecPlay() {
  if(!writeRecState.recAudio){ showToast('❌ No hay grabación'); return; }
  if(writeRecState.recIsPlaying){
    writeRecState.recAudio.pause(); writeRecState.recIsPlaying=false;
    const btn=document.getElementById('writeRecPlayBtn'); if(btn) btn.textContent='▶';
  } else {
    writeRecState.recAudio.play()
      .then(()=>{ writeRecState.recIsPlaying=true; const btn=document.getElementById('writeRecPlayBtn'); if(btn) btn.textContent='⏸'; })
      .catch(e=>{ showToast('❌ '+e.message); console.error('writeRecPlay error',e); });
  }
}
function deleteWriteRecording() {
  if(writeRecState.recAudio){ writeRecState.recAudio.pause(); writeRecState.recAudio=null; }
  writeRecState.recordedBlob=null; writeRecState.isRecording=false;
  const pb=document.getElementById('writeRecPlayback'); if(pb) pb.style.display='none';
  const wt=document.getElementById('writeRecTimer'); if(wt) wt.textContent='0:00';
  const ws=document.getElementById('writeRecStatus'); if(ws) ws.textContent='Listo para grabar';
  showToast('🗑 Audio borrado');
}
function selectWriteVoice(id) {
  writeRecState.selectedVoice=id;
  document.querySelectorAll('.write-voice-pill').forEach(b=>b.classList.toggle('active',b.dataset.v===id));
  showToast('🎭 Voz: '+VOICES.find(v=>v.id===id)?.label);
}

async function loadWriteImgPicker() {
  const el=document.getElementById('writeImgPicker');
  if(!el) return;
  // Load kid drawings from localStorage
  const drawings=JSON.parse(localStorage.getItem('ownKidDrawings')||'[]');
  // Load story images from DB
  const stories=await dbGetAll('stories').catch(()=>[]);
  const storyImgs=stories.flatMap(s=>s.images||[]).filter(Boolean);
  const allImgs=[...drawings,...storyImgs].slice(0,12);
  writeSelectedImages=[];
  if(!allImgs.length) { el.innerHTML='<div style="color:var(--text2);font-size:12px;padding:8px;text-align:center;grid-column:1/-1">Hacé dibujos en el patio de juegos para verlos aquí</div>'; return; }
  el.innerHTML=allImgs.map((u,i)=>`
    <div onclick="toggleWriteImg(${i},this)" style="border-radius:10px;overflow:hidden;aspect-ratio:1;border:2px solid transparent;cursor:pointer;transition:border-color 0.2s" id="wimg${i}">
      <img src="${u}" style="width:100%;height:100%;object-fit:cover">
    </div>`).join('');
  el._imgs=allImgs;
}

function toggleWriteImg(idx, el) {
  const all=document.getElementById('writeImgPicker');
  const url=all._imgs[idx];
  if(writeSelectedImages.includes(url)) {
    writeSelectedImages=writeSelectedImages.filter(u=>u!==url);
    el.style.borderColor='transparent';
  } else {
    writeSelectedImages.push(url);
    el.style.borderColor='var(--accent3)';
  }
  // Show selected
  const sel=document.getElementById('writeSelectedImgs');
  if(sel) sel.innerHTML=writeSelectedImages.length?`<div style="font-size:11px;color:var(--accent3);margin-bottom:4px">✅ ${writeSelectedImages.length} imágen${writeSelectedImages.length>1?'es':''} seleccionada${writeSelectedImages.length>1?'s':''}</div>`:'';
}

async function sendWritingToParent() {
  const title=document.getElementById('kidWriteTitle')?.value?.trim()||'Mi historia';
  const text=document.getElementById('kidWriteArea')?.value?.trim();
  if(!text||text.length<10) { showToast('❌ Escribí más antes de mandar'); return; }
  const id='kidmsg_'+Date.now();
  // Save writing to DB
  await dbPut('writings',{id,title,text,images:writeSelectedImages,created:new Date().toLocaleDateString('es-AR')}).catch(()=>{});
  // Save audio if recorded
  if(writeRecState.recordedBlob) {
    await dbPutAudio(id, writeRecState.recordedBlob);
  }
  // Save message to localStorage for parent to see
  const msgs=JSON.parse(localStorage.getItem('ownKidMessages')||'[]');
  msgs.unshift({id,title,text,images:writeSelectedImages,audioKey:writeRecState.recordedBlob?id:null,date:new Date().toLocaleDateString('es-AR')});
  localStorage.setItem('ownKidMessages',JSON.stringify(msgs.slice(0,20)));
  // Update progress
  updateKidProgress('writingsSaved');
  updateKidProgress('totalWritingChars',text.length);
  checkAchievements();
  const stars=Math.min(10,Math.floor(text.length/50)+2);
  appState.stars+=stars; localStorage.setItem('ownStars',appState.stars); updateStarDisplay();
  // Notify parent
  notifyParent('✍️ '+appState.kidName+' escribió una historia: "'+title+'"');
  updateParentNotifBadge();
  rewardKidCoins(3, '¡Por mandar tu historia!');
  showToast(`🚀 ¡Historia mandada a papá/mamá! +${stars}⭐`);
  document.getElementById('kidWriteTitle').value='';
  document.getElementById('kidWriteArea').value='';
  writeRecState.recordedBlob=null; writeSelectedImages=[];
  document.getElementById('writeRecPlayback').style.display='none';
  document.getElementById('writeRecTimer').textContent='0:00';
  loadKidWritings();
}

// ===================== DRAW SAVE TO STORY =====================
function saveKidDrawing() {
  const canvas=document.getElementById('drawCanvas');
  if(!canvas) { showToast('❌ Hacé un dibujo primero'); return; }
  // Check if canvas has content
  const ctx=canvas.getContext('2d');
  const data=ctx.getImageData(0,0,canvas.width,canvas.height).data;
  const hasContent=Array.from(data).some((v,i)=>i%4!==3&&v<255);
  if(!hasContent) { showToast('❌ Dibujá algo primero'); return; }
  const url=canvas.toDataURL('image/png');
  // Save to kid drawings
  const drawings=JSON.parse(localStorage.getItem('ownKidDrawings')||'[]');
  drawings.unshift(url);
  localStorage.setItem('ownKidDrawings',JSON.stringify(drawings.slice(0,20)));
  // Also add to current story images if there's a loaded story
  if(appState.currentStory) {
    const storyImgs=JSON.parse(localStorage.getItem('ownKidStoryImgs_'+appState.currentStory.id)||'[]');
    storyImgs.unshift(url);
    localStorage.setItem('ownKidStoryImgs_'+appState.currentStory.id,JSON.stringify(storyImgs.slice(0,10)));
    buildKidImagesGrid();
    showToast('🎨 Dibujo guardado y agregado al cuento!');
  } else {
    showToast('🎨 Dibujo guardado! Aparecerá en tu área de escritura');
  }
  const stars=3; appState.stars+=stars; localStorage.setItem('ownStars',appState.stars); updateStarDisplay();
  showToast(`🎨 ¡Guardado! +${stars}⭐`);
}

// ===================== COINS + DIAMONDS (daily rewards) =====================
function getCoins() { return parseInt(localStorage.getItem('ownCoins')||'0'); }
function getDiamonds() { return parseInt(localStorage.getItem('ownDiamonds')||'0'); }
function addCoins(n) {
  const c=getCoins()+n; localStorage.setItem('ownCoins',c);
  const el=document.getElementById('premCoinsDisplay'); if(el) el.textContent=c;
}
function addDiamonds(n) {
  const d=getDiamonds()+n; localStorage.setItem('ownDiamonds',d);
  const el=document.getElementById('premDiamondsDisplay'); if(el) el.textContent=d;
}
function updateCurrencyDisplay() {
  const el1=document.getElementById('premCoinsDisplay'); if(el1) el1.textContent=getCoins();
  const el2=document.getElementById('premDiamondsDisplay'); if(el2) el2.textContent=getDiamonds();
}
function selectPlan(plan) {
  _selectedPlan = plan;
  const btn = document.getElementById('activatePlanBtn');
  if(btn) btn.style.display = plan === 'premium' ? 'block' : 'none';
}

function activateSelectedPlan() {
  // Simulation for beta — real payment via MercadoPago in future
  if(_selectedPlan === 'premium') {
    showToast('🚧 Pagos disponibles próximamente. Escribinos por WhatsApp.');
  }
}

function buyTokens(amount, price) {
  showToast(`🚧 Compra de ${amount} tokens ($${price}) disponible próximamente.`);
}

function claimDailyCoins() {
  const today = new Date().toDateString();
  if(localStorage.getItem('ownLastCoinClaim') === today) {
    showToast('✅ Ya reclamaste tus monedas hoy');
    return;
  }
  const coins = parseInt(localStorage.getItem('ownCoins')||'0') + 10;
  localStorage.setItem('ownCoins', coins);
  localStorage.setItem('ownLastCoinClaim', today);
  updateCurrencyDisplay();
  showToast('🪙 ¡+10 monedas! Volvé mañana por más');
  const btn = document.getElementById('dailyCoinBtn');
  if(btn) { btn.textContent = '✅ Reclamado hoy'; btn.disabled = true; }
}

function claimDailyDiamonds() {
  if(!isPremium()) { showToast('💎 Los diamantes son exclusivos de Premium'); return; }
  const key='ownLastDiamondClaim';
  const last=localStorage.getItem(key);
  const today=new Date().toDateString();
  if(last===today) { showToast('⏰ Ya reclamaste los diamantes de hoy'); return; }
  localStorage.setItem(key,today);
  addDiamonds(5);
  showToast('💎 +5 diamantes del día!');
  const btn=document.getElementById('dailyDiamondBtn'); if(btn) { btn.textContent='✅ Reclamado'; btn.disabled=true; }
}
function convertCoinsToStars() {
  const coins=getCoins();
  if(coins<50) { showToast(`🪙 Necesitás 50 monedas (tenés ${coins})`); return; }
  const sets=Math.floor(coins/50);
  const newCoins=coins-(sets*50);
  localStorage.setItem('ownCoins',newCoins);
  appState.stars+=sets; localStorage.setItem('ownStars',appState.stars); updateStarDisplay();
  updateCurrencyDisplay();
  showToast(`⭐ +${sets} estrellitas para tu hijo!`);
}

// ===================== PARENT NOTIFICATIONS =====================
function notifyParent(msg) {
  const notes=JSON.parse(localStorage.getItem('ownParentNotifs')||'[]');
  notes.unshift({msg, date:new Date().toLocaleDateString('es-AR'), time:new Date().toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'}), read:false});
  localStorage.setItem('ownParentNotifs',JSON.stringify(notes.slice(0,20)));
  // Update badge if parent tab is visible
  updateParentNotifBadge();
}
function updateParentNotifBadge() {
  const notes=JSON.parse(localStorage.getItem('ownParentNotifs')||'[]');
  const unread=notes.filter(n=>!n.read).length;
  const badge=document.getElementById('parentNotifBadge');
  if(badge) { badge.textContent=unread; badge.style.display=unread?'flex':'none'; }
}
function showParentNotifs() {
  const notes=JSON.parse(localStorage.getItem('ownParentNotifs')||'[]');
  // Mark all as read
  notes.forEach(n=>n.read=true);
  localStorage.setItem('ownParentNotifs',JSON.stringify(notes));
  updateParentNotifBadge();
  if(!notes.length){ showToast('No hay notificaciones'); return; }
  // Show in a simple overlay
  const existing=document.getElementById('notifOverlay');
  if(existing) existing.remove();
  const div=document.createElement('div');
  div.id='notifOverlay';
  div.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:flex-end;padding:16px';
  div.innerHTML=`<div style="background:var(--card);border-radius:20px 20px 14px 14px;width:100%;max-height:70vh;overflow-y:auto;padding:16px">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
      <div style="font-weight:800;font-size:16px">🔔 Notificaciones</div>
      <button onclick="document.getElementById('notifOverlay').remove()" style="background:none;border:none;color:var(--text);font-size:22px;cursor:pointer">✕</button>
    </div>
    ${notes.map(n=>`<div style="background:var(--bg2);border-radius:12px;padding:10px;margin-bottom:8px">
      <div style="font-size:13px;font-weight:700">${n.msg}</div>
      <div style="font-size:11px;color:var(--text2);margin-top:3px">${n.date} ${n.time}</div>
    </div>`).join('')}
  </div>`;
  document.body.appendChild(div);
  div.addEventListener('click',e=>{ if(e.target===div) div.remove(); });
}

// ===================== SEQUENCE BUILDER PARENT =====================
let parentSequenceData=[{},{},{},{},{}], parentSelectedCelebration='fiesta';
function buildParentSequenceScenes() {
  const el=document.getElementById('parentSequenceScenes'); if(!el) return;
  el.innerHTML=parentSequenceData.map((scene,i)=>{
    const actSel=scene.action!==undefined?SEQ_ACTIONS[scene.action]:null;
    const isLast=i===4;
    const celSel=SEQ_CELEBRATIONS.find(c=>c.id===parentSelectedCelebration)||SEQ_CELEBRATIONS[3];
    const done=actSel||isLast;
    return `<div class="seq-scene${done?' complete':''}" id="pScene${i}">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
        <div class="seq-scene-title" style="margin:0">Escena ${i+1}${isLast?' 🎉':''}</div>
        ${done?'<span style="color:var(--mint);font-size:16px">✅</span>':''}
      </div>
      ${isLast?`
        <div style="font-size:10px;font-weight:800;color:var(--text3);margin-bottom:6px">TIPO DE FESTEJO</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px">
          ${SEQ_CELEBRATIONS.map(c=>`<button onclick="selectParentCelebration('${c.id}');buildParentSequenceScenes()" style="padding:8px 12px;border-radius:12px;border:2px solid ${parentSelectedCelebration===c.id?'var(--warm)':'rgba(255,255,255,.08)'};background:${parentSelectedCelebration===c.id?'rgba(255,209,102,.2)':'var(--bg2)'};cursor:pointer;font-size:13px;font-weight:700;color:${parentSelectedCelebration===c.id?'var(--warm)':'var(--text2)'};font-family:Nunito,sans-serif">${c.icon} ${c.label}</button>`).join('')}
        </div>
      `:`
        <div style="font-size:10px;font-weight:800;color:var(--text3);margin-bottom:6px">ACCIÓN DE LA ESCENA</div>
        <div style="display:flex;flex-wrap:wrap;gap:5px">
          ${SEQ_ACTIONS.map((a,j)=>`<button onclick="selectParentSeqAction(${i},${j})" style="padding:6px 10px;border-radius:10px;border:2px solid ${scene.action===j?'var(--coral)':'rgba(255,255,255,.06)'};background:${scene.action===j?'rgba(255,107,107,.15)':'var(--bg2)'};cursor:pointer;font-size:12px;font-weight:700;color:${scene.action===j?'var(--coral)':'var(--text2)'};font-family:Nunito,sans-serif">${a.icon} ${a.label}</button>`).join('')}
        </div>
      `}
    </div>`;
  }).join('');
}

function toggleSeqPicker(type,idx) {
  const pid=`${type==='char'?'charPicker':type==='action'?'actionPicker':'celebPicker'}${idx}`;
  document.querySelectorAll('[id^="charPicker"],[id^="actionPicker"],[id^="celebPicker"]').forEach(el=>{
    el.style.display = el.id===pid ? (el.style.display==='none'?'block':'none') : 'none';
  });
}

const SEQ_CELEBRATIONS=[
  {id:'torta',icon:'🎂',label:'Torta'},{id:'baile',icon:'💃',label:'Baile'},
  {id:'risas',icon:'😂',label:'Risas'},{id:'fiesta',icon:'🎊',label:'Fiesta'},
  {id:'globos',icon:'🎈',label:'Globos'},
];

function selectParentSeqChar(sceneIdx,char) {
  parentSequenceData[sceneIdx].char=char;
  const pid=`charPicker${sceneIdx}`;
  buildParentSequenceScenes();
  // Reopen picker after rebuild so user can see selection
  const picker=document.getElementById(pid); if(picker) picker.style.display='none';
}
function selectParentSeqAction(sceneIdx,actionIdx) {
  parentSequenceData[sceneIdx].action=actionIdx;
  buildParentSequenceScenes();
  const picker=document.getElementById(`actionPicker${sceneIdx}`); if(picker) picker.style.display='none';
}
function selectParentCelebration(cel) {
  parentSelectedCelebration=cel;
  buildParentSequenceScenes();
  const picker=document.getElementById(`celebPicker4`); if(picker) picker.style.display='none';
}

async function generateParentSequenceImages() {
  const btn=document.getElementById('btnGenScenes');
  if(btn) { btn.disabled=true; btn.textContent='⏳ Generando...'; }
  showLoading('Generando 5 escenas...');
  const prompts=parentSequenceData.map((s,i)=>{
    const c=s.char||'🐉', a=SEQ_ACTIONS[s.action||0];
    return `${c} ${a?a.label:''} scene ${i+1} children storybook`;
  });
  const imgs=[];
  for(const p of prompts) { imgs.push(await generateImageWithFallback(p)); await new Promise(r=>setTimeout(r,300)); }
  appState.currentStoryImages=imgs;
  // Show thumbs row
  const thumbRow=document.getElementById('scenesThumbRow');
  const preview=document.getElementById('scenesPreviewGrid');
  if(thumbRow) thumbRow.innerHTML=imgs.map((u,i)=>`<img src="${u}" style="width:100%;aspect-ratio:1;border-radius:8px;object-fit:cover" title="Escena ${i+1}">`).join('');
  if(preview) preview.style.display='block';
  // Enable step 3 button
  const nextBtn=document.getElementById('btnGoStep3');
  if(nextBtn) { nextBtn.disabled=false; }
  if(btn) { btn.disabled=false; btn.textContent='🔄 Regenerar imágenes'; }
  // Build slideshow for step 3
  buildRecSlideshow(imgs);
  hideLoading();
  showToast('✅ ¡5 escenas listas! Avanzá al paso 3 para grabar');
}

// ===================== KID APP =====================
function showKidApp() {
  appState.currentUser='kid';
  const settings=JSON.parse(localStorage.getItem('ownSettings')||'{}');
  appState.kidName=settings.kidName||'Niño';
  appState.stars=parseInt(localStorage.getItem('ownStars')||'0');
  document.getElementById('kidNameHeader').textContent=appState.kidName+'!';
  updateStarDisplay();
  buildKidVoiceRow();
  buildKidCharRow();
  buildKidAchievements();
  buildTokenShop();
  buildClassicStories();
  loadKidWritings();
  loadWriteImgPicker();
  switchKidTab('home');
  showScreen('kidApp');
  updateKidProgress('sessionMinutes', 0); // start tracking
}

function switchKidTab(tab) {
  ['home','player','play','write','draw','stars'].forEach(t=>{
    const el=document.getElementById('kTab-'+t);
    if(el) el.style.display=t===tab?'block':'none';
    const nav=document.getElementById('knav-'+t);
    if(nav) nav.classList.toggle('active',t===tab);
  });
  if(tab==='home') { loadKidHomeStories(); buildClassicStories(); }
  if(tab==='stars') { updateStarDisplay(); buildKidAchievements(); }
  if(tab==='write') loadKidWritings();
  if(tab==='draw') setTimeout(initKidDraw, 80);
}

async function sendKidReaction(emoji) {
  const story = appState.currentStory;
  const kidName = appState.kidName || 'Tu hijo';
  const storyTitle = story?.title || 'el cuento';

  // Show feedback
  const rb=document.getElementById('kidReactionBtns'); if(rb) rb.style.display='none';
  const rs=document.getElementById('kidReactionSent'); if(rs) rs.style.display='block';

  // Reward coins
  rewardKidCoins(3, `¡Por reaccionar con ${emoji}!`);

  // Save as message to parent
  const id='reaction_'+Date.now();
  const msg={id, title:`${emoji} ${kidName} reaccionó a "${storyTitle}"`,
    text:`${kidName} puso ${emoji} en tu cuento "${storyTitle}"`,
    images:[], date:new Date().toLocaleDateString('es-AR'), type:'reaction'};
  const msgs=JSON.parse(localStorage.getItem('ownKidMessages')||'[]');
  msgs.unshift(msg); localStorage.setItem('ownKidMessages',JSON.stringify(msgs.slice(0,20)));

  // Supabase
  const familiaId=getFamiliaId();
  if(supa&&familiaId) {
    supa.from('mensajes_nino').insert({id,familia_id:familiaId,titulo:msg.title,texto:msg.text,tipo:'reaction',imagenes:[],tiene_audio:false}).catch(e=>console.warn(e));
  }
  notifyParent(msg.title);
  updateParentNotifBadge();
}

function openFirstNewStory() {
  const lastSeen = parseInt(localStorage.getItem('ownKidLastSeenStories')||'0');
  const stories = appState._kidStories || [];
  const newOne = stories.find(s => new Date(s.created||0).getTime() > lastSeen || s.supaSync);
  if(newOne) openKidStory(newOne.id);
  else if(stories.length) openKidStory(stories[0].id);
}

async function loadKidHomeStories() {
  const el=document.getElementById('kidHomeStories');
  if(!el) return;

  // Intentar sincronizar desde Supabase primero
  const familiaId = getFamiliaId();
  if(supa && familiaId) {
    try {
      const cuentosSupabase = await supaGetCuentos(familiaId);
      if(cuentosSupabase.length) {
        // Guardar en IndexedDB local para acceso offline
        for(const c of cuentosSupabase) {
          const local = {
            id: c.id, title: c.titulo, char: c.personaje,
            voice: c.voz, images: c.imagenes||[],
            storyText: c.texto, portada: c.portada,
            hasAudio: c.tiene_audio, created: new Date(c.created_at).toLocaleDateString('es-AR'),
            type: 'parent', supaSync: true,
            audioFile: c.tiene_audio ? `${familiaId}/${c.id}.webm` : null
          };
          await dbPut('stories', local).catch(()=>{});
        }
        console.log('✅ Sincronizados', cuentosSupabase.length, 'cuentos desde Supabase');
      }
    } catch(e) {
      console.warn('Sync Supabase (usando local):', e.message);
    }
  }

  // Cargar desde IndexedDB (local + sincronizado)
  const stories=await dbGetAll('stories');
  const userStories=stories.filter(s=>s.type==='parent'||!s.type);
  appState._kidStories = userStories;

  // Update kid name in hero
  const heroName = document.getElementById('kidHeroName');
  if(heroName) heroName.textContent = appState.kidName || 'amigo';

  const newHero = document.getElementById('kidNewStoryHero');
  const noHero = document.getElementById('kidNoStoryHero');

  if(!userStories.length) {
    el.innerHTML=`<div class="empty-state"><div class="empty-icon">📖</div><p>Papá/Mamá va a mandarte un cuento pronto</p></div>`;
    if(newHero) newHero.style.display='none';
    if(noHero) noHero.style.display='block';
    return;
  }

  // Show hero if there are stories
  if(newHero) newHero.style.display='block';
  if(noHero) noHero.style.display='none';

  const lastSeen = parseInt(localStorage.getItem('ownKidLastSeenStories')||'0');
  const bgColors  = ['#B8DFF0','#FDDCCA','#C8EFD8','#E8DFFF'];
  const brdColors = ['#7BBFE8','#F4A261','#52C77F','#A78BFA'];

  // Asegurar que el contenedor sea flex horizontal
  el.style.cssText = 'display:flex;gap:12px;padding:0 16px 16px;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch';

  el.innerHTML = userStories.sort((a,b)=>b.id-a.id).map((s,idx)=>{
    const img = s.images&&s.images[0];
    const sprite = CHAR_SPRITES[s.char];
    const isNew = s.supaSync && new Date(s.created||0).getTime() > lastSeen;
    const bg  = bgColors[idx%4];
    const brd = brdColors[idx%4];
    const thumbHtml = img
      ? `<img src="${img}" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none'">`
      : sprite
        ? `<div style="width:80px;height:80px;margin:auto;${spriteBg(sprite,80)}"></div>`
        : `<div style="font-size:44px;display:flex;align-items:center;justify-content:center;width:100%;height:100%">${s.char||'📖'}</div>`;

    return `<div onclick="openKidStory('${s.id}')" style="flex-shrink:0;width:150px;border-radius:20px;overflow:hidden;border:2.5px solid ${brd};box-shadow:0 4px 14px rgba(0,0,0,0.1);cursor:pointer;background:${bg};position:relative">
      ${isNew?`<div style="position:absolute;top:8px;right:8px;background:#F4A261;color:white;font-size:9px;font-weight:800;border-radius:12px;padding:2px 7px;z-index:3;font-family:'Nunito',sans-serif">¡NUEVO!</div>`:''}
      <div style="width:150px;height:140px;overflow:hidden;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.3)">${thumbHtml}</div>
      <div style="padding:8px 10px 10px;background:rgba(255,255,255,0.85)">
        <div style="font-family:'Fredoka One',cursive;font-size:12px;color:#5C4033;line-height:1.3;margin-bottom:2px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical">${s.title||'Sin título'}</div>
        <div style="font-size:9px;color:#9B7B6B;font-weight:600">${s.created||''}</div>
      </div>
    </div>`;
  }).join('');
}

function loadKidAudioFromBlob(blob) {
  if(appState.kidAudioUrl){ try{ URL.revokeObjectURL(appState.kidAudioUrl); }catch(e){} appState.kidAudioUrl=null; }
  const url=URL.createObjectURL(blob);
  appState.kidAudioUrl=url;
  const audio=new Audio();
  audio.preload='auto'; audio.src=url; audio.load();
  audio.onloadedmetadata=()=>{
    const t=document.getElementById('kidTimeDisplay');
    if(t) t.textContent='0:00 / '+formatTime(audio.duration||0);
  };
  audio.ontimeupdate=()=>{
    const p=document.getElementById('kidProgress');
    if(p&&audio.duration) p.style.width=(audio.currentTime/audio.duration*100)+'%';
    const t=document.getElementById('kidTimeDisplay');
    if(t) t.textContent=formatTime(audio.currentTime)+' / '+formatTime(audio.duration||0);
  };
  audio.onended=()=>{
    const b=document.getElementById('kidPlayBtn');
    if(b) b.style.cssText=`width:72px;height:72px;${kidSpriteBg('btn_play_big',72)}`;
    appState.kidIsPlaying=false;
    updateKidProgress('storiesListened');
  };
  audio.onerror=()=>{ const t=document.getElementById('kidTimeDisplay'); if(t) t.textContent='Error de audio'; };
  appState.kidAudio=audio;
}

function buildClassicStories() {
  const el=document.getElementById('kidClassicStories');
  if(!el) return;
  const cardClasses=['own-card-blue','own-card-salmon','own-card-mint','own-card-lavender'];
  el.style.cssText='display:flex;gap:12px;padding:0 16px 16px;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch';
  el.innerHTML=CLASSIC_STORIES.map((s,idx)=>`
    <div onclick="openClassicStory('${s.id}')" class="own-card-wrap ${cardClasses[idx%4]}" style="width:130px;height:160px">
      <div style="position:absolute;top:10px;left:50%;transform:translateX(-50%);font-size:32px;z-index:4;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.2))">${s.emoji}</div>
      <div class="own-card-label">
        <strong style="font-size:11px">${s.title}</strong>
        <span class="own-card-sub">📖 Clásico</span>
      </div>
    </div>`).join('');

  // Sección cuentos OWN
  const ownEl = document.getElementById('kidOwnClassicStories');
  if(ownEl) {
    ownEl.style.cssText='display:flex;gap:12px;padding:0 16px 16px;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch';
    ownEl.innerHTML=`
      <div style="flex-shrink:0;width:150px;border-radius:20px;overflow:hidden;border:2.5px solid #C9A84C;box-shadow:0 4px 14px rgba(0,0,0,0.1);background:#FFF8E7;opacity:0.6">
        <div style="width:150px;height:150px;display:flex;align-items:center;justify-content:center;font-size:48px;flex-direction:column;gap:4px;background:rgba(201,168,76,0.1)">
          <span>🔒</span>
          <span style="font-size:11px;color:#C9A84C;font-family:'Fredoka One',cursive">Próximamente</span>
        </div>
        <div style="padding:8px 10px 10px;background:rgba(255,255,255,0.85)">
          <div style="font-family:'Fredoka One',cursive;font-size:12px;color:#5C4033">Cuentos OWN</div>
          <div style="font-size:9px;color:#9B7B6B">✨ Especiales</div>
        </div>
      </div>`;
  }
}

async function openKidStory(id) {
  const story=await dbGet('stories',id);
  if(!story) { showToast('❌ No se encontró el cuento'); return; }
  appState.currentStory=story;
  appState.kidImages=story.images||[];

  // Check if this is a new story the kid is opening for first time
  const openedStories = JSON.parse(localStorage.getItem('ownKidOpenedStories')||'[]');
  const isFirstOpen = !openedStories.includes(id);
  if(isFirstOpen) {
    openedStories.push(id);
    localStorage.setItem('ownKidOpenedStories', JSON.stringify(openedStories));
    setTimeout(()=>showKidReceiveCelebration(story.title||'Cuento'), 500);
    // Notify parent that kid read the story
    const kidName = appState.kidName || 'Tu hijo';
    notifyParent(`✅ ${kidName} leyó "${story.title||'el cuento'}"`);
    updateParentNotifBadge();
  }

  document.getElementById('kidStoryTitle').textContent=story.title||'Cuento';
  const rb=document.getElementById('kidReactionBtns'); if(rb) rb.style.display='flex';
  const rs=document.getElementById('kidReactionSent'); if(rs) rs.style.display='none';

  // Diagnostic — visible in browser console (F12 or Chrome DevTools)
  console.log('📖 Abriendo cuento id:', id, '| hasAudio flag:', story.hasAudio);

  // Reset player state
  if(appState.kidAudio){ appState.kidAudio.pause(); appState.kidAudio=null; }
  appState.kidIsPlaying=false;
  const pb2=document.getElementById('kidPlayBtn'); if(pb2) pb2.textContent='▶';
  const pr=document.getElementById('kidProgress'); if(pr) pr.style.width='0%';
  const td0=document.getElementById('kidTimeDisplay'); if(td0) td0.textContent='0:00';

  const audioData=await dbGetAudio(id);
  console.log('🎵 Audio local:', audioData ? 'ENCONTRADO' : 'NO ENCONTRADO');

  if(audioData&&audioData.blob&&audioData.blob.size>0) {
    // Audio encontrado localmente
    loadKidAudioFromBlob(audioData.blob);
  } else if(story.hasAudio && story.audioFile && supa) {
    // No está local — buscar en Supabase Storage
    const td=document.getElementById('kidTimeDisplay'); if(td) td.textContent='⏳ Cargando...';
    console.log('📥 Descargando audio desde Supabase:', story.audioFile);
    try {
      const url = await supaGetAudioUrl(story.audioFile);
      if(url) {
        const audio=new Audio();
        audio.preload='auto'; audio.src=url; audio.load();
        audio.onloadedmetadata=()=>{
          const t=document.getElementById('kidTimeDisplay');
          if(t) t.textContent='0:00 / '+formatTime(audio.duration||0);
          console.log('✅ Audio Supabase listo:', audio.duration, 's');
        };
        audio.ontimeupdate=()=>{
          const p=document.getElementById('kidProgress');
          if(p&&audio.duration) p.style.width=(audio.currentTime/audio.duration*100)+'%';
          const t=document.getElementById('kidTimeDisplay');
          if(t) t.textContent=formatTime(audio.currentTime)+' / '+formatTime(audio.duration||0);
        };
        audio.onended=()=>{
          const b=document.getElementById('kidPlayBtn'); if(b) b.style.cssText=`width:72px;height:72px;${kidSpriteBg('btn_play_big',72)}`;
          appState.kidIsPlaying=false;
          updateKidProgress('storiesListened');
        };
        audio.onerror=()=>{ const t=document.getElementById('kidTimeDisplay'); if(t) t.textContent='Error de audio'; };
        appState.kidAudio=audio;
      } else {
        const td=document.getElementById('kidTimeDisplay'); if(td) td.textContent='Sin audio';
      }
    } catch(e) {
      console.error('Error cargando audio Supabase:', e);
      const td=document.getElementById('kidTimeDisplay'); if(td) td.textContent='Sin audio';
    }
  } else {
    appState.kidAudio=null;
    const td=document.getElementById('kidTimeDisplay');
    if(td) td.textContent=story.hasAudio?'Sin audio':'Sin audio grabado';
    if(story.hasAudio) console.warn('⚠️ hasAudio=true pero no se encontró audio');
  }

  buildKidSlideshow(appState.kidImages);
  buildKidVoiceRow();
  buildKidCharRow();
  buildKidImagesGrid();

  // Show story text if available
  const tc=document.getElementById('kidStoryTextCard');
  const tx=document.getElementById('kidStoryTextContent');
  if(story.storyText&&story.storyText.trim()&&tc&&tx){
    tx.textContent=story.storyText; tc.style.display='block';
  } else if(tc){ tc.style.display='none'; }

  switchKidTab('player');
  document.getElementById('kidVersionToggle').style.display='flex';
  document.getElementById('kidOwnRecordSteps').style.display='none';
  // Reset to parent version
  kidVersion='parent';
  document.getElementById('btnVerPadre').className='btn btn-accent btn-sm';
  document.getElementById('btnVerNino').className='btn btn-ghost btn-sm';
}

function openClassicStory(id) {
  const story=CLASSIC_STORIES.find(s=>s.id===id);
  if(!story) return;
  appState.currentStory={...story, isClassic:true};
  appState.kidImages=story.images||[];
  document.getElementById('kidStoryTitle').textContent=story.title;
  buildKidSlideshow(story.images);
  buildKidVoiceRow();
  buildKidCharRow();
  buildKidImagesGrid();
  // Classic: no version toggle, no own voice
  document.getElementById('kidVersionToggle').style.display='none';
  document.getElementById('kidParentVersion').style.display='block';
  document.getElementById('kidOwnRecordSteps').style.display='none';
  // Use TTS for classic story
  if(appState.kidAudio){ appState.kidAudio.pause(); appState.kidAudio=null; }
  appState.kidIsPlaying=false;
  const pb=document.getElementById('kidPlayBtn'); if(pb) pb.style.cssText=`width:72px;height:72px;${kidSpriteBg('btn_play_big',72)}`;
  switchKidTab('player');
  updateKidProgress('classicsListened');
  updateKidProgress('storiesListened');
  setTimeout(()=>{ if(story.quiz) offerQuizForStory(story); }, 500);
}

function offerQuizForStory(story) {
  showToast(`🧠 ¿Querés hacer el quiz de "${story.title}"? ¡Ganá estrellas!`);
}

function openDailyStory() {
  const today=new Date().getDay();
  const story=CLASSIC_STORIES[today%CLASSIC_STORIES.length];
  document.getElementById('dailyStoryLabel').textContent=story.title;
  openClassicStory(story.id);
}

function openBedtimeMode() {
  showToast('🌙 Modo hora de dormir: seleccioná un cuento tranquilo');
  switchKidTab('home');
  // Could filter stories by type in future
}

// Kid version toggle
let kidVersion='parent';
function switchKidVersion(v) {
  kidVersion=v;
  document.getElementById('btnVerPadre').className='btn btn-'+(v==='parent'?'accent':'ghost')+' btn-sm';
  document.getElementById('btnVerNino').className='btn btn-'+(v==='kid'?'accent':'ghost')+' btn-sm';
  document.getElementById('kidParentVersion').style.display=v==='parent'?'block':'none';
  document.getElementById('kidOwnRecordSteps').style.display=v==='kid'?'block':'none';
  if(v==='kid') {
    goKidRecStep(1);
    buildKidVoiceRow2();
    buildKidCharRow();
    // Build slideshow in step 3 from current images
    if(appState.kidImages&&appState.kidImages.length) buildKidRecSlideshow2(appState.kidImages);
  }
}

// Kid step navigation
let currentKidRecStep=1;
function goKidRecStep(n) {
  currentKidRecStep=n;
  [1,2,3,4].forEach(i=>{
    const s=document.getElementById('kidRecStep-'+i); if(s) s.style.display=i===n?'block':'none';
    const t=document.getElementById('krstab-'+i);
    if(t){ t.classList.toggle('active',i===n); t.classList.toggle('done',i<n); }
  });
  if(n===4) updateKidSendSummary();
  const c=document.getElementById('kidContent'); if(c) c.scrollTo(0,0);
}

function updateKidSendSummary() {
  const title=appState.currentStory?.title||'Mi cuento';
  const charEl=document.getElementById('kidSendSummaryChar'); if(charEl) charEl.textContent=appState.kidChar||'🐉';
  const titleEl=document.getElementById('kidSendSummaryTitle'); if(titleEl) titleEl.textContent=title;
  const infoEl=document.getElementById('kidSendSummaryInfo');
  if(infoEl) infoEl.textContent=appState.kidOwnAudioBlob?`✅ Audio grabado · ${appState.kidImages?.length||0} imágenes`:'⚠️ Aún sin audio — volvé al paso 3';
}

// Kid recording slideshow (step 3)
let kidRecSlide2Idx=0, kidRecSlide2Imgs=[];
function buildKidRecSlideshow2(imgs) {
  kidRecSlide2Imgs=imgs||[]; kidRecSlide2Idx=0;
  const ss=document.getElementById('kidRecSlideshow');
  const ph=document.getElementById('kidRecSlidePh');
  const dots=document.getElementById('kidRecSlideDots');
  if(!ss||!kidRecSlide2Imgs.length) return;
  if(ph) ph.style.display='none';
  ss.querySelectorAll('.slideshow-img').forEach(e=>e.remove());
  kidRecSlide2Imgs.forEach((url,i)=>{
    const img=document.createElement('img');
    img.className='slideshow-img'+(i===0?' active':'');
    img.src=url;
    ss.insertBefore(img,ss.querySelector('.slide-nav-btn'));
  });
  if(dots) dots.innerHTML=kidRecSlide2Imgs.map((_,i)=>`<button class="slide-dot ${i===0?'active':''}" onclick="goKidRecSlide2(${i})"></button>`).join('');
}
function slideKidRec(dir) {
  if(!kidRecSlide2Imgs.length) return;
  kidRecSlide2Idx=(kidRecSlide2Idx+dir+kidRecSlide2Imgs.length)%kidRecSlide2Imgs.length;
  goKidRecSlide2(kidRecSlide2Idx);
}
function goKidRecSlide2(idx) {
  kidRecSlide2Idx=idx;
  document.querySelectorAll('#kidRecSlideshow .slideshow-img').forEach((img,i)=>img.classList.toggle('active',i===idx));
  document.querySelectorAll('#kidRecSlideDots .slide-dot').forEach((d,i)=>d.classList.toggle('active',i===idx));
}

function buildKidVoiceRow2() {
  const el=document.getElementById('kidVoiceRow2'); if(!el) return;
  el.innerHTML=VOICES.map(v=>`<button class="kid-voice-btn ${v.id===(appState.kidVoice||'normal')?'active':''}" onclick="selectKidVoice('${v.id}');document.querySelectorAll('#kidVoiceRow2 .kid-voice-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active')">${v.label}</button>`).join('');
}

function buildKidSlideshow(images) {
  const container=document.getElementById('kidSlideshow');
  const placeholder=document.getElementById('slidePlaceholder');
  document.querySelectorAll('#kidSlideshow .slideshow-img').forEach(el=>el.remove());
  if(!images||!images.length) { if(placeholder) placeholder.style.display='flex'; return; }
  if(placeholder) placeholder.style.display='none';
  images.forEach((url,i)=>{
    const img=document.createElement('img');
    img.className='slideshow-img'+(i===0?' active':'');
    img.src=url;
    container.appendChild(img);
  });
  appState.kidSlideIndex=0;
  buildSlideshowDots(images.length);
  startSlideshow(images.length);
}

function buildSlideshowDots(n) {
  const el=document.getElementById('slideshowDots');
  el.innerHTML=Array.from({length:n},(_,i)=>`<button class="slide-dot ${i===0?'active':''}" onclick="goKidSlide(${i})"></button>`).join('');
}

function startSlideshow(n) {
  if(appState.kidSlideInterval) clearInterval(appState.kidSlideInterval);
  if(n<=1) return;
  appState.kidSlideInterval=setInterval(()=>slideKid(1),4000);
}

function slideKid(dir) {
  const imgs=document.querySelectorAll('#kidSlideshow .slideshow-img');
  if(!imgs.length) return;
  imgs[appState.kidSlideIndex].classList.remove('active');
  appState.kidSlideIndex=(appState.kidSlideIndex+dir+imgs.length)%imgs.length;
  imgs[appState.kidSlideIndex].classList.add('active');
  document.querySelectorAll('#slideshowDots .slide-dot').forEach((d,i)=>d.classList.toggle('active',i===appState.kidSlideIndex));
}

function goKidSlide(i) {
  const imgs=document.querySelectorAll('#kidSlideshow .slideshow-img');
  if(!imgs.length) return;
  imgs[appState.kidSlideIndex].classList.remove('active');
  appState.kidSlideIndex=i;
  imgs[i].classList.add('active');
  document.querySelectorAll('#slideshowDots .slide-dot').forEach((d,j)=>d.classList.toggle('active',j===i));
}

function buildKidImagesGrid() {
  const el=document.getElementById('kidImagesGrid');
  if(!el) return;
  if(!appState.kidImages||!appState.kidImages.length) { el.innerHTML='<div style="color:var(--text2);font-size:13px">Sin imágenes</div>'; return; }
  el.innerHTML=appState.kidImages.map((u,i)=>`<div class="grid-img-wrap ${i===0?'selected':''}"><img src="${u}" onclick="goKidSlide(${i})"></div>`).join('');
}

// Kid audio
function toggleKidPlay() {
  if(!appState.kidAudio) {
    if(appState.currentStory?.isClassic) speakText(appState.currentStory.text);
    else showToast('❌ Este cuento no tiene audio grabado');
    return;
  }
  if(appState.kidIsPlaying) {
    appState.kidAudio.pause();
    appState.kidIsPlaying=false;
    const btn=document.getElementById('kidPlayBtn'); if(btn) btn.textContent='▶';
  } else {
    appState.kidAudio.play()
      .then(()=>{
        appState.kidIsPlaying=true;
        const btn=document.getElementById('kidPlayBtn'); if(btn) btn.textContent='⏸';
      })
      .catch(e=>{
        appState.kidIsPlaying=false;
        console.error('kidPlay error',e);
        // iOS/Safari: try resuming AudioContext first
        if(e.name==='NotAllowedError'){
          showToast('Tocá la pantalla primero para permitir audio');
        } else {
          showToast('❌ Error reproduciendo: '+e.message);
        }
      });
  }
}

function speakText(text) {
  if(!window.speechSynthesis) { showToast('TTS no disponible en este navegador'); return; }
  window.speechSynthesis.cancel();
  const utter=new SpeechSynthesisUtterance(text);
  utter.lang='es-AR'; utter.rate=0.9;
  window.speechSynthesis.speak(utter);
  showToast('🔊 Reproduciendo cuento...');
}

function stopKidPlay() {
  if(appState.kidAudio) { appState.kidAudio.pause(); appState.kidIsPlaying=false; }
  if(window.speechSynthesis) window.speechSynthesis.cancel();
}

function updateKidProgress2() {
  const prog=document.getElementById('kidProgress');
  const td=document.getElementById('kidTimeDisplay');
  if(!appState.kidAudio) return;
  if(prog&&appState.kidAudio.duration) prog.style.width=(appState.kidAudio.currentTime/appState.kidAudio.duration*100)+'%';
  if(td) td.textContent=formatTime(appState.kidAudio.currentTime);
}

function seekKid(secs) {
  if(!appState.kidAudio) return;
  appState.kidAudio.currentTime=Math.max(0,appState.kidAudio.currentTime+secs);
}

function buildKidVoiceRow() {
  const el=document.getElementById('kidVoiceRow');
  if(!el) return;
  const prem=isPremium();
  el.innerHTML=VOICES.map(v=>{
    const locked=!v.free&&!prem;
    return `<button class="kid-voice-btn ${v.id===appState.kidVoice?'active':''}" onclick="${locked?`showToast('🔒 Premium')`:`selectKidVoice('${v.id}')`}">
      ${locked?'🔒 ':''}${v.label}
    </button>`;
  }).join('');
  const el2=document.getElementById('kidRecVoicePills');
  if(el2) el2.innerHTML=VOICES.map(v=>`<button class="voice-pill ${v.id===appState.kidVoice?'active':''}" onclick="selectKidVoice('${v.id}')">${v.label}</button>`).join('');
}

function selectKidVoice(id) {
  appState.kidVoice=id;
  buildKidVoiceRow();
}

function buildKidCharRow() {
  const el=document.getElementById('kidCharRow');
  if(!el) return;
  el.innerHTML=CHARACTERS.map(c=>`<button class="kid-char-btn ${c.emoji===appState.kidChar?'active':''}" onclick="selectKidChar('${c.emoji}')">${c.emoji}</button>`).join('');
}

function selectKidChar(e) { appState.kidChar=e; buildKidCharRow(); }

// Kid recording
let kidRecordingInterval=null;
async function toggleKidRecord() {
  if(appState.isKidRecording) { stopKidRecord(); return; }
  // CRITICAL: clear old blob before new recording
  appState.kidOwnAudioBlob = null;
  appState.kidOwnAudioMime = null;
  if(appState.kidRecAudio){ try{ appState.kidRecAudio.pause(); }catch(e){} appState.kidRecAudio=null; }
  appState.kidRecIsPlaying = false;
  const pb=document.getElementById('kidRecPlayback'); if(pb) pb.style.display='none';
  const pr=document.getElementById('kidRecProgress'); if(pr) pr.style.width='0%';
  try {
    const stream=await navigator.mediaDevices.getUserMedia({audio:true,video:false});
    appState.kidAudioChunks=[];
    const mimeType=MediaRecorder.isTypeSupported('audio/webm;codecs=opus')?'audio/webm;codecs=opus':
                   MediaRecorder.isTypeSupported('audio/webm')?'audio/webm':
                   MediaRecorder.isTypeSupported('audio/ogg')?'audio/ogg':'';
    appState.kidMediaRecorder=new MediaRecorder(stream, mimeType?{mimeType}:{});
    appState.kidMediaRecorder.ondataavailable=e=>{if(e.data&&e.data.size>0) appState.kidAudioChunks.push(e.data);};
    appState.kidMediaRecorder.onstop=()=>{
      stream.getTracks().forEach(t=>t.stop());
      if(!appState.kidAudioChunks.length){ showToast('❌ No se grabó audio'); return; }
      const blob=new Blob(appState.kidAudioChunks,{type:mimeType||'audio/webm'});
      appState.kidOwnAudioBlob=blob;
      appState.kidOwnAudioMime=mimeType||'audio/webm';
      const url=URL.createObjectURL(blob);
      if(appState.kidRecAudio){ appState.kidRecAudio.pause(); URL.revokeObjectURL(appState.kidRecAudio.src); appState.kidRecAudio=null; }
      const audio=new Audio();
      audio.preload='auto';
      audio.src=url;
      audio.load();
      audio.ontimeupdate=()=>{
        const p=document.getElementById('kidRecProgress');
        if(p&&audio.duration) p.style.width=(audio.currentTime/audio.duration*100)+'%';
        const td=document.getElementById('kidRecTimeDisplay');
        if(td) td.textContent=formatTime(audio.currentTime)+' / '+formatTime(audio.duration||0);
      };
      audio.onended=()=>{
        appState.kidRecIsPlaying=false;
        const btn=document.getElementById('kidRecPlayBtn'); if(btn) btn.textContent='▶';
      };
      audio.onerror=(e)=>console.error('Kid rec audio error',e);
      appState.kidRecAudio=audio;
      const pb=document.getElementById('kidRecPlayback'); if(pb) pb.style.display='block';
    };
    appState.kidMediaRecorder.start(100);
    appState.isKidRecording=true;
    appState.kidRecSeconds=0;
    const btn=document.getElementById('kidRecBtn');
    if(btn){
      btn.classList.add('recording');
      btn.style.background='linear-gradient(135deg,#ef4444,#dc2626)';
      btn.style.boxShadow='0 8px 32px rgba(239,68,68,.6)';
      btn.innerHTML='<span style="font-size:48px;line-height:1">⏹️</span><span style="font-size:16px;font-weight:900;margin-top:6px;font-family:Nunito,sans-serif">PARAR</span>';
    }
    const ks=document.getElementById('kidRecStatus'); if(ks) ks.textContent='🔴 Grabando... tocá PARAR cuando termines';
    clearInterval(kidRecordingInterval);
    kidRecordingInterval=setInterval(()=>{
      appState.kidRecSeconds=(appState.kidRecSeconds||0)+1;
      const kt=document.getElementById('kidRecTimer'); if(kt) kt.textContent=formatTime(appState.kidRecSeconds);
    },1000);
  } catch(e) { console.error(e); showToast('❌ No se pudo acceder al micrófono'); }
}

function stopKidRecord() {
  if(appState.kidMediaRecorder&&appState.isKidRecording){
    appState.kidMediaRecorder.stop(); appState.isKidRecording=false;
    clearInterval(kidRecordingInterval);
    const btn=document.getElementById('kidRecBtn');
    if(btn){
      btn.classList.remove('recording');
      btn.style.background='linear-gradient(135deg,var(--coral),#ff8e53)';
      btn.style.boxShadow='0 8px 32px rgba(255,107,107,.5)';
      btn.innerHTML='<span style="font-size:48px;line-height:1">🎙️</span><span style="font-size:16px;font-weight:900;margin-top:6px;font-family:Nunito,sans-serif">GRABAR</span>';
    }
    const ks=document.getElementById('kidRecStatus'); if(ks) ks.textContent='✅ ¡Listo! Escuchá tu cuento abajo';
  }
}

function toggleKidRecPlay() {
  if(!appState.kidRecAudio){ showToast('❌ No hay grabación'); return; }
  if(appState.kidRecIsPlaying){
    appState.kidRecAudio.pause(); appState.kidRecIsPlaying=false;
    const btn=document.getElementById('kidRecPlayBtn'); if(btn) btn.textContent='▶';
  } else {
    appState.kidRecAudio.play()
      .then(()=>{ appState.kidRecIsPlaying=true; const btn=document.getElementById('kidRecPlayBtn'); if(btn) btn.textContent='⏸'; })
      .catch(e=>{ showToast('❌ Error: '+e.message); console.error('kidRecPlay error',e); });
  }
}

function deleteKidRecording() {
  if(appState.kidRecAudio){ appState.kidRecAudio.pause(); appState.kidRecAudio=null; }
  appState.kidOwnAudioBlob=null; appState.kidRecIsPlaying=false;
  const pb=document.getElementById('kidRecPlayback'); if(pb) pb.style.display='none';
  const kt=document.getElementById('kidRecTimer'); if(kt) kt.textContent='0:00';
  const ks=document.getElementById('kidRecStatus'); if(ks) ks.textContent='Listo para grabar';
}

async function applyVoiceToKidRecording() {
  if(!appState.kidOwnAudioBlob){ showToast('❌ Grabá tu voz primero'); return; }
  const v=VOICES.find(v=>v.id===appState.kidVoice)||VOICES[0];
  if(v.id==='normal'){ showToast('Elegí una voz diferente primero'); return; }

  // Apply playbackRate directly on the audio element — reliable on all mobile browsers
  if(!appState.kidRecAudio) {
    const url=URL.createObjectURL(appState.kidOwnAudioBlob);
    const audio=new Audio(); audio.preload='auto'; audio.src=url; audio.load();
    audio.ontimeupdate=()=>{
      const p=document.getElementById('kidRecProgress');
      if(p&&audio.duration) p.style.width=(audio.currentTime/audio.duration*100)+'%';
      const td=document.getElementById('kidRecTimeDisplay');
      if(td) td.textContent=formatTime(audio.currentTime)+' / '+formatTime(audio.duration||0);
    };
    audio.onended=()=>{ appState.kidRecIsPlaying=false; const b=document.getElementById('kidRecPlayBtn'); if(b) b.textContent='▶'; };
    appState.kidRecAudio=audio;
  }

  appState.kidRecAudio.playbackRate = v.rate || 1;

  // Show playback section so user can hear the distorted voice
  const pb=document.getElementById('kidRecPlayback'); if(pb) pb.style.display='block';
  showToast(`✅ Voz "${v.label}" aplicada — tocá ▶ para escuchar`);

  // Auto-play so they hear it immediately
  appState.kidRecAudio.currentTime=0;
  appState.kidRecAudio.play()
    .then(()=>{ appState.kidRecIsPlaying=true; const b=document.getElementById('kidRecPlayBtn'); if(b) b.textContent='⏸'; })
    .catch(e=>{ console.warn('autoplay blocked:',e.message); });
}

async function saveKidVoice() {
  if(!appState.kidOwnAudioBlob){ showToast('❌ Grabá el audio primero'); return; }
  if(!appState.currentStory){ showToast('❌ No hay cuento seleccionado'); return; }
  if(appState.kidOwnAudioBlob.size===0){ showToast('❌ El audio está vacío, grabá de nuevo'); return; }
  try {
    const id='kid_'+appState.currentStory.id;
    console.log('💾 Guardando voz niño — id:',id,'tamaño:',appState.kidOwnAudioBlob.size,'tipo:',appState.kidOwnAudioBlob.type);
    await dbPutAudio(id, appState.kidOwnAudioBlob);
    console.log('✅ Guardado OK');
    showToast('💾 ¡Tu voz guardada!');
    const stars=5; appState.stars+=stars; localStorage.setItem('ownStars',appState.stars); updateStarDisplay();
  } catch(err) {
    const msg = err?.message || err?.name || String(err);
    console.error('saveKidVoice REAL error:', msg, err);
    showToast('❌ ' + msg);
  }
}

async function sendKidVoiceToParent() {
  if(!appState.kidOwnAudioBlob){ showToast('❌ Grabá tu voz primero'); return; }
  if(appState.kidOwnAudioBlob.size===0){ showToast('❌ El audio está vacío'); return; }
  try {
    const id='kidvoice_'+Date.now();
    console.log('📤 Enviando voz al padre — id:',id,'tamaño:',appState.kidOwnAudioBlob.size,'tipo:',appState.kidOwnAudioBlob.type);
    await dbPutAudio(id, appState.kidOwnAudioBlob);
    console.log('✅ Audio guardado en DB OK');

    const imgs=appState.kidImages||[];
    const msgs=JSON.parse(localStorage.getItem('ownKidMessages')||'[]');
    msgs.unshift({
      id,
      title:'🎙️ Mi versión de: '+(appState.currentStory?.title||'un cuento'),
      text:'', images:imgs, audioKey:id,
      date:new Date().toLocaleDateString('es-AR'), isVoice:true,
      voiceLabel: VOICES.find(v=>v.id===appState.kidVoice)?.label||'Normal'
    });
    localStorage.setItem('ownKidMessages',JSON.stringify(msgs.slice(0,20)));
    notifyParent('🎙️ '+appState.kidName+' grabó su versión del cuento!');

    // Sincronizar con Supabase en segundo plano
    const familiaId = getFamiliaId();
    if(supa && familiaId) {
      const filename = `${familiaId}/${id}.webm`;
      supaUploadAudio(appState.kidOwnAudioBlob, filename)
        .then(f => {
          if(f) return supaSaveMensaje({
            id, familia_id: familiaId,
            titulo: '🎙️ Mi versión de: '+(appState.currentStory?.title||'un cuento'),
            imagenes: imgs, tiene_audio: true, tipo: 'voz',
          });
        })
        .then(() => console.log('✅ Mensaje niño en Supabase'))
        .catch(e => console.warn('Mensaje Supabase (no crítico):', e));
    }
    showToast('🚀 ¡Enviado a papá/mamá! +5⭐');
    const stars=5; appState.stars+=stars; localStorage.setItem('ownStars',appState.stars); updateStarDisplay();
    appState.kidOwnAudioBlob=null; appState.kidRecAudio=null; appState.kidRecIsPlaying=false;
    const pb=document.getElementById('kidRecPlayback'); if(pb) pb.style.display='none';
    const kt=document.getElementById('kidRecTimer'); if(kt) kt.textContent='0:00';
    const ks=document.getElementById('kidRecStatus'); if(ks) ks.textContent='¡Tocá para grabar!';
    const pr=document.getElementById('kidRecProgress'); if(pr) pr.style.width='0%';
    goKidRecStep(1);
  } catch(err) {
    const msg = err?.message || err?.name || String(err);
    console.error('sendKidVoiceToParent REAL error:', msg, err);
    showToast('❌ ' + msg);
  }
}

// ===================== KID DRAW TAB =====================
let kidDrawSequence = [null,null,null,null,null]; // slots 0-4
let kidDrawCurrentSlot = 0; // current slot being edited (0-based)
let kidDrawRecState = { isRecording:false, mediaRecorder:null, audioChunks:[], recordedBlob:null, recAudio:null, recIsPlaying:false, recordSeconds:0, recInterval:null };
let kidDrawSlideState = { idx:0, imgs:[] };
let kidDrawInited = false;

function initKidDraw() {
  // CRITICAL: reset draw recording state completely — independent from story recording
  if(kidDrawRecState.isRecording) {
    try { kidDrawRecState.mediaRecorder?.stop(); } catch(e){}
    try { kidDrawRecState.stream?.getTracks().forEach(t=>t.stop()); } catch(e){}
  }
  clearInterval(kidDrawRecState.recInterval);
  if(kidDrawRecState.recAudio){ try{ kidDrawRecState.recAudio.pause(); }catch(e){} }
  if(kidDrawRecState.recAudioUrl){ try{ URL.revokeObjectURL(kidDrawRecState.recAudioUrl); }catch(e){} }
  kidDrawRecState = { isRecording:false, mediaRecorder:null, audioChunks:[], recordedBlob:null, recAudio:null, recIsPlaying:false, recordSeconds:0, recInterval:null, recAudioUrl:null, stream:null };
  // Reset UI
  const btn=document.getElementById('kidDrawRecBtn'); if(btn){ btn.classList.remove('recording'); btn.innerHTML='<span style="font-size:36px">🎙️</span><span style="font-size:14px;font-weight:800;display:block;margin-top:4px">GRABAR</span>'; }
  const pb=document.getElementById('kidDrawRecPlayback'); if(pb) pb.style.display='none';
  const t=document.getElementById('kidDrawRecTimer'); if(t) t.textContent='0:00';
  const s=document.getElementById('kidDrawRecStatus'); if(s) s.textContent='Tocá para grabar tu voz';
  if(!kidDrawInited) { initCanvas(); kidDrawInited=true; }
  updateKidDrawSlots();
  updateKidDrawSlotLabel();
}

function saveKidDrawingToSequence() {
  const canvas=document.getElementById('drawCanvas');
  if(!canvas){ showToast('❌ No hay canvas'); return; }
  const ctx=canvas.getContext('2d');
  // Create a temp canvas with background color
  const tempCanvas=document.createElement('canvas');
  tempCanvas.width=canvas.width; tempCanvas.height=canvas.height;
  const tempCtx=tempCanvas.getContext('2d');
  tempCtx.fillStyle=canvasBg||'#ffffff';
  tempCtx.fillRect(0,0,tempCanvas.width,tempCanvas.height);
  tempCtx.drawImage(canvas,0,0);
  const url=tempCanvas.toDataURL('image/png');
  // Check has content
  const d=ctx.getImageData(0,0,canvas.width,canvas.height).data;
  const hasContent=Array.from({length:Math.min(d.length,2000)}).some((_,i)=>i%4!==3&&d[i]<200);
  if(!hasContent){ showToast('❌ Dibujá algo primero'); return; }
  kidDrawSequence[kidDrawCurrentSlot]=url;
  updateKidDrawSlots();
  const nextEmpty=kidDrawSequence.findIndex((s,i)=>i>kidDrawCurrentSlot&&s===null);
  if(nextEmpty!==-1) kidDrawCurrentSlot=nextEmpty;
  else { const anyEmpty=kidDrawSequence.findIndex(s=>s===null); if(anyEmpty!==-1) kidDrawCurrentSlot=anyEmpty; }
  updateKidDrawSlotLabel();
  clearCanvas();
  const stars=2; appState.stars+=stars; localStorage.setItem('ownStars',appState.stars); updateStarDisplay();
  showToast(`🎨 Dibujo guardado! +${stars}⭐`);
}

function updateKidDrawSlots() {
  [0,1,2,3,4].forEach(i=>{
    const el=document.getElementById('kidDrawSlot'+(i+1));
    if(!el) return;
    const url=kidDrawSequence[i];
    if(url) {
      el.innerHTML=`<img src="${url}" style="width:100%;height:100%;object-fit:cover;border-radius:8px"><button onclick="event.stopPropagation();removeKidDrawSlot(${i})" style="position:absolute;top:2px;right:2px;width:18px;height:18px;border-radius:50%;background:rgba(239,68,68,0.9);border:none;color:white;font-size:11px;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:2">✕</button>`;
      el.style.border=i===kidDrawCurrentSlot?'2px solid var(--accent)':'2px solid rgba(52,211,153,0.5)';
    } else {
      el.innerHTML=`<span style="font-size:22px;color:var(--text2)">${i+1}</span>`;
      el.style.border=i===kidDrawCurrentSlot?'2px solid var(--accent)':'2px dashed rgba(167,139,250,0.3)';
    }
  });
}

function selectKidDrawSlot(slotNum) { // 1-based
  kidDrawCurrentSlot=slotNum-1;
  updateKidDrawSlots();
  updateKidDrawSlotLabel();
  clearCanvas();
  // If slot has content, load it for editing
  if(kidDrawSequence[kidDrawCurrentSlot]) {
    const img=new Image();
    img.onload=()=>{ const ctx=document.getElementById('drawCanvas').getContext('2d'); ctx.drawImage(img,0,0,320,240); };
    img.src=kidDrawSequence[kidDrawCurrentSlot];
  }
}

function removeKidDrawSlot(idx) {
  kidDrawSequence[idx]=null;
  updateKidDrawSlots();
  kidDrawCurrentSlot=idx;
  updateKidDrawSlotLabel();
  clearCanvas();
}

function updateKidDrawSlotLabel() {
  const el=document.getElementById('kidDrawSlotLabel');
  if(el) el.textContent=kidDrawCurrentSlot+1;
}

function clearKidDrawSequence() {
  kidDrawSequence=[null,null,null,null,null];
  kidDrawCurrentSlot=0;
  updateKidDrawSlots();
  updateKidDrawSlotLabel();
  clearCanvas();
  showToast('🗑 Secuencia borrada');
}

function playKidDrawSequence() {
  const imgs=kidDrawSequence.filter(Boolean);
  if(!imgs.length){ showToast('❌ Hacé al menos un dibujo primero'); return; }
  kidDrawSlideState={idx:0,imgs};
  const pa=document.getElementById('kidDrawPlayArea'); if(pa) pa.style.display='block';
  const ss=document.getElementById('kidDrawSlideshow');
  const dots=document.getElementById('kidDrawSlideDots');
  if(!ss) return;
  ss.querySelectorAll('.slideshow-img').forEach(e=>e.remove());
  imgs.forEach((url,i)=>{
    const img=document.createElement('img');
    img.className='slideshow-img'+(i===0?' active':'');
    img.src=url;
    ss.insertBefore(img,ss.querySelector('.slide-nav-btn'));
  });
  if(dots) dots.innerHTML=imgs.map((_,i)=>`<button class="slide-dot ${i===0?'active':''}" onclick="goKidDrawSlide(${i})"></button>`).join('');
  // Scroll to play area
  pa?.scrollIntoView({behavior:'smooth'});
}
function slideKidDraw(dir) {
  const imgs=kidDrawSlideState.imgs;
  if(!imgs.length) return;
  kidDrawSlideState.idx=(kidDrawSlideState.idx+dir+imgs.length)%imgs.length;
  goKidDrawSlide(kidDrawSlideState.idx);
}
function goKidDrawSlide(idx) {
  kidDrawSlideState.idx=idx;
  document.querySelectorAll('#kidDrawSlideshow .slideshow-img').forEach((img,i)=>img.classList.toggle('active',i===idx));
  document.querySelectorAll('#kidDrawSlideDots .slide-dot').forEach((d,i)=>d.classList.toggle('active',i===idx));
}

// Draw tab recording
async function toggleKidDrawRecord() {
  if(kidDrawRecState.isRecording){ stopKidDrawRecord(); return; }
  try {
    const stream=await navigator.mediaDevices.getUserMedia({audio:true,video:false});
    kidDrawRecState.audioChunks=[];
    const mimeType=MediaRecorder.isTypeSupported('audio/webm;codecs=opus')?'audio/webm;codecs=opus':MediaRecorder.isTypeSupported('audio/webm')?'audio/webm':'';
    kidDrawRecState.mediaRecorder=new MediaRecorder(stream,mimeType?{mimeType}:{});
    kidDrawRecState.mediaRecorder.ondataavailable=e=>{if(e.data&&e.data.size>0) kidDrawRecState.audioChunks.push(e.data);};
    kidDrawRecState.mediaRecorder.onstop=()=>{
      stream.getTracks().forEach(t=>t.stop());
      if(!kidDrawRecState.audioChunks.length){showToast('❌ No se grabó audio');return;}
      const blob=new Blob(kidDrawRecState.audioChunks,{type:mimeType||'audio/webm'});
      kidDrawRecState.recordedBlob=blob;
      if(kidDrawRecState.recAudioUrl){ try{ URL.revokeObjectURL(kidDrawRecState.recAudioUrl); }catch(e){} }
      const url=URL.createObjectURL(blob);
      kidDrawRecState.recAudioUrl=url;
      if(kidDrawRecState.recAudio){kidDrawRecState.recAudio.pause();kidDrawRecState.recAudio=null;}
      const audio=new Audio();
      audio.preload='auto'; audio.src=url; audio.load();
      audio.onloadedmetadata=()=>{
        const t=document.getElementById('kidDrawTime'); if(t) t.textContent='0:00 / '+formatTime(audio.duration||0);
      };
      audio.ontimeupdate=()=>{
        const p=document.getElementById('kidDrawProgress'); if(p&&audio.duration) p.style.width=(audio.currentTime/audio.duration*100)+'%';
        const t=document.getElementById('kidDrawTime'); if(t) t.textContent=formatTime(audio.currentTime)+' / '+formatTime(audio.duration||0);
      };
      audio.onended=()=>{kidDrawRecState.recIsPlaying=false; const b=document.getElementById('kidDrawPlayBtn'); if(b) b.textContent='▶';};
      audio.onerror=()=>{ showToast('❌ Error cargando audio'); console.error('Draw rec error',audio.error); };
      kidDrawRecState.recAudio=audio;
      const pb=document.getElementById('kidDrawRecPlayback'); if(pb) pb.style.display='block';
    };
    kidDrawRecState.mediaRecorder.start(100);
    kidDrawRecState.isRecording=true; kidDrawRecState.recordSeconds=0;
    const btn=document.getElementById('kidDrawRecBtn');
    if(btn){
      btn.classList.add('recording');
      btn.style.background='linear-gradient(135deg,#ef4444,#dc2626)';
      btn.innerHTML='<span style="font-size:36px">⏹️</span><span style="font-size:13px;font-weight:800;display:block;margin-top:4px;font-family:Nunito,sans-serif">PARAR</span>';
    }
    const st=document.getElementById('kidDrawRecStatus'); if(st) st.textContent='🔴 Grabando... tocá PARAR cuando termines';
    clearInterval(kidDrawRecState.recInterval);
    kidDrawRecState.recInterval=setInterval(()=>{
      kidDrawRecState.recordSeconds++;
      const t=document.getElementById('kidDrawRecTimer'); if(t) t.textContent=formatTime(kidDrawRecState.recordSeconds);
    },1000);
  } catch(e){ console.error(e); showToast('❌ No se pudo acceder al micrófono'); }
}
function stopKidDrawRecord() {
  if(kidDrawRecState.mediaRecorder&&kidDrawRecState.isRecording){ kidDrawRecState.mediaRecorder.stop(); }
  clearInterval(kidDrawRecState.recInterval);
  kidDrawRecState.isRecording=false;
  const btn=document.getElementById('kidDrawRecBtn');
  if(btn){
    btn.classList.remove('recording');
    btn.style.background='linear-gradient(135deg,var(--coral),#ff8e53)';
    btn.innerHTML='<span style="font-size:36px">🎙️</span><span style="font-size:13px;font-weight:800;display:block;margin-top:4px;font-family:Nunito,sans-serif">GRABAR</span>';
  }
  const st=document.getElementById('kidDrawRecStatus'); if(st) st.textContent='✅ ¡Listo! Escuchá tu voz abajo';
}
function toggleKidDrawPlay() {
  if(!kidDrawRecState.recAudio){showToast('❌ No hay grabación');return;}
  if(kidDrawRecState.recIsPlaying){
    kidDrawRecState.recAudio.pause(); kidDrawRecState.recIsPlaying=false;
    const b=document.getElementById('kidDrawPlayBtn'); if(b) b.textContent='▶';
  } else {
    kidDrawRecState.recAudio.play()
      .then(()=>{ kidDrawRecState.recIsPlaying=true; const b=document.getElementById('kidDrawPlayBtn'); if(b) b.textContent='⏸'; })
      .catch(e=>{ showToast('❌ '+e.message); console.error('kidDrawPlay error',e); });
  }
}
function deleteKidDrawRecording() {
  if(kidDrawRecState.recAudio){kidDrawRecState.recAudio.pause();kidDrawRecState.recAudio=null;}
  kidDrawRecState.recordedBlob=null; kidDrawRecState.isRecording=false;
  const pb=document.getElementById('kidDrawRecPlayback'); if(pb) pb.style.display='none';
  const t=document.getElementById('kidDrawRecTimer'); if(t) t.textContent='0:00';
  const s=document.getElementById('kidDrawRecStatus'); if(s) s.textContent='¡Tocá para grabar!';
}

async function sendKidDrawingsToParent() {
  const imgs=kidDrawSequence.filter(Boolean);
  if(!imgs.length){ showToast('❌ Hacé al menos un dibujo primero'); return; }
  try {
    const id='kiddraw_'+Date.now();
    let hasAudio=false;
    if(kidDrawRecState.recordedBlob&&kidDrawRecState.recordedBlob.size>0) {
      await dbPutAudio(id, kidDrawRecState.recordedBlob);
      console.log('✅ Audio dibujos guardado — id:',id,'tamaño:',kidDrawRecState.recordedBlob.size);
      hasAudio=true;
    }
    const msgs=JSON.parse(localStorage.getItem('ownKidMessages')||'[]');
    msgs.unshift({id, title:'🎨 Mis dibujos: '+imgs.length+' escenas', text:'', images:imgs, audioKey:hasAudio?id:null, date:new Date().toLocaleDateString('es-AR'), isDrawing:true});
    localStorage.setItem('ownKidMessages',JSON.stringify(msgs.slice(0,20)));
    notifyParent('🎨 '+appState.kidName+' mandó sus dibujos ('+imgs.length+' escenas)!');
    const stars=5+imgs.length; appState.stars+=stars; localStorage.setItem('ownStars',appState.stars); updateStarDisplay();
    rewardKidCoins(3, '¡Por mandar tus dibujos!');
    showToast('🚀 ¡Dibujos enviados a papá/mamá! +'+stars+'⭐');
    // Reset
    kidDrawSequence=[null,null,null,null,null]; kidDrawCurrentSlot=0;
    updateKidDrawSlots(); updateKidDrawSlotLabel(); clearCanvas();
    kidDrawRecState.recordedBlob=null; kidDrawRecState.recAudio=null;
    if(kidDrawRecState.recAudioUrl){ try{ URL.revokeObjectURL(kidDrawRecState.recAudioUrl); }catch(e){} kidDrawRecState.recAudioUrl=null; }
    const pb=document.getElementById('kidDrawRecPlayback'); if(pb) pb.style.display='none';
    const t=document.getElementById('kidDrawRecTimer'); if(t) t.textContent='0:00';
  } catch(err) {
    console.error('sendKidDrawingsToParent error:',err);
    showToast('❌ Error al enviar los dibujos. Intentá de nuevo.');
  }
}

// ===================== SEQUENCE BUILDER KID =====================
let kidSequenceData=[{},{},{},{},{}], kidSelectedCelebration='fiesta';
function buildKidSequenceScenes() {
  const el=document.getElementById('sequenceScenes');
  if(!el) return;
  el.innerHTML=kidSequenceData.map((scene,i)=>`
    <div class="seq-scene ${scene.char&&scene.action!==undefined?'complete':''}" id="kScene${i}">
      <div class="seq-scene-title">Escena ${i+1}</div>
      <div class="seq-char-row">${SEQ_CHARS.map(c=>`<button class="seq-char-pick ${scene.char===c?'active':''}" onclick="selectKidSeqChar(${i},'${c}')">${c}</button>`).join('')}</div>
      <div class="seq-actions">${SEQ_ACTIONS.map((a,j)=>`<button class="seq-action-btn ${scene.action===j?'active':''}" onclick="selectKidSeqAction(${i},${j})"><span class="seq-action-icon">${a.icon}</span>${a.label}</button>`).join('')}</div>
    </div>`).join('');
}

function selectKidSeqChar(i,c) { kidSequenceData[i].char=c; buildKidSequenceScenes(); }
function selectKidSeqAction(i,j) { kidSequenceData[i].action=j; buildKidSequenceScenes(); }
function selectCelebration(cel) {
  kidSelectedCelebration=cel;
  document.querySelectorAll('#celebrationPicker .seq-action-btn').forEach(b=>b.classList.toggle('active',b.dataset.cel===cel));
}

async function generateSequenceImages() {
  showLoading('Generando tus 5 escenas...');
  const prompts=kidSequenceData.map((s,i)=>{
    const c=s.char||'🐉', a=SEQ_ACTIONS[s.action||0];
    return `${c} ${a?a.label:''} scene ${i+1} children story`;
  });
  const imgs=[];
  for(const p of prompts) { imgs.push(await generateImageWithFallback(p)); await new Promise(r=>setTimeout(r,300)); }
  buildKidSlideshow(imgs);
  buildKidRecSlideshow2(imgs);
  hideLoading();
  showToast('✅ ¡Tus 5 escenas generadas!');
  updateKidProgress('gamesPlayed');
}

// ===================== ACHIEVEMENTS =====================
function buildKidAchievements() {
  const el=document.getElementById('kidAchievements');
  if(!el) return;
  const p=getKidProgress();
  const s={...p, stars:appState.stars};
  const earned=JSON.parse(localStorage.getItem('ownEarnedAchievements')||'[]');
  el.innerHTML=ACHIEVEMENTS.map(a=>{
    const unlocked=earned.includes(a.id)||a.req(s);
    return `<div class="achievement-card ${unlocked?'':'locked'}">
      <div class="achievement-icon">${a.icon}</div>
      <div class="achievement-info">
        <div class="achievement-name">${a.name}</div>
        <div class="achievement-desc">${a.desc}</div>
        ${unlocked?'<div class="achievement-earned">✅ Desbloqueado</div>':''}
      </div>
    </div>`;
  }).join('');
}

// ===================== GAMES / PLAYGROUND =====================
let currentGame=null;
function openKidGame(gameId) {
  const area = document.getElementById('kidGameArea');
  const title = document.getElementById('kidGameTitle');
  if(!area) return;
  const names = {quiz:'🧠 Quiz de Cuentos', memory:'🃏 Memoria', words:'🔤 Palabras Mágicas', puzzle:'🧩 Puzzle'};
  if(title) title.textContent = names[gameId]||'🎮 Juego';
  // Ocultar todos
  ['quiz','memory','words','draw','puzzle'].forEach(g=>{
    const el=document.getElementById('gameArea-'+g);
    if(el){el.style.display='none';el.classList.remove('active');}
  });
  // Mostrar el activo
  const active=document.getElementById('gameArea-'+gameId);
  if(active){active.style.display='block';active.classList.add('active');active.innerHTML='';}
  area.style.display='block';
  currentGame=gameId;
  updateKidProgress('gamesPlayed');
  if(gameId==='quiz') buildQuizGame();
  else if(gameId==='memory') buildMemoryGame();
  else if(gameId==='words') buildWordsGame();
  else if(gameId==='puzzle') buildPuzzleGame();
  setTimeout(()=>area.scrollIntoView({behavior:'smooth',block:'start'}),150);
}

function closeKidGame() {
  const area=document.getElementById('kidGameArea');
  if(area) area.style.display='none';
  ['quiz','memory','words','draw','puzzle'].forEach(g=>{
    const el=document.getElementById('gameArea-'+g);
    if(el){el.style.display='none';el.classList.remove('active');}
  });
}

function openGame(gameId) {
  document.querySelectorAll('.game-card').forEach(c=>c.classList.remove('active-game'));
  document.querySelectorAll('.game-area').forEach(a=>a.classList.remove('active'));
  const area=document.getElementById('gameArea-'+gameId);
  if(area) area.classList.add('active');
  currentGame=gameId;
  updateKidProgress('gamesPlayed');
  if(gameId==='quiz') buildQuizGame();
  else if(gameId==='memory') buildMemoryGame();
  else if(gameId==='words') buildWordsGame();
  else if(gameId==='draw') buildDrawGame();
  else if(gameId==='puzzle') buildPuzzleGame();
}

// Quiz game
let quizData=null, quizIdx=0, quizScore=0, quizAnswers=[];
function buildQuizGame() {
  const el=document.getElementById('gameArea-quiz');
  const story=CLASSIC_STORIES[Math.floor(Math.random()*CLASSIC_STORIES.length)];
  // Shuffle questions
  const shuffled=[...story.quiz].sort(()=>Math.random()-0.5);
  quizData=shuffled; quizIdx=0; quizScore=0; quizAnswers=[];
  el.innerHTML=`
    <div style="font-family:'Baloo 2',cursive;font-size:20px;margin-bottom:4px;color:var(--accent2)">🧠 ${story.title}</div>
    <div style="font-size:12px;color:var(--text2);margin-bottom:12px">Respondé todas las preguntas y al final ves los resultados</div>
    <div id="quizContent"></div>`;
  renderQuizQuestion();
}

function renderQuizQuestion() {
  const el=document.getElementById('quizContent');
  if(!el||!quizData) return;
  if(quizIdx>=quizData.length) { showQuizResults(); return; }
  const q=quizData[quizIdx];
  // Shuffle options but track correct answer
  const opts=q.opts.map((text,i)=>({text,origIdx:i})).sort(()=>Math.random()-0.5);
  const shuffledCorrect=opts.findIndex(o=>o.origIdx===q.correct);
  el.innerHTML=`
    <div style="background:rgba(167,139,250,0.1);border-radius:12px;padding:12px;margin-bottom:12px">
      <div style="font-size:11px;color:var(--text2);margin-bottom:6px">Pregunta ${quizIdx+1} de ${quizData.length}</div>
      <div style="font-size:16px;font-weight:800;line-height:1.4;font-family:'Baloo 2',cursive">${q.q}</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:10px">
      ${opts.map((opt,i)=>`
        <button class="quiz-option" id="qOpt${i}" onclick="answerQuiz(${i},${shuffledCorrect},this)" style="font-size:15px;padding:16px;border-radius:14px;text-align:left;font-weight:700">
          <span style="display:inline-block;width:28px;height:28px;border-radius:50%;background:rgba(167,139,250,0.2);text-align:center;line-height:28px;font-size:13px;margin-right:8px;font-family:Nunito,sans-serif">${['A','B','C','D'][i]}</span>
          ${opt.text}
        </button>`).join('')}
    </div>`;
}

function answerQuiz(chosen, correct, btn) {
  // Disable all options immediately
  document.querySelectorAll('.quiz-option').forEach(b=>b.disabled=true);
  const isCorrect=chosen===correct;
  if(isCorrect) quizScore++;
  // Record answer for review
  quizAnswers.push({q:quizData[quizIdx].q, chosen, correct, isCorrect,
    chosenText: btn?.textContent?.trim()||'', correctText: document.getElementById('qOpt'+correct)?.textContent?.trim()||''});
  // Brief visual only (no toast/result yet)
  document.getElementById('qOpt'+correct)?.classList.add('correct');
  if(!isCorrect) btn?.classList.add('wrong');
  setTimeout(()=>{ quizIdx++; renderQuizQuestion(); }, 900);
}

function showQuizResults() {
  const el=document.getElementById('quizContent');
  if(!el) return;
  const pct=Math.round(quizScore/quizData.length*100);
  const stars=quizScore===quizData.length?10:quizScore>quizData.length/2?5:2;
  appState.stars+=stars; localStorage.setItem('ownStars',appState.stars);
  updateStarDisplay();
  updateKidProgress('quizDone');
  if(quizScore===quizData.length){ updateKidProgress('perfectQuiz'); checkAchievements(); }

  const reviewHTML=quizAnswers.map((a,i)=>`
    <div style="background:${a.isCorrect?'rgba(52,211,153,0.1)':'rgba(239,68,68,0.08)'};border-radius:12px;padding:12px;margin-bottom:8px;border-left:4px solid ${a.isCorrect?'var(--accent3)':'#f87171'}">
      <div style="font-size:12px;font-weight:800;color:${a.isCorrect?'var(--accent3)':'#f87171'};margin-bottom:4px">${a.isCorrect?'✅ Correcto':'❌ Incorrecto'} — Pregunta ${i+1}</div>
      <div style="font-size:13px;font-weight:700;margin-bottom:4px">${a.q}</div>
      ${!a.isCorrect?`<div style="font-size:12px;color:var(--text2)">Tu respuesta: <span style="color:#f87171">${a.chosenText.replace(/^[ABCD]\s*/,'').substring(0,50)}</span></div>
      <div style="font-size:12px;color:var(--accent3)">Correcta: <span style="font-weight:800">${a.correctText.replace(/^[ABCD]\s*/,'').substring(0,50)}</span></div>`:''}
    </div>`).join('');

  el.innerHTML=`
    <div style="text-align:center;margin-bottom:16px">
      <div style="font-size:56px;margin-bottom:8px">${pct===100?'🏆':pct>=50?'⭐':'📖'}</div>
      <div style="font-family:'Baloo 2',cursive;font-size:24px;font-weight:800;margin-bottom:4px">${quizScore}/${quizData.length} correctas</div>
      <div style="font-size:14px;color:var(--text2);margin-bottom:8px">${pct===100?'¡Perfecto! ¡Sos un genio de los cuentos!':pct>=50?'¡Muy bien! Seguí practicando':'¡Seguí leyendo para aprender más!'}</div>
      <div style="font-size:18px;color:var(--gold);font-weight:800">+${stars} ⭐</div>
    </div>
    <div style="font-size:14px;font-weight:800;margin-bottom:10px">📋 Revisión:</div>
    ${reviewHTML}
    <button class="btn btn-accent btn-full" style="margin-top:12px" onclick="buildQuizGame()">🔄 Jugar de nuevo</button>`;
}

// Writing game (in-game quick write)
function buildWriteGame() {
  const el=document.getElementById('gameArea-write');
  el.innerHTML=`
    <div style="font-family:'Baloo 2',cursive;font-size:20px;margin-bottom:12px;color:var(--accent)">✍️ Escribir Historia</div>
    <div style="font-size:13px;color:var(--text2);margin-bottom:12px">Completá esta historia con tu imaginación:</div>
    <div style="background:rgba(167,139,250,0.1);border-radius:12px;padding:12px;margin-bottom:12px;font-size:14px;font-weight:700">
      "Érase una vez un/a <strong>${CHARACTERS[Math.floor(Math.random()*CHARACTERS.length)].emoji}</strong> que vivía en..."
    </div>
    <textarea id="gameWriteArea" rows="6" placeholder="Escribí lo que pasa a continuación..."></textarea>
    <button class="btn btn-accent btn-full" style="margin-top:10px" onclick="submitWriteGame()">✅ Terminar historia</button>`;
}

function submitWriteGame() {
  const text=document.getElementById('gameWriteArea').value.trim();
  if(text.length<20) { showToast('Escribí un poco más!'); return; }
  const stars=Math.min(10,Math.floor(text.length/30)+2);
  appState.stars+=stars; localStorage.setItem('ownStars',appState.stars);
  updateStarDisplay();
  updateKidProgress('writingsSaved');
  updateKidProgress('totalWritingChars',text.length);
  checkAchievements();
  document.getElementById('gameArea-write').innerHTML=`
    <div style="text-align:center;padding:20px">
      <div style="font-size:48px;margin-bottom:12px">🌟</div>
      <div style="font-family:'Baloo 2',cursive;font-size:22px;margin-bottom:8px">¡Excelente escritura!</div>
      <div style="color:var(--gold);font-weight:800;font-size:18px">+${stars} ⭐</div>
      <button class="btn btn-accent btn-sm" style="margin-top:12px" onclick="buildWriteGame()">Escribir otra historia</button>
    </div>`;
}

// Memory game
let memoryCards=[], memoryFlipped=[], memoryMatched=0, memoryMoves=0;
function buildMemoryGame() {
  const el=document.getElementById('gameArea-memory');
  const emojis=['🐉','🧚','🦁','🐬','🦊','🤖'];
  const pairs=[...emojis,...emojis].sort(()=>Math.random()-0.5);
  memoryCards=pairs.map((e,i)=>({id:i,emoji:e,flipped:false,matched:false}));
  memoryFlipped=[]; memoryMatched=0; memoryMoves=0;
  el.innerHTML=`
    <div style="font-family:'Baloo 2',cursive;font-size:20px;margin-bottom:8px;color:var(--accent3)">🃏 Memoria</div>
    <div style="font-size:13px;color:var(--text2);margin-bottom:12px">Encontrá todas las parejas</div>
    <div id="memBoard" style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px"></div>`;
  renderMemoryBoard();
}

function renderMemoryBoard() {
  const el=document.getElementById('memBoard');
  if(!el) return;
  el.innerHTML=memoryCards.map((c,i)=>`
    <button onclick="flipCard(${i})" style="aspect-ratio:1;border-radius:12px;border:2px solid rgba(167,139,250,0.3);background:${c.matched?'rgba(52,211,153,0.2)':c.flipped?'rgba(167,139,250,0.2)':'var(--bg2)'};font-size:${c.flipped||c.matched?'28px':'0'};transition:all 0.3s;cursor:${c.matched||c.flipped?'default':'pointer'}" ${c.matched?'disabled':''}>
      ${c.flipped||c.matched?c.emoji:'❓'}
    </button>`).join('');
}

function flipCard(idx) {
  if(memoryFlipped.length>=2||memoryCards[idx].flipped||memoryCards[idx].matched) return;
  memoryCards[idx].flipped=true; memoryFlipped.push(idx); renderMemoryBoard();
  if(memoryFlipped.length===2) {
    memoryMoves++;
    const [a,b]=memoryFlipped;
    if(memoryCards[a].emoji===memoryCards[b].emoji) {
      memoryCards[a].matched=memoryCards[b].matched=true; memoryFlipped=[]; memoryMatched++;
      if(memoryMatched===6) {
        const stars=Math.max(3,10-memoryMoves+6);
        appState.stars+=stars; localStorage.setItem('ownStars',appState.stars);
        updateStarDisplay(); updateKidProgress('gamesPlayed');
        setTimeout(()=>{
          document.getElementById('gameArea-memory').innerHTML+=`<div style="text-align:center;margin-top:12px"><div style="font-size:36px">🏆</div><div style="font-family:'Baloo 2',cursive;font-size:20px">¡Ganaste! +${stars}⭐</div><button class="btn btn-accent btn-sm" style="margin-top:8px" onclick="buildMemoryGame()">Jugar de nuevo</button></div>`;
        },400);
      }
    } else {
      setTimeout(()=>{ memoryCards[a].flipped=memoryCards[b].flipped=false; memoryFlipped=[]; renderMemoryBoard(); }, 900);
    }
  }
}

// Words game - fill in the blank
function buildWordsGame() {
  const templates=[
    {text:'El dragón {?} sobre el castillo mientras la hada {?} una canción mágica.', words:['volaba','cantaba']},
    {text:'Caperucita {?} por el bosque cuando encontró un {?} muy amigable.', words:['caminaba','lobo']},
    {text:'Los tres chanchitos {?} sus casas con {?} y madera.', words:['construyeron','paja']},
  ];
  const t=templates[Math.floor(Math.random()*templates.length)];
  let idx=0;
  const el=document.getElementById('gameArea-words');
  const parts=t.text.split('{?}');
  el.innerHTML=`
    <div style="font-family:'Baloo 2',cursive;font-size:20px;margin-bottom:12px;color:var(--gold)">🔤 Palabras Mágicas</div>
    <div style="font-size:15px;line-height:2;margin-bottom:16px">${parts.map((p,i)=>p+(i<t.words.length?`<input id="wordInput${i}" style="width:100px;text-align:center;background:rgba(167,139,250,0.15);border:2px dashed rgba(167,139,250,0.5);border-radius:8px;padding:4px;color:var(--text);font-family:Nunito,sans-serif;font-size:14px" placeholder="...">`:'')).join('')}</div>
    <button class="btn btn-accent btn-full" onclick="checkWords(${JSON.stringify(t.words).replace(/"/g,"'")})">✅ Verificar</button>`;
}

function checkWords(words) {
  let correct=0;
  words.forEach((w,i)=>{
    const inp=document.getElementById('wordInput'+i);
    if(!inp) return;
    const val=inp.value.trim().toLowerCase();
    if(val===w.toLowerCase()||w.toLowerCase().includes(val)) { inp.style.borderColor='#34d399'; correct++; }
    else { inp.style.borderColor='#ef4444'; inp.placeholder=w; }
  });
  const stars=correct===words.length?5:correct>0?2:0;
  if(stars>0) { appState.stars+=stars; localStorage.setItem('ownStars',appState.stars); updateStarDisplay(); }
  showToast(correct===words.length?`✅ ¡Perfecto! +${stars}⭐`:`Revisá las marcadas en rojo. +${stars}⭐`);
}

// Draw game - simple canvas with save
function buildDrawGame() {
  const el=document.getElementById('gameArea-draw');
  el.innerHTML=`
    <div style="font-family:'Baloo 2',cursive;font-size:20px;margin-bottom:8px;color:var(--accent)">🎨 Dibujar</div>
    <div style="margin-bottom:8px;display:flex;gap:6px;flex-wrap:wrap;align-items:center">
      ${['#ff6fd8','#a78bfa','#34d399','#fbbf24','#38bdf8','#f87171','#1e1a4a','#ffffff'].map(c=>`<button onclick="setDrawColor('${c}')" style="width:30px;height:30px;border-radius:50%;background:${c};border:3px solid transparent;cursor:pointer;transition:border-color 0.2s" id="clrBtn${c.replace('#','')}" ></button>`).join('')}
      <input type="range" id="drawSize" min="2" max="20" value="4" style="width:60px;accent-color:var(--accent)">
      <button onclick="setDrawEraser()" style="padding:4px 8px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:var(--text);font-size:11px;font-weight:700;cursor:pointer;font-family:Nunito,sans-serif">🧹 Borrar</button>
      <button onclick="clearCanvas()" style="padding:4px 8px;background:rgba(239,68,68,0.2);border:1px solid rgba(239,68,68,0.5);border-radius:8px;color:#f87171;font-size:11px;font-weight:700;cursor:pointer;font-family:Nunito,sans-serif">🗑 Limpiar</button>
    </div>
    <canvas id="drawCanvas" width="320" height="240" style="background:white;border-radius:12px;touch-action:none;display:block;max-width:100%;border:2px solid rgba(167,139,250,0.2)"></canvas>
    <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
      <button class="btn btn-gold btn-sm btn-full" onclick="saveKidDrawing()">💾 Guardar dibujo y agregar al cuento</button>
    </div>
    <div style="font-size:11px;color:var(--text2);margin-top:6px;text-align:center">El dibujo guardado aparece en tu área de escritura y en el cuento</div>`;
  initCanvas();
}

let drawCtx=null, drawColor='#000000', isDrawing=false, drawEraser=false, canvasBg='#ffffff';
function setDrawColor(c) { drawColor=c; drawEraser=false; }
function setCanvasBg(c) {
  canvasBg=c;
  const canvas=document.getElementById('drawCanvas');
  if(!canvas||!drawCtx) return;
  canvas.style.background=c;
  // Redraw background
  const imageData=drawCtx.getImageData(0,0,canvas.width,canvas.height);
  drawCtx.fillStyle=c;
  drawCtx.fillRect(0,0,canvas.width,canvas.height);
  drawCtx.putImageData(imageData,0,0);
}
function setDrawEraser() { drawEraser=true; }
function clearCanvas() { if(drawCtx) { drawCtx.clearRect(0,0,320,240); } }
function initCanvas() {
  const canvas=document.getElementById('drawCanvas');
  if(!canvas) return;
  drawCtx=canvas.getContext('2d');
  drawCtx.lineCap='round'; drawCtx.lineJoin='round';
  const getPos=e=>{
    const r=canvas.getBoundingClientRect();
    const sc=320/r.width;
    if(e.touches) return {x:(e.touches[0].clientX-r.left)*sc,y:(e.touches[0].clientY-r.top)*sc};
    return {x:(e.clientX-r.left)*sc,y:(e.clientY-r.top)*sc};
  };
  const down=e=>{
    isDrawing=true;
    const p=getPos(e);
    const sz=parseInt(document.getElementById('drawSize')?.value||'6');
    drawCtx.lineWidth=drawEraser?sz*4:sz;
    drawCtx.strokeStyle=drawEraser?canvasBg:drawColor;
    drawCtx.beginPath(); drawCtx.moveTo(p.x,p.y);
    e.preventDefault();
  };
  const move=e=>{
    if(!isDrawing) return;
    const p=getPos(e);
    const sz=parseInt(document.getElementById('drawSize')?.value||'6');
    drawCtx.lineWidth=drawEraser?sz*4:sz;
    drawCtx.strokeStyle=drawEraser?canvasBg:drawColor;
    drawCtx.lineTo(p.x,p.y); drawCtx.stroke();
    e.preventDefault();
  };
  const up=()=>{ isDrawing=false; };
  canvas.addEventListener('mousedown',down); canvas.addEventListener('mousemove',move); canvas.addEventListener('mouseup',up);
  canvas.addEventListener('touchstart',down,{passive:false}); canvas.addEventListener('touchmove',move,{passive:false}); canvas.addEventListener('touchend',up);
}

// Puzzle game - order scenes with images + text + number controls
const PUZZLE_SCENES_DATA = [
  { story:'Caperucita Roja', scenes:[
    { text:'Mamá le da la canasta a Caperucita', emoji:'🧺', img:'https://picsum.photos/seed/cap_1/200/200' },
    { text:'Caperucita camina por el bosque', emoji:'🌲', img:'https://picsum.photos/seed/cap_2/200/200' },
    { text:'El lobo habla con Caperucita', emoji:'🐺', img:'https://picsum.photos/seed/cap_3/200/200' },
    { text:'El lobo se disfraza de abuelita', emoji:'👵', img:'https://picsum.photos/seed/cap_4/200/200' },
    { text:'El cazador rescata a todos', emoji:'🪓', img:'https://picsum.photos/seed/cap_5/200/200' },
  ]},
  { story:'Los 3 Chanchitos', scenes:[
    { text:'Los chanchitos salen a construir casas', emoji:'🐷', img:'https://picsum.photos/seed/pig_1/200/200' },
    { text:'Fifi hace su casa de paja', emoji:'🌾', img:'https://picsum.photos/seed/pig_2/200/200' },
    { text:'El lobo sopla y derrumba la casa', emoji:'💨', img:'https://picsum.photos/seed/pig_3/200/200' },
    { text:'Los chanchitos corren a la casa de ladrillos', emoji:'🧱', img:'https://picsum.photos/seed/pig_4/200/200' },
    { text:'El lobo cae en la olla y se va', emoji:'🏃', img:'https://picsum.photos/seed/pig_5/200/200' },
  ]},
  { story:'Hansel y Gretel', scenes:[
    { text:'Los niños entran al bosque con el papá', emoji:'🌳', img:'https://picsum.photos/seed/han_1/200/200' },
    { text:'Hansel deja piedritas en el camino', emoji:'🪨', img:'https://picsum.photos/seed/han_2/200/200' },
    { text:'Encuentran la casa de dulces', emoji:'🏠', img:'https://picsum.photos/seed/han_3/200/200' },
    { text:'La bruja atrapa a Hansel', emoji:'🧙', img:'https://picsum.photos/seed/han_4/200/200' },
    { text:'Gretel empuja a la bruja y escapan', emoji:'🎉', img:'https://picsum.photos/seed/han_5/200/200' },
  ]},
];
let puzzleSceneOrder=[], puzzleCorrectOrder=[], puzzleStoryIdx=0;

function buildPuzzleGame() {
  puzzleStoryIdx=Math.floor(Math.random()*PUZZLE_SCENES_DATA.length);
  const storyData=PUZZLE_SCENES_DATA[puzzleStoryIdx];
  puzzleCorrectOrder=[0,1,2,3,4];
  // Shuffle
  const shuffled=[...storyData.scenes.keys()].sort(()=>Math.random()-0.5);
  puzzleSceneOrder=[...shuffled];
  renderPuzzleGame();
}

function renderPuzzleGame() {
  const storyData=PUZZLE_SCENES_DATA[puzzleStoryIdx];
  const el=document.getElementById('gameArea-puzzle');
  el.innerHTML=`
    <div style="font-family:'Baloo 2',cursive;font-size:19px;margin-bottom:6px;color:var(--accent2)">🧩 ${storyData.story}</div>
    <p style="font-size:12px;color:var(--text2);margin-bottom:12px">Cambiá los números para ordenar las escenas del cuento:</p>
    <div id="puzzleCards" style="display:flex;flex-direction:column;gap:10px"></div>
    <button class="btn btn-accent btn-full" style="margin-top:14px" onclick="checkPuzzleNew()">✅ ¡Así es el orden!</button>`;
  renderPuzzleCards();
}

function renderPuzzleCards() {
  const storyData=PUZZLE_SCENES_DATA[puzzleStoryIdx];
  const el=document.getElementById('puzzleCards');
  if(!el) return;
  el.innerHTML=puzzleSceneOrder.map((sceneIdx,pos)=>{
    const sc=storyData.scenes[sceneIdx];
    return `<div style="background:var(--bg2);border-radius:14px;padding:10px;display:flex;gap:10px;align-items:center;border:2px solid rgba(167,139,250,0.2)" id="pzCard${pos}">
      <!-- Number selector -->
      <div style="display:flex;flex-direction:column;align-items:center;gap:4px;flex-shrink:0">
        <button onclick="movePuzzleScene(${pos},-1)" style="width:30px;height:30px;border-radius:50%;background:rgba(167,139,250,0.2);border:none;color:var(--text);font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center">▲</button>
        <div style="font-family:'Fredoka One',cursive;font-size:28px;color:var(--accent2);line-height:1;min-width:28px;text-align:center">${pos+1}</div>
        <button onclick="movePuzzleScene(${pos},1)" style="width:30px;height:30px;border-radius:50%;background:rgba(167,139,250,0.2);border:none;color:var(--text);font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center">▼</button>
      </div>
      <!-- Image -->
      <img src="${sc.img}" style="width:72px;height:72px;border-radius:10px;object-fit:cover;flex-shrink:0">
      <!-- Text + emoji -->
      <div style="flex:1;min-width:0">
        <div style="font-size:28px;margin-bottom:4px">${sc.emoji}</div>
        <div style="font-size:13px;font-weight:700;line-height:1.3">${sc.text}</div>
      </div>
    </div>`;
  }).join('');
}

function movePuzzleScene(pos, dir) {
  const newPos=pos+dir;
  if(newPos<0||newPos>=puzzleSceneOrder.length) return;
  [puzzleSceneOrder[pos],puzzleSceneOrder[newPos]]=[puzzleSceneOrder[newPos],puzzleSceneOrder[pos]];
  renderPuzzleCards();
}

function checkPuzzleNew() {
  const isRight=JSON.stringify(puzzleSceneOrder)===JSON.stringify(puzzleCorrectOrder);
  const stars=isRight?8:3;
  appState.stars+=stars; localStorage.setItem('ownStars',appState.stars);
  updateStarDisplay(); updateKidProgress('gamesPlayed'); checkAchievements();
  const el=document.getElementById('gameArea-puzzle');
  const msg=isRight?'🏆 ¡Orden perfecto! ¡Sos increíble!':'👏 ¡Buen intento! El orden correcto era 1→5';
  el.innerHTML+=`<div style="text-align:center;margin-top:14px;background:rgba(167,139,250,0.1);border-radius:14px;padding:16px">
    <div style="font-size:36px;margin-bottom:6px">${isRight?'🏆':'⭐'}</div>
    <div style="font-family:'Baloo 2',cursive;font-size:18px;margin-bottom:6px">${msg}</div>
    <div style="color:var(--gold);font-weight:800;font-size:16px;margin-bottom:12px">+${stars} ⭐</div>
    <button class="btn btn-accent btn-sm" onclick="buildPuzzleGame()">Jugar de nuevo</button>
  </div>`;
}

// ===================== WRITING SECTION =====================
async function saveKidWriting() {
  const title=document.getElementById('kidWriteTitle').value.trim()||'Mi historia';
  const text=document.getElementById('kidWriteArea').value.trim();
  if(!text||text.length<10) { showToast('❌ Escribí más antes de guardar'); return; }
  const id=Date.now().toString();
  await dbPut('writings',{id,title,text,created:new Date().toLocaleDateString('es-AR')});
  updateKidProgress('writingsSaved');
  updateKidProgress('totalWritingChars',text.length);
  checkAchievements();
  showToast('💾 Historia guardada!');
  document.getElementById('kidWriteTitle').value='';
  document.getElementById('kidWriteArea').value='';
  loadKidWritings();
  const stars=Math.min(10,Math.floor(text.length/50)+2);
  appState.stars+=stars; localStorage.setItem('ownStars',appState.stars);
  updateStarDisplay();
  showToast(`+${stars} ⭐ por escribir!`);
}

function analyzeKidWriting() {
  const text=document.getElementById('kidWriteArea').value.trim();
  if(!text) { showToast('Escribí algo primero'); return; }
  const words=text.split(/\s+/).length;
  const sentences=text.split(/[.!?]+/).filter(s=>s.trim()).length;
  const chars=text.length;
  const feedback=document.getElementById('writingFeedback');
  feedback.style.display='block';
  feedback.innerHTML=`
    ✅ <strong>¡Muy bien!</strong><br>
    📝 Palabras: <strong>${words}</strong><br>
    📖 Oraciones: <strong>${sentences}</strong><br>
    ${words>30?'🌟 ¡Texto largo! Gran esfuerzo.':words>10?'👍 Buen comienzo. Podés escribir más.':'💡 Intentá agregar más detalles.'}<br>
    ${sentences>3?'📚 ¡Excelente estructura narrativa!':'💡 Usá puntos para separar las ideas.'}`;
}

async function loadKidWritings() {
  const el=document.getElementById('kidWritingList');
  if(!el) return;
  const writings=await dbGetAll('writings');
  if(!writings.length) { el.innerHTML='<div style="color:var(--text2);font-size:13px;padding:12px 0">Aún no escribiste ninguna historia.</div>'; return; }
  el.innerHTML=writings.sort((a,b)=>b.id-a.id).map(w=>`
    <div class="card" style="margin-bottom:10px">
      <div style="font-weight:800;margin-bottom:4px">${w.title}</div>
      <div style="font-size:13px;color:var(--text2);margin-bottom:8px">${w.created}</div>
      <div style="font-size:14px;line-height:1.6;color:var(--text)">${w.text.substring(0,120)}${w.text.length>120?'...':''}</div>
    </div>`).join('');
}

// ===================== CUENTO DE ORO =====================
let oroState = {
  isRecording: false, mediaRecorder: null, audioChunks: [], recordedBlob: null, recAudio: null,
  recIsPlaying: false, recordSeconds: 0, recInterval: null, selectedVoice: 'normal',
  images: [], // gallery for oro story
};

function initOroSection() {
  buildOroVoicePills();
  renderOroGallery();
  buildOroSequenceScenes();
  setOroMode('scenes'); // default mode
}

// ===================== ORO MODE (escenas vs libre) =====================
let oroMode = 'scenes';
function setOroMode(mode) {
  oroMode = mode;
  const scenesSection = document.getElementById('oroScenesSection');
  const freeSection   = document.getElementById('oroFreeSection');
  const btnScenes     = document.getElementById('oroModeScenes');
  const btnFree       = document.getElementById('oroModeFree');
  const desc          = document.getElementById('oroModeDesc');
  if(scenesSection) scenesSection.style.display = mode==='scenes' ? 'block' : 'none';
  if(freeSection)   freeSection.style.display   = mode==='free'   ? 'block' : 'none';
  if(btnScenes) { btnScenes.className = mode==='scenes' ? 'btn btn-premium btn-sm' : 'btn btn-ghost btn-sm'; btnScenes.style.flex='1'; }
  if(btnFree)   { btnFree.className   = mode==='free'   ? 'btn btn-premium btn-sm' : 'btn btn-ghost btn-sm'; btnFree.style.flex='1'; }
  if(desc) desc.textContent = mode==='scenes'
    ? 'Armá 5 escenas con personajes y acciones — las imágenes se generan automáticamente'
    : 'Escribí el prompt de cada imagen libremente — generá al menos 5 para el cuento';
}

// ===================== ORO SEQUENCE =====================
let oroSequenceData = [{},{},{},{},{}];
function buildOroSequenceScenes() {
  const el = document.getElementById('oroSequenceScenes');
  if(!el) return;
  el.innerHTML = oroSequenceData.map((scene,i) => `
    <div class="seq-scene ${scene.char&&scene.action!==undefined?'complete':''}" style="margin-bottom:10px">
      <div class="seq-scene-title">Escena ${i+1}</div>
      <div class="seq-char-row">${SEQ_CHARS.map(c=>`<button class="seq-char-pick ${scene.char===c?'active':''}" onclick="selectOroSeqChar(${i},'${c}')">${c}</button>`).join('')}</div>
      <div class="seq-actions" style="margin-top:6px">${SEQ_ACTIONS.map((a,j)=>`<button class="seq-action-btn ${scene.action===j?'active':''}" onclick="selectOroSeqAction(${i},${j})"><span class="seq-action-icon">${a.icon}</span>${a.label}</button>`).join('')}</div>
    </div>`).join('');
}
function selectOroSeqChar(i,c)  { oroSequenceData[i].char=c;   buildOroSequenceScenes(); }
function selectOroSeqAction(i,j){ oroSequenceData[i].action=j; buildOroSequenceScenes(); }

async function generateOroSceneImages() {
  if(!isPremium()) { showToast('🔒 Función exclusiva Premium'); return; }
  const btn = document.getElementById('btnGenOroScenes');
  if(btn) { btn.disabled=true; btn.textContent='⏳ Generando...'; }
  showLoading('Generando 5 escenas IA...');
  const imgs = [];
  for(let i=0;i<5;i++){
    const s = oroSequenceData[i];
    const c = s.char||'🐉', a = SEQ_ACTIONS[s.action||0];
    const url = await generateImageAI(`${c} ${a?a.label:''} children storybook scene ${i+1} colorful magical`);
    imgs.push(url);
    await new Promise(r=>setTimeout(r,300));
  }
  oroState.images = imgs;
  renderOroGallery();
  // Show thumb row
  const thumbGrid = document.getElementById('oroScenesThumbGrid');
  const thumbRow  = document.getElementById('oroScenesThumbRow');
  if(thumbGrid) thumbGrid.innerHTML = imgs.map((u,i)=>`<img src="${u}" style="width:100%;aspect-ratio:1;border-radius:8px;object-fit:cover" title="Escena ${i+1}">`).join('');
  if(thumbRow)  thumbRow.style.display='block';
  // Build oro recording slideshow
  buildOroRecSlideshow(imgs);
  hideLoading();
  useToken(15);
  if(btn) { btn.disabled=false; btn.textContent='🔄 Regenerar'; }
  showToast('✅ 5 escenas generadas — ¡ahora grabá!');
}

// ===================== ORO SLIDESHOW WHILE RECORDING =====================
let oroRecSlideIdx=0, oroRecSlideImgs=[];
function buildOroRecSlideshow(imgs) {
  oroRecSlideImgs = imgs||[];
  oroRecSlideIdx = 0;
  const wrap = document.getElementById('oroRecSlideshowWrap');
  const ss   = document.getElementById('oroRecSlideshow');
  const dots = document.getElementById('oroRecSlideDots');
  if(!wrap||!ss||!oroRecSlideImgs.length) return;
  wrap.style.display='block';
  ss.querySelectorAll('.slideshow-img').forEach(e=>e.remove());
  oroRecSlideImgs.forEach((url,i)=>{
    const img=document.createElement('img');
    img.className='slideshow-img'+(i===0?' active':'');
    img.src=url;
    ss.insertBefore(img, ss.querySelector('.slide-nav-btn'));
  });
  if(dots) dots.innerHTML=oroRecSlideImgs.map((_,i)=>`<button class="slide-dot ${i===0?'active':''}" onclick="goOroRecSlide(${i})"></button>`).join('');
}
function slideOroRec(dir) {
  if(!oroRecSlideImgs.length) return;
  oroRecSlideIdx=(oroRecSlideIdx+dir+oroRecSlideImgs.length)%oroRecSlideImgs.length;
  goOroRecSlide(oroRecSlideIdx);
}
function goOroRecSlide(idx) {
  oroRecSlideIdx=idx;
  document.querySelectorAll('#oroRecSlideshow .slideshow-img').forEach((img,i)=>img.classList.toggle('active',i===idx));
  document.querySelectorAll('#oroRecSlideDots .slide-dot').forEach((d,i)=>d.classList.toggle('active',i===idx));
}

function buildOroVoicePills() {
  const el = document.getElementById('oroVoicePills');
  if (!el) return;
  el.innerHTML = VOICES.map(v => {
    const locked = !v.free && !isPremium();
    return `<button class="voice-pill ${v.id===oroState.selectedVoice?'active':''} ${!v.free?'premium-voice':''}"
      onclick="selectOroVoice('${v.id}')" style="${locked?'opacity:0.5':''}">
      ${v.label}${!v.free?'<span style="font-size:9px;color:var(--gold);display:block">★</span>':''}
    </button>`;
  }).join('');
}

function selectOroVoice(id) {
  oroState.selectedVoice = id;
  buildOroVoicePills();
  showToast(`🎭 Voz: ${VOICES.find(v=>v.id===id)?.label}`);
}

async function toggleOroRecord() {
  if (oroState.isRecording) { stopOroRecording(); return; }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({audio:true,video:false});
    oroState.audioChunks = [];
    const mimeType=MediaRecorder.isTypeSupported('audio/webm;codecs=opus')?'audio/webm;codecs=opus':MediaRecorder.isTypeSupported('audio/webm')?'audio/webm':'';
    oroState.mediaRecorder = new MediaRecorder(stream, mimeType?{mimeType}:{});
    oroState.mediaRecorder.ondataavailable = e => { if(e.data&&e.data.size>0) oroState.audioChunks.push(e.data); };
    oroState.mediaRecorder.onstop = () => {
      stream.getTracks().forEach(t=>t.stop());
      if(!oroState.audioChunks.length){ showToast('❌ No se grabó audio'); return; }
      const blob = new Blob(oroState.audioChunks, {type:mimeType||'audio/webm'});
      oroState.recordedBlob = blob;
      if(oroState.recAudioUrl){ try{ URL.revokeObjectURL(oroState.recAudioUrl); }catch(e){} }
      const url = URL.createObjectURL(blob);
      oroState.recAudioUrl = url;
      if(oroState.recAudio){ oroState.recAudio.pause(); oroState.recAudio=null; }
      const audio=new Audio();
      audio.preload='auto'; audio.src=url; audio.load();
      audio.onloadedmetadata=()=>{
        const td=document.getElementById('oroRecTimeDisplay'); if(td) td.textContent='0:00 / '+formatTime(audio.duration||0);
      };
      audio.ontimeupdate = () => {
        const prog = document.getElementById('oroRecProgress');
        if(prog&&audio.duration) prog.style.width=(audio.currentTime/audio.duration*100)+'%';
        const td = document.getElementById('oroRecTimeDisplay');
        if(td) td.textContent=formatTime(audio.currentTime)+' / '+formatTime(audio.duration||0);
      };
      audio.onended = () => { oroState.recIsPlaying=false; const pb=document.getElementById('oroRecPlayBtn'); if(pb) pb.textContent='▶'; };
      audio.onerror=()=>{ showToast('❌ Error cargando audio'); console.error('ORO rec error',audio.error); };
      oroState.recAudio=audio;
      const pb=document.getElementById('oroRecPlayback'); if(pb) pb.style.display='block';
    };
    oroState.mediaRecorder.start(100);
    oroState.isRecording=true; oroState.recordSeconds=0;
    const btn=document.getElementById('oroRecBtn');
    if(btn){ btn.classList.add('recording'); btn.style.background='linear-gradient(135deg,#ef4444,#dc2626)'; btn.style.boxShadow='0 8px 24px rgba(239,68,68,.6)'; btn.innerHTML='<span style="font-size:38px;line-height:1">⏹️</span><span style="font-size:12px;font-weight:900;font-family:Nunito,sans-serif;margin-top:4px">PARAR</span>'; }
    const st=document.getElementById('oroRecStatus'); if(st) st.textContent='🔴 Grabando...';
    clearInterval(oroState.recInterval);
    oroState.recInterval=setInterval(()=>{
      oroState.recordSeconds++;
      const t=document.getElementById('oroRecTimer'); if(t) t.textContent=formatTime(oroState.recordSeconds);
    },1000);
  } catch(e) { console.error(e); showToast('❌ No se pudo acceder al micrófono'); }
}

function stopOroRecording() {
  if(oroState.mediaRecorder&&oroState.isRecording){ oroState.mediaRecorder.stop(); }
  clearInterval(oroState.recInterval);
  oroState.isRecording=false;
  const btn=document.getElementById('oroRecBtn');
  if(btn){ btn.classList.remove('recording'); btn.style.background='linear-gradient(135deg,var(--coral),#ff8e53)'; btn.style.boxShadow='0 8px 24px rgba(255,107,107,.5)'; btn.innerHTML='<span style="font-size:38px;line-height:1">🎙️</span><span style="font-size:12px;font-weight:900;font-family:Nunito,sans-serif;margin-top:4px">GRABAR</span>'; }
  const st=document.getElementById('oroRecStatus'); if(st) st.textContent='✅ ¡Listo! Escuchá ↓';
}

function toggleOroRecPlay() {
  if(!oroState.recAudio){ showToast('❌ No hay grabación'); return; }
  if(oroState.recIsPlaying){
    oroState.recAudio.pause(); oroState.recIsPlaying=false;
    const btn=document.getElementById('oroRecPlayBtn'); if(btn) btn.textContent='▶';
  } else {
    oroState.recAudio.play()
      .then(()=>{ oroState.recIsPlaying=true; const btn=document.getElementById('oroRecPlayBtn'); if(btn) btn.textContent='⏸'; })
      .catch(e=>{ showToast('❌ Error: '+e.message); console.error('oroRecPlay error',e); });
  }
}

function deleteOroRecording() {
  if(oroState.recAudio){ oroState.recAudio.pause(); oroState.recAudio=null; }
  oroState.recordedBlob=null; oroState.isRecording=false; oroState.recordSeconds=0;
  const pb=document.getElementById('oroRecPlayback'); if(pb) pb.style.display='none';
  const t=document.getElementById('oroRecTimer'); if(t) t.textContent='0:00';
  const s=document.getElementById('oroRecStatus'); if(s) s.textContent='Listo para grabar';
  showToast('🗑 Grabación borrada');
}

// TTS for oro text
function speakOroText() {
  if(!('speechSynthesis' in window)){ showToast('❌ Tu navegador no soporta TTS'); return; }
  const text=document.getElementById('oroStoryText')?.value?.trim();
  if(!text){ showToast('❌ Escribí el texto primero'); return; }
  stopSpeakOro();
  const voice=VOICES.find(v=>v.id===oroState.selectedVoice)||VOICES[0];
  const utter=new SpeechSynthesisUtterance(text);
  utter.lang='es-ES'; utter.pitch=voice.pitch; utter.rate=voice.rate;
  utter.onstart=()=>{
    const b=document.getElementById('btnSpeakOro'); if(b) b.style.display='none';
    const s=document.getElementById('btnStopOro');  if(s) s.style.display='inline-flex';
    const ts=document.getElementById('oroTtsStatus'); if(ts){ ts.style.display='block'; ts.textContent=`🎙️ Leyendo con ${voice.label}...`; }
  };
  utter.onend=utter.onerror=()=>{
    const b=document.getElementById('btnSpeakOro'); if(b) b.style.display='inline-flex';
    const s=document.getElementById('btnStopOro');  if(s) s.style.display='none';
    const ts=document.getElementById('oroTtsStatus'); if(ts) ts.style.display='none';
  };
  speechSynthesis.speak(utter);
}
function stopSpeakOro() {
  if('speechSynthesis' in window) speechSynthesis.cancel();
  const b=document.getElementById('btnSpeakOro'); if(b) b.style.display='inline-flex';
  const s=document.getElementById('btnStopOro');  if(s) s.style.display='none';
  const ts=document.getElementById('oroTtsStatus'); if(ts) ts.style.display='none';
}

// AI text generation for oro
async function generateOroTextAI() {
  if(!isPremium()){ showToast('🔒 Función exclusiva Premium'); return; }
  showLoading('Generando texto con IA...');
  await new Promise(r=>setTimeout(r,1800));
  const texts=[
    'Érase una vez, en un valle donde los ríos cantaban y las flores sabían tu nombre, vivía una niña llamada Sol. Sol tenía un don especial: todo lo que dibujaba cobraba vida al amanecer. Un día dibujó un puente arcoíris para cruzar el gran río y llegar al bosque encantado, donde los animales hablaban y los árboles guardaban secretos del mundo. Allí aprendió que la imaginación es el regalo más grande.',
    'Había una vez un pequeño cocinero llamado Pipo que vivía en el fondo del mar. Preparaba las sopas más deliciosas del océano, pero le faltaba un ingrediente mágico: una lágrima de sirena. Un buen día, la sirena Marina le regaló una perla brillante. Al agregarla a su sopa, toda la cocina se llenó de luz dorada y los peces del océano vinieron a probar el plato más especial que el mar jamás conoció.',
    'En el país de las nubes había una escuela muy especial: los niños aprendían a volar. Tomás era el único que no podía despegar. Pero un día de tormenta descubrió que él no volaba hacia arriba... sino hacia adentro. Cuando cerró los ojos, viajó a mundos que nadie más podía imaginar. Y así aprendió que cada uno tiene su propio tipo de vuelo.',
  ];
  const el=document.getElementById('oroStoryText'); if(el) el.value=texts[Math.floor(Math.random()*texts.length)];
  hideLoading(); useToken(10); showToast('✅ Texto generado con IA');
}

// AI image generation for oro (free mode)
async function generateOroAiImage() {
  if(!isPremium()){ showToast('🔒 Función exclusiva Premium'); return; }
  const prompt=document.getElementById('oroAiPrompt')?.value?.trim();
  if(!prompt){ showToast('❌ Describí la imagen primero'); return; }
  showLoading('Generando imagen con IA...');
  const url=await generateImageAI(prompt);
  hideLoading();
  if(url&&url!==IMG_ERROR_PLACEHOLDER){
    oroState.images.push(url);
    renderOroGallery();
    const grid=document.getElementById('oroAiImgGrid');
    if(grid){
      const d=document.createElement('div'); d.className='prem-grid-img-wrap';
      d.innerHTML=`<img src="${url}" style="width:100%;height:100%;object-fit:cover"><button class="prem-grid-del" onclick="removeOroAiImgByUrl('${url}')">✕</button>`;
      grid.appendChild(d);
    }
    useToken(5); showToast('✅ Imagen generada y agregada');
  } else { showToast('❌ Error generando imagen — intentá de nuevo'); }
}

async function generateOroAiImage3() {
  if(!isPremium()){ showToast('🔒 Función exclusiva Premium'); return; }
  const basePrompt=document.getElementById('oroAiPrompt')?.value?.trim()||'cuento mágico infantil';
  showLoading('Generando 3 imágenes...');
  const grid=document.getElementById('oroAiImgGrid'); if(grid) grid.innerHTML='';
  for(let i=0;i<3;i++){
    const url=await generateImageAI(`${basePrompt} escena ${i+1}`);
    if(url&&url!==IMG_ERROR_PLACEHOLDER){
      oroState.images.push(url);
      if(grid){
        const d=document.createElement('div'); d.className='prem-grid-img-wrap';
        d.innerHTML=`<img src="${url}" style="width:100%;height:100%;object-fit:cover"><button class="prem-grid-del" onclick="removeOroAiImgByUrl('${url}')">✕</button>`;
        grid.appendChild(d);
      }
    }
    await new Promise(r=>setTimeout(r,300));
  }
  renderOroGallery(); hideLoading(); useToken(15); showToast('✅ 3 imágenes generadas');
}

function removeOroAiImgByUrl(url) {
  oroState.images=oroState.images.filter(u=>u!==url);
  renderOroGallery();
  // Remove from grid too
  const grid=document.getElementById('oroAiImgGrid');
  if(grid) grid.querySelectorAll('.prem-grid-img-wrap').forEach(d=>{ if(d.querySelector('img')?.src===url) d.remove(); });
}

// Upload image for oro
function handleOroImgUpload(e) {
  const file=e.target.files[0]; if(!file) return;
  if(file.size>8*1024*1024){ showToast('❌ Imagen demasiado grande (máx 8MB)'); return; }
  const reader=new FileReader();
  reader.onload=ev=>{
    oroState.images.push(ev.target.result);
    renderOroGallery();
    showToast('✅ Imagen subida y agregada al cuento');
    e.target.value=''; // reset input
  };
  reader.readAsDataURL(file);
}

// Photo to drawing for oro
function handleOroPhotoToDraw(e) {
  const file=e.target.files[0]; if(!file) return;
  const reader=new FileReader();
  reader.onload=ev=>{
    const orig=document.getElementById('oroPhotoDrawOriginal'); if(orig) orig.src=ev.target.result;
    const zone=document.getElementById('oroPhotoDrawZone'); if(zone) zone.style.display='block';
    const rzone=document.getElementById('oroDrawingResultZone'); if(rzone) rzone.style.display='none';
    const addBtn=document.getElementById('btnAddDrawingOro'); if(addBtn) addBtn.style.display='none';
  };
  reader.readAsDataURL(file);
}

async function convertOroPhotoToDrawing() {
  if(!isPremium()){ showToast('🔒 Función exclusiva Premium'); return; }
  showLoading('Convirtiendo a dibujo de cuento...');
  await new Promise(r=>setTimeout(r,2200));
  const url=getArchiveImage('children illustration fairy tale drawing');
  const ri=document.getElementById('oroDrawingResultImg'); if(ri) ri.src=url;
  const rz=document.getElementById('oroDrawingResultZone'); if(rz) rz.style.display='block';
  const ab=document.getElementById('btnAddDrawingOro'); if(ab) ab.style.display='inline-flex';
  hideLoading(); useToken(8); showToast('🎨 ¡Foto convertida a dibujo!');
}

function addOroDrawingToStory() {
  const url=document.getElementById('oroDrawingResultImg')?.src;
  if(url){ oroState.images.push(url); renderOroGallery(); showToast('✅ Dibujo agregado al cuento'); }
}

// Gallery render
function renderOroGallery() {
  const el=document.getElementById('oroGallery'); if(!el) return;
  const cnt=document.getElementById('oroImgCount'); if(cnt) cnt.textContent=`(${oroState.images.length} imágenes)`;
  if(!oroState.images.length){
    el.innerHTML='<div style="grid-column:1/-1;text-align:center;color:var(--text2);font-size:13px;padding:16px">Las imágenes del cuento aparecen aquí</div>';
    return;
  }
  el.innerHTML=oroState.images.map((u,i)=>`
    <div style="position:relative;border-radius:10px;overflow:hidden;aspect-ratio:1;border:2px solid rgba(251,191,36,0.3)">
      <img src="${u}" style="width:100%;height:100%;object-fit:cover">
      <button onclick="removeOroGalleryImg(${i})" style="position:absolute;top:3px;right:3px;width:22px;height:22px;border-radius:50%;background:rgba(239,68,68,0.9);border:none;color:white;font-size:12px;cursor:pointer;display:flex;align-items:center;justify-content:center">✕</button>
    </div>`).join('');
  // Update slideshow if open
  if(oroState.images.length) buildOroRecSlideshow(oroState.images);
}

function removeOroGalleryImg(i){ oroState.images.splice(i,1); renderOroGallery(); }

// Save Cuento de Oro
async function saveOroStory() {
  if(!isPremium()){ showToast('🔒 Función exclusiva Premium'); return; }
  const title=document.getElementById('oroStoryTitle')?.value?.trim();
  if(!title){ showToast('❌ Poné un título al Cuento de Oro'); return; }
  if(!oroState.images.length&&!oroState.recordedBlob){ showToast('❌ Agregá imágenes o grabá el audio primero'); return; }
  const id='oro_'+Date.now();
  const story={id, title, type:'oro', char:'⭐', images:oroState.images, storyText:document.getElementById('oroStoryText')?.value||'', created:new Date().toLocaleDateString('es-AR')};
  dbPut('stories',story).catch(e=>console.warn(e));
  if(oroState.recordedBlob) dbPutAudio(id, oroState.recordedBlob).catch(e=>console.warn(e));
  showToast('⭐ ¡Cuento de Oro guardado y enviado al niño!');
  // Reset
  oroState.images=[]; oroState.recordedBlob=null; oroState.recAudio=null; oroState.recordSeconds=0;
  const tt=document.getElementById('oroStoryTitle'); if(tt) tt.value='';
  const tx=document.getElementById('oroStoryText'); if(tx) tx.value='';
  renderOroGallery();
  const pb=document.getElementById('oroRecPlayback'); if(pb) pb.style.display='none';
  const t=document.getElementById('oroRecTimer'); if(t) t.textContent='0:00';
}

// ===================== HELPERS =====================
function formatTime(secs) {
  const s=Math.floor(secs); return `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;
}

let toastTimeout;
function showToast(msg, duration=3000) {
  const el=document.getElementById('toast');
  el.textContent=msg; el.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout=setTimeout(()=>el.classList.remove('show'),duration);
}

function showLoading(text='Cargando...') {
  const el=document.getElementById('loadingOverlay');
  document.getElementById('loadingText').textContent=text;
  el.style.display='flex';
}

function hideLoading() {
  document.getElementById('loadingOverlay').style.display='none';
}

// ===================== KEYBOARD =====================
document.addEventListener('keydown',e=>{
  if(e.key==='Enter') {
    const active=document.querySelector('.screen.active');
    if(active&&active.id==='loginScreen') doLogin();
  }
});

// ===================== BOOT =====================
window.addEventListener('load',()=>{ initSupabase(); openDB().then(()=>init()); });
