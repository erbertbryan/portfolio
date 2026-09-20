import { projects } from "../data/projects.js";
import {
  webDash,
  webLanding,
  mobileFeed,
  mobileFinance,
  mobileOnboard,
} from "./mockups.js";
import { initDeepDive, attachScrub } from "./deepdive.js";

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
    // Playback itself is driven elsewhere, and differently depending on
    // state — see initHeroVideoScrub below (closed card) and playHeroOnce
    // in deepdive.js (deep-dive header). Starts at preload="metadata" so
    // five clips don't all download on first paint; initHeroVideoScrub
    // bumps each to "auto" when its card is about a screen away, since
    // scrubbing needs real frame data buffered, not just duration.
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

/* three tags per row, packed tightly rather than lined up into shared
   columns — a grid with one shared column width per position made
   short and long tags in the same column leave wildly different gaps
   after them. Chunking into its own row per 3 sidesteps that: each
   row is an independent flex line, sized only by what's actually in
   it. */
function tagsMarkup(tags) {
  const rows = [];
  for (let i = 0; i < tags.length; i += 3) rows.push(tags.slice(i, i + 3));
  return rows
    .map(
      (row) =>
        `<div class="case__tags-row">${row.map((t) => `<span>${t}</span>`).join("")}</div>`
    )
    .join("");
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
            <h2 class="case__title">${p.titleLines ? p.titleLines.join("<br>") : p.name}</h2>
            <div class="case__tags">${tagsMarkup(p.tags)}</div>
            <button class="case__cta" type="button" data-clickable>
              <span class="case__cta-label">View project</span>
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
  initHeroVideoScrub(root);
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

/* Closed card only: scrolling the card into (or out of) view scrubs the
   hero video's currentTime directly, forward and back, same mechanism
   deep-dive lead clips use (attachScrub, see deepdive.js) — reusing it
   here rather than a second copy of that math. Stops the instant this
   card becomes the expanded deep-dive header, handing playback off to
   playHeroOnce (deepdive.js) instead, which is the only other thing
   that ever touches this element's currentTime — the skip() check is
   what keeps the two from fighting over it. */
function initHeroVideoScrub(root) {
  const vids = root.querySelectorAll(".showcase--hero__card video");

  const warm = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.preload = "auto";
        obs.unobserve(e.target);
      });
    },
    { rootMargin: "100% 0px" }
  );

  vids.forEach((v) => {
    warm.observe(v);
    const card = v.closest(".case");
    // .showcase--hero is the un-transformed positioned wrapper; the video
    // itself sits under the reveal tilt/scale, which would skew its rect
    const track = v.closest(".showcase--hero");
    attachScrub(v, {
      skip: () => card.classList.contains("is-expanded"),
      track,
      // The cards are position: sticky, so the video stops moving once its
      // card locks in at the --stick offset — the default "top reaches 15%
      // of the viewport" range is never reached (the clip stalled around
      // 60%). Map it to the card's own entry instead: 0 as the video's top
      // comes over the fold, 1 exactly as the card locks in place, so the
      // clip always lands its final frame as the card settles.
      range: (r) => {
        const stick = parseFloat(getComputedStyle(card).top) || 0;
        const offset = r.top - card.getBoundingClientRect().top;
        return [window.innerHeight * 0.92, stick + offset];
      },
    });
  });
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
