"use client"

import { Mail, Linkedin, Github, Instagram, ChevronDown, ExternalLink } from "lucide-react"
import { MagneticButton } from "@/app/components/ui/magnetic-button"
import { useEffect, useRef } from "react"
import { gsap } from "gsap"

interface HeroSectionProps {
  shouldAnimate?: boolean
  isMobile?: boolean
}

const CUBE_WORDS = ["Machine learning", "Optimization", "Anomaly detection"]

export default function HeroSection({ shouldAnimate = false, isMobile = false }: HeroSectionProps) {
  const heroRef = useRef<HTMLDivElement>(null)
  const taglineRef = useRef<HTMLParagraphElement>(null)
  const nameRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLDivElement>(null)
  const cubeRef = useRef<HTMLDivElement>(null)
  const cubeRotatorRef = useRef<HTMLDivElement>(null)
  const expandedRef = useRef<HTMLSpanElement>(null)
  const ctasRef = useRef<HTMLDivElement>(null)
  const emailRef = useRef<HTMLAnchorElement>(null)
  const socialsRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    if (!shouldAnimate || !heroRef.current) return

    const ctx = gsap.context(() => {
      gsap.set([taglineRef.current, subtitleRef.current, ctasRef.current, emailRef.current, socialsRef.current, scrollRef.current], {
        opacity: 0,
        x: -16,
      })
      gsap.set(nameRef.current, { opacity: 0, y: 24, scale: 0.96 })
      gsap.set(cubeRef.current, { opacity: 0 })
      gsap.set(expandedRef.current, { opacity: 0, visibility: "hidden" })

      const tl = gsap.timeline({ delay: 0.05 })

      tl.to(nameRef.current, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: "power3.out",
      })

      if (isMobile) {
        tl.to(subtitleRef.current, { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" }, "-=0.2")
          } else {
        tl.add(() => {
          gsap.set(subtitleRef.current, { opacity: 1, x: 0 })
          const cubeTl = gsap.timeline({
            delay: 0.6,
            onComplete: () => {
              gsap.to(cubeRef.current, { opacity: 0, duration: 0.2 })
              gsap.set(expandedRef.current, { visibility: "visible" })
              gsap.fromTo(
                expandedRef.current,
                { opacity: 0, y: 8 },
                { opacity: 1, y: 0, duration: 0.6, delay: 0.2, ease: "power2.out" }
              )
            },
          })
          gsap.fromTo(cubeRef.current, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "power2.out" })
          cubeTl.to(cubeRotatorRef.current, { rotateY: -120, duration: 1.4, ease: "power2.inOut" })
          cubeTl.to(cubeRotatorRef.current, { rotateY: -240, duration: 1.4, ease: "power2.inOut" })
        }, "-=0.2")
      }

      tl.to(taglineRef.current, { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" }, isMobile ? "+=0.3" : "+=4.2")
      tl.to(ctasRef.current, { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" }, "-=0.3")
      tl.to(emailRef.current, { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" }, "-=0.3")
      tl.to(socialsRef.current, { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: "power2.out" }, "-=0.2")
      tl.to(scrollRef.current, { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" }, "-=0.2")
    }, heroRef)

    return () => ctx.revert()
  }, [shouldAnimate, isMobile])

  return (
    <div ref={heroRef} className={`relative min-h-screen bg-[var(--charcoal)] flex items-center justify-center ${isMobile ? "px-4 py-16" : "px-8"}`}>
      <div className={`w-full max-w-4xl ${isMobile ? "text-center" : ""}`}>
        <div className="mb-8">
          <p
            ref={taglineRef}
            className="text-[10px] uppercase tracking-[0.3em] text-[var(--goldenrod)]/80 mb-6 opacity-0"
          >
            Building software that matters
          </p>
          <h1
            ref={nameRef}
            className="font-serif font-bold leading-[0.95] text-white tracking-tighter"
            style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}
          >
            Hi, I&apos;m Matthew Shi
          </h1>
        </div>

        <div ref={subtitleRef} className={`space-y-8 opacity-0 ${isMobile ? "flex flex-col items-center" : ""}`}>
          {isMobile ? (
            <p className="text-sm tracking-widest text-gray-400 max-w-[50vw]">
              Sophomore at Texas A&M · ML, Optimization, & Anomaly detection
            </p>
          ) : (
            <div className="flex items-center gap-1 flex-nowrap whitespace-nowrap">
              <span className="text-sm tracking-widest text-gray-400 leading-[1.5] shrink-0">Sophomore at Texas A&M · </span>
              <span className="relative inline-flex items-center text-sm tracking-widest text-gray-400 min-w-[22ch] h-[1.5em] leading-[1.5] overflow-hidden shrink-0" style={{ perspective: "600px" }}>
                <span
                  ref={cubeRef}
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ transformStyle: "preserve-3d", perspective: "600px" }}
                >
                  <span
                    ref={cubeRotatorRef}
                    className="relative w-full h-full flex items-center justify-center"
                    style={{
                      transformStyle: "preserve-3d",
                      transformOrigin: "center center",
                    }}
                  >
                    {CUBE_WORDS.map((word, i) => (
                      <span
                        key={word}
                        className="absolute text-sm tracking-widest text-gray-400 whitespace-nowrap"
                        style={{
                          transform: `translate(-50%, -50%) rotateY(${i * 120}deg) translateZ(6ch)`,
                          backfaceVisibility: "hidden",
                          left: "50%",
                          top: "50%",
                        }}
                      >
                        {word}
                      </span>
                    ))}
                  </span>
                </span>
                <span
                  ref={expandedRef}
                  className="absolute inset-0 flex items-center text-sm tracking-widest text-gray-400 leading-[1.5] whitespace-nowrap"
                  style={{ visibility: "hidden" }}
                >
                  Software, ML, & Energy
                </span>
              </span>
            </div>
          )}

          <div ref={ctasRef} className="flex flex-wrap gap-4 opacity-0">
            <a
              href="#journey-anchor"
              onClick={(e) => {
                e.preventDefault()
                document.getElementById("journey-anchor")?.scrollIntoView({ behavior: "smooth" })
              }}
              className="px-6 py-3 bg-[var(--goldenrod)] text-[var(--charcoal)] font-semibold text-sm tracking-widest uppercase rounded-sm hover:opacity-90 transition-opacity"
            >
              View Journey
            </a>
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault()
                document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })
              }}
              className="px-6 py-3 border border-white/20 text-white/90 font-medium text-sm tracking-widest uppercase rounded-sm hover:border-[var(--goldenrod)]/50 hover:text-[var(--goldenrod)] transition-colors"
            >
              Get In Touch
            </a>
          </div>

          <a
            ref={emailRef}
            href="mailto:matthewtershi@tamu.edu"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[var(--goldenrod)] transition-colors tracking-wide opacity-0"
          >
            matthewtershi@tamu.edu
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <div ref={socialsRef} className={`flex gap-4 pt-4 opacity-0 ${isMobile ? "justify-center" : ""}`}>
            {[
              { icon: Mail, href: "mailto:matthewtershi@gmail.com", label: "Email" },
              { icon: Linkedin, href: "https://www.linkedin.com/in/matthew-shi-a2376b239/", label: "LinkedIn" },
              { icon: Github, href: "https://github.com/Matthewtershi", label: "GitHub" },
              { icon: Instagram, href: "https://www.instagram.com/matthew.sih8/", label: "Instagram" },
            ].map(({ icon: Icon, href, label }) => (
              <MagneticButton key={label} maxPull={10}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-gray-400 hover:text-[var(--goldenrod)] hover:border-[var(--goldenrod)]/30 transition-colors"
                  aria-label={label}
                >
                  <Icon size={18} />
                </a>
              </MagneticButton>
            ))}
          </div>
        </div>

        <a
          ref={scrollRef}
          href={isMobile ? "#section-1" : "#journey-anchor"}
          onClick={(e) => {
            e.preventDefault()
            const target = isMobile ? "section-1" : "journey-anchor"
            document.getElementById(target)?.scrollIntoView({ behavior: "smooth" })
          }}
          aria-label="Scroll"
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-[10px] uppercase tracking-[0.3em] text-white/40 hover:text-[var(--goldenrod)]/60 transition-colors opacity-0"
        >
          Scroll
          <ChevronDown className="w-5 h-5" />
        </a>
      </div>
    </div>
  )
}
