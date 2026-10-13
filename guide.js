/* ================= 使い方レクチャー・次にやること =================
   app.js より先に読み込む。中の関数は app.js の読み込み後に呼ばれる。 */

/* ---------- 保存（このブラウザだけの受講記録） ---------- */
const GKEY = 'linoa-guide-v1';
function gLoad() { try { return JSON.parse(localStorage.getItem(GKEY)) || {}; } catch (e) { return {}; } }
function gSave(patch) { const g = {...gLoad(), ...patch}; try { localStorage.setItem(GKEY, JSON.stringify(g)); } catch (e) {} return g; }
const gWait = ms => new Promise(r => setTimeout(r, ms));
const gReduce = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- アイコン（線画・currentColor） ---------- */
const IC = {
  home:'<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  doc:'<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/><path d="M8 13h8M8 17h5"/>',
  send:'<path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4z"/>',
  mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  chat:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 9h8M8 13h5"/>',
  receipt:'<path d="M5 2v20l2.5-1.5L10 22l2-1.5 2 1.5 2.5-1.5L19 22V2l-2.5 1.5L14 2l-2 1.5L10 2 7.5 3.5z"/><path d="M9 8h6M9 12h6M9 16h4"/>',
  'return':'<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-2"/>',
  calendar:'<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  yen:'<path d="M6 3l6 8 6-8"/><path d="M12 11v10M7 13h10M7 17h10"/>',
  calc:'<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8"/><path d="M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 19h8"/>',
  check:'<path d="M20 6 9 17l-5-5"/>',
  warn:'<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  swap:'<path d="M7 7h13M7 7l3-3M7 7l3 3M17 17H4m13 0-3-3m3 3-3 3"/>',
  menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
  flag:'<path d="M5 22V3"/><path d="M5 4h12l-2.5 4L17 12H5"/>',
  save:'<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/>',
  copy:'<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  folder:'<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  percent:'<path d="M19 5 5 19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
  building:'<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 7h.01M15 7h.01M9 11h.01M15 11h.01M9 15h.01M15 15h.01M10 21v-3h4v3"/>',
  repeat:'<path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
  bank:'<path d="M3 10h18M12 3 3 8h18z"/><path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 21h18"/>',
  list:'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  play:'<path d="M7 4v16l13-8z"/>',
  book:'<path d="M2 8l10-4 10 4-10 4z"/><path d="M6 10v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5"/>',
  sliders:'<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
  arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>'
};
const ic = (n, s = 18) => `<svg class="i" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n] || ''}</svg>`;
const chip = (n, t, cls = '') => `<span class="chip ${cls}">${ic(n, 15)}<span>${t}</span></span>`;
const STEP_META = {
  A:{ic:'send', no:'①', s:'請求', when:'1〜10日'},
  C:{ic:'mail', no:'②', s:'払出し通知', when:'5日ごろ'},
  D:{ic:'chat', no:'③', s:'報告', when:'5〜10日'},
  B:{ic:'receipt', no:'④', s:'明細', when:'15・17日'}
};

