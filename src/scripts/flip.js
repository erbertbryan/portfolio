/* FLIP (First, Last, Invert, Play): capture element rects, run a
   synchronous DOM mutation, then animate from the old rects to the new
   ones. Because the mutation and the "first" capture happen in the same
   tick, the browser never paints the jump — only the eased transform.
   Shared by deepdive.js and folders.js. */

function invertAndPlay(el, first, last, duration) {
  const dx = first.left - last.left;
  const dy = first.top - last.top;
  const sx = last.width ? first.width / last.width : 1;
  const sy = last.height ? first.height / last.height : 1;

  if (!dx && !dy && Math.abs(sx - 1) < 0.001 && Math.abs(sy - 1) < 0.001) {
    return Promise.resolve();
  }

  el.style.transformOrigin = "top left";
  el.style.transition = "none";
  el.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
  el.getBoundingClientRect(); // force the browser to commit the line above

  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      el.style.transition = `transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
      el.style.transform = "none";
      const done = () => {
        el.removeEventListener("transitionend", done);
        el.style.transition = "";
        el.style.transformOrigin = "";
        resolve();
      };
      el.addEventListener("transitionend", done, { once: true });
    });
  });
}

/** FLIP a single element around a synchronous `mutate()` call. */
export function flip(el, mutate, { duration = 560, reduce = false } = {}) {
  if (reduce) {
    mutate();
    return Promise.resolve();
  }
  const first = el.getBoundingClientRect();
  mutate();
  const last = el.getBoundingClientRect();
  return invertAndPlay(el, first, last, duration);
}

/** FLIP several elements at once around one shared `mutate()` call —
    each element's own before/after rects are captured independently,
    so unrelated elements (e.g. a card's border and an icon inside it)
    can each animate correctly even if they move differently.

    Both passes (`firsts` and `lasts`) are collected in full before any
    invert transform is applied. Applying invert-transforms one element
    at a time would corrupt the "last" measurement of any element
    nested inside an element already processed — its rendered rect
    would reflect the ancestor's just-applied transform instead of the
    real post-mutation layout. */
export function flipMany(elements, mutate, { duration = 560, reduce = false } = {}) {
  if (reduce) {
    mutate();
    return Promise.resolve();
  }
  const firsts = elements.map((el) => el.getBoundingClientRect());
  mutate();
  const lasts = elements.map((el) => el.getBoundingClientRect());
  return Promise.all(elements.map((el, i) => invertAndPlay(el, firsts[i], lasts[i], duration)));
}
