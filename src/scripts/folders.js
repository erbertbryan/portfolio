/* ------------------------------------------------------------
   "Beyond the work" — desktop folders sitting under the About bio.
   Closed: a manila folder icon with its label beneath it.
   Click: the icon fades into a Macintosh-style window spanning the
   full body width, its head becoming the title bar (with the icon now
   a minimize control) over an auto-scrolling filmstrip of tilted
   photos. Click minimize (or press Escape) to reverse it.
   ------------------------------------------------------------ */

import { folders } from "../data/folders.js";

const REDUCE = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const ICON_MINIMIZE =
  '<path d="M213.66,53.66,163.31,104H192a8,8,0,0,1,0,16H144a8,8,0,0,1-8-8V64a8,8,0,0,1,16,0V92.69l50.34-50.35a8,8,0,0,1,11.32,11.32ZM112,136H64a8,8,0,0,0,0,16H92.69L42.34,202.34a8,8,0,0,0,11.32,11.32L104,163.31V192a8,8,0,0,0,16,0V144A8,8,0,0,0,112,136Z"/>';

/* both the folder image and the minimize glyph live in the DOM at once,
   so switching is a class toggle that CSS crossfades — no innerHTML
   swap mid-animation. */
function setIconState(icon, open, ariaLabel) {
  icon.classList.toggle("is-open", open);
  icon.setAttribute("aria-label", ariaLabel);
}

/* Fade the card out, apply the open/close layout while it's invisible,
   fade back in. Deliberately NOT a FLIP: a small desktop icon and a
   full-width window are different enough in position that tweening
   between them read as the panel sliding across the page. Fading in
   place keeps the swap calm. */
const FADE_OUT = 160;
const FADE_IN = 260;

/* Growing the card from an icon to a 400px window reflows the page under
   it, and the smooth-scroll module then eases the document to its new
   height — which reads as the window flying up from below. Pinning the
   card's viewport position across the mutation makes it expand downward
   from where it already sat instead. */
function keepInPlace(el, mutate) {
  const before = el.getBoundingClientRect().top;
  mutate();
  const after = el.getBoundingClientRect().top;
  const drift = after - before;
  if (Math.abs(drift) > 0.5) window.scrollBy({ top: drift, behavior: "instant" });
}

function fadeSwap(el, mutate) {
  return new Promise((resolve) => {
    if (REDUCE) {
      keepInPlace(el, mutate);
      resolve();
      return;
    }
    el.style.transition = `opacity ${FADE_OUT}ms ease`;
    el.style.opacity = "0";
    setTimeout(() => {
      // both the layout change and the scroll correction happen while the
      // card is invisible, so neither is ever seen moving
      keepInPlace(el, mutate);
      void el.offsetWidth;
      el.style.transition = `opacity ${FADE_IN}ms ease`;
      el.style.opacity = "1";
      setTimeout(() => {
        el.style.transition = "";
        el.style.opacity = "";
        resolve();
      }, FADE_IN);
    }, FADE_OUT);
  });
}

/* a small seeded LCG rather than Math.random() — the photo run gets
   duplicated as a string (see below) for a seamless loop, so both
   copies need to land on identical overlap values */
function photoMarkup(folder) {
  let seed = 7;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const cards = folder.photos
    .map((p, i) => {
      // ~1 in 3 photos sits pulled in slightly over the one before it
      const overlap = i > 0 && rand() < 0.34 ? 10 + rand() * 16 : 0;
      // a touch of per-photo vertical jitter for folders that opt in —
      // enough to read as an organic scatter, not enough to look messy
      const drift = folder.scatter ? (rand() - 0.5) * 18 : 0;
      const style = `--rot:${p.rot}deg; --drift:${drift.toFixed(1)}px; --tint:${folder.accent};${
        overlap ? ` margin-left:-${overlap.toFixed(0)}px;` : ""
      }`;
      return `
      <figure class="folder__photo" style="${style}">
        <div class="folder__photo-frame${p.src ? " has-img" : ""}">
          ${
            p.src
              ? `<img src="${p.src}" alt="" loading="lazy" decoding="async" draggable="false" />`
              : ""
          }
          ${p.caption ? `<figcaption>${p.caption}</figcaption>` : ""}
        </div>
      </figure>`;
    })
    .join("");
  // duplicate the run so the auto-scroll can loop seamlessly
  return cards + cards;
}

const BASE_SPEED = -0.26; // steady autoplay drift, px/frame
const MAX_FLICK = 6; // hard cap on release speed, px/frame — "not too fast"
const FRICTION = 0.05; // per-frame ease from flick speed back to BASE_SPEED

