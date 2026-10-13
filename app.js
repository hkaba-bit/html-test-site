/* ================= 定義 ================= */
const KINDS = {
  K10:{name:'国保連請求', sign:1, sm:true},
  T10:{name:'立替請求', sign:1, sm:true},
  K30:{name:'国保連 支払決定', sign:1, sm:true},
  T11:{name:'立替し直し', sign:1, sm:true},
  T20:{name:'相殺・清算', sign:0, sm:true},
  T30:{name:'手数料', sign:-1},
  T32:{name:'遅延損害金', sign:-1},
  B10:{name:'尼信入金', sign:1},
  X99:{name:'訂正', sign:0}
};
const ORDER = Object.keys(KINDS);
const BASES = ['御所','大和高田'];
const BCODE = {'御所':'GS','大和高田':'TK'};
const NF_REASONS = ['返戻の再請求分（トワライズには請求しない）','月遅れ請求分（立替の対象外）','請求漏れ（後日精算）','その他'];
const OFF_TYPES = {
  henrei:{label:'返戻の相殺', sign:-1, kind:'T20'},
  more:{label:'請求漏れ分の精算', sign:1, kind:'T20'},
  redo:{label:'立替し直し', sign:1, kind:'T11'},
  kokuho:{label:'国保連の手数料など', sign:-1, kind:'T20'},
  other:{label:'その他', sign:-1, kind:'T20'}
};
const RET_STATUS = ['点数のみ','再請求待ち','再請求済','入金済','対象外'];
const ERR_CODES = [
  ['EC01','受付','同じ請求の二重送信・重複','事業所'],
  ['EC08','受付','上限額管理結果票がすでに受付済み','事業所'],
  ['EG05','資格','上限額管理事業所の番号が台帳と不一致','事業所・市町村'],
  ['EG12','資格','負担上限月額が台帳に未登録','市町村'],
  ['EG17','資格','上限額管理の対象外','事業所'],
  ['PP08','支給量','実績記録票と明細書が不一致','事業所'],
  ['PP19','支給量','実績記録票と明細書が不一致','事業所'],
  ['PR44','支給量','回数・日数が支給量を超過','事業所'],
  ['EJ16','上限管理','上限管理結果額の関係が不正','上限管理事業所'],
  ['S・T','二次審査','市町村の審査による返戻（S・Tで始まるコード）','市町村']
];
const DOCS = [
  ['henrei','返戻の連絡（点数のみ）','前月末'],
  ['kettei','国保連の払出し通知書','5日ごろ'],
  ['seisan','トワライズの明細','17日ごろ（立替入金は15日ごろ）'],
  ['tsucho','尼信の通帳（入金の記帳）','入金のあと']
];
const HOLIDAYS = new Set(['2026-01-01','2026-01-12','2026-02-11','2026-02-23','2026-03-20','2026-04-29','2026-05-03','2026-05-04','2026-05-05','2026-05-06','2026-07-20','2026-08-11','2026-09-21','2026-09-22','2026-09-23','2026-10-12','2026-11-03','2026-11-23','2027-01-01','2027-01-11','2027-02-11','2027-02-23','2027-03-21','2027-03-22','2027-04-29','2027-05-03','2027-05-04','2027-05-05','2027-07-19','2027-08-11','2027-09-20','2027-09-23','2027-10-11','2027-11-03','2027-11-23']);
const MENU = [
  ['home','今月の作業','<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>'],
  ['report','月次レポート','<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'],
  ['cash','資金繰り','<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M16 15h2"/>'],
  ['recon','突合','<path d="M7 7h13M7 7l3-3M7 7l3 3M17 17H4m13 0-3-3m3 3-3 3"/>'],
  ['returns','返戻台帳','<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-2"/>'],
  ['ledger','台帳・履歴','<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>'],
  ['learn','使い方レクチャー','<path d="M2 8l10-4 10 4-10 4z"/><path d="M6 10v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5"/><path d="M22 8v6"/>'],
  ['settings','設定・使い方','<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>']
];
const DEFAULT_SETTINGS = {feeRate:0.012, feeFixed:3850, alertRatio:0.2, anomaly:0.15, members:[], cash:{opening:null, asOf:null, costs:[]}, lastBackupAt:null};
const S = { rows:[], closes:{}, returns:[], estimates:[], logs:[], settings:structuredClone(DEFAULT_SETTINGS), base:'合算', tab:'home', work:null, repPm:null,
  led:{pm:'', kind:'', q:'', unchecked:false, view:'rows'}, ret:{status:'open'}, loaded:false, me:'' };
let db = null, dl = null, pendingRender = false;

