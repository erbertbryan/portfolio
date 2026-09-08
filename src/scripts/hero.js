import { Rive, Layout, Fit, Alignment } from "@rive-app/canvas";

/* ---------------- Rive avatar ---------------- */
function initAvatar() {
  const canvas = document.querySelector("[data-rive]");
  if (!canvas) return;
  try {
    const r = new Rive({
      src: "/yanyan_avatar2.riv",
      canvas,
      autoplay: true,
      stateMachines: "State Machine 1",
      layout: new Layout({ fit: Fit.Cover, alignment: Alignment.Center }),
      onLoad: () => r.resizeDrawingSurfaceToCanvas(),
    });
    window.addEventListener("resize", () => r.resizeDrawingSurfaceToCanvas());
  } catch (e) {
    console.warn("Rive avatar failed to load:", e);
  }
}

/* ---------------- 3D screen wheel ----------------
   CONCAVE: the shots line the *inside* wall of a big cylinder, so the
   viewer sits within the ring. The middle of the arc falls away from
   you while the cards at either side swing forward and grow. Softness
   at the edges comes from two lens-blur panels laid over the stage, so
   the blur belongs to the viewport rather than to any single card.     */

// "15", "16" and "18" are looping mp4s — deliberately spaced apart so
// no two of them sit side by side on the ring.
const SHOTS = [
  "01", "06", "15", "13", "17", "05", "07", "02",
  "14", "16", "09", "11", "08", "18", "12", "03", "04",
];
const VIDEOS = new Set(["15", "16", "18"]);

// wheel geometry per breakpoint. `push` slides the ring forward so the
// centre of the arc sits at a comfortable depth; `arc` culls anything
// swinging too far round the sides.
const rigFor = (w) =>
  w < 700
    ? { card: 330, gap: 8, persp: 700, tilt: 2, drift: 0.034, push: 0.5, arc: 70 }
    : w < 1100
    ? { card: 435, gap: 10, persp: 880, tilt: 2, drift: 0.03, push: 0.5, arc: 72 }
    : { card: 590, gap: 12, persp: 1050, tilt: 2, drift: 0.026, push: 0.5, arc: 74 };

function makeCard(name) {
  const el = document.createElement("figure");
  el.className = "shot";

  if (VIDEOS.has(name)) {
    const v = document.createElement("video");
    v.src = `/carousel/${name}.mp4`;
    v.muted = true;
    v.loop = true;
    v.playsInline = true;
    v.autoplay = true;
    v.preload = "auto";
    v.setAttribute("aria-hidden", "true");
    el.appendChild(v);
    el._video = v;
  } else {
    const img = document.createElement("img");
    img.src = `/carousel/${name}.webp`;
    img.alt = "";
    img.decoding = "async";
    img.draggable = false;
    el.appendChild(img);
  }
  return el;
}

