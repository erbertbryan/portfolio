import { projects } from "../data/projects.js";
import {
  webDash,
  webLanding,
  mobileFeed,
  mobileFinance,
  mobileOnboard,
} from "./mockups.js";
import { initDeepDive } from "./deepdive.js";

const gens = { webDash, webLanding, mobileFeed, mobileFinance, mobileOnboard };

const arrow = '<svg viewBox="0 0 24 24"><path d="M5 12h13M13 6l6 6-6 6"/></svg>';
const arrowBack = '<svg viewBox="0 0 24 24"><path d="M19 12H6M11 6l-6 6 6 6"/></svg>';

function phone(gen, accent, variant) {
  return `<div class="phone phone--${variant}">
    ${variant === "front" ? '<span class="phone__notch"></span>' : ""}
    <div class="phone__screen">${gen({ accent })}</div>
  </div>`;
}
function browser(gen, accent) {
  return `<div class="browserframe">
    <div class="browserframe__bar"><i></i><i></i><i></i><span></span></div>
    <div class="browserframe__screen">${gen({ accent })}</div>
  </div>`;
}
export function showcase(p, { big } = {}) {
  const a = p.accent;
  const cls = big ? "showcase showcase--big" : "showcase";
  if (p.layout === "hero") {
    // a short mockup-reveal clip, not a still — it renders its own
    // laptop/device graphic and drop shadow on a white canvas, so the
    // card carries no chrome of its own (no matte border/padding/shadow
    // to double up on that), just a matching white ground behind it. The
    // reveal-tilt transform still lives only on the outer card: a
    // transformed parent carries its whole rendered subtree as one rigid
    // unit, so there's no separate animated layer to drift out of sync.
    // Playback itself is handled once, elsewhere — see initHeroVideoPlay.
    return `<div class="showcase showcase--hero">
      <div class="showcase--hero__card">
        <video
          src="${p.heroVideo.src}"
          poster="${p.heroVideo.poster}"
          muted
          playsinline
          preload="metadata"
          aria-label="${p.name} product screen"
        ></video>
      </div>
    </div>`;
  }
  if (p.layout === "mobile") {
    return `<div class="${cls}">
      ${phone(gens[p.screens[1]], a, "back")}
      ${phone(gens[p.screens[0]], a, "front")}
    </div>`;
  }
  if (p.layout === "web") {
    return `<div class="${cls} showcase--web">${browser(gens[p.screens[0]], a)}</div>`;
  }
  return `<div class="${cls}">
    ${browser(gens[p.screens[0]], a)}
    ${phone(gens[p.screens[1]], a, "front")}
  </div>`;
}


export function initWorks() {
  const root = document.querySelector("[data-works]");
  if (!root) return;

  const cards = projects.map((p, i) => {
    const el = document.createElement("article");
    el.className = "case";
    el.dataset.projectId = p.id;
    el.style.setProperty("--i", i);
    el.style.setProperty("--case-accent", p.accent);
    el.innerHTML = `
      <div class="case__back-wrap">
        <button class="case__back" type="button" data-clickable>
          <i>${arrowBack}</i> Back
        </button>
      </div>
      <div class="case__frame">
        <span class="case__tick tl" aria-hidden="true"></span>
        <span class="case__tick tr" aria-hidden="true"></span>
        <span class="case__tick bl" aria-hidden="true"></span>
        <span class="case__tick br" aria-hidden="true"></span>
        <div class="case__body">
          <div class="case__text">
            ${
              p.logoSvg
                ? `<img class="case__logo case__logo--img${
                    p.logoSquare ? " case__logo--square" : ""
                  }" src="${p.logoSvg}" alt="${p.logo}"${
                    p.logoScale ? ` style="--logo-scale:${p.logoScale}"` : ""
                  } />`
                : `<span class="case__logo">${p.logo}</span>`
            }
            <h3 class="case__title">${p.name}</h3>
            <div class="case__tags">${p.tags.map((t) => `<span>${t}</span>`).join("")}</div>
            <button class="case__cta" type="button" data-clickable>
              <span class="case__cta-label">Deep dive</span>
              <i>${arrow}</i>
            </button>
          </div>
          ${showcase(p)}
        </div>
      </div>`;
    root.appendChild(el);
    return { project: p, el };
  });

  const stack = initStack(
    root,
    cards.map((c) => c.el)
  );
  initDeepDive(root, cards, stack);
  initHeroReveal(root);
  initHeroVideoPlay(root);
}

