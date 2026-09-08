export const projects = [
  {
    id: "financeable",
    layout: "hero", // one large screenshot, deliberately cropped by the frame
    logo: "Financeable",
    logoSvg: "/brand/logos/financeable-icon.svg",
    logoSquare: true, // an icon mark, not a wordmark — needs its own height
    name: "Financeable",
    accent: "#7C3AED",
    tags: ["#Fintech", "#Web", "#Mobile", "#Branding", "#Marketing", "#Animations"],
    platform: "Web · Mobile",
    role: "UI/UX Lead & Brand Designer",
    blurb:
      "An asset finance webapp needed a complete digital transformation to elevate its product experience and reflect its expanding lineup of features.",
    heroImage: "/carousel/fintech-hero.webp",
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
    tags: ["#Web", "#Mobile", "#Ecommerce"],
    platform: "Web · Mobile",
    role: "UI/UX Designer & Illustrator",
    blurb:
      "A leading Philippine construction supplier needed to modernize its digital storefront after legacy navigation and poor product discoverability began suppressing online conversions.",
    heroImage: "/carousel/hardware-hero.webp",
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
    tags: ["#Web", "#DesignSystem", "#VibeCoding", "#LandingPage", "#AIIntegrations"],
    platform: "Web",
    role: "UI/UX Designer",
    blurb:
      "Mugna Tech needed to modernize its digital flagship to reflect its edge in building premium, high-end websites. The original site already performed well — the visual presence just needed to match the company's core mission: delivering world-class digital and software solutions for everyone.",
    heroImage: "/carousel/mugna-hero.webp",
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
];