/* ================= 小道具 ================= */
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const yen = n => Math.round(n||0).toLocaleString('ja-JP');
const sgn = n => (n > 0 ? '+' : n < 0 ? '−' : '') + yen(Math.abs(n));
const man = n => (Math.round((n||0)/1000)/10).toLocaleString('ja-JP',{maximumFractionDigits:1}) + '万';
const ym = m => m ? `${+m.slice(0,4)}年${+m.slice(5,7)}月` : '—';
const mm = m => m ? `${+m.slice(5,7)}月` : '—';
const addM = (m, k) => { let y = +m.slice(0,4), mo = +m.slice(5,7) - 1 + k; y += Math.floor(mo/12); mo = ((mo%12)+12)%12; return `${y}-${String(mo+1).padStart(2,'0')}`; };
const diffM = (a, b) => (+b.slice(0,4) - +a.slice(0,4))*12 + (+b.slice(5,7) - +a.slice(5,7));
const today = new Date();
const iso = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const nowM = iso(today).slice(0,7);
S.work = nowM;
const WD = '日月火水木金土';
const toNum = v => { const n = Number(String(v ?? '').replace(/[,，\s円]/g,'').replace(/^−/,'-')); return isFinite(n) ? n : 0; };
const sum = (list, kinds, f = () => true) => list.filter(r => kinds.includes(r.kind) && f(r)).reduce((a, r) => a + (+r.amount || 0), 0);
const has = (list, kind, f = () => true) => list.some(r => r.kind === kind && f(r));
const basesInView = () => S.base === '合算' ? BASES : [S.base];
const view = () => S.rows.filter(r => S.base === '合算' || r.base === S.base);
const ofBase = b => S.rows.filter(r => r.base === b);
const monthOpts = (sel, from = '2025-04', to = addM(nowM, 6)) => { let o = '', m = to; while (m >= from) { o += `<option value="${m}" ${m===sel?'selected':''}>${ym(m)}</option>`; m = addM(m,-1); } return o; };
const ICON_DOC = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/></svg>';
function toast(msg){ const t = document.createElement('div'); t.className='toast'; t.setAttribute('role','status'); t.textContent = msg; $('toastRoot').replaceChildren(t); setTimeout(()=>{ t.remove(); }, 2600); }
function firstSm(b){ const ks = ofBase(b).filter(r => r.kind==='K10').map(r => r.sm).sort(); return ks[0] || null; }
function pill(state, text){ const def = {ok:'✓ 一致', done:'✓ 入力済', bad:'! 差あり', warn:'清算待ち', wait:'入金待ち', todo:'未入力', na:'対象なし', open:'! 要確認', pay:'通知待ち', solved:'✓ 解消'}; const cls = {done:'ok', solved:'ok', open:'bad', pay:'wait'}[state] || state; return `<span class="pill ${cls}">${text || def[state]}</span>`; }
const fmtDate = s => { const d = new Date(s); return `${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; };
const linkOk = u => /^https:\/\//.test(u||'');

/* ================= 計算 ================= */
function settlement(list, pm) {
  const inM = list.filter(r => r.pm === pm && ['T10','T11','T20','T30','T32','B10','X99'].includes(r.kind));
  const fac = sum(inM, ['T10']), redo = sum(inM, ['T11']), off = sum(inM, ['T20']), fee = sum(inM, ['T30','T32']), late = sum(inM,['T32']), fix = sum(inM, ['X99']);
  const paidHas = has(inM, 'B10'), paid = sum(inM, ['B10']);
  const expect = fac + redo + off + fee + fix;
  const status = !inM.length ? 'none' : !paidHas ? 'wait' : Math.abs(expect - paid) < 1 ? 'ok' : 'bad';
  return {inM, fac, redo, off, fee, late, fix, paid, paidHas, expect, status};
}
function reconRows(list) {
  const sms = [...new Set(list.filter(r => r.sm && ['K10','K30','T10','T20'].includes(r.kind)).map(r => r.sm))].sort();
  return sms.map(sm => {
    const f = r => r.sm === sm;
    const k10 = sum(list, ['K10'], f), t10 = sum(list, ['T10'], f), k30 = sum(list, ['K30'], f), off = sum(list, ['T20'], f), redo = sum(list, ['T11'], f);
    const hasK30 = has(list, 'K30', f);
    const gap = hasK30 ? k30 - t10 : null, open = hasK30 ? gap - off : null;
    const state = !hasK30 ? 'pay' : Math.abs(open) < 1 ? 'solved' : diffM(sm, nowM) <= 3 ? 'warn' : 'open';
    return {sm, k10, t10, nf: k10 - t10, k30, hasK30, gap, off, redo, open, state};
  });
}
const openItems = b => reconRows(ofBase(b)).filter(r => r.state === 'warn' || r.state === 'open').map(r => ({...r, base:b}));
const feeGuess = fac => fac > 0 ? Math.round(fac * S.settings.feeRate + S.settings.feeFixed) : 0;
function avgT10(b, beforeSm, n = 3) { const rs = reconRows(ofBase(b)).filter(r => r.sm < beforeSm && r.t10 > 0).slice(-n); return rs.length ? Math.round(rs.reduce((a,r)=>a+r.t10,0)/rs.length) : 0; }
function latestT10(b){ const rs = reconRows(ofBase(b)).filter(r => r.t10 > 0); return rs.at(-1) || null; }
// 清算のルール：国保連の確定額と立替請求の差は、通常2か月後（提供月＋3か月目の立替入金）に差し引かれる。
// 差（不足）が立替請求の20％を超えると、1か月早まる（提供月＋2か月目の立替入金）。
function settleTiming(t10, gap) { const ratio = t10 && gap < 0 ? -gap / t10 : 0; return {ratio, early: ratio >= S.settings.alertRatio}; }
const settleMonth = (sm, early) => addM(sm, early ? 2 : 3);
function earlyRisk(b) {
  const r = reconRows(ofBase(b)).filter(x => x.hasK30 && x.gap < 0 && x.state !== 'solved').at(-1);
  if (!r) return {ratio:0, short:0, base:0};
  const ratio = -r.gap / (r.t10 || 1);
  return {ratio, short:r.gap, base:r.t10, sm:r.sm, state: ratio >= S.settings.alertRatio ? 'bad' : ratio >= S.settings.alertRatio*0.75 ? 'warn' : 'ok'};
}
function regular(m) {
  const list = view(), bs = basesInView();
  const reqSm = addM(m,-1), paidSm = addM(m,-3), setSm = addM(m,-2);
  const req = sum(list,['K10'],r=>r.sm===reqSm), reqT = sum(list,['T10'],r=>r.sm===reqSm);
  const paidHas = has(list,'K30',r=>r.sm===paidSm), paid = sum(list,['K30'],r=>r.sm===paidSm);
  const per = bs.map(b => { const L = ofBase(b), h = has(L,'K30',r=>r.sm===setSm), t = sum(L,['T10'],r=>r.sm===setSm), g = h ? sum(L,['K30'],r=>r.sm===setSm) - t : null;
    const tm = g == null ? {ratio:0, early:false} : settleTiming(t, g); return {b, has:h, gap:g, t, ...tm, when: g == null ? null : settleMonth(setSm, tm.early)}; });
  const setHas = per.some(x => x.has), gap = per.reduce((a,x)=>a+(x.gap||0),0);
  const rets = S.returns.filter(x => bs.includes(x.base) && x.sm === setSm), retSum = -rets.reduce((a,x)=>a+toNum(x.amount),0);
  return {m, reqSm, req, reqT, paidSm, paid, paidHas, setSm, setHas, gap, per, rets, retSum, other: gap - retSum};
}
function anomalies(b) {
  const rs = reconRows(ofBase(b)).filter(r => r.k10 > 0); if (rs.length < 2) return [];
  const [p, c] = rs.slice(-2); const ch = (c.k10 - p.k10) / p.k10;
  return Math.abs(ch) >= S.settings.anomaly ? [{b, sm:c.sm, prev:p.k10, cur:c.k10, ch}] : [];
}
function kokuhoDeadline(m) { // 請求月mの国保連締切（10日、土日祝なら翌営業日）
  const d = new Date(+m.slice(0,4), +m.slice(5,7)-1, 10);
  while (d.getDay() === 0 || d.getDay() === 6 || HOLIDAYS.has(iso(d))) d.setDate(d.getDate()+1);
  return d;
}
function estOf(b, sm){ return S.estimates.find(e => e.base === b && e.sm === sm); }
function forecast() {
  const c = S.settings.cash || {}, start = c.asOf || nowM, costs = (c.costs||[]).reduce((a,x)=>a+toNum(x.amount),0);
  let bal = c.opening == null ? null : toNum(c.opening);
  const rows = [];
  for (let i = 0; i < 6; i++) {
    const m = addM(start, i); let inflow = 0; const parts = [];
    BASES.forEach(b => {
      const fs = firstSm(b); if (!fs || addM(m,-1) < fs) return;
      const st = settlement(ofBase(b), m);
      let v, kind;
      if (st.paidHas) { v = st.paid; kind = '確定'; }
      else if (st.fac > 0) { v = st.expect - (st.fee ? 0 : feeGuess(st.fac)); kind = '請求済み'; }
      else {
        const sm = addM(m,-1), est = estOf(b, sm), basis = est ? toNum(est.amount) : avgT10(b, sm);
        const offs = openItems(b).filter(o => o.sm === addM(m,-3)).reduce((a,o)=>a+o.open,0);
        v = basis - feeGuess(basis) + offs; kind = est ? '売上概算から推計' : '直近3か月平均から推計';
      }
      inflow += v; parts.push({b, v, kind});
    });
    if (bal != null) bal += inflow - costs;
    rows.push({m, inflow, parts, costs, bal});
  }
  return rows;
}
function feeSeries(list) {
  const pms = [...new Set(list.filter(r => r.kind === 'T30' || r.kind === 'T32').map(r => r.pm))].sort().slice(-12);
  return pms.map(pm => { const fee = -sum(list, ['T30','T32'], r => r.pm === pm), fac = sum(list, ['T10','T11'], r => r.pm === pm), late = -sum(list,['T32'],r=>r.pm===pm);
    return {pm, fee, late, fac, rate: fac ? fee/fac : 0, apr: fac ? fee/fac*12 : 0}; });
}

/* ================= 書き込み・記録 ================= */
async function logIt(action, text) { if (!db) return; try { await db.collection('logs').add({at:new Date().toISOString(), who:S.me || '未選択', action, text}); } catch (e) {} }
async function replaceDocs(oldRows, newDocs, text) {
  if (!db) throw new Error('nodb');
  for (const r of oldRows) await db.doc('entries/' + r.id).delete();
  const now = new Date().toISOString();
  for (const d of newDocs) await db.collection('entries').add({checked:false, memo:'', sm:'', ...d, createdAt: now, by:S.me||''});
  const before = oldRows.map(r => `${KINDS[r.kind].name}${sgn(r.amount)}`).join('、'), after = newDocs.map(d => `${KINDS[d.kind].name}${sgn(d.amount)}`).join('、');
  await logIt(oldRows.length ? '修正' : '入力', `${text}｜${oldRows.length?`変更前：${before||'なし'}／`:''}変更後：${after||'なし'}`);
}
async function saveSettings(patch, text) { const next = {...S.settings, ...patch}; await db.doc('settings/main').set(next); S.settings = next; if (text) logIt('設定', text); }

/* ================= ドロワー ================= */
let drawerCleanup = null;
function openDrawer({eyebrow, title, note, body, footer, mount, pre}) {
  $('drawerRoot').innerHTML = `<div class="backdrop" data-close="1"></div><aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="dTitle">
    <div class="dh"><div class="col" style="gap:2px;flex:1"><span class="eyebrow">${eyebrow||''}</span><h3 id="dTitle">${title}</h3></div><button type="button" class="btn iconbtn" data-close="1" aria-label="閉じる">✕</button></div>
    <div class="db">${pre||''}${note?`<div class="docnote">${note.includes('class="chips"')?'':ICON_DOC}<div class="col" style="gap:8px;min-width:0">${note}</div></div>`:''}${body}</div>
    <div class="df">${footer||''}</div></aside>`;
  $('drawerRoot').querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', closeDrawer));
  const root = $('drawerRoot').querySelector('.drawer');
  const onKey = e => { if (e.key === 'Escape') closeDrawer(); };
  document.addEventListener('keydown', onKey);
  drawerCleanup = () => document.removeEventListener('keydown', onKey);
  document.body.style.overflow = 'hidden';
  if (mount) mount(root);
  setTimeout(() => { const f = root.querySelector('.db input:not([type=radio]):not([type=checkbox]), .db select, .db textarea'); f && f.focus(); }, 30);
}
function closeDrawer(){ $('drawerRoot').innerHTML = ''; document.body.style.overflow = ''; drawerCleanup && drawerCleanup(); drawerCleanup = null; if (pendingRender) { pendingRender = false; render(); } }
const footerSave = (label='保存する') => `<button type="button" class="btn primary" id="dSave">${label}</button><button type="button" class="btn" data-close="1">キャンセル</button><span class="hint" id="dMsg" role="status"></span>`;
const noMe = () => !S.me ? `<div class="res warn" style="margin:0 0 14px;display:flex;gap:8px;align-items:center">${ic('user',16)}左下で名前を選ぶと、履歴に残ります</div>` : '';

/* ================= ① 国保連への請求 ================= */
function openStepA(b, sm) {
  const rs = ofBase(b).filter(r => r.sm === sm);
  const k10 = rs.filter(r => r.kind === 'K10'), t10 = rs.filter(r => r.kind === 'T10');
  let parts = k10.length ? (k10.length === 1 && Array.isArray(k10[0].parts) ? k10[0].parts.slice() : k10.map(r => r.amount)) : [''];
  const kTot = sum(k10, ['K10']), tTot = sum(t10, ['T10']);
  const reason = t10[0]?.reason || '', mode0 = !t10.length || tTot === kTot ? '1' : reason === NF_REASONS[0] ? '2' : '0', same = mode0 === '1';
  const memo = k10[0]?.note ?? '';
  const dl0 = kokuhoDeadline(addM(sm,1));
  openDrawer({
    eyebrow:`① 国保連への請求｜${b}`, title:`${ym(sm)}提供分の請求`,
    note:`<div class="chips">${chip('doc','請求データ（サマリ）の合計')}${chip('repeat','トワライズへの請求額')}${chip('calendar',`締切 ${dl0.getMonth()+1}/${dl0.getDate()}（${WD[dl0.getDay()]}）`)}</div><div class="rule">${ic('warn',15)}<span>返戻の再請求分は、トワライズに請求しない<small>（二重の立替になり、20％ルールに当たりやすくなるため）</small></span></div>`,
    pre: drawerFlow('A', b, addM(sm,1)),
    body: noMe() + `
      <div class="sec"><h4><span class="n">1</span>国保連への請求額</h4>
        <div class="lines" id="aParts"></div>
        <div><button type="button" class="btn small" id="aAdd">＋ 請求を追加（返戻の再請求分など）</button></div>
        <div class="ro"><span>国保連への請求 合計</span><b class="num" id="aKTot">0</b></div></div>
      <div class="sec"><h4><span class="n">2</span>トワライズへの立替請求額</h4>
        <div class="choice" role="radiogroup" aria-label="立替請求額">
          <label><input type="radio" name="aSame" value="1" ${mode0==='1'?'checked':''}>国保連の請求と同じ金額</label>
          <label><input type="radio" name="aSame" value="2" ${mode0==='2'?'checked':''}>返戻の再請求分を除く（新規分だけ）</label>
          <label><input type="radio" name="aSame" value="0" ${mode0==='0'?'checked':''}>その他の理由で金額が違う</label></div>
        <div id="aRe" class="col" ${mode0==='2'?'':'hidden'}>
          <label class="f">返戻の再請求分の額（円）<span class="sub">国保連にだけ請求し、トワライズには請求しない額</span><input class="amt" id="aReAmt" inputmode="numeric" value="${mode0==='2'?yen(kTot-tTot):''}"></label></div>
        <div id="aDiff" class="col" ${mode0==='0'?'':'hidden'}>
          <label class="f">トワライズへの請求額（円）<input class="amt" id="aT" inputmode="numeric" value="${same?'':yen(tTot)}"></label>
          <label class="f">立替しない理由<span class="sub">国保連には請求するが、トワライズには請求しない分の理由</span>
            <select id="aReason"><option value="">選んでください</option>${NF_REASONS.map(x=>`<option ${x===reason?'selected':''}>${x}</option>`).join('')}</select></label></div></div>
      <div class="sec"><label class="f">メモ（任意）<input id="aMemo" value="${esc(memo)}" placeholder="例：②は8月分の月遅れ請求"></label><div class="calc" id="aCalc"></div></div>`,
    footer: footerSave('保存して次へ'),
    mount: root => {
      const draw = () => {
        $('aParts').innerHTML = parts.map((v,i) => `<div class="partline"><span class="hint">${'①②③④⑤⑥'[i]}枚目</span><input class="amt" data-pi="${i}" inputmode="numeric" value="${v===''?'':yen(v)}" placeholder="0" aria-label="${i+1}枚目の請求額"><button type="button" class="btn iconbtn" data-pdel="${i}" aria-label="この行を削除" ${parts.length===1?'disabled':''}>✕</button></div>`).join('');
        $('aAdd').disabled = parts.length >= 6; calc();
      };
      const calc = () => {
        const k = parts.reduce((a,v)=>a+toNum(v),0); $('aKTot').textContent = yen(k);
        const md = root.querySelector('input[name=aSame]:checked').value, t = md === '1' ? k : md === '2' ? k - toNum($('aReAmt').value) : toNum($('aT').value), nf = k - t;
        $('aCalc').innerHTML = `<div class="cl"><span>国保連への請求</span><span class="num">${yen(k)}</span></div><div class="cl"><span>トワライズへの立替請求</span><span class="num">${yen(t)}</span></div><div class="cl tot"><span>立替しない額</span><span class="num">${nf?sgn(nf):'0'}</span></div>` +
          (nf ? `<div class="res warn">${nf>0?`${yen(nf)}円は立替されず、国保連から入金されたあとトワライズの清算で戻ってきます。`:`立替請求の方が ${yen(-nf)}円 多くなっています。入力をご確認ください。`}</div>` : `<div class="res ok">国保連への請求と立替請求が一致しています。</div>`) +
          (md === '1' && parts.filter(v => toNum(v) > 0).length > 1 ? `<div class="res warn">請求が複数に分かれています。返戻の再請求分が入っていれば、トワライズには請求しません（「返戻の再請求分を除く」を選んでください）。</div>` : '');
        const est = estOf(b, sm); if (est && k) { const d = (t - toNum(est.amount)) / toNum(est.amount); if (Math.abs(d) >= .1) $('aCalc').insertAdjacentHTML('beforeend', `<div class="res warn">お伝えした売上概算（${yen(est.amount)}円）と ${(d*100).toFixed(1)}％ 違います。資金繰りの画面で理由を残してください。</div>`); }
      };
      root.addEventListener('input', e => { if (e.target.dataset.pi != null) parts[+e.target.dataset.pi] = e.target.value; calc(); });
      root.addEventListener('change', e => { if (e.target.name === 'aSame') { $('aDiff').hidden = e.target.value !== '0'; $('aRe').hidden = e.target.value !== '2'; } calc(); });
      root.addEventListener('click', e => { const t = e.target.closest('[data-pdel]'); if (t) { parts.splice(+t.dataset.pdel,1); draw(); } });
      $('aAdd').addEventListener('click', () => { parts.push(''); draw(); setTimeout(()=>root.querySelector(`[data-pi="${parts.length-1}"]`)?.focus(),0); });
      draw();
      $('dSave').addEventListener('click', async () => {
        const nums = parts.map(toNum).filter(n => n > 0), k = nums.reduce((a,b)=>a+b,0);
        const md = root.querySelector('input[name=aSame]:checked').value, s = md === '1', msg = $('dMsg');
        const t = s ? k : md === '2' ? k - toNum($('aReAmt').value) : toNum($('aT').value);
        if (!k) return msg.textContent = '国保連への請求額を入れてください。';
        if (md === '2' && !toNum($('aReAmt').value)) return msg.textContent = '返戻の再請求分の額を入れてください。';
        if (md === '0' && !t) return msg.textContent = 'トワライズへの請求額を入れてください。';
        if (md === '0' && t !== k && !$('aReason').value) return msg.textContent = '立替しない理由を選んでください。';
        const note = $('aMemo').value.trim(), pm = addM(sm,1), rsn = s ? '' : md === '2' ? NF_REASONS[0] : $('aReason').value;
        $('dSave').disabled = true; msg.textContent = '保存しています…';
        try {
          await replaceDocs([...k10, ...t10], [
            {base:b, kind:'K10', sm, pm, amount:k, parts:nums, note, memo: [nums.length>1 ? nums.map((n,i)=>`${'①②③④⑤⑥'[i]}${yen(n)}`).join(' ') : '', note].filter(Boolean).join('／')},
            {base:b, kind:'T10', sm, pm, amount:t, reason:rsn, memo: rsn}
          ], `${b} ${ym(sm)}提供分の請求`);
          closeDrawer(); savedNextAuto(`${b}の${mm(sm)}分の請求を保存しました`, 'A');
        } catch (err) { $('dSave').disabled = false; msg.textContent = '保存できませんでした。もう一度お試しください。'; }
      });
    }
  });
}

/* ================= ④ トワライズ明細・精算 ================= */
function openStepB(b, pm) {
  const rs = ofBase(b).filter(r => r.pm === pm);
  const fac = rs.filter(r => r.kind === 'T10');
  const editable = rs.filter(r => ['T11','T20','T30','T32','B10'].includes(r.kind));
  let lines = rs.filter(r => r.kind === 'T20' || r.kind === 'T11').map(r => ({sm: r.sm || addM(pm,-3), type: r.offType || (r.kind==='T11' ? 'redo' : r.amount > 0 ? 'more' : 'henrei'), amt: Math.abs(r.amount)}));
  const feeRow = rs.filter(r => r.kind === 'T30'), lateRow = rs.filter(r => r.kind === 'T32'), paidRow = rs.filter(r => r.kind === 'B10');
  const facTot = sum(fac, ['T10']);
  const sug = openItems(b).filter(o => !lines.some(l => l.sm === o.sm) && settleMonth(o.sm, settleTiming(o.t10, o.gap).early) <= pm);
  const risk = earlyRisk(b);
  openDrawer({
    eyebrow:`④ トワライズ明細・精算の確認｜${b}`, title:`${ym(pm)}の立替入金`,
    note:`<div class="chips">${chip('receipt','トワライズの明細（17日ごろ）')}${chip('bank','尼信の通帳')}</div><div class="rule">${ic('check',15)}<span>明細を上から写すと、入金が計算どおりか自動でチェック</span></div>`,
    pre: drawerFlow('B', b, pm),
    body: noMe() + `
      <div class="sec"><h4><span class="n">1</span>今回の立替請求（①で入力済み）</h4>
        ${fac.length ? fac.map(r => `<div class="ro"><span>${mm(r.sm)}提供分の立替請求</span><b class="num">${yen(r.amount)}</b></div>`).join('') : `<div class="res warn" style="margin:0">この月の立替請求がまだありません。先に「① 国保連への請求」で${mm(addM(pm,-1))}提供分を入れてください。</div>`}</div>
      <div class="sec"><h4><span class="n">2</span>清算金（明細の「清算金」）</h4>
        <p class="hint">国保連の確定額と立替請求の差が、通常は2か月後（20％を超えると1か月後）にここで差し引かれます。提供月ごとに1行ずつ入れます。なければ空のままで構いません。</p>
        ${sug.length ? `<div class="col" style="gap:6px"><span class="hint">この月に清算される見込みの差額（押すと明細に追加されます）</span><div class="suggest">${sug.map(o => `<button type="button" data-sug="${o.sm}|${o.open}">${mm(o.sm)}分 ${sgn(o.open)}円</button>`).join('')}</div></div>` : ''}
        ${risk.state && risk.state !== 'ok' ? `<div class="res ${risk.state}" style="margin:0">${mm(risk.sm)}提供分の不足額が立替請求の ${(risk.ratio*100).toFixed(1)}％ です。${risk.state==='bad'?`${(S.settings.alertRatio*100).toFixed(0)}％を超えたため、清算が1か月早まり、${mm(settleMonth(risk.sm,true))}の立替入金で差し引かれます。`:`${(S.settings.alertRatio*100).toFixed(0)}％を超えると、清算が1か月早まります。`}</div>` : ''}
        <div class="lines" id="bLines"></div>
        <div><button type="button" class="btn small" id="bAdd">＋ 明細を追加</button></div></div>
      <div class="sec"><h4><span class="n">3</span>手数料</h4>
        <div class="fgrid">
          <label class="f">手数料（円）<span class="sub">明細の「手数料」欄</span><input class="amt" id="bFee" inputmode="numeric" value="${feeRow.length?yen(-sum(feeRow,['T30'])):''}" placeholder="0"></label>
          <label class="f">遅延損害金（円）<span class="sub">あるときだけ。手数料と分けて入れます</span><input class="amt" id="bLate" inputmode="numeric" value="${lateRow.length?yen(-sum(lateRow,['T32'])):''}" placeholder="0"></label></div>
        <div class="row"><button type="button" class="btn small" id="bFeeGuess">目安を入れる（${yen(feeGuess(facTot))}円）</button><span class="hint">目安＝立替請求 × ${(S.settings.feeRate*100).toFixed(1)}％ ＋ ${yen(S.settings.feeFixed)}円</span></div></div>
      <div class="sec"><h4><span class="n">4</span>尼信の入金額</h4>
        <label class="f">通帳に入金された額（円）<span class="sub">まだ入金されていなければ空のままで保存できます</span><input class="amt" id="bPaid" inputmode="numeric" value="${paidRow.length?yen(sum(paidRow,['B10'])):''}" placeholder="未入金"></label>
        <div class="calc" id="bCalc"></div></div>`,
    footer: footerSave('保存して次へ'),
    mount: root => {
      const draw = () => {
        $('bLines').innerHTML = lines.map((l,i) => `<div class="line">
          <select data-li="${i}" data-f="sm" aria-label="対象の提供月">${monthOpts(l.sm, '2025-04', pm)}</select>
          <select data-li="${i}" data-f="type" aria-label="内容">${Object.entries(OFF_TYPES).map(([k,v])=>`<option value="${k}" ${k===l.type?'selected':''}>${v.label}</option>`).join('')}</select>
          <input class="amt" data-li="${i}" data-f="amt" inputmode="numeric" value="${l.amt===''?'':yen(l.amt)}" placeholder="金額" aria-label="金額">
          <span class="hint">${OFF_TYPES[l.type].sign<0?'差し引く':'足す'}</span>
          <button type="button" class="btn iconbtn x" data-ldel="${i}" aria-label="この明細を削除">✕</button></div>`).join('') || '<p class="hint">清算金の明細はありません。</p>';
        calc();
      };
      const calc = () => {
        const offs = lines.map(l => ({...l, v: OFF_TYPES[l.type].sign * toNum(l.amt)}));
        const fee = toNum($('bFee').value), late = toNum($('bLate').value), paidStr = $('bPaid').value.trim(), paid = toNum(paidStr);
        const expect = facTot + offs.reduce((a,o)=>a+o.v,0) - fee - late;
        const res = !paidStr ? `<div class="res wait">入金待ち：計算上は ${yen(expect)}円 が入金される見込みです。</div>`
          : Math.abs(paid - expect) < 1 ? `<div class="res ok">✓ 計算どおりです。入金額 ${yen(paid)}円 と一致しました。</div>`
          : `<div class="res bad">! 計算と ${sgn(paid - expect)}円 ずれています。明細の入れ漏れがないか確認してください。</div>`;
        const g = feeGuess(facTot), feeNote = fee && g && Math.abs(fee - g) / g > .2 ? `<div class="res warn">手数料が目安（${yen(g)}円）と ${yen(Math.abs(fee-g))}円 違います。遅延損害金が含まれていれば分けて入れてください。</div>` : '';
        $('bCalc').innerHTML = `<div class="cl"><span>立替請求</span><span class="num">${yen(facTot)}</span></div>` +
          offs.map(o => `<div class="cl"><span>${OFF_TYPES[o.type].label}（${mm(o.sm)}分）</span><span class="num">${sgn(o.v)}</span></div>`).join('') +
          (fee?`<div class="cl"><span>手数料</span><span class="num">${sgn(-fee)}</span></div>`:'') + (late?`<div class="cl"><span>遅延損害金</span><span class="num">${sgn(-late)}</span></div>`:'') +
          `<div class="cl tot"><span>計算上の入金額</span><span class="num">${yen(expect)}</span></div>${res}${feeNote}`;
      };
      root.addEventListener('input', e => { const i = e.target.dataset.li; if (i != null) lines[+i][e.target.dataset.f] = e.target.value; calc(); });
      root.addEventListener('change', e => { const i = e.target.dataset.li; if (i != null) { lines[+i][e.target.dataset.f] = e.target.value; if (e.target.dataset.f === 'type') draw(); else calc(); } });
      root.addEventListener('click', e => {
        const d = e.target.closest('[data-ldel]'); if (d) { lines.splice(+d.dataset.ldel,1); draw(); return; }
        const s = e.target.closest('[data-sug]'); if (s) { const [sm, v] = s.dataset.sug.split('|'); lines.push({sm, type: +v < 0 ? 'henrei' : 'more', amt: Math.abs(+v)}); s.remove(); draw(); }
      });
      $('bAdd').addEventListener('click', () => { lines.push({sm: addM(pm,-3), type:'henrei', amt:''}); draw(); setTimeout(()=>root.querySelector(`[data-li="${lines.length-1}"][data-f="amt"]`)?.focus(),0); });
      $('bFeeGuess').addEventListener('click', () => { $('bFee').value = yen(feeGuess(facTot)); calc(); });
      draw();
      $('dSave').addEventListener('click', async () => {
        const msg = $('dMsg');
        if (lines.some(l => !toNum(l.amt))) return msg.textContent = '金額が空の明細があります。入れるか削除してください。';
        const docs = lines.map(l => ({base:b, kind: OFF_TYPES[l.type].kind, sm:l.sm, pm, amount: OFF_TYPES[l.type].sign * toNum(l.amt), offType:l.type, memo:`${mm(l.sm)}分の${OFF_TYPES[l.type].label}`}));
        const fee = toNum($('bFee').value), late = toNum($('bLate').value), paidStr = $('bPaid').value.trim();
        if (fee) docs.push({base:b, kind:'T30', pm, amount:-fee});
        if (late) docs.push({base:b, kind:'T32', pm, amount:-late});
        if (paidStr) docs.push({base:b, kind:'B10', pm, amount: toNum(paidStr)});
        $('dSave').disabled = true; msg.textContent = '保存しています…';
        try { await replaceDocs(editable, docs, `${b} ${ym(pm)}の精算`); closeDrawer(); savedNextAuto(`${b}の${mm(pm)}の精算を保存しました`, 'B'); }
        catch (err) { $('dSave').disabled = false; msg.textContent = '保存できませんでした。もう一度お試しください。'; }
      });
    }
  });
}

/* ================= ② 国保連 払出し通知 ================= */
function openStepC(b, sm) {
  const all = ofBase(b), k30 = all.filter(r => r.kind === 'K30' && r.sm === sm);
  const t = sum(all, ['T10'], r => r.sm === sm), k = sum(all, ['K10'], r => r.sm === sm), off = sum(all, ['T20'], r => r.sm === sm);
  const rets = S.returns.filter(x => x.base === b && x.sm === sm), retSum = rets.reduce((a,x)=>a+toNum(x.amount),0);
  openDrawer({
    eyebrow:`② 国保連 払出し通知の確認｜${b}`, title:`${ym(sm)}提供分の確定額`,
    note:`<div class="chips">${chip('mail',`払出し通知書（${mm(addM(sm,2))}5日ごろ）`)}${chip('bank','トワライズの口座への振込額')}</div><div class="rule">${ic('calc',15)}<span>立替請求との差 ＝ 清算の見込み</span></div><div class="rule">${ic('search',15)}<span>誰の分かは、10日の請求資料と照らし合わせて返戻台帳へ<small>（通知書は市町村番号ごとの合計）</small></span></div>`,
    pre: drawerFlow('C', b, addM(sm,2)),
    body: noMe() + `
      <div class="sec"><div class="ro"><span>国保連への請求（①）</span><b class="num">${yen(k)}</b></div><div class="ro"><span>立替請求（①）</span><b class="num">${yen(t)}</b></div>
        ${rets.length?`<div class="ro"><span>返戻台帳に記録済み（${rets.length}件）</span><b class="num">${yen(retSum)}</b></div>`:''}</div>
      <div class="sec"><label class="f">国保連の確定額（円）<span class="sub">払出し通知書の合計（この拠点・この提供月の分）</span><input class="amt" id="cK" inputmode="numeric" value="${k30.length?yen(sum(k30,['K30'])):''}"></label>
        <label class="f">メモ（任意）<input id="cMemo" value="${esc(k30[0]?.memo||'')}" placeholder="例：返戻3名（受給者証の期限切れ）"></label>
        <div class="calc" id="cCalc"></div></div>`,
    footer: footerSave('保存して次へ') + `<div class="spacer"></div><button type="button" class="btn" id="cRet">返戻を記録する</button>`,
    mount: root => {
      const calc = () => {
        const v = toNum($('cK').value), gap = v - t, open = gap - off;
        $('cCalc').innerHTML = `<div class="cl"><span>国保連の確定額</span><span class="num">${yen(v)}</span></div><div class="cl"><span>立替請求</span><span class="num">${sgn(-t)}</span></div><div class="cl tot"><span>返戻・未払い</span><span class="num">${gap?sgn(gap):'0'}</span></div>` +
          (off ? `<div class="cl"><span>④の精算で相殺済み</span><span class="num">${sgn(off)}</span></div>` : '') +
          (!v ? '' : Math.abs(open) < 1 ? `<div class="res ok">✓ 差額はありません（または相殺済みです）。</div>`
            : (() => { const tm = settleTiming(t, gap), when = settleMonth(sm, tm.early);
                return `<div class="res warn">${open<0?`${yen(-open)}円 が国保連から入っていません。誰の分かを返戻台帳に記録します。`:`${yen(open)}円 多く支払われています。過去の返戻の再請求分などが入っている可能性があります。`}<br>清算：${tm.early?`不足額が立替請求の ${(tm.ratio*100).toFixed(1)}％ で${(S.settings.alertRatio*100).toFixed(0)}％を超えるため、<b>1か月早まり</b>`:'通常どおり2か月後に'}、${mm(when)}15日ごろの立替入金で差し引かれる見込みです。</div>`; })()) +
          (v && gap < 0 && Math.abs(retSum + gap) > 1 && rets.length ? `<div class="res warn">返戻台帳の合計（${yen(retSum)}円）と未払い額（${yen(-gap)}円）が合っていません。</div>` : '');
      };
      root.addEventListener('input', calc); calc();
      $('cRet').addEventListener('click', () => { closeDrawer(); openReturnEditor(null, {base:b, sm}); });
      $('dSave').addEventListener('click', async () => {
        const v = toNum($('cK').value), msg = $('dMsg');
        if (!v) return msg.textContent = '国保連の確定額を入れてください。';
        $('dSave').disabled = true; msg.textContent = '保存しています…';
        try { await replaceDocs(k30, [{base:b, kind:'K30', sm, pm:addM(sm,2), amount:v, memo:$('cMemo').value.trim()}], `${b} ${ym(sm)}提供分の払出し通知`); closeDrawer(); savedNextAuto(`${b}の${mm(sm)}分の確定額を保存しました`, 'C'); }
        catch (err) { $('dSave').disabled = false; msg.textContent = '保存できませんでした。もう一度お試しください。'; }
      });
    }
  });
}

/* ================= 今月の作業 ================= */
function stepStatus(step, b, w) {
  const rs = ofBase(b), fs = firstSm(b);
  if (step === 'A') { const sm = addM(w,-1); if (fs && sm < fs) return {state:'na'};
    const k = sum(rs,['K10'],r=>r.sm===sm), t = sum(rs,['T10'],r=>r.sm===sm);
    if (!has(rs,'K10',r=>r.sm===sm) || !has(rs,'T10',r=>r.sm===sm)) return {state:'todo'};
    return {state:'done', lines:[['国保連請求',yen(k)],['立替請求',yen(t)],...(k!==t?[['立替しない額',sgn(k-t)]]:[])]}; }
  if (step === 'B') { const st = settlement(rs, w);
    if (st.status === 'none') return {state: fs && addM(w,-1) < fs ? 'na' : 'todo'};
    const lines = [['立替請求',yen(st.fac+st.redo)],['見込み入金',yen(st.expect)]]; if (st.paidHas) lines.push(['尼信入金',yen(st.paid)]);
    return {state:st.status, lines, onlyFac: !st.paidHas && !st.off && !st.fee}; }
  if (step === 'C') { const sm = addM(w,-2); if (fs && sm < fs) return {state:'na'};
    if (!has(rs,'K30',r=>r.sm===sm)) return {state:'todo'};
    const g = sum(rs,['K30'],r=>r.sm===sm) - sum(rs,['T10'],r=>r.sm===sm);
    return {state:'done', lines:[['国保連の確定額',yen(sum(rs,['K30'],r=>r.sm===sm))],['清算の見込み',g?sgn(g):'0']]}; }
}
function attentionItems() {
  const items = [];
  BASES.forEach(b => {
    openItems(b).forEach(o => items.push({sev: o.state==='open'?'bad':'warn', text:`${b}　${ym(o.sm)}提供分の差額 ${sgn(o.open)}円が${o.state==='open'?'清算予定の月を過ぎても解消していません':'まだ清算されていません'}`, act:`<button type="button" class="btn small" data-recon="${b}|${o.sm}">内訳を見る</button>`}));
    [...new Set(ofBase(b).map(r=>r.pm))].sort().slice(-6).forEach(pm => { const st = settlement(ofBase(b), pm); if (st.status === 'bad') items.push({sev:'bad', text:`${b}　${ym(pm)}の精算で、計算と入金が ${sgn(st.paid - st.expect)}円 ずれています`, act:`<button type="button" class="btn small" data-open="B" data-b="${b}" data-pm="${pm}">確認する</button>`}); });
    const rk = earlyRisk(b); if (rk.state && rk.state !== 'ok') items.push({sev:rk.state, text:`${b}　${ym(rk.sm)}提供分の不足額（${yen(-rk.short)}円）が立替請求の ${(rk.ratio*100).toFixed(1)}％ です。${rk.state==='bad'?`${(S.settings.alertRatio*100).toFixed(0)}％を超えたため、清算が1か月早まります（${mm(settleMonth(rk.sm,true))}の立替入金）`:`${(S.settings.alertRatio*100).toFixed(0)}％を超えると清算が1か月早まります`}`, act:`<button type="button" class="btn small" data-go="recon">突合を見る</button>`});
    anomalies(b).forEach(a => items.push({sev:'warn', text:`${b}　${ym(a.sm)}提供分の国保連請求が前月から ${(Math.abs(a.ch)*100).toFixed(1)}％ ${a.ch>0?'増えています':'減っています'}（${man(a.prev)}→${man(a.cur)}）`, act:`<button type="button" class="btn small" data-go="recon">突合を見る</button>`}));
  });
  const late = S.returns.filter(x => !['入金済','対象外'].includes(x.status) && x.plan && x.plan < nowM);
  if (late.length) items.push({sev:'bad', text:`再請求の予定月を過ぎた返戻が ${late.length}件 あります`, act:`<button type="button" class="btn small" data-go="returns">返戻台帳へ</button>`});
  S.estimates.forEach(e => { const act = sum(ofBase(e.base),['K10'],r=>r.sm===e.sm); if (act && Math.abs(act - toNum(e.amount))/toNum(e.amount) >= .1 && !e.reason) items.push({sev:'warn', text:`${e.base}　${ym(e.sm)}提供分の売上概算と実績の差が10％を超えています。理由が未入力です`, act:`<button type="button" class="btn small" data-go="cash">理由を入れる</button>`}); });
  const fc = forecast(); const neg = fc.find(r => r.bal != null && r.bal < 0);
  if (neg) items.push({sev:'bad', text:`資金繰りの見込みで、${ym(neg.m)}末の残高がマイナス（${sgn(neg.bal)}円）になります`, act:`<button type="button" class="btn small" data-go="cash">資金繰りへ</button>`});
  const unchecked = S.rows.filter(r => !r.checked).length;
  if (unchecked) items.push({sev:'wait', text:`確認チェックが付いていない行が ${unchecked}件 あります`, act:`<button type="button" class="btn small" data-golist="1">台帳で確認</button>`});
  const lb = S.settings.lastBackupAt; if (!lb || (Date.now() - new Date(lb)) > 30*864e5) items.push({sev:'warn', text: lb ? `最後のバックアップから30日以上たっています（${new Date(lb).toLocaleDateString('ja-JP')}）` : 'まだ一度もバックアップを取っていません', act:`<button type="button" class="btn small" data-go="settings">バックアップへ</button>`});
  return items;
}
function renderHome() {
  const w = S.work, d = today.getDate(), isNow = w === nowM;
  const dl0 = kokuhoDeadline(w), left = Math.ceil((dl0 - new Date(today.getFullYear(), today.getMonth(), today.getDate())) / 864e5);
  const phase = !isNow ? -1 : d <= dl0.getDate() ? 0 : d <= 14 ? 1 : d <= 20 ? 2 : 3;
  const cards = [
    {k:'A', t:'国保連・トワライズへ請求', doc:'請求データ（サマリ）', when:`〜${dl0.getMonth()+1}/${dl0.getDate()}（${WD[dl0.getDay()]}）`, desc:`${mm(addM(w,-1))}提供分の請求額`},
    {k:'C', t:'国保連の払出し通知', doc:'払出し通知書', when:'5日ごろ', desc:`${mm(addM(w,-2))}提供分の確定額`},
    {k:'D', t:'齋藤様へ報告', doc:'月次レポート', when:'5〜10日', desc:'3つの数字を送る'},
    {k:'B', t:'トワライズ明細', doc:'明細・尼信の通帳', when:'15・17日', desc:`${mm(w)}の立替入金`}
  ];
  const close = S.closes[w] || {}, nx = nextStep(w), nxK = nx.cur ? nx.cur.k : null;
  const stepHtml = cards.map((c, i) => {
    let body = '', allDone = true;
    if (c.k !== 'D') {
      body = BASES.map(b => {
        const s = stepStatus(c.k, b, w);
        if (!['done','ok','na'].includes(s.state)) allDone = false;
        const label = s.state === 'wait' && s.onlyFac ? pill('todo','精算待ち') : pill(s.state);
        const lines = (s.lines || []).map(([l,v]) => `<span>${l}　<span class="num">${v}</span></span>`).join('');
        const btn = s.state === 'na' ? '' : `<button type="button" class="btn small ${['todo','wait','bad'].includes(s.state)?'primary':''}" data-open="${c.k}" data-b="${b}">${s.state==='todo'?'入力する':s.state==='wait'?'続きを入力':'確認・修正'}</button>`;
        return `<div class="basebox"><div class="bt"><b>${b}</b>${label}</div>${lines?`<div class="bv">${lines}</div>`:''}${btn?`<div>${btn}</div>`:''}</div>`;
      }).join('');
    } else {
      allDone = !!close.reportedAt;
      body = `<div class="basebox"><div class="bt"><b>${ym(w)}分</b>${close.reportedAt ? pill('done','✓ 報告済み') : pill('todo')}</div>${close.reportedAt?`<div class="bv"><span>${new Date(close.reportedAt).toLocaleDateString('ja-JP')} 報告済み${close.reportedBy?`（${esc(close.reportedBy)}）`:''}</span></div>`:''}<div><button type="button" class="btn small ${close.reportedAt?'':'primary'}" data-goreport="1">レポートを開く</button></div></div>`;
    }
    return `<article class="step ${allDone?'done':''} ${c.k===nxK?'is-next':''}">${c.k===nxK?'<span class="ribbon">次はこれ</span>':''}<div class="head"><div class="no">${allDone?ic('check',18):ic(STEP_META[c.k].ic,18)}</div><div class="col" style="gap:2px"><span class="eyebrow">${STEP_META[c.k].no}　${c.when}</span><h3>${c.t}</h3></div></div><div class="chips">${chip('yen', c.desc, 'plain')}${chip('doc', c.doc, 'plain')}</div>${body}</article>`;
  }).join('');
  const docsState = close.docs || {};
  const docHtml = BASES.map(b => `<div class="col"><b style="font-size:14px">${b}</b>${DOCS.map(([k,n,s]) => { const v = docsState[`${BCODE[b]}_${k}`] || {}; return `<div class="docitem"><input type="checkbox" data-doc="${BCODE[b]}_${k}" ${v.done?'checked':''} aria-label="${b}の${n}を保存済み"><div class="nm">${n}<small>${s}${v.done&&v.by?`・${esc(v.by)}`:''}</small></div>${linkOk(v.url)?`<a href="${esc(v.url)}" target="_blank" rel="noopener">開く</a>`:`<button type="button" class="btn ghost small" data-doclink="${BCODE[b]}_${k}">リンク</button>`}</div>`; }).join('')}</div>`).join('');
  const items = attentionItems();
  const attn = items.length ? items.map(x => `<div class="it"><div class="t">${pill(x.sev, x.sev==='bad'?'! 要確認':x.sev==='warn'?'注意':'確認')}<span>${esc(x.text)}</span></div>${x.act}</div>`).join('') : '<p class="hint">確認が必要なことはありません。</p>';
  const tl = [['1〜10日','① 請求',1,10,'send'],['5日ごろ','② 払出し通知',4,7,'mail'],['5〜10日','③ 報告',5,10,'chat'],['15・17日','④ 立替入金・明細',13,20,'receipt'],['月末','返戻の連絡',25,31,'return']].map(([a,b,f,t,n])=>`<div class="tl ${isNow && d>=f && d<=t?'now':''}"><b>${ic(n,14)} ${a}</b>${b}</div>`).join('');
  const dlCls = isNow && left >= 0 ? (left === 0 ? 'today' : left <= 3 ? 'soon' : '') : '';
  $('main').innerHTML = `<div class="page">${guideBanner()}${nextCardHtml(w)}
    <section class="panel col" style="gap:14px">
      <div class="monthbar"><span class="mb-ic">${ic('list',20)}</span><div class="col" style="gap:0"><span class="eyebrow">今月の4ステップ</span><h1>${ym(w)}の作業</h1></div>
        <div class="mb-nav"><button type="button" class="btn navbtn" data-wm="-1" aria-label="前の月">‹</button>${w!==nowM?`<button type="button" class="btn small" data-wm="0">今月</button>`:''}<button type="button" class="btn navbtn" data-wm="1" aria-label="次の月">›</button></div>
        <div class="spacer"></div>
        <div class="deadline ${dlCls}">${ic('calendar',18)}<span class="hint">請求の締切</span><b class="big">${dl0.getMonth()+1}/${dl0.getDate()}（${WD[dl0.getDay()]}）</b>${isNow?(left>0?`<span class="pill wait">あと${left}日</span>`:left===0?'<span class="pill bad">今日まで</span>':'<span class="pill na">締切後</span>'):''}</div></div>
      <div class="timeline">${tl}</div>
    </section>
    <section class="steps">${stepHtml}</section>
    <div class="grid2">
      <section class="panel col" style="gap:12px"><div class="row"><h2>確認が必要なこと</h2><span class="hint">全拠点から自動で拾っています</span></div><div class="attn">${attn}</div></section>
      <section class="panel col" style="gap:12px"><div class="col" style="gap:2px"><h2>書類の保管チェック（${mm(w)}）</h2><p class="hint">国保連の電子請求システムの通知文書は、一定期間で消える場合があります。届いたら保存先（Googleドライブなど）のリンクを残します。</p></div><div class="docgrid">${docHtml}</div></section>
    </div></div>`;
}
async function setDoc(key, patch) {
  const c = S.closes[S.work] || {}, docs = {...(c.docs||{})}; docs[key] = {...(docs[key]||{}), ...patch, by:S.me||'', at:new Date().toISOString()};
  await db.doc('closes/' + S.work).set({...c, docs});
}

/* ================= 月次レポート ================= */
const pmList = list => [...new Set(list.filter(r => ['T10','T11','B10','T20','T30'].includes(r.kind)).map(r => r.pm))].filter(Boolean).sort();
function kpi5(pm) {
  const list = view(), sm = addM(pm,-1);
  const k = sum(list,['K10'],r=>r.sm===sm), kp = sum(list,['K10'],r=>r.sm===addM(sm,-1));
  const open = basesInView().flatMap(openItems), openSum = open.reduce((a,o)=>a+o.open,0);
  const fs = feeSeries(list), cur = fs.find(x => x.pm === pm), fy = +pm.slice(0,4) - (+pm.slice(5,7) < 4 ? 1 : 0), fyStart = `${fy}-04`;
  const fyFee = fs.filter(x => x.pm >= fyStart && x.pm <= pm).reduce((a,x)=>a+x.fee,0);
  const fc = forecast(), minRow = fc.filter(r => r.bal != null).sort((a,b)=>a.bal-b.bal)[0];
  const ests = basesInView().map(b => estOf(b, sm)).filter(Boolean), estSum = ests.reduce((a,e)=>a+toNum(e.amount),0), act = ests.reduce((a,e)=>a+sum(ofBase(e.base),['K10'],r=>r.sm===sm),0);
  return [
    {l:`国保連請求（${mm(sm)}提供分）`, v:yen(k), s: kp ? `前月比 ${((k-kp)/kp*100).toFixed(1)}％` : '前月データなし'},
    {l:'未解消の差異', v:`${open.length}件`, s: open.length ? `残高 ${sgn(openSum)}円` : 'すべて解消', cls: open.some(o=>o.state==='open') ? 'bad' : open.length ? 'warn' : ''},
    {l:'手数料（当月）', v: cur ? yen(cur.fee) : '—', s: cur ? `実効年率 約${(cur.apr*100).toFixed(1)}％・年度累計 ${man(fyFee)}` : '当月の手数料は未入力'},
    {l:'資金残高の最少見込み', v: minRow ? yen(minRow.bal) : '未設定', s: minRow ? `${ym(minRow.m)}末` : '資金繰りで残高を設定', cls: minRow && minRow.bal < 0 ? 'bad' : ''},
    {l:'売上概算との差', v: ests.length && act ? sgn(act - estSum) : '—', s: ests.length && act ? `${((act-estSum)/estSum*100).toFixed(1)}％` : '概算または実績なし', cls: ests.length && act && Math.abs(act-estSum)/estSum >= .1 ? 'warn' : ''}
  ];
}
function reportText(pm, st, open, comment, kp, rg) {
  return [
    `【LINOA ${S.base}】${ym(pm)}のご報告`,
    `・今月の請求額（${mm(rg.reqSm)}提供分）：${yen(rg.req)}円`,
    `・先月の国保連からの入金（${mm(rg.paidSm)}提供分）：${rg.paidHas ? yen(rg.paid)+'円' : '未入力'}`,
    `・来月の清算見込み（${mm(rg.setSm)}提供分）：${rg.setHas ? sgn(rg.gap)+'円' : '払出し通知待ち'}`,
    ...rg.per.filter(x => x.has && x.gap).map(x => `　└ ${x.b}：${sgn(x.gap)}円（${x.early ? `立替請求の${(x.ratio*100).toFixed(1)}％のため1か月早まり` : '通常どおり2か月後'}、${mm(x.when)}の立替入金で清算）`),
    ...rg.rets.map(x => `　└ 返戻 ${S.base==='合算'?x.base+' ':''}${x.uid || (x.count||1)+'名'}：${toNum(x.amount) ? sgn(-toNum(x.amount))+'円' : (x.pts ? yen(x.pts)+'点' : '金額未確定')}（${x.status}）`),
    rg.rets.length && rg.setHas && Math.abs(rg.other) >= 1 ? `　└ 返戻以外の差（再請求分の入金など）：${sgn(rg.other)}円` : null,
    '',
    `■ ${ym(pm)}の立替入金の内訳`,
    `・${kp[0].l}：${kp[0].v}円（${kp[0].s}）`,
    `・立替請求：${yen(st.fac)}円`,
    (st.off || st.redo) ? `・相殺・清算：${sgn(st.off + st.redo)}円` : null,
    ...st.inM.filter(r => r.kind==='T20' || r.kind==='T11').map(r => `　└ ${S.base==='合算'?r.base+' ':''}${r.memo || KINDS[r.kind].name}：${sgn(r.amount)}円`),
    st.fee ? `・手数料：${sgn(st.fee)}円（${kp[2].s}）` : null,
    st.paidHas ? `・尼信入金：${yen(st.paid)}円（${st.status==='ok'?'計算どおり':'計算との差 '+sgn(st.paid-st.expect)+'円'}）` : `・尼信入金：未入金（見込み ${yen(st.expect)}円）`,
    `・未解消の差異：${open.length}件` + (open.length ? '（' + open.map(r => `${S.base==='合算'?r.base+' ':''}${mm(r.sm)}分 ${sgn(r.open)}円`).join('、') + '）' : ''),
    kp[3].v !== '未設定' ? `・資金残高の最少見込み：${kp[3].v}円（${kp[3].s}）` : null,
    comment ? `\n${comment}` : null
  ].filter(Boolean).join('\n');
}
function renderReport() {
  const list = view(), pms = pmList(list);
  if (!pms.length) { $('main').innerHTML = `<div class="page"><div class="panel empty"><b>まだレポートがありません</b><span>「今月の作業」で請求と精算を入れると、ここにレポートが出ます。</span></div></div>`; return; }
  if (!S.repPm || !pms.includes(S.repPm)) { const paid = pms.filter(p => list.some(r => r.pm === p && r.kind === 'B10')); S.repPm = pms.includes(S.work) ? S.work : (paid.at(-1) || pms.at(-1)); }
  const pm = S.repPm, st = settlement(list, pm), open = basesInView().flatMap(openItems), close = S.closes[pm] || {}, kp = kpi5(pm), rg = regular(pm);
  const regRows = rg.rets.map(x => `<tr><td>返戻</td><td>${esc(x.base)}</td><td>${esc(x.uid || (x.count||1)+'名')}</td><td>${esc([x.code, x.reason].filter(Boolean).join('・') || '—')}</td><td class="num r">${toNum(x.amount) ? sgn(-toNum(x.amount)) : (x.pts ? yen(x.pts)+'点' : '未確定')}</td><td>${pill(x.status==='入金済'?'ok':x.status==='対象外'?'na':x.status==='点数のみ'?'bad':'warn', x.status)}</td></tr>`).join('')
    + (rg.setHas && (Math.abs(rg.other) >= 1 || !rg.rets.length) ? `<tr><td>返戻以外</td><td colspan="3" class="hint">再請求分の入金、過去分の調整など（払出し通知書と10日の請求資料で確認）</td><td class="num r">${sgn(rg.other)}</td><td></td></tr>` : '');
  const items = []; const bySm = {};
  st.inM.filter(r => r.kind === 'T10').forEach(r => bySm[r.sm||''] = (bySm[r.sm||''] || 0) + r.amount);
  Object.keys(bySm).sort().forEach(k => items.push({lab:'立替請求', sub:`${mm(k)}提供分`, v:bySm[k]}));
  st.inM.filter(r => ['T11','T20','X99'].includes(r.kind)).sort((a,b)=>(a.sm||'').localeCompare(b.sm||'')).forEach(r => items.push({lab:KINDS[r.kind].name, sub:esc(`${S.base==='合算'?r.base+'・':''}${r.memo || (mm(r.sm)+'分')}`), v:r.amount}));
  if (st.fee) items.push({lab:'手数料・遅延損害金', sub: st.late ? `うち遅延損害金 ${yen(-st.late)}` : '', v:st.fee});
  let run = 0, max = 0; const steps = items.map(it => { const a = run; run += it.v; max = Math.max(max, a, run); return {...it, a, b: run}; });
  if (st.paidHas) max = Math.max(max, st.paid); max = max || 1;
  const pct = x => (x / max * 100).toFixed(2);
  let wf = steps.map(s => `<div class="wf-row"><div class="lab">${s.lab}<small>${s.sub}</small></div><div class="track"><div class="bar ${s.v>=0?'plus':'minus'}" style="left:${pct(Math.max(Math.min(s.a,s.b),0))}%;width:${pct(Math.abs(s.v))}%"></div></div><div class="num r">${sgn(s.v)}</div></div>`).join('');
  wf += `<div class="wf-row total"><div class="lab">計算上の入金額</div><div class="track"><div class="bar total" style="left:0;width:${pct(Math.max(st.expect,0))}%"></div></div><div class="num r">${yen(st.expect)}</div></div>`;
  if (st.paidHas) wf += `<div class="wf-row"><div class="lab">実際の尼信入金</div><div class="track"><div class="bar plus" style="left:0;width:${pct(st.paid)}%"></div></div><div class="num r">${yen(st.paid)}</div></div>`;
  const msg = st.status === 'ok' ? '計算どおりに入金されています' : st.status === 'bad' ? `計算と入金が ${sgn(st.paid - st.expect)}円 ずれています` : `入金待ち（見込み ${yen(st.expect)}円）`;
  const perBase = S.base === '合算' ? `<div class="tablewrap"><table><thead><tr><th>拠点</th><th class="r">立替請求</th><th class="r">相殺・手数料</th><th class="r">尼信入金</th><th>状態</th></tr></thead><tbody>${BASES.map(b => { const s = settlement(ofBase(b), pm); return s.status==='none' ? `<tr><td>${b}</td><td colspan="4" class="hint">この月の精算はありません</td></tr>` : `<tr><td>${b}</td><td class="num r">${yen(s.fac+s.redo)}</td><td class="num r">${sgn(s.off+s.fee)}</td><td class="num r">${s.paidHas?yen(s.paid):'—'}</td><td>${pill(s.status)}</td></tr>`; }).join('')}</tbody></table></div>` : '';
  $('main').innerHTML = `<div class="page">
    <section class="panel"><div class="row">
      <div class="ptitle" style="flex:1"><span class="eyebrow">齋藤様への月次報告（毎月5〜10日）</span><h1>${ym(pm)}の月次レポート</h1><p class="hint">毎月お伝えしている3つの数字と、清算の見込みが誰の分かを示します。下段は、この月の立替入金がどう決まったかの内訳です。</p></div>
      <label class="f" style="width:190px">報告する月<select id="pmSel">${pms.slice().reverse().map(p => `<option value="${p}" ${p===pm?'selected':''}>${ym(p)}</option>`).join('')}</select></label></div></section>
    <section class="panel col regular" style="gap:14px">
      <h2>毎月の3つの数字</h2>
      <div class="kpis k3">
        <div class="kpi"><span class="l">${ic('send',15)} 今月の請求額（${mm(rg.reqSm)}提供分）</span><span class="v">${yen(rg.req)}</span><span class="s">うちトワライズへ ${yen(rg.reqT)}円</span></div>
        <div class="kpi"><span class="l">${ic('building',15)} 先月の国保連からの入金（${mm(rg.paidSm)}提供分）</span><span class="v">${rg.paidHas ? yen(rg.paid) : '未入力'}</span><span class="s">払出し通知書の額（トワライズの口座へ）</span></div>
        <div class="kpi ${rg.per.some(x=>x.early)?'bad':''}"><span class="l">${ic('calc',15)} 来月の清算見込み（${mm(rg.setSm)}提供分）</span><span class="v">${rg.setHas ? sgn(rg.gap) : '通知待ち'}</span><span class="s">${rg.per.filter(x=>x.has).map(x => `${S.base==='合算'?x.b+' ':''}${x.gap?sgn(x.gap):'0'}→${mm(x.when)}${x.early?'（1か月早まり）':''}`).join('／') || '払出し通知書（5日ごろ）を入れると出ます'}</span></div>
      </div>
      <div class="col" style="gap:6px"><h3 style="font-size:15px">清算見込みの内訳（誰の分か）</h3>
        <div class="tablewrap"><table><thead><tr><th>区分</th><th>拠点</th><th>利用者ID</th><th>コード・事由</th><th class="r">金額</th><th>状態</th></tr></thead><tbody>${regRows || `<tr><td colspan="6" class="hint">${rg.setHas ? 'この提供月の返戻の記録はありません。' : '払出し通知書の額を入れると表示されます。'}</td></tr>`}</tbody></table></div>
        <p class="hint">払出し通知書は市町村番号ごとの合計です。返戻のあった方は、10日に請求した資料と照らし合わせて「返戻台帳」に記録すると、ここに並びます。</p></div>
    </section>
    <section class="kpis">${kp.map(x => `<div class="kpi panel ${x.cls||''}" style="padding:14px"><span class="l">${x.l}</span><span class="v">${x.v}</span><span class="s">${x.s}</span></div>`).join('')}</section>
    <div class="grid2">
      <section class="panel col" style="gap:14px">
        <div class="status-big ${st.status==='none'?'wait':st.status}">${st.status==='ok'?'✓ 一致':st.status==='bad'?'! 差あり':'… 入金待ち'}<span>${msg}</span></div>
        <div class="col" style="gap:4px"><h3 style="font-size:15px">${ym(pm)}の立替入金の内訳</h3><div class="wf">${wf}</div></div>${perBase}</section>
      <div class="col" style="gap:18px">
        <section class="panel"><h2>12か月の推移</h2><div class="legend" style="margin:6px 0"><span><i style="background:var(--accent)"></i>立替請求</span><span><i style="background:var(--warn)"></i>尼信入金</span></div><div id="trend"></div></section>
        <section class="panel"><h2>未解消の差異</h2><p class="hint">国保連の確定額と立替請求の差のうち、まだ清算されていないもの</p>
          <div class="attn" style="margin-top:10px">${open.length ? open.map(o => `<div class="it"><div class="t">${pill(o.state)}<span>${S.base==='合算'?o.base+'　':''}${ym(o.sm)}提供分</span></div><span class="num">${sgn(o.open)}円</span></div>`).join('') : '<p class="hint">未解消の差異はありません。</p>'}</div></section></div></div>
    <section class="panel col" style="gap:12px">
      <div class="ptitle"><h2>報告文</h2><p class="hint">内容から自動で作ります。コメントを一言添えて、コピーしてChatworkなどに貼り付けてください。</p></div>
      <label class="f">今月のコメント（任意）<span class="sub">報告文の最後に入ります。保存すると他の人にも見えます</span><textarea id="cmt" rows="3" placeholder="例：6月分の返戻は9月の精算ですべて相殺されました。">${esc(close.comment||'')}</textarea></label>
      <textarea id="reportText" rows="16" readonly aria-label="報告文"></textarea>
      <div><button type="button" class="btn small ghost" id="saveCmt">${ic('save',14)}コメントを保存</button></div>
      <ol class="actsteps" aria-label="報告の手順">
        <li class="${close.reportedAt?'is-done':'is-cur'}"><span class="as-no">1</span><button type="button" class="btn ${close.reportedAt?'':'primary'}" id="copyBtn">${ic('copy',16)}報告文をコピー</button></li>
        <li class="${close.reportedAt?'is-done':''}"><span class="as-no">2</span><span class="as-tx">${ic('chat',16)}Chatworkに貼り付けて送る</span></li>
        <li class="${close.reportedAt?'is-done':''}"><span class="as-no">3</span><button type="button" class="btn ${close.reportedAt?'':''}" id="markDone">${close.reportedAt ? ic('repeat',16)+'報告済みを取り消す' : ic('check',16)+'報告済みにする'}</button></li>
        ${close.reportedAt?`<li class="is-done as-note">${ic('check',16)}${new Date(close.reportedAt).toLocaleDateString('ja-JP')} に報告済み${close.reportedBy?`（${esc(close.reportedBy)}）`:''}</li>`:''}
      </ol></section></div>`;
  renderTrend(list, pms, pm);
  const upd = () => { $('reportText').value = reportText(pm, st, open, $('cmt').value.trim(), kp, rg); }; upd();
  $('cmt').addEventListener('input', upd);
  $('pmSel').addEventListener('change', e => { S.repPm = e.target.value; renderReport(); });
  const stepOn = () => { if (close.reportedAt) return; $('copyBtn').classList.remove('primary'); $('markDone').classList.add('primary'); const li = $('main').querySelectorAll('.actsteps li'); li[0].className = 'is-done'; li[1].className = 'is-done'; li[2].className = 'is-cur'; };
  $('copyBtn').addEventListener('click', async () => { const t = $('reportText'); try { await navigator.clipboard.writeText(t.value); toast('コピーしました。Chatworkに貼り付けて送ってください'); } catch (e) { t.select(); toast('文章を選択しました。Ctrl+C でコピーしてください'); } stepOn(); });
  const saveClose = async patch => { await db.doc('closes/' + pm).set({...(S.closes[pm]||{}), ...patch}); };
  $('saveCmt').addEventListener('click', async () => { try { await saveClose({comment: $('cmt').value.trim()}); toast('コメントを保存しました'); } catch (e) { toast('保存できませんでした'); } });
  $('markDone').addEventListener('click', async () => { const done = !!close.reportedAt; try { await saveClose({comment: $('cmt').value.trim(), reportedAt: done ? null : new Date().toISOString(), reportedBy: done ? null : (S.me||'')}); logIt('報告', `${ym(pm)}の報告を${done?'取り消し':'報告済みに'}`); done ? toast('報告済みを取り消しました') : savedNext('報告済みにしました'); } catch (e) { toast('保存できませんでした'); } });
}
function lineChart(el, ms, series, selM, label) {
  const W = 640, H = 230, L = 56, R = 14, T = 12, B = 30;
  const vals = series.flatMap(s => s.data.filter(v => v != null)); const top = Math.max(...vals, 1), lo = Math.min(0, ...vals);
  const step = Math.pow(10, Math.floor(Math.log10(Math.max(top - lo, 1)))); let hi = Math.ceil(top / step) * step; let bot = Math.floor(lo / step) * step;
  if ((hi - bot) / step < 3) { hi = Math.ceil(top/(step/2))*(step/2); bot = Math.floor(lo/(step/2))*(step/2); }
  const x = i => L + (ms.length === 1 ? (W-L-R)/2 : i * (W - L - R) / (ms.length - 1));
  const y = v => T + (H - T - B) * (1 - (v - bot) / (hi - bot || 1));
  const pts = arr => arr.map((v,i) => v==null ? null : `${x(i).toFixed(1)},${y(v).toFixed(1)}`).filter(Boolean).join(' ');
  let s = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${label}">`;
  const si = ms.indexOf(selM); if (si >= 0) s += `<rect x="${x(si)-15}" y="${T}" width="30" height="${H-T-B}" rx="4" fill="var(--accent-soft)"/>`;
  s += [0,.25,.5,.75,1].map(t => bot + t*(hi-bot)).map(t => `<line x1="${L}" x2="${W-R}" y1="${y(t)}" y2="${y(t)}" stroke="${t===0&&bot<0?'var(--faint)':'var(--line)'}" stroke-width="1"/><text x="${L-8}" y="${y(t)+4}" text-anchor="end" font-size="11" fill="var(--muted)">${Math.round(t/10000).toLocaleString('ja-JP')}万</text>`).join('');
  s += ms.map((m,i) => `<text x="${x(i)}" y="${H-8}" text-anchor="middle" font-size="11" fill="${m===selM?'var(--ink)':'var(--muted)'}" font-weight="${m===selM?'700':'400'}">${mm(m)}</text>`).join('');
  series.forEach(se => { s += `<polyline points="${pts(se.data)}" fill="none" stroke="${se.color}" stroke-width="2.5" ${se.dash?'stroke-dasharray="6 4"':''} stroke-linejoin="round"/>` + se.data.map((v,i) => v==null?'':`<circle cx="${x(i)}" cy="${y(v)}" r="3.5" fill="${se.color}"/>`).join(''); });
  el.innerHTML = s + '</svg>';
}
function renderTrend(list, pms, selPm) {
  const ms = pms.slice(-12);
  lineChart($('trend'), ms, [
    {data: ms.map(m => sum(list, ['T10','T11'], r => r.pm === m)), color:'var(--accent)'},
    {data: ms.map(m => list.some(r => r.pm===m && r.kind==='B10') ? sum(list, ['B10'], r => r.pm === m) : null), color:'var(--warn)', dash:true}
  ], selPm, '精算月ごとの立替請求と尼信入金の推移');
  $('trend').insertAdjacentHTML('beforeend', '<p class="hint">横軸は精算月（入金のあった月）。2本の線が離れた月は内訳を確認します。</p>');
}

