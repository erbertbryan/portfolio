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
    ? { card: 360, gap: 8, persp: 760, tilt: 2, drift: 0.034, push: 0.5, arc: 70 }
    : w < 1100
    ? { card: 475, gap: 10, persp: 950, tilt: 2, drift: 0.03, push: 0.5, arc: 72 }
    : { card: 650, gap: 12, persp: 1140, tilt: 2, drift: 0.026, push: 0.5, arc: 74 };

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
    // push the ring toward the camera so we sit inside the arc
    wheel.style.transform =
      `translateZ(${(radius * rig.push).toFixed(1)}px) rotateX(${rig.tilt.toFixed(2)}deg) ` +
      `rotateY(${angle.toFixed(3)}deg)`;

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

  const hero = document.querySelector("[data-hero]");
  const io = new IntersectionObserver((e) => (e[0].isIntersecting ? start() : stop()), {
    threshold: 0,
  });
  if (hero) io.observe(hero);

  layout();
  start();
}

/* ---------------- headline scramble ----------------
   Hovering (or focusing) the "Book a call" CTA scrambles the headline
   from its default wording into the hover one. Only the words that
   actually differ move — .hero__title is hand-split into .hero__static
   runs (untouched, always) and .hero__scramble slots (the words that
   change — see index.html). A slot going to "" is a plain removal, not
   an addition, so it just clears instead of animating.

   Each in-flight glyph is its own <span class="hero__glyph"> (light
   blue, see style.css); the moment a character locks in, it's written
   back out as plain text instead, inheriting .hero__title's own ink
   colour immediately — the colour change has to land in the same
   frame as the reveal, not fade in after it. */
const SCRAMBLE_CHARS = "!<>-_\\/[]{}=+*^?#";
// timed in ms, not rAF ticks — a raw frame-count version of this ran
// noticeably faster on a high refresh-rate display (this machine's
// browser fires rAF every ~6ms, not the ~16.67ms a frame count assumes,
// so counting frames instead of elapsed time played the whole thing
// back nearly 3x too fast — fast enough to read as an accident rather
// than an effect). Real elapsed time plays at the same speed everywhere.
const GLYPH_HOLD_MS = 55; // how long one glyph sits before re-rolling — a decode, not a flicker
const REVEAL_BASE_MS = 260; // delay before the first character can lock in
const REVEAL_STAGGER_MS = 80; // added per character, so the reveal visibly sweeps left to right
const REVEAL_JITTER_MS = 80; // +random per character, so the sweep isn't a metronome

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function scrambleInto(el, text, elapsed, state) {
  let out = "";
  let done = 0;
  for (let i = 0; i < text.length; i++) {
    if (elapsed >= state.reveal[i] || text[i] === " ") {
      // revealed (or a space, which never scrambles — a flickering
      // gap reads as a glitch, not a word): plain text, instantly the
      // title's own colour, no separate transition to wait on
      done++;
      out += escapeHtml(text[i]);
    } else {
      if (state.glyphs[i] === undefined || elapsed - state.rolledAt[i] >= GLYPH_HOLD_MS) {
        state.glyphs[i] = SCRAMBLE_CHARS[(Math.random() * SCRAMBLE_CHARS.length) | 0];
        state.rolledAt[i] = elapsed;
      }
      out += `<span class="hero__glyph">${state.glyphs[i]}</span>`;
    }
  }
  el.innerHTML = out;
  return done === text.length;
}

function initScramble(root) {
  const cta = root.querySelector(".hero__cta");
  const slots = root.querySelectorAll(".hero__scramble");
  if (!cta || !slots.length) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const scramblers = [...slots].map((el) => {
    const defaultText = el.dataset.default || "";
    const hoverText = el.dataset.hover || "";
    let raf = null;

    const setText = (text) => {
      if (raf) cancelAnimationFrame(raf);
      raf = null;
      if (!text) {
        el.textContent = ""; // a removal — nothing to reveal, so nothing to animate
        return;
      }
      // each character starts revealing at its own moment, staggered
      // left to right, so the decode visibly sweeps across the word
      // instead of every character landing at once
      const state = {
        glyphs: [],
        rolledAt: [],
        reveal: Array.from(
          text,
          (_, i) => REVEAL_BASE_MS + i * REVEAL_STAGGER_MS + Math.random() * REVEAL_JITTER_MS
        ),
      };
      const start = performance.now();
      const tick = (now) => {
        const finished = scrambleInto(el, text, now - start, state);
        if (!finished) raf = requestAnimationFrame(tick);
        else raf = null;
      };
      raf = requestAnimationFrame(tick);
    };

    return { defaultText, hoverText, setText };
  });

  const toHover = () => scramblers.forEach((s) => s.setText(s.hoverText));
  const toDefault = () => scramblers.forEach((s) => s.setText(s.defaultText));

  cta.addEventListener("mouseenter", toHover);
  cta.addEventListener("mouseleave", toDefault);
  cta.addEventListener("focus", toHover);
  cta.addEventListener("blur", toDefault);
}

export function initHero() {
  initWheel();
  initAvatar();
  initScramble(document);
}
