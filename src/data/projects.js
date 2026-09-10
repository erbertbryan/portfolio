export const projects = [
  {
    id: "financeable",
    layout: "hero", // one large screenshot, deliberately cropped by the frame
    logo: "Financeable",
    logoSvg: "/brand/logos/financeable-icon.svg",
    logoSquare: true, // an icon mark, not a wordmark — needs its own height
    name: "Financeable",
    accent: "#7C3AED",
    tags: ["UX/UI", "Fintech", "Responsive", "Dashboard", "Branding", "Motion Graphics"],
    platform: "Web · Mobile",
    role: "UI/UX Lead & Brand Designer",
    blurb:
      "An asset finance webapp needed a complete digital transformation to elevate its product experience and reflect its expanding lineup of features.",
    heroVideo: {
      src: "/carousel/fintech-hero.mp4",
      poster: "/carousel/fintech-hero-poster.webp",
    },
    // custom section-by-section story, instead of the default problem/solution/mockups template
    story: [
      {
        type: "media-text",
        side: "left",
        images: ["/carousel/fintech-section-3.webp"],
        text: "I spearheaded an end-to-end redesign across both product and brand touchpoints. From overhauling the landing page and restructuring the core web app to crafting product features, logo animations, and marketing assets, I designed a cohesive ecosystem designed for maximum user engagement.",
      },
      {
        type: "media-text",
        side: "left",
        mediaLayout: "bento",
        images: [
          "/carousel/fintech-section-4.webp",
          { type: "video", src: "/carousel/fintech-section-4-anim.mp4" },
          { type: "video", src: "/carousel/fintech-section-4-loader.mp4" },
          { type: "video", src: "/carousel/fintech-section-4-logo-anim.mp4" },
        ],
        text: "To lay the groundwork for high-impact motion assets, I first modernized the core web application UI to ensure clean visual consistency. With the web app fully revamped, I developed custom animated product demo videos & logo animations that transformed complex financial workflows into intuitive, engaging user interactions.",
      },
      {
        type: "bento",
        text: "By aligning brand identity, web presence, and product motion into one unified system, we delivered an elevated, modern Broker Platform for Finance Application and Lodgement experience built to scale.",
        images: [
          "/carousel/fintech-section-5-1.webp",
          {
            type: "video",
            src: "/carousel/fintech-section-5-2.mp4",
            poster: "/carousel/fintech-section-5-2-poster.webp",
          },
          "/carousel/fintech-section-5-3.webp",
          "/carousel/fintech-section-5-4.webp",
        ],
      },
    ],
  },
  {
    id: "hardware",
    layout: "hero", // one large screenshot, deliberately cropped by the frame
    logo: "Ecommerce Redesign",
    logoSvg: "/brand/logos/hardware.svg",
    logoSquare: true, // an icon mark, not a wordmark — needs its own height
    name: "Ecommerce Redesign",
    accent: "#D42A2A",
    tags: ["UX/UI", "Hardware", "Responsive", "Ecommerce", "Illustration"],
    platform: "Web · Mobile",
    role: "UI/UX Designer & Illustrator",
    blurb:
      "A leading Philippine construction supplier needed to modernize its digital storefront after legacy navigation and poor product discoverability began suppressing online conversions.",
    heroVideo: {
      src: "/carousel/hardware-hero.mp4",
      poster: "/carousel/hardware-hero-poster.webp",
    },
    // custom section-by-section story, instead of the default problem/solution/mockups template
    story: [
      {
        type: "media-text",
        side: "left",
        images: ["/carousel/hardware-section3.webp"],
        text: "I collaborated on a 3-person team to redesign the core buying funnel. We overhauled product discovery, simplified card layouts, friction-tested the checkout process, and created custom illustrations for utility pages to build an intuitive, high-converting retail experience.",
      },
      {
        type: "media-text",
        side: "left",
        images: ["/carousel/hardware-section4-1.webp", "/carousel/hardware-section4-2.webp"],
        text: "We kicked off with an intensive three-day design sprint alongside client stakeholders to align business goals, map core shopper journeys, and prioritize features. From there, we defined the UX strategy, structured user flows, and built mid-fidelity wireframes before polishing the end-to-end interface.",
      },
      {
        type: "bento",
        text: "With the foundational UX and visual frameworks in place, we finalized the full UI system and delivered a seamless, modern e-commerce experience.",
        images: [
          "/carousel/hardware-section5-1.webp",
          "/carousel/hardware-section5-2.webp",
          "/carousel/hardware-section5-3.webp",
          "/carousel/hardware-section5-4.webp",
          "/carousel/hardware-section5-5.webp",
          "/carousel/hardware-section5-6.webp",
          "/carousel/hardware-section5-7.webp",
        ],
      },
    ],
  },
  {
    id: "mugna",
    layout: "hero", // one large screenshot, deliberately cropped by the frame
    logo: "Mugna Tech",
    logoSvg: "/brand/logos/mugna.svg",
    name: "Mugna Tech",
    accent: "#6D28D9",
    tags: ["UX/UI", "Software Outsourcing", "Responsive", "AI-Native Process", "Motion Graphics"],
    platform: "Web",
    role: "UI/UX Designer",
    blurb:
      "Mugna Tech needed to modernize its digital flagship to reflect its edge in building premium, high-end websites. The original site already performed well — the visual presence just needed to match the company's core mission: delivering world-class digital and software solutions for everyone.",
    heroVideo: {
      src: "/carousel/mugna-hero.mp4",
      poster: "/carousel/mugna-hero-poster.webp",
    },
    story: [
      {
        type: "stats",
        label: "The starting line",
        text: "Nothing was broken. The existing site scored near-perfect across the board — this was never a rescue job.",
        items: [
          { value: "98", label: "Performance" },
          { value: "100", label: "SEO" },
          { value: "100", label: "Accessibility" },
          { value: "100", label: "Best Practices" },
        ],
        note: "Which made the brief harder, not easier: rebuild the visual presence to match the work Mugna actually ships, without giving up a single point of what already worked.",
      },
      {
        type: "media-text",
        side: "left",
        label: "Current Look",
        mediaLayout: "trio",
        images: [
          "/carousel/mugna-section3-1.webp",
          "/carousel/mugna-section3-2.webp",
          "/carousel/mugna-section3-4.webp",
        ],
        text: "I led the landing page overhaul by balancing high-level design execution with rapid technical deployment. Beyond static screens, I pushed the prototype into production, shipping a fully functional, AI-coded MVP to validate interactions and motion before handoff to our engineering team.",
      },
      {
        type: "media-text",
        side: "left",
        images: ["/carousel/mugna-section4.webp"],
        text: "Speed didn't replace structure. We began with rigorous UX discovery, mapping key content hierarchies and handcrafting a modular design system from scratch in Figma. Defining these atomic components ensured we weren't just throwing generic prompts at code generators — we established a precise visual framework so AI served as a true multiplier rather than a shortcut.",
      },
      {
        type: "bento",
        text: "Using AI tools as a dynamic bridge between the designer's vision and engineering, we translated Figma tokens into clean code, delivering a modern, high-converting landing page.",
        images: [
          {
            type: "video",
            src: "/carousel/mugna-section5-1.mp4",
            poster: "/carousel/mugna-section5-1-poster.webp",
          },
          {
            type: "video",
            src: "/carousel/mugna-section5-2.mp4",
            poster: "/carousel/mugna-section5-2-poster.webp",
          },
        ],
      },
    ],
  },
  {
    id: "coffee",
    layout: "hero", // one large screenshot, deliberately cropped by the frame
    logo: "Specialty Coffee Depot",
    logoSvg: "/brand/logos/coffee.svg",
    logoSquare: true, // now an icon mark alone, not an icon+wordmark lockup
    name: "Specialty Coffee",
    // .case__title only — name stays the plain one-line version for
    // aria-labels and the "keep exploring" row title, which shouldn't
    // carry a hard-coded <br>
    titleLines: ["Specialty", "Coffee"],
    accent: "#7B4B2A",
    tags: ["UX/UI", "Coffee", "Responsive", "Ecommerce", "Illustration", "Branding"],
    platform: "Web",
    role: "UI/UX Designer",
    blurb:
      "Specialty Coffee Depot PH needed a dedicated e-commerce web platform to expand its reach and establish an online storefront for its specialized coffee products.",
    heroVideo: {
      src: "/carousel/coffee-hero.mp4",
      poster: "/carousel/coffee-hero-poster.webp",
    },
    story: [
      {
        type: "media-text",
        side: "left",
        images: ["/carousel/coffee-section-3.webp"],
        text: "I designed a seamless digital shopping experience tailored for coffee enthusiasts. By establishing clear product categorization, intuitive navigation, and a streamlined cart experience, we transformed their inventory into an accessible, conversion-friendly online store.",
      },
      {
        type: "media-text",
        side: "left",
        images: ["/carousel/coffee-section-4.webp"],
        text: "To ensure the platform balanced brand identity with usability, we anchored the project in a structured UX process. We conducted target audience research, mapped out primary user flows, and established information architecture before moving into mid-fidelity wireframes to validate layout structures and content hierarchy.",
      },
      {
        type: "bento",
        text: "With the UX structure validated, we translated the low-friction wireframes into high-fidelity screens, crafting a polished UI system with rich visual details that reflect the premium quality of their coffee selection.",
        images: [
          "/carousel/coffee-section-5-1.webp",
          "/carousel/coffee-section-5-2.webp",
          "/carousel/coffee-section-5-3.webp",
          "/carousel/coffee-section-5-4.webp",
          "/carousel/coffee-section-5-5.webp",
        ],
      },
    ],
  },
  {
    id: "smash",
    layout: "hero", // one large screenshot, deliberately cropped by the frame
    logo: "Smash Hub",
    logoSvg: "/brand/logos/smash.svg",
    logoSquare: true, // now an icon mark alone, not an icon+wordmark lockup
    // the product's own wordmark is two words; "SMASHHUB" set as one
    // collides on the double H at display size
    name: "Smash Hub",
    accent: "#B6E036", // sampled from the product's own lime CTA
    tags: ["UX/UI", "Pickleball", "Responsive", "Booking", "Dashboard", "Motion Graphics"],
    platform: "Web",
    role: "UI/UX Designer & Product Strategist",
    blurb:
      "SmashHub needed a dedicated web platform to streamline operations for their growing court rental business. In a local market crowded with fragmented solutions, where platforms offer either sleek UI with broken workflows, or functional systems burdened by dated, clunky interfaces, SmashHub required a balanced, high-converting digital product tailored for diverse player age groups.",
    heroVideo: {
      src: "/carousel/smash-hero.mp4",
      poster: "/carousel/smash-hero-poster.webp",
    },
    story: [
      {
        type: "media-text",
        side: "left",
        mediaLayout: "trio",
        images: [
          "/carousel/smash-section3-1.webp",
          "/carousel/smash-section3-2.webp",
          "/carousel/smash-section3-3.webp",
        ],
        text: "I designed a modern court booking web app that simplifies scheduling into a direct, low-friction flow. To bridge the gap between court operations and business growth, we coupled the intuitive front-end player experience with an enterprise back-office system, featuring account management, multi-court allocation, automated local payment gateways, and real-time business performance analytics.",
      },
      {
        type: "stats",
        label: "Who plays now",
        text: "Designing for pickleball meant accounting for a unique demographic split. While historical data positioned pickleball as a senior pastime, recent global sports statistics show a dramatic shift: the median player age has dropped to 34.8 years old, with 18–34 year olds now forming the single largest active cohort (~32%), while players aged 55+ still maintain steady court engagement.",
        items: [
          { value: "34.8", label: "Median player age" },
          { value: "32%", label: "Aged 18–34" },
          { value: "55+", label: "Still playing steadily" },
        ],
      },
      {
        type: "bento",
        // the clip already renders its own phone mockup and drop shadow
        // on a white canvas, so this section sits on the same pure white
        // rather than the usual off-white paper — nothing reads as framed
        onWhite: true,
        lead: {
          type: "video",
          src: "/carousel/smash-mobile.mp4",
          poster: "/carousel/smash-mobile-poster.webp",
          // scroll (either direction) scrubs through the clip instead of
          // it autoplaying — see initScrubVideos
          scrub: true,
          // the footage itself drifts the phone rightward as it plays
          // (measured ~22% of the frame width by the last frame); shifting
          // the element left by that same amount means the drift lands
          // the phone back in the centre exactly as the clip finishes
          shiftX: -22,
        },
        text: "To serve both tech-savvy Gen Z/Millennial players and older regulars, we built an accessible interface using high-contrast UI tokens, clear visual feedback, and a streamlined 3-step court selection process.",
        images: ["/carousel/smash-section4-1.webp", "/carousel/smash-section4-2.webp"],
      },
      {
        type: "bento",
        text: "By replacing fragmented legacy tools with a unified platform, SmashHub eliminated booking friction for players while equipping facility managers with clear operational KPIs, court occupancy heatmaps, and automated revenue tracking.",
        images: [
          "/carousel/smash-section5-1.webp",
          "/carousel/smash-section5-2.webp",
          {
            type: "video",
            src: "/carousel/smash-customer-demo.mp4",
            poster: "/carousel/smash-customer-demo-poster.webp",
          },
          {
            type: "video",
            src: "/carousel/smash-admin-demo.mp4",
            poster: "/carousel/smash-admin-demo-poster.webp",
          },
        ],
      },
    ],
  },
];