/* ================= 資金繰り ================= */
function renderCash() {
  const c = S.settings.cash || {}, fc = forecast(), hasBal = c.opening != null && c.opening !== '';
  const minRow = hasBal ? fc.slice().sort((a,b)=>a.bal-b.bal)[0] : null;
  const fs = feeSeries(S.rows.filter(r => S.base==='合算' || r.base===S.base));
  const fyFee = fs.filter(x => x.pm >= `${+nowM.slice(0,4) - (+nowM.slice(5,7)<4?1:0)}-04`).reduce((a,x)=>a+x.fee,0);
  const avgApr = fs.length ? fs.reduce((a,x)=>a+x.apr,0)/fs.length : 0;
  const estSm = S.estSm || addM(nowM,-1);
  $('main').innerHTML = `<div class="page">
    <section class="panel"><div class="ptitle"><span class="eyebrow">お金の見通し</span><h1>資金繰り</h1><p class="hint">今後6か月の入金見込みと支出から、月末の残高を見通します。入金は、確定・請求済み・推計の順に自動で埋まります。</p></div></section>
    <section class="panel col" style="gap:14px">
      <div class="row"><h2>6か月の見通し（合算）</h2><div class="spacer"></div><button type="button" class="btn" id="cashEdit">残高と毎月の支出を設定</button></div>
      ${!hasBal ? `<div class="res wait" style="margin:0">「残高と毎月の支出を設定」で、今月初めの尼信の残高と、給与・家賃・工賃などの毎月の支出を入れると、月末残高の見込みが出ます。</div>` : ''}
      ${minRow ? `<div class="kpis k4"><div class="kpi"><span class="l">いちばん少なくなる月</span><span class="v">${ym(minRow.m)}末</span></div><div class="kpi ${minRow.bal<0?'bad':''}"><span class="l">その月末の残高</span><span class="v">${yen(minRow.bal)}</span></div><div class="kpi"><span class="l">毎月の支出</span><span class="v">${yen(fc[0].costs)}</span></div><div class="kpi"><span class="l">6か月の入金見込み</span><span class="v">${man(fc.reduce((a,r)=>a+r.inflow,0))}</span></div></div>` : ''}
      <div id="cashChart"></div>
      <div class="tablewrap"><table><thead><tr><th>月</th><th>御所</th><th>大和高田</th><th class="r">入金見込み</th><th class="r">支出</th><th class="r">月末残高</th></tr></thead><tbody>${fc.map(r => `<tr class="${minRow && r.m===minRow.m ? (r.bal<0?'badrow':'minrow') : ''}"><td>${ym(r.m)}</td>${BASES.map(b => { const p = r.parts.find(x => x.b === b); return `<td>${p ? `<span class="num">${yen(p.v)}</span><br><span class="hint">${p.kind}</span>` : '<span class="hint">—</span>'}</td>`; }).join('')}<td class="num r"><b>${yen(r.inflow)}</b></td><td class="num r">${r.costs?sgn(-r.costs):'—'}</td><td class="num r"><b>${r.bal==null?'—':yen(r.bal)}</b></td></tr>`).join('')}</tbody></table></div>
      <p class="hint">推計は「売上概算（お伝えした額）」または直近3か月の立替請求の平均から、手数料の目安と、3か月前提供分の未解消差額を加減しています。給与日と入金日のずれなど月の途中の動きは含みません。</p>
    </section>
    <section class="panel col" id="estSec" style="gap:14px">
      <div class="row"><div class="ptitle" style="flex:1"><h2>売上概算（会計の先生・齋藤様へ 5日ごろ）</h2><p class="hint">今月の売上の見込みを、5日ごろに会計の先生（三光会計社）と齋藤様にお伝えします。確定するのは17日ごろのトワライズの明細です。お伝えした額を残し、実績との差が10％を超えたら理由を記録します。</p></div>
        <label class="f" style="width:180px">提供月<select id="estSm">${monthOpts(estSm, addM(nowM,-6), addM(nowM,2))}</select></label></div>
      <div class="fgrid">${BASES.map(b => { const e = estOf(b, estSm), sug = sum(ofBase(b),['K10'],r=>r.sm===estSm) || avgT10(b, estSm), prev = sum(ofBase(b),['K10'],r=>r.sm===addM(estSm,-1)); return `<div class="calc"><div class="row"><b>${b}</b>${e?pill('done','✓ お伝え済み'):pill('todo')}</div>
        <div class="cl"><span>${sum(ofBase(b),['K10'],r=>r.sm===estSm) ? `${mm(estSm)}提供分の国保連への請求額` : '直近3か月の立替請求の平均'}</span><span class="num">${sug?yen(sug):'—'}</span></div><div class="cl"><span>${mm(addM(estSm,-1))}提供分の請求額</span><span class="num">${prev?yen(prev):'—'}</span></div>
        <label class="f">お伝えする概算額（円）<input class="amt" data-est="${b}" inputmode="numeric" value="${e?yen(e.amount):sug?yen(sug):''}"></label>
        <div class="row"><button type="button" class="btn small primary" data-estsave="${b}">お伝えした額として保存</button><button type="button" class="btn small" data-estcopy="${b}">お知らせの文面をコピー</button></div></div>`; }).join('')}</div>
      <h3 style="font-size:15px">概算と実績の比較</h3>
      <div class="tablewrap"><table><thead><tr><th>提供月</th><th>拠点</th><th class="r">売上概算</th><th class="r">国保連請求の実績</th><th class="r">差</th><th>差の理由</th></tr></thead><tbody>${S.estimates.slice().sort((a,b)=>b.sm.localeCompare(a.sm)||a.base.localeCompare(b.base)).map(e => { const act = sum(ofBase(e.base),['K10'],r=>r.sm===e.sm), d = act ? (act - toNum(e.amount))/toNum(e.amount) : null, big = d != null && Math.abs(d) >= .1; return `<tr class="${big && !e.reason ? 'warnrow' : ''}"><td>${ym(e.sm)}</td><td>${e.base}</td><td class="num r">${yen(e.amount)}</td><td class="num r">${act?yen(act):'—'}</td><td class="num r">${d==null?'—':`${sgn(act-toNum(e.amount))}（${(d*100).toFixed(1)}％）`}</td><td style="min-width:220px">${big ? `<input data-estreason="${e.base}|${e.sm}" value="${esc(e.reason||'')}" placeholder="差が出た理由を入力（例：利用者2名が入院）">` : `<span class="hint">${esc(e.reason||'')}</span>`}</td></tr>`; }).join('') || '<tr><td colspan="6" class="hint">まだ売上概算の記録がありません。</td></tr>'}</tbody></table></div>
    </section>
    <section class="panel col" style="gap:14px">
      <div class="ptitle"><h2>立替手数料のコスト（${S.base}）</h2><p class="hint">実効年率は「手数料 ÷ 立替額 × 12」で、立替期間を約30日とみた推計です。銀行借入などと比べるときの目安になります。</p></div>
      <div class="kpis k4"><div class="kpi"><span class="l">今年度の手数料累計</span><span class="v">${yen(fyFee)}</span></div><div class="kpi"><span class="l">平均の実効年率（推計）</span><span class="v">約${(avgApr*100).toFixed(1)}％</span></div><div class="kpi"><span class="l">うち遅延損害金（直近12か月）</span><span class="v">${yen(fs.reduce((a,x)=>a+x.late,0))}</span></div><div class="kpi"><span class="l">年換算の手数料（直近平均×12）</span><span class="v">${fs.length?man(fs.reduce((a,x)=>a+x.fee,0)/fs.length*12):'—'}</span></div></div>
      <div class="tablewrap"><table><thead><tr><th>精算月</th><th class="r">立替額</th><th class="r">手数料</th><th class="r">うち遅延損害金</th><th class="r">手数料率</th><th class="r">実効年率（推計）</th></tr></thead><tbody>${fs.slice().reverse().map(x => `<tr><td>${ym(x.pm)}</td><td class="num r">${yen(x.fac)}</td><td class="num r">${yen(x.fee)}</td><td class="num r">${x.late?yen(x.late):'—'}</td><td class="num r">${(x.rate*100).toFixed(2)}％</td><td class="num r">${(x.apr*100).toFixed(1)}％</td></tr>`).join('') || '<tr><td colspan="6" class="hint">手数料のデータがありません。</td></tr>'}</tbody></table></div>
    </section></div>`;
  if (hasBal) lineChart($('cashChart'), fc.map(r=>r.m), [{data: fc.map(r=>r.bal), color:'var(--accent)'}, {data: fc.map(r=>r.inflow), color:'var(--ok)', dash:true}], null, '6か月の月末残高と入金見込み');
  if (hasBal) $('cashChart').insertAdjacentHTML('afterbegin', `<div class="legend" style="margin-bottom:6px"><span><i style="background:var(--accent)"></i>月末残高</span><span><i style="background:var(--ok)"></i>入金見込み</span></div>`);
  $('cashEdit').addEventListener('click', openCashEditor);
  $('estSm').addEventListener('change', e => { S.estSm = e.target.value; renderCash(); });
  $('main').querySelectorAll('[data-estsave]').forEach(bt => bt.addEventListener('click', async () => {
    const b = bt.dataset.estsave, v = toNum($('main').querySelector(`[data-est="${b}"]`).value); if (!v) return toast('概算額を入れてください');
    const prev = estOf(b, estSm);
    try { await db.doc(`estimates/${BCODE[b]}_${estSm}`).set({base:b, sm:estSm, amount:v, reason: prev?.reason||'', savedAt:new Date().toISOString(), by:S.me||''}); logIt('売上概算', `${b} ${ym(estSm)}提供分の概算 ${yen(v)}円をお伝え${prev?`（変更前 ${yen(prev.amount)}円）`:''}`); toast('売上概算を保存しました'); } catch (e) { toast('保存できませんでした'); }
  }));
  $('main').querySelectorAll('[data-estcopy]').forEach(bt => bt.addEventListener('click', async () => {
    const b = bt.dataset.estcopy, v = toNum($('main').querySelector(`[data-est="${b}"]`).value), prev = sum(ofBase(b),['K10'],r=>r.sm===addM(estSm,-1));
    const t = `【LINOA ${b}】${ym(estSm)}サービス提供分の売上の見込みをお知らせします。\n概算額：${yen(v)}円\n（参考：${ym(addM(estSm,-1))}提供分の請求額 ${prev?yen(prev)+'円':'—'}）\n確定額は、17日ごろのトワライズの明細でお知らせします。\nよろしくお願いいたします。`;
    try { await navigator.clipboard.writeText(t); toast('お知らせの文面をコピーしました'); } catch (e) { toast('コピーできませんでした'); }
  }));
  $('main').querySelectorAll('[data-estreason]').forEach(inp => inp.addEventListener('change', async () => {
    const [b, sm] = inp.dataset.estreason.split('|'), e = estOf(b, sm); try { await db.doc(`estimates/${BCODE[b]}_${sm}`).set({...e, reason: inp.value.trim()}); toast('理由を保存しました'); } catch (er) { toast('保存できませんでした'); }
  }));
}
function openCashEditor() {
  const c = structuredClone(S.settings.cash || {opening:null, asOf:null, costs:[]}); let costs = (c.costs||[]).length ? c.costs : [{label:'給与・社会保険', amount:''},{label:'利用者工賃', amount:''},{label:'家賃', amount:''},{label:'その他の経費', amount:''}];
  openDrawer({eyebrow:'資金繰り', title:'残高と毎月の支出', note:'見込みの起点になる月初の残高と、毎月だいたい決まって出ていく支出を入れます。金額は概算で構いません。',
    body:`<div class="fgrid"><label class="f">起点の月<select id="cAs">${monthOpts(c.asOf||nowM, addM(nowM,-3), addM(nowM,3))}</select></label><label class="f">その月初めの尼信の残高（円）<input class="amt" id="cOpen" inputmode="numeric" value="${c.opening!=null?yen(c.opening):''}"></label></div>
      <div class="sec" style="margin-top:16px"><h4>毎月の支出</h4><div class="lines" id="cCosts"></div><div><button type="button" class="btn small" id="cAddCost">＋ 支出を追加</button></div><div class="ro"><span>毎月の支出 合計</span><b class="num" id="cTot">0</b></div></div>`,
    footer: footerSave(),
    mount: root => {
      const draw = () => { $('cCosts').innerHTML = costs.map((x,i) => `<div class="costline"><input data-ci="${i}" data-f="label" value="${esc(x.label)}" aria-label="支出の名前"><input class="amt" data-ci="${i}" data-f="amount" inputmode="numeric" value="${x.amount===''?'':yen(x.amount)}" placeholder="0" aria-label="金額"><button type="button" class="btn iconbtn" data-cdel="${i}" aria-label="削除">✕</button></div>`).join(''); tot(); };
      const tot = () => $('cTot').textContent = yen(costs.reduce((a,x)=>a+toNum(x.amount),0));
      root.addEventListener('input', e => { const i = e.target.dataset.ci; if (i != null) { costs[+i][e.target.dataset.f] = e.target.value; tot(); } });
      root.addEventListener('click', e => { const d = e.target.closest('[data-cdel]'); if (d) { costs.splice(+d.dataset.cdel,1); draw(); } });
      $('cAddCost').addEventListener('click', () => { costs.push({label:'', amount:''}); draw(); });
      draw();
      $('dSave').addEventListener('click', async () => {
        const open = $('cOpen').value.trim();
        try { await saveSettings({cash:{asOf:$('cAs').value, opening: open===''?null:toNum(open), costs: costs.filter(x=>x.label||toNum(x.amount)).map(x=>({label:x.label, amount:toNum(x.amount)}))}}, '資金繰りの残高と支出を更新'); closeDrawer(); toast('保存しました'); render(); }
        catch (e) { $('dMsg').textContent = '保存できませんでした。'; }
      });
    }});
}

