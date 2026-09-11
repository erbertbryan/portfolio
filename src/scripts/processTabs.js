/* ------------------------------------------------------------
   How I work — one flow, two speeds.
   Traditional walks the full craft; AI-Native collapses the middle
   into a single interactive prototype. Chips shared by both modes
   stay put while the rest slide away, so the switch reads as the
   process compressing rather than swapping.
   ------------------------------------------------------------ */

// 4-point AI "supercharge" star
const STAR = `
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <defs>
      <linearGradient id="aistar" x1="0" y1="0" x2="24" y2="24">
        <stop offset="0" stop-color="#6c5ce7"/>
        <stop offset=".45" stop-color="#f472b6"/>
        <stop offset=".75" stop-color="#f5a524"/>
        <stop offset="1" stop-color="#34d399"/>
      </linearGradient>
    </defs>
    <path fill="url(#aistar)" d="M12 1.5c1 6.6 3.9 9.5 10.5 10.5C15.9 13 13 15.9 12 22.5 11 15.9 8.1 13 1.5 12 8.1 11 11 8.1 12 1.5Z"/>
  </svg>`;

// `in` = which modes the step belongs to
const FLOW = [
  { label: "Idea", in: ["traditional", "ai"] },
  { label: "Research", in: ["traditional"] },
  { label: "Sketch", in: ["traditional"] },
  { label: "Wireframe", in: ["traditional"] },
  { label: "UX", in: ["ai"] },
  { label: "Hi-fidelity", in: ["traditional"] },
  { label: "Prototype", in: ["traditional"] },
  { label: "Interactive prototype", in: ["ai"], hero: true },
  { label: "Design QA", in: ["traditional"] },
  { label: "Handoff", in: ["traditional"] },
  { label: "Engineering", in: ["traditional", "ai"] },
  { label: "Code review", in: ["traditional"] },
  { label: "Deploy", in: ["traditional", "ai"] },
];

// what the interactive prototype absorbs
const ABSORBED = [
  { t: "Wireframes", d: "Structure and flow, explored in minutes instead of days." },
  { t: "Hi-fidelity UI", d: "Production-ready visuals, componentised as I build." },
  { t: "Screen variations", d: "Alternate states and A/B directions spun up instantly." },
  { t: "Motion & micro-interactions", d: "Real transitions baked in — never faked." },
  { t: "Design QA", d: "Pixel and behaviour checks run against the live build." },
  { t: "Front-end build", d: "The prototype is real code, so there's nothing to rebuild." },
];

/* ---------------- headline scramble ----------------
   Switching to AI-Native reveals ", supercharged." in the section title
   through the same glyph-flicker decode as the hero CTA (see
   scrambleInto() in hero.js — duplicated here in miniature rather than
   shared, since the hero's version is wired tightly to its own hover
   events). Switching back to Traditional just clears the slots, same
   as the hero's own "removal" case — a plain default doesn't need a
   reverse animation. */
