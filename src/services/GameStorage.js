// Offline persistence. IndexedDB is the main store; localStorage is a synchronous
// backup so the last committed state survives the app being killed mid-write.
const DB = 'amrsense-snl';
const STORE = 'kv';

function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') return reject(new Error('no idb'));
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}

async function idbSet(key, value) {
  const db = await openDB();
  await new Promise((res, rej) => {
    const tx = db.transaction(STORE, 'readwrite');
    if (value === undefined) tx.objectStore(STORE).delete(key);
    else tx.objectStore(STORE).put(value, key);
    tx.oncomplete = res;
    tx.onerror = () => rej(tx.error);
  });
}

async function idbGet(key) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const r = db.transaction(STORE).objectStore(STORE).get(key);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}

function lsSet(key, value) {
  try {
    if (value === undefined) localStorage.removeItem(DB + key);
    else localStorage.setItem(DB + key, JSON.stringify(value));
  } catch { /* storage full or blocked */ }
}

function lsGet(key) {
  try {
    const v = localStorage.getItem(DB + key);
    return v ? JSON.parse(v) : undefined;
  } catch {
    return undefined;
  }
}

async function set(key, value) {
  lsSet(key, value);
  try { await idbSet(key, value); } catch { /* localStorage already has it */ }
}

async function get(key) {
  let a;
  try { a = await idbGet(key); } catch { /* ignore */ }
  const b = lsGet(key);
  if (a && b) return (b.updatedAt || 0) > (a.updatedAt || 0) ? b : a;
  return a || b;
}

export const saveGame = (state) => set('current', state);
export const loadGame = () => get('current');
export const clearGame = () => set('current', undefined);

// Questions already shown in earlier games, so each new game starts with fresh ones.
export const saveSeen = (ids) => set('seen', { ids, updatedAt: Date.now() });
export const loadSeen = async () => ((await get('seen')) || {}).ids || [];


// Highest level the user has unlocked.
export const saveProgress = (maxLevel) => set('progress', { maxLevel, updatedAt: Date.now() });
export const loadProgress = async () => ((await get('progress')) || {}).maxLevel || 1;

export async function addResult(record) {
  const list = (await get('results')) || [];
  if (list.some((r) => r.gameId === record.gameId)) return; // never record twice
  await set('results', [record, ...list].slice(0, 30));
}
export const loadResults = async () => (await get('results')) || [];
