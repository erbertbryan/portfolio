/* Tech stack — real vendor marks, served from public/brand/tools/.

   Three tile treatments:
   - default: our white tile + 21% padding around a bare mark
   - `flush`: the artwork bakes its own dark background square (Codex), so
     it fills the tile edge-to-edge and needs no border of ours
   - `fill`:  the artwork is white with its own built-in padding
     (Jitter/Cursor/Claude) — it fills the tile like `flush`, but keeps our
     border, since a white square on a near-white page needs the edge */

/* Order matters twice over: expanded it reads left-to-right as design
   tools -> Figma -> AI/code tools, and collapsed the middle entry sits on
   top of the deck (highest z-index, see initTools). Figma is deliberately
   centred so it's the face of the pile. */
const TOOLS = [
  { name: "Adobe", src: "/brand/tools/adobe.webp", bg: "#ffffff" },
  { name: "Magnific", src: "/brand/tools/magnific.webp", bg: "#ffffff" },
  { name: "Framer", src: "/brand/tools/framer.svg", bg: "#ffffff" },
  { name: "Jitter", src: "/brand/tools/jitter.svg", fill: true, bg: "#ffffff" },
  { name: "Figma", src: "/brand/tools/figma.svg", bg: "#ffffff" }, // centre = top of deck
  { name: "Cursor", src: "/brand/tools/cursor.svg", fill: true, bg: "#ffffff" },
  { name: "Codex", src: "/brand/tools/codex.svg", flush: true },
  { name: "Claude", src: "/brand/tools/claude.webp", fill: true, bg: "#ffffff" },
  { name: "Gemini", src: "/brand/tools/gemini.webp", bg: "#ffffff" },
];

export function initTools() {
  const root = document.querySelector("[data-tools]");
  if (!root) return;

  const mid = (TOOLS.length - 1) / 2;

  TOOLS.forEach((t, i) => {
    const li = document.createElement("li");
    li.className = "tool";
    // --i drives the piled-up transform: offset from the middle card, so the
    // deck fans symmetrically. --z keeps the centre card on top.
    li.style.setProperty("--i", (i - mid).toFixed(2));
    li.style.setProperty("--z", String(TOOLS.length - Math.abs(i - mid)));
    li.innerHTML = `
      <span class="tool__tile${t.flush ? " tool__tile--flush" : ""}${
        t.fill ? " tool__tile--fill" : ""
      }" style="${t.flush ? "" : `--tile:${t.bg}`}">
        <img src="${t.src}" alt="${t.name}" loading="lazy" decoding="async" draggable="false" />
      </span>
      <span class="tool__name">${t.name}</span>`;
    root.appendChild(li);
  });

  const items = [...root.children];

  /* How far each tool has to travel to reach the pile, measured from its
     real laid-out position rather than derived from index × width. The
     list wraps on narrow screens, so anything that assumes one unbroken
     row throws the wrapped items across the page.

     Measured in the expanded state — the stacked state only ever applies
     transforms, never changes layout, so these stay valid. */
  const measure = () => {
    const stacked = root.classList.contains("is-stacked");
    root.classList.add("is-measuring"); // suppress transitions while we flip
    root.classList.remove("is-stacked");

    const box = root.getBoundingClientRect();
    const cx = box.left + box.width / 2;
    const rects = items.map((li) => li.getBoundingClientRect());
    const firstRowTop = Math.min(...rects.map((r) => r.top));
    const rowHeight = Math.max(
      ...rects.filter((r) => r.top === firstRowTop).map((r) => r.height)
    );

    items.forEach((li, i) => {
      const r = rects[i];
      li.style.setProperty("--dx", (cx - (r.left + r.width / 2)).toFixed(1));
      li.style.setProperty("--dy", (firstRowTop - r.top).toFixed(1));
    });
    // collapse the section to a single row's height while piled, so a
    // wrapped list doesn't leave rows of empty space under the deck
    root.style.setProperty("--deck-h", `${Math.round(rowHeight)}px`);

    if (stacked) root.classList.add("is-stacked");
    void root.offsetWidth; // commit before transitions come back
    root.classList.remove("is-measuring");
  };

  measure();
  window.addEventListener("resize", () => {
    clearTimeout(root._measureTimer);
    root._measureTimer = setTimeout(measure, 150);
  });

  /* Click the pile to fan the tools out, click again to stack them back.
     The stacked state is the initial one, so the section reads as a single
     object until someone asks to see inside it. */
  const toggle = () => {
    const stacked = root.classList.toggle("is-stacked");
    root.setAttribute("aria-expanded", String(!stacked));
    root.setAttribute("aria-label", stacked ? "Expand the tech stack" : "Stack the tech stack back");
  };

  root.addEventListener("click", toggle);
  root.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  });
}