/* ---------- 次にやること ---------- */
function flowSteps(w) {
  const close = S.closes[w] || {}, dl0 = kokuhoDeadline(w);
  const okState = s => ['done','ok','na'].includes(s);
  const doneOf = k => BASES.every(b => okState(stepStatus(k, b, w).state));
  const openBase = k => BASES.find(b => !okState(stepStatus(k, b, w).state)) || '';
  return [
    {k:'A', no:'①', t:'国保連・トワライズへの請求', from:1, to:dl0.getDate(), when:`1〜${dl0.getDate()}日`, done:doneOf('A'), base:openBase('A'), doc:'請求データ（サマリ）', why:`${mm(addM(w,-1))}提供分の請求額を入れる`},
    {k:'C', no:'②', t:'国保連 払出し通知の確認', from:4, to:10, when:'5日ごろ', done:doneOf('C'), base:openBase('C'), doc:'払出し通知書', why:`${mm(addM(w,-2))}提供分の確定額を入れる`},
    {k:'D', no:'③', t:'齋藤様へ報告・売上概算', from:5, to:10, when:'5〜10日', done:!!close.reportedAt, base:'', doc:'月次レポート', why:'3つの数字をコピーして送る'},
    {k:'B', no:'④', t:'トワライズ明細・精算の確認', from:15, to:31, when:'15日入金・17日明細', done:doneOf('B'), base:openBase('B'), doc:'トワライズ明細・通帳', why:`${mm(w)}の立替入金を確かめる`}
  ];
}
function nextStep(w) {
  const st = flowSteps(w), d = today.getDate(), isNow = w === nowM;
  const pending = st.filter(s => !s.done);
  if (!pending.length) return {st, all:true};
  const due = isNow ? pending.filter(s => d >= s.from) : pending;
  const cur = due[0] || null;
  return {st, cur, upcoming: cur ? pending.find(s => s !== cur) : pending[0], overdue: !!(cur && isNow && d > cur.to)};
}
function goNext(k, b) {
  if (k === 'D') { S.repPm = S.work; setTab('report'); return; }
  if (!db) return toast('この表示では入力できません');
  b = b || BASES[0];
  if (k === 'A') openStepA(b, addM(S.work,-1)); else if (k === 'C') openStepC(b, addM(S.work,-2)); else openStepB(b, S.work);
}
const STEP_TOUR = {A:['monthly',0], C:['monthly',6], D:['report',0], B:['monthly',11]};
function stepperHtml(n) {
  return `<ol class="stepper">${n.st.map(s => { const m = STEP_META[s.k], cur = n.cur && s.k === n.cur.k;
    return `<li class="${s.done?'is-done':cur?'is-cur':''}"><span class="node">${s.done ? ic('check', 18) : ic(m.ic, 18)}</span><b>${m.no} ${m.s}</b><small>${m.when}</small></li>`; }).join('')}</ol>`;
}
function nextCardHtml(w) {
  const n = nextStep(w), doneN = n.st.filter(s => s.done).length;
  let main;
  if (n.all) main = `<div class="nc-hero"><span class="nc-ic ok">${ic('check', 30)}</span><div><span class="eyebrow">次にやること</span><h2>今月の作業は完了</h2></div></div>
      <div class="chips">${chip('calendar', `次は${mm(addM(w,1))}1日から請求`)}${chip('return', '月末の返戻の連絡は返戻台帳へ')}</div>
      <div class="row"><button type="button" class="btn" data-go="returns">${ic('return',16)}返戻台帳</button></div>`;
  else {
    const c = n.cur || n.upcoming, m = STEP_META[c.k], soon = !n.cur;
    main = `<div class="nc-hero"><span class="nc-ic">${ic(m.ic, 30)}</span><div><span class="eyebrow">${soon ? `次は${c.from}日ごろから` : '次にやること'}${n.overdue?' <span class="pill bad">目安を過ぎています</span>':''}</span>
        <h2>${c.no} ${c.t}</h2></div></div>
      <p class="nc-why">${c.why}${c.base ? `（${c.base}から）` : ''}</p>
      <div class="chips">${chip('doc', c.doc)}${chip('calendar', c.when)}</div>
      <div class="row"><button type="button" class="btn ${soon?'':'primary'} big" data-nextgo="${c.k}|${c.base}">${ic('play',16)}${soon ? '先に開いておく' : 'はじめる'}</button><button type="button" class="btn ghost" data-tourstart="${STEP_TOUR[c.k].join('|')}">${ic('book',16)}やり方を見る</button></div>`;
  }
  return `<section class="panel nextcard" id="nextCard"><div class="nc-main">${main}</div>
    <div class="nc-side"><div class="nc-prog"><b>${mm(w)}の進み具合</b><span class="num">${doneN}<small> / 4</small></span></div>${stepperHtml(n)}</div></section>`;
}
function guideBanner() {
  const g = gLoad(); if (g.seen) return '';
  return `<section class="panel welcome" id="welcome"><span class="nc-ic">${ic('book', 28)}</span><div class="col" style="gap:2px;flex:1;min-width:220px"><span class="eyebrow">はじめての方へ</span><h2>実際の画面で、使い方を案内します</h2>
    <div class="chips">${chip('clock','約3分')}${chip('check','触っても大丈夫（デモ）')}</div></div>
    <div class="row"><button type="button" class="btn primary big" data-tourstart="intro|0">${ic('play',16)}はじめる</button><button type="button" class="btn" data-go="learn">${ic('list',16)}講座一覧</button><button type="button" class="btn ghost" data-guideclose="1">あとで</button></div></section>`;
}
function savedNext(msg) {
  setTimeout(() => {
    const n = nextStep(S.work); let text = '', btn = '', icn = 'check';
    if (n.all) text = '今月の作業はすべて完了';
    else if (n.cur) { text = `次は ${n.cur.no} ${STEP_META[n.cur.k].s}${n.cur.base?`（${n.cur.base}）`:''}`; icn = STEP_META[n.cur.k].ic; btn = `<button type="button" class="btn small primary" data-nextgo="${n.cur.k}|${n.cur.base}">進む${ic('arrow',14)}</button>`; }
    else text = `次は${n.upcoming.from}日ごろ ${n.upcoming.no} ${STEP_META[n.upcoming.k].s}`;
    const el = document.createElement('div'); el.className = 'nextbar'; el.setAttribute('role','status');
    el.innerHTML = `<span class="nb-ok">${ic('check',18)}</span><div class="col" style="gap:0;min-width:0"><b>${esc(msg)}</b><span>${ic(icn,14)} ${text}</span></div>${btn}<button type="button" class="btn iconbtn" data-nbclose="1" aria-label="閉じる">✕</button>`;
    $('toastRoot').replaceChildren(el);
    setTimeout(() => { if (el.isConnected) el.remove(); }, 12000);
  }, 450);
}

