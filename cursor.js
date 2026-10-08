// Space cursor: a little rocket that flies toward the pointer (flame + exhaust trail), an orbit ring with a
// satellite, context labels, star bursts on click and magnetic buttons. Mouse devices only.
(function () {
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;

  const style = document.createElement("style");
  style.textContent = `
    html.has-cursor, html.has-cursor * { cursor: none !important; }
    .cur-rocket, .cur-ring, .cur-trail { position: fixed; left: 0; top: 0; pointer-events: none; z-index: 9999; }
    .cur-trail { width: 100vw; height: 100vh; z-index: 9990; }
    .cur-rocket { width: 0; height: 0; transition: opacity .2s; }
    .cur-rocket svg { position: absolute; left: -11px; top: -13px; width: 22px; height: 29px; overflow: visible; transition: transform .25s;
      filter: drop-shadow(0 0 6px rgba(249,115,22,.55)); }
    .cur-rocket.small svg { transform: scale(.65); }
    .cur-rocket .flame { transform-origin: 12px 22px; transform: scaleY(var(--f, .6)); }
    .cur-ring { width: 0; height: 0; }
    .cur-ring .r { position: absolute; left: 50%; top: 50%; width: 38px; height: 38px; border-radius: 50%; border: 1px dashed rgba(255,255,255,.28);
      transform: translate(-50%, -50%) scale(var(--s, 1)); display: grid; place-items: center;
      transition: width .28s cubic-bezier(.2,.8,.2,1), height .28s cubic-bezier(.2,.8,.2,1), border-radius .28s, background .25s, border-color .25s, transform .15s; }
    .cur-ring .t { font: 600 11px/1 var(--mono, monospace); letter-spacing: .06em; text-transform: uppercase; color: #0a0a0a; opacity: 0; transition: opacity .2s; white-space: nowrap; }
    .cur-ring .sat { position: absolute; inset: -4px; border-radius: 50%; animation: cursat 3.6s linear infinite; transition: opacity .2s; }
    .cur-ring .sat::before { content: ""; position: absolute; left: 50%; top: 0; width: 5px; height: 5px; margin-left: -2.5px; border-radius: 50%; background: #fff; box-shadow: 0 0 8px 1px var(--accent, #f97316); }
    @keyframes cursat { to { transform: rotate(360deg); } }
    .cur-ring.hover .r { width: 64px; height: 64px; border-style: solid; border-color: var(--accent, #f97316); background: color-mix(in srgb, var(--accent, #f97316) 12%, transparent); }
    .cur-ring.label .r { width: 84px; height: 84px; border: 0; background: var(--accent, #f97316); }
    .cur-ring.label .t { opacity: 1; }
    .cur-ring.label .sat, .cur-ring.block .sat { opacity: 0; }
    .cur-ring.block .r { width: 11px; height: 22px; border-radius: 2px; border: 0; background: color-mix(in srgb, var(--accent, #f97316) 55%, transparent); animation: curblink 1.1s steps(1) infinite; }
    @keyframes curblink { 50% { opacity: .25; } }
    .cur-rocket.hide, .cur-ring.hide, body.cur-big .cur-rocket { opacity: 0; }
    .cur-ripple { position: fixed; z-index: 9995; pointer-events: none; width: 14px; height: 14px; margin: -7px 0 0 -7px; border-radius: 50%;
      border: 2px solid var(--accent, #f97316); animation: curripple .6s ease-out forwards; }
    @keyframes curripple { to { transform: scale(7); opacity: 0; } }
  `;
  document.head.appendChild(style);
  root.classList.add("has-cursor");

  const rocket = Object.assign(document.createElement("div"), { className: "cur-rocket hide" });
  rocket.innerHTML = `<svg viewBox="0 0 24 32" aria-hidden="true">
    <g class="flame"><path d="M8.5 22 Q12 34 15.5 22Z" fill="#f97316"/><path d="M10.2 22 Q12 29 13.8 22Z" fill="#fde68a"/></g>
    <path d="M7 17 L2 26 L7.5 23.5Z" fill="#f97316"/><path d="M17 17 L22 26 L16.5 23.5Z" fill="#f97316"/>
    <path d="M12 1 C17.5 7 18.5 15 17 22.5 L7 22.5 C5.5 15 6.5 7 12 1Z" fill="#e8eaf6"/>
    <path d="M12 1 C17.5 7 18.5 15 17 22.5 L12 22.5Z" fill="#c7cbea"/>
    <circle cx="12" cy="11" r="2.8" fill="#6366f1" stroke="#fff" stroke-width="1"/></svg>`;
  const flame = rocket.querySelector(".flame");
  const ring = document.createElement("div"); ring.className = "cur-ring hide";
  ring.innerHTML = '<div class="r"><span class="t"></span><i class="sat"></i></div>';
  const label = ring.querySelector(".t"), r = ring.querySelector(".r");
  document.body.append(rocket, ring);

  let canvas, ctx, parts = [];
  if (!reduce) {
    canvas = Object.assign(document.createElement("canvas"), { className: "cur-trail" }); document.body.appendChild(canvas);
    ctx = canvas.getContext("2d");
    const size = () => { canvas.width = innerWidth; canvas.height = innerHeight; };
    size(); addEventListener("resize", size);
  }

  let mx = -100, my = -100, rx = mx, ry = my, kx = mx, ky = my, ang = 0, seen = false;
  const cols = ["249,115,22", "253,186,116", "255,255,255", "165,180,252"];
  const rnd = (a, b) => a + Math.random() * (b - a);

  function frame() {
    // ring lags behind; rocket flies after the pointer
    rx += (mx - rx) * 0.15; ry += (my - ry) * 0.15;
    const px = kx, py = ky;
    kx += (mx - kx) * 0.38; ky += (my - ky) * 0.38;
    const vx = kx - px, vy = ky - py, speed = Math.hypot(vx, vy);
    if (speed > 0.8) { // rotate toward the direction of travel (nose is "up")
      const target = Math.atan2(vy, vx) * 180 / Math.PI + 90;
      const d = ((target - ang + 540) % 360) - 180; ang += d * 0.22;
    }
    rocket.style.transform = `translate3d(${kx}px, ${ky}px, 0) rotate(${ang}deg)`;
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
    flame.style.setProperty("--f", Math.min(0.55 + speed * 0.07, 1.6) * (0.9 + Math.random() * 0.2));

    if (ctx) {
      if (speed > 2.5) { // exhaust from the tail
        const rad = (ang - 90) * Math.PI / 180, ux = Math.cos(rad), uy = Math.sin(rad);
        for (let i = 0; i < 2; i++) parts.push({ x: kx - ux * 14 + rnd(-2, 2), y: ky - uy * 14 + rnd(-2, 2), vx: -ux * rnd(.3, 1.4) + rnd(-.4, .4), vy: -uy * rnd(.3, 1.4) + rnd(-.4, .4), s: rnd(1.6, 3.4), life: 1, d: .9, c: cols[(Math.random() * 3) | 0] });
        // smoke: slow, grey puffs that billow out and fade
        parts.push({ x: kx - ux * 18, y: ky - uy * 18, vx: -ux * rnd(.2, .6) + rnd(-.3, .3), vy: -uy * rnd(.2, .6) + rnd(-.3, .3) - .15, s: rnd(2.5, 4.5), life: 1, d: .955, c: "190,196,215", smoke: true });
      }
      if (parts.length > 240) parts.splice(0, parts.length - 240);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      parts = parts.filter(p => p.life > 0.03);
      for (const p of parts) {
        p.life *= p.d; p.x += p.vx; p.y += p.vy;
        ctx.globalAlpha = p.smoke ? p.life * 0.16 : p.life * 0.8; ctx.fillStyle = `rgb(${p.c})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.smoke ? p.s * (1 + (1 - p.life) * 3.5) : p.s * p.life + 0.3, 0, 6.283); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  const INTERACTIVE = "a, button, [data-cmd], .proj, .card, summary";
  addEventListener("pointermove", e => {
    mx = e.clientX; my = e.clientY;
    if (!seen) { seen = true; rx = kx = mx; ry = ky = my; }
    rocket.classList.remove("hide"); ring.classList.remove("hide");
    const t = e.target.closest ? e.target : document.body;
    const lab = t.closest("[data-cursor]"), inter = t.closest(INTERACTIVE);
    const mode = inter && inter.dataset.cursor && inter.dataset.cursor !== "text" ? "label" : inter ? "hover" : lab && lab.dataset.cursor === "text" ? "block" : "";
    ring.classList.toggle("label", mode === "label"); ring.classList.toggle("hover", mode === "hover"); ring.classList.toggle("block", mode === "block");
    rocket.classList.toggle("small", mode === "hover");
    document.body.classList.toggle("cur-big", mode === "label" || mode === "block");
    if (mode === "label") label.textContent = inter.dataset.cursor;
    const mag = t.closest(".btn, nav a.term");
    if (mag) { const b = mag.getBoundingClientRect(); mag.style.transform = `translate(${(mx - b.left - b.width / 2) * .22}px, ${(my - b.top - b.height / 2) * .35}px)`; }
  });
  document.addEventListener("pointerout", e => { const m = e.target.closest && e.target.closest(".btn, nav a.term"); if (m) m.style.transform = ""; });
  document.addEventListener("mouseleave", () => { rocket.classList.add("hide"); ring.classList.add("hide"); });
  addEventListener("pointerdown", e => {
    r.style.setProperty("--s", ".78");
    if (reduce) return;
    const rp = document.createElement("div"); rp.className = "cur-ripple"; rp.style.left = e.clientX + "px"; rp.style.top = e.clientY + "px";
    document.body.appendChild(rp); setTimeout(() => rp.remove(), 650);
    for (let i = 0; i < 18; i++) { // star burst
      const a = Math.random() * 6.283, s = rnd(1.5, 5);
      parts.push({ x: e.clientX, y: e.clientY, vx: Math.cos(a) * s, vy: Math.sin(a) * s, s: rnd(1.5, 3.2), life: 1, d: .93, c: cols[(Math.random() * cols.length) | 0] });
    }
  });
  addEventListener("pointerup", () => r.style.setProperty("--s", "1"));
})();
