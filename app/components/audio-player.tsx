"use client"

import { useCallback, useEffect, useRef, useState, type MutableRefObject } from "react"
import { ArrowUpRight, Pause, Play, Volume1, Volume2, VolumeX } from "lucide-react"

/** What the visualiser reads. Written every frame, never through React state. */
export interface AudioLevels {
  playing: boolean
  level: number
  bass: number
  mid: number
  treble: number
  /** Decays from 1 on each detected onset. */
  beat: number
}

export const emptyLevels = (): AudioLevels => ({
  playing: false,
  level: 0,
  bass: 0,
  mid: 0,
  treble: 0,
  beat: 0,
})

interface TrackMeta {
  name: string
  artist: string
  album: string | null
  art: string | null
  url: string
  source: string
}

interface AudioPlayerProps {
  src: string
  accent: string
  levelsRef: MutableRefObject<AudioLevels>
}

const fmt = (s: number) => {
  if (!Number.isFinite(s)) return "0:00"
  const m = Math.floor(s / 60)
  return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`
}

export default function AudioPlayer({ src, accent, levelsRef }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const ctxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const binsRef = useRef<Uint8Array<ArrayBuffer> | null>(null)
  /* Rolling mean of recent bass energy. An onset is a frame that jumps well
     above its own recent history, which tracks a track that gets louder far
     better than a fixed threshold would. */
  const historyRef = useRef<number[]>([])
  const seekingRef = useRef(false)

  const [meta, setMeta] = useState<TrackMeta | null>(null)
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [muted, setMuted] = useState(false)

  useEffect(() => {
    let alive = true
    fetch("/api/spotify/track")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (alive && j) setMeta(j)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  /* The graph is built on first play, not on mount: browsers create audio
     contexts in a suspended state until a user gesture, and a MediaElement
     source can only ever be attached to its element once. */
  const ensureGraph = useCallback(() => {
    const el = audioRef.current
    if (!el || ctxRef.current) return
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return
    const ctx = new Ctor()
    const source = ctx.createMediaElementSource(el)
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 1024
    analyser.smoothingTimeConstant = 0.72
    source.connect(analyser)
    analyser.connect(ctx.destination)
    ctxRef.current = ctx
    analyserRef.current = analyser
    binsRef.current = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount))
  }, [])

  useEffect(() => {
    let frame = 0
    const tick = () => {
      const a = analyserRef.current
      const bins = binsRef.current
      const el = audioRef.current
      const out = levelsRef.current
      if (a && bins && el && !el.paused) {
        a.getByteFrequencyData(bins)
        const n = bins.length
        let bass = 0
        let mid = 0
        let treble = 0
        // ~0-250Hz, ~250-2kHz, above, for a 44.1kHz context at fftSize 1024.
        const bEnd = Math.floor(n * 0.06)
        const mEnd = Math.floor(n * 0.32)
        for (let i = 0; i < bEnd; i++) bass += bins[i]
        for (let i = bEnd; i < mEnd; i++) mid += bins[i]
        for (let i = mEnd; i < n; i++) treble += bins[i]
        bass /= bEnd * 255
        mid /= (mEnd - bEnd) * 255
        treble /= (n - mEnd) * 255

        const hist = historyRef.current
        hist.push(bass)
        if (hist.length > 43) hist.shift()
        let mean = 0
        for (let i = 0; i < hist.length; i++) mean += hist[i]
        mean /= hist.length || 1

        out.beat = Math.max(0, out.beat - 0.055)
        if (hist.length > 12 && bass > mean * 1.32 && bass > 0.12 && out.beat < 0.45) {
          out.beat = 1
        }
        out.playing = true
        out.bass = bass
        out.mid = mid
        out.treble = treble
        out.level = bass * 0.6 + mid * 0.3 + treble * 0.1
      } else if (out.playing || out.level > 0.001) {
        // Ease back to rest rather than dropping the visual on pause.
        out.playing = false
        out.level *= 0.9
        out.bass *= 0.9
        out.mid *= 0.9
        out.treble *= 0.9
        out.beat = Math.max(0, out.beat - 0.06)
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [levelsRef])

  useEffect(() => {
    const el = audioRef.current
    if (el) el.volume = muted ? 0 : volume
  }, [volume, muted])

  useEffect(() => {
    return () => {
      ctxRef.current?.close().catch(() => {})
    }
  }, [])

  const toggle = useCallback(async () => {
    const el = audioRef.current
    if (!el) return
    ensureGraph()
    if (ctxRef.current?.state === "suspended") await ctxRef.current.resume()
    if (el.paused) {
      try {
        await el.play()
      } catch {
        // Autoplay policies can still refuse; the button stays available.
      }
    } else {
      el.pause()
    }
  }, [ensureGraph])

  const title = meta?.name ?? "Calling After Me"
  const artist = meta?.artist ?? "Wallows"
  const pct = duration > 0 ? (time / duration) * 100 : 0
  const VolIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2

  return (
    <div
      className="mt-5 w-full rounded-xl border border-white/10 bg-white/[0.03] p-3.5"
      style={{ "--accent": accent } as React.CSSProperties}
    >
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => {
          if (!seekingRef.current) setTime(e.currentTarget.currentTime)
        }}
      />

      <div className="flex items-center gap-3">
        {meta?.art ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={meta.art}
            alt=""
            className="h-12 w-12 shrink-0 rounded-md object-cover"
            style={{ filter: "grayscale(0.35) contrast(1.05)" }}
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-white/10"
            style={{ background: `${accent}1f` }}
          >
            <span className="text-[0.6rem] uppercase tracking-widest text-white/40">Wav</span>
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white/90">{title}</p>
          <p className="truncate text-xs text-white/45">{artist}</p>
        </div>

        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pause" : "Play"}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          style={{ borderColor: `${accent}80`, color: accent }}
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
        </button>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <span className="w-9 shrink-0 font-mono text-[0.65rem] tabular-nums text-white/40">
          {fmt(time)}
        </span>
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={time}
          aria-label="Seek"
          className="audio-range flex-1"
          style={{ "--pct": `${pct}%` } as React.CSSProperties}
          onPointerDown={() => (seekingRef.current = true)}
          onPointerUp={() => (seekingRef.current = false)}
          onChange={(e) => {
            const v = Number(e.target.value)
            setTime(v)
            if (audioRef.current) audioRef.current.currentTime = v
          }}
        />
        <span className="w-9 shrink-0 text-right font-mono text-[0.65rem] tabular-nums text-white/40">
          {fmt(duration)}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? "Unmute" : "Mute"}
          className="shrink-0 text-white/40 transition-colors hover:text-white/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <VolIcon className="h-4 w-4" />
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={muted ? 0 : volume}
          aria-label="Volume"
          className="audio-range w-28"
          style={{ "--pct": `${(muted ? 0 : volume) * 100}%` } as React.CSSProperties}
          onChange={(e) => {
            setVolume(Number(e.target.value))
            setMuted(false)
          }}
        />
        <a
          href={meta?.url ?? "https://open.spotify.com"}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto flex items-center gap-1 text-[0.65rem] tracking-wide text-white/35 transition-colors hover:text-[var(--accent)]"
        >
          Spotify <ArrowUpRight className="h-3 w-3" />
        </a>
      </div>
    </div>
  )
}
