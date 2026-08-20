"use client"

import { useEffect, useRef, type MutableRefObject } from "react"
import { PANELS, type Shape } from "@/app/data/panels"
import type { AudioLevels } from "./audio-player"

export interface ScreenPoint {
  x: number
  y: number
  on: boolean
}

export interface DinoState {
  score: number
  best: number
  over: boolean
  started: boolean
}

interface LatticeProps {
  /** Target scroll progress, 0 → 1. A ref so scrolling never re-renders React. */
  progressRef: MutableRefObject<number>
  onPanelChange?: (index: number) => void
  isMobile?: boolean
  /** Projected screen position of each orbit hotspot, written every frame. */
  hotspotsRef?: MutableRefObject<ScreenPoint[]>
  /** Which hotspot is open, so its particles can light up. */
  activeHotspotRef?: MutableRefObject<number>
  /** Live dino score, read by the HUD without re-rendering React. */
  dinoRef?: MutableRefObject<DinoState>
  /** Populated with a restart function so the HUD can offer "play again". */
  restartRef?: MutableRefObject<(() => void) | null>
  /** Live audio analysis, so the ring can move with the track. */
  audioRef?: MutableRefObject<AudioLevels>
}

/* ------------------------------------------------------------------ *
 * One buffer, many behaviours.
 * Panels no longer just hold a static formation — some of them run. The
 * morph still blends "what panel A wants" into "what panel B wants", but
 * either side may be recomputed every frame.
 * ------------------------------------------------------------------ */

const STRIDE = 3

/* The wavy donut. Shared by the formation and the hotspot placement so the
   labels can never drift away from the particles they point at. */
const RING_INNER = 0.72
const RING_STEP = 0.33
const RING_WAVE = 0.3
const RING_OUTER = 6

function fillShape(out: Float32Array, shape: Shape, count: number, r: number[]) {
  const side = Math.ceil(Math.sqrt(count))
  const cube = Math.round(Math.cbrt(count))
  for (let i = 0; i < count; i++) {
    const o = i * STRIDE
    let x = 0
    let y = 0
    let z = 0
    if (shape === "plane") {
      const gx = (i % side) / (side - 1) - 0.5
      const gz = Math.floor(i / side) / (side - 1) - 0.5
      // A slow swell, so this reads as a surface of its own rather than a
      // second copy of the floor lattice underneath it.
      y = Math.sin(gx * 4.2) * Math.cos(gz * 3.6) * 0.34 - 0.25 + (r[i] - 0.5) * 0.05
      x = gx * 4.6
      z = gz * 4.6
    } else if (shape === "torus") {
      const u = r[i] * Math.PI * 2
      const v = r[i + count] * Math.PI * 2
      const rr = 0.44 + (r[i + count * 2] - 0.5) * 0.18
      x = (1.4 + rr * Math.cos(v)) * Math.cos(u)
      y = rr * Math.sin(v)
      z = (1.4 + rr * Math.cos(v)) * Math.sin(u)
    } else if (shape === "cube") {
      const a = i % cube
      const b = Math.floor(i / cube) % cube
      const c = Math.floor(i / (cube * cube)) % cube
      x = (a / (cube - 1) - 0.5) * 2.8 + (r[i] - 0.5) * 0.06
      y = (b / (cube - 1) - 0.5) * 2.8 + (r[i + count] - 0.5) * 0.06
      z = (c / (cube - 1) - 0.5) * 2.8 + (r[i + count * 2] - 0.5) * 0.06
    } else if (shape === "drift") {
      const th = r[i] * Math.PI * 2
      const ph = Math.acos(2 * r[i + count] - 1)
      const rr = 1.05 + r[i + count * 2] * 0.9
      x = rr * Math.sin(ph) * Math.cos(th)
      y = rr * Math.cos(ph) * 0.74
      z = rr * Math.sin(ph) * Math.sin(th)
    } else {
      // rings — the wavy donut
      const ring = i % 7
      const th = r[i] * Math.PI * 2
      const rr = RING_INNER + ring * RING_STEP
      x = rr * Math.cos(th)
      y = Math.sin(th * 3 + ring * 0.9) * RING_WAVE
      z = rr * Math.sin(th)
    }
    out[o] = x
    out[o + 1] = y
    out[o + 2] = z
  }
}

/** Where a hotspot sits on the wavy donut. Must match the "rings" formula. */
function ringPoint(at: number) {
  const th = at * Math.PI * 2
  const rr = RING_INNER + RING_OUTER * RING_STEP
  return {
    x: rr * Math.cos(th),
    y: Math.sin(th * 3 + RING_OUTER * 0.9) * RING_WAVE,
    z: rr * Math.sin(th),
  }
}

/* ---------------------- image → particle mask ------------------------ */

interface MaskResult {
  /** Normalised so height spans 1.0; scaled to the viewport at draw time. */
  points: Float32Array
  ink: Float32Array
  aspect: number
}

const EDGE_GAIN = 1.8
const FILL_GAIN = 0.75

