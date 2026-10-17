/* 模倣レイヤー：KVチケットの自動切替（OH）、REPORTの数字カウントアップ（TK） */
(function(){
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var wrap = document.querySelector('.m-kv__tickets');
  if(wrap && !reduce){
    var ts = [].slice.call(wrap.querySelectorAll('.m-ticket')), i = 1, hold = false;
    wrap.addEventListener('mouseenter', function(){ hold = true; ts.forEach(function(t){ t.classList.remove('is-on'); }); });
    wrap.addEventListener('mouseleave', function(){ hold = false; ts[i].classList.add('is-on'); });
    setInterval(function(){
      if(hold || document.hidden || getComputedStyle(wrap).flexDirection === 'row') return;
      ts[i].classList.remove('is-on'); i = (i + 1) % ts.length; ts[i].classList.add('is-on');
    }, 3200);
  }
  if(reduce || !('IntersectionObserver' in window)) return;
  var io = new IntersectionObserver(function(es){ es.forEach(function(en){ if(!en.isIntersecting) return; io.unobserve(en.target);
    var el = en.target, t = el.textContent, end = parseInt(t.replace(/,/g, ''), 10), t0 = null; if(isNaN(end)) return;
    function step(ts){ if(!t0) t0 = ts; var p = Math.min(1, (ts - t0) / 1400); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))).toLocaleString('ja-JP'); if(p < 1) requestAnimationFrame(step); else el.textContent = t; }
    requestAnimationFrame(step); }); }, {threshold:.5});
  document.querySelectorAll('b[data-m-count]').forEach(function(b){ io.observe(b); });
})();