/* ================= 突合 ================= */
function renderRecon() {
  const blocks = basesInView().map(b => {
    const rs = reconRows(ofBase(b)).reverse(), rk = earlyRisk(b);
    if (!rs.length) return `<section class="panel"><h2>${b}</h2><p class="hint">まだデータがありません。</p></section>`;
    return `<section class="panel col" style="gap:12px"><div class="row"><h2>${b}</h2>${rk.state && rk.state!=='ok' ? pill(rk.state, `${mm(rk.sm)}分の不足 ${(rk.ratio*100).toFixed(1)}％／清算が早まる基準 ${(S.settings.alertRatio*100).toFixed(0)}％`) : ''}<div class="spacer"></div><span class="hint">行を押すと、その月の明細が見られます</span></div><div class="tablewrap"><table>
      <thead><tr><th>提供月</th><th class="r">国保連請求</th><th class="r">立替請求</th><th class="r">立替しない額</th><th class="r">国保連の確定額</th><th class="r">返戻・未払い</th><th class="r">清算済み</th><th class="r">未解消</th><th>清算予定</th><th>状態</th></tr></thead><tbody>` +
      rs.map(r => `<tr class="click ${r.state==='open'?'badrow':r.state==='warn'?'warnrow':''}" tabindex="0" data-recon="${b}|${r.sm}"><td>${ym(r.sm)}</td><td class="num r">${yen(r.k10)}</td><td class="num r">${yen(r.t10)}</td><td class="num r">${r.nf?sgn(r.nf):'0'}</td><td class="num r">${r.hasK30?yen(r.k30):'—'}</td><td class="num r">${r.gap==null?'—':r.gap?sgn(r.gap):'0'}</td><td class="num r">${r.off?sgn(r.off):'0'}</td><td class="num r"><b>${r.open==null?'—':r.open?sgn(r.open):'0'}</b></td><td>${r.hasK30 && r.gap ? (() => { const tm = settleTiming(r.t10, r.gap); return `${mm(settleMonth(r.sm, tm.early))}${tm.early?'<br><span class="pill bad">1か月早まり</span>':''}`; })() : '—'}</td><td>${pill(r.state)}</td></tr>`).join('') + `</tbody></table></div></section>`;
  }).join('');
  $('main').innerHTML = `<div class="page">
    <section class="panel col" style="gap:10px"><div class="ptitle"><span class="eyebrow">提供月ごとの照合</span><h1>突合</h1><p class="hint">提供月でそろえて、請求 → 国保連の確定額 → 清算 の順に差額を追います。「未解消」が0になれば、その月の清算は終わりです。差額は通常2か月後の立替入金で差し引かれ、立替請求の${(S.settings.alertRatio*100).toFixed(0)}％を超えると1か月早まります。</p></div>
      <div class="legend-text"><span><b>立替しない額</b>＝国保連請求 − 立替請求（主に返戻の再請求分）</span><span><b>返戻・未払い</b>＝国保連の確定額 − 立替請求</span><span><b>未解消</b>＝返戻・未払い − 清算済み</span></div>
      <div class="row" style="gap:8px">${pill('solved')}<span class="hint">差額なし</span>${pill('warn')}<span class="hint">清算予定の月まで待つ</span>${pill('open')}<span class="hint">清算予定を過ぎても残っている</span>${pill('pay')}<span class="hint">払出し通知がまだ</span></div></section>${blocks}</div>`;
}
function openReconDetail(b, sm) {
  const rs = ofBase(b).filter(r => r.sm === sm).sort((a,c) => ORDER.indexOf(a.kind) - ORDER.indexOf(c.kind));
  const r = reconRows(ofBase(b)).find(x => x.sm === sm); if (!r) return;
  const rets = S.returns.filter(x => x.base === b && x.sm === sm), retSum = rets.reduce((a,x)=>a+toNum(x.amount),0);
  const steps = [['国保連への請求', yen(r.k10), '①で入力'], ['立替請求', yen(r.t10), '①で入力'], ['立替しない額', r.nf?sgn(r.nf):'0', '国保連請求 − 立替請求'],
    ['国保連の確定額', r.hasK30?yen(r.k30):'未入力', `②で入力（${mm(addM(sm,2))}5日ごろの払出し通知書）`], ['返戻・未払い', r.gap==null?'—':r.gap?sgn(r.gap):'0', '国保連の確定額 − 立替請求'],
    ['清算済み', r.off?sgn(r.off):'0', '④の立替入金で差し引かれた額'], ['未解消', r.open==null?'—':r.open?sgn(r.open):'0', '返戻・未払い − 清算済み']];
  const tmD = r.hasK30 && r.gap ? settleTiming(r.t10, r.gap) : null;
  const advice = r.state === 'open' ? `清算予定の月（${tmD?mm(settleMonth(sm, tmD.early)):'—'}）を過ぎても解消していません。トワライズの明細で清算されているか確認し、清算されていれば「④ トワライズ明細・精算」で追加してください。${r.redo?`この月には立替し直し ${sgn(r.redo)}円 があり、関係している可能性があります。`:''}`
    : r.state === 'warn' ? `${tmD && tmD.early ? `不足額が立替請求の ${(tmD.ratio*100).toFixed(1)}％ で${(S.settings.alertRatio*100).toFixed(0)}％を超えるため、1か月早まり、` : '通常どおり2か月後に、'}${tmD?mm(settleMonth(sm, tmD.early)):''}15日ごろの立替入金で差し引かれる見込みです。明細が届いたら「④ トワライズ明細・精算」の候補から追加できます。`
    : r.state === 'pay' ? '国保連の払出し通知書（5日ごろ）が届いたら「② 国保連 払出し通知」で入力してください。' : 'この月の清算は終わっています。';
  openDrawer({eyebrow:`突合の明細｜${b}`, title:`${ym(sm)}提供分`,
    body:`<div class="col" style="gap:14px">
      <div class="calc">${steps.map(([l,v,s],i) => `<div class="cl ${i===6?'tot':''}"><span>${l}<br><span class="hint" style="font-weight:400">${s}</span></span><span class="num">${v}</span></div>`).join('')}<div class="res ${r.state==='open'?'bad':r.state==='warn'?'warn':r.state==='pay'?'wait':'ok'}">${advice}</div></div>
      <div class="row"><h4 style="font-size:15px">返戻台帳（${rets.length}件・${yen(retSum)}円）</h4><div class="spacer"></div><button type="button" class="btn small" id="rdAdd">＋ 返戻を記録</button></div>
      ${rets.length ? `<div class="tablewrap"><table><thead><tr><th>利用者ID</th><th>コード</th><th class="r">金額</th><th>状態</th></tr></thead><tbody>${rets.map(x => `<tr><td>${esc(x.uid||'—')}${x.count>1?`（${x.count}名）`:''}</td><td class="code">${esc(x.code||'—')}</td><td class="num r">${yen(x.amount)}</td><td>${esc(x.status)}</td></tr>`).join('')}</tbody></table></div>` : '<p class="hint">この月の返戻の記録はありません。</p>'}
      <h4 style="font-size:15px">この提供月に関係する行</h4>
      <div class="tablewrap"><table><thead><tr><th>区分</th><th>処理月</th><th class="r">金額</th><th>メモ</th></tr></thead><tbody>${rs.map(x => `<tr><td>${KINDS[x.kind].name}</td><td>${ym(x.pm)}</td><td class="num r">${sgn(x.amount)}</td><td class="memo">${esc(x.memo)}</td></tr>`).join('')}</tbody></table></div></div>`,
    footer:`<button type="button" class="btn" data-close="1">閉じる</button>${r.hasK30?'':`<button type="button" class="btn primary" id="goC">② 払出し通知を入力</button>`}`,
    mount: () => { $('goC')?.addEventListener('click', () => { closeDrawer(); openStepC(b, sm); }); $('rdAdd').addEventListener('click', () => { closeDrawer(); openReturnEditor(null, {base:b, sm}); }); }
  });
}

