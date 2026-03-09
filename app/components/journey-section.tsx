"use client"

import { useEffect, useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { experiences } from "@/app/data/journey-data"

const PANEL_COUNT = experiences.length

interface JourneySectionProps {
  shouldAnimate?: boolean
  isMobile?: boolean
}

export default function JourneySection({ shouldAnimate = false, isMobile = false }: JourneySectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const horizontalRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  })

  const horizontalScroll = useTransform(
    scrollYProgress,
    [0, 0.92, 1],
    [0, (PANEL_COUNT - 1) * 100, (PANEL_COUNT - 1) * 100]
  )

  useEffect(() => {
    if (isMobile || !horizontalRef.current) return

    const unsubscribe = horizontalScroll.on("change", (v) => {
      if (horizontalRef.current) {
        const scrollWidth = horizontalRef.current.scrollWidth - horizontalRef.current.clientWidth
        horizontalRef.current.scrollLeft = (v / 100) * scrollWidth
      }
    })

    return () => unsubscribe()
  }, [horizontalScroll, isMobile])

  if (isMobile) {
    return (
      <div ref={sectionRef} className="min-h-screen py-24 px-6 bg-[var(--charcoal)]">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={shouldAnimate ? { opacity: 1, y: 0 } : {}}
          className="font-serif font-bold text-[var(--goldenrod)] mb-12 text-center"
          style={{ fontSize: "clamp(2.5rem, 8vw, 4rem)" }}
        >
          MY JOURNEY
        </motion.h2>
        <div className="space-y-8 max-w-xl mx-auto">
          {experiences.map((exp, i) => {
            const Icon = exp.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={shouldAnimate ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="glass rounded-3xl p-8 border border-white/10"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[10px] uppercase tracking-widest text-gray-500">{exp.category}</span>
                  <span className="px-3 py-1 bg-[var(--goldenrod)]/20 text-[var(--goldenrod)] text-sm font-semibold rounded-full">
                    {exp.year}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-full bg-[var(--goldenrod)]/10 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-[var(--goldenrod)]" />
                </div>
                <h3 className="font-serif font-bold text-white text-xl mb-2">{exp.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">{exp.description}</p>
                <div className="flex flex-wrap gap-2">
                  {exp.tools.map((t, j) => (
                    <span key={j} className="px-2 py-1 text-[10px] uppercase text-gray-500 border border-white/10 rounded">
                      {t}
                    </span>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    )
  }

  const VH_PER_PANEL = 140

  return (
    <div
      ref={sectionRef}
      className="relative"
      style={{ height: `${PANEL_COUNT * VH_PER_PANEL}vh` }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col py-[8vh]">
        <div
          ref={horizontalRef}
          className="horizontal-scroll-container flex-1 min-h-0 w-full flex overflow-x-auto overflow-y-hidden snap-x snap-proximity scroll-smooth"
        >
          {experiences.map((exp, i) => {
            const Icon = exp.icon
            const isTopRight = exp.position === "top"
            const bgUrl = exp.imageUrl ?? "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1920&q=80"
            return (
              <div
                key={i}
                className="min-w-[100vw] h-full flex-shrink-0 snap-center relative flex items-center justify-center px-4"
              >
                <div className="absolute top-[8vh] right-8 bottom-[8vh] left-8 rounded-3xl overflow-hidden glass border border-white/10">
                  <div
                    className="absolute inset-0 bg-cover bg-center grayscale hover:grayscale-0 transition-[filter] duration-700"
                    style={{ backgroundImage: `url(${bgUrl})` }}
                  />
                  <div className="absolute inset-0 bg-[var(--charcoal)]/60" />
                </div>
                <div
                  className={`absolute ${isTopRight ? "top-[calc(8vh+1.5rem)] right-12" : "bottom-[calc(8vh+1.5rem)] left-12"} w-full max-w-md z-10`}
                >
                  <div className="glass rounded-3xl p-8 border border-white/10 hover:shadow-[var(--glow-gold)] transition-shadow duration-500">
                    <span className="text-[10px] uppercase tracking-widest text-gray-500">{exp.category}</span>
                    <div className="flex items-center gap-3 mt-2 mb-4">
                      <span className="px-3 py-1 bg-[var(--goldenrod)]/20 text-[var(--goldenrod)] text-sm font-semibold rounded-full">
                        {exp.year}
                      </span>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-[var(--goldenrod)]/10 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-[var(--goldenrod)]" />
                    </div>
                    <h3 className="font-serif font-bold text-white text-2xl mb-2">{exp.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed mb-4">{exp.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {exp.tools.map((t, j) => (
                        <span key={j} className="px-2 py-1 text-[10px] uppercase text-gray-500 border border-white/10 rounded">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-[10px] uppercase tracking-widest text-[var(--goldenrod)]/60">
          <span>Scroll</span>
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault()
              document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })
            }}
            className="text-[8px] text-[var(--goldenrod)]/40 hover:text-[var(--goldenrod)]/70 transition-colors mt-2"
          >
            Continue to contact
          </a>
        </div>
      </div>
    </div>
  )
}
