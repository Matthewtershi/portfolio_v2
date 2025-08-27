"use client"

import type React from "react"
import { ArrowLeft, Send } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { gsap } from "gsap"
import GitHubStats from "./github-stats"

interface ContactSectionProps {
  shouldAnimate?: boolean
}

export default function ContactSection({ shouldAnimate = false }: ContactSectionProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Always set initial states to prevent flash
      gsap.set(".contact-header", { opacity: 0, y: 30 })
      gsap.set(".contact-form", { opacity: 0, y: 20 })
      gsap.set(".contact-stats", { opacity: 0, x: 30 })

      // Only animate if shouldAnimate is true
      if (shouldAnimate) {
        const tl = gsap.timeline({ delay: 0.1 })

        tl.to(".contact-header", {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
        })

        tl.to(".contact-form", {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: "power2.out",
        }, "-=0.3")

        tl.to(".contact-stats", {
          opacity: 1,
          x: 0,
          duration: 0.5,
          ease: "power2.out",
        }, "-=0.2")
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [shouldAnimate])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const subject = encodeURIComponent("Portfolio Contact from " + formData.name)
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    )
    
    window.location.href = `mailto:matthewtershi@gmail.com?subject=${subject}&body=${body}`
    
    setFormData({ name: "", email: "", message: "" })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const scrollToStart = () => {
    const container = document.querySelector('[ref="containerRef"]') || 
                     document.querySelector('.flex.h-full.overflow-x-auto') || 
                     document.querySelector('.flex.h-full.overflow-x-auto.overflow-y-hidden') ||
                     window
    if (container && 'scrollTo' in container) {
      container.scrollTo({ left: 0, behavior: "smooth" })
    } else {
      window.scrollTo({ left: 0, behavior: "smooth" })
    }
  }

  return (
    <div ref={sectionRef} className="h-full bg-[var(--portfolio-dark)] text-white flex items-center justify-center relative overflow-hidden px-4">
      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-start justify-between gap-8 lg:gap-12 relative z-10">
        <div className="flex-1 max-w-lg text-center lg:text-left">
        <div className="contact-header opacity-0 translate-y-8">
          <p className="text-amber-400 text-sm font-bold tracking-[0.2em] uppercase mb-6 relative inline-block">
            GET IN TOUCH
            <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-amber-400" />
          </p>

          <h2 className="text-5xl lg:text-6xl font-serif font-bold mb-16 text-white">
            CONTACT<span className="text-amber-400">.</span>
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="contact-form space-y-10 opacity-0 translate-y-5">
          <div className="relative">
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleInputChange}
              onFocus={() => setFocusedField("name")}
              onBlur={() => setFocusedField(null)}
              className="w-full bg-transparent border-0 border-b-2 border-gray-600 focus:border-amber-400 outline-none py-4 text-white placeholder-gray-400 transition-all duration-300 text-lg"
              required
            />
            <div
              className={`absolute bottom-0 left-0 h-0.5 bg-amber-400 transition-all duration-300 ${
                focusedField === "name" ? "w-full" : "w-0"
              }`}
            />
          </div>

          <div className="relative">
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleInputChange}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              className="w-full bg-transparent border-0 border-b-2 border-gray-600 focus:border-amber-400 outline-none py-4 text-white placeholder-gray-400 transition-all duration-300 text-lg"
              required
            />
            <div
              className={`absolute bottom-0 left-0 h-0.5 bg-amber-400 transition-all duration-300 ${
                focusedField === "email" ? "w-full" : "w-0"
              }`}
            />
          </div>

          <div className="relative">
            <textarea
              name="message"
              placeholder="Your Message"
              rows={4}
              value={formData.message}
              onChange={handleInputChange}
              onFocus={() => setFocusedField("message")}
              onBlur={() => setFocusedField(null)}
              className="w-full bg-transparent border-0 border-b-2 border-gray-600 focus:border-amber-400 outline-none py-4 text-white placeholder-gray-400 resize-none transition-all duration-300 text-lg"
              required
            />
            <div
              className={`absolute bottom-0 left-0 h-0.5 bg-amber-400 transition-all duration-300 ${
                focusedField === "message" ? "w-full" : "w-0"
              }`}
            />
          </div>

          <button
            type="submit"
            className="bg-gradient-to-r from-amber-400 to-amber-500 text-black px-10 py-4 rounded-lg font-bold hover:from-amber-300 hover:to-amber-400 transition-all duration-300 flex items-center space-x-3 hover:scale-105 hover:shadow-lg group mx-auto lg:mx-0"
          >
            <span>Send Message</span>
            <Send size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </form>
      </div>

      <div className="flex-1 flex justify-center lg:justify-end min-w-0">
        <div className="contact-stats opacity-0 translate-x-8 w-full max-w-2xl">
          <GitHubStats />
        </div>
      </div>
    </div>

      <button
        onClick={scrollToStart}
        className="absolute bottom-8 left-8 flex items-center space-x-3 text-amber-400 hover:text-amber-300 transition-all duration-300 group z-20"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform duration-300" />
        <span className="font-medium">Back to Start</span>
      </button>

      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 border border-amber-400 rotate-45" />
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 border border-amber-400 rotate-12" />
      </div>
    </div>
  )
}