/* ================= 返戻台帳 ================= */
function renderReturns() {
  const all = S.returns.filter(x => S.base === '合算' || x.base === S.base);
  const f = S.ret.status;
  const shown = all.filter(x => f === 'all' || (f === 'open' ? !['入金済','対象外'].includes(x.status) : x.status === f)).sort((a,b) => (b.sm||'').localeCompare(a.sm||'') || (a.uid||'').localeCompare(b.uid||''));
  const cnt = s => all.filter(x => x.status === s).reduce((a,x)=>a+(+x.count||1),0), amt = s => all.filter(x => x.status === s).reduce((a,x)=>a+toNum(x.amount),0);
  const openAmt = all.filter(x => !['入金済','対象外'].includes(x.status)).reduce((a,x)=>a+toNum(x.amount),0);
  $('main').innerHTML = `<div class="page">
    <section class="panel"><div class="row"><div class="ptitle" style="flex:1"><span class="eyebrow">利用者ごとの追跡</span><h1>返戻台帳</h1><p class="hint">返戻の方を、月末の連絡（点数のみ）→ 5日ごろの払出し通知で金額確定 → 翌月10日の再請求 → 入金まで追います。再請求分はトワライズには請求しません。氏名や受給者証番号は入れず、事業所内のID（例：GS-012）で記録してください。</p></div><button type="button" class="btn primary" id="retAdd">＋ 返戻を記録</button></div></section>
    <section class="kpis">${[['点数のみ', cnt('点数のみ'), amt('点数のみ')],['再請求待ち', cnt('再請求待ち'), amt('再請求待ち')],['再請求済', cnt('再請求済'), amt('再請求済')],['入金済', cnt('入金済'), amt('入金済')]].map(([l,n,a]) => `<div class="kpi panel" style="padding:14px"><span class="l">${l}</span><span class="v">${n}名</span><span class="s">${yen(a)}円</span></div>`).join('')}<div class="kpi panel ${openAmt?'warn':''}" style="padding:14px"><span class="l">まだ入金されていない額</span><span class="v">${yen(openAmt)}</span><span class="s">点数のみ＋再請求待ち＋再請求済</span></div></section>
    <section class="panel col" style="gap:12px">
      <div class="subtabs" role="tablist">${[['open','対応中'],['all','すべて'],...RET_STATUS.map(s=>[s,s])].map(([k,l]) => `<button type="button" role="tab" data-rf="${k}" aria-selected="${k===f}">${l}</button>`).join('')}</div>
      <div class="tablewrap"><table><thead><tr><th>提供月</th><th>拠点</th><th>利用者ID</th><th>事由</th><th>エラーコード</th><th class="r">金額</th><th>再請求予定</th><th>状態</th><th>メモ</th><th></th></tr></thead><tbody>${
        shown.length ? shown.map(x => { const late = !['入金済','対象外'].includes(x.status) && x.plan && x.plan < nowM; return `<tr class="${late?'badrow':''}"><td>${ym(x.sm)}</td><td>${esc(x.base)}</td><td>${esc(x.uid||'—')}${(+x.count||1)>1?`<br><span class="hint">${x.count}名分</span>`:''}</td><td>${esc(x.reason||'—')}</td><td class="code">${esc(x.code||'—')}</td><td class="num r">${toNum(x.amount) ? yen(x.amount) : x.pts ? `<span class="hint">${yen(x.pts)}点</span>` : '—'}</td><td>${x.plan?ym(x.plan):'—'}${late?'<br><span class="pill bad">予定月を過ぎています</span>':''}</td><td>${pill(x.status==='入金済'?'ok':x.status==='対象外'?'na':x.status==='点数のみ'?'bad':'warn', x.status)}</td><td class="memo">${esc(x.memo)}</td><td><button type="button" class="btn small" data-retedit="${x.id}">編集</button></td></tr>`; }).join('')
        : `<tr><td colspan="10"><div class="empty"><b>この条件の返戻はありません</b><span>月末に返戻の連絡が来たら点数で記録し、5日ごろの払出し通知で金額を入れます。</span></div></td></tr>`}</tbody></table></div></section>
    <section class="panel col" style="gap:12px"><div class="ptitle"><h2>主なエラーコード</h2><p class="hint">返戻等一覧表に書かれたコードの目安です。正式な内容は国保連のエラーコード一覧で確認してください。</p></div>
      <div class="tablewrap"><table><thead><tr><th>コード</th><th>種類</th><th>内容</th><th>直すのは</th></tr></thead><tbody>${ERR_CODES.map(([c,t,d,w]) => `<tr><td class="code">${c}</td><td>${t}</td><td>${d}</td><td>${w}</td></tr>`).join('')}</tbody></table></div></section></div>`;
  $('retAdd').addEventListener('click', () => openReturnEditor(null, {}));
  $('main').querySelectorAll('[data-rf]').forEach(bt => bt.addEventListener('click', () => { S.ret.status = bt.dataset.rf; renderReturns(); }));
}
function openReturnEditor(id, preset) {
  const x = id ? S.returns.find(r => r.id === id) : {base: preset.base || (S.base==='合算'?'御所':S.base), sm: preset.sm || addM(nowM,-2), uid:'', count:1, reason:'', code:'', amount:'', pts:'', plan: addM(nowM,1), status:'点数のみ', memo:''};
  if (!x) return; let confirmDel = false;
  openDrawer({eyebrow: id ? '返戻台帳を編集' : '返戻を記録', title: id ? `${ym(x.sm)}提供分 ${esc(x.uid||'')}` : '返戻を記録',
    note:`<div class="chips">${chip('return','月末：点数のみ')}${chip('mail','5日ごろ：金額が確定')}${chip('send','翌月10日：再請求')}</div><div class="rule">${ic('warn',15)}<span>再請求はトワライズに請求しない</span></div><div class="rule">${ic('search',15)}<span>利用者は、10日の請求資料と照らし合わせて特定</span></div>`,
    body: noMe() + `<div class="fgrid">
      <label class="f">拠点<select id="rBase">${BASES.map(b=>`<option ${b===x.base?'selected':''}>${b}</option>`).join('')}</select></label>
      <label class="f">提供月<select id="rSm">${monthOpts(x.sm)}</select></label>
      <label class="f">利用者ID<span class="sub">氏名は入れません。複数名をまとめるなら空欄で可</span><input id="rUid" value="${esc(x.uid)}" placeholder="例：GS-012"></label>
      <label class="f">人数<input class="amt" id="rCnt" inputmode="numeric" value="${x.count||1}"></label>
      <label class="f">事由<span class="sub">返戻等一覧表の事由（A〜Eなど）</span><input id="rReason" value="${esc(x.reason)}" placeholder="例：A"></label>
      <label class="f">エラーコード<input id="rCode" list="codeList" value="${esc(x.code)}" placeholder="例：EG12"><datalist id="codeList">${ERR_CODES.map(([c,t,d])=>`<option value="${c}">${t}：${d}</option>`).join('')}</datalist></label>
      <label class="f">点数（月末の連絡）<span class="sub">金額が分からないうちは点数だけで保存できます</span><input class="amt" id="rPts" inputmode="numeric" value="${x.pts?yen(x.pts):''}"></label>
      <label class="f">金額（給付費・円）<span class="sub">払出し通知で確定した額</span><input class="amt" id="rAmt" inputmode="numeric" value="${x.amount===''||x.amount==null?'':yen(x.amount)}"></label>
      <label class="f">再請求の予定月<span class="sub">翌月10日の請求（トワライズには請求しない）</span><select id="rPlan"><option value="">未定</option>${monthOpts(x.plan, addM(nowM,-12), addM(nowM,6))}</select></label>
      <label class="f">状態<select id="rStatus">${RET_STATUS.map(s=>`<option ${s===x.status?'selected':''}>${s}</option>`).join('')}</select></label>
    </div><div id="rCodeHint" style="margin-top:10px"></div>
    <label class="f" style="margin-top:14px">メモ<input id="rMemo" value="${esc(x.memo)}" placeholder="例：受給者証の更新が国保連に未反映。市町村に確認中"></label>
    <details style="margin-top:16px"><summary>点数から金額を計算する</summary><div class="in col" style="gap:10px"><div class="fgrid three"><label class="f">単位数<input class="amt" id="hU" inputmode="numeric"></label><label class="f">1単位の単価<input class="amt" id="hP" inputmode="decimal" value="10.17"></label><label class="f">利用者負担額<input class="amt" id="hF" inputmode="numeric" value="0"></label></div><div class="ro"><span>給付費（単位数×単価の1円未満切り捨て − 利用者負担）</span><b class="num" id="hR">—</b></div><div><button type="button" class="btn small" id="hUse">この金額を入れる</button></div><span class="hint">御所市・大和高田市は7級地、就労継続支援B型は1単位10.17円（令和6〜8年度）。</span></div></details>`,
    footer: footerSave() + (id ? `<div class="spacer"></div><button type="button" class="btn danger" id="rDel">削除</button>` : ''),
    mount: root => {
      const hint = () => { const c = $('rCode').value.trim().toUpperCase(), m = ERR_CODES.find(e => e[0] === c) || (/^[ST]/.test(c) ? ERR_CODES.at(-1) : null); $('rCodeHint').innerHTML = m ? `<div class="res wait" style="margin:0">${m[1]}：${m[2]}（直すのは ${m[3]}）</div>` : ''; };
      const conv = () => { const u = toNum($('hU').value), p = parseFloat($('hP').value) || 0, f = toNum($('hF').value); const v = u ? Math.floor(u * p) - f : null; $('hR').textContent = v == null ? '—' : yen(v); return v; };
      root.addEventListener('input', e => { if (e.target.id === 'rCode') hint(); if (['hU','hP','hF'].includes(e.target.id)) conv(); });
      $('hUse').addEventListener('click', () => { const v = conv(); if (v) $('rAmt').value = yen(v); });
      hint();
      $('dSave').addEventListener('click', async () => {
        const amt = toNum($('rAmt').value), pts = toNum($('rPts').value);
        if (!amt && !pts) return $('dMsg').textContent = '点数か金額を入れてください。';
        if (!amt && $('rStatus').value !== '点数のみ' && $('rStatus').value !== '対象外') return $('dMsg').textContent = '金額が確定していないときは、状態を「点数のみ」にしてください。';
        const data = {base:$('rBase').value, sm:$('rSm').value, uid:$('rUid').value.trim(), count: Math.max(1, toNum($('rCnt').value)||1), reason:$('rReason').value.trim(), code:$('rCode').value.trim().toUpperCase(), amount:amt, pts, plan:$('rPlan').value, status:$('rStatus').value, memo:$('rMemo').value.trim(), updatedAt:new Date().toISOString(), by:S.me||''};
        const {id:_omit, ...prev} = x;
        try { if (id) await db.doc('returns/'+id).set({...prev, ...data}); else await db.collection('returns').add({...data, createdAt:data.updatedAt});
          logIt('返戻', `${data.base} ${ym(data.sm)}提供分 ${data.uid||''}${data.count>1?`（${data.count}名）`:''} ${amt?yen(amt)+'円':yen(pts)+'点'} を「${data.status}」で${id?'更新':'記録'}`); closeDrawer(); toast('返戻台帳を保存しました'); }
        catch (e) { $('dMsg').textContent = '保存できませんでした。'; }
      });
      $('rDel')?.addEventListener('click', async () => { if (!confirmDel) { confirmDel = true; $('rDel').textContent = 'もう一度押すと削除します'; return; } try { await db.doc('returns/'+id).delete(); logIt('削除', `返戻台帳 ${x.base} ${ym(x.sm)} ${x.uid||''} を削除`); closeDrawer(); toast('削除しました'); } catch (e) { $('dMsg').textContent = '削除できませんでした。'; } });
    }});
}

