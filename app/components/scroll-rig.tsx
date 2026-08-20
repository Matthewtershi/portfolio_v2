"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ArrowUpRight, X } from "lucide-react"
import Lattice, { type DinoState, type ScreenPoint } from "./lattice"
import AudioPlayer, { emptyLevels, type AudioLevels } from "./audio-player"
import { LINKS, PANELS } from "@/app/data/panels"

const LAST = PANELS.length - 1

/** Desktop scrim. Full-bleed artwork gets a lighter, angled one so the
    picture is not sliced in half by a dark band. */
function bleedScrim(p: (typeof PANELS)[number]) {
  return p.image?.fullBleed
    ? "linear-gradient(103deg, rgba(18,16,14,0.95) 0%, rgba(18,16,14,0.82) 20%, rgba(18,16,14,0.45) 38%, transparent 58%)"
    : "linear-gradient(to right, rgba(18,16,14,0.94) 0%, rgba(18,16,14,0.55) 36%, transparent 60%)"
}

interface ScrollRigProps {
  isMobile?: boolean
}

export default function ScrollRig({ isMobile = false }: ScrollRigProps) {
  const outerRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef(0)
  const hotspotsRef = useRef<ScreenPoint[]>([])
  const activeHotspotRef = useRef(-1)
  const dinoRef = useRef<DinoState>({ score: 0, best: 0, over: false, started: false })
  const restartRef = useRef<(() => void) | null>(null)
  const audioRef = useRef<AudioLevels>(emptyLevels())

  const overRef = useRef(false)
  const spotEls = useRef<(HTMLButtonElement | null)[]>([])
  const scoreEl = useRef<HTMLSpanElement>(null)
  const bestEl = useRef<HTMLSpanElement>(null)
  const hintEl = useRef<HTMLSpanElement>(null)

  const [panel, setPanel] = useState(0)
  const [started, setStarted] = useState(false)
  const [openSpot, setOpenSpot] = useState(-1)
  const [secretOpen, setSecretOpen] = useState(false)
  // Mirrored out of the ref only when it flips, so the run itself never
  // re-renders React.
  const [gameOver, setGameOver] = useState<{ score: number; best: number } | null>(null)

  /* Progress comes from the container's own geometry rather than a wheel
     accumulator, so resizing, refreshing mid-page and the back button all
     keep working for free.

     Once scrolling goes quiet the view eases to the nearest panel, so nobody
     ends up parked between two of them. It is deliberately soft: it only
     fires after the gesture has stopped, it ignores anything already close
     enough or more than halfway to the next panel, and it never blocks a
     scroll in progress. */
  useEffect(() => {
    const el = outerRef.current
    if (!el) return
    let idle: ReturnType<typeof setTimeout> | null = null
    let settling = 0

    const snap = () => {
      if (performance.now() < settling) return
      const span = el.offsetHeight - window.innerHeight
      if (span <= 0) return
      const p = progressRef.current
      const station = p * LAST
      const nearest = Math.round(station)
      const drift = Math.abs(station - nearest)
      // Already there, or the visitor is genuinely mid-journey: leave it be.
      if (drift < 0.04 || drift > 0.42) return
      settling = performance.now() + 700
      window.scrollTo({
        top: el.offsetTop + (span * nearest) / LAST,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      })
    }

    const read = () => {
      const rect = el.getBoundingClientRect()
      const span = rect.height - window.innerHeight
      const next = span > 0 ? Math.min(1, Math.max(0, -rect.top / span)) : 0
      progressRef.current = next
      setStarted(next > 0.015)
      if (idle) clearTimeout(idle)
      idle = setTimeout(snap, 160)
    }

    read()
    window.addEventListener("scroll", read, { passive: true })
    window.addEventListener("resize", read)
    return () => {
      if (idle) clearTimeout(idle)
      window.removeEventListener("scroll", read)
      window.removeEventListener("resize", read)
    }
  }, [])

  /* The hotspots and the score change every frame. Driving them through React
     state would re-render the whole panel sixty times a second, so they are
     written straight to the DOM instead. */
  useEffect(() => {
    let frame = 0
    const loop = () => {
      const list = hotspotsRef.current
      for (let i = 0; i < spotEls.current.length; i++) {
        const el = spotEls.current[i]
        const p = list[i]
        if (!el) continue
        if (!p || !p.on) {
          el.style.opacity = "0"
          el.style.pointerEvents = "none"
          continue
        }
        el.style.transform = `translate(${p.x}px, ${p.y}px) translate(-50%, -50%)`
        el.style.opacity = "1"
        el.style.pointerEvents = "auto"
      }
      const d = dinoRef.current
      if (scoreEl.current) scoreEl.current.textContent = String(d.score).padStart(5, "0")
      if (bestEl.current) {
        bestEl.current.textContent = d.best ? `HI ${String(d.best).padStart(5, "0")}` : ""
      }
      if (hintEl.current) {
        hintEl.current.textContent = d.over ? "" : d.started ? "" : "Press space, or tap, to jump"
      }
      if (d.over !== overRef.current) {
        overRef.current = d.over
        setGameOver(d.over ? { score: d.score, best: d.best } : null)
      }
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [])

  const goTo = useCallback((index: number) => {
    const el = outerRef.current
    if (!el) return
    const span = el.offsetHeight - window.innerHeight
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    window.scrollTo({
      top: el.offsetTop + span * (index / LAST),
      behavior: reduce ? "auto" : "smooth",
    })
  }, [])

  const handlePanelChange = useCallback((index: number) => {
    setPanel(index)
    setOpenSpot(-1)
    activeHotspotRef.current = -1
    setSecretOpen(false)
  }, [])

  const active = PANELS[panel]
  // The game is desktop-only, so the HUD and its prompts go with it.
  const isDino = active.behavior === "dino" && !isMobile
  const heading = (isMobile && active.headingCompact) || active.heading
  const blurb = (isMobile && active.blurbCompact) || active.blurb
  const scrim = !isMobile
    ? bleedScrim(active)
    : active.image?.fullBleed
      ? "linear-gradient(to bottom, rgba(18,16,14,0.4) 0%, transparent 14%, transparent 48%, rgba(18,16,14,0.9) 60%, var(--charcoal) 68%)"
      : active.behavior === "dino"
        // The runner occupies the bottom strip, so the ground under the copy
        // is solid but the last sixth is left clear for the game.
        ? "linear-gradient(to bottom, transparent 8%, rgba(18,16,14,0.95) 20%, rgba(18,16,14,0.96) 74%, transparent 83%)"
        : "linear-gradient(to bottom, transparent 44%, rgba(18,16,14,0.96) 100%)"
  const bleed = !!active.image?.fullBleed
  const spots = active.hotspots ?? []
  const openDetail = openSpot >= 0 ? spots[openSpot] : null

  return (
    <div ref={outerRef} className="relative" style={{ height: `calc(100vh + ${LAST * 100}vh)` }}>
      <div className="sticky top-0 h-screen overflow-hidden bg-[var(--charcoal)]">
        <Lattice
          progressRef={progressRef}
          onPanelChange={handlePanelChange}
          isMobile={isMobile}
          hotspotsRef={hotspotsRef}
          activeHotspotRef={activeHotspotRef}
          dinoRef={dinoRef}
          restartRef={restartRef}
          audioRef={audioRef}
        />

        {/* Horizon fade and copy scrim. Static, so the browser composites them
            once rather than the canvas repainting them each frame. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[2]"
          style={{
            transition: "background 0.7s var(--ease-quintic)",
            // The runner lives in the bottom strip, so the usual bottom
            // vignette would black the game out entirely.
            background:
              active.behavior === "dino"
                ? "linear-gradient(to bottom, var(--charcoal) 0%, transparent 24%, transparent 100%)"
                : "linear-gradient(to bottom, var(--charcoal) 0%, transparent 26%, transparent 84%, rgba(18,16,14,0.95) 100%)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[3]"
          style={{
            transition: "background 0.7s var(--ease-quintic)",
            background: scrim,
          }}
        />

        {/* Clicking the background of the contact panel reveals the note. */}
        {active.secret && (
          <button
            type="button"
            aria-label={active.secret.prompt}
            onClick={() => setSecretOpen((v) => !v)}
            className="absolute inset-0 z-[4] cursor-pointer bg-transparent"
          />
        )}

        {/* Orbit hotspots. Real buttons, positioned from the projected ring. */}
        <div className="pointer-events-none absolute inset-0 z-[8]">
          {spots.map((s, i) => (
            <button
              key={s.label}
              type="button"
              ref={(el) => {
                spotEls.current[i] = el
              }}
              onClick={() => {
                setOpenSpot(i)
                activeHotspotRef.current = i
              }}
              onMouseEnter={() => {
                activeHotspotRef.current = i
              }}
              onMouseLeave={() => {
                activeHotspotRef.current = openSpot
              }}
              style={{ opacity: 0, transition: "opacity 0.4s ease", "--accent": active.accent } as React.CSSProperties}
              className="absolute left-0 top-0 flex items-center gap-2 whitespace-nowrap rounded-full border border-white/15 bg-[var(--charcoal)]/70 px-3 py-1.5 text-[0.72rem] tracking-wide text-white/70 backdrop-blur-sm transition-colors hover:border-[var(--accent)] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: active.accent }}
                aria-hidden="true"
              />
              {s.label}
            </button>
          ))}
        </div>

        {/* Panel copy — real DOM, so it stays selectable and readable by
            assistive tech. Nothing important is painted into the canvas. */}
        <div
          className={`pointer-events-none absolute inset-0 z-10 flex items-end px-6 lg:items-center lg:px-16 lg:pb-0 ${
            isDino ? "pb-36" : "pb-24"
          }`}
        >
          <div className="w-full max-w-[30rem]">
            <div
              key={panel}
              className="panel-copy pointer-events-auto"
              style={{ "--accent": active.accent } as React.CSSProperties}
            >
              <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)]">
                {active.eyebrow}
              </p>

              <h2
                className="font-serif font-semibold leading-[1.05] tracking-tight text-white"
                style={{ fontSize: "clamp(2rem, 4.4vw, 3.1rem)" }}
              >
                {heading}
              </h2>

              {blurb && (
                <p className="mt-5 text-[0.98rem] leading-relaxed text-white/60">{blurb}</p>
              )}

              {isDino && (
                <div className="mt-6">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[0.7rem] tracking-widest text-white/45">
                    <span ref={scoreEl}>00000</span>
                    <span ref={bestEl} className="text-white/25" />
                    <span ref={hintEl} className="text-[var(--accent)]" />
                  </div>

                </div>
              )}

              {active.items.length > 0 && (
                <ul className="mt-7 space-y-3.5">
                  {active.items.map((item, i) => (
                    <li key={i} className="flex gap-3.5">
                      <span
                        aria-hidden="true"
                        className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]"
                      />
                      <span className="text-[0.93rem] leading-relaxed text-white/70">
                        {item.lead && (
                          <span className="font-medium text-white/95">{item.lead} — </span>
                        )}
                        {item.text}
                        {item.note && (
                          <span className="ml-2 text-xs text-white/35">{item.note}</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {active.showLinks && (
                <div className="mt-7 flex flex-col gap-2.5">
                  {LINKS.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      target={link.href.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between gap-6 rounded-xl border border-white/10 bg-[var(--charcoal)]/60 px-4 py-3 backdrop-blur-sm transition-colors hover:border-[var(--accent)]/40 hover:bg-white/[0.06]"
                    >
                      <span className="text-xs uppercase tracking-[0.15em] text-white/40">
                        {link.label}
                      </span>
                      <span className="flex items-center gap-2 text-sm text-white/80 transition-colors group-hover:text-[var(--accent)]">
                        {link.value}
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </span>
                    </a>
                  ))}
                </div>
              )}

              {active.secret && !secretOpen && (
                <p className="mt-6 text-[0.75rem] italic text-white/30">{active.secret.prompt}</p>
              )}
            </div>
          </div>
        </div>

        {/* Game over. Floated over the playfield rather than placed in the
            copy column, so a crash never pushes the text around. */}
        {isDino && gameOver && (
          <div className="pointer-events-none absolute inset-0 z-[22] flex items-center justify-center px-6 lg:pl-[38%] lg:pr-24">
            <div
              className="panel-copy pointer-events-auto flex flex-col gap-3 rounded-2xl border border-white/12 bg-[var(--charcoal)]/90 px-6 py-5 backdrop-blur-md"
              style={{ "--accent": active.accent } as React.CSSProperties}
            >
              <p className="font-serif text-xl font-semibold text-white">Ouch.</p>
              <div className="flex items-baseline gap-5 font-mono text-xs tracking-widest">
                <span className="text-white/70">
                  SCORE{" "}
                  <span className="text-[var(--accent)]">
                    {String(gameOver.score).padStart(5, "0")}
                  </span>
                </span>
                <span className="text-white/40">
                  BEST {String(gameOver.best).padStart(5, "0")}
                </span>
              </div>
              <button
                type="button"
                onClick={() => restartRef.current?.()}
                className="mt-1 self-start rounded-lg border border-[var(--accent)]/50 px-4 py-2 text-xs uppercase tracking-[0.15em] text-[var(--accent)] transition-colors hover:bg-[var(--accent)]/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Play again
              </button>
            </div>
          </div>
        )}

        {/* Hotspot detail */}
        {openDetail && (
          <div className="pointer-events-none absolute inset-0 z-[24] flex items-end justify-center px-6 pb-16 lg:items-center lg:justify-end lg:pb-0 lg:pl-16 lg:pr-32">
            <div
              className="panel-copy pointer-events-auto max-h-full w-full max-w-sm overflow-y-auto overscroll-contain rounded-2xl border border-white/10 bg-[var(--charcoal)]/90 p-6 backdrop-blur-md"
              style={{ "--accent": active.accent } as React.CSSProperties}
            >
              <div className="flex items-start justify-between gap-4">
                <p className="text-[0.68rem] uppercase tracking-[0.2em] text-[var(--accent)]">
                  {openDetail.kind}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setOpenSpot(-1)
                    activeHotspotRef.current = -1
                  }}
                  aria-label="Close"
                  className="-m-1 p-1 text-white/40 transition-colors hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <h3 className="mt-2 font-serif text-2xl font-semibold text-white">
                {openDetail.title}
              </h3>
              <p className="mt-3 text-[0.93rem] leading-relaxed text-white/65">{openDetail.body}</p>
              {openDetail.audio && (
                <AudioPlayer
                  src={openDetail.audio}
                  accent={active.accent}
                  levelsRef={audioRef}
                />
              )}
            </div>
          </div>
        )}

        {/* The note behind the artwork */}
        {active.secret && secretOpen && (
          <div className="pointer-events-none absolute inset-0 z-[26] flex items-center justify-center px-5 py-10">
            <div className="panel-copy pointer-events-auto max-h-full max-w-xl overflow-y-auto overscroll-contain rounded-2xl border border-white/10 bg-[var(--charcoal)]/94 p-6 backdrop-blur-md lg:p-9">
              <div className="flex items-start justify-between gap-6">
                <h3 className="font-serif text-2xl font-semibold text-white lg:text-3xl">
                  {active.secret.title}
                </h3>
                <button
                  type="button"
                  onClick={() => setSecretOpen(false)}
                  aria-label="Close"
                  className="-m-1 shrink-0 p-1 text-white/40 transition-colors hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-4 text-[0.97rem] leading-relaxed text-white/70">
                {active.secret.body}
              </p>
            </div>
          </div>
        )}

        {active.image?.credit && (
          <p className="pointer-events-none absolute bottom-5 right-6 z-20 text-[0.62rem] tracking-wide text-white/20">
            {active.image.credit}
          </p>
        )}

        {/* Wayfinding. Everything a visitor needs to know where they are and
            where else they can go, visible at all times. */}
        <nav
          aria-label="Sections"
          className="absolute right-4 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-1 lg:right-10"
        >
          {PANELS.map((p, i) => {
            const on = i === panel
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => goTo(i)}
                aria-current={on ? "true" : "false"}
                className="group flex items-center justify-end gap-3 py-1.5 outline-none"
              >
                <span
                  className={`hidden text-[0.7rem] tracking-wide transition-colors lg:block ${
                    on ? "text-white/90" : "text-white/30 group-hover:text-white/60"
                  }`}
                >
                  {p.key}
                </span>
                <span
                  className="block h-[2px] rounded-full transition-all duration-500"
                  style={{
                    width: on ? 30 : 14,
                    background: on ? p.accent : "rgba(255,255,255,0.2)",
                  }}
                />
              </button>
            )
          })}
        </nav>

        {/* Scroll cue */}
        <div
          className="pointer-events-none absolute bottom-7 left-1/2 z-20 -translate-x-1/2 transition-opacity duration-500"
          style={{ opacity: started ? 0 : 1 }}
        >
          <p className="flex items-center gap-2.5 text-xs text-white/40">
            <span className="scroll-dot h-1.5 w-1.5 rounded-full bg-[var(--goldenrod)]" />
            Scroll to look around
          </p>
        </div>
      </div>
    </div>
  )
}
