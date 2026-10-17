/* エディトリアル版：写真がゆっくり現れる、数字のカウントアップ（動きを減らす設定では無効） */
(function(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  var els=[].slice.call(document.querySelectorAll('.e-msg__fig, .e-split__fig, .e-real__fig, .e-co figure, .e-person figure, .e-cover-fig'));
  els.forEach(function(el){ el.style.clipPath='inset(0 0 100% 0)'; el.style.transition='clip-path 1.1s cubic-bezier(.2,.7,.2,1)'; });
  var io=new IntersectionObserver(function(es){ es.forEach(function(en){ if(!en.isIntersecting) return; io.unobserve(en.target); en.target.style.clipPath='inset(0 0 0 0)'; }); },{rootMargin:'0px 0px -10% 0px'});
  els.forEach(function(el){ io.observe(el); });
  var nio=new IntersectionObserver(function(es){ es.forEach(function(en){ if(!en.isIntersecting) return; nio.unobserve(en.target);
    var el=en.target, t=el.textContent, end=parseInt(t.replace(/,/g,''),10), t0=null; if(isNaN(end)) return;
    function step(ts){ if(!t0) t0=ts; var p=Math.min(1,(ts-t0)/1400), v=Math.round(end*(1-Math.pow(1-p,3))); el.textContent=v.toLocaleString('ja-JP'); if(p<1) requestAnimationFrame(step); else el.textContent=t; }
    requestAnimationFrame(step); }); },{threshold:.5});
  document.querySelectorAll('.e-nums__v b[data-e-count]').forEach(function(b){ nio.observe(b); });
})();