/* hero-screenshot showcases lie flat (tilted back in 3D) and rise upright
   the first time they scroll into view, then hold that pose for good —
   see .showcase--hero.is-revealed in style.css. Each target stops being
   observed the moment it reveals, so scrolling back up past it later
   can't lay it back down again. Skipped while a deep dive has this card
   expanded, since that state has its own fixed pose. */
function initHeroReveal(root) {
  const targets = root.querySelectorAll(".showcase--hero");
  if (!targets.length) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    targets.forEach((t) => t.classList.add("is-revealed"));
    return;
  }
  const io = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        if (entry.target.closest(".case.is-expanded, .case.is-settling")) return;
        entry.target.classList.add("is-revealed");
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.2, rootMargin: "0px 0px -10% 0px" }
  );
  targets.forEach((t) => io.observe(t));
}

/* Each hero video plays through exactly once, whichever moment it first
   becomes visible — home card or, on a direct deep-dive link, straight
   into the expanded view — then holds on its own last frame. Unlike the
   card's tilt reveal above, this never resets: no loop, no replay on
   re-entry, no scroll or hover driving it. The elements exist in the DOM
   from the very first render (every card is built up front), so one
   observer set up here already covers both entry paths. */
function initHeroVideoPlay(root) {
  const vids = root.querySelectorAll(".showcase--hero__card video");
  if (!vids.length) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return; // the poster is already its last frame

  const io = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const v = entry.target;
        v.play().catch(() => {}); // autoplay can still be blocked; the poster covers it
        // a backgrounded tab can throttle a script-started video and pause
        // it mid-clip; resume rather than leave it stranded on whatever
        // frame it happened to stall on — once 'ended' fires this simply
        // never runs again, so it can't fight the freeze on the last frame
        v.addEventListener("pause", () => {
          if (!v.ended) v.play().catch(() => {});
        });
        obs.unobserve(v);
      });
    },
    { threshold: 0.2 }
  );
  vids.forEach((v) => io.observe(v));
}

/* As the next case scrolls up to cover the current one, gently scale + dim it.
   Returns controls so the deep-dive module can pause this while a case is
   expanded — the effect makes no sense once a card is no longer stacked. */
function initStack(root, cards) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let raf = null;
  let paused = false;

  const clear = () => {
    cards.forEach((c) => {
      c.style.transform = "";
      c.style.filter = "";
    });
  };

  const update = () => {
    raf = null;
    if (paused) return;
    const vh = window.innerHeight;
    for (let i = 0; i < cards.length; i++) {
      const next = cards[i + 1];
      if (!next) {
        cards[i].style.transform = "";
        cards[i].style.filter = "";
        continue;
      }
      const cur = cards[i].getBoundingClientRect();
      const dist = next.getBoundingClientRect().top - cur.top;
      const range = Math.min(vh * 0.8, cur.height + 160);
      let p = 1 - dist / range;
      p = p < 0 ? 0 : p > 1 ? 1 : p;
      cards[i].style.transform = `scale(${(1 - p * 0.04).toFixed(4)})`;
      cards[i].style.filter = `brightness(${(1 - p * 0.06).toFixed(3)})`;
    }
  };
  const onScroll = () => {
    if (!raf) raf = requestAnimationFrame(update);
  };

  if (!reduce) {
    const io = new IntersectionObserver(
      (e) => {
        if (e[0].isIntersecting) {
          window.addEventListener("scroll", onScroll, { passive: true });
          onScroll();
        } else {
          window.removeEventListener("scroll", onScroll);
        }
      },
      { rootMargin: "200px 0px 200px 0px" }
    );
    io.observe(root);
    window.addEventListener("resize", onScroll, { passive: true });
  }

  return {
    pause() {
      paused = true;
      clear();
    },
    resume() {
      paused = false;
      onScroll();
    },
  };
}
