/* Brioo Agency v4 */
(function () {
  'use strict';

  var rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* LENIS */
  var lenis = null;
  if (!rm && window.Lenis) {
    lenis = new Lenis({ duration: 1.05, easing: function(t){ return t===1?1:1-Math.pow(2,-10*t); }, smoothWheel: true });
  }

  /* SMOOTH SCROLL TO ID */
  window.goTo = function(id) {
    var el = document.getElementById(id);
    if (!el) return false;
    var off = -80;
    if (lenis) lenis.scrollTo(el, { offset: off });
    else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + off, behavior: 'smooth' });
    closeMob();
    return true;
  };
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(e){
      var id = a.getAttribute('href').slice(1);
      if (document.getElementById(id)){ e.preventDefault(); window.goTo(id); }
    });
  });
  window.addEventListener('load', function(){
    if (location.hash) {
      var el = document.getElementById(location.hash.slice(1));
      if (el) setTimeout(function(){ window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 110 }); }, 60);
    }
  });

  /* BURGER */
  var burger = document.getElementById('burger');
  var mnav   = document.getElementById('mobileNav');
  function closeMob(){
    if (!mnav) return;
    mnav.setAttribute('aria-hidden','true');
    if (burger) { burger.setAttribute('aria-expanded','false'); }
    document.body.style.overflow = '';
  }
  if (burger && mnav){
    burger.addEventListener('click', function(){
      var open = mnav.getAttribute('aria-hidden') === 'true';
      mnav.setAttribute('aria-hidden', open ? 'false' : 'true');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mnav.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', closeMob); });
  }

  /* NAV SCROLL STATE + PROGRESS */
  var nav  = document.getElementById('site-nav');
  var bar  = document.getElementById('scrollBar');
  function tick(){
    var y = window.scrollY;
    if (nav)  nav.classList.toggle('past', y > 30);
    if (bar){
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? (y/h)*100 : 0) + '%';
    }
    /* active nav link based on section */
    var secs = ['work','services','about'];
    var cur = '';
    secs.forEach(function(id){
      var el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= 100) cur = id;
    });
    document.querySelectorAll('#site-nav nav a[href^="#"]').forEach(function(a){
      var tgt = a.getAttribute('href').slice(1);
      a.classList.toggle('cur', tgt === cur);
    });

    /* services subnav */
    var snIds = ['representation','outreach','contracts','payments','faq'];
    var snCur = '';
    snIds.forEach(function(id){
      var el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= 150) snCur = id;
    });
    document.querySelectorAll('.sn-inner a').forEach(function(a){
      a.classList.toggle('on', a.getAttribute('href') === '#' + snCur);
    });
  }
  window.addEventListener('scroll', tick, { passive: true });
  tick();

  /* REVEAL */
  if ('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting){
          var d = parseFloat(e.target.dataset.delay || 0);
          setTimeout(function(){ e.target.classList.add('on'); }, d * 1000);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -24px 0px' });
    document.querySelectorAll('.vis').forEach(function(el){ io.observe(el); });
  } else {
    document.querySelectorAll('.vis').forEach(function(el){ el.classList.add('on'); });
  }

  /* COUNT-UP */
  var counted = new WeakSet();
  var cio = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (e.isIntersecting && !counted.has(e.target)){
        counted.add(e.target); countUp(e.target); cio.unobserve(e.target);
      }
    });
  }, { threshold: 0.7 });
  document.querySelectorAll('.num-figure[data-to]').forEach(function(el){ cio.observe(el); });
  function countUp(el){
    var to  = parseFloat(el.dataset.to);
    var dp  = parseInt(el.dataset.dp || 0);
    var pre = el.dataset.pre || '';
    var suf = el.dataset.suf || '';
    var dur = 1300; var t0 = null;
    function step(ts){
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0)/dur, 1);
      var v = to * (1 - Math.pow(1-p, 3));
      el.textContent = pre + v.toFixed(dp) + suf;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = pre + to.toFixed(dp) + suf;
    }
    requestAnimationFrame(step);
  }

  /* FAQ */
  var tabs  = Array.from(document.querySelectorAll('.faq-tab'));
  var items = Array.from(document.querySelectorAll('.faq-item'));
  if (tabs.length && items.length){
    tabs.forEach(function(tab){
      tab.addEventListener('click', function(){
        tabs.forEach(function(t){ t.classList.remove('on'); });
        tab.classList.add('on');
        var cat = tab.dataset.cat;
        items.forEach(function(it){
          var show = it.dataset.cat === cat;
          it.classList.toggle('hide', !show);
          if (!show){ it.classList.remove('open'); it.querySelector('.faq-q').setAttribute('aria-expanded','false'); }
        });
      });
    });
    items.forEach(function(it){
      it.querySelector('.faq-q').addEventListener('click', function(){
        var will = !it.classList.contains('open');
        items.forEach(function(o){ o.classList.remove('open'); o.querySelector('.faq-q').setAttribute('aria-expanded','false'); });
        if (will){ it.classList.add('open'); it.querySelector('.faq-q').setAttribute('aria-expanded','true'); }
      });
    });
  }

  /* MODAL */
  var COPY = {
    terms:{t:'Terms of Service',d:'Last updated June 2026',b:'<p>By using the Brioo Agency website and services, you agree to the terms below.</p><ul><li><strong>Acceptance of terms.</strong> Using our site means you agree to be bound by these Terms of Service.</li><li><strong>Services.</strong> Brioo provides creator representation and brand matching. All engagements are commission based.</li><li><strong>Disclaimer.</strong> We do not guarantee specific campaign results or earnings.</li><li><strong>Governing law.</strong> These terms are governed by the laws of Canada.</li></ul><p>Questions? <a href="mailto:contact@brioo.org">contact@brioo.org</a></p>'},
    privacy:{t:'Privacy Policy',d:'Last updated June 2026',b:'<p>Brioo Agency is committed to protecting your privacy.</p><ul><li><strong>Information we collect.</strong> Name, email and social handles when voluntarily provided.</li><li><strong>How we use it.</strong> To provide services, match you with brands and process payments.</li><li><strong>Data security.</strong> Appropriate technical measures protect your data.</li><li><strong>Your rights.</strong> You can access, correct or delete personal data at any time.</li></ul><p>Questions? <a href="mailto:contact@brioo.org">contact@brioo.org</a></p>'},
    ethics:{t:'Ethics Statement',d:'',b:'<p>Ethical practice is the foundation of everything we do.</p><ul><li><strong>Creator welfare.</strong> We never pressure anyone into a partnership that does not fit their values.</li><li><strong>Brand integrity.</strong> We reject gambling, alcohol, adult content and deceptive financial products.</li><li><strong>Transparency.</strong> Every deal has clear communication and no hidden fees.</li><li><strong>Fair compensation.</strong> We advocate for fair rates and ensure creators are paid promptly.</li></ul><p>Feedback? <a href="mailto:contact@brioo.org">contact@brioo.org</a></p>'}
  };
  var modal = document.getElementById('modal');
  var mbox  = document.getElementById('modal-body');
  var prev  = null;
  function trap(e){
    if (e.key !== 'Tab' || !modal) return;
    var f = Array.from(modal.querySelectorAll('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])')).filter(function(x){ return x.offsetParent !== null; });
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]){ e.preventDefault(); f[f.length-1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length-1]){ e.preventDefault(); f[0].focus(); }
  }
  window.openModal = function(k){
    var c = COPY[k]; if (!c || !modal || !mbox) return;
    prev = document.activeElement;
    mbox.innerHTML = '<h2 id="modal-title">'+c.t+'</h2>'+(c.d?'<p class="mu">'+c.d+'</p>':'')+c.b;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', trap);
    setTimeout(function(){ var x=modal.querySelector('.modal-x'); if(x) x.focus(); }, 40);
  };
  window.closeModal = function(){
    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', trap);
    if (prev && prev.focus) prev.focus();
  };
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape') window.closeModal(); });

  /* RAF */
  function raf(t){ if (lenis) lenis.raf(t); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);
})();