/* ---------- 講座 ---------- */
const TOURS = {
  intro:{title:'画面の見方', ic:'home', min:3, next:'monthly', learn:[['flag','次にやることの見方'],['list','4つのステップ'],['warn','注意の出かた']], steps:[
    {tab:'home', ic:'home', title:'このツールでできること', body:'書類の数字を入れるだけで、差額の計算と報告文ができます。', pts:[['send','① 請求'],['mail','② 払出し通知'],['chat','③ 報告'],['receipt','④ 明細']]},
    {tab:'home', sel:'#baseSeg', ic:'swap', title:'拠点を切り替える', body:'入力は拠点ごと、確認と報告は合算で。'},
    {tab:'home', sel:'#menu', ic:'menu', title:'メニュー', body:'毎月の作業は「今月の作業」だけで進められます。', pts:[['book','使い方レクチャーもここ']]},
    {tab:'home', sel:'#nextCard', ic:'flag', title:'次にやること', body:'迷ったら、ここの「はじめる」を押すだけ。', pts:[['doc','用意する書類'],['calendar','時期'],['check','今月の進み具合']]},
    {tab:'home', sel:'.deadline', ic:'calendar', title:'請求の締切', body:'土日祝は自動で翌営業日にずらします。', pts:[['clock','いつもは5〜6日に請求']]},
    {tab:'home', sel:'.timeline', ic:'clock', title:'1か月の流れ', body:'今日の位置に「今ここ」が付きます。'},
    {tab:'home', sel:'.steps', ic:'list', title:'4つのステップ', body:'左から順に、書類の数字を入れます。', pts:[['check','終わると ✓'],['flag','次は「次はこれ」']]},
    {tab:'home', sel:'.attn', ic:'warn', title:'確認が必要なこと', body:'ずれや清算待ちを自動で拾います。', pts:[['search','ボタンで該当の画面へ']]},
    {tab:'home', sel:'.docgrid', ic:'folder', title:'書類の保管', body:'保存したら、チェックとリンクを残します。', pts:[['warn','国保連の通知は消えることがある']]},
    {tab:'home', sel:'.me', ic:'user', title:'入力する人', body:'入力の前に、自分の名前を選びます。', pts:[['check','誰が入れたか記録に残る']]},
    {tab:'home', ic:'check', title:'画面の見方は以上です', body:'次は、実際の入力のしかたへ。'}
  ]},
  monthly:{title:'毎月の4ステップ', ic:'list', min:6, next:'report', learn:[['return','再請求分の入れ方'],['percent','清算の時期（20％）'],['check','入金のチェック']], steps:[
    {tab:'home', sel:'[data-open="A"][data-b="御所"]', ic:'send', title:'① 請求をはじめる', body:'拠点ごとに「入力する」を押します。', pts:[['calendar','毎月1〜10日'],['doc','請求データ（サマリ）']]},
    {drawer:['A','御所'], sel:'.drawer .docnote', ic:'doc', title:'用意する書類とルール', body:'画面の上にいつも出ています。', pts:[['warn','再請求分はトワライズに請求しない']]},
    {drawer:['A','御所'], sel:'#aParts', ic:'yen', title:'国保連への請求額', body:'サマリの合計を入れます。', pts:[['send','再請求分は「請求を追加」で別の行に']]},
    {drawer:['A','御所'], sel:'.drawer .choice', ic:'repeat', title:'トワライズへの請求額', body:'ふだんは「同じ金額」を選びます。', pts:[['return','再請求分があれば「除く」を選ぶ']]},
    {drawer:['A','御所'], sel:'#aCalc', ic:'calc', title:'自動の計算', body:'立替しない額が出ます。', pts:[['warn','売上概算と10％以上違うと注意']]},
    {drawer:['A','御所'], sel:'.drawer .df', ic:'save', title:'保存する', body:'保存すると、画面の下に「次は」が出ます。', pts:[['check','ツアー中は保存しなくてOK']]},
    {drawer:['C','御所'], sel:'.drawer .docnote', ic:'mail', title:'② 払出し通知', body:'2か月前の提供月の確定額を入れます。', pts:[['calendar','5日ごろ'],['doc','払出し通知書']]},
    {drawer:['C','御所'], sel:'#cK', ic:'yen', title:'確定額', body:'この拠点・この月の合計を入れます。'},
    {drawer:['C','御所'], sel:'#cCalc', ic:'calc', title:'清算の見込み', body:'差額と、清算される月が出ます。', pts:[['clock','通常は2か月後'],['percent','20％超で1か月早まる']]},
    {drawer:['C','御所'], sel:'#cRet', ic:'return', title:'誰の分かを残す', body:'返戻なら返戻台帳へ。', pts:[['search','10日の請求資料と照らし合わせる']]},
    {tab:'home', sel:'[data-goreport]', ic:'chat', title:'③ 報告', body:'月次レポートから送ります。', pts:[['calendar','5〜10日'],['book','「報告のしかた」で詳しく']]},
    {drawer:['B','御所'], sel:'.drawer .docnote', ic:'receipt', title:'④ トワライズ明細', body:'明細の中身を上から入れます。', pts:[['calendar','15日入金・17日明細']]},
    {drawer:['B','御所'], sel:'.drawer .suggest', optional:true, ic:'repeat', title:'清算金の候補', body:'明細と同じ額なら、押すだけで入ります。'},
    {drawer:['B','御所'], sel:'#bFee', ic:'percent', title:'手数料', body:'明細の手数料を入れます。', pts:[['calc','「目安を入れる」で自動計算']]},
    {drawer:['B','御所'], sel:'#bPaid', ic:'bank', title:'通帳の入金額', body:'尼信に入った額を入れます。'},
    {drawer:['B','御所'], sel:'#bCalc', ic:'check', title:'入金のチェック', body:'合えば「✓ 計算どおり」と出ます。', pts:[['warn','ずれたら明細の入れ漏れを確認']]},
    {tab:'home', ic:'flag', title:'4ステップは以上です', body:'迷ったら「次にやること」へ。'}
  ]},
  report:{title:'報告のしかた', ic:'chat', min:3, next:'track', learn:[['chat','3つの数字'],['user','誰の分か'],['yen','売上概算']], steps:[
    {tab:'report', sel:'.regular .kpis', ic:'chat', title:'毎月の3つの数字', body:'これを齋藤様に送ります。', pts:[['send','今月の請求額'],['building','先月の国保連からの入金'],['calc','来月の清算見込み']]},
    {tab:'report', sel:'.regular table', ic:'user', title:'誰の分か', body:'返戻の方と、それ以外の差に分けて出ます。', pts:[['yen','＋10万と−5万で＋5万、の中身が分かる']]},
    {tab:'report', sel:'#reportText', ic:'doc', title:'報告文', body:'自動で作られます。'},
    {tab:'report', sel:'#copyBtn', ic:'copy', title:'コピーして送る', body:'Chatworkに貼り付けます。'},
    {tab:'report', sel:'#markDone', ic:'check', title:'報告済みにする', body:'今月の作業の③に ✓ が付きます。'},
    {tab:'cash', sel:'#estSec', ic:'yen', title:'売上概算', body:'会計の先生と齋藤様へ伝えます。', pts:[['calendar','5日ごろに見込み'],['receipt','17日の明細で確定']]},
    {tab:'cash', ic:'flag', title:'報告のしかたは以上です', body:'次は、差額と返戻の追い方へ。'}
  ]},
  track:{title:'差額と返戻を追う', ic:'search', min:3, next:'handover', learn:[['search','未解消の見方'],['calendar','清算予定'],['return','返戻の4つの状態']], steps:[
    {tab:'recon', sel:'#main table', ic:'search', title:'突合', body:'提供月ごとに差額を追います。', pts:[['check','「未解消」が0なら完了']]},
    {tab:'recon', sel:'#main tbody tr', ic:'calendar', title:'清算予定', body:'何月に清算されるかが出ます。', pts:[['percent','20％超は「1か月早まり」'],['search','行を押すと明細']]},
    {tab:'returns', sel:'#main .kpis', ic:'return', title:'返戻台帳', body:'4つの状態で追います。', pts:[['doc','点数のみ'],['clock','再請求待ち'],['send','再請求済'],['check','入金済']]},
    {tab:'returns', sel:'#retAdd', ic:'return', title:'返戻を記録', body:'月末の連絡が来たら、ここから。', pts:[['user','氏名ではなくIDで']]},
    {drawer:['R'], sel:'#rPts', ic:'calc', title:'点数と金額', body:'月末は点数、5日ごろに金額を入れます。'},
    {drawer:['R'], sel:'#rPlan', ic:'send', title:'再請求', body:'翌月10日に再請求します。', pts:[['warn','トワライズには請求しない']]},
    {tab:'returns', ic:'flag', title:'以上です', body:'最後は、引き継ぎの準備へ。'}
  ]},
  handover:{title:'引き継ぎと設定', ic:'shield', min:2, next:null, learn:[['book','最初に読む場所'],['sliders','契約条件'],['shield','バックアップ']], steps:[
    {tab:'settings', sel:'.flow', ic:'book', title:'毎月の流れ', body:'引き継ぐ方は、まずここを読みます。'},
    {tab:'settings', sel:'#main details', ic:'search', title:'よくある質問', body:'迷いやすい点の答えです。'},
    {tab:'settings', sel:'#sFixed', ic:'sliders', title:'契約条件', body:'手数料と20％の基準を変えられます。', pts:[['doc','契約書の値に合わせる']]},
    {tab:'settings', sel:'#mName', ic:'user', title:'入力する人', body:'担当者の名前を登録します。'},
    {tab:'settings', sel:'#bkJson', ic:'shield', title:'バックアップ', body:'月に1回、書き出して保存します。', pts:[['folder','Googleドライブなどへ']]},
    {tab:'ledger', sel:'#main table', ic:'list', title:'台帳と確認チェック', body:'別の人が書類と見比べてチェックします。'},
    {tab:'learn', ic:'check', title:'すべて受講しました', body:'画面上の「この画面の使い方」で、いつでも見直せます。'}
  ]}
};
const TOUR_ORDER = ['intro','monthly','report','track','handover'];
const CONTEXT_TOUR = {home:'intro', report:'report', cash:['report',5], recon:'track', returns:['track',2], ledger:['handover',5], settings:'handover', learn:'intro'};

