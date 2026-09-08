/* Reveals, nav state, magnetic buttons, misc. */

function splitLines() {
  document.querySelectorAll("[data-reveal-lines]").forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = "";
    words.forEach((w, i) => {
      const span = document.createElement("span");
      span.className = "reveal-line";
      span.textContent = w + " ";
      span.style.display = "inline-block";
      span.style.transitionDelay = `${i * 45}ms`;
      el.appendChild(span);
    });
  });
}

function initReveals() {
  const targets = document.querySelectorAll("[data-reveal], .reveal-line");
  const io = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );
  targets.forEach((t) => io.observe(t));
}

function initNav() {
  const nav = document.querySelector("[data-nav]");
  if (!nav) return;
  const onScroll = () => nav.classList.toggle("is-stuck", window.scrollY > 12);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

function initMagnetic() {
  if (window.matchMedia("(hover: none)").matches) return;
  document.querySelectorAll("[data-magnetic]").forEach((el) => {
    const strength = 0.28;
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    });
    el.addEventListener("mouseleave", () => {
      el.style.transform = "";
      el.style.transition = "transform .5s cubic-bezier(.16,1,.3,1)";
      setTimeout(() => (el.style.transition = ""), 500);
    });
  });
}

/* click-to-copy (footer email) */
function initCopy() {
  document.querySelectorAll("[data-copy]").forEach((btn) => {
    let timer = null;

    const flash = () => {
      btn.classList.add("is-copied");
      clearTimeout(timer);
      timer = setTimeout(() => btn.classList.remove("is-copied"), 1800);
    };

    btn.addEventListener("click", async () => {
      const text = btn.dataset.copy;
      try {
        await navigator.clipboard.writeText(text);
        flash();
      } catch {
        // clipboard API needs a secure context — fall back to a temp selection
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.cssText = "position:fixed;top:0;left:-9999px;opacity:0";
        document.body.appendChild(ta);
        ta.select();
        let ok = false;
        try {
          ok = document.execCommand("copy");
        } catch {
          // execCommand throws in some locked-down contexts — ok stays false
          // and we fall through to the manual-selection path below
        }
        ta.remove();

        if (ok) {
          flash();
        } else {
          // last resort: select the visible address so it can be copied by hand
          const label = btn.querySelector(".footer__mail-text") || btn;
          const range = document.createRange();
          range.selectNodeContents(label);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }
    });
  });
}

function misc() {
  const y = document.querySelector("[data-year]");
  if (y) y.textContent = new Date().getFullYear();
}

export function initUI() {
  splitLines();
  initReveals();
  initNav();
  initMagnetic();
  initCopy();
  misc();
}
