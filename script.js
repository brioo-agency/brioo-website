/* ===================================================================
   BRIOO AGENCY — SHARED SCRIPT
   Used by index.html and services.html. Every selector is null-checked
   so the same file works safely on both pages even though each page
   only has a subset of these elements.
=================================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------
     LENIS SMOOTH SCROLL (open-source, MIT licensed)
  --------------------------------------------------------------- */
  var lenis = null;
  if (!reduceMotion && window.Lenis) {
    lenis = new Lenis({
      duration: 1.15,
      easing: function (t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); },
      smoothWheel: true
    });
  }

  /* ---------------------------------------------------------------
     IN-PAGE SCROLL HELPER
     Only intercepts links when the target id exists on THIS page.
     If it doesn't exist (e.g. "#approach" clicked from services.html),
     the link falls through to its real href and navigates normally.
  --------------------------------------------------------------- */
  window.scrollToId = function (id) {
    var el = document.getElementById(id);
    if (!el) return false;
    if (lenis) { lenis.scrollTo(el, { offset: -58 }); }
    else { window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 58, behavior: "smooth" }); }
    closeMobile();
    return true;
  };

  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href").slice(1);
      if (document.getElementById(id)) {
        e.preventDefault();
        window.scrollToId(id);
      }
      /* else: let the browser follow href normally (cross-page anchor) */
    });
  });

  /* Deep-link offset on load, e.g. services.html#payments or index.html#about */
  window.addEventListener("load", function () {
    if (location.hash) {
      var el = document.getElementById(location.hash.slice(1));
      if (el) {
        setTimeout(function () {
          var y = el.getBoundingClientRect().top + window.scrollY - 110;
          window.scrollTo({ top: y });
        }, 80);
      }
    }
  });

  /* ---------------------------------------------------------------
     MOBILE MENU
  --------------------------------------------------------------- */
  var hb = document.getElementById("hamburger");
  var mm = document.getElementById("mobileMenu");
  function closeMobile() {
    if (!mm) return;
    mm.classList.remove("open");
    hb.classList.remove("open");
    hb.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }
  if (hb && mm) {
    hb.addEventListener("click", function () {
      var open = mm.classList.toggle("open");
      hb.classList.toggle("open", open);
      hb.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    });
  }

  /* ---------------------------------------------------------------
     NAV SCROLLED STATE + SCROLL PROGRESS + ACTIVE LINK (same-page sections only)
  --------------------------------------------------------------- */
  var nav = document.getElementById("nav");
  var progress = document.getElementById("progress");
  var sectionIds = ["approach", "services", "about"];
  var sections = sectionIds.map(function (id) { return document.getElementById(id); }).filter(Boolean);
  var navItems = Array.prototype.slice.call(document.querySelectorAll(".nav-links a[data-to], .mobile-menu a[data-to]"));

  function onScroll() {
    var y = window.scrollY;
    if (nav) nav.classList.toggle("scrolled", y > 50);
    if (progress) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
    }
    if (sections.length) {
      var cur = "";
      sections.forEach(function (s) { if (s.getBoundingClientRect().top <= 120) cur = s.id; });
      navItems.forEach(function (a) {
        if (a.classList.contains("force-active")) return; /* permanently-highlighted link (e.g. Services on services.html) — never touched by scroll-tracking */
        a.classList.toggle("active", a.dataset.to === cur);
      });
    }

    /* sticky service subnav active-state (services.html only) */
    var subIds = ["representation", "outreach", "contracts", "payments"];
    var subEls = subIds.map(function (id) { return document.getElementById(id); });
    if (subEls[0]) {
      var subCur = subIds[0];
      subIds.forEach(function (id, i) { if (subEls[i] && subEls[i].getBoundingClientRect().top <= 180) subCur = id; });
      document.querySelectorAll(".subnav a").forEach(function (a) {
        a.classList.toggle("active", a.getAttribute("href") === "#" + subCur);
      });
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------------------------------
     REVEAL ON SCROLL
  --------------------------------------------------------------- */
  var revObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        var d = parseFloat(e.target.dataset.delay || 0);
        setTimeout(function () { e.target.classList.add("in"); }, d * 1000);
        revObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
  document.querySelectorAll(".reveal,.reveal-l,.reveal-r").forEach(function (el) { revObs.observe(el); });

  /* ---------------------------------------------------------------
     COUNT-UP STATS (index.html only — guarded by selector presence)
  --------------------------------------------------------------- */
  var counted = new WeakSet();
  var statObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting && !counted.has(e.target)) {
        counted.add(e.target);
        animateCount(e.target);
        statObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll(".num[data-count]").forEach(function (el) { statObs.observe(el); });

  function animateCount(el) {
    var target = parseFloat(el.dataset.count);
    var dec = parseInt(el.dataset.dec || "0", 10);
    var pre = el.dataset.prefix || "";
    var suf = el.dataset.suffix || "";
    var dur = 1500;
    var t0 = null;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = target * eased;
      el.textContent = pre + val.toFixed(dec) + suf;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = pre + target.toFixed(dec) + suf;
    }
    requestAnimationFrame(step);
  }

  /* ---------------------------------------------------------------
     NICHE MARQUEE (index.html only)
  --------------------------------------------------------------- */
  var niches = ["Fashion", "Beauty", "Lifestyle", "Fitness", "Finance", "Education", "Gaming", "Travel", "Food & Drink", "Tech", "Health & Wellness", "Parenting", "Home & Living", "Business", "Sports", "Comedy", "Faith"];
  var track = document.getElementById("mtrack");
  if (track) {
    var html = "";
    for (var rep = 0; rep < 2; rep++) {
      niches.forEach(function (n) { html += '<span class="m-item"><span class="dot">\u25CF</span>' + n + "</span>"; });
    }
    track.innerHTML = html;
  }

  /* ---------------------------------------------------------------
     CUSTOM CURSOR (position updated in the unified raf loop below)
  --------------------------------------------------------------- */
  var dot = document.getElementById("cdot");
  var ring = document.getElementById("cring");
  var cursorActive = !reduceMotion && dot && ring && window.matchMedia("(hover:hover)").matches && window.innerWidth > 900;
  var mx = 0, my = 0, rx = 0, ry = 0;
  if (cursorActive) {
    document.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + "px"; dot.style.top = my + "px";
    });
    document.addEventListener("mouseover", function (e) {
      if (e.target.closest('a,button,.scell-trigger,.tcard,.stat,.servcard,.svc-col,[onclick]')) ring.classList.add("hover");
    });
    document.addEventListener("mouseout", function (e) {
      if (e.target.closest('a,button,.scell-trigger,.tcard,.stat,.servcard,.svc-col,[onclick]')) ring.classList.remove("hover");
    });
  }

  /* ---------------------------------------------------------------
     LEGAL MODAL — content written as template literals so apostrophes
     ("don't", "doesn't" etc.) never need manual escaping. This is the
     fix for the previous "Unexpected identifier" crash.
  --------------------------------------------------------------- */
  var LEGAL = {
    terms: {
      title: "Terms of Service",
      upd: "Last updated June 2026",
      html: `
        <p>By using the Brioo Agency website and services, you agree to the terms below. They govern your access to and use of our platform, including any content, functionality, and services we offer.</p>
        <ul>
          <li><strong>Acceptance of terms.</strong> Using our site means you agree to be bound by these Terms of Service.</li>
          <li><strong>Services.</strong> Brioo provides creator representation and brand matching. All engagements are commission-based.</li>
          <li><strong>Privacy.</strong> Your privacy matters. Review our Privacy Policy to understand how we collect and use information.</li>
          <li><strong>Disclaimer.</strong> While we work to connect creators with brands, we do not guarantee specific campaign results or earnings.</li>
          <li><strong>Governing law.</strong> These terms are governed by the laws of Canada.</li>
        </ul>
        <p>Questions about these terms? Email <a href="mailto:contact@brioo.org">contact@brioo.org</a>.</p>
      `
    },
    privacy: {
      title: "Privacy Policy",
      upd: "Last updated June 2026",
      html: `
        <p>Brioo Agency ("we", "our", "us") is committed to protecting your privacy. This policy explains how we collect, use, disclose, and safeguard your information when you visit our website.</p>
        <ul>
          <li><strong>Information we collect.</strong> Personal information such as your name, email, and social handles, when you voluntarily provide it.</li>
          <li><strong>How we use it.</strong> To provide our services, match you with brands, process payments, and improve our platform.</li>
          <li><strong>Data security.</strong> We use appropriate technical and organizational measures to protect your data from unauthorized access.</li>
          <li><strong>Your rights.</strong> You can access, correct, or delete your personal data at any time by contacting us.</li>
          <li><strong>Cookies.</strong> We use cookies to improve your browsing experience; manage them in your browser settings.</li>
        </ul>
        <p>Questions about our privacy practices? Email <a href="mailto:contact@brioo.org">contact@brioo.org</a>.</p>
      `
    },
    ethics: {
      title: "Ethics Statement",
      upd: "",
      html: `
        <p>At Brioo, ethical practice is the foundation of everything we do. We hold to high standards of integrity, transparency, and fairness.</p>
        <ul>
          <li><strong>Creator welfare.</strong> We prioritize the well-being and creative freedom of the creators we represent, and never pressure anyone into a partnership that does not fit their values.</li>
          <li><strong>Brand integrity.</strong> We partner only with brands that demonstrate ethical practices, and reject gambling, alcohol, adult content, and deceptive financial products.</li>
          <li><strong>Transparency.</strong> Every deal is structured with clear, upfront communication, with no hidden fees or commissions.</li>
          <li><strong>Data privacy.</strong> Protecting creator privacy is non-negotiable; we never share personal data without explicit consent.</li>
          <li><strong>Fair compensation.</strong> We advocate for fair rates and ensure creators are paid promptly.</li>
        </ul>
        <p>Concerns or feedback? Email <a href="mailto:contact@brioo.org">contact@brioo.org</a>.</p>
      `
    }
  };

  var modal = document.getElementById("modal");
  var mcontent = document.getElementById("modal-content");
  window.openModal = function (key) {
    var d = LEGAL[key];
    if (!d || !modal || !mcontent) return;
    mcontent.innerHTML = "<h2>" + d.title + "</h2>" + (d.upd ? '<p class="upd">' + d.upd + "</p>" : "") + d.html;
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  };
  window.closeModal = function () {
    if (!modal) return;
    modal.classList.remove("open");
    document.body.style.overflow = "";
  };
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") window.closeModal(); });

  /* ---------------------------------------------------------------
     HERO NETWORK CANVAS (index.html only — pure connection visual)
  --------------------------------------------------------------- */
  var canvas = document.getElementById("heroCanvas");
  var canvasActive = !!canvas && !reduceMotion;
  var ctx, W, H, nodes = [];
  var dpr = Math.min(window.devicePixelRatio || 1, 2);

  function Node() {
    this.x = Math.random() * W * 0.86 + W * 0.07;
    this.y = Math.random() * H * 0.8 + H * 0.1;
    this.r = Math.random() * 2.4 + 0.8;
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = (Math.random() - 0.5) * 0.3;
    this.pulse = Math.random() * Math.PI * 2;
  }
  function initCanvas() {
    nodes = [];
    for (var i = 0; i < 30; i++) nodes.push(new Node());
  }
  function resizeCanvas() {
    if (!canvasActive) return;
    ctx = ctx || canvas.getContext("2d");
    W = canvas.offsetWidth; H = canvas.offsetHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initCanvas();
  }
  function drawCanvas() {
    if (!canvasActive) return;
    ctx.clearRect(0, 0, W, H);
    nodes.forEach(function (n) {
      n.x += n.vx; n.y += n.vy; n.pulse += 0.02;
      if (n.x < 8 || n.x > W - 8) n.vx *= -1;
      if (n.y < 8 || n.y > H - 8) n.vy *= -1;
    });
    for (var i = 0; i < nodes.length; i++) {
      for (var j = i + 1; j < nodes.length; j++) {
        var dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < 120) {
          var a = 0.18 * (1 - d / 120);
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = "rgba(200,164,107," + a + ")";
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
    nodes.forEach(function (n) {
      var pulse = 0.72 + Math.sin(n.pulse) * 0.28;
      var g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 4.5);
      g.addColorStop(0, "rgba(200,164,107,.18)");
      g.addColorStop(1, "rgba(200,164,107,0)");
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r * 4.5, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r * pulse, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(231,205,160,.85)"; ctx.fill();
    });
  }
  if (canvasActive) {
    resizeCanvas();
    var rt;
    window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(resizeCanvas, 150); });
  }

  /* ---------------------------------------------------------------
     SINGLE UNIFIED RAF LOOP — Lenis + canvas + cursor ring follow
  --------------------------------------------------------------- */
  function raf(time) {
    if (lenis) lenis.raf(time);
    if (canvasActive) drawCanvas();
    if (cursorActive) {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      ring.style.left = rx + "px"; ring.style.top = ry + "px";
    }
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
})();