/* ================= 台帳・履歴 ================= */
function renderLedger() {
  const L = S.led;
  const tabs = `<div class="subtabs" role="tablist"><button type="button" role="tab" data-lv="rows" aria-selected="${L.view==='rows'}">台帳</button><button type="button" role="tab" data-lv="logs" aria-selected="${L.view==='logs'}">変更履歴</button></div>`;
  if (L.view === 'logs') {
    $('main').innerHTML = `<div class="page"><section class="panel"><div class="ptitle"><span class="eyebrow">すべての記録</span><h1>台帳・変更履歴</h1><p class="hint">いつ・誰が・何を変えたかが残ります（直近200件）。</p></div></section><section class="panel col" style="gap:12px">${tabs}
      <div class="tablewrap"><table><thead><tr><th>日時</th><th>入力した人</th><th>操作</th><th>内容</th></tr></thead><tbody>${S.logs.length ? S.logs.map(l => `<tr><td class="num">${fmtDate(l.at)}</td><td>${esc(l.who)}</td><td>${esc(l.action)}</td><td class="memo" style="color:var(--ink)">${esc(l.text)}</td></tr>`).join('') : '<tr><td colspan="4" class="hint">まだ変更履歴はありません。このツールで入力・修正すると、ここに残ります。</td></tr>'}</tbody></table></div></section></div>`;
    $('main').querySelectorAll('[data-lv]').forEach(bt => bt.addEventListener('click', () => { L.view = bt.dataset.lv; renderLedger(); }));
    return;
  }
  const list = view(), pms = [...new Set(list.map(r => r.pm).filter(Boolean))].sort().reverse(), q = L.q.trim();
  const shown = list.filter(r => (!L.pm || r.pm === L.pm) && (!L.kind || r.kind === L.kind) && (!L.unchecked || !r.checked) && (!q || (r.memo||'').includes(q) || String(Math.abs(r.amount)).includes(q.replace(/,/g,''))))
    .sort((a,b) => (b.pm||'').localeCompare(a.pm||'') || a.base.localeCompare(b.base) || ORDER.indexOf(a.kind)-ORDER.indexOf(b.kind) || (a.sm||'').localeCompare(b.sm||''));
  const unchecked = list.filter(r => !r.checked).length;
  $('main').innerHTML = `<div class="page">
    <section class="panel"><div class="row"><div class="ptitle" style="flex:1"><span class="eyebrow">すべての記録</span><h1>台帳・変更履歴</h1><p class="hint">「今月の作業」で入れた数字は、ここに1行ずつ記録されます。確認チェックは、入力した人とは別の人が書類と見比べて付けます。</p></div><button type="button" class="btn" id="addRaw">＋ 1行を直接追加</button></div></section>
    <section class="panel col" style="gap:14px">${tabs}
      <div class="row" style="align-items:flex-end">
        <label class="f" style="width:170px">処理月<select id="lfPm"><option value="">すべて</option>${pms.map(p => `<option value="${p}" ${p===L.pm?'selected':''}>${ym(p)}</option>`).join('')}</select></label>
        <label class="f" style="width:170px">区分<select id="lfKind"><option value="">すべて</option>${ORDER.map(k => `<option value="${k}" ${k===L.kind?'selected':''}>${KINDS[k].name}</option>`).join('')}</select></label>
        <label class="f" style="flex:1;min-width:180px">メモ・金額で探す<input id="lfQ" type="search" value="${esc(L.q)}" placeholder="例：返戻、4572428"></label>
        <label style="display:flex;gap:8px;align-items:center;font-size:14px;padding-bottom:8px"><input type="checkbox" id="lfUn" ${L.unchecked?'checked':''}>未確認だけ</label></div>
      <div class="row"><span class="hint">${shown.length}件を表示（全${list.length}件・未確認${unchecked}件）</span><div class="spacer"></div>${shown.some(r=>!r.checked)?`<button type="button" class="btn small" id="checkAll">表示中の行をすべて確認済みにする</button>`:''}</div>
      <div class="tablewrap"><table><thead><tr><th>確認</th><th>処理月</th><th>拠点</th><th>区分</th><th>提供月</th><th class="r">金額</th><th>メモ</th><th></th></tr></thead><tbody>${
        shown.length ? shown.map(r => `<tr><td><input type="checkbox" aria-label="確認済み" data-check="${r.id}" ${r.checked?'checked':''}>${r.checked&&r.checkedBy?`<br><span class="hint">${esc(r.checkedBy)}</span>`:''}</td><td>${ym(r.pm)}</td><td>${esc(r.base)}</td><td>${esc(KINDS[r.kind]?.name||r.kind)}</td><td>${r.sm?ym(r.sm):'—'}</td><td class="num r">${sgn(r.amount)}</td><td class="memo">${esc(r.memo)}</td><td><button type="button" class="btn small" data-edit="${r.id}">編集</button></td></tr>`).join('')
        : '<tr><td colspan="8" class="hint">該当する行はありません。</td></tr>'}</tbody></table></div></section></div>`;
  $('main').querySelectorAll('[data-lv]').forEach(bt => bt.addEventListener('click', () => { L.view = bt.dataset.lv; renderLedger(); }));
  $('lfPm').addEventListener('change', e => { L.pm = e.target.value; renderLedger(); });
  $('lfKind').addEventListener('change', e => { L.kind = e.target.value; renderLedger(); });
  $('lfUn').addEventListener('change', e => { L.unchecked = e.target.checked; renderLedger(); });
  let qt; $('lfQ').addEventListener('input', e => { clearTimeout(qt); qt = setTimeout(() => { L.q = e.target.value; renderLedger(); const i = $('lfQ'); i.focus(); i.setSelectionRange(i.value.length, i.value.length); }, 300); });
  $('addRaw').addEventListener('click', () => openRowEditor(null));
  $('checkAll')?.addEventListener('click', async () => { const t = shown.filter(r=>!r.checked); try { for (const r of t) await db.doc('entries/'+r.id).update({checked:true, checkedBy:S.me||''}); logIt('確認', `${t.length}行を確認済みに`); toast('確認済みにしました'); } catch (e) { toast('更新できませんでした'); } });
}
function openRowEditor(id) {
  const r = id ? S.rows.find(x => x.id === id) : {base: S.base==='合算'?'御所':S.base, kind:'X99', sm:'', pm:nowM, amount:0, memo:''};
  if (!r) return; let confirmDel = false;
  openDrawer({eyebrow: id ? '台帳の行を編集' : '台帳に1行追加', title: id ? `${KINDS[r.kind]?.name||r.kind}（${ym(r.pm)}）` : '1行を直接追加',
    note: id ? '通常は「今月の作業」の各画面から直すのがおすすめです。ここでは1行だけを直接変更します。' : '決まった書類にない調整（訂正など）を入れるときに使います。',
    body: noMe() + `<div class="fgrid">
      <label class="f">拠点<select id="eBase">${BASES.map(b=>`<option ${b===r.base?'selected':''}>${b}</option>`).join('')}</select></label>
      <label class="f">区分<select id="eKind">${ORDER.map(k=>`<option value="${k}" ${k===r.kind?'selected':''}>${KINDS[k].name}</option>`).join('')}</select></label>
      <label class="f">提供月<select id="eSm"><option value="">なし</option>${monthOpts(r.sm)}</select></label>
      <label class="f">処理月<select id="ePm">${monthOpts(r.pm)}</select></label>
      <label class="f">金額（円）<span class="sub">差し引く額はマイナスで</span><input class="amt" id="eAmt" inputmode="numeric" value="${r.amount<0?'-':''}${yen(Math.abs(r.amount))}"></label>
      <label class="f" style="justify-content:flex-end"><span style="display:flex;gap:8px;align-items:center;font-weight:400"><input type="checkbox" id="eChk" ${r.checked?'checked':''}>確認済み</span></label>
    </div><label class="f" style="margin-top:14px">メモ<input id="eMemo" value="${esc(r.memo)}"></label>`,
    footer: footerSave() + (id ? `<div class="spacer"></div><button type="button" class="btn danger" id="eDel">削除</button>` : ''),
    mount: () => {
      $('dSave').addEventListener('click', async () => {
        const raw = $('eAmt').value.trim(), neg = /^[-−]/.test(raw), v = toNum(raw.replace(/^[-−]/,'')) * (neg ? -1 : 1), k = $('eKind').value, msg = $('dMsg');
        if (!v) return msg.textContent = '金額を入れてください。';
        if (KINDS[k].sm && !$('eSm').value) return msg.textContent = 'この区分は提供月が必要です。';
        const amount = KINDS[k].sign === 0 ? v : KINDS[k].sign * Math.abs(v);
        const data = {base:$('eBase').value, kind:k, sm:$('eSm').value, pm:$('ePm').value, amount, memo:$('eMemo').value.trim(), checked:$('eChk').checked, checkedBy: $('eChk').checked ? (r.checkedBy || S.me || '') : ''};
        try { if (id) await db.doc('entries/'+id).update(data); else await db.collection('entries').add({...data, createdAt:new Date().toISOString(), by:S.me||''});
          logIt(id?'修正':'入力', `${data.base} ${KINDS[k].name}（${ym(data.pm)}）${id?`${sgn(r.amount)} → `:''}${sgn(amount)}`); closeDrawer(); toast('保存しました'); }
        catch (e) { msg.textContent = '保存できませんでした。'; }
      });
      $('eDel')?.addEventListener('click', async () => { if (!confirmDel) { confirmDel = true; $('eDel').textContent = 'もう一度押すと削除します'; return; } try { await db.doc('entries/'+id).delete(); logIt('削除', `${r.base} ${KINDS[r.kind].name}（${ym(r.pm)}）${sgn(r.amount)} を削除`); closeDrawer(); toast('削除しました'); } catch (e) { $('dMsg').textContent = '削除できませんでした。'; } });
    }});
}

