/* デモ版：claude.ai の保存機能の代わりに、ブラウザの localStorage にデータを保存する */
(function () {
  const KEY = 'linoa-ledger-demo-v1';
  const SEED = window.__SEED__;
  const COLS = ['entries', 'closes', 'returns', 'estimates', 'logs', 'settings'];
  let store;
  function fresh() {
    const s = {}; COLS.forEach(c => s[c] = {});
    SEED.entries.forEach(({id, ...d}) => s.entries[id] = d);
    SEED.returns.forEach(({id, ...d}) => s.returns[id] = d);
    SEED.estimates.forEach(({id, ...d}) => s.estimates[id] = d);
    SEED.logs.forEach(({id, ...d}) => s.logs[id] = d);
    s.settings.main = SEED.settings;
    return s;
  }
  try { store = JSON.parse(localStorage.getItem(KEY)) || fresh(); } catch (e) { store = fresh(); }
  COLS.forEach(c => { if (!store[c]) store[c] = {}; });
  const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {} };
  persist();
  const listeners = new Set();
  const clone = o => JSON.parse(JSON.stringify(o));
  const docSnap = (id, data) => ({id, exists: data !== undefined, data: () => data === undefined ? undefined : clone(data), metadata: {fromCache: false, hasPendingWrites: false}});
  function runQuery(q) {
    let arr = Object.entries(store[q.col] || {}).map(([id, d]) => ({id, d}));
    if (q.order) { const [f, dir] = q.order; arr.sort((a, b) => { const x = a.d[f], y = b.d[f]; return (x > y ? 1 : x < y ? -1 : 0) * (dir === 'desc' ? -1 : 1); }); }
    else arr.sort((a, b) => a.id.localeCompare(b.id));
    if (q.lim) arr = arr.slice(0, q.lim);
    const docs = arr.map(x => docSnap(x.id, x.d));
    return {docs, size: docs.length, empty: !docs.length, docChanges: () => [], metadata: {fromCache: false, hasPendingWrites: false}};
  }
  function emit() { listeners.forEach(l => { try { l.fire(); } catch (e) { console.error(e); } }); }
  const changed = () => { persist(); setTimeout(emit, 0); };
  const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  function docRef(path) {
    const [col, id] = path.split('/');
    return {
      id, path,
      get: async () => docSnap(id, store[col]?.[id]),
      set: async data => { store[col][id] = clone(data); changed(); },
      update: async data => { if (!store[col][id]) throw {code: 'invalid_argument', message: 'missing'}; store[col][id] = {...store[col][id], ...clone(data)}; changed(); },
      delete: async () => { delete store[col][id]; changed(); },
      onSnapshot: (next) => { const l = {fire: () => next(docSnap(id, store[col]?.[id]))}; listeners.add(l); setTimeout(l.fire, 0); return () => listeners.delete(l); },
      collection: () => { throw new Error('not supported'); }
    };
  }
  function query(col, order = null, lim = 0) {
    return {
      path: col,
      limit: n => query(col, order, n),
      orderBy: (f, dir = 'asc') => query(col, [f, dir], lim),
      where: () => query(col, order, lim),
      get: async () => runQuery({col, order, lim}),
      onSnapshot: (next) => { const l = {fire: () => next(runQuery({col, order, lim}))}; listeners.add(l); setTimeout(l.fire, 0); return () => listeners.delete(l); },
      doc: id => docRef(`${col}/${id || newId()}`),
      add: async data => { const id = newId(); store[col][id] = clone(data); changed(); return docRef(`${col}/${id}`); }
    };
  }
  const db = {doc: docRef, collection: c => query(c)};
  const downloads = {
    save: async ({filename, data}) => {
      const blob = data instanceof Blob ? data : new Blob([data], {type: filename.endsWith('.csv') ? 'text/csv;charset=utf-8' : 'application/json'});
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; document.body.appendChild(a); a.click();
      setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
      return {status: 'saved'};
    }
  };
  window.claude = {use: async name => name === 'db' ? db : name === 'downloads' ? downloads : null};
  window.__resetDemo = () => { try { localStorage.removeItem(KEY); localStorage.removeItem('linoa-tab'); } catch (e) {} location.reload(); };
})();
