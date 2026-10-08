// Space theme. Layers, back to front:
//   1. deep sky  — baked once: procedural nebulae, a Milky Way band with dust lanes, thousands of faint
//                  stars and a few distant galaxies. Scrolls slowly (furthest layer).
//   2. vignette  — darkens the edges for depth.
//   3. stars     — animated: twinkling stars at different depths (parallax with mouse + scroll), bright stars
//                  with diffraction spikes, shooting stars, and hyperspace streaks when scrolling fast.
//   4. planet    — a ringed gas giant that rises as you scroll.
//   + a small flight HUD on long pages.
(function () {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const TAU = Math.PI * 2;

  const style = document.createElement("style");
  style.textContent = `
    .ambient, .bg { display: none !important; }
    .sp-deep, .sp-vig, .sp-stars, .sp-planet { position: fixed; z-index: -1; pointer-events: none; }
    .sp-deep { left: 0; top: 0; will-change: transform; }
    .sp-vig { inset: 0; background: radial-gradient(ellipse at 50% 45%, transparent 50%, rgba(0,0,2,.6) 100%); }
    .sp-stars { inset: 0; width: 100vw; height: 100vh; }
    .sp-planet { will-change: transform; opacity: .9; }
    @media (max-width: 700px) { .sp-planet { opacity: .45; } }
    .sp-hud { position: fixed; left: 20px; bottom: 18px; z-index: 15; pointer-events: none; font: 500 10.5px/1.7 var(--mono, monospace);
      letter-spacing: .12em; text-transform: uppercase; color: rgba(200,205,230,.55); padding: 10px 14px; border-radius: 10px;
      background: rgba(8,10,22,.45); border: 1px solid rgba(255,255,255,.06); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
    .sp-hud b { color: var(--accent, #f97316); font-weight: 500; }
    .sp-hud i { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #4ade80; margin-right: 6px; box-shadow: 0 0 6px #4ade80; animation: hudp 1.6s infinite; }
    @keyframes hudp { 50% { opacity: .3; } }
    @media (max-width: 760px) { .sp-hud { display: none; } }
  `;
  document.head.appendChild(style);

  const mk = (tag, cls) => Object.assign(document.createElement(tag), { className: cls });
  const deep = mk("canvas", "sp-deep"), vig = mk("div", "sp-vig"), stars = mk("canvas", "sp-stars"), planet = mk("canvas", "sp-planet");
  document.body.prepend(deep, vig, stars, planet);
  const dctx = deep.getContext("2d"), sctx = stars.getContext("2d"), pctx = planet.getContext("2d");

  const scroller = document.scrollingElement || document.documentElement;
  const scrollable = () => scroller.scrollHeight - innerHeight > 200;
  let hud = null;

  /* ---------- seeded randomness + value noise (same sky on every page and reload) ---------- */
  function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const R0 = rng(20010215);
  const PERM = new Uint8Array(512), VAL = new Float32Array(256);
  (() => { const p = [...Array(256).keys()]; for (let i = 255; i > 0; i--) { const j = (R0() * (i + 1)) | 0; [p[i], p[j]] = [p[j], p[i]]; }
    for (let i = 0; i < 512; i++) PERM[i] = p[i & 255]; for (let i = 0; i < 256; i++) VAL[i] = R0(); })();
  const fade = t => t * t * (3 - 2 * t);
  function vnoise(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = fade(xf), v = fade(yf);
    const X = xi & 255, Y = yi & 255;
    const a = VAL[PERM[PERM[X] + Y]], b = VAL[PERM[PERM[X + 1] + Y]], c = VAL[PERM[PERM[X] + Y + 1]], d = VAL[PERM[PERM[X + 1] + Y + 1]];
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }
  function fbm(x, y, oct = 5) { let s = 0, a = 0.5, f = 1; for (let i = 0; i < oct; i++) { s += a * vnoise(x * f, y * f); f *= 2.02; a *= 0.5; } return s / (1 - Math.pow(0.5, oct)); }
  const sstep = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const gauss = (d, s) => Math.exp(-(d * d) / (2 * s * s));

  /* ---------- 1. bake the deep sky ---------- */
  let W, H, DH, dpr, PS, bakedFor = "";
  function bandDist(u, v, aspect) { // distance from the Milky Way's centre line (runs bottom-left → top-right)
    const x = u * aspect, y = v, x0 = -0.1 * aspect, y0 = 0.92, x1 = 1.1 * aspect, y1 = 0.08;
    const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy);
    return Math.abs((x - x0) * dy - (y - y0) * dx) / len;
  }
  function bakeDeep() {
    const key = W + "x" + DH;
    if (key === bakedFor) return; bakedFor = key;
    const ddpr = Math.min(devicePixelRatio || 1, 1.5);
    deep.width = W * ddpr; deep.height = DH * ddpr;
    Object.assign(deep.style, { width: W + "px", height: DH + "px" });

    // low-res colour field, upscaled = soft gas clouds
    const SC = 4, w = Math.ceil(W / SC), h = Math.ceil(DH / SC), aspect = w / h;
    const img = new ImageData(w, h), px = img.data;
    const clouds = [ // [u, v, radius, colourA, colourB, strength]
      [0.1, 0.1, 0.27, [92, 72, 210], [40, 110, 220], 0.95],
      [0.95, 0.5, 0.21, [200, 50, 150], [245, 120, 60], 0.8],
      [0.30, 0.92, 0.26, [30, 140, 175], [70, 90, 220], 0.7],
      [0.70, 0.05, 0.18, [120, 60, 190], [210, 80, 160], 0.45],
    ];
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const u = i / w, v = j / h, X = u * aspect * 3, Y = v * 3;
      const qx = fbm(X + 1.7, Y + 9.2, 4), qy = fbm(X + 8.3, Y + 2.8, 4);
      const n = fbm(X + 2.2 * qx, Y + 2.2 * qy); // domain-warped → wispy filaments
      let r = 5, g = 6, b = 14;

      // Milky Way
      const d = bandDist(u, v, aspect), band = gauss(d, 0.16), core = gauss(d, 0.055);
      const mw = fbm(X * 2.4 + 5, Y * 2.4 + 3);
      const dust = core * sstep(0.42, 0.72, fbm(X * 3.2 + qx * 2, Y * 3.2 + 11)) + band * 0.35 * sstep(0.55, 0.8, n);
      const glow = band * (0.15 + 0.85 * mw * mw) * (1 - Math.min(dust, 0.9)) * 0.5;
      const warm = core * 0.8;
      r += glow * (170 + 85 * warm); g += glow * (180 + 45 * warm); b += glow * (235 - 40 * warm);

      // emission nebulae
      const neb = sstep(0.46, 0.92, n) ** 1.6;
      for (const [cu, cv, cr, A, B, k] of clouds) {
        const m = gauss(Math.hypot((u - cu) * aspect, v - cv), cr) * k;
        if (m < 0.01) continue;
        const t = qx, s = neb * m * (1 - dust * 0.6) * 0.8;
        r += s * (A[0] + (B[0] - A[0]) * t); g += s * (A[1] + (B[1] - A[1]) * t); b += s * (A[2] + (B[2] - A[2]) * t);
      }
      const o = (j * w + i) * 4; px[o] = r; px[o + 1] = g; px[o + 2] = b; px[o + 3] = 255;
    }
    const tmp = document.createElement("canvas"); tmp.width = w; tmp.height = h; tmp.getContext("2d").putImageData(img, 0, 0);
    const c = dctx; c.setTransform(ddpr, 0, 0, ddpr, 0, 0);
    c.imageSmoothingEnabled = true; c.imageSmoothingQuality = "high";
    c.drawImage(tmp, 0, 0, W, DH);

    // faint background stars — much denser inside the Milky Way
    const R = rng(7);
    const tries = Math.floor((W * DH) / 260);
    for (let k = 0; k < tries; k++) {
      const x = R() * W, y = R() * DH, bd = gauss(bandDist(x / W, y / DH, aspect), 0.14);
      if (R() > 0.12 + bd * 0.88) continue;
      const a = 0.12 + R() ** 2 * 0.6, s = R() < 0.92 ? 0.7 : 1.3, tint = R();
      c.globalAlpha = a;
      c.fillStyle = tint < 0.15 ? "#ffd9b0" : tint < 0.35 ? "#c8d6ff" : "#ffffff";
      c.fillRect(x, y, s, s);
    }
    // distant galaxies
    for (let k = 0; k < 5; k++) {
      const x = W * (0.08 + R() * 0.84), y = DH * (0.06 + R() * 0.88), size = 8 + R() * 18, rot = R() * Math.PI, flat = 0.25 + R() * 0.4;
      c.save(); c.translate(x, y); c.rotate(rot); c.scale(1, flat);
      const g = c.createRadialGradient(0, 0, 0, 0, 0, size);
      g.addColorStop(0, "rgba(255,240,215,.75)"); g.addColorStop(0.18, "rgba(230,215,255,.35)"); g.addColorStop(1, "rgba(140,160,255,0)");
      c.globalAlpha = 0.55 + R() * 0.3; c.fillStyle = g; c.beginPath(); c.arc(0, 0, size, 0, TAU); c.fill(); c.restore();
    }
    c.globalAlpha = 1;
  }

  /* ---------- 3. animated stars ---------- */
  let field = [], shooters = [], mx = 0, my = 0, px = 0, py = 0, lastScroll = scrollY, vel = 0, frameNo = 0;
  const palette = ["255,255,255", "255,255,255", "255,255,255", "205,218,255", "170,192,255", "255,222,180", "255,190,150"];
  function makeField() {
    const R = rng(42), n = Math.min(Math.floor((W * H) / 6500), 300);
    field = Array.from({ length: n }, () => {
      const z = R() ** 2 * 0.9 + 0.1;
      return { x: R() * W, y: R() * H, z, r: z * 1.2 + 0.25, c: palette[(R() * palette.length) | 0], ph: R() * TAU, sp: 0.4 + R() * 1.8, spike: z > 0.86 && R() < 0.6 };
    });
  }

  /* ---------- 4. planet ---------- */
  const bandCols = ["#d9b48a", "#b98a62", "#ead2b0", "#9c7354", "#c79b70", "#e6c49a", "#8a6248", "#d4a77c", "#f0dcc0", "#a87d5c"];
  const bands = [];
  { const R = rng(99); for (let y = 0; y < 1; ) { const h = 0.035 + R() * 0.08; bands.push({ y, col: bandCols[bands.length % bandCols.length], a: 1.5 + R() * 3, f: 2 + R() * 5, s: 0.2 + R() * 0.5 }); y += h; } }
  const rings = [{ r: 1.36, w: .05, a: .22 }, { r: 1.47, w: .11, a: .5 }, { r: 1.6, w: .04, a: .16 }, { r: 1.7, w: .1, a: .4 }, { r: 1.83, w: .035, a: .2 }, { r: 1.92, w: .02, a: .12 }];

  function drawRing(c, R, sq, front) {
    for (const b of rings) {
      c.beginPath(); c.ellipse(0, 0, R * b.r, R * b.r * sq, 0, front ? 0 : Math.PI, front ? Math.PI : TAU);
      c.lineWidth = R * b.w * 0.55; c.strokeStyle = `rgba(222,198,165,${front ? b.a : b.a * 0.75})`; c.stroke();
    }
  }
  function drawPlanet(t, p) {
    const c = pctx, S = PS, cx = S / 2, cy = S / 2, R = S * 0.25, tilt = -0.42 + p * 0.18, sq = 0.22 + p * 0.06;
    c.clearRect(0, 0, S, S);
    c.save(); c.translate(cx, cy); c.rotate(tilt); drawRing(c, R, sq, false); c.restore();
    c.save(); c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.clip();
    c.save(); c.translate(cx, cy); c.rotate(tilt);
    for (const b of bands) {
      const y0 = -R + b.y * 2 * R;
      c.beginPath(); c.moveTo(-R - 4, R + 4);
      for (let x = -R - 4; x <= R + 4; x += 6) c.lineTo(x, y0 + Math.sin(x / R * b.f + t / 1000 * b.s) * b.a);
      c.lineTo(R + 4, R + 4); c.closePath(); c.fillStyle = b.col; c.fill();
    }
    const sx = ((t / 1000 * 0.05 + 0.2) % 2 - 1) * R * 1.3;
    c.globalAlpha = Math.max(0, Math.cos(sx / R * 1.2)) * 0.8;
    c.beginPath(); c.ellipse(sx, R * 0.28, R * 0.17 * Math.max(.2, Math.cos(sx / R)), R * 0.075, 0, 0, TAU); c.fillStyle = "#c0643f"; c.fill();
    c.globalAlpha = 1;
    c.beginPath(); c.ellipse(0, R * 0.05, R * 1.6, R * 1.6 * sq * 0.55, 0, 0, TAU); c.lineWidth = R * 0.05; c.strokeStyle = "rgba(10,8,20,.35)"; c.stroke();
    c.restore();
    let g = c.createRadialGradient(cx - R * .5, cy - R * .55, R * .05, cx - R * .2, cy - R * .2, R * 1.45);
    g.addColorStop(0, "rgba(255,244,225,.22)"); g.addColorStop(.4, "rgba(0,0,0,0)"); g.addColorStop(.72, "rgba(5,6,14,.62)"); g.addColorStop(1, "rgba(5,6,14,.97)");
    c.fillStyle = g; c.fillRect(0, 0, S, S);
    g = c.createRadialGradient(cx, cy, R * .7, cx, cy, R);
    g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,.4)");
    c.fillStyle = g; c.fillRect(0, 0, S, S);
    c.restore();
    c.save(); c.translate(cx, cy); c.rotate(tilt); drawRing(c, R, sq, true); c.restore();
    c.save(); c.beginPath(); c.arc(cx, cy, R + 1, Math.PI * .92, Math.PI * 1.82);
    c.strokeStyle = "rgba(253,200,150,.35)"; c.lineWidth = 1.5; c.shadowColor = "rgba(249,115,22,.7)"; c.shadowBlur = 22; c.stroke(); c.restore();
  }

  /* ---------- sizing ---------- */
  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    DH = scrollable() ? Math.round(H * 1.5) : H;
    stars.width = W * dpr; stars.height = H * dpr; sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    PS = W < 700 ? 320 : 560;
    planet.width = planet.height = PS * dpr; pctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    Object.assign(planet.style, { width: PS + "px", height: PS + "px", right: -PS * 0.3 + "px", top: H - PS * 0.62 + "px" });
    makeField(); bakeDeep();
    if (scrollable() && !hud) { hud = mk("div", "sp-hud"); document.body.appendChild(hud); }
    if (reduce) draw(0);
  }

  /* ---------- frame ---------- */
  function draw(t) {
    frameNo++;
    const sY = scrollY, max = Math.max(1, scroller.scrollHeight - H), p = scrollable() ? Math.min(sY / max, 1) : 0;
    vel += ((sY - lastScroll) - vel) * 0.2; lastScroll = sY;
    const warp = reduce ? 0 : Math.min(Math.abs(vel) / 45, 1);
    px += (mx - px) * 0.05; py += (my - py) * 0.05;

    deep.style.transform = `translate3d(${-px * 6}px, ${-p * (DH - H) - py * 6}px, 0)`;

    sctx.clearRect(0, 0, W, H);
    for (const s of field) {
      if (!reduce) s.y -= s.z * 0.04;
      const tw = reduce ? 0.8 : 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t / 1000 * s.sp + s.ph));
      const x = ((s.x + px * s.z * 30) % W + W) % W;
      const y = (((s.y - sY * s.z * 0.4 + py * s.z * 30) % H) + H) % H;
      const a = Math.min(1, tw * (0.35 + s.z * 0.65) + warp * 0.4);
      sctx.globalAlpha = a; sctx.fillStyle = sctx.strokeStyle = `rgb(${s.c})`;
      if (warp > 0.06) {
        const len = Math.max(-160, Math.min(160, vel * s.z * 2.4));
        sctx.lineWidth = s.r * 1.1; sctx.beginPath(); sctx.moveTo(x, y); sctx.lineTo(x, y + len); sctx.stroke();
        continue;
      }
      sctx.beginPath(); sctx.arc(x, y, s.r, 0, TAU); sctx.fill();
      if (s.z > 0.7) { // halo
        const g = sctx.createRadialGradient(x, y, 0, x, y, s.r * 5);
        g.addColorStop(0, `rgba(${s.c},${0.35 * a})`); g.addColorStop(1, `rgba(${s.c},0)`);
        sctx.globalAlpha = 1; sctx.fillStyle = g; sctx.beginPath(); sctx.arc(x, y, s.r * 5, 0, TAU); sctx.fill();
      }
      if (s.spike) { // telescope diffraction spikes
        const L = s.r * (7 + 5 * tw);
        sctx.globalAlpha = a * 0.55; sctx.lineWidth = 0.7;
        sctx.beginPath(); sctx.moveTo(x - L, y); sctx.lineTo(x + L, y); sctx.moveTo(x, y - L); sctx.lineTo(x, y + L); sctx.stroke();
      }
    }
    for (const m of shooters) {
      m.x += m.vx; m.y += m.vy; m.life -= 0.016;
      const g = sctx.createLinearGradient(m.x, m.y, m.x - m.vx * 10, m.y - m.vy * 10);
      g.addColorStop(0, `rgba(255,255,255,${Math.max(m.life, 0)})`); g.addColorStop(0.3, `rgba(190,210,255,${Math.max(m.life, 0) * 0.5})`); g.addColorStop(1, "rgba(255,255,255,0)");
      sctx.globalAlpha = 1; sctx.strokeStyle = g; sctx.lineWidth = 1.6;
      sctx.beginPath(); sctx.moveTo(m.x, m.y); sctx.lineTo(m.x - m.vx * 10, m.y - m.vy * 10); sctx.stroke();
      sctx.fillStyle = `rgba(255,255,255,${Math.max(m.life, 0)})`; sctx.beginPath(); sctx.arc(m.x, m.y, 1.3, 0, TAU); sctx.fill();
    }
    shooters = shooters.filter(m => m.life > 0 && m.x < W + 80 && m.y < H + 80);
    sctx.globalAlpha = 1;

    drawPlanet(t, p);
    planet.style.transform = `translate3d(${-px * 18}px, ${-p * H * 0.42 - py * 18}px, 0) scale(${1 + p * 0.25})`;

    if (hud && frameNo % 5 === 0) {
      let sector = "launchpad";
      document.querySelectorAll("main section[id]").forEach(s => { if (s.getBoundingClientRect().top < H * 0.5) sector = s.id; });
      hud.innerHTML = `<i></i>sector <b>${sector}</b><br>altitude <b>${Math.round(sY * 7.3).toLocaleString()} km</b><br>velocity <b>${(Math.abs(vel) * 0.42).toFixed(1)} km/s</b>`;
    }
    if (!reduce) requestAnimationFrame(draw);
  }

  function shoot() {
    if (!document.hidden) {
      const sp = 9 + Math.random() * 6;
      shooters.push({ x: Math.random() * W * 0.8, y: Math.random() * H * 0.35, vx: sp, vy: sp * (0.35 + Math.random() * 0.3), life: 1.1 });
    }
    setTimeout(shoot, 3500 + Math.random() * 6000);
  }

  let rt; addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(resize, 150); });
  addEventListener("pointermove", e => { mx = e.clientX / W - 0.5; my = e.clientY / H - 0.5; });
  if (reduce) addEventListener("scroll", () => draw(0), { passive: true });
  resize();
  if (!reduce) { requestAnimationFrame(draw); setTimeout(shoot, 1800); }
})();
