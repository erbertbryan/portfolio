/* ------------------------------------------------------------
   Inertial wheel scrolling.

   Deliberately drives the real scroll position rather than
   transforming a wrapper — the work cards rely on position:sticky,
   which a transformed container would break.

   Only takes over the mouse wheel. Touch, keyboard, scrollbar
   dragging and anchor jumps are left to the browser, and the target
   re-syncs whenever any of those move the page.

   An open deep dive (.case.is-expanded) is its own position:fixed,
   overflow-y:auto element rather than the document — plain page
   scroll can't reach it. It's still a full page as far as the user's
   concerned though, so it gets the same eased scrolling as the
   document does, not the "leave it to the browser" treatment a
   genuinely small inner scroller (a code block, a dropdown) gets.
   `host` tracks whichever of the two is currently under the wheel;
   every other inner scroller still opts out via scrollableAncestor()
   same as always.
   ------------------------------------------------------------ */

const EASE = 0.12; // fraction closed per 60fps frame

// climbs from the wheel/scroll target looking for something to hand
// control to instead of the document: an open deep dive's own scroll
// box (still wants the eased treatment — see file header), or a
// genuinely independent inner scroller (a code block, a dropdown —
// wheeling over those should just scroll them natively, untouched)
function scrollableAncestor(node) {
  let el = node instanceof Element ? node : null;
  while (el && el !== document.body && el !== document.documentElement) {
    if (el.classList.contains("case") && el.classList.contains("is-expanded")) {
      return el;
    }
    const oy = getComputedStyle(el).overflowY;
    if ((oy === "auto" || oy === "scroll") && el.scrollHeight > el.clientHeight) {
      return el;
    }
    el = el.parentElement;
  }
  return null;
}

export function initSmoothScroll() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = window.matchMedia("(pointer: coarse)").matches;

  // native scrolling is better on touch, and reduced-motion means jump
  if (reduce || coarse) {
    initAnchors(null);
    return;
  }

  // null = the document itself; otherwise an open deep dive's own
  // scroll element. Whichever it is, every position read/write below
  // goes through getScroll/setScroll rather than touching window or
  // the element directly, so the easing logic itself never needs to
  // know which one it's driving.
  let host = null;
  let target = window.scrollY;
  let current = target;
  let raf = null;
  let driving = false;
  let last = 0;

  const getScroll = () => (host ? host.scrollTop : window.scrollY);
  const setScroll = (v) => {
    if (host) host.scrollTop = v;
    // 'instant' bypasses the CSS scroll-behavior:smooth used for anchors,
    // which would otherwise fight this animation
    else window.scrollTo({ top: v, behavior: "instant" });
  };
  const maxScroll = () =>
    host
      ? Math.max(0, host.scrollHeight - host.clientHeight)
      : Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

  const tick = (now) => {
    const dt = last ? Math.min(now - last, 50) : 16.67;
    last = now;

    // Re-clamp every frame against the *current* page height. Lazy media and
    // reveal animations can shorten the document mid-glide; without this the
    // target can sit past the end, and we keep writing a scroll position the
    // browser clamps back — the two fighting each frame is what jitters.
    const max = maxScroll();
    if (target > max) target = max;
    if (current > max) current = max;

    // frame-rate independent easing, so 165Hz doesn't glide faster than 60Hz
    const k = 1 - Math.pow(1 - EASE, dt / 16.67);
    current += (target - current) * k;

    if (Math.abs(target - current) < 0.5) {
      current = target;
      setScroll(current);
      raf = null;
      last = 0;
      driving = false;
      return;
    }

    setScroll(current);
    raf = requestAnimationFrame(tick);
  };

  const onWheel = (e) => {
    if (e.ctrlKey || e.metaKey) return; // zoom gesture
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; // horizontal
    // rAF is suspended while the document is hidden — never swallow the
    // wheel when we have no way to animate the page ourselves
    if (document.hidden) return;

    const ancestor = scrollableAncestor(e.target);
    const isDeepDive = ancestor && ancestor.classList.contains("is-expanded");
    if (ancestor && !isDeepDive) return; // a genuine unrelated inner scroller — let it work natively

    const nextHost = isDeepDive ? ancestor : null;
    // pick up wherever we actually are. `target` has to be rebased too, not
    // just `current`: anything that moved the page without us (anchor jump,
    // keyboard, scrollbar drag, a programmatic scrollBy, the browser
    // clamping at the very bottom, or — new here — switching which element
    // we're even scrolling) leaves a stale target behind, and adding this
    // delta to it would fling the page somewhere unrelated.
    if (!driving || nextHost !== host) {
      host = nextHost;
      target = current = getScroll();
    }
    driving = true;
    target = Math.max(0, Math.min(maxScroll(), target + e.deltaY));
    e.preventDefault();
    if (!raf) raf = requestAnimationFrame(tick);
  };

  // anything that isn't us (anchors, keyboard, scrollbar) resets the
  // target — capture:true so this still fires for a scroll on the deep
  // dive's own element, which (unlike the document) doesn't bubble one
  // up to window
  const onScroll = () => {
    if (!driving) {
      target = current = getScroll();
    }
  };

  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("scroll", onScroll, { passive: true, capture: true });
  window.addEventListener("resize", onScroll, { passive: true });

  // anchor jumps ride the same easing, so there is only ever one system
  // moving the page. Always against the document — nothing inside a deep
  // dive links to an in-page anchor.
  initAnchors((y) => {
    host = null;
    const dest = Math.max(0, Math.min(maxScroll(), y));
    if (document.hidden) {
      // no rAF to ease with — just land on it
      target = current = dest;
      window.scrollTo({ top: dest, behavior: "instant" });
      return;
    }
    if (!driving) current = window.scrollY;
    driving = true;
    target = dest;
    if (!raf) raf = requestAnimationFrame(tick);
  });
}

/* in-page links. `glide` is null when the eased scroller is switched off,
   in which case we fall back to a plain jump. */
function initAnchors(glide) {
  document.addEventListener("click", (e) => {
    const a = e.target instanceof Element ? e.target.closest('a[href^="#"]') : null;
    if (!a) return;

    const id = a.getAttribute("href");
    if (!id || id === "#") return;

    const el = id === "#top" ? document.body : document.querySelector(id);
    if (!el) return;

    e.preventDefault();
    const y = id === "#top" ? 0 : window.scrollY + el.getBoundingClientRect().top;

    if (glide) glide(y);
    else window.scrollTo({ top: y, behavior: "instant" });

    history.replaceState(null, "", id);
  });
}
