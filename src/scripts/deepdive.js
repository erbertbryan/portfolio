/* ------------------------------------------------------------
   Deep dive — expands a case card in place into a full case-study
   page: no navigation, no loading state.

   This is a CROSSFADE, deliberately not a scale/FLIP transform: the
   card's content (logo, big title, tags, mockup) genuinely changes
   size and layout between the closed and expanded states, and scaling
   a box that contains text and images stretches and distorts them —
   that was tried first and looked bad. Instead: fade the content out,
   swap the layout while it's invisible (instant, but unseen), fade
   the new layout in. Nothing ever gets scaled.

   Only the "Back" pill stays pinned as you scroll — the header itself
   scrolls away like the rest of the page. "Back" reverses the same
   crossfade; switching between two open deep dives crossfades directly
   from one to the other without visiting the closed-card state.
   ------------------------------------------------------------ */

import { showcase } from "./works.js";

const REDUCE = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const FADE_OUT = REDUCE ? 0 : 220;
const FADE_IN = REDUCE ? 0 : 360;

const ARROW_FWD = '<svg viewBox="0 0 24 24"><path d="M5 12h13M13 6l6 6-6 6"/></svg>';

/* fade `el` to opacity 0, run `swap` while invisible, fade back to 1.
   Returns a promise that resolves once the fade-in finishes. */
function crossfade(el, swap) {
  return new Promise((resolve) => {
    if (REDUCE) {
      swap();
      resolve();
      return;
    }
    el.style.transition = `opacity ${FADE_OUT}ms ease, transform ${FADE_OUT}ms ease`;
    el.style.transform = "translateY(-8px)";
    el.style.opacity = "0";

    setTimeout(() => {
      swap();
      void el.offsetWidth; // commit the swap before animating back in
      el.style.transition = "none";
      el.style.transform = "translateY(10px)";
      requestAnimationFrame(() => {
        el.style.transition = `opacity ${FADE_IN}ms ease, transform ${FADE_IN}ms ease`;
        el.style.opacity = "1";
        el.style.transform = "none";
        setTimeout(() => {
          el.style.transition = "";
          el.style.transform = "";
          resolve();
        }, FADE_IN);
      });
    }, FADE_OUT);
  });
}

/* the default template: a one-line problem statement, a one-line
   solution statement, then the generated mockups. Projects that need a
   richer, section-by-section narrative instead define `story` — see
   storyBodyMarkup() below. */
function defaultBodyMarkup(project) {
  return `
      <section class="story__section" data-story-in>
        <p class="story__statement">${project.problem}</p>
      </section>

      <section class="story__section story__section--alt" data-story-in>
        <p class="story__statement">${project.solution}</p>
      </section>

      <section class="story__mockups" data-story-in>
        ${showcase(project, { big: true })}
      </section>`;
}

/* each entry in a section's `images` array is either an image path
   (string) or a video descriptor { type: "video", src, poster? } —
   autoplaying, muted and looped like an ambient product demo/loader */
function mediaTag(item) {
  if (typeof item === "string") {
    return `<img src="${item}" alt="" loading="lazy" decoding="async" />`;
  }
  const poster = item.poster ? ` poster="${item.poster}"` : "";
  return `<video src="${item.src}"${poster} autoplay muted loop playsinline preload="metadata"></video>`;
}

/* a `story` is an ordered list of custom sections — "media-text" pairs
   media (an image or video, or several stacked) with a paragraph on
   either side, "bento" centers a paragraph over a small media grid.
   Backgrounds alternate for rhythm, same as the default template's
   problem/solution pair. */
