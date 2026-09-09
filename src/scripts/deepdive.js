/* ------------------------------------------------------------
   Deep dive — expands a case card in place into a full case-study
   page: no navigation, no loading state.

   Opening/closing is a staged transition: the nav slides up, the
   card's frame slides into place and shrinks to a compact header
   (roughly half its closed-card size — see .case.is-expanded in
   style.css), then the Back pill slides down. Two different mechanisms
   share that middle step, deliberately not one scale transform for
   both: the frame's own width never changes between closed and
   expanded (both stay full-bleed), only its height does, so a single
   rigid scale can't shrink the video/title and reposition the card at
   once without distorting one of them. flipPosition() below only
   compensates for the small sticky -> fixed jump (a translate, no
   scale); the actual shrink is real height/width/font-size
   transitions on the frame/video/title, triggered by the same
   .is-expanded class toggle and left to animate on their own terms.

   Only the "Back" pill stays pinned as you scroll — the header itself
   scrolls away like the rest of the page. Switching between two open
   deep dives still crossfades directly from one to the other (their
   content genuinely differs card to card, and neither the nav nor the
   list position is involved), never visiting the closed-card state.
   ------------------------------------------------------------ */

import { showcase } from "./works.js";

const REDUCE = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const FADE_OUT = REDUCE ? 0 : 220;
const FADE_IN = REDUCE ? 0 : 360;
const NAV_MS = REDUCE ? 0 : 320;
// matches .case__frame/.case__title/.showcase--hero's own transition
// duration in style.css (the resize) — this is only the position slide,
// but keeping them equal is what makes the two read as one movement
const FLIP_MS = REDUCE ? 0 : 640;
const BACK_MS = REDUCE ? 0 : 300;

const ARROW_FWD = '<svg viewBox="0 0 24 24"><path d="M5 12h13M13 6l6 6-6 6"/></svg>';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/* Position-only FLIP: measure el's current top, run `apply` (expected
   to change el into its new layout synchronously — e.g. toggling
   .is-expanded, which switches it from position: sticky to fixed),
   measure where it landed, then animate a translateY from the old spot
   to the new one so it visually slides into place instead of jump-
   cutting. No scale on purpose — see the file header for why the
   resize itself is left to real CSS transitions instead. Always takes
   the full FLIP_MS, even when dy is 0, so it stays in step with those
   transitions (also FLIP_MS) regardless of how far the card moves. */
function flipPosition(el, apply) {
  return new Promise((resolve) => {
    const first = el.getBoundingClientRect();
    apply();
    if (REDUCE) {
      resolve();
      return;
    }
    void el.offsetWidth;
    const last = el.getBoundingClientRect();
    const dy = first.top - last.top;

    if (!dy) {
      setTimeout(resolve, FLIP_MS);
      return;
    }
    el.style.transition = "none";
    el.style.transform = `translateY(${dy}px)`;
    void el.offsetWidth;
    requestAnimationFrame(() => {
      el.style.transition = `transform ${FLIP_MS}ms var(--ease)`;
      el.style.transform = "none";
      setTimeout(() => {
        el.style.transition = "";
        el.style.transform = "";
        resolve();
      }, FLIP_MS);
    });
  });
}

function slideNav(hide) {
  document.querySelector(".nav")?.classList.toggle("is-hidden", hide);
}

/* the Back pill's resting show/hide is the .is-expanded display toggle
   in style.css — these two only drive the brief transition between
   those resting states, sliding it down into its pinned spot as a deep
   dive opens and back up out of the way as one closes. */