/* ================= 設定・使い方 ================= */
function csvOf(rows) { return '﻿' + rows.map(r => r.map(v => { const s = String(v ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s; }).join(',')).join('\r\n'); }
async function saveFile(filename, data) {
  if (!dl) { toast('この表示ではファイルを書き出せません'); return false; }
  try { await dl.save({filename, data}); return true; } catch (e) { if (e?.code !== 'declined') toast('書き出せませんでした'); return false; }
}
function renderSettings() {
  const st = S.settings, lb = st.lastBackupAt;
  $('main').innerHTML = `<div class="page">
    <section class="panel"><div class="ptitle"><span class="eyebrow">設定・引き継ぎ</span><h1>設定・使い方</h1><p class="hint">毎月の流れ、ことばの意味、契約条件、バックアップをまとめています。引き継ぎのときはこのページから読んでもらいます。</p></div></section>
    <section class="panel col" style="gap:14px"><h2>毎月の流れ</h2><p class="hint">${mm(addM(nowM,-1))}にサービスを提供した分を例にすると、次のように進みます。「今月の作業」の4つのカードが、それぞれの書類に対応しています。</p>
      <div class="flow">
        <div class="fc"><span class="fc-ic">${ic('send',20)}</span><span class="eyebrow">翌月1〜10日（目安5〜6日）</span><b>① 国保連・トワライズへ請求</b><span>国保連に請求し、同じタイミングでトワライズに立替を請求します。返戻の再請求分はトワライズには請求しません（二重の立替を防ぐため）。</span><span class="hint">入れる数字：国保連の請求額、立替請求額</span></div>
        <div class="fc"><span class="fc-ic">${ic('receipt',20)}</span><span class="eyebrow">翌月15日・17日</span><b>④ トワライズ明細・精算</b><span>15日ごろに立替金が入金され、17日ごろにサイトで明細が見られます。立替金から、2か月前の清算金と手数料が差し引かれています。</span><span class="hint">入れる数字：明細の清算金・手数料、通帳の入金額</span></div>
        <div class="fc"><span class="fc-ic">${ic('return',20)}</span><span class="eyebrow">翌月末</span><b>返戻の連絡</b><span>返戻があると連絡が来ます。この時点では点数しか分からないので、返戻台帳に点数で記録します。</span><span class="hint">入れる数字：利用者ID・点数</span></div>
        <div class="fc"><span class="fc-ic">${ic('mail',20)}</span><span class="eyebrow">翌々月5日ごろ</span><b>② 国保連 払出し通知</b><span>国保連の確定額が分かります。立替請求との差が清算額で、通常は2か月後、立替請求の20％を超えると1か月後の立替入金で差し引かれます。</span><span class="hint">入れる数字：払出し通知書の額、返戻の金額</span></div>
        <div class="fc"><span class="fc-ic">${ic('chat',20)}</span><span class="eyebrow">毎月5〜10日</span><b>③ 齋藤様へ報告・売上概算</b><span>今月の請求額・先月の国保連からの入金・来月の清算見込みを送ります。売上の見込みは会計の先生にも伝えます。</span><span class="hint">操作：報告文をコピーして送り、報告済みにする</span></div></div>
    </section>
    <section class="panel col" style="gap:14px"><h2>ことばの意味</h2><dl class="dl">
      <dt>提供月</dt><dd>サービスを提供した月。売上はこの月で数えます。</dd>
      <dt>処理月・精算月</dt><dd>請求や入金が実際に起きた月。お金の動きはこの月で数えます。</dd>
      <dt>立替しない額</dt><dd>国保連には請求したが、トワライズには立替請求していない額。主に返戻の再請求分です。</dd>
      <dt>払出し通知書</dt><dd>国保連が5日ごろに出す、確定した支払額の通知。トワライズの口座（山陰合同銀行）に振り込まれる額で、市町村番号ごとの合計が載っています。</dd>
      <dt>返戻・未払い</dt><dd>国保連の確定額と立替請求額の差。国保連から入らなかった分（マイナス）や、再請求分が入った分（プラス）です。</dd>
      <dt>清算（相殺）</dt><dd>立替請求と国保連の確定額の差を、後の立替入金で差し引くこと。通常は2か月後（例：5月提供分は7月提供分の立替入金で）。</dd>
      <dt>20％ルール</dt><dd>清算額が立替請求の20％を超えると、清算が1か月早まります。返戻の再請求分までトワライズに請求すると、清算額が膨らんで当たりやすくなります。</dd>
      <dt>売上概算</dt><dd>5日ごろに会計の先生と齋藤様にお伝えする、今月の売上の見込み。確定は17日ごろのトワライズの明細です。</dd>
      <dt>未解消</dt><dd>返戻・未払いのうち、まだ相殺されていない額。0になればその月は精算済みです。</dd>
      <dt>立替し直し</dt><dd>一度入金されなかった分を、トワライズがあらためて立て替えたもの。</dd>
      <dt>実効年率</dt><dd>手数料を年利に直した目安。手数料 ÷ 立替額 × 12 で、立替期間を約30日とみた推計です。</dd></dl></section>
    <section class="panel col" style="gap:10px"><h2>よくある質問</h2>
      <details><summary>間違えて入力したときは？</summary><p>「今月の作業」の該当カードで「確認・修正」を押し、正しい数字に直して保存します。その書類の分はまるごと置き換わり、変更前と変更後が変更履歴に残ります。1行だけ直したいときは「台帳・履歴」の「編集」からも直せます。</p></details>
      <details><summary>返戻の再請求分はどう入れますか？</summary><p>① の画面で「請求書を追加」を押し、再請求分を2枚目として入れます。トワライズへの立替請求は「返戻の再請求分を除く（新規分だけ）」を選び、再請求分の額を入れます。同じ方の分をトワライズに2回請求すると二重の立替になり、清算額が膨らんで20％ルールに当たりやすくなるためです。</p></details>
      <details><summary>清算が1か月早まるのはどんなときですか？</summary><p>国保連の確定額と立替請求の差（不足額）が、立替請求の20％を超えたときです。御所の請求が月500万円なら約100万円、大和高田が月200万円なら約40万円が目安です。② の画面で確定額を入れると、何月の立替入金で清算されるかが表示されます。</p></details>
      <details><summary>誰の分が入っていないかは、どう調べますか？</summary><p>払出し通知書は市町村番号ごとの合計で、利用者ごとの内訳は載っていません。10日に請求した資料（利用者ごとの名前と金額）と、市町村番号ごとに照らし合わせると特定できます。分かったら返戻台帳に記録すると、月次レポートの「清算見込みの内訳」に並びます。</p></details>
      <details><summary>売上概算は誰に、いつ伝えますか？</summary><p>5日ごろに、会計の先生（三光会計社）と齋藤様にお伝えします。「資金繰り」の画面で額を決め、文面をコピーして送り、「お伝えした額として保存」を押します。確定は17日ごろのトワライズの明細です。</p></details>
      <details><summary>精算で計算と入金が合わないときは？</summary><p>明細の清算金に入れ漏れがないかを確認します。④ の画面には、まだ清算されていない差額が候補として出るので、明細と見比べて追加してください。それでも合わない場合は、トワライズに明細を問い合わせます。</p></details>
      <details><summary>担当者が休むときは？</summary><p>このページと「今月の作業」の締切・書類の欄を見れば、代わりの人も同じ手順で進められます。入力した人の名前は左下で選び、確認は別の人が「台帳」のチェックで行います。</p></details>
      <details><summary>データが消えないか心配です</summary><p>月に1回、下の「バックアップ」で全データを書き出して、Googleドライブなどに保存してください。このツールのページを削除したり公開を取り消したりすると、保存データも消える場合があります。</p></details></section>
    <section class="panel col" style="gap:14px"><h2>契約条件・チェックの基準</h2><p class="hint">トワライズとの契約書で確認した値に合わせてください。④ の手数料の目安や、清算が1か月早まる注意に使います。</p>
      <div class="fgrid" style="max-width:720px">
        <label class="f">手数料率（％）<input class="amt" id="sRate" inputmode="decimal" value="${(st.feeRate*100).toFixed(2)}"></label>
        <label class="f">定額手数料（円）<span class="sub">過去の明細からの逆算では3,850円（契約書で要確認）</span><input class="amt" id="sFixed" inputmode="numeric" value="${yen(st.feeFixed)}"></label>
        <label class="f">清算が1か月早まる基準（％）<span class="sub">清算額（不足額）が立替請求の何％を超えると、2か月後の清算が1か月後になるか</span><input class="amt" id="sAlert" inputmode="decimal" value="${(st.alertRatio*100).toFixed(0)}"></label>
        <label class="f">異常値の基準（前月比％）<span class="sub">国保連請求がこれ以上増減したら注意を出す</span><input class="amt" id="sAnom" inputmode="decimal" value="${(st.anomaly*100).toFixed(0)}"></label></div>
      <div><button type="button" class="btn primary" id="sSave">保存する</button></div></section>
    <section class="panel col" style="gap:14px"><h2>入力する人</h2><p class="hint">ここで登録した名前を左下で選ぶと、入力・確認・報告の記録に名前が残ります。</p>
      <div class="row">${(st.members||[]).map((m,i) => `<span class="pill wait" style="font-size:13px">${esc(m)} <button type="button" class="btn ghost small" data-mdel="${i}" aria-label="${esc(m)}を削除">✕</button></span>`).join('') || '<span class="hint">まだ登録がありません。</span>'}</div>
      <div class="row" style="max-width:480px"><input id="mName" placeholder="例：山田（経理）"><button type="button" class="btn" id="mAdd">追加</button></div></section>
    <section class="panel col" style="gap:14px"><h2>バックアップと書き出し</h2>
      <p class="hint">最後のバックアップ：${lb ? new Date(lb).toLocaleString('ja-JP') : 'まだありません'}。月に1回を目安に書き出して、Googleドライブなどに保存してください。</p>
      <div class="row">
        <button type="button" class="btn primary" id="bkJson">全データを書き出す（JSON）</button>
        <button type="button" class="btn" id="bkCsv">台帳をCSVで書き出す</button>
        <button type="button" class="btn" id="bkAcc">会計事務所向けの月次データ（CSV）</button>
        <button type="button" class="btn" id="bkRet">返戻台帳をCSVで書き出す</button></div>
      <div class="col" style="gap:6px;border-top:1px solid var(--line);padding-top:14px"><b style="font-size:14px">バックアップから戻す</b><p class="hint">書き出したJSONファイルを選ぶと、中身を確認してから戻せます。同じ行は上書きされ、今あるほかの行は消えません。</p><div><button type="button" class="btn" id="bkRestore">JSONファイルを選ぶ</button></div><div id="restoreBox"></div></div></section></div>`;
  $('sSave').addEventListener('click', async () => {
    const rate = toNum($('sRate').value)/100, fixed = toNum($('sFixed').value), alert = toNum($('sAlert').value)/100, anom = toNum($('sAnom').value)/100;
    if (!(rate >= 0 && rate < .2) || !(alert > 0 && alert < 1) || !(anom > 0 && anom < 1)) return toast('数値を確認してください');
    try { await saveSettings({feeRate:rate, feeFixed:fixed, alertRatio:alert, anomaly:anom}, `契約条件を更新（手数料${(rate*100).toFixed(2)}％＋${yen(fixed)}円、清算が早まる基準${(alert*100).toFixed(0)}％）`); toast('設定を保存しました'); } catch (e) { toast('保存できませんでした'); }
  });
  $('mAdd').addEventListener('click', async () => { const n = $('mName').value.trim(); if (!n) return; try { await saveSettings({members:[...(st.members||[]), n]}, `入力する人に「${n}」を追加`); renderSettings(); drawMe(); } catch (e) { toast('保存できませんでした'); } });
  $('main').querySelectorAll('[data-mdel]').forEach(bt => bt.addEventListener('click', async () => { const m = [...st.members]; const [n] = m.splice(+bt.dataset.mdel,1); try { await saveSettings({members:m}, `入力する人から「${n}」を削除`); renderSettings(); drawMe(); } catch (e) { toast('保存できませんでした'); } }));
  const stamp = iso(new Date());
  $('bkJson').addEventListener('click', async () => {
    const data = JSON.stringify({app:'linoa-ledger', version:3, exportedAt:new Date().toISOString(), entries:S.rows, returns:S.returns, estimates:S.estimates, closes:Object.entries(S.closes).map(([id,v])=>({id,...v})), settings:S.settings}, null, 1);
    if (await saveFile(`LINOA請求入金台帳_バックアップ_${stamp}.json`, data)) { try { await saveSettings({lastBackupAt:new Date().toISOString()}, '全データをバックアップ'); } catch (e) {} toast('書き出しました'); renderSettings(); }
  });
  $('bkCsv').addEventListener('click', () => saveFile(`LINOA台帳_${stamp}.csv`, csvOf([['処理月','拠点','区分','提供月','金額','メモ','確認','確認者'], ...S.rows.slice().sort((a,b)=>(a.pm||'').localeCompare(b.pm||'')).map(r => [r.pm, r.base, KINDS[r.kind].name, r.sm, r.amount, r.memo, r.checked?'済':'', r.checkedBy||''])])));
  $('bkRet').addEventListener('click', () => saveFile(`LINOA返戻台帳_${stamp}.csv`, csvOf([['提供月','拠点','利用者ID','人数','事由','エラーコード','金額','再請求予定','状態','メモ'], ...S.returns.map(x => [x.sm, x.base, x.uid, x.count, x.reason, x.code, x.amount, x.plan, x.status, x.memo])])));
  $('bkAcc').addEventListener('click', () => {
    const rows = [['提供月','拠点','国保連請求（売上）','立替請求（債権譲渡）','立替しない額','国保連支払決定','相殺・清算','手数料（売上債権売却損）','遅延損害金','尼信入金（翌月精算分）']];
    BASES.forEach(b => reconRows(ofBase(b)).forEach(r => { const pm = addM(r.sm,1), st = settlement(ofBase(b), pm); rows.push([r.sm, b, r.k10, r.t10, r.nf, r.hasK30?r.k30:'', r.off, -(st.fee - st.late), -st.late, st.paidHas?st.paid:'']); }));
    saveFile(`LINOA会計事務所向け月次_${stamp}.csv`, csvOf(rows));
  });
  $('bkRestore').addEventListener('click', () => $('fileIn').click());
}
$('fileIn').addEventListener('change', async e => {
  const f = e.target.files[0]; e.target.value = ''; if (!f) return;
  let data; try { data = JSON.parse(await f.text()); } catch (er) { toast('JSONファイルを読み込めませんでした'); return; }
  if (data.app !== 'linoa-ledger' || !Array.isArray(data.entries)) { toast('このツールのバックアップファイルではありません'); return; }
  const box = $('restoreBox'); if (!box) return;
  box.innerHTML = `<div class="calc" style="margin-top:8px"><div class="cl"><span>書き出した日時</span><span>${new Date(data.exportedAt).toLocaleString('ja-JP')}</span></div><div class="cl"><span>台帳</span><span class="num">${data.entries.length}行</span></div><div class="cl"><span>返戻台帳</span><span class="num">${(data.returns||[]).length}件</span></div><div class="cl"><span>売上概算</span><span class="num">${(data.estimates||[]).length}件</span></div><div class="row" style="margin-top:8px"><button type="button" class="btn primary" id="doRestore">この内容で戻す</button><button type="button" class="btn" id="noRestore">やめる</button></div></div>`;
  $('noRestore').addEventListener('click', () => box.innerHTML = '');
  $('doRestore').addEventListener('click', async () => {
    $('doRestore').disabled = true; $('doRestore').textContent = '戻しています…';
    try {
      const put = async (col, arr) => { for (const x of arr || []) { const {id, ...rest} = x; if (id) await db.doc(`${col}/${id}`).set(rest); } };
      await put('entries', data.entries); await put('returns', data.returns); await put('estimates', data.estimates); await put('closes', data.closes);
      if (data.settings) await db.doc('settings/main').set({...DEFAULT_SETTINGS, ...data.settings});
      logIt('復元', `${new Date(data.exportedAt).toLocaleDateString('ja-JP')}のバックアップから戻しました（台帳${data.entries.length}行）`); toast('バックアップから戻しました'); box.innerHTML = '';
    } catch (er) { toast('途中で止まりました。もう一度お試しください'); $('doRestore').disabled = false; $('doRestore').textContent = 'この内容で戻す'; }
  });
});

/* ================= 骨組み ================= */
function drawMenu() {
  const nOpen = BASES.flatMap(openItems).filter(o => o.state === 'open').length;
  const nRet = S.returns.filter(x => !['入金済','対象外'].includes(x.status) && x.plan && x.plan < nowM).length;
  const btn = ([k,l,icn]) => `<button type="button" data-tab="${k}" ${S.tab===k?'aria-current="page"':''}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icn}</svg>${l}${k==='recon'&&nOpen?`<span class="badge">${nOpen}</span>`:k==='returns'&&nRet?`<span class="badge">${nRet}</span>`:''}</button>`;
  $('menu').innerHTML = MENU_GROUPS.map(([g, ks]) => `<div class="mgroup"><span class="mg-lbl">${g}</span>${ks.map(k => btn(MENU.find(m => m[0] === k))).join('')}</div>`).join('');
}
function drawMe() {
  const ms = S.settings.members || [];
  $('meSel').innerHTML = `<option value="">${ms.length?'選んでください':'設定で名前を登録'}</option>` + ms.map(m => `<option ${m===S.me?'selected':''}>${esc(m)}</option>`).join('');
}
function render() {
  drawMenu();
  if (!S.loaded && db) { $('main').innerHTML = '<div class="page"><div class="panel"><p class="hint">データを読み込んでいます…</p></div></div>'; return; }
  ({home:renderHome, report:renderReport, cash:renderCash, recon:renderRecon, returns:renderReturns, ledger:renderLedger, settings:renderSettings, learn:renderLearn})[S.tab]();
  $('crumb').innerHTML = crumbHtml();
  const fn = flowNavHtml(S.tab); if (fn) $('main').querySelector('.page')?.insertAdjacentHTML('beforeend', fn);
}
function setTab(t) { S.tab = t; try { localStorage.setItem('linoa-tab', t); } catch (e) {} render(); window.scrollTo({top:0}); }
$('baseSeg').addEventListener('click', e => { const b = e.target.closest('[data-base]'); if (!b) return; S.base = b.dataset.base; document.querySelectorAll('[data-base]').forEach(x => x.setAttribute('aria-pressed', x === b)); render(); });
$('menu').addEventListener('click', e => { const t = e.target.closest('[data-tab]'); if (t) setTab(t.dataset.tab); });
$('meSel').addEventListener('change', e => { S.me = e.target.value; try { localStorage.setItem('linoa-me', S.me); } catch (er) {} toast(S.me ? `「${S.me}」として記録します` : '名前を外しました'); });
$('main').addEventListener('click', async e => {
  const wm = e.target.closest('[data-wm]'); if (wm) { const k = +wm.dataset.wm; S.work = k === 0 ? nowM : addM(S.work, k); renderHome(); return; }
  const op = e.target.closest('[data-open]'); if (op) { if (!db) return toast('この表示では保存できません'); const b = op.dataset.b, k = op.dataset.open;
    if (k === 'A') openStepA(b, addM(S.work,-1)); else if (k === 'B') openStepB(b, op.dataset.pm || S.work); else openStepC(b, addM(S.work,-2)); return; }
  if (e.target.closest('[data-goreport]')) { S.repPm = S.work; setTab('report'); return; }
  if (e.target.closest('[data-golist]')) { S.led.unchecked = true; S.led.view = 'rows'; setTab('ledger'); return; }
  const go = e.target.closest('[data-go]'); if (go) { setTab(go.dataset.go); return; }
  const rc = e.target.closest('[data-recon]'); if (rc) { const [b, sm] = rc.dataset.recon.split('|'); openReconDetail(b, sm); return; }
  const ed = e.target.closest('[data-edit]'); if (ed) { openRowEditor(ed.dataset.edit); return; }
  const re = e.target.closest('[data-retedit]'); if (re) { openReturnEditor(re.dataset.retedit, {}); return; }
  const dlk = e.target.closest('[data-doclink]'); if (dlk) { const key = dlk.dataset.doclink;
    openDrawer({eyebrow:'書類の保管', title:'保存先のリンク', note:'Googleドライブなどに保存したファイルやフォルダのURL（https://…）を貼り付けます。', body:`<label class="f">URL<input id="dlUrl" placeholder="https://drive.google.com/..." value="${esc((S.closes[S.work]?.docs||{})[key]?.url||'')}"></label>`, footer: footerSave(),
      mount: () => $('dSave').addEventListener('click', async () => { const u = $('dlUrl').value.trim(); if (u && !linkOk(u)) return $('dMsg').textContent = 'https:// で始まるURLを入れてください。'; try { await setDoc(key, {url:u, done:true}); closeDrawer(); toast('リンクを保存しました'); } catch (er) { $('dMsg').textContent = '保存できませんでした。'; } }) });
    return; }
});
$('main').addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.matches('tr[data-recon]')) { const [b, sm] = e.target.dataset.recon.split('|'); openReconDetail(b, sm); } });
$('main').addEventListener('change', async e => {
  const id = e.target.dataset.check; if (id && db) { try { await db.doc('entries/'+id).update({checked: e.target.checked, checkedBy: e.target.checked ? (S.me||'') : ''}); } catch (err) { e.target.checked = !e.target.checked; toast('更新できませんでした'); } return; }
  const dk = e.target.dataset.doc; if (dk && db) { try { await setDoc(dk, {done: e.target.checked}); } catch (err) { e.target.checked = !e.target.checked; toast('更新できませんでした'); } }
});