function storyBodyMarkup(project) {
  if (!project.story) return defaultBodyMarkup(project);

  return project.story
    .map((s, i) => {
      const alt = i % 2 === 1 ? " story__section--alt" : "";
      // a metrics band: a lead-in line, the numbers themselves in a
      // lined row, then a note that carries the reader into the work
      if (s.type === "stats") {
        const cells = s.items
          .map(
            (m) => `
            <div class="story__stat">
              <strong data-count-to="${m.value}">${m.value}</strong>
              <span>${m.label}</span>
            </div>`
          )
          .join("");
        return `
        <section class="story__section story__stats-section${alt}" data-story-in>
          ${s.label ? `<p class="story__stats-label">${s.label}</p>` : ""}
          <p class="story__paragraph story__paragraph--center">${s.text}</p>
          <div class="story__stats">${cells}</div>
          ${s.note ? `<p class="story__paragraph story__paragraph--center story__stats-note">${s.note}</p>` : ""}
        </section>`;
      }
      if (s.type === "bento") {
        const count = s.images.length;
        // Counts that don't divide evenly into a 2-up grid get explicit row
        // sizes instead, so no tile is ever left alone on the last row.
        // Every tile in a row is equal width, which (since these source
        // images share one aspect ratio) means rows match height on their
        // own — no crop, no letterboxing, unlike an asymmetric big+small
        // span. Max 3 per row.
        const ROWS = { 5: [2, 3], 7: [2, 3, 2] };
        if (ROWS[count]) {
          let at = 0;
          const groups = ROWS[count].map((n) => s.images.slice(at, (at += n)));
          const rows = groups
            .map(
              (group) =>
                `<div class="story__bento-row">${group
                  .map((item) => `<div class="story__bento-card">${mediaTag(item)}</div>`)
                  .join("")}</div>`
            )
            .join("");
          return `
          <section class="story__section story__bento${alt}" data-story-in>
            <p class="story__paragraph story__paragraph--center">${s.text}</p>
            <div class="story__bento-grid story__bento-grid--rows">${rows}</div>
          </section>`;
        }
        // the "1 big + rest small" span only reads as a bento with
        // exactly 3 items — a 4th makes an even 2x2 grid instead
        const spanFirst = count === 3;
        const imgs = s.images
          .map(
            (item, idx) =>
              `<div class="story__bento-card${
                spanFirst && idx === 0 ? " story__bento-img--1" : ""
              }">${mediaTag(item)}</div>`
          )
          .join("");
        return `
        <section class="story__section story__bento${alt}" data-story-in>
          <p class="story__paragraph story__paragraph--center">${s.text}</p>
          <div class="story__bento-grid">${imgs}</div>
        </section>`;
      }
      const imgs = s.images
        .map((item) => `<div class="story__media-card">${mediaTag(item)}</div>`)
        .join("");
      // "bento" = 2x2 grid, "trio" = one full-width above a matched pair,
      // otherwise a plain vertical stack
      const layouts = { bento: "bento", trio: "trio" };
      const stackClass =
        s.images.length > 1 ? ` story__media--${layouts[s.mediaLayout] || "stack"}` : "";
      const media = `<div class="story__media${stackClass}">${imgs}</div>`;
      const side = s.side === "right" ? " story__media-row--right" : "";
      return `
      <section class="story__section story__media-row${side}${alt}" data-story-in>
        ${media}
        <div class="story__media-copy">
          ${s.label ? `<p class="story__stats-label story__media-label">${s.label}</p>` : ""}
          <p class="story__paragraph">${s.text}</p>
        </div>
      </section>`;
    })
    .join("");
}

function storyMarkup(project, others) {
  const rows = others
    .map(
      ({ project: o }) => `
      <button class="story__row" type="button" data-switch="${o.id}" style="--case-accent:${o.accent}">
        <span class="story__row-logo${o.logoSvg ? " has-img" : ""}${
        o.logoSquare ? " is-square" : ""
      }">${
        o.logoSvg
          ? `<img src="${o.logoSvg}" alt=""${
              o.logoScale ? ` style="--logo-scale:${o.logoScale}"` : ""
            } />`
          : o.logo
      }</span>
        <span class="story__row-title">${o.name}</span>
        <span class="story__row-cta"><span>Deep dive</span> ${ARROW_FWD}</span>
      </button>`
    )
    .join("");

  return `
    <div class="case__story" data-story>
      <div class="story__meta">
        <div class="story__meta-item">
          <span>Platform</span>
          <strong>${project.platform}</strong>
        </div>
        <div class="story__meta-item">
          <span>Role</span>
          <strong>${project.role}</strong>
        </div>
        <div class="story__meta-item story__meta-item--overview">
          <span>Overview</span>
          <p>${project.blurb}</p>
        </div>
      </div>

      ${storyBodyMarkup(project)}

      <section class="story__more" data-story-in>
        <p class="story__more-label">Keep exploring</p>
        <div class="story__rows">${rows}</div>
      </section>
    </div>`;
}

