import "../styles/style.css";
import { initHero } from "./hero.js";
import { initProcessTabs } from "./processTabs.js";
import { initWorks } from "./works.js";
import { initUI } from "./ui.js";
import { initBrand } from "./brand.js";
import { initTools } from "./tools.js";
import { initSmoothScroll } from "./smoothScroll.js";
import { initFolders } from "./folders.js";

function boot() {
  initSmoothScroll();
  initBrand();
  initWorks(); // build project DOM first so reveals can observe them
  initTools();
  initProcessTabs();
  initHero();
  initFolders();
  initUI();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
