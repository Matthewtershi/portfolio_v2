export type Behavior = "shape" | "dino" | "orbit" | "image"
export type Shape = "plane" | "torus" | "cube" | "drift" | "rings"

export interface PanelItem {
  /** Bolded lead-in, e.g. a place or a title. Optional. */
  lead?: string
  text: string
  /** Small muted trailing note, e.g. a date or a location. */
  note?: string
}

export interface PanelImage {
  src: string
  /** Narrower crop for phones and tablets, where the wide spread cannot fit. */
  srcMobile?: string
  /** Describes the artwork for screen readers; the canvas itself is hidden. */
  alt: string
  /**
   * Which pixels carry the subject, so the sampler knows what to trace.
   *   "lineart" — dark ink on white paper. Manga panels and most fan art.
   *   "artwork" — light subject on a dark ground.
   */
  treatment?: "lineart" | "artwork"
  /** Rendered small in a corner. Credit the artist if this isn't yours. */
  credit?: string
  /** Fill the whole viewport rather than sitting beside the copy. */
  fullBleed?: boolean
}

/** A clickable point on the orbit ring. */
export interface Hotspot {
  label: string
  kind: string
  title: string
  body: string
  /** Where it sits on the ring, 0 → 1 around the circumference. */
  at: number
  /** When set, the detail card carries a player for this file. */
  audio?: string
}

export interface Panel {
  /** Short label used in the side navigation. */
  key: string
  eyebrow: string
  heading: string
  blurb?: string
  /** Used on phones and tablets, where the interactive version is switched
      off and copy that invites a keypress would be a lie. */
  headingCompact?: string
  blurbCompact?: string
  items: PanelItem[]
  /** Panel accent. Each one owns a colour; the page tweens between them. */
  accent: string
  /** What the particles do here. */
  behavior: Behavior
  /** Formation used when behavior is "shape", and the fallback for the rest. */
  shape: Shape
  image?: PanelImage
  hotspots?: Hotspot[]
  showLinks?: boolean
  /** Hidden until the visitor clicks the background. */
  secret?: { prompt: string; title: string; body: string }
}

export const PANELS: Panel[] = [
  {
    key: "Hello",
    eyebrow: "Hello",
    heading: "I'm Matthew.",
    items: [
      { text: "Austin, Texas" },
      { text: "Computer Engineering at Texas A&M", note: "Class of 2028" },
      { text: "Feel free to contact me at matthewtershi@tamu.edu!" },
    ],
    accent: "#D4AF37",
    behavior: "shape",
    shape: "plane",
  },
  {
    key: "Work",
    eyebrow: "Where I've worked",
    heading: "Press space.",
    headingCompact: "Where I've worked.",
    items: [
      { lead: "XPerf.ai", text: "GPU observability and autoremediation capabilities.", note: "2026 — 2026" },
      { lead: "Energy Systems Lab", text: "Software for commercial HVAC management.", note: "2025" },
      { lead: "tidalTAMU", text: "Organizing hackathons!", note: "2024 — present" },
    ],
    accent: "#6BA8D6",
    behavior: "dino",
    shape: "cube",
  },
  {
    key: "Off the clock",
    eyebrow: "Off the clock",
    heading: "Pick one.",
    blurb: "Here are some of my hobbies!",
    items: [],
    accent: "#E0785F",
    behavior: "orbit",
    shape: "rings",
    hotspots: [
      {
        label: "Guitar",
        kind: "Hobby",
        title: "Guitar",
        body: "I enjoy playing R&B, pop songs, country, and jazz. I have been playing for 3 years and hope I can keep making time for it.",
        at: 0,
      },
      {
        label: "Favorite song",
        kind: "On repeat",
        title: "Calling After Me",
        body: "Wallows. Still. I think I found it in like 2022, but I really started to like it after I learned it on guitar.",
        at: 0.142,
        audio: "/audio/calling-after-me.mp3",
      },
      {
        label: "Drawing",
        kind: "Hobby",
        title: "Drawing",
        body: "Tried it and liked it. I draw people, hands, bodies, and would love to try animation (alas no ipad).",
        at: 0.285,
      },
      {
        label: "Illusions",
        kind: "Reading",
        title: "Illusions — Richard Bach",
        body: "On my character arc.",
        at: 0.428,
      },
      {
        label: "Basketball",
        kind: "Hobby",
        title: "Basketball",
        body: "Not green",
        at: 0.571,
      },
      {
        label: "Reading",
        kind: "Reading",
        title: "Reading and Listening",
        body: "Mostly Hank Green and Kurt Vonnegut. Discovered audio books circa 2026 and lowkey changed my life.",
        at: 0.857,
      },
    ],
  },
  {
    key: "Say hi",
    eyebrow: "Say hi",
    heading: "I'd like to hear from you.",
    items: [],
    accent: "#5B8DEF",
    behavior: "image",
    shape: "drift",
    showLinks: true,
    image: {
      src: "/Screenshot%202026-08-19%20155724.png",
      srcMobile: "/Screenshot%202026-08-19%20194920.png",
      alt: "Yoichi Isagi striking the ball, from Blue Lock",
      treatment: "lineart",
      credit: "Art from Blue Lock",
      fullBleed: true,
    },
    secret: {
      prompt: "Click anywhere for the part I left out",
      title: "Isagi my glorious king",
      body:
        "I used to treat wanting things for myself as something I had to justify. Most of the ideas I surrounded myself with during my childhood taught me the same lessons: work extensively with your team, share the credit, and become a good part of something bigger. What stands out to me about Blue Lock is that it questions that assumption. It argues that individuality and teamwork do not have to be opposites: sometimes a team is strongest when each person is willing to develop what makes them uniquely valuable, standing by their identity instead of assimilating with the herd. I wouldn't say Blue Lock changed my life, but it gave me a useful way of thinking about ambition and what I want to do with my life. I am more comfortable admitting that I want to be very good at the things I care about, while also being more deliberate about the opportunities I choose not to pursue. It's a small idea, but one I've found surprisingly useful. I'd want everyone to go watch it (look past the bad animation lmao).",
    },
  },
]

export const LINKS = [
  { label: "Email", value: "matthewtershi@gmail.com", href: "mailto:matthewtershi@gmail.com" },
  { label: "GitHub", value: "Matthewtershi", href: "https://github.com/Matthewtershi" },
  {
    label: "LinkedIn",
    value: "matthewtershi",
    href: "https://www.linkedin.com/in/matthew-shi-a2376b239/",
  },
  { label: "Instagram", value: "matthew.sih8", href: "https://www.instagram.com/matthew.sih8/" },
]
