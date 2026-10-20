/* 合同新卒採用LP（デモ）：表示アニメーション・タブ・フォーム（流入元の記録とエリア振り分けの見本） */
(function(){
  // 表示アニメーション
  var els=[].slice.call(document.querySelectorAll('.rv'));
  if('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches){
    var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('on'); io.unobserve(e.target); } }); },{rootMargin:'0px 0px -8% 0px'});
    els.forEach(function(el,i){ el.style.transitionDelay=((i%4)*70)+'ms'; io.observe(el); });
  } else els.forEach(function(el){ el.classList.add('on'); });

  // タブ
  [].slice.call(document.querySelectorAll('.tabs')).forEach(function(tl){
    var bs=[].slice.call(tl.querySelectorAll('[role=tab]'));
    function sel(b){ bs.forEach(function(x){ var on=x===b; x.setAttribute('aria-selected',on); var p=document.getElementById(x.getAttribute('aria-controls')); if(p) p.hidden=!on; }); }
    bs.forEach(function(b){ b.addEventListener('click',function(){ sel(b); }); });
    if(location.hash==='#mid'){ var m=tl.querySelector('[aria-controls=f-mid]'); if(m) sel(m); }
  });

  // フォーム
  var CO={st:'スマイルタイム（株式会社住居時間）',gr:'Graise HOME（株式会社Graise HOME）',un:'2社合同の説明会にご案内します（参加後にお選びいただけます）'};
  var q=new URLSearchParams(location.search);
  var src=q.get('utm_source')||(document.referrer?'referral':'direct'), med=q.get('utm_medium')||'—', cam=q.get('utm_campaign')||'—';
  var sb=document.getElementById('src-new');
  if(sb) sb.innerHTML='自動で記録される流入元（デモ表示）：<b>source='+src+'</b> ／ <b>medium='+med+'</b> ／ <b>campaign='+cam+'</b><br>合説のQRやチラシごとにURLを分けると、どこから申し込まれたかを数えられます。';
  function bindArea(form,toId,label){
    if(!form) return; var s=form.querySelector('select[name=area]'), to=document.getElementById(toId);
    s.addEventListener('change',function(){ to.textContent= s.value ? label+'：'+CO[s.value] : label+'：エリアを選ぶと表示されます'; });
  }
  var fn=document.getElementById('form-new'), fm=document.getElementById('form-mid');
  bindArea(fn,'to-new','お申し込み先'); bindArea(fm,'to-mid','応募先');
  if(fn && q.get('ev')){ var ev=fn.querySelector('select[name=ev]'); ev.value=q.get('ev'); }
  function submit(form,errId,kind){
    if(!form) return;
    form.addEventListener('submit',function(e){
      e.preventDefault(); var err=document.getElementById(errId), bad=[].slice.call(form.querySelectorAll('[required]')).filter(function(x){ return x.type==='checkbox' ? !x.checked : !x.value.trim(); });
      if(bad.length){ err.textContent='未入力の必須項目があります（'+bad.length+'件）'; bad[0].focus(); return; }
      var area=form.querySelector('select[name=area]').value;
      document.querySelectorAll('.fm').forEach(function(p){ p.hidden=true; });
      document.querySelector('.tabs').style.display='none';
      var d=document.getElementById('done'); d.hidden=false;
      document.getElementById('done-msg').textContent=(kind==='new'?'お申し込み':'ご応募')+'先：'+CO[area]+'。本番では、この内容が該当する会社の人事担当者へ通知され、自動返信メールが届きます。記録した流入元：'+src+'。';
      window.scrollTo({top:0,behavior:'smooth'});
    });
  }
  submit(fn,'err-new','new'); submit(fm,'err-mid','mid');
})();
