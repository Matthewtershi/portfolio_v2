"use client"

import { Brain, Code, Server, Cloud, Network, Leaf, Target, Trophy, GraduationCap } from "lucide-react"
import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

interface Experience {
  year: string
  category: string
  title: string
  description: string
  tools: string[]
  icon: React.ComponentType<{ className?: string }>
  position: "top" | "bottom"
}

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

const experiences: Experience[] = [
  {
    year: "2025",
    category: "Internship",
    title: "Energy System Laboratory",
    description: "Designed preprocessing pipelines for ML models in HVAC fault detection",
    tools: ["ASP.NET", "Azure Machine Learning", "AWS", "Blazor"],
    icon: Brain,
    position: "top",
  },
  {
    year: "2024",
    category: "Research",
    title: "Climate Hydrology Lab",
    description: "Designed models and dashboards for CDR and ocean alkalinization at scale",
    tools: ["Next.js", "Django", "PostgreSQL", "Docker"],
    icon: Leaf,
    position: "bottom",
  },
  {
    year: "2024",
    category: "Leadership",
    title: "Tidal TAMU Activities Director",
    description: "Led the organization through hackathons, workshops, and lectures for 400+ students in collaboration with AWS, Google, and Microsoft",
    tools: ["TypeScript", "MongoDB", "Node.js"],
    icon: Code,
    position: "top",
  },
  {
    year: "2024",
    category: "Competition",
    title: "HowdyHack",
    description: "Built a wildfire prediction app that reached 86% accuracy and placed Top 4 at HowdyHack 2024",
    tools: ["Next.js", "Python", "TensorFlow", "Flask"],
    icon: Trophy,
    position: "bottom",
  },
  {
    year: "2024",
    category: "Project",
    title: "Baseball Swing Analysis Model",
    description: "Developed a LSTM model to classify swings, diagnose swing faults, and provide feedback to players",
    tools: ["TensorFlow", "OpenCV", "Mediapipe"],
    icon: Target,
    position: "top",
  },
  {
    year: "2024",
    category: "Education",
    title: "Enrolled in CE @ TAMU",
    description: "Began post-secondary education @ TAMU - ECE Major Math Minor",
    tools: ["C++", "Python", "MATLAB"],
    icon: GraduationCap,
    position: "bottom",
  },
]

const skills = [
  { name: "Machine Learning", icon: Brain },
  { name: "Full Stack", icon: Code },
  { name: "DevOps", icon: Server },
  { name: "Cloud Computing", icon: Cloud },
  { name: "Distributed Systems", icon: Network },
  { name: "Sustainability", icon: Leaf },
]

