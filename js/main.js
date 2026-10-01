/* ════════════════════════════════════════════════════════════════════
   FAROOQ — PORTFOLIO v3 · INTERACTION ENGINE
   Native scroll + sticky pins + rAF loop writing CSS vars.
   Original GLSL "matter field" smoke (fbm noise) — no frameworks.
   ════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  const C = window.CONTENT;
  if (!C) return;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const byId = id => document.getElementById(id);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const DPR = Math.min(window.devicePixelRatio || 1, 1.5);

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ════════════ GLSL SMOKE — original fbm "matter field" ════════════ */
  const FRAG = `
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_pointer;
uniform float u_density;
uniform float u_seed;
uniform int u_oct;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7)) + u_seed * 17.0) * 43758.5453123); }
float vnoise(vec2 p){
  vec2 i = floor(p); vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0; float a = 0.5;
  for (int i = 0; i < 5; i++) {
    if (i >= u_oct) break;
    v += a * vnoise(p);
    p = p * 2.03 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}
void main(){
  vec2 uv = gl_FragCoord.xy / u_res;
  float aspect = u_res.x / u_res.y;
  vec2 p = vec2(uv.x * aspect, uv.y) * 1.7 + u_seed;
  float t = u_time * 0.06;
  vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3) - vec2(t * 0.8, 0.0)));
  vec2 r = vec2(fbm(p + 2.1 * q + vec2(1.7, 9.2) + t * 0.5),
                fbm(p + 2.1 * q + vec2(8.3, 2.8) - t * 0.35));
  float f = fbm(p + 2.3 * r);
  if (u_pointer.x >= 0.0) {
    float pd = distance(vec2(uv.x * aspect, uv.y), vec2(u_pointer.x * aspect, u_pointer.y));
    f += 0.30 * exp(-pd * pd * 22.0);
  }
  vec3 deep = vec3(0.055, 0.050, 0.090);
  vec3 viol = vec3(0.420, 0.300, 0.720);
  vec3 rose = vec3(0.850, 0.520, 0.760);
  vec3 col = mix(deep, viol, smoothstep(0.28, 0.72, f));
  col = mix(col, rose, smoothstep(0.58, 0.95, f) * 0.55);
  float a = smoothstep(0.30, 0.92, f) * u_density;
  gl_FragColor = vec4(col * a, a);
}`;
  const VERT = `attribute vec2 a_pos; void main(){ gl_Position = vec4(a_pos, 0.0, 1.0); }`;

  const glPointer = { x: -1, y: -1 };
  window.addEventListener("pointermove", e => { glPointer.x = e.clientX; glPointer.y = e.clientY; }, { passive: true });

  function initSmoke(canvas, opts) {
    if (!canvas || reducedMotion) return null;
    const o = Object.assign({ scale: 0.32, octaves: 4, density: 0.5, speed: 1, seed: 3.1 }, opts || {});
    let gl;
    try { gl = canvas.getContext("webgl", { alpha: true, antialias: false, depth: false, stencil: false }); }
    catch (e) { gl = null; }
    if (!gl) return null;
    // quality adaptation: fewer octaves + lower res on weak GPUs
    const weak = (navigator.hardwareConcurrency || 8) <= 4;
    const oct = weak ? Math.min(3, o.octaves) : o.octaves;
    const scale = weak ? o.scale * 0.7 : o.scale;
    function sh(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) return null;
      return s;
    }
    const vs = sh(gl.VERTEX_SHADER, VERT), fs = sh(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return null;
    const pr = gl.createProgram();
    gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return null;
    gl.useProgram(pr);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = n => gl.getUniformLocation(pr, n);
    const uRes = U("u_res"), uTime = U("u_time"), uPtr = U("u_pointer"),
          uDen = U("u_density"), uSeed = U("u_seed"), uOct = U("u_oct");
    gl.uniform1f(uDen, o.density); gl.uniform1f(uSeed, o.seed); gl.uniform1i(uOct, oct);
    function resize() {
      const r = canvas.getBoundingClientRect();
      canvas.width = Math.max(2, Math.round(r.width * scale));
      canvas.height = Math.max(2, Math.round(r.height * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    resize();
    window.addEventListener("resize", resize);
    const t0 = performance.now();
    return {
      draw(now) {
        const r = canvas.getBoundingClientRect();
        if (!r.width || !r.height) return;
        let px = -1, py = -1;
        if (glPointer.x >= 0 && r.width) {
          px = (glPointer.x - r.left) / r.width;
          py = 1 - (glPointer.y - r.top) / r.height;
          if (px < -0.2 || px > 1.2 || py < -0.2 || py > 1.2) { px = -1; py = -1; }
        }
        gl.uniform2f(uRes, canvas.width, canvas.height);
        gl.uniform1f(uTime, (now - t0) / 1000 * o.speed);
        gl.uniform2f(uPtr, px, py);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      },
      resize
    };
  }

  /* ════════════ RENDER — from CONTENT ════════════ */
  function renderIntroText() {
    const set = (id, v) => { const el = byId(id); if (el) el.textContent = v; };
    set("intro-hud-tl", C.intro.hudCornerTL);
    set("intro-hud-tr", C.intro.hudCornerTR);
    set("intro-hud-bl", C.intro.hudCornerBL);
    set("intro-hud-br", C.intro.hudCornerBR);
    set("intro-line1", C.intro.line1);
    set("intro-line2", C.intro.line2);
    set("intro-skip-label", C.intro.skipLabel);
  }

  function renderHero() {
    const set = (id, v) => { const el = byId(id); if (el) el.textContent = v; };
    set("hero-eyebrow", C.hero.eyebrow);
    set("hero-line1", C.hero.line1);
    set("hero-line2", C.hero.line2);
    set("hero-sub", C.hero.sub);
    const p = byId("hero-cta-primary");
    if (p) { p.querySelector("span").textContent = C.hero.primaryCta.label; p.href = C.hero.primaryCta.href; }
    const s = byId("hero-cta-secondary");
    if (s) { s.querySelector("span").textContent = C.hero.secondaryCta.label; s.href = C.hero.secondaryCta.href; }
    set("hero-status-label", C.hero.statusPrefix);
    const frames = byId("hero-frames"), nav = byId("hero-chapters");
    if (frames) C.hero.chapters.forEach((ch, i) => {
      const img = document.createElement("img");
      img.src = ch.img; img.alt = ch.alt; img.decoding = "async";
      if (i === 0) img.fetchPriority = "high";
      frames.appendChild(img);
    });
    if (nav) C.hero.chapters.forEach((ch, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.innerHTML = '<span class="ch-n">' + ch.n + '</span><span>' + ch.label + "</span>";
      b.setAttribute("aria-label", "Scene " + ch.n + ": " + ch.label);
      if (i === 0) { b.classList.add("active"); b.setAttribute("aria-current", "true"); }
      b.addEventListener("click", () => jumpToChapter(i));
      nav.appendChild(b);
    });
  }

  function renderMarquee() {
    const half = C.marquee.map(m => "<span>" + m + '</span><span class="mq-sep">◆</span>').join("");
    ["marquee-track", "stack-marquee-track"].forEach(id => {
      const t = byId(id);
      if (t) t.innerHTML = half + half;
    });
  }

  function renderFilms() {
    const host = byId("film-grid");
    if (!host) return;
    C.projects.forEach((p, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "film-card reveal" + (i % 2 ? " d1" : "");
      b.setAttribute("aria-label", "Open case study: " + p.title);
      b.innerHTML =
        '<span class="film-media"><img src="' + p.image + '" alt="' + p.imageAlt + '" loading="lazy" decoding="async">' +
        '<span class="film-chip tl">P' + p.index + '</span>' +
        '<span class="film-chip tr">' + p.duration + "</span>" +
        (p.concept ? '<span class="chip concept">Concept</span>' : "") +
        '<span class="film-scrim"><span><span class="film-meta">' + p.scope + '</span>' +
        '<span class="film-title">' + p.title + "</span></span>" +
        '<span class="film-view">VIEW CASE <span class="play-chip" aria-hidden="true">▷</span></span></span></span>';
      b.addEventListener("click", () => openModal(p));
      host.appendChild(b);
    });
  }

  function renderPrinciples() {
    const set = (id, v) => { const el = byId(id); if (el) el.innerHTML = v; };
    set("principles-kicker", C.philosophy.kicker);
    set("principles-heading", C.philosophy.heading);
    const host = byId("philosophy-grid");
    if (!host) return;
    C.philosophy.principles.forEach((p, i) => {
      const d = document.createElement("div");
      d.className = "principle reveal" + (i === 1 ? " d1" : i === 2 ? " d2" : "");
      d.innerHTML = '<span class="numeral">' + p.numeral + "</span><h3>" + p.title + "</h3><p>" + p.text + "</p>" +
        '<a class="text-link" href="#contact">Discuss this <span aria-hidden="true">↗</span></a>';
      host.appendChild(d);
    });
  }

  function renderEngine() {
    const set = (id, v) => { const el = byId(id); if (el) el.innerHTML = v; };
    set("engine-kicker", C.engine.kicker);
    set("engine-heading", C.engine.heading);
    set("engine-lede", C.engine.lede);
    const tl = byId("engine-timeline");
    if (tl) C.engine.stages.forEach((s, i) => {
      const li = document.createElement("li");
      li.innerHTML =
        '<div class="tl-head"><span class="tl-title">' + s.n + " · " + s.title + '</span><span class="tl-n">' + s.code + "</span></div>" +
        '<div class="tl-bar"><span class="tl-fill" data-tl="' + i + '"></span></div>';
      tl.appendChild(li);
    });
    const frame = byId("engine-frame");
    if (frame) C.engine.stages.forEach((s, i) => {
      const img = document.createElement("img");
      img.src = s.image; img.alt = s.imageAlt; img.loading = "lazy"; img.decoding = "async";
      img.dataset.stage = i;
      frame.appendChild(img);
    });
  }

  function renderWorlds() {
    const host = byId("worlds-list");
    if (!host) return;
    C.worlds.forEach((w, i) => {
      const a = document.createElement("article");
      a.className = "world-article reveal" + (i % 2 ? " flip" : "");
      a.dataset.world = i;
      a.innerHTML =
        '<div class="world-media"><img src="' + w.image + '" alt="' + w.imageAlt + '" loading="lazy" decoding="async">' +
        '<div class="world-shimmer" data-shimmer></div>' +
        '<div class="world-scrim">' +
        (w.concept ? '<span class="chip concept">Concept</span>' : "") +
        '<span class="mono" style="color:var(--mut)">' + w.code + "</span></div></div>" +
        '<div class="world-copy">' +
        '<span class="world-counter">' + w.n + " / " + String(C.worlds.length).padStart(2, "0") + "</span>" +
        '<span class="world-meta">' + w.meta + "</span>" +
        "<h3>" + w.headline + "</h3>" +
        '<div class="chip-list">' + w.tags.map(t => '<span class="chip">' + t + "</span>").join("") + "</div>" +
        '<p class="world-contrib">' + w.contribution + "</p>" +
        '<button type="button" class="text-link" data-world-open="' + i + '">Open the case study <span aria-hidden="true">↗</span></button>' +
        "</div>";
      host.appendChild(a);
    });
    $$("[data-world-open]", host).forEach(b =>
      b.addEventListener("click", () => openModal(C.projects[+b.dataset.worldOpen])));
  }

  function renderCapabilities() {
    const set = (id, v) => { const el = byId(id); if (el) el.innerHTML = v; };
    set("capabilities-kicker", C.capabilities.kicker);
    set("capabilities-heading", C.capabilities.heading);
    set("capabilities-lede", C.capabilities.lede);
    const fg = byId("feature-cards");
    if (fg) C.capabilities.features.forEach((f, i) => {
      const d = document.createElement("article");
      d.className = "feature-card reveal" + (i % 2 ? " d1" : "");
      d.innerHTML =
        '<div class="feature-media"><img src="' + f.image + '" alt="' + f.imageAlt + '" loading="lazy" decoding="async"></div>' +
        '<div class="feature-body"><div class="feature-meta"><span class="mono-counter">' + f.n + ' / 02</span><span class="chip">Featured</span></div>' +
        "<h3>" + f.title + "</h3>" +
        '<p class="feature-statement">' + f.statement + "</p>" +
        "<p>" + f.body + "</p>" +
        '<div class="chip-list">' + f.chips.map(c => '<span class="chip">' + c + "</span>").join("") + "</div></div>";
      fg.appendChild(d);
    });
    const rows = byId("cap-link-rows");
    if (rows) {
      const wrap = document.createElement("div");
      wrap.className = "cap-link-rows";
      C.capabilities.linkRows.forEach((r, i) => {
        const a = document.createElement("a");
        a.className = "cap-link-row reveal" + (i % 2 ? " d1" : "");
        a.href = "#contact";
        a.setAttribute("aria-label", r.title + " — discuss a project");
        a.innerHTML = '<span class="cap-n">' + r.n + "</span>" +
          "<span><h3>" + r.title + "</h3><p>" + r.text + "</p></span>" +
          '<span class="circle-btn" aria-hidden="true">↗</span>';
        wrap.appendChild(a);
      });
      rows.appendChild(wrap);
    }
  }

  function renderDigital() {
    const set = (id, v) => { const el = byId(id); if (el) el.innerHTML = v; };
    set("digital-kicker", C.experiences.kicker);
    set("digital-heading", C.experiences.heading);
    set("digital-lede", C.experiences.lede);
    const host = byId("experience-cards");
    if (!host) return;
    C.experiences.cards.forEach((c, i) => {
      const card = document.createElement("article");
      card.className = "exp-card reveal" + (i === 1 ? " d1" : i === 2 ? " d2" : "");
      let demo;
      if (c.kind === "terminal") {
        demo = '<div class="exp-demo" data-term tabindex="0" role="button" aria-label="Replay terminal demo"><div class="exp-term" aria-hidden="true"></div></div>';
      } else {
        demo = '<div class="exp-demo"><canvas data-sketch="' + c.kind + '"></canvas></div>';
      }
      card.innerHTML = demo +
        '<div class="exp-body"><div class="exp-top"><span class="mono">' + c.n + " / " + c.code + '</span><span class="chip">Live demo</span></div>' +
        "<h3>" + c.title + "</h3><p>" + c.text + "</p>" +
        '<p class="exp-hint">' + c.hint + "</p></div>";
      host.appendChild(card);
    });
  }

  function renderArchive() {
    const set = (id, v) => { const el = byId(id); if (el) el.innerHTML = v; };
    set("archive-kicker", C.archive.kicker);
    set("archive-heading", C.archive.heading);
    set("archive-lede", C.archive.lede);
    const host = byId("archive-grid");
    if (!host) return;
    C.archive.items.forEach((a, i) => {
      const d = document.createElement("article");
      d.className = "archive-card reveal" + (i % 3 === 1 ? " d1" : i % 3 === 2 ? " d2" : "");
      d.innerHTML = '<img src="' + a.image + '" alt="' + a.imageAlt + '" loading="lazy" decoding="async">' +
        '<span class="archive-chip">' + a.code + '</span>' +
        '<div class="archive-body">' + a.title + "</div>";
      host.appendChild(d);
    });
  }

  function renderProcess() {
    const set = (id, v) => { const el = byId(id); if (el) el.innerHTML = v; };
    set("process-kicker", C.process.kicker);
    set("process-heading", C.process.heading);
    set("process-lede", C.process.lede);
    set("process-foot", C.process.foot);
    const host = byId("process-steps");
    if (!host) return;
    C.process.steps.forEach((s, i) => {
      const li = document.createElement("li");
      li.className = "reveal" + (i % 2 ? " d1" : "");
      li.innerHTML = '<span class="p-n">' + s.n + "</span><h3>" + s.title + "</h3><p>" + s.text + "</p>";
      host.appendChild(li);
    });
  }

  function renderStudio() {
    const set = (id, v) => { const el = byId(id); if (el) el.innerHTML = v; };
    set("studio-kicker", C.about.kicker);
    set("studio-heading", C.about.heading);
    const copy = byId("about-copy");
    if (copy) copy.innerHTML = C.about.paragraphs.map(p => "<p>" + p + "</p>").join("");
    set("about-exploring-label", C.about.exploringLabel);
    const chips = byId("about-chips");
    if (chips) chips.innerHTML = C.about.exploring.map(e => "<li><span class='chip'>" + e + "</span></li>").join("");
    set("about-caption", C.about.portraitCaption);
  }

  function renderStackBand() {
    const set = (id, v) => { const el = byId(id); if (el) el.innerHTML = v; };
    set("stackband-kicker", C.stackBand.kicker);
    set("stackband-line1", C.stackBand.line1);
    set("stackband-line2", C.stackBand.line2);
    set("stackband-desc", C.stackBand.desc);
    set("stack-pause-label", C.stackBand.pauseLabel);
    set("stack-heading", C.stack.heading);
    set("stack-lede", C.stack.lede);
    set("stack-readout-name", C.stack.hint);
  }

  function renderFaq() {
    const set = (id, v) => { const el = byId(id); if (el) el.innerHTML = v; };
    set("faq-kicker", C.faq.kicker);
    set("faq-heading", C.faq.heading);
    const host = byId("faq-list");
    if (!host) return;
    C.faq.items.forEach((f, i) => {
      const d = document.createElement("details");
      d.className = "faq-item reveal" + (i % 2 ? " d1" : "");
      if (i === 0) d.open = true;
      d.innerHTML = "<summary><span>" + f.q + '</span><span class="faq-plus" aria-hidden="true">+</span></summary>' +
        '<div class="faq-a"><div><p>' + f.a + "</p></div></div>";
      host.appendChild(d);
    });
  }

  function renderContact() {
    const set = (id, v) => { const el = byId(id); if (el) el.innerHTML = v; };
    set("contact-kicker", C.contact.kicker);
    set("contact-heading", C.contact.heading);
    set("contact-lede", C.contact.lede);
    const cl = byId("contact-checklist");
    if (cl) cl.innerHTML = C.contact.checklist.map(c => "<li>" + c + "</li>").join("");
    set("form-title", C.contact.form.title);
    set("form-note", C.contact.form.note);
    const sel = byId("f-type");
    if (sel) sel.innerHTML = C.contact.form.services.map(t => "<option>" + t + "</option>").join("");
    set("form-submit-label", C.contact.form.submitLabel);
    set("form-privacy", C.contact.form.privacy);
  }

  function renderFooter() {
    const set = (id, v) => { const el = byId(id); if (el) el.innerHTML = v; };
    set("footer-cta-line1", C.footer.ctaLine1);
    set("footer-cta-line2", C.footer.ctaLine2);
    set("footer-note", C.footer.directoryNote);
    set("footer-location", C.profile.location);
    set("footer-colophon", C.footer.colophon);
    set("to-top-label", C.footer.backToTop);
    set("reduce-toggle-label", C.footer.reduceMotion);
    const soc = byId("footer-socials");
    if (soc) soc.innerHTML = C.socials.map(s =>
      '<a href="' + s.href + '"' + (s.href === "#" ? ' aria-disabled="true"' : ' target="_blank" rel="noopener"') + ">" + s.label + " ↗</a>"
    ).join("");
  }

  /* ════════════ INTRO ════════════ */
  const INTRO_MS = 3800, INTRO_FAILSAFE_MS = 4200;
  let introDone = false, introWired = false, introFailsafe = null, introGL = null;

  function finishIntro() {
    if (introDone) return;
    introDone = true;
    if (introFailsafe) { clearTimeout(introFailsafe); introFailsafe = null; }
    const intro = byId("intro");
    if (!intro) return;
    intro.classList.add("done");
    intro.setAttribute("aria-hidden", "true");
    document.body.classList.add("loaded");
    setTimeout(() => { intro.style.display = "none"; }, 950);
  }
  function wireIntro() {
    if (introWired) return; introWired = true;
    const skip = byId("intro-skip");
    if (skip) skip.addEventListener("click", finishIntro);
    window.addEventListener("keydown", function trap(e) {
      if (introDone || e.key !== "Tab") return;
      const s = byId("intro-skip");
      if (s) { e.preventDefault(); s.focus(); }
    });
    window.addEventListener("keydown", function esc(e) {
      if (e.key === "Escape" && !introDone) finishIntro();
    });
  }
  function runIntro() {
    wireIntro();
    const intro = byId("intro");
    if (!intro) return;
    if (reducedMotion || document.documentElement.classList.contains("reduced")) { finishIntro(); return; }
    if (!introGL) introGL = initSmoke(byId("intro-smoke"), { scale: 0.5, octaves: 5, density: 0.85, speed: 1.4, seed: 11.7 });
    introDone = false;
    intro.removeAttribute("aria-hidden");
    intro.style.display = "";
    intro.classList.remove("done");
    const mono = byId("intro-monogram");
    if (mono) { mono.style.animation = "none"; void mono.offsetWidth; mono.style.animation = ""; }
    const fill = byId("intro-progress-fill");
    if (fill) fill.style.transform = "scaleX(0)";
    const skip = byId("intro-skip");
    if (skip) skip.focus();
    const t0 = performance.now();
    (function step(t) {
      if (introDone) return;
      const p = clamp((t - t0) / INTRO_MS, 0, 1);
      document.documentElement.style.setProperty("--intro-progress", p.toFixed(3));
      if (fill) fill.style.transform = "scaleX(" + p + ")";
      if (introGL && !document.documentElement.classList.contains("paused")) introGL.draw(t);
      if (p < 1) requestAnimationFrame(step);
      else finishIntro();
    })(t0);
    if (introFailsafe) clearTimeout(introFailsafe);
    introFailsafe = setTimeout(finishIntro, INTRO_FAILSAFE_MS);
  }
  function replayIntro() {
    if (!introDone) return;
    window.scrollTo({ top: 0, behavior: "auto" });
    runIntro();
  }

  /* ════════════ HEADER ════════════ */
  function setPaused(paused) {
    document.documentElement.classList.toggle("paused", paused);
    ["motion-toggle", "stack-pause"].forEach(id => {
      const b = byId(id);
      if (b) b.setAttribute("aria-pressed", String(paused));
    });
    const mt = byId("motion-toggle");
    if (mt) mt.setAttribute("aria-label", paused ? "Resume motion" : "Pause motion");
  }
  function initHeader() {
    const header = byId("site-header");
    if (header) {
      const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 40);
      window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
    }
    const toggle = byId("menu-toggle"), menu = byId("mobile-menu");
    if (toggle && menu) toggle.addEventListener("click", () => {
      const open = menu.hasAttribute("hidden");
      if (open) { menu.removeAttribute("hidden"); toggle.setAttribute("aria-expanded", "true"); }
      else { menu.setAttribute("hidden", ""); toggle.setAttribute("aria-expanded", "false"); }
    });
    $$("#mobile-menu a").forEach(a => a.addEventListener("click", () => {
      if (menu) menu.setAttribute("hidden", "");
      if (toggle) toggle.setAttribute("aria-expanded", "false");
    }));
    // Escape closes the mobile menu too
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && menu && !menu.hasAttribute("hidden")) {
        menu.setAttribute("hidden", "");
        if (toggle) { toggle.setAttribute("aria-expanded", "false"); toggle.focus(); }
      }
    });
    const mt = byId("motion-toggle");
    if (mt) mt.addEventListener("click", () =>
      setPaused(!document.documentElement.classList.contains("paused")));
    const sp = byId("stack-pause");
    if (sp) sp.addEventListener("click", () =>
      setPaused(!document.documentElement.classList.contains("paused")));
    const op = byId("opening-replay");
    if (op) op.addEventListener("click", replayIntro);
    const tt = byId("to-top");
    if (tt) tt.addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" }));
    const rt = byId("reduce-toggle");
    if (rt) rt.addEventListener("click", () => {
      const on = document.documentElement.classList.toggle("reduced");
      rt.setAttribute("aria-pressed", String(on));
    });
  }

  /* ════════════ SCROLL LOOP — hero pin, engine pin, worlds, parallax ════════════ */
  let heroImgs = [], chapterBtns = [];
  let engineImgs = [], engineTlFills = [], engineTlItems = [], engineStage = -1;
  let heroWipe = null, heroContent = null, heroChapterWord = null, heroChapterIdx = -1;
  let worldArticles = [];

  function pinProgress(wrap) {
    if (!wrap) return 0;
    const r = wrap.getBoundingClientRect();
    const total = wrap.offsetHeight - window.innerHeight;
    if (total <= 0) return 0;
    return clamp(-r.top / total, 0, 1);
  }

  function setEngineStage(i, instant) {
    if (i === engineStage && !instant) return;
    engineStage = i;
    const s = C.engine.stages[i];
    if (!s) return;
    const panel = $(".engine-panel");
    engineTlItems.forEach((li, k) => li.classList.toggle("active", k === i));
    const chip = byId("engine-layer-chip");
    if (chip) chip.textContent = "MATTER LAYER · " + s.n;
    const apply = () => {
      const set = (id, v) => { const el = byId(id); if (el) el.textContent = v; };
      set("engine-num", s.n); set("engine-title", s.title);
      set("engine-text", s.text); set("engine-chip", s.code);
      if (panel) { panel.style.opacity = 1; panel.style.transform = "none"; }
    };
    if (instant || reducedMotion) { apply(); return; }
    if (panel) {
      panel.style.transition = "opacity .3s ease, transform .3s ease";
      panel.style.opacity = 0; panel.style.transform = "translateY(8px)";
      setTimeout(apply, 180);
    } else apply();
  }

  function setChapterUI(p, idx) {
    chapterBtns.forEach((b, i) => {
      const on = i === idx;
      b.classList.toggle("active", on);
      if (on) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current");
    });
    const num = byId("hero-status-num");
    if (num) num.textContent = String(idx + 1).padStart(2, "0");
    const fill = byId("hero-status-fill");
    if (fill) fill.style.transform = "scaleX(" + p.toFixed(3) + ")";
    if (heroChapterWord && idx !== heroChapterIdx) {
      heroChapterIdx = idx;
      heroChapterWord.textContent = C.hero.chapters[idx].label;
      const wrap = heroChapterWord.parentElement;
      if (wrap) { wrap.classList.remove("rise"); void wrap.offsetWidth; wrap.classList.add("rise"); }
    }
  }

  function updateHeroWipe(p) {
    if (!heroWipe) return;
    const n = C.hero.chapters.length, w = 0.07;
    let amp = 0, x = 0.5;
    for (let i = 0; i < n - 1; i++) {
      const b = (2 * i + 1) / (2 * (n - 1));
      const d = (p - b) / w;
      const a = Math.exp(-d * d);
      if (a > amp) { amp = a; x = clamp((p - (b - w)) / (2 * w), 0, 1); }
    }
    heroWipe.style.opacity = (amp * 0.9).toFixed(3);
    heroWipe.style.transform = "translateX(" + (x * 170 - 85).toFixed(2) + "%)";
  }

  function updateHero(p) {
    const n = C.hero.chapters.length;
    document.documentElement.style.setProperty("--hero-progress", p.toFixed(3));
    if (reducedMotion) {
      heroImgs.forEach((img, i) => { img.style.opacity = i === 0 ? 1 : 0; img.style.transform = "none"; });
      if (heroWipe) heroWipe.style.opacity = 0;
      setChapterUI(p, 0);
      return;
    }
    heroImgs.forEach((img, i) => {
      const d = Math.abs(p * (n - 1) - i);
      img.style.opacity = clamp(1 - d * 1.5, 0, 1).toFixed(3);
      img.style.setProperty("--kbp", clamp(p * (n - 1) - i + 0.5, 0, 1).toFixed(3));
    });
    updateHeroWipe(p);
    if (heroContent) heroContent.classList.toggle("gone", p > 0.09);
    setChapterUI(p, Math.round(p * (n - 1)));
  }

  function updateEngine(p) {
    document.documentElement.style.setProperty("--step-progress", p.toFixed(3));
    const sp = p * 2;
    let i0 = Math.floor(sp), f = sp - i0;
    if (sp >= 2) { i0 = 1; f = 1; }
    if (reducedMotion) {
      const idx = Math.round(sp);
      engineImgs.forEach((img, k) => { img.style.opacity = k === idx ? 1 : 0; img.style.clipPath = "none"; img.style.transform = "none"; img.style.filter = "none"; });
      engineTlFills.forEach((fill, k) => { fill.style.transform = "scaleX(" + (k <= idx ? 1 : 0) + ")"; });
      setEngineStage(idx);
      return;
    }
    // grade shift per stage: subtle hue/grade drift as the "matter" transforms
    const grades = ["saturate(1.05) contrast(1.02)", "saturate(1.18) hue-rotate(-12deg) contrast(1.05)", "saturate(1.3) hue-rotate(14deg) contrast(1.08) brightness(1.05)"];
    engineImgs.forEach((img, k) => {
      img.style.filter = grades[k] || "none";
      if (k < i0) { img.style.opacity = 0; img.style.clipPath = "none"; }
      else if (k === i0) { img.style.opacity = 1; img.style.clipPath = "none"; img.style.transform = "scale(1.04)"; }
      else if (k === i0 + 1) {
        img.style.opacity = 1;
        img.style.clipPath = "inset(0 " + ((1 - f) * 100).toFixed(2) + "% 0 0)";
        img.style.transform = "scale(" + (1.1 - 0.06 * f).toFixed(4) + ")";
      } else { img.style.opacity = 0; }
    });
    engineTlFills.forEach((fill, k) => {
      fill.style.transform = "scaleX(" + clamp(p * 3 - k, 0, 1).toFixed(3) + ")";
    });
    setEngineStage(Math.round(sp));
  }

  function updateWorlds() {
    if (!worldArticles.length) return;
    const vh = window.innerHeight;
    worldArticles.forEach(a => {
      const shim = a.querySelector("[data-shimmer]");
      if (!shim) return;
      const r = a.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) { shim.style.opacity = 0; return; }
      // swell as the article crosses the viewport middle
      const c = 1 - Math.min(1, Math.abs(r.top + r.height / 2 - vh / 2) / (vh * 0.7));
      const v = clamp(c, 0, 1);
      a.style.setProperty("--world-progress", v.toFixed(3));
      if (reducedMotion) { shim.style.opacity = 0; return; }
      shim.style.opacity = (v * 0.9).toFixed(3);
      shim.style.backgroundPosition = ((1 - v) * 100).toFixed(1) + "% 0";
    });
  }

  function updateParallax() {
    if (reducedMotion) return;
    const vh = window.innerHeight;
    $$(".world-media img, .film-media img").forEach(img => {
      const r = img.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      const c = (r.top + r.height / 2 - vh / 2) / vh;
      img.style.translate = "0 " + (-c * 8).toFixed(2) + "%";
    });
  }

  function jumpToChapter(i) {
    const wrap = $(".hero-pin-wrap");
    if (!wrap) return;
    const top = wrap.offsetTop + (i / (C.hero.chapters.length - 1)) * (wrap.offsetHeight - window.innerHeight);
    window.scrollTo({ top, behavior: reducedMotion ? "auto" : "smooth" });
  }

  let scrollTick = false;
  function onScrollLoop() {
    if (scrollTick) return; scrollTick = true;
    requestAnimationFrame(() => {
      scrollTick = false;
      updateHero(pinProgress($(".hero-pin-wrap")));
      updateEngine(pinProgress($(".engine-pin-wrap")));
      updateWorlds();
      updateParallax();
    });
  }

  /* ════════════ REVEALS + SCROLL-SPY ════════════ */
  function initReveals() {
    if (reducedMotion || document.documentElement.classList.contains("reduced")) {
      $$(".reveal").forEach(el => el.classList.add("in")); return;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    $$(".reveal").forEach(el => io.observe(el));
  }

  function initSpy() {
    const links = $$(".site-nav a[data-spy]");
    if (!links.length) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          links.forEach(l => l.removeAttribute("aria-current"));
          const link = links.find(l => l.dataset.spy === e.target.id);
          if (link) link.setAttribute("aria-current", "true");
        }
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    ["work", "process", "digital", "studio"].forEach(id => {
      const s = byId(id); if (s) io.observe(s);
    });
  }

  /* ════════════ GENERATIVE SKETCHES — shared live-canvas loop ════════════ */
  const sketches = [];
  const BG = "#06070c";
  function registerSketch(canvas, kind, seed) {
    const ctx = canvas.getContext("2d");
    const rnd = mulberry32(seed || ((Math.random() * 1e9) | 0));
    const st = { canvas, ctx, kind, rnd, t: rnd() * 1000, seedPh: rnd() * 6.283, pointer: { x: -9999, y: -9999 }, parts: null, init: false };
    function size() {
      const r = canvas.getBoundingClientRect();
      canvas.width = Math.max(2, Math.round(r.width * DPR));
      canvas.height = Math.max(2, Math.round(r.height * DPR));
      st.init = false;
    }
    size();
    if (window.ResizeObserver) new ResizeObserver(size).observe(canvas);
    canvas.addEventListener("pointermove", e => {
      const r = canvas.getBoundingClientRect();
      st.pointer.x = (e.clientX - r.left) / r.width * canvas.width;
      st.pointer.y = (e.clientY - r.top) / r.height * canvas.height;
    });
    canvas.addEventListener("pointerleave", () => { st.pointer.x = -9999; st.pointer.y = -9999; });
    sketches.push(st);
    return st;
  }

  function sketchTick(st, dt) {
    const { ctx, canvas, kind, rnd } = st;
    const W = canvas.width, H = canvas.height;
    if (!W || !H) return;
    st.t += dt;
    const t = st.t;
    const lav = a => "rgba(198,165,250," + a + ")";
    const rose = a => "rgba(238,153,205," + a + ")";

    if (kind === "noise") {
      if (!st.buf || st.buf.width !== 160) {
        st.buf = document.createElement("canvas"); st.buf.width = 160; st.buf.height = 200;
        st.bctx = st.buf.getContext("2d");
        st.img = st.bctx.createImageData(160, 200);
      }
      if ((st.f = (st.f || 0) + 1) % 3 === 0) {
        const d = st.img.data;
        for (let i = 0; i < d.length; i += 4) {
          const v = rnd() * 255;
          d[i] = 140 + v * 0.25; d[i + 1] = 120 + v * 0.2; d[i + 2] = 170 + v * 0.3; d[i + 3] = 26 + rnd() * 40;
        }
        st.bctx.putImageData(st.img, 0, 0);
      }
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(st.buf, 0, 0, W, H);
      return;
    }

    if (!st.init) {
      st.init = true;
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      if (kind === "flow" || kind === "field") {
        st.parts = [];
        const n = kind === "flow" ? 110 : 70;
        for (let i = 0; i < n; i++) st.parts.push({ x: rnd() * W, y: rnd() * H, vx: 0, vy: 0 });
      }
      if (kind === "orbit") {
        st.parts = [];
        for (let i = 0; i < 6; i++) st.parts.push({ r: (0.12 + rnd() * 0.32) * Math.min(W, H), sp: (0.2 + rnd() * 0.5) * (rnd() > 0.5 ? 1 : -1), ph: rnd() * 7, s: 1.5 + rnd() * 2.5 });
      }
    }

    if (kind === "flow") {
      ctx.fillStyle = "rgba(6,7,12,0.07)"; ctx.fillRect(0, 0, W, H);
      for (const p of st.parts) {
        const a = Math.sin(p.x * 0.004 + t * 0.00035 + st.seedPh) + Math.cos(p.y * 0.004 - t * 0.00028);
        p.x += Math.cos(a * 2.2) * 1.4 * DPR; p.y += Math.sin(a * 2.2) * 1.4 * DPR;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0; if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.fillStyle = lav(0.55);
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.1 * DPR, 0, 7); ctx.fill();
      }
      return;
    }
    if (kind === "field") {
      ctx.fillStyle = "rgba(6,7,12,0.16)"; ctx.fillRect(0, 0, W, H);
      const px = st.pointer.x, py = st.pointer.y;
      for (const p of st.parts) {
        const dx = p.x - px, dy = p.y - py, d2 = dx * dx + dy * dy;
        if (d2 < 14400 * DPR * DPR && d2 > 1) {
          const d = Math.sqrt(d2), f = (120 * DPR - d) / (120 * DPR);
          p.vx += (dx / d) * f * 1.6; p.vy += (dy / d) * f * 1.6;
        }
        p.vx *= 0.94; p.vy *= 0.94;
        p.x += p.vx + Math.sin(t * 0.001 + p.y * 0.01) * 0.3;
        p.y += p.vy + Math.cos(t * 0.001 + p.x * 0.01) * 0.3;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0; if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.fillStyle = lav(0.7);
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.4 * DPR, 0, 7); ctx.fill();
      }
      return;
    }
    if (kind === "wave") {
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      const layers = [[lav, 0.75, 1], ["rgba(187,149,246,", 0.5, 1.7], [rose, 0.4, 2.6]];
      layers.forEach(([col, al, fq], li) => {
        ctx.strokeStyle = typeof col === "function" ? col(al) : col + al + ")";
        ctx.lineWidth = 1.6 * DPR; ctx.beginPath();
        for (let x = 0; x <= W; x += 4 * DPR) {
          const y = H / 2 + Math.sin(x * 0.008 * fq + t * 0.0016 + li * 1.7) * H * 0.16
            + Math.sin(x * 0.02 * fq - t * 0.0011) * H * 0.05;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      });
      return;
    }
    if (kind === "grid") {
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      const nx = 13, ny = 16, cx = W / 2, cy = H / 2;
      for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
        const x = (i + 0.5) / nx * W, y = (j + 0.5) / ny * H;
        const d = Math.hypot(x - cx, y - cy) / (Math.min(W, H) * 0.7);
        const r = (1.2 + 2.6 * Math.max(0, Math.sin(d * 9 - t * 0.0022))) * DPR;
        ctx.fillStyle = lav(0.16 + 0.5 * Math.max(0, Math.sin(d * 9 - t * 0.0022)));
        ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
      }
      return;
    }
    if (kind === "orbit") {
      ctx.fillStyle = "rgba(6,7,12,0.10)"; ctx.fillRect(0, 0, W, H);
      const cx = W / 2, cy = H / 2;
      ctx.strokeStyle = "rgba(198,165,250,0.10)";
      st.parts.forEach(o => { ctx.beginPath(); ctx.arc(cx, cy, o.r, 0, 7); ctx.stroke(); });
      st.parts.forEach((o, i) => {
        const a = o.ph + t * 0.0009 * o.sp;
        const x = cx + Math.cos(a) * o.r, y = cy + Math.sin(a) * o.r;
        ctx.fillStyle = i % 2 ? rose(0.85) : lav(0.85);
        ctx.beginPath(); ctx.arc(x, y, o.s * DPR, 0, 7); ctx.fill();
      });
      return;
    }
  }

  /* ════════════ STACK CONSTELLATION ════════════ */
  function initStack() {
    const canvas = byId("stack-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const nodes = C.stack.nodes.map((n, i) => Object.assign({ i }, n));
    const rnd = mulberry32(42);
    let W = 0, H = 0, hover = -1;
    function layout() {
      const r = canvas.getBoundingClientRect();
      W = canvas.width = Math.round(r.width * DPR);
      H = canvas.height = Math.round(r.height * DPR);
      nodes.forEach((nd, i) => {
        if (nd.x === undefined) {
          const cols = 4, rows = 3;
          const cx = (i % cols + 0.5 + (rnd() - 0.5) * 0.5) / cols;
          const cy = (Math.floor(i / cols) + 0.5 + (rnd() - 0.5) * 0.5) / rows;
          nd.x = cx * W; nd.y = cy * H;
          nd.vx = (rnd() - 0.5) * 0.25 * DPR; nd.vy = (rnd() - 0.5) * 0.25 * DPR;
        } else { nd.x *= W / (nd.pw || W); nd.y *= H / (nd.ph || H); }
        nd.pw = W; nd.ph = H;
      });
    }
    layout();
    if (window.ResizeObserver) new ResizeObserver(layout).observe(canvas);
    function toLocal(e) {
      const r = canvas.getBoundingClientRect();
      return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H };
    }
    function show(i) {
      const name = byId("stack-readout-name"), note = byId("stack-readout-note");
      if (i >= 0) {
        if (name) name.textContent = nodes[i].name;
        if (note) note.textContent = "— " + nodes[i].note;
      } else {
        if (name) name.textContent = C.stack.hint;
        if (note) note.textContent = "";
      }
    }
    canvas.addEventListener("pointermove", e => {
      const p = toLocal(e);
      let best = -1, bd = 46 * DPR;
      nodes.forEach((nd, i) => {
        const d = Math.hypot(nd.x - p.x, nd.y - p.y);
        if (d < bd) { bd = d; best = i; }
      });
      if (best !== hover) { hover = best; show(best); }
    });
    canvas.addEventListener("pointerleave", () => { hover = -1; show(-1); });
    canvas.addEventListener("click", e => {
      const p = toLocal(e);
      nodes.forEach((nd, i) => {
        if (Math.hypot(nd.x - p.x, nd.y - p.y) < 60 * DPR) show(i);
      });
    });
    sketches.push({
      canvas, ctx, kind: "stack", t: 0, rnd,
      tickOverride(dt) {
        this.t += dt;
        ctx.fillStyle = "rgba(9,11,18,0.28)"; ctx.fillRect(0, 0, W, H);
        nodes.forEach(nd => {
          nd.x += nd.vx + Math.sin(this.t * 0.0004 + nd.i) * 0.12 * DPR;
          nd.y += nd.vy + Math.cos(this.t * 0.0004 + nd.i * 1.3) * 0.12 * DPR;
          if (nd.x < 40 * DPR || nd.x > W - 40 * DPR) nd.vx *= -1;
          if (nd.y < 40 * DPR || nd.y > H - 40 * DPR) nd.vy *= -1;
        });
        ctx.lineWidth = 1;
        for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 170 * DPR) {
            ctx.strokeStyle = "rgba(198,165,250," + (0.14 * (1 - d / (170 * DPR))).toFixed(3) + ")";
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        nodes.forEach((nd, i) => {
          const hot = i === hover;
          const r = (hot ? 9 : 6) * DPR;
          ctx.fillStyle = hot ? "rgba(238,153,205,0.25)" : "rgba(198,165,250,0.12)";
          ctx.beginPath(); ctx.arc(nd.x, nd.y, r * 1.9, 0, 7); ctx.fill();
          ctx.fillStyle = hot ? "#ee99cd" : "#c6a5fa";
          ctx.beginPath(); ctx.arc(nd.x, nd.y, r * 0.55, 0, 7); ctx.fill();
          ctx.strokeStyle = hot ? "rgba(238,153,205,0.8)" : "rgba(198,165,250,0.45)";
          ctx.beginPath(); ctx.arc(nd.x, nd.y, r, 0, 7); ctx.stroke();
          ctx.fillStyle = hot ? "rgba(244,240,250,0.95)" : "rgba(196,194,206,0.75)";
          ctx.font = (hot ? 600 : 400) + " " + Math.round(11 * DPR) + "px 'IBM Plex Mono', monospace";
          ctx.textAlign = "center";
          ctx.fillText(nd.name, nd.x, nd.y + r + 16 * DPR);
        });
      }
    });
  }

  /* ════════════ TERMINAL DEMO ════════════ */
  const TERM_SCRIPT = [
    { t: "$ farooq deploy --workspace crm", c: "t-acc" },
    { t: "▸ resolving pipelines ............. done", c: "" },
    { t: "▸ building workflows .............. done", c: "" },
    { t: "▸ wiring automations .............. done", c: "" },
    { t: "▸ deploying to workspace .......... live", c: "t-ok" },
    { t: "", c: "" },
    { t: "$ open crm workspace", c: "t-acc" },
    { t: "→ CRM is live · 38ms · production", c: "t-dim" }
  ];
  function initTerminal() {
    $$("[data-term]").forEach(box => {
      const pre = box.querySelector(".exp-term");
      if (!pre) return;
      let timer = [], started = false;
      function play() {
        timer.forEach(clearTimeout); timer = [];
        pre.innerHTML = "";
        let delay = 0;
        TERM_SCRIPT.forEach(line => {
          const div = document.createElement("div");
          if (line.c) div.className = line.c;
          pre.appendChild(div);
          line.t.split("").forEach(ch => {
            timer.push(setTimeout(() => { div.textContent += ch; }, delay));
            delay += 14 + Math.random() * 26;
          });
          delay += 160;
        });
      }
      box.addEventListener("click", play);
      box.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); play(); } });
      new IntersectionObserver((es, io) => {
        es.forEach(e => { if (e.isIntersecting && !started) { started = true; play(); io.disconnect(); } });
      }, { threshold: 0.4 }).observe(box);
    });
  }

  /* ════════════ FILM MODAL ════════════ */
  let modalLastFocus = null;
  function openModal(p) {
    const modal = byId("film-modal");
    if (!modal || !p) return;
    const set = (id, v) => { const el = byId(id); if (el) el.textContent = v; };
    set("modal-title", "CASE STUDY · " + p.title);
    const img = byId("modal-img");
    if (img) { img.src = p.image; img.alt = p.imageAlt; }
    set("modal-caption", p.duration + " · CASE STUDY");
    set("modal-scope", p.scope);
    set("modal-headline", p.headline);
    set("modal-desc", p.description);
    const tags = byId("modal-tags");
    if (tags) tags.innerHTML = p.tags.map(t => '<span class="chip">' + t + "</span>").join("");
    modalLastFocus = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    const close = byId("modal-close");
    if (close) close.focus();
  }
  function closeModal() {
    const modal = byId("film-modal");
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.style.overflow = "";
    if (modalLastFocus && modalLastFocus.focus) modalLastFocus.focus();
  }
  function initModal() {
    const modal = byId("film-modal");
    if (!modal) return;
    const close = byId("modal-close"), scrim = byId("modal-scrim");
    if (close) close.addEventListener("click", closeModal);
    if (scrim) scrim.addEventListener("click", closeModal);
    window.addEventListener("keydown", e => {
      if (e.key === "Escape" && !modal.hidden) closeModal();
      if (e.key === "Tab" && !modal.hidden) {
        const box = modal.querySelector(".modal-box");
        if (!box) return;
        const f = Array.from(box.querySelectorAll("button, a[href]")).filter(el => !el.disabled && el.offsetParent !== null);
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ════════════ CONTACT FORM → mailto ════════════ */
  function initForm() {
    const form = byId("brief-form");
    if (!form) return;
    form.addEventListener("submit", e => {
      e.preventDefault();
      const honey = byId("f-honeypot");
      if (honey && honey.value) return; // bot trap: silently accept
      let ok = true;
      const checks = [
        ["f-name", v => v.trim().length > 1],
        ["f-email", v => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)],
        ["f-msg", v => v.trim().length > 3]
      ];
      checks.forEach(([id, test]) => {
        const el = byId(id);
        if (!el) return;
        const valid = test(el.value);
        el.closest(".field").classList.toggle("invalid", !valid);
        if (!valid) ok = false;
      });
      if (!ok) {
        const firstBad = form.querySelector(".field.invalid input, .field.invalid textarea");
        if (firstBad) firstBad.focus();
        return;
      }
      const val = id => byId(id).value.trim();
      const type = byId("f-type");
      const subject = "Project brief — " + (type ? type.value : "") + " — " + val("f-name");
      const body = "Name: " + val("f-name") + "\nPhone: " + val("f-phone") +
        "\nEmail: " + val("f-email") + "\nBrand / company: " + val("f-company") +
        "\nService: " + (type ? type.value : "") + "\n\nThe idea:\n" + val("f-msg") +
        "\n\n— sent from farooq portfolio (prototype form)";
      const label = byId("form-submit-label");
      if (label) label.textContent = "Opening email…";
      window.location.href = "mailto:" + C.profile.email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      setTimeout(() => { if (label) label.textContent = C.contact.form.submitLabel; }, 2500);
    });
    ["f-name", "f-email", "f-msg"].forEach(id => {
      const el = byId(id);
      if (el) el.addEventListener("input", () => el.closest(".field").classList.remove("invalid"));
    });
  }

  /* ════════════ MASTER LOOP ════════════ */
  let fieldGL = null, lastT = 0;
  function masterLoop(t) {
    requestAnimationFrame(masterLoop);
    if (document.documentElement.classList.contains("paused") || reducedMotion ||
        document.documentElement.classList.contains("reduced")) return;
    if (document.hidden) { lastT = t; return; }
    const dt = Math.min(50, t - (lastT || t)); lastT = t;
    if (fieldGL) fieldGL.draw(t);
    sketches.forEach(st => {
      const r = st.canvas.getBoundingClientRect();
      if (r.bottom < -80 || r.top > window.innerHeight + 80) return;
      if (st.tickOverride) st.tickOverride(dt);
      else sketchTick(st, dt);
    });
  }

  /* ════════════ INIT ════════════ */
  function init() {
    renderIntroText(); renderHero(); renderMarquee(); renderFilms(); renderPrinciples();
    renderEngine(); renderWorlds(); renderCapabilities(); renderDigital();
    renderArchive(); renderProcess(); renderStudio();
    renderStackBand(); renderFaq(); renderContact(); renderFooter();
    heroImgs = $$("#hero-frames img");
    chapterBtns = $$("#hero-chapters button");
    engineImgs = $$("#engine-frame img");
    engineTlFills = $$("[data-tl]");
    engineTlItems = $$("#engine-timeline li");
    worldArticles = $$("[data-world]");
    heroWipe = byId("hero-wipe");
    heroContent = byId("hero-content");
    heroChapterWord = byId("hero-chapter-word");
    setEngineStage(0, true);
    initHeader(); initReveals(); initSpy(); initTerminal(); initModal(); initForm();
    const skip = byId("engine-skip");
    if (skip) skip.addEventListener("click", () => {
      const wrap = $(".engine-pin-wrap");
      if (wrap) window.scrollTo({ top: wrap.offsetTop + wrap.offsetHeight - window.innerHeight + 2, behavior: reducedMotion ? "auto" : "smooth" });
    });
    fieldGL = initSmoke(byId("matter-field"), { scale: 0.3, octaves: 4, density: 0.42, speed: 0.8, seed: 3.1 });
    $$("canvas[data-sketch]").forEach((c, i) => registerSketch(c, c.dataset.sketch, 1000 + i * 77));
    initStack();
    window.addEventListener("scroll", onScrollLoop, { passive: true });
    window.addEventListener("resize", onScrollLoop);
    onScrollLoop();
    requestAnimationFrame(masterLoop);
    if (reducedMotion) {
      sketches.forEach(st => { st.tickOverride ? st.tickOverride(16) : sketchTick(st, 16); });
    }
    runIntro();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
