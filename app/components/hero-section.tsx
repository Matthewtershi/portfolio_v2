"use client"

import { Mail, Linkedin, Github, Instagram } from "lucide-react"
import { useEffect, useRef } from "react"
import { gsap } from "gsap"

interface HeroSectionProps {
  shouldAnimate?: boolean
}

export default function HeroSection({ shouldAnimate = false }: HeroSectionProps) {
  const heroRef = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const socialRef = useRef<HTMLDivElement>(null)
  const geometryRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Always set initial states to prevent flash - now matching CSS classes
      gsap.set([nameRef.current, contentRef.current, socialRef.current], {
        opacity: 0,
        x: -48, // -translate-x-12 = -48px
      })

      gsap.set(".hero-geometry", {
        opacity: 0,
        scale: 0.8,
        rotation: 0,
      })

      // Only animate if shouldAnimate is true
      if (shouldAnimate) {
        const tl = gsap.timeline({ delay: 0.3 })

        // Animate sidebar line first
        tl.to(".hero-sidebar-line", {
          opacity: 1,
          height: "10rem", // h-40 = 10rem
          duration: 0.6,
          ease: "power2.out",
        })

        tl.to(".hero-geometry", {
          opacity: 1,
          scale: 1,
          rotation: (index) => index * 15,
          duration: 0.8,
          stagger: 0.08,
          ease: "back.out(1.7)",
        }, "-=0.3")

        tl.to(
          nameRef.current,
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: "power3.out",
          },
          "-=0.5",
        )

        tl.to(
          contentRef.current,
          {
            opacity: 1,
            x: 0,
            duration: 0.6,
            ease: "power2.out",
          },
          "-=0.4",
        )

        tl.to(
          socialRef.current,
          {
            opacity: 1,
            x: 0,
            duration: 0.5,
            ease: "power2.out",
          },
          "-=0.3",
        )

        gsap.to(".hero-float", {
          y: -10,
          duration: 2,
          ease: "power1.inOut",
          yoyo: true,
          repeat: -1,
          stagger: 0.2,
        })

        gsap.to(".hero-rotate", {
          rotation: "+=360",
          duration: 20,
          ease: "none",
          repeat: -1,
        })
      }
    }, heroRef)

    return () => ctx.revert()
  }, [shouldAnimate])

  return (
    <div ref={heroRef} className="relative h-full bg-[var(--portfolio-beige)] overflow-hidden">
      <div ref={geometryRef} className="absolute inset-0 pointer-events-none">
        <div className="hero-geometry hero-float absolute top-16 right-32 w-40 h-40 rounded-full bg-[var(--portfolio-gold)] opacity-8" />
        <div className="hero-geometry hero-float absolute top-32 right-20 w-24 h-24 rounded-full bg-[var(--portfolio-gold)] opacity-12" />
        <div className="hero-geometry hero-float absolute bottom-32 right-24 w-32 h-32 rounded-full bg-[var(--portfolio-brown)] opacity-6" />
        <div className="hero-geometry hero-float absolute top-1/3 right-1/4 w-20 h-20 rounded-full bg-[var(--portfolio-gold)] opacity-10" />
        <div className="hero-geometry hero-float absolute bottom-1/4 right-1/3 w-16 h-16 rounded-full bg-[var(--portfolio-brown)] opacity-8" />

        <div className="hero-geometry hero-rotate absolute top-1/4 right-1/3 w-24 h-24 bg-[var(--portfolio-gold)] opacity-12" />
        <div className="hero-geometry hero-rotate absolute top-1/2 right-1/5 w-18 h-18 bg-[var(--portfolio-brown)] opacity-10" />
        <div className="hero-geometry hero-rotate absolute bottom-1/3 right-2/5 w-14 h-14 bg-[var(--portfolio-gold)] opacity-8" />
        <div className="hero-geometry hero-rotate absolute top-3/4 right-1/2 w-20 h-20 bg-[var(--portfolio-brown)] opacity-6" />

        <div className="hero-geometry hero-float absolute top-1/5 right-1/6 w-6 h-6 bg-[var(--portfolio-gold)] opacity-15 rotate-45" />
        <div className="hero-geometry hero-float absolute bottom-1/5 right-1/4 w-8 h-8 bg-[var(--portfolio-brown)] opacity-12 rotate-12" />
      </div>

      <div className="relative h-full flex items-center">
        <div className="hero-sidebar-line absolute left-28 top-1/2 -translate-y-1/2 w-1 h-40 bg-gradient-to-b from-[var(--portfolio-gold)] via-amber-500 to-orange-400 shadow-lg transform-gpu" />

        <div className="pl-40 max-w-4xl">
          <div ref={nameRef} className="hero-section-content mb-8 relative opacity-0 -translate-x-12">
            <h1 className="font-serif font-bold leading-none">
              <div
                className="text-8xl lg:text-9xl bg-gradient-to-r from-[var(--portfolio-brown)] via-amber-700 to-[var(--portfolio-gold)] bg-clip-text text-transparent transform -rotate-1 origin-left mb-2 hover:scale-105 transition-transform duration-300 cursor-default"
                style={{ textShadow: "0 4px 8px rgba(139, 91, 41, 0.1)" }}
              >
                MATTHEW
              </div>
              <div
                className="text-8xl lg:text-9xl bg-gradient-to-r from-[var(--portfolio-brown)] via-amber-700 to-[var(--portfolio-gold)] bg-clip-text text-transparent transform rotate-1 -mt-6 hover:scale-105 transition-transform duration-300 cursor-default"
                style={{ textShadow: "0 4px 8px rgba(139, 91, 41, 0.1)" }}
              >
                SHI
              </div>
            </h1>
          </div>

          <div ref={contentRef} className="hero-section-content opacity-0 -translate-x-12">
            <div className="mb-8">
              <p className="text-2xl text-[var(--portfolio-brown)] font-semibold tracking-wide">
                Software Engineer & ECE Student @ Texas A&M
              </p>
            </div>

            <div className="mb-10 max-w-2xl">
              <p className="text-lg text-gray-700 leading-relaxed font-medium">
                Hey I&apos;m Matthew, a sophomore at Texas A&M interested in software, machine learning, and energy. Feel free to contact me at matthewtershi@tamu.edu!
              </p>
            </div>
          </div>

          <div ref={socialRef} className="hero-section-content flex space-x-5 opacity-0 -translate-x-12">
            {[
              { icon: Mail, href: "mailto:matthewtershi@gmail.com", label: "Email", color: "bg-amber-500/80 hover:bg-amber-500" },
              { icon: Linkedin, href: "https://www.linkedin.com/in/matthew-shi-a2376b239/", label: "LinkedIn", color: "bg-blue-600/80 hover:bg-blue-600" },
              {
                icon: Github,
                href: "https://github.com/Matthewtershi",
                label: "GitHub",
                color: "bg-gray-700/80 hover:bg-gray-700",
              },
              {
                icon: Instagram,
                href: "https://www.instagram.com/matthew.sih8/",
                label: "Instagram",
                color: "bg-gradient-to-br from-pink-500/80 to-purple-500/80 hover:from-pink-500 hover:to-purple-500",
              },
            ].map(({ icon: Icon, href, label, color }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={`social-icon w-12 h-12 rounded-full ${color} flex items-center justify-center text-white transition-all duration-300 group shadow-lg hover:shadow-xl`}
                aria-label={label}
                onMouseEnter={(e) => {
                  gsap.to(e.currentTarget, {
                    scale: 1.15,
                    rotation: 5,
                    duration: 0.3,
                    ease: "back.out(1.7)",
                  })
                }}
                onMouseLeave={(e) => {
                  gsap.to(e.currentTarget, {
                    scale: 1,
                    rotation: 0,
                    duration: 0.3,
                    ease: "back.out(1.7)",
                  })
                }}
              >
                <Icon size={20} className="group-hover:scale-110 transition-transform duration-300" />
              </a>
            ))}
          </div>

          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-[var(--portfolio-gold)] to-transparent opacity-50" />
        </div>
      </div>
    </div>
  )
}