export default function JourneySection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Set initial states
      gsap.set(".journey-header", { opacity: 0, y: 30 })
      gsap.set(".skill-pill", { opacity: 0, y: 20, scale: 0.8 })
      gsap.set(".timeline-card", { opacity: 0, y: 50, scale: 0.9 })
      gsap.set(".timeline-line", { scaleX: 0, transformOrigin: "left center" })

      // Create entrance timeline
      const tl = gsap.timeline({ delay: 0.3 })

      // Animate header
      tl.to(".journey-header", {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
      })

      // Animate skills pills
      tl.to(
        ".skill-pill",
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: "back.out(1.7)",
        },
        "-=0.4",
      )

      // Animate timeline line
      tl.to(
        ".timeline-line",
        {
          scaleX: 1,
          duration: 1.5,
          ease: "power2.out",
        },
        "-=0.2",
      )



      // Animate timeline cards
      tl.to(
        ".timeline-card",
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.15,
          ease: "power2.out",
        },
        "-=0.8",
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={sectionRef} className="h-full bg-gradient-to-br from-amber-50 to-orange-50 flex flex-col">
      {/* Enhanced Header Section */}
      <div ref={headerRef} className="px-16 py-16">
        <div className="journey-header">
          <h2 className="text-4xl lg:text-5xl font-serif font-bold text-[var(--portfolio-brown)] mb-4">My Journey</h2>
          <p className="text-lg my-2 text-gray-600 font-medium"> Here is my story so far. If you want to see more, check out my work on <a href="https://github.com/Matthewtershi" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800"> Github </a> where I share everything I've worked on!  </p>
        </div>

        {/* Enhanced Skills Pills with GSAP animations */}
        <div className="flex flex-wrap gap-4">
          {skills.map((skill, index) => {
            const IconComponent = skill.icon
            return (
              <span
                key={skill.name}
                className="skill-pill px-5 py-3 bg-white rounded-full text-sm font-semibold text-[var(--portfolio-brown)] shadow-md border border-amber-200 hover:shadow-lg transition-all duration-300 flex items-center space-x-2 cursor-default"
                onMouseEnter={(e) => {
                  gsap.to(e.currentTarget, {
                    scale: 1.05,
                    y: -2,
                    duration: 0.3,
                    ease: "back.out(1.7)",
                  })
                }}
                onMouseLeave={(e) => {
                  gsap.to(e.currentTarget, {
                    scale: 1,
                    y: 0,
                    duration: 0.3,
                    ease: "back.out(1.7)",
                  })
                }}
              >
                <IconComponent className="w-5 h-5" />
                <span>{skill.name}</span>
              </span>
            )
          })}
        </div>
      </div>

      {/* Enhanced Timeline Section */}
      <div className="flex-1 relative px-8">
        <div
          className="timeline-scroll-area h-full overflow-x-auto overflow-y-hidden scroll-smooth"
          style={{ scrollbarWidth: "thin" }}
        >
          <div
            ref={timelineRef}
            className="relative h-full py-20"
            style={{ width: `${experiences.length * 400 + 200}px` }}
          >
                         {/* Enhanced Timeline Line with GSAP and Dashes */}
             <div className="timeline-line absolute top-1/2 left-0 right-0 h-2 bg-gradient-to-r from-[var(--portfolio-gold)] via-amber-400 to-orange-400 transform -translate-y-1/2 rounded-full shadow-sm" />
             
             {/* Timeline Dashes */}
             {experiences.map((exp, index) => {
               const leftPosition = 100 + index * 400
               return (
                 <div key={`dash-${index}`} className="absolute top-1/2 transform -translate-y-1/2" style={{ left: `${leftPosition}px` }}>
                   <div className="w-8 h-2 bg-white rounded-full shadow-sm border border-amber-200" />
                 </div>
               )
             })}

            {/* Experience Cards Container */}
            <div className="relative flex items-center h-full">
              {experiences.map((exp, index) => {
                const Icon = exp.icon
                const leftPosition = 100 + index * 400 // 400px spacing between cards

                return (
                  <div key={index} className="absolute" style={{ left: `${leftPosition}px` }}>

                    {/* Enhanced Experience Card with GSAP hover */}
                    <div
                      className={`timeline-card w-80 bg-white rounded-xl shadow-xl p-6 border border-amber-100 transition-all duration-300 cursor-pointer ${
                        exp.position === "top" ? "mb-40 transform -translate-y-8" : "mt-40 transform translate-y-8"
                      }`}
                      onMouseEnter={(e) => {
                        gsap.to(e.currentTarget, {
                          y: exp.position === "top" ? -40 : 40,
                          scale: 1.02,
                          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                          duration: 0.4,
                          ease: "power2.out",
                        })
                      }}
                      onMouseLeave={(e) => {
                        gsap.to(e.currentTarget, {
                          y: exp.position === "top" ? -32 : 32,
                          scale: 1,
                          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                          duration: 0.4,
                          ease: "power2.out",
                        })
                      }}
                    >
                      {/* Card Header */}
                      <div className="flex items-center justify-between mb-4">
                        {/* Year Badge */}
                        <div className="px-4 py-2 bg-gradient-to-r from-[var(--portfolio-gold)] to-amber-400 text-white text-sm font-bold rounded-full shadow-sm">
                          {exp.year}
                        </div>

                        {/* Category Tag */}
                        <div className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full uppercase tracking-wide">
                          {exp.category}
                        </div>
                      </div>

                      {/* Enhanced Icon */}
                      <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mb-5 shadow-inner">
                        <Icon className="w-8 h-8 text-[var(--portfolio-brown)]" />
                      </div>

                      {/* Enhanced Content */}
                      <h3 className="text-xl font-bold text-[var(--portfolio-brown)] mb-3 leading-tight">
                        {exp.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed text-sm mb-4">{exp.description}</p>

                      {/* Tools Used */}
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-[var(--portfolio-brown)] mb-2 uppercase tracking-wide">
                          Tools & Technologies
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {exp.tools.map((tool, toolIndex) => (
                            <span
                              key={toolIndex}
                              className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full border border-amber-200"
                            >
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Card Accent */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--portfolio-gold)] to-orange-400 rounded-b-xl" />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Timeline Start and End Markers */}
            <div className="absolute top-1/2 left-4 w-4 h-4 bg-[var(--portfolio-gold)] rounded-full border-2 border-white shadow-lg transform -translate-y-1/2" />
            <div className="absolute top-1/2 right-4 w-4 h-4 bg-orange-400 rounded-full border-2 border-white shadow-lg transform -translate-y-1/2" />

            {/* Year Markers */}
            {experiences.map((exp, index) => {
              const leftPosition = 100 + index * 400
              return (
                <div key={`year-${index}`} className="absolute" style={{ left: `${leftPosition}px` }}>
                  {/* Year Label */}
                  <div className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 mt-8">
                    <div className="bg-white px-3 py-1 rounded-full shadow-md border border-amber-200">
                      <span className="text-sm font-bold text-[var(--portfolio-brown)]">{exp.year}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