const SCRAMBLE_CHARS = "!<>-_\\/[]{}=+*^?#";
const GLYPH_HOLD_MS = 45;
const REVEAL_BASE_MS = 180;
const REVEAL_STAGGER_MS = 55;
const REVEAL_JITTER_MS = 55;

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function scrambleInto(el, text, elapsed, state) {
  let out = "";
  let done = 0;
  for (let i = 0; i < text.length; i++) {
    if (elapsed >= state.reveal[i] || text[i] === " ") {
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

// returns a setter that swaps every [data-proc-title] .proc__scramble slot
// to its "on" (AI) or "off" (traditional) text
function initTitleScramble(reduce) {
  // [data-proc-title] sits in .section-head, a sibling of .proc (data-proc)
  // rather than a descendant, so this is scoped from the document
  const slots = [...document.querySelectorAll("[data-proc-title] .proc__scramble")];
  if (!slots.length) return () => {};

  const scramblers = slots.map((el) => {
    const offText = el.dataset.off || "";
    const onText = el.dataset.on || "";
    let raf = null;

    const setText = (text) => {
      if (raf) cancelAnimationFrame(raf);
      raf = null;
      if (reduce || !text) {
        el.textContent = text;
        return;
      }
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

    return { offText, onText, setText };
  });

  return (mode) => {
    scramblers.forEach((s) => s.setText(mode === "ai" ? s.onText : s.offText));
  };
}

export function initProcessTabs() {
  const proc = document.querySelector("[data-proc]");
  if (!proc) return;

  const flow = proc.querySelector("[data-chips]");
  const pop = proc.querySelector("[data-pop]");
  const list = proc.querySelector("[data-pop-list]");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  list.innerHTML = ABSORBED.map(
    (i) => `<li><span>${i.t}</span><em>${i.d}</em></li>`
  ).join("");

  // ---- build the switch ----
  const sw = document.createElement("div");
  sw.className = "proc__switch";
  sw.setAttribute("role", "tablist");
  sw.setAttribute("aria-label", "Process mode");
  sw.innerHTML = `
    <span class="proc__thumb" aria-hidden="true"></span>
    <button class="proc__tab is-active" role="tab" aria-selected="true" data-tab="traditional">Traditional</button>
    <button class="proc__tab" role="tab" aria-selected="false" data-tab="ai">
      <span class="proc__spark" aria-hidden="true">✦</span> AI-Native
    </button>`;
  proc.insertBefore(sw, flow);

  const thumb = sw.querySelector(".proc__thumb");
  const tabs = [...sw.querySelectorAll(".proc__tab")];

  // ---- build chips + connectors ----
  let hero = null;
  const chips = [];
  const links = [];

  FLOW.forEach((s, i) => {
    if (i > 0) {
      const link = document.createElement("span");
      link.className = "proc__link";
      link.setAttribute("aria-hidden", "true");
      flow.appendChild(link);
      links.push({ el: link, for: i });
    }
    const chip = document.createElement(s.hero ? "button" : "span");
    chip.className = "chip" + (s.hero ? " chip--hero" : "");
    if (s.hero) {
      chip.type = "button";
      chip.innerHTML = `<span class="chip__star">${STAR}</span><span class="chip__label">${s.label}</span>`;
      hero = chip;
    } else {
      chip.innerHTML = `<span class="chip__label">${s.label}</span>`;
    }
    flow.appendChild(chip);
    chips.push(chip);
  });

  let mode = "traditional";

  const applyMode = () => {
    // the traditional flow carries twice as many chips — shrink them so the
    // run still reads as one continuous line
    flow.classList.toggle("is-trad", mode === "traditional");
    FLOW.forEach((s, i) => {
      chips[i].classList.toggle("is-hidden", !s.in.includes(mode));
    });
    // a connector shows only between two visible chips
    let seen = false;
    FLOW.forEach((s, i) => {
      const on = s.in.includes(mode);
      const link = links.find((l) => l.for === i);
      if (link) link.el.classList.toggle("is-hidden", !on || !seen);
      if (on) seen = true;
    });
  };

  const moveThumb = () => {
    const active = tabs.find((t) => t.classList.contains("is-active"));
    if (!active) return;
    thumb.style.width = active.offsetWidth + "px";
    thumb.style.transform = `translateX(${active.offsetLeft - 5}px)`;
  };

  const setTitleMode = initTitleScramble(reduce);

  const setMode = (next) => {
    if (next === mode) return;
    mode = next;
    tabs.forEach((t) => {
      const on = t.dataset.tab === mode;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
    });
    sw.classList.toggle("is-ai", mode === "ai");
    moveThumb();
    hidePop();
    applyMode();
    setTitleMode(mode);

    if (!reduce && mode === "ai") {
      flow.classList.remove("is-super");
      void flow.offsetWidth;
      flow.classList.add("is-super");
    }
  };

  tabs.forEach((t) => t.addEventListener("click", () => setMode(t.dataset.tab)));

  // ---- hover popover on the interactive-prototype chip ----
  const place = () => {
    const pr = proc.getBoundingClientRect();
    const cr = hero.getBoundingClientRect();
    const pw = pop.offsetWidth;
    const ph = pop.offsetHeight;
    let left = cr.left - pr.left + cr.width / 2 - pw / 2;
    left = Math.max(8, Math.min(left, pr.width - pw - 8));
    let top = cr.top - pr.top - ph - 14;
    if (top < 4) top = cr.bottom - pr.top + 14;
    pop.style.left = left + "px";
    pop.style.top = top + "px";
  };
  const showPop = () => {
    if (mode !== "ai") return;
    pop.classList.add("is-on");
    place();
  };
  const hidePop = () => pop.classList.remove("is-on");

  if (hero) {
    hero.addEventListener("mouseenter", showPop);
    hero.addEventListener("mouseleave", hidePop);
    hero.addEventListener("focus", showPop);
    hero.addEventListener("blur", hidePop);
  }
  window.addEventListener("resize", () => {
    moveThumb();
    if (pop.classList.contains("is-on")) place();
  });

  applyMode();
  requestAnimationFrame(moveThumb);
}