function sampleImage(
  img: HTMLImageElement,
  count: number,
  invert: boolean,
  rand: () => number,
  maxDim = 620,
  edgeGain = EDGE_GAIN,
  fillGain = FILL_GAIN,
): MaskResult | null {
  const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight))
  const w = Math.max(1, Math.round(img.naturalWidth * scale))
  const h = Math.max(1, Math.round(img.naturalHeight * scale))

  const off = document.createElement("canvas")
  off.width = w
  off.height = h
  const octx = off.getContext("2d", { willReadFrequently: true })
  if (!octx) return null

  octx.fillStyle = invert ? "#ffffff" : "#000000"
  octx.fillRect(0, 0, w, h)
  octx.drawImage(img, 0, 0, w, h)

  let data: Uint8ClampedArray
  try {
    data = octx.getImageData(0, 0, w, h).data
  } catch {
    return null // tainted canvas, e.g. a cross-origin image
  }

  const n = w * h
  const lum = new Float32Array(n)
  for (let p = 0; p < n; p++) {
    const o = p * 4
    const l = (data[o] * 0.299 + data[o + 1] * 0.587 + data[o + 2] * 0.114) / 255
    const a = data[o + 3] / 255
    lum[p] = invert ? 1 - l * a : l * a
  }

  /* Sampling by darkness alone turns every solid black mass into a filled
     blob. A Sobel pass finds where the value actually changes, so particles
     land on the linework and the edges of the flats instead of flooding them. */
  const mag = new Float32Array(n)
  let maxEdge = 0
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const p = y * w + x
      const tl = lum[p - w - 1]
      const tc = lum[p - w]
      const tr = lum[p - w + 1]
      const ml = lum[p - 1]
      const mr = lum[p + 1]
      const bl = lum[p + w - 1]
      const bc = lum[p + w]
      const br = lum[p + w + 1]
      const gx = tl + 2 * ml + bl - (tr + 2 * mr + br)
      const gy = tl + 2 * tc + tr - (bl + 2 * bc + br)
      const m = Math.sqrt(gx * gx + gy * gy)
      mag[p] = m
      if (m > maxEdge) maxEdge = m
    }
  }
  if (maxEdge <= 0) return null

  /* Random rejection sampling clumps and leaves holes, which reads as noise.
     Floyd-Steinberg error diffusion spreads particles evenly in proportion to
     local density — the same trick a halftone uses — so the drawing resolves. */
  const dens = new Float32Array(n)
  let total = 0
  for (let p = 0; p < n; p++) {
    const e = Math.min(1, (mag[p] / maxEdge) * edgeGain)
    const v = Math.min(1, e + lum[p] * fillGain)
    dens[p] = v > 0.06 ? v : 0
    total += dens[p]
  }
  if (total <= 0) return null

  const diff = new Float32Array(n)
  const k = count / total
  for (let p = 0; p < n; p++) diff[p] = dens[p] * k

  const px: number[] = []
  const py: number[] = []
  const pv: number[] = []
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = y * w + x
      const old = diff[p]
      const on = old > 0.5
      if (on) {
        px.push(x)
        py.push(y)
        pv.push(Math.min(1, dens[p]))
      }
      const err = old - (on ? 1 : 0)
      if (x + 1 < w) diff[p + 1] += (err * 7) / 16
      if (y + 1 < h) {
        if (x > 0) diff[p + w - 1] += (err * 3) / 16
        diff[p + w] += (err * 5) / 16
        if (x + 1 < w) diff[p + w + 1] += (err * 1) / 16
      }
    }
  }

  const m = px.length
  if (m < 64) return null

  const pick = new Int32Array(count)
  for (let i = 0; i < count; i++) pick[i] = m >= count ? ((i * m) / count) | 0 : i % m
  for (let i = count - 1; i > 0; i--) {
    const j = (rand() * (i + 1)) | 0
    const t = pick[i]
    pick[i] = pick[j]
    pick[j] = t
  }

  const aspect = w / h
  const points = new Float32Array(count * STRIDE)
  const ink = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    const j = pick[i]
    const o = i * STRIDE
    points[o] = (px[j] / w - 0.5) * aspect
    points[o + 1] = py[j] / h - 0.5
    points[o + 2] = (rand() - 0.5) * 0.06
    ink[i] = pv[j]
  }
  return { points, ink, aspect }
}

/* ------------------------------ dino game ---------------------------- */

const DINO_SPRITE = [
  "......................#################.....",
  "......................##################....",
  ".....................####################...",
  ".....................####################...",
  ".....................####################...",
  ".....................####################...",
  ".....................#####..#############...",
  ".....................#####..#############...",
  ".....................####################...",
  ".....................####################...",
  ".....................####################...",
  ".....................####################...",
  ".....................####################...",
  ".....................####################...",
  ".....................####################...",
  ".....................####################...",
  ".....................##########........##...",
  ".....................####################...",
  ".....................##################.....",
  "...####.............################........",
  "...#######.........################.........",
  "...##########.....################.####.....",
  "...#############.#################.###......",
  "...###############################..##......",
  "....##############################..........",
  ".....#############################..........",
  "......###########################...........",
  ".......##########################...........",
  "........#########################...........",
  ".........#######################............",
  "..........######################............",
  "..........#####################.............",
  "...........####################.............",
  "...........###################..............",
  "............##################..............",
  "............#################...............",
  "............######...########...............",
  "............######...#######................",
  "............#####....#######................",
  "............#####.....######................",
  "............####......#####.................",
  "............####......#####.................",
  "............####......#####.................",
  "............####......#####.................",
  "............####......#####.................",
  "..........######......#####.................",
  "..........######......#####.................",
]

const CACTUS_SPRITE = [
  "..##..",
  "..##..",
  "..##..",
  "#.##..",
  "#.##.#",
  "#.##.#",
  "####.#",
  "..####",
  "..##..",
  "..##..",
  "..##..",
  "..##..",
  "..##..",
  "..##..",
]

function spriteCells(rows: string[]) {
  const cells: number[] = []
  for (let y = 0; y < rows.length; y++) {
    for (let x = 0; x < rows[y].length; x++) {
      if (rows[y][x] === "#") cells.push(x, y)
    }
  }
  return { cells, w: rows[0].length, h: rows.length }
}

const DINO = spriteCells(DINO_SPRITE)
const CACTUS = spriteCells(CACTUS_SPRITE)

const GROUND_Y = 2.05
const DINO_SCALE = 0.022
const CACTUS_SCALE = 0.038
const GRAVITY = 21
const JUMP_V = 9.2
const OBSTACLE_SLOTS = 4



interface Obstacle {
  x: number
  active: boolean
  cells: number
}

/* --------------------------- colour helpers --------------------------- */

