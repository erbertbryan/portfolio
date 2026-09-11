/* "Beyond the work" folders. Each photo is either a real image (`src`,
   rendered with no caption) or a placeholder (`caption`, rendered as a
   tinted gradient card) — see photoMarkup() in folders.js. */

export const folders = [
  {
    id: "beyond-the-screen",
    label: "Beyond the Screen",
    hint: "Talks, workshops, & volunteer work",
    accent: "#6C5CE7",
    quote: "Time isn’t merely measured — it’s experienced.",
    photos: [
      { src: "/folders/devcon/devcon-01.webp", rot: -2 },
      { src: "/folders/devcon/devcon-02.webp", rot: 1.5 },
      { src: "/folders/devcon/devcon-03.webp", rot: -1.5 },
      { src: "/folders/devcon/devcon-04.webp", rot: 2 },
      { src: "/folders/devcon/devcon-05.webp", rot: -2 },
      { src: "/folders/devcon/devcon-06.webp", rot: 1 },
      { src: "/folders/devcon/devcon-07.webp", rot: -1.5 },
      { src: "/folders/devcon/devcon-08.webp", rot: 2 },
      { src: "/folders/devcon/devcon-09.webp", rot: -2 },
      { src: "/folders/devcon/devcon-10.webp", rot: 1.5 },
      { src: "/folders/devcon/devcon-11.webp", rot: -1 },
      { src: "/folders/devcon/devcon-12.webp", rot: 2 },
      { src: "/folders/devcon/devcon-13.webp", rot: -1.5 },
      { src: "/folders/devcon/devcon-14.webp", rot: 1 },
    ],
  },
  {
    id: "artworks",
    label: "Artworks",
    hint: "Sketches, merch & prints",
    accent: "#F2643F",
    scatter: true, // slight per-photo vertical jitter — see photoMarkup()
    photos: [
      { src: "/folders/art/art-01.webp", rot: -2 },
      { src: "/folders/art/art-02.webp", rot: 1.5 },
      { src: "/folders/art/art-03.webp", rot: -1.5 },
      { src: "/folders/art/art-04.webp", rot: 2 },
      { src: "/folders/art/art-05.webp", rot: -2 },
      { src: "/folders/art/art-06.webp", rot: 1 },
      { src: "/folders/art/art-07.webp", rot: -1.5 },
      { src: "/folders/art/art-08.webp", rot: 2 },
      { src: "/folders/art/art-09.webp", rot: -2 },
      { src: "/folders/art/art-10.webp", rot: 1.5 },
      { src: "/folders/art/art-11.webp", rot: -1 },
    ],
  },
];