function buildStrip(folder) {
  const strip = document.createElement("div");
  strip.className = "folder__strip";
  strip.innerHTML = `<div class="folder__track">${photoMarkup(folder)}</div>`;

  const track = strip.querySelector(".folder__track");
  let x = 0;
  let half = 0;
  let raf = null;
  let dragging = false;
  let dragFromX = 0;
  let dragFromTrackX = 0;
  let velocity = 0; // px/ms, smoothed
  let lastMoveX = 0;
  let lastMoveT = 0;
  let speed = BASE_SPEED; // current per-frame drift, eases toward BASE_SPEED

  const measure = () => {
    half = track.scrollWidth / 2;
  };
  const apply = () => {
    track.style.transform = `translate3d(${x}px,0,0)`;
  };
  const wrap = () => {
    while (x <= -half) x += half;
    while (x > 0) x -= half;
  };
  // every frame eases toward the steady drift rather than snapping to it,
  // so a released flick decelerates smoothly instead of jump-cutting
  const frame = () => {
    if (!REDUCE && !dragging && half) {
      speed += (BASE_SPEED - speed) * FRICTION;
      x += speed;
      wrap();
      apply();
    }
    raf = requestAnimationFrame(frame);
  };

  const onPointerDown = (e) => {
    dragging = true;
    strip.classList.add("is-dragging");
    dragFromX = e.clientX;
    dragFromTrackX = x;
    lastMoveX = e.clientX;
    lastMoveT = performance.now();
    velocity = 0;
    strip.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!dragging) return;
    const now = performance.now();
    const dt = now - lastMoveT;
    if (dt > 0) {
      const instant = (e.clientX - lastMoveX) / dt; // px/ms
      velocity = velocity * 0.7 + instant * 0.3;
    }
    lastMoveX = e.clientX;
    lastMoveT = now;

    x = dragFromTrackX + (e.clientX - dragFromX);
    if (half) wrap();
    apply();
  };
  const onPointerUp = (e) => {
    if (!dragging) return;
    dragging = false;
    strip.classList.remove("is-dragging");
    strip.releasePointerCapture(e.pointerId);
    // hand off the flick's momentum to frame()'s easing, clamped so an
    // aggressive flick doesn't send the strip flying
    speed = Math.max(-MAX_FLICK, Math.min(MAX_FLICK, velocity * 16.67));
  };

  if (!REDUCE) {
    strip.addEventListener("pointerdown", onPointerDown);
    strip.addEventListener("pointermove", onPointerMove);
    strip.addEventListener("pointerup", onPointerUp);
    strip.addEventListener("pointercancel", onPointerUp);
  }

  strip._start = () => {
    measure();
    if (!raf) frame();
  };
  strip._stop = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = null;
    dragging = false;
    speed = BASE_SPEED;
  };
  window.addEventListener("resize", measure);
  return strip;
}

export function initFolders() {
  const root = document.querySelector("[data-folders]");
  if (!root) return;

  let openId = null;
  let animating = false;

  const els = folders.map((folder) => {
    const card = document.createElement("article");
    card.className = "folder";
    card.dataset.folderId = folder.id;
    card.setAttribute("data-clickable", "");
    card.style.setProperty("--folder-accent", folder.accent);
    card.innerHTML = `
      <span class="folder__tick tl" aria-hidden="true"></span>
      <span class="folder__tick tr" aria-hidden="true"></span>
      <span class="folder__tick bl" aria-hidden="true"></span>
      <span class="folder__tick br" aria-hidden="true"></span>

      <div class="folder__head">
        <button class="folder__icon" type="button" aria-label="Open ${folder.label}">
          <img class="folder__icon-img" src="/brand/ui/folder.webp" alt="" draggable="false" />
          <svg class="folder__icon-glyph" viewBox="0 0 256 256">${ICON_MINIMIZE}</svg>
        </button>
        <div class="folder__labels">
          <span class="folder__label">${folder.label}</span>
          <span class="folder__hint">${folder.hint}</span>
        </div>
      </div>`;
    root.appendChild(card);

    const strip = buildStrip(folder);
    card.appendChild(strip);

    return {
      folder,
      card,
      icon: card.querySelector(".folder__icon"),
      strip,
    };
  });

  const byId = new Map(els.map((e) => [e.folder.id, e]));

  function open(id) {
    if (animating || openId === id) return;
    const entry = byId.get(id);
    if (!entry) return;
    animating = true;
    openId = id;

    const { card, icon, strip } = entry;
    const others = els.filter((e) => e.folder.id !== id);
    others.forEach((e) => e.card.classList.add("is-hidden"));

    fadeSwap(card, () => {
      card.classList.add("is-open");
      setIconState(icon, true, `Close ${entry.folder.label}`);
    }).then(() => {
      animating = false;
      requestAnimationFrame(() => card.classList.add("is-in"));
      strip._start();
    });
  }

  function close() {
    if (animating || !openId) return;
    const entry = byId.get(openId);
    animating = true;
    const closingId = openId;
    openId = null;

    const { card, icon, strip } = entry;
    strip._stop();
    card.classList.remove("is-in");

    fadeSwap(card, () => {
      card.classList.remove("is-open");
      setIconState(icon, false, `Open ${entry.folder.label}`);
      // siblings come back while the card is still faded out, so the
      // whole icon row reappears in place rather than shifting after
      els
        .filter((e) => e.folder.id !== closingId)
        .forEach((e) => e.card.classList.remove("is-hidden"));
    }).then(() => {
      animating = false;
    });
  }

  els.forEach(({ folder, card, icon }) => {
    icon.addEventListener("click", (e) => {
      e.stopPropagation();
      if (openId === folder.id) close();
      else open(folder.id);
    });
    // anywhere else on a closed card opens it too — the icon alone is the
    // (much smaller) target once it becomes the minimize control
    card.addEventListener("click", () => {
      if (openId !== folder.id) open(folder.id);
    });
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && openId) close();
  });
}