/* ---------- ツアーの実行 ---------- */
let TR = null;
function startTour(id, at = 0) {
  if (!TOURS[id]) return;
  endTour(true);
  gSave({seen:true});
  TR = {id, i:+at || 0, drawer:''};
  const root = document.createElement('div'); root.id = 'tourRoot';
  root.innerHTML = `<div class="tour-block"></div><div class="tour-hole" hidden></div><div class="tour-card" role="dialog" aria-modal="true" aria-labelledby="tourTitle"></div>`;
  document.body.appendChild(root); document.body.classList.add('touring');
  TR.root = root; TR.tick = setInterval(placeTour, 400);
  window.addEventListener('resize', placeTour); window.addEventListener('scroll', placeTour, true);
  document.addEventListener('keydown', tourKey, true);
  showStep();
}
function endTour(silent) {
  if (!TR) return;
  clearInterval(TR.tick); window.removeEventListener('resize', placeTour); window.removeEventListener('scroll', placeTour, true);
  document.removeEventListener('keydown', tourKey, true);
  TR.root.remove(); document.body.classList.remove('touring');
  if (TR.drawer && $('drawerRoot').innerHTML) closeDrawer();
  TR = null; if (!silent) render();
}
function tourKey(e) {
  if (!TR) return;
  if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); endTour(); }
  else if (e.key === 'ArrowRight') { e.preventDefault(); tourGo(1); }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); tourGo(-1); }
}
function tourGo(dir) {
  const t = TOURS[TR.id];
  if (dir > 0 && TR.i >= t.steps.length - 1) return finishTour();
  TR.i = Math.max(0, Math.min(t.steps.length - 1, TR.i + dir)); TR.dir = dir; showStep();
}
function finishTour() {
  const id = TR.id, t = TOURS[id], g = gLoad(); gSave({done:{...(g.done||{}), [id]:true}});
  endTour(true);
  if (t.next) { setTab('learn'); toast(`「${t.title}」を受講しました`); }
  else { setTab('learn'); toast('すべての講座を受講しました'); }
}
function openTourDrawer(dw) {
  const [k, b] = dw;
  if (k === 'A') openStepA(b, addM(S.work,-1)); else if (k === 'C') openStepC(b, addM(S.work,-2)); else if (k === 'B') openStepB(b, S.work); else if (k === 'R') openReturnEditor(null, {});
}
async function showStep() {
  const t = TOURS[TR.id], s = t.steps[TR.i], want = s.drawer ? s.drawer.join('|') : '';
  if (TR.drawer !== want && $('drawerRoot').innerHTML) { closeDrawer(); TR.drawer = ''; }
  const tab = s.tab || (s.drawer ? (s.drawer[0] === 'R' ? 'returns' : 'home') : null);
  if (tab && S.tab !== tab) setTab(tab);
  if (want && TR.drawer !== want) { openTourDrawer(s.drawer); TR.drawer = want; await gWait(80); }
  const el = s.sel ? document.querySelector(s.sel) : null;
  if (s.sel && !el) { if (s.optional) return tourGo(TR.dir || 1); }
  if (el) { gScrollTo(el); await gWait(gReduce() ? 30 : 350); }
  const n = t.steps.length, last = TR.i === n - 1;
  TR.root.querySelector('.tour-card').innerHTML = `
    <div class="tc-top"><span class="tc-course">${ic(t.ic, 14)}${esc(t.title)}</span><span class="tc-count num">${TR.i+1} / ${n}</span></div>
    <div class="tc-prog"><i style="width:${((TR.i+1)/n*100).toFixed(1)}%"></i></div>
    <div class="tc-head"><span class="tc-ic">${ic(s.ic || 'flag', 26)}</span><div class="col" style="gap:2px;min-width:0"><h3 id="tourTitle">${s.title}</h3><p>${s.body}</p></div></div>
    ${s.pts ? `<ul class="tc-pts">${s.pts.map(([i, x]) => `<li>${ic(i, 16)}<span>${x}</span></li>`).join('')}</ul>` : ''}
    <div class="tc-act"><button type="button" class="btn ghost small" data-tour="end">終了</button><span class="tc-key" aria-hidden="true"><kbd>←</kbd><kbd>→</kbd></span><span class="spacer"></span>
      ${TR.i > 0 ? `<button type="button" class="btn small iconbtn" data-tour="prev" aria-label="戻る">${ic('arrow',16).replace('<svg','<svg style="transform:scaleX(-1)"')}</button>` : ''}
      ${last && t.next ? `<button type="button" class="btn small" data-tour="done">一覧へ</button><button type="button" class="btn small primary" data-tour="nextcourse">次の講座へ${ic('arrow',14)}</button>`
        : `<button type="button" class="btn small primary" data-tour="next">${last ? '完了' : '次へ'}${last ? ic('check',14) : ic('arrow',14)}</button>`}</div>`;
  placeTour();
  TR.root.querySelector('[data-tour="next"],[data-tour="nextcourse"]')?.focus({preventScroll:true});
}
function gScrollTo(el) {
  const behavior = gReduce() ? 'auto' : 'smooth', inDrawer = !!el.closest('.drawer');
  const side = document.querySelector('.side'), mobile = document.documentElement.clientWidth < 640;
  const sticky = !inDrawer && side && getComputedStyle(side).position === 'sticky' && side.getBoundingClientRect().height < window.innerHeight * .6;
  if (inDrawer || (!mobile && !sticky)) { el.scrollIntoView({block: mobile ? 'start' : 'center', inline:'nearest', behavior}); return; }
  // 上に固定されたメニューと、下に出る説明カードに隠れないよう、要素の上端をメニューの直下にそろえる
  const head = sticky ? side.getBoundingClientRect().height : 0;
  const r = el.getBoundingClientRect();
  window.scrollTo({top: Math.max(0, window.scrollY + r.top - head - 12), behavior});
}
function placeTour() {
  if (!TR) return;
  const s = TOURS[TR.id].steps[TR.i], el = s.sel ? document.querySelector(s.sel) : null;
  const hole = TR.root.querySelector('.tour-hole'), card = TR.root.querySelector('.tour-card'), block = TR.root.querySelector('.tour-block');
  const vw = document.documentElement.clientWidth, vh = window.innerHeight, pad = 6;
  const r = el ? el.getBoundingClientRect() : null;
  const visible = r && r.width > 0 && r.height > 0;
  block.classList.toggle('dim', !visible);
  if (visible) {
    const top = Math.max(r.top - pad, 4), left = Math.max(r.left - pad, 4), bottom = Math.min(r.bottom + pad, vh - 4), right = Math.min(r.right + pad, vw - 4);
    Object.assign(hole.style, {top:top+'px', left:left+'px', width:Math.max(right-left,0)+'px', height:Math.max(bottom-top,0)+'px'}); hole.hidden = false;
  } else hole.hidden = true;
  const cw = Math.min(400, vw - 32); card.style.width = cw + 'px';
  if (vw < 640 || !visible) {
    card.classList.add('sheet'); Object.assign(card.style, visible ? {left:'16px', right:'16px', top:'', bottom:'calc(16px + env(safe-area-inset-bottom,0px))', width:''} : {left:'50%', right:'', top:'50%', bottom:'', width:cw+'px'});
    card.classList.toggle('center', !visible);
    return;
  }
  card.classList.remove('sheet','center');
  const ch = card.offsetHeight, gap = 14;
  let top, left;
  if (r.bottom + gap + ch < vh - 8) { top = r.bottom + gap; left = r.left; }
  else if (r.top - gap - ch > 8) { top = r.top - gap - ch; left = r.left; }
  else if (r.left - gap - cw > 8) { left = r.left - gap - cw; top = Math.min(Math.max(r.top, 8), vh - ch - 8); }
  else if (r.right + gap + cw < vw - 8) { left = r.right + gap; top = Math.min(Math.max(r.top, 8), vh - ch - 8); }
  else { top = vh - ch - 16; left = vw - cw - 16; }
  left = Math.min(Math.max(left, 8), vw - cw - 8); top = Math.min(Math.max(top, 8), vh - ch - 8);
  Object.assign(card.style, {left:left+'px', top:top+'px', right:'', bottom:''});
}

