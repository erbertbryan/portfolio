/* Tech stack — real vendor marks, served from public/brand/tools/.
   `flush` icons already bake their own background square into the
   artwork (Jitter/Cursor/Codex), so they fill the tile edge-to-edge
   instead of sitting on our own background + padding. */

const TOOLS = [
  { name: "Figma", src: "/brand/tools/figma.svg", bg: "#ffffff" },
  { name: "Framer", src: "/brand/tools/framer.svg", bg: "#ffffff" },
  { name: "Jitter", src: "/brand/tools/jitter.svg", flush: true },
  { name: "Cursor", src: "/brand/tools/cursor.svg", flush: true },
  { name: "Codex", src: "/brand/tools/codex.svg", flush: true },
  { name: "Claude", src: "/brand/tools/claude.webp", bg: "#F4EDE4" },
  { name: "Magnific", src: "/brand/tools/magnific.webp", bg: "#ffffff" },
  { name: "Gemini", src: "/brand/tools/gemini.webp", bg: "#ffffff" },
  { name: "Adobe", src: "/brand/tools/adobe.webp", bg: "#ffffff" },
];

export function initTools() {
  const root = document.querySelector("[data-tools]");
  if (!root) return;

  TOOLS.forEach((t) => {
    const li = document.createElement("li");
    li.className = "tool";
    li.innerHTML = `
      <span class="tool__tile${t.flush ? " tool__tile--flush" : ""}"
            style="${t.flush ? "" : `--tile:${t.bg}`}">
        <img src="${t.src}" alt="${t.name}" loading="lazy" decoding="async" draggable="false" />
      </span>
      <span class="tool__name">${t.name}</span>`;
    root.appendChild(li);
  });
}