function initWheel() {
  const stage = document.querySelector("[data-lens]");
  if (!stage) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // perspective wrapper -> rotating ring -> cards
  const wrap = document.createElement("div");
  wrap.className = "wheel-wrap";
  const wheel = document.createElement("div");
  wheel.className = "wheel";
  wrap.appendChild(wheel);

  const cards = SHOTS.map((n) => {
    const c = makeCard(n);
    wheel.appendChild(c);
    return c;
  });

  stage.appendChild(wrap);

  // the two lens-blur panels that soften the far edges
  ["left", "right"].forEach((side) => {
    const b = document.createElement("div");
    b.className = `wheel-lens-blur wheel-lens-blur--${side}`;
    b.setAttribute("aria-hidden", "true");
    stage.appendChild(b);
  });

  const N = cards.length;
  const step = 360 / N;
  let radius = 0;
  let angle = 0;
  let rig = rigFor(window.innerWidth);
  let raf = null;

  // pointer parallax, mirroring the reference's --hero-cursor-* vars
  let curX = 0;
  let tgtX = 0;
  // drag-to-spin
  let dragging = false;
  let spin = 0;
  let dragId = null;
  let lastX = 0;

  const layout = () => {
    rig = rigFor(window.innerWidth);
    // radius that seats N cards of this width evenly around the ring
    radius = (rig.card + rig.gap) / (2 * Math.tan(Math.PI / N));
    stage.style.setProperty("--card-w", rig.card + "px");
    wrap.style.perspective = rig.persp + "px";
    cards.forEach((c, i) => {
      c.style.setProperty("--a", i * step + "deg");
      c.style.setProperty("--r", radius.toFixed(1) + "px");
    });
  };

  const frame = () => {
    if (dragging) {
      // while held, the pointer drives the ring directly
    } else if (Math.abs(spin) > 0.004) {
      angle += spin; // released — coast, then settle back into the drift
      spin *= 0.94;
    } else if (!reduce) {
      spin = 0;
      angle -= rig.drift;
    }
    curX += (tgtX - curX) * 0.06;

    // push the ring toward the camera so we sit inside the arc
    wheel.style.transform =
      `translateZ(${(radius * rig.push).toFixed(1)}px) rotateX(${rig.tilt.toFixed(2)}deg) ` +
      `rotateY(${(angle + curX * 5).toFixed(3)}deg)`;

    // retire whatever swings past the sides / round the back
    for (let i = 0; i < N; i++) {
      let rel = ((i * step + angle) % 360 + 360) % 360;
      if (rel > 180) rel -= 360; // -180..180, 0 = centre of the arc
      const a = Math.abs(rel);
      const card = cards[i];

      if (a >= rig.arc) {
        if (card._on !== false) {
          card.style.visibility = "hidden";
          card._on = false;
        }
        continue;
      }
      if (card._on === false) {
        card.style.visibility = "";
        card._on = true;
      }
      // fade out over the last stretch before the cull angle
      const t = a / rig.arc;
      card.style.opacity = (1 - Math.pow(t, 2.2) * 0.85).toFixed(3);
    }

    raf = requestAnimationFrame(frame);
  };

  const start = () => {
    if (!raf) frame();
  };
  const stop = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = null;
  };

  /* ---- drag to spin the wheel ---- */
  const DEG_PER_PX = 0.11;

  const onDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    dragging = true;
    dragId = e.pointerId;
    lastX = e.clientX;
    spin = 0;
    wrap.classList.add("is-dragging");
    wrap.setPointerCapture?.(dragId);
  };

  const onMove = (e) => {
    if (!dragging || (dragId !== null && e.pointerId !== dragId)) return;
    const dx = e.clientX - lastX;
    lastX = e.clientX;
    const d = -dx * DEG_PER_PX; // drag right -> ring turns as if grabbed and pulled
    angle += d;
    spin = d; // carry the last delta into the coast
    e.preventDefault();
  };

  const onUp = (e) => {
    if (!dragging) return;
    dragging = false;
    wrap.classList.remove("is-dragging");
    if (dragId !== null) wrap.releasePointerCapture?.(dragId);
    dragId = null;
    // clamp the fling so it never runs away
    spin = Math.max(-6, Math.min(6, spin));
  };

  wrap.addEventListener("pointerdown", onDown);
  window.addEventListener("pointermove", onMove, { passive: false });
  window.addEventListener("pointerup", onUp);
  window.addEventListener("pointercancel", onUp);
  // don't fire the hover highlight mid-drag
  wrap.addEventListener("dragstart", (e) => e.preventDefault());

  window.addEventListener("resize", layout);
  if (window.matchMedia("(hover: hover)").matches) {
    window.addEventListener(
      "pointermove",
      (e) => {
        tgtX = (e.clientX / window.innerWidth) * 2 - 1; // -1..1
      },
      { passive: true }
    );
  }

  const hero = document.querySelector("[data-hero]");
  const io = new IntersectionObserver((e) => (e[0].isIntersecting ? start() : stop()), {
    threshold: 0,
  });
  if (hero) io.observe(hero);

  layout();
  start();
}

export function initHero() {
  initWheel();
  initAvatar();
}
