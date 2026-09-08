/* ------------------------------------------------------------
   Lightweight SVG "product screen" mockups.
   Abstract, on-brand placeholders — swap for real screenshots later.
   Every generator takes { accent, bg, ink } and returns an SVG string.
   ------------------------------------------------------------ */

const wrap = (vb, inner, bg) =>
  `<svg class="mock" viewBox="${vb}" preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;display:block">
     <rect width="100%" height="100%" fill="${bg}"/>${inner}
   </svg>`;

const soft = "rgba(23,19,13,0.06)";
const soft2 = "rgba(23,19,13,0.11)";

/* ---------- WEB: analytics dashboard ---------- */
export function webDash({ accent, bg = "#ffffff" }) {
  const bars = Array.from({ length: 7 }, (_, i) => {
    const h = 30 + ((i * 37) % 90);
    return `<rect x="${360 + i * 34}" y="${300 - h}" width="18" height="${h}" rx="5" fill="${
      i === 4 ? accent : soft2
    }"/>`;
  }).join("");
  return wrap(
    "0 0 640 400",
    `
    <rect x="0" y="0" width="150" height="400" fill="rgba(23,19,13,0.03)"/>
    <rect x="26" y="30" width="26" height="26" rx="8" fill="${accent}"/>
    ${[0, 1, 2, 3, 4]
      .map(
        (i) =>
          `<rect x="26" y="${86 + i * 34}" width="${i === 1 ? 96 : 74}" height="12" rx="6" fill="${
            i === 1 ? accent : soft
          }"/>`
      )
      .join("")}
    <rect x="186" y="30" width="120" height="16" rx="8" fill="${soft2}"/>
    <rect x="540" y="26" width="74" height="24" rx="12" fill="${accent}"/>
    <rect x="186" y="74" width="200" height="96" rx="16" fill="#fff" stroke="${soft}"/>
    <rect x="206" y="96" width="70" height="10" rx="5" fill="${soft2}"/>
    <text x="206" y="140" font-family="sans-serif" font-size="30" font-weight="700" fill="${accent}">72%</text>
    <rect x="402" y="74" width="212" height="96" rx="16" fill="#fff" stroke="${soft}"/>
    <rect x="422" y="96" width="60" height="10" rx="5" fill="${soft2}"/>
    <path d="M422 150 C452 120 470 138 500 112 S560 118 594 96" fill="none" stroke="${accent}" stroke-width="3"/>
    <rect x="186" y="196" width="428" height="178" rx="18" fill="#fff" stroke="${soft}"/>
    <rect x="210" y="220" width="90" height="12" rx="6" fill="${soft2}"/>
    ${bars}
    <line x1="360" y1="300" x2="580" y2="300" stroke="${soft}" />`,
    bg
  );
}

/* ---------- WEB: marketing / landing ---------- */
export function webLanding({ accent, bg = "#ffffff" }) {
  return wrap(
    "0 0 640 400",
    `
    <rect x="30" y="26" width="24" height="24" rx="7" fill="${accent}"/>
    ${[0, 1, 2]
      .map((i) => `<rect x="${470 + i * 46}" y="32" width="34" height="10" rx="5" fill="${soft2}"/>`)
      .join("")}
    <rect x="30" y="110" width="150" height="18" rx="9" fill="${accent}"/>
    <rect x="30" y="140" width="300" height="30" rx="8" fill="${soft2}"/>
    <rect x="30" y="182" width="240" height="30" rx="8" fill="${soft2}"/>
    <rect x="30" y="240" width="120" height="40" rx="20" fill="${accent}"/>
    <rect x="164" y="240" width="120" height="40" rx="20" fill="none" stroke="${soft2}"/>
    <rect x="360" y="96" width="250" height="220" rx="20" fill="${accent}" opacity="0.12"/>
    <circle cx="485" cy="176" r="46" fill="${accent}" opacity="0.9"/>
    <rect x="404" y="250" width="162" height="12" rx="6" fill="${soft2}"/>
    <rect x="404" y="272" width="120" height="12" rx="6" fill="${soft}"/>`,
    bg
  );
}

/* ---------- MOBILE: social / feed ---------- */
export function mobileFeed({ accent, bg = "#ffffff" }) {
  return wrap(
    "0 0 270 570",
    `
    <rect x="24" y="46" width="120" height="16" rx="8" fill="${accent}"/>
    <circle cx="234" cy="54" r="16" fill="${soft2}"/>
    <rect x="24" y="92" width="222" height="150" rx="18" fill="${accent}" opacity="0.14"/>
    <circle cx="86" cy="167" r="30" fill="${accent}"/>
    <rect x="24" y="262" width="150" height="14" rx="7" fill="${soft2}"/>
    <rect x="24" y="286" width="222" height="10" rx="5" fill="${soft}"/>
    <rect x="24" y="304" width="190" height="10" rx="5" fill="${soft}"/>
    ${[0, 1, 2]
      .map(
        (i) => `
      <circle cx="44" cy="${360 + i * 58}" r="18" fill="${soft2}"/>
      <rect x="74" y="${350 + i * 58}" width="120" height="12" rx="6" fill="${soft2}"/>
      <rect x="74" y="${370 + i * 58}" width="80" height="10" rx="5" fill="${soft}"/>`
      )
      .join("")}
    <rect x="16" y="512" width="238" height="46" rx="23" fill="#fff" stroke="${soft}"/>
    <circle cx="135" cy="535" r="22" fill="${accent}"/>
    ${[56, 96, 174, 214]
      .map((x) => `<circle cx="${x}" cy="535" r="5" fill="${soft2}"/>`)
      .join("")}`,
    bg
  );
}

/* ---------- MOBILE: finance / wallet ---------- */
export function mobileFinance({ accent, bg = "#ffffff" }) {
  const rows = [0, 1, 2, 3]
    .map(
      (i) => `
    <rect x="24" y="${300 + i * 56}" width="222" height="44" rx="12" fill="#fff" stroke="${soft}"/>
    <circle cx="48" cy="${322 + i * 56}" r="12" fill="${i === 0 ? accent : soft2}"/>
    <rect x="70" y="${314 + i * 56}" width="90" height="9" rx="4" fill="${soft2}"/>
    <rect x="70" y="${328 + i * 56}" width="54" height="8" rx="4" fill="${soft}"/>
    <rect x="196" y="${316 + i * 56}" width="34" height="12" rx="6" fill="${soft}"/>`
    )
    .join("");
  return wrap(
    "0 0 270 570",
    `
    <rect x="24" y="44" width="90" height="12" rx="6" fill="${soft2}"/>
    <rect x="24" y="80" width="222" height="150" rx="22" fill="${accent}"/>
    <rect x="44" y="104" width="70" height="10" rx="5" fill="rgba(255,255,255,0.55)"/>
    <text x="44" y="162" font-family="sans-serif" font-size="30" font-weight="700" fill="#fff">$4,820</text>
    <rect x="44" y="188" width="120" height="10" rx="5" fill="rgba(255,255,255,0.4)"/>
    <rect x="24" y="256" width="120" height="12" rx="6" fill="${soft2}"/>
    ${rows}`,
    bg
  );
}

/* ---------- MOBILE: onboarding / hero ---------- */
export function mobileOnboard({ accent, bg = "#ffffff" }) {
  return wrap(
    "0 0 270 570",
    `
    <circle cx="135" cy="180" r="96" fill="${accent}" opacity="0.14"/>
    <circle cx="135" cy="180" r="58" fill="${accent}"/>
    <path d="M112 180 l16 16 l30 -34" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="45" y="320" width="180" height="18" rx="9" fill="${soft2}"/>
    <rect x="60" y="352" width="150" height="14" rx="7" fill="${soft}"/>
    <rect x="30" y="420" width="210" height="50" rx="25" fill="${accent}"/>
    <rect x="90" y="440" width="90" height="10" rx="5" fill="#fff"/>
    <rect x="95" y="494" width="80" height="10" rx="5" fill="${soft2}"/>
    ${[0, 1, 2]
      .map(
        (i) =>
          `<circle cx="${118 + i * 18}" cy="530" r="4" fill="${i === 0 ? accent : soft2}"/>`
      )
      .join("")}`,
    bg
  );
}
