"use client"

import { useRef, useEffect } from "react"
import { ChevronRight } from "lucide-react"
import { experiences } from "@/app/data/journey-data"

interface JourneyOverlayProps {
  onExit: () => void
  isAtEnd: boolean
  onScrollStateChange: (isAtEnd: boolean) => void
}

export default function JourneyOverlay({ onExit, isAtEnd, onScrollStateChange }: JourneyOverlayProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const checkScroll = () => {
      const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 10
      onScrollStateChange(atEnd)
    }

    el.addEventListener("scroll", checkScroll)
    checkScroll()
    return () => el.removeEventListener("scroll", checkScroll)
  }, [onScrollStateChange])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY > 0 && isAtEnd) {
        e.preventDefault()
        onExit()
      }
    }

    el.addEventListener("wheel", handleWheel, { passive: false })
    return () => el.removeEventListener("wheel", handleWheel)
  }, [isAtEnd, onExit])

  return (
    <div className="fixed inset-0 z-50 bg-[var(--charcoal)] overflow-hidden">
      <div
        ref={scrollRef}
        className="h-full w-full flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {experiences.map((exp, index) => {
          const Icon = exp.icon
          return (
            <div
              key={index}
              className="min-w-[100vw] h-full flex-shrink-0 snap-center flex items-center justify-center p-12"
            >
              <div className="w-full max-w-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="px-4 py-2 bg-[var(--goldenrod)]/20 text-[var(--goldenrod)] text-sm font-bold rounded-full border border-[var(--goldenrod)]/40">
                    {exp.year}
                  </div>
                  <div className="px-3 py-1 bg-white/5 text-gray-400 text-xs font-medium rounded-full uppercase tracking-wide">
                    {exp.category}
                  </div>
                </div>
                <div className="w-16 h-16 rounded-full bg-[var(--goldenrod)]/10 flex items-center justify-center mb-6 border border-[var(--goldenrod)]/20">
                  <Icon className="w-8 h-8 text-[var(--goldenrod)]" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-white mb-4">
                  {exp.title}
                </h3>
                <p className="text-gray-300 leading-relaxed mb-6 max-w-xl">
                  {exp.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {exp.tools.map((tool, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-white/5 text-gray-400 text-sm rounded-full border border-white/10"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[var(--goldenrod)]/80 text-sm">
        <span>Scroll right</span>
        <ChevronRight className="w-5 h-5" />
      </div>
      {isAtEnd && (
        <button
          onClick={onExit}
          className="absolute bottom-8 right-12 px-6 py-3 bg-[var(--goldenrod)] text-[var(--charcoal)] font-semibold rounded-lg hover:bg-[var(--goldenrod)]/90 transition-colors"
        >
          Continue to Contact
        </button>
      )}
    </div>
  )
}