/* the hero image's scroll-reveal (see initHeroReveal() in works.js) can
   catch a transient "not intersecting" reading right as a card exits
   its fixed, full-viewport expanded state — that briefly resets the
   image to its laid-flat starting pose even though the user never
   scrolled it out of view. Force it back on at the moments that matter. */
function revealHero(el) {
  el.querySelector(".showcase--hero")?.classList.add("is-revealed");
}

/* stat numbers count up the first time they scroll into view. The
   markup already carries the final value as text, so if this never runs
   (no IntersectionObserver, reduced motion, JS error) the real number is
   still what's on screen. */
const COUNT_MS = 1100;
function initCounters(root) {
  const nums = root.querySelectorAll("[data-count-to]");
  if (!nums.length) return;
  if (REDUCE) return; // final value is already in the markup

  const run = (el) => {
    // split a value like "32%" or "55+" into the number to count and
    // the unit that rides along with it, so the suffix is on screen for
    // the whole animation rather than popping in on the final frame
    const m = /^(-?[\d.]+)(.*)$/.exec(el.dataset.countTo);
    if (!m) return;
    const target = parseFloat(m[1]);
    if (Number.isNaN(target)) return;
    const suffix = m[2];
    // match the source's own precision, so "3.1" counts in decimals
    // while "100" stays whole
    const dp = (m[1].split(".")[1] || "").length;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / COUNT_MS);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = (target * eased).toFixed(dp) + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = el.dataset.countTo;
    };
    requestAnimationFrame(tick);
  };

  const io = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        run(entry.target);
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.4 }
  );
  nums.forEach((n) => {
    n.textContent = "0";
    io.observe(n);
  });
}