/* ---------- お金の流れの図 ---------- */
function moneyFlowSvg() {
  const node = (x, y, w, name, sub, icn, cls = '') => `<g class="mf-node ${cls}"><rect x="${x}" y="${y}" width="${w}" height="64" rx="12"/>
    <g transform="translate(${x+14},${y+20})" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mf-ic">${IC[icn]}</g>
    <text x="${x+48}" y="${y+29}" class="mf-name">${name}</text><text x="${x+48}" y="${y+48}" class="mf-sub">${sub}</text></g>`;
  const lab = (x, y, no, t, anchor = 'start') => `<g class="mf-lab"><text x="${x}" y="${y}" text-anchor="${anchor}"><tspan class="mf-no">${no}</tspan> ${t}</text></g>`;
  return `<svg class="mf" viewBox="0 0 760 270" role="img" aria-label="お金の流れ：LINOAが国保連とトワライズに請求し、トワライズが立て替えて入金。国保連の支払はトワライズに入り、差額は後の立替入金で清算される">
    <defs><marker id="mfa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" class="mf-head"/></marker></defs>
    ${node(10, 103, 160, 'LINOA', '御所・大和高田', 'home', 'me')}
    ${node(300, 14, 170, '国保連', '審査・支払', 'building')}
    ${node(300, 192, 170, 'トワライズ', '立替・清算', 'repeat')}
    ${node(590, 192, 160, '尼崎信用金庫', 'LINOAの口座', 'bank', 'me')}
    <path d="M170 122 C 235 122 235 46 296 46" class="mf-line" marker-end="url(#mfa)"/>
    <path d="M170 150 C 235 150 235 224 296 224" class="mf-line" marker-end="url(#mfa)"/>
    <path d="M385 78 L 385 188" class="mf-line dash" marker-end="url(#mfa)"/>
    <path d="M470 224 L 586 224" class="mf-line" marker-end="url(#mfa)"/>
    ${lab(186, 70, '①', '請求 1〜10日')}
    ${lab(186, 196, '①', '立替を請求')}
    ${lab(396, 128, '②', '確定・支払（翌々月）')}
    ${lab(396, 147, '', '払出し通知は5日ごろ')}
    ${lab(528, 212, '④', '立替入金 15日', 'middle')}
    <g class="mf-note"><rect x="520" y="14" width="230" height="122" rx="12"/>
      <text x="536" y="40" class="mf-name">差額の清算</text>
      <text x="536" y="64" class="mf-sub">差額 ＝ 確定額 − 立替請求</text>
      <text x="536" y="86" class="mf-sub">→ 2か月後の立替入金で清算</text>
      <text x="536" y="108" class="mf-sub">→ 20％を超えると1か月早まる</text>
      <text x="536" y="126" class="mf-sub">（再請求分は立替を請求しない）</text></g>
  </svg>`;
}

