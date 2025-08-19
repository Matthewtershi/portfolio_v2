"use client"

import { useState, useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import HeroSection from "@/app/components/hero-section"
import AboutSection from "@/app/components/about-section"
import JourneySection from "@/app/components/journey-section"
import ContactSection from "@/app/components/contact-section"

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export default function Portfolio() {
  const [currentSection, setCurrentSection] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const isScrollingRef = useRef(false)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const sections = ["Home", "About","Journey", "Contact"]

  const applyMagneticScroll = () => {
    if (containerRef.current && !isScrollingRef.current) {
      const container = containerRef.current
      const scrollLeft = container.scrollLeft
      const sectionWidth = container.clientWidth
      const currentSectionIndex = scrollLeft / sectionWidth
      const nearestSectionIndex = Math.round(currentSectionIndex)

      // Only apply magnetic effect to hero (0), about (1), and journey (2) sections
      if (nearestSectionIndex <= 2) {
        const distanceFromSection = Math.abs(currentSectionIndex - nearestSectionIndex)
        const threshold = 0.3 // 30% of viewport width

        // If within threshold, gently snap to section start
        if (distanceFromSection < threshold && distanceFromSection > 0.05) {
          const targetScrollLeft = nearestSectionIndex * sectionWidth

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
        // Prevent default vertical scrolling
        e.preventDefault()

        const container = containerRef.current
        const scrollAmount = e.deltaY * 5 // Increased multiplier for easier, longer scrolling

        // Add momentum-based scrolling
        const currentScrollLeft = container.scrollLeft
        const targetScrollLeft = currentScrollLeft + scrollAmount

        // Use GSAP for smoother scrolling animation
        gsap.to(container, {
          scrollLeft: targetScrollLeft,
          duration: 0.3,
          ease: "power2.out",
          overwrite: true,
        })

        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current)
        }

        scrollTimeoutRef.current = setTimeout(() => {
          applyMagneticScroll()
        }, 150) // Wait 150ms after scrolling stops
      }
    }

    const container = containerRef.current
    if (container) {
      // Add wheel event listener with passive: false to allow preventDefault
      container.addEventListener("wheel", handleWheel, { passive: false })
      return () => container.removeEventListener("wheel", handleWheel)
    }
  }, [])

  // Track scroll position to update navigation
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout | null = null
    
    const handleScroll = () => {
      if (containerRef.current && !isScrollingRef.current) {
        // Clear any existing timeout
        if (scrollTimeout) {
          clearTimeout(scrollTimeout)
        }
        
        // Add a small delay to prevent rapid section changes
        scrollTimeout = setTimeout(() => {
          const container = containerRef.current
          if (!container) return
          
          const scrollLeft = container.scrollLeft
          const sectionWidth = container.clientWidth
          
          // Calculate which section is most visible
          let newSection = Math.floor(scrollLeft / sectionWidth)
          
          // Check if we're closer to the next section
          const remainder = scrollLeft % sectionWidth
          if (remainder > sectionWidth * 0.5) {
            newSection = Math.min(newSection + 1, sections.length - 1)
          }
          
          // Ensure section is within bounds
          newSection = Math.max(0, Math.min(newSection, sections.length - 1))
          
          // Only update if the section actually changed and is valid
          if (newSection !== currentSection && newSection >= 0 && newSection < sections.length) {
            setCurrentSection(newSection)
          }
        }, 50) // 100ms delay
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

  // Initialize GSAP animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial page load animation
      gsap.fromTo(".nav-item", { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.6, stagger: 0.1, delay: 0.5 })
      gsap.fromTo(".bottom-nav", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.8 })
      gsap.fromTo(".copyright", { opacity: 0 }, { opacity: 1, duration: 0.6, delay: 1 })
    })

    return () => ctx.revert()
  }, [])

  const navigateToSection = (index: number) => {
    if (containerRef.current) {
      isScrollingRef.current = true
      const container = containerRef.current
      const sectionWidth = container.clientWidth
      
      let targetScrollLeft: number
      
      if (index === sections.length - 1) {
        // For the last section (Contact), scroll to show it fully
        // Calculate the maximum scroll position that shows the contact section completely
        const totalWidth = container.scrollWidth
        const maxScrollLeft = totalWidth - sectionWidth
        targetScrollLeft = maxScrollLeft
      } else {
        // For other sections, scroll to the exact start
        targetScrollLeft = index * sectionWidth
      }

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

  // Animate navigation elements on section change
  useEffect(() => {
    gsap.to(".nav-progress", {
      height: `${((currentSection + 1) / sections.length) * 100}%`,
      duration: 0.8,
      ease: "power2.inOut",
    })

    // Animate active nav item
    gsap.to(".nav-dot", {
      scale: 1,
      duration: 0.3,
    })

    gsap.to(`.nav-dot-${currentSection}`, {
      scale: 1.25,
      duration: 0.3,
      ease: "back.out(1.7)",
    })

    // Animate bottom nav dots
    gsap.to(".bottom-dot", {
      scale: 1,
      duration: 0.3,
    })

    gsap.to(`.bottom-dot-${currentSection}`, {
      scale: 1.25,
      duration: 0.3,
      ease: "back.out(1.7)",
    })
  }, [currentSection])

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Fixed Left Navigation */}
      <nav className="fixed left-6 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center space-y-6">
        {sections.map((section, index) => (
          <button
            key={section}
            onClick={() => navigateToSection(index)}
            className={`nav-item group relative flex items-center transition-all duration-300 ${
              currentSection === index
                ? "text-[var(--portfolio-gold)]"
                : "text-gray-400 hover:text-[var(--portfolio-brown)]"
            }`}
          >
            <div
              className={`nav-dot nav-dot-${index} w-3 h-3 rounded-full border-2 transition-all duration-300 ${
                currentSection === index
                  ? "bg-[var(--portfolio-gold)] border-[var(--portfolio-gold)]"
                  : "border-gray-400 group-hover:border-[var(--portfolio-brown)]"
              }`}
            />
            <span
              className={`ml-4 text-sm font-medium transition-all duration-300 ${
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

      {/* Progress indicator - moved to middle right */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center">
        <div className="w-1 h-24 bg-gray-300 relative">
          <div className="nav-progress w-full bg-[var(--portfolio-gold)] transition-all duration-1000 ease-out h-0" />
        </div>
      </div>

      {/* Bottom Navigation Dots */}
      <nav className="bottom-nav fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex space-x-4">
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

      {/* Copyright */}
      <div className="copyright fixed bottom-4 right-6 z-50 text-sm text-gray-500">© 2024 Matthew Shi</div>

      {/* Main Horizontal Scroll Container */}
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
          <HeroSection />
        </div>

        {/* About Section */}
        <div className="min-w-full h-full flex-shrink-0">
          <AboutSection />
        </div>

        {/* Journey Section */}
        <div className="min-w-full h-full flex-shrink-0">
          <JourneySection />
        </div>

        {/* Contact Section */}
        <div className="min-w-full h-full flex-shrink-0">
          <ContactSection />
        </div>
      </div>
    </div>
  )
}