function toRgb(hex: string) {
  const h = hex.replace("#", "")
  const n = Number.parseInt(h.length === 3 ? h.replace(/(.)/g, "$1$1") : h, 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

function mixHex(a: string, b: string, t: number) {
  const x = toRgb(a)
  const y = toRgb(b)
  return {
    r: Math.round(x.r + (y.r - x.r) * t),
    g: Math.round(x.g + (y.g - x.g) * t),
    b: Math.round(x.b + (y.b - x.b) * t),
  }
}

const rgba = (c: { r: number; g: number; b: number }, a: number) =>
  `rgba(${c.r},${c.g},${c.b},${a})`

const PAPER_R = 236
const PAPER_G = 232
const PAPER_B = 225

/* ------------------------------- view -------------------------------- */

/* Text lying on the ground is unreadable at the plane's usual 22 degrees, so
   the camera tips down to look at the greeting and eases back afterwards. The
   glyphs are still stretched along depth to cancel what foreshortening is
   left at that steeper angle. */
/* Where a full-bleed panel comes to rest. The still is rasterised at exactly
   this anchor, so it has to be the same number the live camera settles on —
   hard-coding 0.5 in one of the two put the phone's still 150px below the
   particles and drew the ball twice. */
const BLEED_CENTER_X = 0.5
const BLEED_CENTER_Y_DESKTOP = 0.5
const BLEED_CENTER_Y_MOBILE = 0.32

const RIPPLE_SPEED = 2.4
const RIPPLE_LIFE = 2.8
const RIPPLE_WIDTH = 1.3
const RIPPLE_AMP = 0.8

const GREET_HOLD = 10
const GREET_PITCH = 0.95
const PLANE_Y = -0.25
const BASE_PITCH = 0.38
const FLAT_PITCH = 0.02
const DIST = 5.0
const FLOOR_Y = 1.8
const FLOOR_EXTENT = 7.0
const FLOOR_STEP = 0.7
const NEAR = 1.15

export default function Lattice({
  progressRef,
  onPanelChange,
  isMobile = false,
  hotspotsRef,
  activeHotspotRef,
  dinoRef,
  restartRef,
  audioRef,
}: LatticeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const panelRef = useRef(-1)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)")
    const count = isMobile ? 11000 : 30000
    const last = PANELS.length - 1

    let seed = 11
    const rand = () => {
      seed = (seed * 16807) % 2147483647
      return seed / 2147483647
    }
    const r: number[] = []
    for (let i = 0; i < count * 4; i++) r.push(rand())

    // One position array per panel. Static panels fill theirs once; running
    // panels rewrite theirs every frame.
    const states: Float32Array[] = PANELS.map(() => new Float32Array(count * STRIDE))
    PANELS.forEach((p, i) => fillShape(states[i], p.shape, count, r))

    // The ring carries labels around its rim, which need room. On a phone the
    // full-size ring pushes them off both edges, so it shrinks.
    const ringScale = isMobile ? 0.6 : 1
    if (ringScale !== 1) {
      PANELS.forEach((p, i) => {
        if (p.behavior !== "orbit") return
        const a = states[i]
        for (let k = 0; k < a.length; k++) a[k] *= ringScale
      })
    }
    const spotAt = (at: number) => {
      const q = ringPoint(at)
      return { x: q.x * ringScale, y: q.y * ringScale, z: q.z * ringScale }
    }

    /* The camera used to spin a fixed amount per panel, which left the game
       and the artwork viewed at an angle — a playable game has to be square
       on. Each panel now names the heading it wants, and the panels that must
       be seen flat always land on a whole number of turns. */
    const TURN = Math.PI * 2
    const yawAt: number[] = []
    {
      let acc = 0
      PANELS.forEach((p, i) => {
        if (i > 0) acc += p.behavior === "orbit" ? TURN * 1.25 : TURN
        // Round up, never down, so the camera never doubles back mid-journey.
        if (p.behavior === "dino" || p.behavior === "image") {
          acc = Math.ceil(acc / TURN - 1e-6) * TURN
        }
        yawAt.push(acc)
      })
    }

    /* ---- the idle greeting on the opening plane ----
       "hi! :)" is rasterised into the same grid the plane is built from, so
       each particle knows whether it is part of a letter. The letters are
       stretched along the depth axis first: the plane is seen at a shallow
       angle, which squashes z on screen by roughly sin(pitch), and without
       the counter-stretch the greeting reads as a smear. */
    const helloIdx = PANELS.findIndex((p) => p.behavior === "shape" && p.shape === "plane")
    const gridSide = Math.ceil(Math.sqrt(count))
    const greetMask = new Uint8Array(isMobile || helloIdx < 0 ? 0 : count)
    if (greetMask.length > 0) {
      const g = document.createElement("canvas")
      g.width = gridSide
      g.height = gridSide
      const gx = g.getContext("2d", { willReadFrequently: true })
      if (gx) {
        gx.fillStyle = "#000"
        gx.fillRect(0, 0, gridSide, gridSide)
        gx.fillStyle = "#fff"
        gx.textAlign = "center"
        gx.textBaseline = "middle"
        gx.font = `bold ${Math.round(gridSide * 0.24)}px ui-sans-serif, system-ui, -apple-system, sans-serif`
        gx.translate(gridSide / 2, gridSide * 0.68)
        gx.scale(1, 1 / Math.sin(GREET_PITCH) / 1.05)
        gx.fillText("hi! :)", 0, 0)
        const gd = gx.getImageData(0, 0, gridSide, gridSide).data
        for (let i = 0; i < count; i++) {
          const col = i % gridSide
          const row = Math.floor(i / gridSide)
          // Grid row 0 is nearest the camera, image row 0 is the top, so the
          // sample is flipped or the greeting comes out upside down.
          const src = (gridSide - 1 - row) * gridSide + col
          if (gd[src * 4] > 128) greetMask[i] = 1
        }
      }
    }

    // Where the pointer meets the plane, in model space.
    let pointerX = 0
    let pointerZ = 0
    let pointerOn = false
    let pointerSX = -1
    let pointerSY = -1
    const ripples: { x: number; z: number; t: number }[] = []
    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      pointerSX = e.clientX - rect.left
      pointerSY = e.clientY - rect.top
    }
    const onPointerLeave = () => {
      pointerSX = -1
      pointerSY = -1
    }
    if (!isMobile) {
      window.addEventListener("pointermove", onPointerMove, { passive: true })
      window.addEventListener("pointerleave", onPointerLeave)
    }

    const inks = new Float32Array(count).fill(0.55)
    /* Phones and tablets get the reduced build: the game and the idle
       greeting are desktop-only, so those panels fall back to their static
       formation and nothing is listening for input that will never come. */
    const dinoIdx = isMobile ? -1 : PANELS.findIndex((p) => p.behavior === "dino")
    const orbitIdx = PANELS.findIndex((p) => p.behavior === "orbit")

    /* ---- orbit hotspots: tag the particles nearest each one, once ---- */
    const orbitTag = new Int8Array(count).fill(-1)
    const spots = orbitIdx >= 0 ? PANELS[orbitIdx].hotspots ?? [] : []
    if (orbitIdx >= 0 && spots.length > 0) {
      const src = states[orbitIdx]
      const hp = spots.map((s) => spotAt(s.at))
      for (let i = 0; i < count; i++) {
        const o = i * STRIDE
        for (let k = 0; k < hp.length; k++) {
          const dx = src[o] - hp[k].x
          const dy = src[o + 1] - hp[k].y
          const dz = src[o + 2] - hp[k].z
          if (dx * dx + dy * dy + dz * dz < 0.09) {
            orbitTag[i] = k
            break
          }
        }
      }
    }

    /* ---- artwork: sampled asynchronously, scaled to the viewport ---- */
    const masks: (MaskResult | null)[] = PANELS.map(() => null)
    /* A full-bleed mask covering the whole viewport needs far more particles
       than the journey does — 30k over 1.3M pixels is dust. So the still is
       dithered once at high density into its own bitmap and blitted in a
       single drawImage, while the live particles handle the flight into it
       and cross-fade over the last stretch. */
    const stills: (HTMLCanvasElement | null)[] = PANELS.map(() => null)
    const stillMasks: (MaskResult | null)[] = PANELS.map(() => null)
    const STILL_MAX_DIM = 1500
    /* The dither target has to be a share of the source's own pixels. A fixed
       count saturates a small image — every cell above threshold turns on and
       the error diffusion stops carrying any tone — which is what made the
       phone crop read as a smear rather than the drawing. */
    const stillTarget = (img: HTMLImageElement) => {
      const k = Math.min(1, STILL_MAX_DIM / Math.max(img.naturalWidth, img.naturalHeight))
      return Math.round(img.naturalWidth * k * img.naturalHeight * k * 0.22)
    }
    const loaders: HTMLImageElement[] = []

    let width = 0
    let height = 0
    let focal = 100

    /** Scale the normalised mask so it covers the viewport. */
    const applyMaskScale = () => {
      if (!height) return
      masks.forEach((mask, i) => {
        if (!mask) return
        const fitH = height / focal
        const fitW = width / focal / mask.aspect
        /* Contain rather than cover: cover crops the corners off, and the
           top-left of this spread carries the title block. On small screens
           the copy owns the lower half, so the artwork is contained against
           the band it actually gets rather than the whole viewport. */
        const bandH = isMobile ? (height * 0.6) / focal : fitH
        const s = PANELS[i].image?.fullBleed
          ? Math.min(bandH, fitW) * 0.97
          : isMobile
            ? 1.5
            : 5.6
        const dst = states[i]
        const src = mask.points
        for (let k = 0; k < count * STRIDE; k++) dst[k] = src[k] * s
      })
    }

    PANELS.forEach((p, i) => {
      if (!p.image) return
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.decoding = "async"
      img.onload = () => {
        const lineart = (p.image?.treatment ?? "lineart") === "lineart"
        const mask = sampleImage(img, count, lineart, rand)
        if (!mask) return
        masks[i] = mask
        inks.set(mask.ink)
        if (p.image?.fullBleed) {
          // At full-bleed size the flats turn to mush, so the still leans
          // much harder on edges than the small travelling mask does.
          stillMasks[i] = sampleImage(
            img,
            stillTarget(img),
            lineart,
            rand,
            STILL_MAX_DIM,
            2.9,
            0.3,
          )
        }
        applyMaskScale()
        renderStills()
      }
      img.src = (isMobile && p.image.srcMobile) || p.image.src
      loaders.push(img)
    })

    /* ---- dino simulation ---- */
    const dinoN = Math.round(count * 0.08)
    const groundN = Math.round(count * 0.62)
    const perSlot = Math.floor((count * 0.2) / OBSTACLE_SLOTS)
    // 0 dino, 1 ground, 2 obstacle, 3 sky. Fixed by index, so resolved once.
    const ROLE_SKY = 3
    const role = new Uint8Array(count)
    {
      let i = 0
      for (let k = 0; k < dinoN && i < count; k++, i++) role[i] = 0
      for (let k = 0; k < groundN && i < count; k++, i++) role[i] = 1
      for (let k = 0; k < perSlot * OBSTACLE_SLOTS && i < count; k++, i++) role[i] = 2
      for (; i < count; i++) role[i] = ROLE_SKY
    }
    const obstacles: Obstacle[] = Array.from({ length: OBSTACLE_SLOTS }, () => ({
      x: 0,
      active: false,
      cells: 0,
    }))
    let scroll = 0
    let speed = 5.2
    let dinoY = 0
    let dinoV = 0
    let over = false
    let started = false
    let score = 0
    let best = 0
    let nextSpawn = 6

    const resetGame = () => {
      scroll = 0
      speed = 5.2
      dinoY = 0
      dinoV = 0
      over = false
      score = 0
      nextSpawn = 6
      obstacles.forEach((ob) => (ob.active = false))
    }

    if (restartRef) {
      restartRef.current = () => {
        resetGame()
        started = true
      }
    }

    const jump = () => {
      if (over) {
        resetGame()
        started = true
        return
      }
      started = true
      if (dinoY <= 0.001) dinoV = JUMP_V
    }

    const onKey = (e: KeyboardEvent) => {
      if (panelRef.current !== dinoIdx) return
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault()
        jump()
      }
    }
    const onTap = (e: PointerEvent) => {
      if (dinoIdx >= 0 && panelRef.current === dinoIdx) {
        jump()
        return
      }
      if (panelRef.current === helloIdx && !isMobile) {
        const rect = canvas.getBoundingClientRect()
        const hit = groundAt(e.clientX - rect.left, e.clientY - rect.top)
        if (hit) {
          // A handful at most; a rapid clicker should not be able to stack
          // enough waves to flatten the whole surface.
          if (ripples.length >= 4) ripples.shift()
          ripples.push({ x: hit.x, z: hit.z, t: performance.now() })
        }
      }
    }
    window.addEventListener("keydown", onKey)
    canvas.addEventListener("pointerdown", onTap)

    let current = progressRef.current
    let frame = 0
    let yaw = 0
    let pitch = BASE_PITCH
    let centerX = isMobile ? 0.5 : 0.63
    let centerY = isMobile ? 0.3 : 0.47
    /* yaw and pitch are fixed for the whole frame, so their sines and cosines
       are hoisted. Recomputing them inside project() meant four trig calls per
       point — by far the largest cost in the loop. */
    let cosYaw = 1
    let sinYaw = 0
    let cosPitch = 1
    let sinPitch = 0

    const layer = document.createElement("canvas")
    const lctx = layer.getContext("2d")
    let pixels: ImageData | null = null

    /** Rasterise the dense still at the exact size the finished panel shows. */
    const renderStills = () => {
      if (!width || !height) return
      stillMasks.forEach((mask, i) => {
        if (!mask) return
        const anchorY = isMobile ? BLEED_CENTER_Y_MOBILE : BLEED_CENTER_Y_DESKTOP
        const bandH = isMobile ? (height * 0.6) / focal : height / focal
        const scale = Math.min(bandH, width / focal / mask.aspect) * 0.97
        const c = stills[i] ?? document.createElement("canvas")
        c.width = Math.round(width)
        c.height = Math.round(height)
        const cx = c.getContext("2d")
        if (!cx) return
        const img = cx.createImageData(c.width, c.height)
        const d = img.data
        /* The still is sampled once at a density that suits a desktop canvas.
           Blitting all of it into a phone-sized band would cover nearly every
           pixel and read as a white blob, so only a share proportional to the
           area actually drawn is used. The point order is already shuffled,
           so taking a prefix is an even subset. */
        const drawnH = scale * focal
        const drawnW = drawnH * mask.aspect
        const want = Math.min(mask.ink.length, Math.round(drawnW * drawnH * 0.16))
        for (let k = 0; k < want; k++) {
          const o = k * STRIDE
          // Matches the projection at the panel's resting camera: yaw a whole
          // number of turns, pitch flat, so the still lands exactly where the
          // particles do.
          const sx = Math.round(c.width * BLEED_CENTER_X + mask.points[o] * scale * focal)
          const sy = Math.round(c.height * anchorY + mask.points[o + 1] * scale * focal)
          if (sx < 0 || sx >= c.width || sy < 0 || sy >= c.height) continue
          const a = 0.3 + mask.ink[k] * 0.7
          const po = (sy * c.width + sx) * 4
          d[po] += PAPER_R * a
          d[po + 1] += PAPER_G * a
          d[po + 2] += PAPER_B * a
          d[po + 3] = 255
        }
        cx.putImageData(img, 0, 0)
        stills[i] = c
      })
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2)
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      canvas.width = Math.max(1, Math.round(width * dpr))
      canvas.height = Math.max(1, Math.round(height * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      layer.width = Math.max(1, Math.round(width))
      layer.height = Math.max(1, Math.round(height))
      pixels = lctx ? lctx.createImageData(layer.width, layer.height) : null
      focal = (height * 0.58) / DIST
      applyMaskScale()
      renderStills()
    }

    type P = { sx: number; sy: number; z: number; ok: boolean }
    const scratch: P = { sx: 0, sy: 0, z: 0, ok: false }

    const project = (x: number, y: number, z: number, out: P) => {
      const x1 = x * cosYaw - z * sinYaw
      const z1 = x * sinYaw + z * cosYaw
      const y1 = y * cosPitch - z1 * sinPitch
      const z2 = y * sinPitch + z1 * cosPitch
      const d = Math.max(0.6, DIST + z2)
      const f = (height * 0.58) / d
      out.sx = width * centerX + x1 * f
      out.sy = height * centerY + y1 * f
      out.z = z2
      out.ok = DIST + z2 > 0.6
      return out
    }

    /** Screen point to a point on the opening plane, or null if the ray
        misses it. Inverting the projection is direct because z2 varies
        linearly along the ray. */
    const groundAt = (sx: number, sy: number) => {
      const F = height * 0.58
      const u = sx - width * centerX
      const v = sy - height * centerY
      const denom = (v * cosPitch) / F + sinPitch
      if (Math.abs(denom) < 1e-4) return null
      const tRay = (PLANE_Y + DIST * sinPitch) / denom
      if (!(tRay > 0.6 && tRay < 40)) return null
      const x1 = (u * tRay) / F
      const y1 = (v * tRay) / F
      const z2 = tRay - DIST
      const z1 = -y1 * sinPitch + z2 * cosPitch
      return { x: x1 * cosYaw + z1 * sinYaw, z: -x1 * sinYaw + z1 * cosYaw }
    }

    /** Rewrite the dino panel's positions for this frame. */
    // Phones get a smaller runner so the game fits the strip below the copy.
    const gs = isMobile ? 0.55 : 1
    const dScale = DINO_SCALE * gs
    const cScale = CACTUS_SCALE * gs

    const stepDino = (dt: number) => {
      const dst = states[dinoIdx]
      /* Two different widths matter here, and conflating them put the runner
         off-screen on phones. `visW` is what the camera can actually see;
         `gw` is the span the track recycles over, which must be at least the
         visible width but is otherwise free. Everything the player looks at is
         placed against visW. */
      const visW = width / focal
      const visHalf = visW / 2
      const gw = Math.max(visW * 1.15, 6)
      const halfW = gw / 2
      const dinoW = DINO.w * dScale
      const dinoH = DINO.h * dScale
      // Sit the runner to the right of the copy column rather than at the
      // very edge, where the text would cover it.
      const dinoLeft = -visHalf + visW * (isMobile ? 0.16 : 0.44)

      if (started && !over) {
        speed += dt * 0.16
        scroll += speed * dt
        score += speed * dt * 6

        dinoV -= GRAVITY * dt
        dinoY += dinoV * dt
        if (dinoY < 0) {
          dinoY = 0
          dinoV = 0
        }

        nextSpawn -= speed * dt
        if (nextSpawn <= 0) {
          const free = obstacles.find((ob) => !ob.active)
          if (free) {
            free.active = true
            free.x = visHalf + 0.8
            free.cells = 1 + ((rand() * 2.99) | 0)
          }
          nextSpawn = 4.5 + rand() * 5.5
        }

        const dinoTop = GROUND_Y - dinoH - dinoY
        for (const ob of obstacles) {
          if (!ob.active) continue
          ob.x -= speed * dt
          const obW = CACTUS.w * cScale * ob.cells
          const obTop = GROUND_Y - CACTUS.h * cScale
          // Slightly forgiving box, so a near miss reads as a near miss.
          if (
            dinoLeft + dinoW * 0.85 > ob.x + obW * 0.15 &&
            dinoLeft + dinoW * 0.15 < ob.x + obW * 0.85 &&
            dinoTop + dinoH * 0.9 > obTop
          ) {
            over = true
            if (score > best) best = score
          }
          if (ob.x < -visHalf - 2) ob.active = false
        }
      }

      if (dinoRef) {
        dinoRef.current.score = Math.floor(score)
        dinoRef.current.best = Math.floor(best)
        dinoRef.current.over = over
        dinoRef.current.started = started
      }

      const put = (i: number, x: number, y: number, z: number) => {
        const o = i * STRIDE
        dst[o] = x
        dst[o + 1] = y
        dst[o + 2] = z
      }

      let idx = 0

      // 1. the dino itself
      const dinoTop = GROUND_Y - dinoH - dinoY
      const dc = DINO.cells.length / 2
      for (let k = 0; k < dinoN; k++, idx++) {
        const c = (k % dc) * 2
        put(
          idx,
          dinoLeft + DINO.cells[c] * dScale + (r[idx] - 0.5) * dScale,
          dinoTop + DINO.cells[c + 1] * dScale + (r[idx + count] - 0.5) * dScale,
          (r[idx + count * 2] - 0.5) * 0.1,
        )
      }

      /* 2. the ground. Each particle keeps a fixed offset and is wrapped
            modulo the visible width, so a particle leaving on the left is
            literally the same particle arriving on the right — the track is
            recycled rather than respawned. */
      for (let k = 0; k < groundN; k++, idx++) {
        const base = r[idx] * gw
        let x = base - (scroll % gw)
        if (x < 0) x += gw
        x -= halfW
        const band = r[idx + count]
        // A crisp line, with a scatter of grit falling away beneath it.
        const y =
          band < 0.62
            ? GROUND_Y + (r[idx + count * 2] - 0.5) * 0.03
            : GROUND_Y + 0.04 + (band - 0.62) * 0.55
        put(idx, x, y, (r[idx + count * 3] - 0.5) * 0.12)
      }

      // 3. obstacles, one slot each; unused slots wait off to the right
      const cc = CACTUS.cells.length / 2
      const obTop = GROUND_Y - CACTUS.h * cScale
      for (let s = 0; s < OBSTACLE_SLOTS; s++) {
        const ob = obstacles[s]
        for (let k = 0; k < perSlot; k++, idx++) {
          if (!ob.active) {
            // Waiting off-stage to the right, ready to be reused.
            put(idx, visHalf + 3 + r[idx] * 2, GROUND_Y - r[idx + count] * 0.5, 0)
            continue
          }
          // rep and cell have to advance independently — taking both modulo k
          // correlates them, so only some (segment, pixel) pairs ever appear
          // and the cactus renders as dashes.
          const rep = ((k / cc) | 0) % ob.cells
          const c = (k % cc) * 2
          put(
            idx,
            ob.x + rep * CACTUS.w * cScale + CACTUS.cells[c] * cScale,
            obTop + CACTUS.cells[c + 1] * cScale,
            (r[idx + count * 2] - 0.5) * 0.08,
          )
        }
      }

      // 4. whatever is left becomes distant sky, drifting far more slowly
      for (; idx < count; idx++) {
        const base = r[idx] * gw
        let x = base - ((scroll * 0.12) % gw)
        if (x < 0) x += gw
        x -= halfW
        put(idx, x, -1.4 - r[idx + count] * 2.4, 1.6 + r[idx + count * 2] * 1.4)
      }
    }

    const drawFloor = (accent: { r: number; g: number; b: number }, strength: number) => {
      const cy = cosYaw
      const sy = sinYaw
      const cp = cosPitch
      const flat = FLOOR_Y * sinPitch
      ctx.lineWidth = 1

      const clip = (a: number, b: number, base: number, slope: number) => {
        if (Math.abs(slope) < 1e-6) return DIST + base >= NEAR ? [a, b] : null
        const edge = (NEAR - DIST - base) / slope
        const lo = slope > 0 ? Math.max(a, edge) : a
        const hi = slope < 0 ? Math.min(b, edge) : b
        return hi - lo > 0.05 ? [lo, hi] : null
      }

      for (let s = -FLOOR_EXTENT; s <= FLOOR_EXTENT + 1e-6; s += FLOOR_STEP) {
        const edgeFade = 1 - Math.abs(s) / (FLOOR_EXTENT * 1.12)
        const alpha = 0.5 * edgeFade * edgeFade * strength
        if (alpha <= 0.006) continue

        for (let axis = 0; axis < 2; axis++) {
          const base = flat + (axis === 0 ? s * sy : s * cy) * cp
          const slope = (axis === 0 ? cy : -sy) * cp
          const range = clip(-FLOOR_EXTENT, FLOOR_EXTENT, base, slope)
          if (!range) continue

          const p0 =
            axis === 0
              ? project(s, FLOOR_Y, range[0], scratch)
              : project(range[0], FLOOR_Y, s, scratch)
          const ax = p0.sx
          const ay = p0.sy
          const az = p0.z
          const p1 =
            axis === 0
              ? project(s, FLOOR_Y, range[1], scratch)
              : project(range[1], FLOOR_Y, s, scratch)

          const near = DIST + Math.min(az, p1.z)
          const far = DIST + Math.max(az, p1.z)
          const grad = ctx.createLinearGradient(ax, ay, p1.sx, p1.sy)
          const aNear = alpha * Math.max(0, Math.min(1, (12 - near) / 9))
          const aFar = alpha * Math.max(0, Math.min(1, (12 - far) / 9))
          const flip = az < p1.z
          grad.addColorStop(0, rgba(accent, flip ? aNear : aFar))
          grad.addColorStop(1, rgba(accent, flip ? aFar : aNear))
          ctx.strokeStyle = grad

          ctx.beginPath()
          ctx.moveTo(ax, ay)
          ctx.lineTo(p1.sx, p1.sy)
          ctx.stroke()
        }
      }
    }

    let greetClock = 0
    let lastT = performance.now()

    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - lastT) / 1000)
      lastT = now
      ctx.clearRect(0, 0, width, height)

      const station = current * last
      const idx = Math.min(last - 1, Math.max(0, Math.floor(station)))
      const t = Math.min(1, Math.max(0, station - idx))
      const A = PANELS[idx]
      const B = PANELS[idx + 1]
      const accent = mixHex(A.accent, B.accent, t)

      const lerpFlag = (fn: (p: (typeof PANELS)[number], i: number) => boolean) => {
        const a = fn(A, idx) ? 1 : 0
        const b = fn(B, idx + 1) ? 1 : 0
        return a + (b - a) * t
      }

      // The artwork and the game both want to be seen square on; the
      // formations want perspective.
      const flatness = lerpFlag((p) => p.behavior === "image" || p.behavior === "dino")
      const bleed = lerpFlag((p) => !!p.image?.fullBleed)
      const art = lerpFlag((p) => p.behavior === "image")
      const game = dinoIdx < 0 ? 0 : lerpFlag((p) => p.behavior === "dino")
      const orbitOn = lerpFlag((p) => p.behavior === "orbit")

      // Ease within each leg so the turn reads as one deliberate movement
      // rather than a constant spin bolted to the scrollbar.
      const te = t * t * (3 - 2 * t)
      const hello = helloIdx < 0 ? 0 : lerpFlag((p, i) => i === helloIdx)
      greetClock += dt
      // Ten seconds of greeting, then it settles into a plain surface and the
      // pointer takes over.
      const greet =
        reduce.matches || isMobile
          ? 0
          : greetClock < 0.6
            ? greetClock / 0.6
            : greetClock < GREET_HOLD
              ? 1
              : Math.max(0, 1 - (greetClock - GREET_HOLD) / 1.6)
      const greetOn = greet * hello

      yaw = yawAt[idx] + (yawAt[idx + 1] - yawAt[idx]) * te
      pitch =
        BASE_PITCH +
        (FLAT_PITCH - BASE_PITCH) * flatness +
        (GREET_PITCH - BASE_PITCH) * greetOn
      const baseX = isMobile ? 0.5 : 0.63
      centerX = baseX + (0.5 - baseX) * Math.max(bleed, game)
      const restY = isMobile ? 0.3 : 0.47
      /* On a phone the game cannot share the middle of the screen with six
         lines of copy, so it is lifted into its own band across the top. */
      const gameY = isMobile ? 0.715 : 0.47
      // Small screens put the artwork in the upper band, above the copy.
      const bleedY = isMobile ? BLEED_CENTER_Y_MOBILE : BLEED_CENTER_Y_DESKTOP
      centerY = restY + (bleedY - restY) * bleed + (gameY - restY) * game
      cosYaw = Math.cos(yaw)
      sinYaw = Math.sin(yaw)
      cosPitch = Math.cos(pitch)
      sinPitch = Math.sin(pitch)

      if (dinoIdx >= 0 && game > 0) stepDino(reduce.matches ? 0 : dt)

      pointerOn = false
      if (hello > 0.2 && pointerSX >= 0 && !isMobile) {
        const hit = groundAt(pointerSX, pointerSY)
        if (hit) {
          pointerX = hit.x
          pointerZ = hit.z
          pointerOn = true
        }
      }
      for (let k = ripples.length - 1; k >= 0; k--) {
        if ((now - ripples[k].t) / 1000 > RIPPLE_LIFE) ripples.splice(k, 1)
      }

      const glow = ctx.createRadialGradient(
        width * centerX,
        height * centerY,
        0,
        width * centerX,
        height * centerY,
        Math.max(width, height) * 0.45,
      )
      glow.addColorStop(0, rgba(accent, 0.14 + art * 0.05))
      glow.addColorStop(1, rgba(accent, 0))
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, width, height)

      drawFloor(accent, (1 - art * 0.8) * (1 - game * 0.9))

      const from = states[idx]
      const to = states[idx + 1]
      const flatDots = art > 0.55
      const activeSpot = activeHotspotRef ? activeHotspotRef.current : -1

      /* The ring breathes with the track. Bass pushes it outward, the mids
         drive the height of the wave, and each detected onset snaps a short
         pulse through both. */
      const au = audioRef?.current
      const audioOn = orbitOn > 0 && au ? orbitOn : 0
      const beatPulse = au ? au.beat * au.beat : 0
      // Restrained on purpose: at full gain the ring swelled past the edges
      // of the frame on every kick.
      const swell = au ? (au.bass * 0.17 + beatPulse * 0.11) * audioOn : 0
      const waveGain = au ? (au.mid * 0.6 + beatPulse * 0.28) * audioOn : 0
      const spin = au ? au.level * audioOn : 0

      const LW = layer.width
      const LH = layer.height
      const pxls = pixels
      if (pxls && lctx) {
        const d = pxls.data
        d.fill(0)

        for (let i = 0; i < count; i++) {
          const o = i * STRIDE
          // Stagger the morph so the change sweeps through as a wave rather
          // than every particle snapping at once.
          const dl = (i / count) * 0.35
          let lt = (t - dl) / (1 - dl)
          lt = lt < 0 ? 0 : lt > 1 ? 1 : lt
          lt = lt * lt * (3 - 2 * lt)

          let mx = from[o] + (to[o] - from[o]) * lt
          let my = from[o + 1] + (to[o + 1] - from[o + 1]) * lt
          let mz = from[o + 2] + (to[o + 2] - from[o + 2]) * lt

          if (audioOn > 0 && (swell > 0.001 || waveGain > 0.001)) {
            // The ring is centred on the origin, so pushing along the radius
            // is just scaling x and z together.
            const rad = Math.sqrt(mx * mx + mz * mz)
            if (rad > 1e-4) {
              const k = 1 + swell * (0.3 + rad * 0.08)
              const ang = spin * 0.07
              const ca = Math.cos(ang)
              const sa = Math.sin(ang)
              const nx = mx * k
              const nz = mz * k
              mx = nx * ca - nz * sa
              mz = nx * sa + nz * ca
            }
            my *= 1 + waveGain
          }

          if (hello > 0) {
            /* A slow swell crossing the surface, so the plane is never
               completely still even with nothing else happening. Two waves at
               different rates keeps it from looking like a metronome. */
            my +=
              (Math.sin(mx * 0.85 + now * 0.00038) * 0.09 +
                Math.sin(mz * 0.62 - now * 0.00026) * 0.07) *
              hello

            // Up is negative here, so a lift subtracts.
            if (greetOn > 0 && greetMask.length > 0 && greetMask[i] === 1) {
              const bounce = Math.abs(Math.sin(now * 0.0016 - mx * 0.55))
              my -= (0.26 + bounce * 0.24) * greetOn
            }
            if (pointerOn) {
              const dx = mx - pointerX
              const dz = mz - pointerZ
              const d2 = dx * dx + dz * dz
              // A soft rise rather than a peak: the cursor should read as a
              // presence on the surface, not as a spike following the mouse.
              if (d2 < 2.9) {
                const fall = 1 - d2 / 2.9
                my -= fall * fall * 0.42 * hello
              }
            }
            // Expanding rings from a click, fading as they travel out.
            for (let k = 0; k < ripples.length; k++) {
              const rp = ripples[k]
              const age = (now - rp.t) / 1000
              const dx = mx - rp.x
              const dz = mz - rp.z
              const front = Math.sqrt(dx * dx + dz * dz) - age * RIPPLE_SPEED
              if (front > -RIPPLE_WIDTH && front < RIPPLE_WIDTH) {
                const fall = 1 - Math.abs(front) / RIPPLE_WIDTH
                const decay = 1 - age / RIPPLE_LIFE
                my -= fall * fall * decay * RIPPLE_AMP * hello
              }
            }
          }

          project(mx, my, mz, scratch)
          if (!scratch.ok) continue

          const depth = scratch.z > 2.4 ? 0 : scratch.z < -1.8 ? 1 : (2.4 - scratch.z) / 4.2
          const lit = i % 23 === 0

          const cloudA = 0.03 + depth * 0.13
          const inkA = 0.16 + inks[i] * 0.74
          let alpha = cloudA + (inkA - cloudA) * art + game * 0.34
          if (game > 0) {
            const rl = role[i]
            if (rl === ROLE_SKY) alpha -= game * 0.3
            else if (rl === 0 || rl === 2) alpha += game * 0.34
          }

          let cr = lit ? accent.r : PAPER_R
          let cg = lit ? accent.g : PAPER_G
          let cb = lit ? accent.b : PAPER_B

          if (greetOn > 0 && greetMask.length > 0 && greetMask[i] === 1) {
            alpha += 0.5 * greetOn
          }
          if (audioOn > 0 && beatPulse > 0.01) alpha += beatPulse * 0.22 * audioOn
          if (orbitOn > 0 && orbitTag[i] >= 0) {
            alpha += (orbitTag[i] === activeSpot ? 0.85 : 0.42) * orbitOn
            cr = accent.r
            cg = accent.g
            cb = accent.b
          }
          if (alpha <= 0.004) continue

          const size = flatDots ? 1 : (lit ? 1.4 : 0.8) + depth * 1.0
          const side = size < 1 ? 1 : size > 4 ? 4 : Math.round(size)
          const half = side * 0.5

          const ar = cr * alpha
          const ag = cg * alpha
          const ab = cb * alpha

          const x0 = Math.round(scratch.sx - half)
          const y0 = Math.round(scratch.sy - half)
          for (let yy = 0; yy < side; yy++) {
            const Y = y0 + yy
            if (Y < 0 || Y >= LH) continue
            let po = (Y * LW + x0) * 4
            for (let xx = 0; xx < side; xx++) {
              const X = x0 + xx
              if (X >= 0 && X < LW) {
                d[po] += ar
                d[po + 1] += ag
                d[po + 2] += ab
                d[po + 3] = 255
              }
              po += 4
            }
          }
        }

        lctx.putImageData(pxls, 0, 0)
        // Colour is accumulated pre-multiplied, so the layer composites
        // additively — overlapping particles pile up into a glow.
        ctx.globalCompositeOperation = "lighter"
        ctx.drawImage(layer, 0, 0, width, height)

        // The dense still only lines up once the camera has finished moving,
        // so it fades in over the last quarter of the arrival.
        const stillIdx = B.image?.fullBleed ? idx + 1 : A.image?.fullBleed ? idx : -1
        const still = stillIdx >= 0 ? stills[stillIdx] : null
        if (still && art > 0.7) {
          const k = Math.min(1, (art - 0.7) / 0.3)
          ctx.globalAlpha = k * k * (3 - 2 * k)
          ctx.drawImage(still, 0, 0, width, height)
          ctx.globalAlpha = 1
        }
        ctx.globalCompositeOperation = "source-over"
      }

      // Publish hotspot screen positions for the DOM buttons to follow.
      if (hotspotsRef && orbitIdx >= 0) {
        const list = hotspotsRef.current
        for (let k = 0; k < spots.length; k++) {
          const hp = spotAt(spots[k].at)
          project(hp.x, hp.y, hp.z, scratch)
          if (!list[k]) list[k] = { x: 0, y: 0, on: false }
          // Keep the label on screen even when its point sits near the edge.
          const pad = isMobile ? 62 : 90
          list[k].x = Math.max(pad, Math.min(width - pad, scratch.sx))
          list[k].y = Math.max(28, Math.min(height - 28, scratch.sy))
          list[k].on = scratch.ok && orbitOn > 0.9
        }
      }
    }

    const tick = (now: number) => {
      const target = progressRef.current
      // Never bind rotation to raw scroll — ease toward it so a flicked
      // trackpad becomes a glide instead of a jolt.
      current += (target - current) * (reduce.matches ? 1 : 0.085)
      if (Math.abs(target - current) < 1e-5) current = target

      draw(now)

      const nearest = Math.max(0, Math.min(last, Math.round(current * last)))
      if (nearest !== panelRef.current) {
        panelRef.current = nearest
        onPanelChange?.(nearest)
      }

      frame = requestAnimationFrame(tick)
    }

    resize()
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null
    observer?.observe(canvas)
    if (!observer) window.addEventListener("resize", resize)

    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      observer?.disconnect()
      if (!observer) window.removeEventListener("resize", resize)
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("pointerleave", onPointerLeave)
      canvas.removeEventListener("pointerdown", onTap)
      loaders.forEach((img) => {
        img.onload = null
      })
    }
  }, [
    progressRef,
    onPanelChange,
    isMobile,
    hotspotsRef,
    activeHotspotRef,
    dinoRef,
    restartRef,
    audioRef,
  ])

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
}