/* ---------- レクチャー一覧 ---------- */
function renderLearn() {
  const g = gLoad(), done = g.done || {}, nDone = TOUR_ORDER.filter(k => done[k]).length;
  const nextId = TOUR_ORDER.find(k => !done[k]);
  const cards = TOUR_ORDER.map((k, i) => { const t = TOURS[k], ok = !!done[k], isNext = k === nextId;
    return `<article class="course ${ok?'is-done':''} ${isNext?'is-next':''}">
      <div class="c-head"><span class="c-ic">${ok ? ic('check', 24) : ic(t.ic, 24)}</span><div class="col" style="gap:0;min-width:0"><span class="hint">講座 ${i+1}</span><h3>${t.title}</h3></div></div>${isNext?'<span class="ribbon">次はこれ</span>':''}
      <div class="chips col">${t.learn.map(([n, x]) => chip(n, x)).join('')}</div>
      <div class="c-foot">${chip('clock', `約${t.min}分`, 'plain')}<button type="button" class="btn ${isNext?'primary':''}" data-tourstart="${k}|0">${ic(ok?'repeat':'play',16)}${ok?'もう一度':'はじめる'}</button></div></article>`; }).join('');
  const flow = [
    ['A','send','1〜10日','請求','請求データ'],
    ['C','mail','5日ごろ','払出し通知','払出し通知書'],
    ['D','chat','5〜10日','報告','月次レポート'],
    ['B','receipt','15・17日','明細','トワライズ明細'],
    ['R','return','月末','返戻の連絡','点数のみ']
  ];
  const hand = [['book','講座を5つ受講','約17分'],['user','名前を登録','設定・使い方'],['repeat','先月分を一緒に入力','前任者と①〜④'],['check','確認は別の人','台帳のチェック'],['search','困ったら','よくある質問']];
  $('main').innerHTML = `<div class="page">
    <section class="panel learn-head"><span class="nc-ic">${ic('book', 30)}</span><div class="col" style="gap:4px;flex:1;min-width:220px"><span class="eyebrow">使い方レクチャー</span><h1>実際の画面で、順番に覚える</h1>
      <div class="chips">${chip('play','画面の上で案内')}${chip('check','デモなので触ってOK')}${chip('clock','全部で約17分')}</div></div>
      <div class="learn-prog"><span class="num"><b>${nDone}</b> / ${TOUR_ORDER.length}</span><span class="hint">受講済み</span><div class="nc-bar">${TOUR_ORDER.map(k => `<i class="${done[k]?'on':''}"></i>`).join('')}</div></div></section>
    <section class="courses">${cards}</section>
    <section class="panel col" style="gap:14px"><div class="row"><h2>${ic('repeat',20)} お金の流れ</h2><span class="hint">番号は「今月の作業」のステップと同じです</span></div>
      <div class="mf-wrap">${moneyFlowSvg()}</div></section>
    <section class="panel col" style="gap:14px"><div class="row"><h2>${ic('calendar',20)} 毎月の流れ</h2><span class="hint">押すと、その部分のやり方を案内します</span></div>
      <ol class="mflow">${flow.map(([k, n, d, t, doc]) => `<li><button type="button" class="mf-step" ${k==='R'?'data-go="returns"':`data-tourstart="${STEP_TOUR[k].join('|')}"`}>
        <span class="node">${ic(n, 22)}</span><span class="pill wait">${d}</span><b>${k==='R'?'':STEP_META[k].no+' '}${t}</b><span class="hint">${ic('doc',13)} ${doc}</span></button></li>`).join('')}</ol></section>
    <section class="panel col" style="gap:14px"><h2>${ic('shield',20)} 引き継ぐときは</h2>
      <ol class="hand">${hand.map(([n, t, s], i) => `<li><span class="node">${ic(n, 20)}</span><b>${i+1}. ${t}</b><span class="hint">${s}</span></li>`).join('')}</ol></section></div>`;
}