try { const t = localStorage.getItem('linoa-tab'); if (t && MENU.some(m => m[0] === t)) S.tab = t; S.me = localStorage.getItem('linoa-me') || ''; } catch (e) {}
drawMe(); render();
(async () => {
  db = window.claude ? await window.claude.use('db') : null;
  dl = window.claude ? await window.claude.use('downloads') : null;
  if (!db) { $('notice').hidden = false; $('notice').textContent = 'この表示ではデータを読み込めません。claude.ai上でこのページを開いてください。'; render(); return; }
  render();
  const fail = () => { $('notice').hidden = false; $('notice').textContent = 'データの読み込みが止まりました。ページを開き直してください。'; };
  const busy = () => $('drawerRoot').innerHTML || ['cmt','lfQ','mName'].includes(document.activeElement?.id) || document.activeElement?.dataset?.est || document.activeElement?.dataset?.estreason;
  const safeRender = () => { if (!S.loaded) return; if (busy()) pendingRender = true; else render(); };
  db.collection('entries').limit(1000).onSnapshot(snap => { S.rows = snap.docs.map(d => ({id: d.id, ...d.data()})).filter(r => KINDS[r.kind]); S.loaded = true; safeRender(); }, fail);
  db.collection('closes').limit(300).onSnapshot(snap => { S.closes = Object.fromEntries(snap.docs.map(d => [d.id, d.data()])); safeRender(); }, fail);
  db.collection('returns').limit(1000).onSnapshot(snap => { S.returns = snap.docs.map(d => ({id: d.id, ...d.data()})); safeRender(); }, fail);
  db.collection('estimates').limit(500).onSnapshot(snap => { S.estimates = snap.docs.map(d => ({id: d.id, ...d.data()})); safeRender(); }, fail);
  db.collection('logs').orderBy('at','desc').limit(200).onSnapshot(snap => { S.logs = snap.docs.map(d => d.data()); if (S.tab === 'ledger' && S.led.view === 'logs') safeRender(); }, fail);
  db.doc('settings/main').onSnapshot(d => { if (d.exists) { S.settings = {...structuredClone(DEFAULT_SETTINGS), ...d.data()}; drawMe(); safeRender(); } }, fail);
  document.addEventListener('focusout', () => setTimeout(() => { if (pendingRender && !busy()) { pendingRender = false; render(); } }, 0));
})();
document.getElementById('demoReset').addEventListener('click',()=>window.__resetDemo());
