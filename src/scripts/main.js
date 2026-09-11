import "../styles/style.css";
import { initHero } from "./hero.js";
import { initProcessTabs } from "./processTabs.js";
import { initWorks } from "./works.js";
import { initUI } from "./ui.js";
import { initBrand } from "./brand.js";
import { initTools } from "./tools.js";
import { initSmoothScroll } from "./smoothScroll.js";
import { initFolders } from "./folders.js";

// see the inline script in index.html's <head> — it stashes location.hash
// here and strips it from the URL so the browser doesn't jump to it before
// the sections above it (built below) have grown to their real height.
// Waiting on document.fonts.ready too, not just the DOM being built: the
// heading/display fonts load off a deliberately async stylesheet (see
// index.html), so swapping them in still reflows everything after boot()
// returns — scrolling before that swap lands us short, right back where
// this fix started.
async function restorePendingHash() {
  const hash = window.__pendingHash;
  if (!hash) return;
  delete window.__pendingHash;
  const el = document.getElementById(hash.slice(1));
  if (!el) return;
  try {
    await document.fonts.ready;
  } catch {
    // font loading can reject in odd environments — fall through and
    // scroll anyway rather than strand the page mid-navigation
  }
  history.replaceState(null, "", location.pathname + location.search + hash);
  el.scrollIntoView({ behavior: "auto", block: "start" });
}

function boot() {
  initSmoothScroll();
  initBrand();
  initWorks(); // build project DOM first so reveals can observe them
  initTools();
  initProcessTabs();
  initHero();
  initFolders();
  initUI();
  restorePendingHash();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