/* ---------- イベント ---------- */
document.addEventListener('click', e => {
  const tc = e.target.closest('[data-tour]');
  if (tc && TR) { const a = tc.dataset.tour;
    if (a === 'next') tourGo(1); else if (a === 'prev') tourGo(-1); else if (a === 'end') endTour();
    else if (a === 'done') finishTour(); else if (a === 'nextcourse') { const nx = TOURS[TR.id].next; finishTour(); startTour(nx, 0); }
    return; }
  if (TR && e.target.closest('#tourRoot')) return;
  const ts = e.target.closest('[data-tourstart]'); if (ts) { const [id, at] = ts.dataset.tourstart.split('|'); startTour(id, at); return; }
  const ng = e.target.closest('[data-nextgo]'); if (ng) { const [k, b] = ng.dataset.nextgo.split('|'); ng.closest('.nextbar')?.remove(); goNext(k, b); return; }
  if (e.target.closest('[data-nbclose]')) { e.target.closest('.nextbar')?.remove(); return; }
  if (e.target.closest('[data-guideclose]')) { gSave({seen:true}); $('welcome')?.remove(); toast('画面上の「この画面の使い方」から、いつでも見られます'); return; }
  if (e.target.closest('#helpFab')) { const c = CONTEXT_TOUR[S.tab] || 'intro'; const [id, at] = Array.isArray(c) ? c : [c, 0]; startTour(id, at); }
}, true);


