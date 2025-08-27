"use client"

import { useState, useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import dynamic from "next/dynamic"
import HeroSection from "@/app/components/hero-section"
import AboutSection from "@/app/components/about-section"
import JourneySection from "@/app/components/journey-section"
import ContactSection from "@/app/components/contact-section"

// Dynamically import loading overlay with no SSR to prevent hydration issues
const LoadingOverlay = dynamic(() => import("./components/loading-overlay"), {
  ssr: false,
  loading: () => null
})

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export default function Portfolio() {
  const [currentSection, setCurrentSection] = useState(0)
  const [isHeroReady, setIsHeroReady] = useState(false)
  const [isAboutReady, setIsAboutReady] = useState(false)
  const [isJourneyReady, setIsJourneyReady] = useState(false)
  const [isContactReady, setIsContactReady] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const isScrollingRef = useRef(false)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const sections = ["Home", "About","Journey", "Contact"]

  const handleLoadingComplete = () => {
    // Small delay to ensure smooth transition
    setTimeout(() => {
      setIsHeroReady(true)
    }, 100)
  }

  // Function to trigger section animations based on scroll position
  const triggerSectionAnimation = (sectionIndex: number) => {
    switch (sectionIndex) {
      case 0: // Hero
        if (!isHeroReady) setIsHeroReady(true)
        break
      case 1: // About
        if (!isAboutReady) setIsAboutReady(true)
        break
      case 2: // Journey
        if (!isJourneyReady) setIsJourneyReady(true)
        break
      case 3: // Contact
        if (!isContactReady) setIsContactReady(true)
        break
    }
  }

  // Enhanced scroll detection for triggering animations
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScrollForAnimations = () => {
      const scrollLeft = container.scrollLeft
      const sectionWidth = container.clientWidth
      
      // Check which sections should be animated based on scroll position
      const currentScrollPosition = scrollLeft + sectionWidth * 0.3 // Trigger when 30% into section
      
      // Hero section (always ready after loading)
      if (scrollLeft < sectionWidth * 0.5 && !isHeroReady) {
        setIsHeroReady(true)
      }
      
      // About section
      if (scrollLeft >= sectionWidth * 0.5 && scrollLeft < sectionWidth * 1.5 && !isAboutReady) {
        setIsAboutReady(true)
      }
      
      // Journey section
      if (scrollLeft >= sectionWidth * 1.5 && scrollLeft < sectionWidth * 2.5 && !isJourneyReady) {
        setIsJourneyReady(true)
      }
      
      // Contact section
      if (scrollLeft >= sectionWidth * 2.5 && !isContactReady) {
        setIsContactReady(true)
      }
    }

    container.addEventListener("scroll", handleScrollForAnimations)
    return () => container.removeEventListener("scroll", handleScrollForAnimations)
  }, [isHeroReady, isAboutReady, isJourneyReady, isContactReady])

  const applyMagneticScroll = () => {
    if (containerRef.current && !isScrollingRef.current) {
      const container = containerRef.current
      const scrollLeft = container.scrollLeft
      const sectionWidth = container.clientWidth
      const currentSectionIndex = scrollLeft / sectionWidth
      const nearestSectionIndex = Math.round(currentSectionIndex)

      const isMainSectionBoundary = nearestSectionIndex === 0 || // Hero
                                   nearestSectionIndex === 1 || // About  
                                   nearestSectionIndex === 2 || // Journey start
                                   nearestSectionIndex === 3    // Contact

      if (isMainSectionBoundary) {
        const distanceFromSection = Math.abs(currentSectionIndex - nearestSectionIndex)
        const threshold = 0.25 // Reduced from 0.35 to make it less aggressive

        if (distanceFromSection < threshold && distanceFromSection > 0.05) {
          let targetScrollLeft: number

          if (nearestSectionIndex === 3) {
            const totalWidth = container.scrollWidth
            targetScrollLeft = totalWidth - sectionWidth
          } else {
            targetScrollLeft = nearestSectionIndex * sectionWidth
          }

          gsap.to(container, {
            scrollLeft: targetScrollLeft,
            duration: 0.6,
            ease: "power2.out",
          })
        }
      }
    }
  }

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (containerRef.current) {
        e.preventDefault()

        const container = containerRef.current
        const sectionWidth = container.clientWidth
        
        const currentScrollLeft = container.scrollLeft
        const currentSection = Math.round(currentScrollLeft / sectionWidth)
        
        const baseScrollAmount = e.deltaY * 4
        let scrollAmount = baseScrollAmount
        
        const distanceFromSection = Math.abs((currentScrollLeft % sectionWidth) - (sectionWidth / 2))
        
        if (distanceFromSection < sectionWidth * 0.4) {
        } else if (distanceFromSection > sectionWidth * 0.3) {
          scrollAmount *= 1.8 
        }
        
        const targetScrollLeft = currentScrollLeft + scrollAmount

        gsap.to(container, {
          scrollLeft: targetScrollLeft,
          duration: 0.5,
          ease: "power2.out",
          overwrite: "auto",
        })

        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current)
        }

        scrollTimeoutRef.current = setTimeout(() => {
          applyMagneticScroll()
        }, 250)
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false })
      return () => container.removeEventListener("wheel", handleWheel)
    }
  }, [])

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout | null = null
    
    const handleScroll = () => {
      if (containerRef.current && !isScrollingRef.current) {
        if (scrollTimeout) {
          clearTimeout(scrollTimeout)
        }
        
         scrollTimeout = setTimeout(() => {
           const container = containerRef.current
           if (!container) return
           
           const scrollLeft = container.scrollLeft
           const sectionWidth = container.clientWidth
           const totalWidth = container.scrollWidth
           
           let newSection = Math.floor(scrollLeft / sectionWidth)
           
           if (scrollLeft >= totalWidth - sectionWidth) {
             newSection = 3 // Contact section
           } else {
             const remainder = scrollLeft % sectionWidth
             if (remainder > sectionWidth * 0.5) {
               newSection = Math.min(newSection + 1, sections.length - 1)
             }
           }
           
           newSection = Math.max(0, Math.min(newSection, sections.length - 1))
           
           if (newSection !== currentSection && newSection >= 0 && newSection < sections.length) {
             setCurrentSection(newSection)
             // Trigger animation for the new section
             triggerSectionAnimation(newSection)
           }
         }, 50)
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener("scroll", handleScroll)
      return () => {
        container.removeEventListener("scroll", handleScroll)
        if (scrollTimeout) {
          clearTimeout(scrollTimeout)
        }
      }
    }
  }, [currentSection, sections.length])

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Only animate navigation when hero section is ready
      if (isHeroReady) {
        // Animate navigation elements with entrance effects
        gsap.fromTo(".nav-item", { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.4, stagger: 0.08, delay: 0.3, ease: "power2.out" })
        gsap.fromTo(".bottom-nav", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, delay: 0.5, ease: "power2.out" })
        gsap.fromTo(".copyright", { opacity: 0 }, { opacity: 1, duration: 0.4, delay: 0.7, ease: "power2.out" })
      }
    })

    return () => ctx.revert()
  }, [isHeroReady])

  const navigateToSection = (index: number) => {
    if (containerRef.current) {
      isScrollingRef.current = true
      const container = containerRef.current
      const sectionWidth = container.clientWidth
      
      let targetScrollLeft: number
      
      if (index === sections.length - 1) {
        const totalWidth = container.scrollWidth
        const maxScrollLeft = totalWidth - sectionWidth
        targetScrollLeft = maxScrollLeft
      } else {
        targetScrollLeft = index * sectionWidth
      }

      setCurrentSection(index)

      gsap.to(container, {
        scrollLeft: targetScrollLeft,
        duration: 1.2,
        ease: "power2.inOut",
        onComplete: () => {
          isScrollingRef.current = false
        },
      })
    }
  }

  useEffect(() => {
    gsap.to(".nav-progress", {
      height: `${((currentSection + 1) / sections.length) * 100}%`,
      duration: 1.2,
      ease: "power3.out",
    })

    gsap.to(".nav-dot", {
      scale: 1,
      duration: 0.4,
      ease: "power2.out",
    })

    gsap.to(`.nav-dot-${currentSection}`, {
      scale: 1.4,
      duration: 0.5,
      ease: "back.out(1.7)",
    })

    gsap.to(".bottom-dot", {
      scale: 1,
      duration: 0.4,
      ease: "power2.out",
    })

    gsap.to(`.bottom-dot-${currentSection}`, {
      scale: 1.4,
      duration: 0.5,
      ease: "back.out(1.7)",
    })
  }, [currentSection])

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [sections.length])

  return (
    <>
      <LoadingOverlay onLoadingComplete={handleLoadingComplete} />
      <div className="relative h-screen overflow-hidden">
              <nav className="fixed left-6 top-1/2 -translate-y-1/2 z-50 flex flex-col space-y-6 opacity-0 -translate-x-5">
        {sections.map((section, index) => (
          <button
            key={section}
            onClick={() => navigateToSection(index)}
            className={`nav-item group relative flex items-start transition-all duration-300 ${
              currentSection === index
                ? "text-[var(--portfolio-gold)]"
                : "text-gray-400 hover:text-[var(--portfolio-brown)]"
            }`}
          >
            <div
              className={`nav-dot nav-dot-${index} w-3 h-3 rounded-full border-2 transition-all duration-300 flex-shrink-0 mt-1 ${
                currentSection === index
                  ? "bg-[var(--portfolio-gold)] border-[var(--portfolio-gold)]"
                  : "border-gray-400 group-hover:border-[var(--portfolio-brown)]"
              }`}
            />
            <span
              className={`ml-4 text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                currentSection === index
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
              }`}
            >
              {section}
            </span>
          </button>
        ))}
      </nav>

      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center">
        <div className="w-1 h-24 bg-gray-300 relative">
          <div className="nav-progress w-full bg-[var(--portfolio-gold)] transition-all duration-1000 ease-out h-0" />
        </div>
      </div>

      <div className="section-indicator fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 opacity-0 pointer-events-none">
        <div className="bg-[var(--portfolio-gold)] text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium">
          Section Locked
        </div>
      </div>

        <nav className="bottom-nav fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex space-x-4 opacity-0 translate-y-5">
          {sections.map((_, index) => (
            <button
              key={index}
              onClick={() => navigateToSection(index)}
              className={`bottom-dot bottom-dot-${index} w-3 h-3 rounded-full transition-all duration-300 ${
                currentSection === index
                  ? "bg-gradient-to-r from-[var(--portfolio-gold)] to-amber-500"
                  : "bg-gray-400 hover:bg-[var(--portfolio-brown)]"
              }`}
            />
          ))}
        </nav>

        <div className="copyright fixed bottom-4 right-6 z-50 text-sm text-gray-500 opacity-0">© 2025 Matthew Shi</div>

      <div
        ref={containerRef}
        className="flex h-full overflow-x-auto overflow-y-hidden"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {/* Hero Section */}
        <div className="min-w-full h-full flex-shrink-0">
          <HeroSection shouldAnimate={isHeroReady} />
        </div>

        {/* About Section */}
        <div className="min-w-full h-full flex-shrink-0">
          <AboutSection shouldAnimate={isAboutReady} />
        </div>

        {/* Journey Section */}
        <div className="min-w-full h-full flex-shrink-0">
          <JourneySection shouldAnimate={isJourneyReady} />
        </div>

        {/* Contact Section */}
        <div className="min-w-full h-full flex-shrink-0">
          <ContactSection shouldAnimate={isContactReady} />
        </div>
      </div>
    </div>
    </>
  )
}
