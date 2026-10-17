/* 「重ねて張る」演出：KVオープニング／スクロールの重ね張り／モノクロ→カラー／マーキー停止／ドロワーのフォーカス管理／施工前後ワイプ／ページ遷移 */
(function(){
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function store(k, v){ try{ if(v===undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); }catch(e){ return null; } }

  // 1. KV：初回訪問だけ5枚のパネルを下から張る（1.2秒以内）
  var kv = document.querySelector('.site-kv');
  if(kv && !reduce && !store('kv-seen')){ kv.classList.add('kv-intro'); store('kv-seen', '1'); setTimeout(function(){ kv.classList.add('kv-done'); }, 2400); }

  // 2. スクロールで要素が60ms間隔で張られる
  var SEL = '.wf-card,.wf-stat,.site-relay li,.site-truth__q,.wf-step,.site-stairs div,.site-gap > div,.site-years .wf-timeline > li,.site-stepper li,.wf-faq details';
  if('IntersectionObserver' in window && !reduce){
    var items = [].slice.call(document.querySelectorAll(SEL)).filter(function(el){ return el.getBoundingClientRect().top > innerHeight; });
    items.forEach(function(el){ el.classList.add('is-pending'); });
    var io = new IntersectionObserver(function(es){
      es.forEach(function(en){ if(!en.isIntersecting) return; io.unobserve(en.target);
        var el = en.target, sib = [].slice.call(el.parentNode.children).filter(function(x){ return x.classList.contains('is-pending'); });
        var i = Math.max(0, sib.indexOf(el));
        el.classList.add('is-laid'); el.style.transitionDelay = Math.min(i, 6) * 60 + 'ms';
        requestAnimationFrame(function(){ el.classList.remove('is-pending'); });
        setTimeout(function(){ el.style.transitionDelay = ''; }, 1200);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    items.forEach(function(el){ io.observe(el); });
  }

  // 3. 「イメージ（モノクロ）」が視界に入ると「実際（カラー）」へ
  var mono = document.querySelectorAll('.site-mono');
  if('IntersectionObserver' in window){
    var mo = new IntersectionObserver(function(es){ es.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('is-color'); mo.unobserve(en.target); } }); }, { threshold: .5 });
    mono.forEach(function(m){ mo.observe(m); });
  } else mono.forEach(function(m){ m.classList.add('is-color'); });

  // 4. マーキー：停止ボタン（WCAG 2.2.2）。動きを減らす設定では最初から停止
  document.querySelectorAll('.site-marquee').forEach(function(mq){
    var b = mq.querySelector('.site-marquee__btn');
    function set(p){ mq.classList.toggle('is-paused', p); b.setAttribute('aria-pressed', String(p)); b.textContent = p ? '▶ 再生' : 'Ⅱ 停止'; }
    set(reduce);
    b.addEventListener('click', function(){ set(!mq.classList.contains('is-paused')); });
  });

  // 5. ドロワー：ESCで閉じる・フォーカスを中に閉じ込める・閉じたらボタンへ戻す
  var mb = document.getElementById('menu-btn'), dr = document.getElementById('drawer');
  if(mb && dr){
    function close(){ if(dr.hidden) return; mb.click(); mb.focus(); }
    mb.addEventListener('click', function(){ if(!dr.hidden){ var f = dr.querySelector('a'); if(f) setTimeout(function(){ f.focus(); }, 0); } });
    document.addEventListener('keydown', function(e){
      if(dr.hidden) return;
      if(e.key === 'Escape'){ close(); return; }
      if(e.key !== 'Tab') return;
      var fs = [mb].concat([].slice.call(dr.querySelectorAll('a,button'))), a = document.activeElement, i = fs.indexOf(a);
      if(e.shiftKey && i <= 0){ e.preventDefault(); fs[fs.length-1].focus(); }
      else if(!e.shiftKey && i === fs.length-1){ e.preventDefault(); fs[0].focus(); }
    });
  }

  // 6. 施工前／施工後ワイプ（range入力なので ← → キーで操作できる）
  document.querySelectorAll('.site-ba').forEach(function(ba){
    var r = ba.querySelector('input');
    function upd(){ ba.style.setProperty('--pos', r.value + '%'); r.setAttribute('aria-valuetext', '施工前 ' + r.value + '％表示'); }
    r.addEventListener('input', upd); upd();
  });

  // 7. ページ遷移：300msのパネル（同一サイト内リンクのみ）
  if(!reduce){
    var veil = document.createElement('div'); veil.className = 'site-veil'; veil.setAttribute('aria-hidden', 'true'); document.body.appendChild(veil);
    if(store('veil') === '1'){ veil.classList.add('is-out'); store('veil', '0'); }
    document.addEventListener('click', function(e){
      var a = e.target.closest && e.target.closest('a[href]'); if(!a) return;
      var h = a.getAttribute('href');
      if(e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target || /^(#|https?:|mailto:|tel:)/.test(h) || !/\.html(#.*)?$/.test(h)) return;
      e.preventDefault(); veil.classList.remove('is-out'); veil.classList.add('is-in'); store('veil', '1');
      setTimeout(function(){ location.href = a.href; }, 300);
    });
    addEventListener('pageshow', function(ev){ if(ev.persisted){ veil.classList.remove('is-in', 'is-out'); } });
  }
})();
