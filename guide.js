/* ================= 使い方レクチャー・次にやること =================
   app.js より先に読み込む。中の関数は app.js の読み込み後に呼ばれる。 */

/* ---------- 保存（このブラウザだけの受講記録） ---------- */
const GKEY = 'linoa-guide-v1';
function gLoad() { try { return JSON.parse(localStorage.getItem(GKEY)) || {}; } catch (e) { return {}; } }
function gSave(patch) { const g = {...gLoad(), ...patch}; try { localStorage.setItem(GKEY, JSON.stringify(g)); } catch (e) {} return g; }
const gWait = ms => new Promise(r => setTimeout(r, ms));
const gReduce = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- 次にやること ---------- */
function flowSteps(w) {
  const close = S.closes[w] || {}, dl0 = kokuhoDeadline(w);
  const okState = s => ['done','ok','na'].includes(s);
  const doneOf = k => BASES.every(b => okState(stepStatus(k, b, w).state));
  const openBase = k => BASES.find(b => !okState(stepStatus(k, b, w).state)) || '';
  return [
    {k:'A', no:'①', t:'国保連・トワライズへの請求', from:1, to:dl0.getDate(), when:`1〜${dl0.getDate()}日（目安5〜6日）`, done:doneOf('A'), base:openBase('A'),
      doc:'国保連の請求データ（サマリ）／トワライズへの請求額', why:`${mm(addM(w,-1))}提供分の請求額を入れます。返戻の再請求分はトワライズに請求しません。`},
    {k:'C', no:'②', t:'国保連 払出し通知の確認', from:4, to:10, when:'5日ごろ', done:doneOf('C'), base:openBase('C'),
      doc:'国保連の払出し通知書', why:`${mm(addM(w,-2))}提供分の確定額を入れると、来月の清算見込みと「誰の分か」が出ます。`},
    {k:'D', no:'③', t:'齋藤様へ報告・売上概算', from:5, to:10, when:'5〜10日', done:!!close.reportedAt, base:'',
      doc:'このツールの月次レポート／資金繰り', why:'3つの数字と返戻の内訳をコピーして送ります。売上の見込みは会計の先生にも伝えます。'},
    {k:'B', no:'④', t:'トワライズ明細・精算の確認', from:15, to:31, when:'15日入金・17日明細', done:doneOf('B'), base:openBase('B'),
      doc:'トワライズの明細／尼信の通帳', why:`${mm(w)}の立替入金の内訳を入れ、入金額と合っているか確かめます。`}
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
function nextCardHtml(w) {
  const n = nextStep(w), doneN = n.st.filter(s => s.done).length, d = today.getDate(), isNow = w === nowM;
  const list = n.st.map(s => `<li class="${s.done?'is-done':n.cur&&s.k===n.cur.k?'is-cur':''}"><span class="mk" aria-hidden="true">${s.done?'✓':s.no}</span><span class="tx">${s.t}<small>${s.when}</small></span></li>`).join('');
  let main;
  if (n.all) main = `<span class="eyebrow">次にやること</span><h2>${ym(w)}の作業はすべて終わりました</h2>
      <p>おつかれさまでした。次は${mm(addM(w,1))}1日からの請求です。月末に返戻の連絡が来たら、返戻台帳に点数で記録しておきます。</p>
      <div class="row"><button type="button" class="btn" data-go="returns">返戻台帳を開く</button></div>`;
  else if (n.cur) {
    const c = n.cur, who = c.base ? `（${c.base}${BASES.filter(b => b !== c.base && !['done','ok','na'].includes(stepStatus(c.k,b,w).state)).length?' から':''}）` : '';
    main = `<span class="eyebrow">次にやること${n.overdue?'　<span class="pill bad">目安の日を過ぎています</span>':''}</span>
      <h2><span class="no">${c.no}</span>${c.t}${who}</h2><p>${c.why}</p>
      <div class="nc-meta"><span>${ICON_DOC}手元に用意：${c.doc}</span><span>時期：${c.when}</span></div>
      <div class="row"><button type="button" class="btn primary" data-nextgo="${c.k}|${c.base}">はじめる</button><button type="button" class="btn ghost" data-tourstart="${STEP_TOUR[c.k].join('|')}">やり方を見る</button></div>`;
  } else {
    const u = n.upcoming;
    main = `<span class="eyebrow">次にやること</span><h2>次は${u.from}日ごろから：${u.no} ${u.t}</h2>
      <p>${isNow ? `今日（${d}日）の時点で、やるべき作業は終わっています。` : ''}${u.why}</p>
      <div class="row"><button type="button" class="btn" data-nextgo="${u.k}|${u.base}">先に開いておく</button><button type="button" class="btn ghost" data-tourstart="${STEP_TOUR[u.k].join('|')}">やり方を見る</button></div>`;
  }
  return `<section class="panel nextcard" id="nextCard"><div class="nc-main">${main}</div>
    <div class="nc-side"><div class="nc-prog"><b>${ym(w)}の進み具合</b><span class="num">${doneN} / 4</span></div>
      <div class="nc-bar" role="progressbar" aria-valuemin="0" aria-valuemax="4" aria-valuenow="${doneN}" aria-label="今月の進み具合">${n.st.map(s => `<i class="${s.done?'on':n.cur&&s.k===n.cur.k?'cur':''}"></i>`).join('')}</div>
      <ol class="nc-list">${list}</ol></div></section>`;
}
function guideBanner() {
  const g = gLoad(); if (g.seen) return '';
  return `<section class="panel welcome" id="welcome"><div class="col" style="gap:4px;flex:1;min-width:240px"><span class="eyebrow">はじめての方へ</span><h2>実際の画面で、使い方を順番に案内します</h2>
    <p class="hint">画面の上に説明が出て、次へ進むたびに該当の場所を案内します。約3分です。デモのサンプルなので、触っても大丈夫です。</p></div>
    <div class="row"><button type="button" class="btn primary" data-tourstart="intro|0">3分で全体を見る</button><button type="button" class="btn" data-go="learn">レクチャー一覧</button><button type="button" class="btn ghost" data-guideclose="1">あとで</button></div></section>`;
}
function savedNext(msg) {
  setTimeout(() => {
    const n = nextStep(S.work); let text = '', btn = '';
    if (n.all) text = '今月の作業はすべて終わりました';
    else if (n.cur) { text = `次は ${n.cur.no} ${n.cur.t}${n.cur.base?`（${n.cur.base}）`:''}`; btn = `<button type="button" class="btn small primary" data-nextgo="${n.cur.k}|${n.cur.base}">進む</button>`; }
    else text = `次は${n.upcoming.from}日ごろから ${n.upcoming.no} ${n.upcoming.t}`;
    const el = document.createElement('div'); el.className = 'nextbar'; el.setAttribute('role','status');
    el.innerHTML = `<div class="col" style="gap:2px;min-width:0"><b>✓ ${esc(msg)}</b><span>${text}</span></div>${btn}<button type="button" class="btn iconbtn" data-nbclose="1" aria-label="閉じる">✕</button>`;
    $('toastRoot').replaceChildren(el);
    setTimeout(() => { if (el.isConnected) el.remove(); }, 12000);
  }, 450);
}

/* ---------- 講座 ---------- */
const TOURS = {
  intro:{title:'はじめに：画面の見方', min:3, next:'monthly', learn:['このツールで何ができるか','「次にやること」の見方','毎月の4ステップと注意の出かた'], steps:[
    {tab:'home', title:'このツールでできること', body:'国保連への請求、トワライズの立替・清算、齋藤様への報告までを、<b>毎月同じ手順</b>で進めるためのツールです。届いた書類の数字を入れるだけで、差額の計算と報告文は自動で作られます。<br>ここから、画面の見方を順番に案内します。'},
    {tab:'home', sel:'#baseSeg', title:'拠点を切り替える', body:'御所・大和高田・合算を切り替えます。入力は拠点ごと、確認と報告は<b>合算</b>で見るのが基本です。'},
    {tab:'home', sel:'#menu', title:'メニュー', body:'毎月の作業は「今月の作業」だけで進められます。ほかの画面は、確かめたいときに開きます。この「使い方レクチャー」もメニューから開けます。'},
    {tab:'home', sel:'#nextCard', title:'次にやること', body:'今日の日付と入力の状況から、<b>次にやることを1つだけ</b>表示します。迷ったら「はじめる」を押してください。右側は今月の進み具合です。'},
    {tab:'home', sel:'.deadline', title:'請求の締切', body:'国保連の請求締切です。10日が土日祝のときは翌営業日に自動でずらしています。いつもは5〜6日に請求します。'},
    {tab:'home', sel:'.timeline', title:'1か月の流れ', body:'1か月の作業の順番です。今日の位置に「今ここ」が付きます。月末には返戻の連絡（点数のみ）が来ます。'},
    {tab:'home', sel:'.steps', title:'毎月の4つのステップ', body:'① 請求 → ② 払出し通知 → ③ 報告 → ④ トワライズ明細 の順に、届いた書類の数字を拠点ごとに入れます。終わったカードは番号が ✓ に変わり、次のカードに「次はこれ」が付きます。'},
    {tab:'home', sel:'.attn', title:'確認が必要なこと', body:'清算されていない差額、計算と入金のずれ、20％ルールに近づいた月などを自動で拾います。ボタンから該当の画面に移れます。'},
    {tab:'home', sel:'.docgrid', title:'書類の保管', body:'国保連の通知はシステムから消えることがあります。保存したらチェックを付け、保存先のリンクを残します。'},
    {tab:'home', sel:'.me', title:'入力する人', body:'入力の前に、ここで自分の名前を選びます。誰がいつ何を入れたかが記録に残り、引き継ぎのときに役立ちます。'},
    {tab:'home', title:'画面の見方は以上です', body:'続けて「毎月の4ステップ」で、実際の入力のしかたを見てみましょう。'}
  ]},
  monthly:{title:'毎月の4ステップ', min:6, next:'report', learn:['①請求で、返戻の再請求分をトワライズに請求しない入れ方','②払出し通知で、清算の時期（20％ルール）を読む','④明細で、入金が計算どおりかを確かめる'], steps:[
    {tab:'home', sel:'[data-open="A"][data-b="御所"]', title:'① 請求：入力をはじめる', body:'毎月1〜10日に、前月提供分の請求額を入れます。拠点ごとの「入力する」（入力済みなら「確認・修正」）を押すと、入力画面が右から開きます。'},
    {drawer:['A','御所'], sel:'.drawer .docnote', title:'手元に用意する書類とルール', body:'上の枠に、用意する書類・締切・ルールが出ます。<b>返戻の再請求分はトワライズに請求しない</b>（二重の立替になり、20％ルールに当たりやすくなるため）。'},
    {drawer:['A','御所'], sel:'#aParts', title:'国保連への請求額', body:'請求データ（サマリ）の合計を入れます。返戻の再請求分を別に請求したときは「請求を追加」で行を足します。'},
    {drawer:['A','御所'], sel:'.drawer .choice', title:'トワライズへの請求額', body:'ふだんは「国保連の請求と同じ金額」。再請求分があるときは<b>「返戻の再請求分を除く」</b>を選び、その額を入れます。'},
    {drawer:['A','御所'], sel:'#aCalc', title:'自動の計算', body:'「立替しない額」が自動で出ます。お伝えした売上概算と10％以上違うときは注意が出ます。'},
    {drawer:['A','御所'], sel:'.drawer .df', title:'保存する', body:'「保存する」で記録されます。保存すると、画面の下に<b>次にやること</b>が出ます。（ツアー中は保存しなくて大丈夫です）'},
    {drawer:['C','御所'], sel:'.drawer .docnote', title:'② 払出し通知（5日ごろ）', body:'国保連の払出し通知書が届いたら、2か月前の提供月の確定額を入れます。通知書は<b>市町村番号ごとの合計</b>なので、誰の分かは10日の請求資料と照らし合わせます。'},
    {drawer:['C','御所'], sel:'#cK', title:'確定額を入れる', body:'この拠点・この提供月の分の合計を入れます。'},
    {drawer:['C','御所'], sel:'#cCalc', title:'清算の見込みと時期', body:'立替請求との差が<b>清算の見込み</b>です。通常は2か月後、不足が立替請求の20％を超えると<b>1か月早まる</b>ことも、ここに出ます。'},
    {drawer:['C','御所'], sel:'#cRet', title:'誰の分かを残す', body:'差が返戻によるものなら、利用者を特定して返戻台帳に記録します。月次レポートの「誰の分か」に並びます。'},
    {tab:'home', sel:'[data-goreport]', title:'③ 報告（5〜10日）', body:'払出し通知まで入れたら、月次レポートを開いて齋藤様に報告します。やり方は「報告のしかた」の講座で案内します。'},
    {drawer:['B','御所'], sel:'.drawer .docnote', title:'④ トワライズ明細（15日・17日）', body:'15日ごろに立替金が入金され、17日ごろに明細が見られます。明細の中身を上から入れます。'},
    {drawer:['B','御所'], sel:'.drawer .suggest', optional:true, title:'清算金の候補', body:'この月に清算される見込みの差額がボタンで出ます。明細の清算金と同じなら、押すだけで入ります。'},
    {drawer:['B','御所'], sel:'#bFee', title:'手数料', body:'明細の手数料を入れます。「目安を入れる」で、1.2％＋定額の計算値も入れられます。遅延損害金があれば分けて入れます。'},
    {drawer:['B','御所'], sel:'#bPaid', title:'通帳の入金額', body:'尼信に入った額を入れます。まだ入金されていなければ空のままで保存できます。'},
    {drawer:['B','御所'], sel:'#bCalc', title:'入金のチェック', body:'立替額 − 清算金 − 手数料 の計算と、実際の入金が合えば<b>「✓ 計算どおり」</b>と出ます。ずれていれば、明細の入れ漏れを確かめます。'},
    {tab:'home', title:'毎月の4ステップは以上です', body:'この順番を毎月くり返します。迷ったら「今月の作業」の一番上、「次にやること」を見てください。続けて「報告のしかた」へ進みましょう。'}
  ]},
  report:{title:'報告のしかた（齋藤様・会計の先生）', min:3, next:'track', learn:['毎月の3つの数字の意味','「誰の分か」の内訳の見方','売上概算を5日ごろに伝える手順'], steps:[
    {tab:'report', sel:'.regular .kpis', title:'毎月の3つの数字', body:'齋藤様に毎月お伝えしている3つの数字です。<b>今月の請求額・先月の国保連からの入金・来月の清算見込み</b>。'},
    {tab:'report', sel:'.regular table', title:'誰の分か', body:'清算見込みの内訳です。返戻台帳に記録した方が並び、それ以外の差は「返戻以外」にまとまります。+10万円と−5万円で+5万円、のような中身もここで分かります。'},
    {tab:'report', sel:'#reportText', title:'報告文', body:'内容から自動で作られます。必要なら上の欄にコメントを足します。'},
    {tab:'report', sel:'#copyBtn', title:'コピーして送る', body:'コピーしてChatworkなどに貼り付けます。'},
    {tab:'report', sel:'#markDone', title:'報告済みにする', body:'送ったら押します。「今月の作業」の③に ✓ が付き、次にやることが進みます。'},
    {tab:'cash', sel:'#estSec', title:'売上概算（5日ごろ）', body:'今月の売上の見込みを、<b>会計の先生と齋藤様</b>にお伝えします。額を確かめて文面をコピーし、「お伝えした額として保存」を押します。確定は17日ごろのトワライズの明細です。'},
    {tab:'cash', title:'報告のしかたは以上です', body:'続けて「差額と返戻を追う」で、差額の追いかけ方を見てみましょう。'}
  ]},
  track:{title:'差額と返戻を追う', min:3, next:'handover', learn:['突合で「未解消」と清算予定を読む','返戻を点数で記録し、金額確定・再請求まで追う'], steps:[
    {tab:'recon', sel:'#main table', title:'突合：提供月ごとの照合', body:'提供月ごとに、請求 → 国保連の確定額 → 清算 の順に差額を追います。<b>「未解消」が0</b>ならその月は終わりです。'},
    {tab:'recon', sel:'#main tbody tr', title:'清算予定と明細', body:'「清算予定」の列に、何月の立替入金で清算されるかが出ます。20％を超えた月は「1か月早まり」と出ます。行を押すと、その月の明細と返戻の記録が見られます。'},
    {tab:'returns', sel:'#main .kpis', title:'返戻台帳', body:'返戻の方を、<b>点数のみ → 再請求待ち → 再請求済 → 入金済</b>まで追います。'},
    {tab:'returns', sel:'#retAdd', title:'返戻を記録する', body:'月末に返戻の連絡が来たら、ここから記録します。氏名は入れず、事業所内のIDで記録します。'},
    {drawer:['R'], sel:'#rPts', title:'点数と金額', body:'月末は点数だけ分かります。5日ごろの払出し通知で金額が確定したら、金額を入れて状態を「再請求待ち」にします。'},
    {drawer:['R'], sel:'#rPlan', title:'再請求', body:'翌月10日に再請求します。<b>トワライズには請求しません。</b>入金を確かめたら「入金済」にします。'},
    {tab:'returns', title:'差額と返戻の追い方は以上です', body:'最後に「引き継ぎと設定」で、ほかの人に渡すときの準備を見ておきましょう。'}
  ]},
  handover:{title:'引き継ぎと設定', min:2, next:null, learn:['引き継ぐ方が最初に読む場所','契約条件・入力する人・バックアップ','台帳の確認チェック'], steps:[
    {tab:'settings', sel:'.flow', title:'毎月の流れ', body:'引き継ぐ方は、まずここを読みます。5つの時期と、それぞれで入れる数字がまとまっています。'},
    {tab:'settings', sel:'#main details', title:'よくある質問', body:'返戻の再請求分の扱い、20％ルール、誰の分かの調べ方など、迷いやすい点の答えです。'},
    {tab:'settings', sel:'#sFixed', title:'契約条件', body:'手数料の定額や、清算が1か月早まる基準（20％）はここで変えられます。契約書の値に合わせます。'},
    {tab:'settings', sel:'#mName', title:'入力する人', body:'担当者の名前を登録します。左下で選ぶと、入力・確認・報告の記録に名前が残ります。'},
    {tab:'settings', sel:'#bkJson', title:'バックアップ', body:'月に1回、全データを書き出してGoogleドライブなどに保存します。'},
    {tab:'ledger', sel:'#main table', title:'台帳と確認チェック', body:'入れた数字はすべてここに1行ずつ残ります。入力した人とは<b>別の人</b>が、書類と見比べてチェックを付けます。'},
    {tab:'learn', title:'すべての講座が終わりました', body:'おつかれさまでした。毎月の作業は「今月の作業」の「次にやること」から始めれば進められます。分からなくなったら、右下の「使い方」からいつでも見直せます。'}
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
    <div class="tc-top"><span class="eyebrow">${esc(t.title)}</span><span class="tc-count num">${TR.i+1} / ${n}</span></div>
    <div class="tc-prog"><i style="width:${((TR.i+1)/n*100).toFixed(1)}%"></i></div>
    <h3 id="tourTitle">${s.title}</h3><p>${s.body}</p>
    <div class="tc-act"><button type="button" class="btn ghost small" data-tour="end">終了</button><span class="spacer"></span>
      ${TR.i > 0 ? '<button type="button" class="btn small" data-tour="prev">戻る</button>' : ''}
      ${last && t.next ? `<button type="button" class="btn small" data-tour="done">一覧へ</button><button type="button" class="btn small primary" data-tour="nextcourse">続けて「${esc(TOURS[t.next].title)}」へ</button>`
        : `<button type="button" class="btn small primary" data-tour="next">${last ? '完了' : '次へ'}</button>`}</div>
    <p class="tc-key hint">← → キーでも進めます。Escで終了。</p>`;
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

/* ---------- レクチャー一覧 ---------- */
function renderLearn() {
  const g = gLoad(), done = g.done || {}, nDone = TOUR_ORDER.filter(k => done[k]).length;
  const nextId = TOUR_ORDER.find(k => !done[k]);
  const cards = TOUR_ORDER.map((k, i) => { const t = TOURS[k], ok = !!done[k], isNext = k === nextId;
    return `<article class="course ${ok?'is-done':''} ${isNext?'is-next':''}">
      <div class="c-head"><span class="c-no">${ok?'✓':i+1}</span><div class="col" style="gap:2px;min-width:0"><h3>${t.title}</h3><span class="hint">約${t.min}分・${t.steps.length}ステップ${ok?'・受講済み':''}</span></div>${isNext?'<span class="pill wait">次はこれ</span>':''}</div>
      <ul>${t.learn.map(x => `<li>${x}</li>`).join('')}</ul>
      <div><button type="button" class="btn ${isNext?'primary':''}" data-tourstart="${k}|0">${ok?'もう一度見る':'はじめる'}</button></div></article>`; }).join('');
  const rows = [
    ['毎月1〜10日（目安5〜6日）','① 国保連・トワライズへ請求','請求データ（サマリ）／トワライズへの請求額','返戻の再請求分はトワライズに請求しない','A'],
    ['5日ごろ','② 国保連 払出し通知','払出し通知書','誰の分かを10日の請求資料と照らし合わせる','C'],
    ['5〜10日','③ 齋藤様へ報告・売上概算','月次レポート／資金繰り','3つの数字をコピーして送り、報告済みにする','D'],
    ['15日・17日','④ トワライズ明細・精算','トワライズの明細／尼信の通帳','入金が「✓ 計算どおり」になるか確かめる','B'],
    ['月末','返戻の連絡','返戻の連絡（点数のみ）','返戻台帳に点数で記録する','R']
  ];
  $('main').innerHTML = `<div class="page">
    <section class="panel"><div class="row"><div class="ptitle" style="flex:1"><span class="eyebrow">使い方レクチャー</span><h1>実際の画面で、順番に覚える</h1>
      <p class="hint">講座を始めると、画面の上に説明が出て、該当の場所を順番に案内します。デモのサンプルなので、触っても本番には影響しません。上から順に受講するのがおすすめです。</p></div>
      <div class="learn-prog"><b class="num">${nDone} / ${TOUR_ORDER.length}</b><span class="hint">受講済み</span><div class="nc-bar">${TOUR_ORDER.map(k => `<i class="${done[k]?'on':''}"></i>`).join('')}</div></div></div></section>
    <section class="courses">${cards}</section>
    <section class="panel col" style="gap:12px"><div class="ptitle"><h2>毎月のチェックリスト</h2><p class="hint">引き継ぎのときは、この表と「今月の作業」の「次にやること」だけで回せるようにしています。</p></div>
      <div class="tablewrap"><table><thead><tr><th>時期</th><th>やること</th><th>手元に用意する書類</th><th>ポイント</th><th></th></tr></thead><tbody>
      ${rows.map(([a,b,c,d,k]) => `<tr><td>${a}</td><td><b>${b}</b></td><td>${c}</td><td>${d}</td><td>${k==='R'?'<button type="button" class="btn small" data-go="returns">開く</button>':`<button type="button" class="btn small" data-tourstart="${STEP_TOUR[k].join('|')}">やり方</button>`}</td></tr>`).join('')}</tbody></table></div></section>
    <section class="panel col" style="gap:12px"><h2>引き継ぐときの進め方</h2>
      <ol class="handover">
        <li><b>講座を5つ受講する</b><span>このページの上から順に。全部で約17分です。</span></li>
        <li><b>入力する人に名前を登録する</b><span>「設定・使い方」で登録し、左下で選びます。</span></li>
        <li><b>先月分を一緒に入れてみる</b><span>前任者と画面を見ながら、①〜④を1回ずつ入れます。</span></li>
        <li><b>確認は別の人が行う</b><span>「台帳・履歴」で、書類と見比べてチェックを付けます。</span></li>
        <li><b>困ったら「よくある質問」</b><span>「設定・使い方」の下にあります。</span></li>
      </ol></section></div>`;
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
  if (e.target.closest('[data-guideclose]')) { gSave({seen:true}); $('welcome')?.remove(); toast('右下の「使い方」から、いつでも見られます'); return; }
  if (e.target.closest('#helpFab')) { const c = CONTEXT_TOUR[S.tab] || 'intro'; const [id, at] = Array.isArray(c) ? c : [c, 0]; startTour(id, at); }
}, true);
(function () {
  const b = document.createElement('button'); b.type = 'button'; b.id = 'helpFab'; b.className = 'helpfab';
  b.innerHTML = '<span aria-hidden="true">?</span>使い方'; b.setAttribute('aria-label', 'この画面の使い方を見る');
  document.body.appendChild(b);
})();