/* ================= 画面の階層・導線 ================= */
const MENU_GROUPS = [
  ['毎月の作業', ['home']],
  ['報告・見通し', ['report','cash']],
  ['確認・追跡', ['recon','returns','ledger']],
  ['ヘルプ・設定', ['learn','settings']]
];
const PAGE_INFO = {
  home:{lead:'次にやることから順に進めます'},
  report:{lead:'齋藤様への月1回の報告'},
  cash:{lead:'売上概算と入金の見通し'},
  recon:{lead:'提供月ごとの差額の照合'},
  returns:{lead:'返戻の方を入金まで追う'},
  ledger:{lead:'入力したすべての記録'},
  learn:{lead:'実際の画面で使い方を覚える'},
  settings:{lead:'流れ・契約条件・バックアップ'}
};
const groupOf = t => (MENU_GROUPS.find(g => g[1].includes(t)) || ['',''])[0];
function crumbHtml() {
  const m = MENU.find(x => x[0] === S.tab) || MENU[0];
  return `<div class="crumb-path"><button type="button" class="crumb-home" data-go="home">${ic('home',14)}<span>ホーム</span></button>${ic('arrow',12)}<span class="crumb-grp">${groupOf(S.tab)}</span>${ic('arrow',12)}<b>${m[1]}</b><span class="crumb-lead">${PAGE_INFO[S.tab]?.lead||''}</span></div>
    <div class="crumb-ctx">${chip('home', `表示：${S.base}`, 'plain')}${S.tab==='home'?'':chip('calendar', `${ym(S.work)}の作業`, 'plain')}<button type="button" class="btn small" id="helpTop">${ic('book',15)}この画面の使い方</button></div>`;
}
/* 月ごとの流れの中で、前後の画面へ進むための帯 */
const FLOW_NAV = {
  report:{prev:['home','今月の作業'], next:['cash','売上概算を伝える','資金繰り','estSec']},
  cash:{prev:['report','月次レポート'], next:['home','今月の作業へ戻る','次にやることを確認']},
  recon:{prev:['home','今月の作業'], next:['returns','返戻台帳','誰の分かを記録']},
  returns:{prev:['recon','突合'], next:['home','今月の作業へ戻る','次にやることを確認']},
  ledger:{prev:['home','今月の作業']},
  learn:{next:['home','今月の作業をはじめる','次にやることから']},
  settings:{prev:['learn','使い方レクチャー'], next:['home','今月の作業へ戻る','次にやることを確認']}
};
function flowNavHtml(tab) {
  const f = FLOW_NAV[tab]; if (!f) return '';
  return `<nav class="flownav" aria-label="前後の画面">${f.prev ? `<button type="button" class="btn" data-go="${f.prev[0]}">${ic('arrow',16).replace('<svg','<svg style="transform:scaleX(-1)"')}<span class="col" style="gap:0;align-items:flex-start"><small>戻る</small>${f.prev[1]}</span></button>` : '<span></span>'}
    ${f.next ? `<button type="button" class="btn primary" data-go="${f.next[0]}" ${f.next[3]?`data-anchor="${f.next[3]}"`:''}><span class="col" style="gap:0;align-items:flex-end"><small>${f.next[2]||'次へ'}</small>${f.next[1]}</span>${ic('arrow',16)}</button>` : ''}</nav>`;
}
/* 入力画面の上：拠点の切り替えと、3つの手順 */
function drawerFlow(k, b, w) {
  const okState = s => ['done','ok','na'].includes(s);
  const tabs = BASES.map(x => { const st = stepStatus(k, x, w || S.work).state, ok = okState(st), cur = x === b;
    return `<button type="button" class="dtab ${cur?'is-cur':''} ${ok?'is-done':''}" ${cur?'aria-current="true"':`data-dswitch="${k}|${x}"`}>${ok ? ic('check',14) : ic('home',14)}${x}${ok?'':'<small>未完了</small>'}</button>`; }).join('');
  const m = STEP_META[k];
  return `<div class="dflow"><div class="dtabs" role="group" aria-label="拠点">${tabs}</div>
    <ol class="dsteps"><li>${ic('doc',15)}書類を用意</li><li>${ic(m.ic==='receipt'?'calc':'yen',15)}数字を入れる</li><li>${ic('save',15)}確認して保存</li></ol></div>`;
}
/* 保存のあと：同じ作業の別の拠点が残っていれば、そのまま開く */
function savedNextAuto(msg, k) {
  setTimeout(() => {
    const n = nextStep(S.work);
    if (n.cur && n.cur.k === k && n.cur.base && !$('drawerRoot').innerHTML) {
      toast(`${msg}　次は${n.cur.base}`);
      goNext(n.cur.k, n.cur.base);
    } else savedNext(msg);
  }, 350);
}
document.addEventListener('click', e => {
  const ds = e.target.closest('[data-dswitch]'); if (ds) { const [k, b] = ds.dataset.dswitch.split('|'); closeDrawer(); goNext(k, b); return; }
  const an = e.target.closest('[data-anchor]'); if (an) { const id = an.dataset.anchor; setTimeout(() => document.getElementById(id)?.scrollIntoView({block:'start', behavior: gReduce()?'auto':'smooth'}), 60); }
  if (e.target.closest('#helpTop')) { const c = CONTEXT_TOUR[S.tab] || 'intro'; const [id, at] = Array.isArray(c) ? c : [c, 0]; startTour(id, at); }
});
