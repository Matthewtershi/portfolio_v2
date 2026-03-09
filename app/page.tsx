"use client"

import { useState, useEffect } from "react"
import SmoothScroll from "./components/smooth-scroll"
import HeroSection from "./components/hero-section"
import AboutSection from "./components/about-section"
import JourneySection from "./components/journey-section"
import ContactSection from "./components/contact-section"

const DESKTOP_BREAKPOINT = 1024

export default function Portfolio() {
  const [isMobile, setIsMobile] = useState(false)
  const [isAboutReady, setIsAboutReady] = useState(false)
  const [isJourneyReady, setIsJourneyReady] = useState(false)
  const [isContactReady, setIsContactReady] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < DESKTOP_BREAKPOINT)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const vh = window.innerHeight
      if (scrollY >= vh * 0.3 && !isAboutReady) setIsAboutReady(true)
      if (scrollY >= vh * 1.5 && !isJourneyReady) setIsJourneyReady(true)
      if (scrollY >= vh * 10 && !isContactReady) setIsContactReady(true)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [isAboutReady, isJourneyReady, isContactReady])

  return (
    <SmoothScroll disabled={isMobile}>
      <main className="bg-[var(--charcoal)]">
        <div id="section-0" className="min-h-screen">
          <HeroSection shouldAnimate isMobile={isMobile} />
          </div>
          <div id="section-1" className="min-h-screen">
            <AboutSection shouldAnimate={isAboutReady} isMobile={isMobile} />
          </div>
          <div id="journey-anchor">
            <JourneySection shouldAnimate={isJourneyReady} isMobile={isMobile} />
          </div>
          <div id="contact" className="min-h-screen">
            <ContactSection shouldAnimate={isContactReady} />
          </div>
      </main>
    </SmoothScroll>
  )
}