function slideBackIn(backWrap) {
  return new Promise((resolve) => {
    if (!backWrap || REDUCE) {
      resolve();
      return;
    }
    backWrap.style.display = "block";
    backWrap.style.transition = "none";
    backWrap.style.transform = "translateY(-100%)";
    void backWrap.offsetWidth;
    requestAnimationFrame(() => {
      backWrap.style.transition = "";
      backWrap.style.transform = "";
      setTimeout(resolve, BACK_MS);
    });
  });
}
function slideBackOut(backWrap) {
  return new Promise((resolve) => {
    if (!backWrap || REDUCE) {
      resolve();
      return;
    }
    backWrap.style.transition = `transform ${BACK_MS}ms var(--ease)`;
    backWrap.style.transform = "translateY(-100%)";
    setTimeout(() => {
      backWrap.style.display = "none";
      backWrap.style.transition = "";
      backWrap.style.transform = "";
      resolve();
    }, BACK_MS);
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
  // a percentage horizontal nudge — compensates for motion baked into the
  // source footage itself. Left as a data attribute rather than an inline
  // transform: a blind CSS percentage can push content past a narrow
  // viewport's edge, so initShiftedMedia measures real clearance in JS and
  // clamps to it before ever applying the transform.
  const shift = item.shiftX ? ` data-shift="${item.shiftX}"` : "";
  if (item.scrub) {
    // no autoplay/loop — initScrubVideos drives currentTime directly off
    // scroll position, so the clip only ever moves because the user
    // scrolled, in whichever direction they scrolled it
    return `<video src="${item.src}"${poster}${shift} muted playsinline preload="auto" data-scrub></video>`;
  }
  return `<video src="${item.src}"${poster}${shift} autoplay muted loop playsinline preload="metadata"></video>`;
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
        // an optional single media item (usually a video) that leads the
        // section, full width, above the centered paragraph — for a
        // showcase beat that isn't just another grid tile
        const leadHtml = s.lead ? `<div class="story__bento-lead">${mediaTag(s.lead)}</div>` : "";
        // some sections are pinned to pure white rather than following the
        // usual alternation — e.g. one whose lead media renders its own
        // white canvas, where any tint would show as a seam around it
        const white = s.onWhite ? " story__section--white" : "";
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
          <section class="story__section story__bento${alt}${white}" data-story-in>
            ${leadHtml}
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
        <section class="story__section story__bento${alt}${white}" data-story-in>
          ${leadHtml}
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

/* An open deep dive is position:fixed with its own overflow-y:auto — it
   locks <body>'s scroll and becomes the scrolling element itself, so a
   listener on window would never fire. Walk up to find whichever ancestor
   actually scrolls, the same way smoothScroll.js's scrollableAncestor()
   does for wheel events, falling back to window for markup used outside
   a locked container. */
/* data-shift (from an item's `shiftX`) nudges media horizontally to
   compensate for motion baked into the source itself — see the smash
   phone clip's own rightward drift. A blind CSS percentage can push
   content past a narrow viewport's edge, forcing a horizontal scrollbar
   or clipping against an ancestor's overflow; this measures the element's
   real clearance to the viewport edge (minus a thin gutter — the media
   is on a solid white ground with no visible seam, so it only needs to
   stop just short of the true edge, not stay clear of it) and clamps to
   whichever is smaller, so the nudge never crops or overflows on any
   screen size. */
function initShiftedMedia(root) {
  const els = root.querySelectorAll("[data-shift]");
  if (!els.length) return;
  const GUTTER = 4;

  const apply = (el) => {
    const pct = parseFloat(el.dataset.shift);
    if (Number.isNaN(pct)) return;
    el.style.transform = "none"; // measure the untransformed position first
    const r = el.getBoundingClientRect();
    const desired = (r.width * pct) / 100;
    const shift =
      desired < 0
        ? Math.max(desired, -(r.left - GUTTER))
        : Math.min(desired, window.innerWidth - r.right - GUTTER);
    el.style.transform = shift ? `translateX(${shift.toFixed(1)}px)` : "";
  };

  els.forEach(apply);
  // self-detach once every element from this open has left the page,
  // the same pattern initScrubVideos uses, so switching or closing deep
  // dives doesn't accumulate one resize listener per visit
  const onResize = () => {
    const live = [...els].filter((el) => el.isConnected);
    if (!live.length) {
      window.removeEventListener("resize", onResize);
      return;
    }
    live.forEach(apply);
  };
  window.addEventListener("resize", onResize);
}

function scrollHost(el) {
  let node = el.parentElement;
  while (node && node !== document.body) {
    const oy = getComputedStyle(node).overflowY;
    if ((oy === "auto" || oy === "scroll") && node.scrollHeight > node.clientHeight) {
      return node;
    }
    node = node.parentElement;
  }
  return window;
}

/* Videos marked data-scrub skip autoplay and loop entirely — scrolling
   (either direction) sets currentTime directly off how far the clip has
   travelled through its scroll container, so it plays forward or reverses
   exactly in step with the scroll that's driving it. */
function initScrubVideos(root) {
  const vids = root.querySelectorAll("video[data-scrub]");
  if (!vids.length) return;
  if (REDUCE) return; // the poster frame stands in; scrubbing is scroll-driven motion

  vids.forEach((v) => {
    const host = scrollHost(v);
    let raf = null;

    const apply = () => {
      // the deep dive can close (or switch to another project) while a
      // scroll from an earlier open is still queued for this handler —
      // self-detach the moment the video is no longer on the page rather
      // than chasing a node that's already gone
      if (!v.isConnected) {
        host.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
        return;
      }
      if (!v.duration) return; // metadata not ready yet

      // progress 0 as the element's top first reaches the viewport's
      // bottom edge (it's just entering), 1 once that top edge has risen
      // to 15% down from the top of the viewport — finishing near the top
      // of the screen while the clip is still fully visible there, rather
      // than mapping the last frame to the moment it scrolls out of view
      // (where nobody would ever actually see it land). Tied to viewport
      // height rather than the element's own, so the range doesn't shift
      // if this clip's display size ever changes. getBoundingClientRect is
      // viewport-relative no matter which element is actually doing the
      // scrolling, so only the event source above needed to change to fix
      // the locked-body case, not this math.
      const r = v.getBoundingClientRect();
      const startY = window.innerHeight;
      const endY = window.innerHeight * 0.15;
      const progress = Math.min(1, Math.max(0, (startY - r.top) / (startY - endY)));
      v.currentTime = progress * v.duration;
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        apply();
      });
    };

    host.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    // set the frame matching wherever the page already is the moment this
    // opens, rather than waiting for the next scroll to catch up
    if (v.readyState >= 1) apply();
    else v.addEventListener("loadedmetadata", apply, { once: true });
  });
}

export function initDeepDive(root, cards, stack) {
  const byId = new Map(cards.map((c) => [c.project.id, c]));
  let current = null;
  let animating = false;

  async function open(id) {
    if (animating || current === id) return;
    const card = byId.get(id);
    if (!card) return;
    animating = true;
    current = id;

    const { el, project } = card;
    const others = cards.filter((c) => c.project.id !== id);
    const backWrap = el.querySelector(".case__back-wrap");

    history.pushState({ deepdive: id }, "", `#case-${id}`);

    stack.pause(); // stop it fighting for el.style.transform mid-FLIP
    slideNav(true);

    await wait(NAV_MS);

    root.classList.add("has-expanded");
    others.forEach((c) => c.el.classList.add("is-hidden"));
    document.body.classList.add("no-scroll");

    await flipPosition(el, () => {
      el.classList.add("is-expanded");
      el.insertAdjacentHTML("beforeend", storyMarkup(project, others));
      revealHero(el);
    });

    await slideBackIn(backWrap);

    animating = false;
    const story = el.querySelector("[data-story]");
    requestAnimationFrame(() => story.classList.add("is-in"));
    el.querySelectorAll("[data-switch]").forEach((btn) => {
      btn.addEventListener("click", () => switchTo(btn.dataset.switch));
    });
    initCounters(el);
    initScrubVideos(el);
    initShiftedMedia(el);
  }

  async function close({ pushState = true } = {}) {
    if (animating || !current) return;
    const card = byId.get(current);
    animating = true;
    current = null;

    const { el } = card;
    const story = el.querySelector("[data-story]");
    if (story) story.classList.remove("is-in");
    const backWrap = el.querySelector(".case__back-wrap");

    // covers the whole close transition, not just its two endpoints —
    // keeps the hero-reveal observer (works.js) from reading a transient
    // "not intersecting" state as the card leaves its fixed/full-viewport
    // expanded layout and un-revealing an image the user was just looking at
    el.classList.add("is-settling");

    if (pushState) {
      const base = location.pathname + location.search;
      history.pushState({}, "", `${base}#works`);
    }

    // mirrors open()'s sequence in reverse: Back leaves first, then the
    // card shrinks back down to its spot in the list, then the nav
    // returns — each stage only makes sense once the previous is clear
    await slideBackOut(backWrap);

    await flipPosition(el, () => {
      el.classList.remove("is-expanded");
      story?.remove();
      root.classList.remove("has-expanded");
      cards.forEach((c) => c.el.classList.remove("is-hidden"));
      revealHero(el);
    });

    document.body.classList.remove("no-scroll");
    stack.resume();
    slideNav(false);
    await wait(NAV_MS);

    animating = false;
    revealHero(el);
    el.classList.remove("is-settling");
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
      initScrubVideos(toEl);
      initShiftedMedia(toEl);

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
    initScrubVideos(el);
    initShiftedMedia(el);
    current = match[1];
  }
}