export function initDeepDive(root, cards, stack) {
  const byId = new Map(cards.map((c) => [c.project.id, c]));
  let current = null;
  let animating = false;

  function open(id) {
    if (animating || current === id) return;
    const card = byId.get(id);
    if (!card) return;
    animating = true;
    current = id;

    const { el, project } = card;
    const others = cards.filter((c) => c.project.id !== id);

    root.classList.add("has-expanded");
    others.forEach((c) => c.el.classList.add("is-hidden"));
    stack.pause();
    document.body.classList.add("no-scroll");

    crossfade(el, () => {
      el.classList.add("is-expanded");
      el.insertAdjacentHTML("beforeend", storyMarkup(project, others));
      revealHero(el);
    }).then(() => {
      animating = false;
      const story = el.querySelector("[data-story]");
      requestAnimationFrame(() => story.classList.add("is-in"));
      el.querySelectorAll("[data-switch]").forEach((btn) => {
        btn.addEventListener("click", () => switchTo(btn.dataset.switch));
      });
      initCounters(el);
    });

    history.pushState({ deepdive: id }, "", `#case-${id}`);
  }

  function close({ pushState = true } = {}) {
    if (animating || !current) return Promise.resolve();
    const card = byId.get(current);
    animating = true;
    current = null;

    const { el } = card;
    const story = el.querySelector("[data-story]");
    if (story) story.classList.remove("is-in");

    // covers the whole close transition, not just its two endpoints —
    // keeps the hero-reveal observer (works.js) from reading a transient
    // "not intersecting" state as the card leaves its fixed/full-viewport
    // expanded layout and un-revealing an image the user was just looking at
    el.classList.add("is-settling");

    const done = crossfade(el, () => {
      el.classList.remove("is-expanded");
      story?.remove();
      root.classList.remove("has-expanded");
      cards.forEach((c) => c.el.classList.remove("is-hidden"));
      revealHero(el);
    }).then(() => {
      animating = false;
      stack.resume();
      document.body.classList.remove("no-scroll");
      revealHero(el);
      el.classList.remove("is-settling");
    });

    if (pushState) {
      const base = location.pathname + location.search;
      history.pushState({}, "", `${base}#works`);
    }
    return done;
  }

  /* crossfades directly from one open deep dive to another — never
     drops back through the closed-card state, which is what made
     switching between projects feel rough. Two different elements are
     involved (outgoing card, incoming card), so this doesn't reuse the
     single-element crossfade() helper above. */
  function switchTo(id) {
    if (id === current || animating || !current) return;
    const fromCard = byId.get(current);
    const toCard = byId.get(id);
    if (!toCard) return;
    animating = true;
    current = id;

    const fromEl = fromCard.el;
    const toEl = toCard.el;
    const fromStory = fromEl.querySelector("[data-story]");
    if (fromStory) fromStory.classList.remove("is-in");

    const finish = () => {
      fromEl.classList.remove("is-expanded");
      fromStory?.remove();
      fromEl.style.transition = "";
      fromEl.style.opacity = "";
      fromEl.style.transform = "";
      fromEl.classList.add("is-hidden");

      const others = cards.filter((c) => c.project.id !== id);
      others.forEach((c) => c.el.classList.add("is-hidden"));
      toEl.classList.remove("is-hidden");
      toEl.classList.add("is-expanded");
      toEl.insertAdjacentHTML("beforeend", storyMarkup(toCard.project, others));
      revealHero(toEl);
      initCounters(toEl);

      if (REDUCE) {
        animating = false;
      } else {
        toEl.style.transition = "none";
        toEl.style.opacity = "0";
        toEl.style.transform = "translateY(10px)";
        void toEl.offsetWidth;
        requestAnimationFrame(() => {
          toEl.style.transition = `opacity ${FADE_IN}ms ease, transform ${FADE_IN}ms ease`;
          toEl.style.opacity = "1";
          toEl.style.transform = "none";
          setTimeout(() => {
            toEl.style.transition = "";
            toEl.style.opacity = "";
            toEl.style.transform = "";
            animating = false;
          }, FADE_IN);
        });
      }

      const story = toEl.querySelector("[data-story]");
      requestAnimationFrame(() => story.classList.add("is-in"));
      toEl.querySelectorAll("[data-switch]").forEach((btn) => {
        btn.addEventListener("click", () => switchTo(btn.dataset.switch));
      });
    };

    if (REDUCE) {
      finish();
    } else {
      fromEl.style.transition = `opacity ${FADE_OUT}ms ease, transform ${FADE_OUT}ms ease`;
      fromEl.style.transform = "translateY(-8px)";
      fromEl.style.opacity = "0";
      setTimeout(finish, FADE_OUT);
    }

    history.pushState({ deepdive: id }, "", `#case-${id}`);
  }

  cards.forEach(({ el, project }) => {
    el.querySelector(".case__cta").addEventListener("click", () => open(project.id));
    el.querySelector(".case__back").addEventListener("click", () => close());
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && current) close();
  });

  window.addEventListener("popstate", () => {
    if (current && !location.hash.includes(`case-${current}`)) close({ pushState: false });
  });

  // deep-link support: landing on #case-<id> opens it immediately, no animation
  const match = /^#case-(.+)$/.exec(location.hash);
  if (match && byId.has(match[1])) {
    const card = byId.get(match[1]);
    const { el, project } = card;
    const others = cards.filter((c) => c.project.id !== match[1]);
    root.classList.add("has-expanded");
    others.forEach((c) => c.el.classList.add("is-hidden"));
    stack.pause();
    document.body.classList.add("no-scroll");
    el.classList.add("is-expanded");
    el.insertAdjacentHTML("beforeend", storyMarkup(project, others));
    revealHero(el);
    el.querySelector("[data-story]").classList.add("is-in");
    el.querySelectorAll("[data-switch]").forEach((btn) => {
      btn.addEventListener("click", () => switchTo(btn.dataset.switch));
    });
    initCounters(el);
    current = match[1];
  }
}
