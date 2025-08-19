"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { Code2, Heart, BookOpen, Coffee, MapPin, Lightbulb, Camera, Gamepad2, X, Music, Globe, Zap, Palette, Mountain } from "lucide-react"

// Card component interface
interface CardProps {
  id: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  iconColor: string
  bgColor: string
  borderColor?: string
  transform: string
  children: React.ReactNode
  position: {
    top: string
    left?: string
    right?: string
  }
  width: string
  expandedElement: string | null
  onElementClick: (id: string) => void
  onCloseExpanded: (e: React.MouseEvent) => void
}

// Reusable Card Component
const InfoCard: React.FC<CardProps> = ({
  id,
  title,
  icon: Icon,
  iconColor,
  bgColor,
  borderColor,
  transform,
  children,
  position,
  width,
  expandedElement,
  onElementClick,
  onCloseExpanded,
}) => {
  const isExpanded = expandedElement === id
  
  return (
    <div
      className={`flow-element absolute cursor-pointer transition-all duration-300 ${width} ${position.top} ${position.left || ''} ${position.right || ''}`}
      onClick={() => onElementClick(id)}
    >
      <div className={`${bgColor} backdrop-blur-sm rounded-2xl p-6 shadow-lg ${borderColor ? `border ${borderColor}` : ''} ${transform} hover:shadow-xl transition-shadow`}>
        {isExpanded && (
          <button
            onClick={onCloseExpanded}
            className="absolute top-4 right-4 p-1 rounded-full bg-white/70 hover:bg-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <div className="flex items-center gap-3 mb-4">
          <Icon className={`w-6 h-6 ${iconColor}`} />
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        </div>
        {children}
      </div>
    </div>
  )
}

export default function AboutSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [expandedElement, setExpandedElement] = useState<string | null>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".about-header",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out", delay: 0.2 },
      )

      gsap.fromTo(
        ".flow-element",
        { opacity: 0, x: 50, rotation: 2 },
        { opacity: 1, x: 0, rotation: 0, duration: 0.8, stagger: 0.15, delay: 0.4, ease: "power2.out" },
      )

      gsap.fromTo(
        ".skill-bubble",
        { opacity: 0, scale: 0.8, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.6, stagger: 0.08, delay: 0.8, ease: "back.out(1.7)" },
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (expandedElement) {
        gsap.to(".flow-element:not(.expanded)", {
          opacity: 0.3,
          filter: "blur(2px)",
          scale: 0.95,
          duration: 0.4,
          ease: "power2.out",
        })

        gsap.to(".expanded", {
          scale: 1.1,
          zIndex: 50,
          filter: "blur(0px)",
          opacity: 1,
          duration: 0.4,
          ease: "back.out(1.2)",
        })
      } else {
        gsap.to(".flow-element", {
          opacity: 1,
          filter: "blur(0px)",
          scale: 1,
          zIndex: 10,
          duration: 0.4,
          ease: "power2.out",
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [expandedElement])

  const handleElementClick = (elementId: string) => {
    setExpandedElement(expandedElement === elementId ? null : elementId)
  }

  const handleCloseExpanded = (e: React.MouseEvent) => {
    e.stopPropagation()
    setExpandedElement(null)
  }

  return (
    <div
      ref={sectionRef}
      className="relative h-full bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 overflow-hidden"
    >
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-32 h-32 bg-amber-400 rounded-full blur-3xl" />
        <div className="absolute top-40 right-32 w-24 h-24 bg-orange-400 rounded-full blur-2xl" />
        <div className="absolute bottom-32 left-1/3 w-40 h-40 bg-yellow-400 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-20 w-16 h-16 bg-amber-500 rotate-45 blur-xl" />
        <div className="absolute bottom-20 right-1/4 w-20 h-20 bg-orange-300 rounded-full blur-2xl" />
        <div className="absolute top-1/3 left-1/2 w-28 h-28 bg-yellow-300 rounded-full blur-2xl" />
      </div>

      <div className="relative z-10 h-full flex flex-col px-16">
        {/* Header Section - Matching Journey page format */}
        <div className="about-header py-12">
          <div className="journey-header">
            <h2 className="text-4xl lg:text-5xl font-serif font-bold text-[var(--portfolio-brown)] mb-4">About Me</h2>
            <p className="text-lg text-gray-600 font-medium">
              Beyond coding, I'm passionate about basketball, drawing, and the outdoors. Here's a little more about me!
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-x-auto overflow-y-hidden scroll-smooth pb-8">
            <div className="relative h-full" style={{ width: "90vw" }}>
              
              {/* LEFT SIDE - Personal & Interests Cluster */}
              
              {/* Personal Introduction */}
              <InfoCard
                id="intro"
                title="Who I Am"
                icon={Heart}
                iconColor="text-red-500"
                bgColor="bg-white/80"
                borderColor="border-amber-200/30"
                transform="-rotate-1"
                position={{ top: "top-4", left: "left-0" }}
                width="w-80"
                expandedElement={expandedElement}
                onElementClick={handleElementClick}
                onCloseExpanded={handleCloseExpanded}
              >
                <p className="text-gray-700 leading-relaxed mb-4">
                  I'm a passionate software engineer who believes in creating sustainable, impactful solutions.
                </p>
                {expandedElement === "intro" && (
                  <div className="mt-4 pt-4 border-t border-amber-200">
                    <p className="text-gray-600 text-sm leading-relaxed mb-3">
                      Currently pursuing my degree while working on projects that combine technical excellence with
                      environmental consciousness. I believe the best code is not just efficient, but also serves a
                      greater purpose.
                    </p>
                  </div>
                )}
                <div className="flex items-center gap-2 text-amber-800 text-sm mt-4">
                  <MapPin className="w-4 h-4" />
                  <span>Boston, MA • Sophomore</span>
                </div>
              </InfoCard>

              {/* Philosophy */}
              <InfoCard
                id="philosophy"
                title="Philosophy"
                icon={Lightbulb}
                iconColor="text-yellow-600"
                bgColor="bg-gradient-to-br from-amber-100/90 to-yellow-100/90"
                transform="rotate-1"
                position={{ top: "top-20", left: "left-64" }}
                width="w-80"
                expandedElement={expandedElement}
                onElementClick={handleElementClick}
                onCloseExpanded={handleCloseExpanded}
              >
                <p className="text-gray-700 leading-relaxed text-sm mb-4 italic">
                  "Technology should serve humanity and the planet - always learning, always building, always improving."
                </p>
                {expandedElement === "philosophy" && (
                  <div className="mt-4 pt-4 border-t border-yellow-200">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-sm font-medium text-gray-800 mb-2">Core Values</h5>
                        <div className="space-y-2">
                          {["Sustainability", "Accessibility", "Open Source", "Continuous Learning"].map((value) => (
                            <div key={value} className="text-xs text-gray-600 flex items-center gap-2">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                              {value}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-gray-800 mb-2">Goals</h5>
                        <div className="space-y-2">
                          {["Green Tech", "Education", "Community", "Innovation"].map((goal) => (
                            <div key={goal} className="text-xs text-gray-600 flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full" />
                              {goal}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </InfoCard>

              {/* Current Reading */}
              <InfoCard
                id="reading"
                title="Currently Reading"
                icon={BookOpen}
                iconColor="text-purple-600"
                bgColor="bg-white/85"
                borderColor="border-purple-200/30"
                transform="rotate-1"
                position={{ top: "top-36", left: "left-[28rem]" }}
                width="w-80"
                expandedElement={expandedElement}
                onElementClick={handleElementClick}
                onCloseExpanded={handleCloseExpanded}
              >
                <p className="text-lg text-gray-700 font-medium mb-2">The Pragmatic Programmer</p>
                <p className="text-sm text-gray-600 mb-4">Tech & Philosophy</p>
                {expandedElement === "reading" && (
                  <div className="mt-4 pt-4 border-t border-purple-200">
                    <p className="text-gray-600 text-sm mb-3">
                      "A journey through practical programming wisdom that shapes how I approach every project."
                    </p>
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-gray-800">Recent Reads</h5>
                      {["Clean Code", "System Design Interview", "Atomic Habits"].map((book) => (
                        <div key={book} className="text-xs text-gray-600">
                          • {book}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </InfoCard>

              {/* Current Game */}
              <InfoCard
                id="currentGame"
                title="Current Game"
                icon={Gamepad2}
                iconColor="text-orange-600"
                bgColor="bg-gradient-to-br from-orange-100/90 to-red-100/90"
                transform="-rotate-2"
                position={{ top: "top-12", left: "left-[44rem]" }}
                width="w-80"
                expandedElement={expandedElement}
                onElementClick={handleElementClick}
                onCloseExpanded={handleCloseExpanded}
              >
                <p className="text-lg text-gray-700 font-medium mb-2">Baldur's Gate 3</p>
                <p className="text-sm text-gray-600 mb-4">Strategy & RPG enthusiast</p>
                {expandedElement === "currentGame" && (
                  <div className="mt-4 pt-4 border-t border-orange-200">
                    <p className="text-gray-600 text-sm mb-3">
                      Immersed in the world of Baldur's Gate 3, combining strategy with RPG elements.
                    </p>
                    <div className="space-y-2">
                      {["Strategy", "RPG", "Adventure"].map((genre) => (
                        <div key={genre} className="text-xs text-gray-600 flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          {genre}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </InfoCard>

              {/* Hobbies */}
              <InfoCard
                id="hobbies"
                title="Hobbies"
                icon={Camera}
                iconColor="text-green-600"
                bgColor="bg-gradient-to-br from-green-100/90 to-emerald-100/90"
                transform="rotate-1"
                position={{ top: "top-28", left: "left-[56rem]" }}
                width="w-80"
                expandedElement={expandedElement}
                onElementClick={handleElementClick}
                onCloseExpanded={handleCloseExpanded}
              >
                <p className="text-lg text-gray-700 mb-2">Hiking & Photography</p>
                <p className="text-sm text-gray-600 mb-4">Digital Art • Nature Exploration</p>
                {expandedElement === "hobbies" && (
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <p className="text-gray-600 text-sm mb-3">
                      Exploring the outdoors and capturing life's moments through my camera.
                    </p>
                    <div className="space-y-2">
                      {["Nature Photography", "Digital Art", "Outdoor Adventures"].map((interest) => (
                        <div key={interest} className="text-xs text-gray-600 flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          {interest}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </InfoCard>

              {/* Favorite Song */}
              <InfoCard
                id="music"
                title="Favorite Song"
                icon={Music}
                iconColor="text-blue-600"
                bgColor="bg-gradient-to-br from-blue-100/90 to-cyan-100/90"
                transform="-rotate-1"
                position={{ top: "top-52", left: "left-[68rem]" }}
                width="w-80"
                expandedElement={expandedElement}
                onElementClick={handleElementClick}
                onCloseExpanded={handleCloseExpanded}
              >
                <p className="text-lg text-gray-700 mb-2">Lo-fi Hip Hop</p>
                <p className="text-sm text-gray-600 mb-4">Tame Impala, Chill Beats</p>
                {expandedElement === "music" && (
                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <p className="text-gray-600 text-sm mb-3">
                      The perfect soundtrack for coding sessions and late-night work.
                    </p>
                    <div className="space-y-2">
                      {["Lo-fi", "Hip Hop", "Chill Beats"].map((genre) => (
                        <div key={genre} className="text-xs text-gray-600 flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          {genre}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </InfoCard>

              {/* NEW CARD: Creative Expression */}
              <InfoCard
                id="creative"
                title="Creative Expression"
                icon={Palette}
                iconColor="text-pink-600"
                bgColor="bg-gradient-to-br from-pink-100/90 to-rose-100/90"
                transform="rotate-2"
                position={{ top: "top-8", left: "left-[80rem]" }}
                width="w-80"
                expandedElement={expandedElement}
                onElementClick={handleElementClick}
                onCloseExpanded={handleCloseExpanded}
              >
                <p className="text-lg text-gray-700 mb-2">Digital Art & Design</p>
                <p className="text-sm text-gray-600 mb-4">UI/UX • Illustrations • Logos</p>
                {expandedElement === "creative" && (
                  <div className="mt-4 pt-4 border-t border-pink-200">
                    <p className="text-gray-600 text-sm mb-3">
                      Expressing creativity through digital design, from UI/UX to custom illustrations.
                    </p>
                    <div className="space-y-2">
                      {["Figma", "Adobe Creative Suite", "Procreate", "Design Systems"].map((tool) => (
                        <div key={tool} className="text-xs text-gray-600 flex items-center gap-2">
                          <div className="w-2 h-2 bg-pink-500 rounded-full" />
                          {tool}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </InfoCard>

              {/* NEW CARD: Adventure Spirit */}
              <InfoCard
                id="adventure"
                title="Adventure Spirit"
                icon={Mountain}
                iconColor="text-emerald-600"
                bgColor="bg-gradient-to-br from-emerald-100/90 to-teal-100/90"
                transform="-rotate-1"
                position={{ top: "top-40", left: "left-[92rem]" }}
                width="w-80"
                expandedElement={expandedElement}
                onElementClick={handleElementClick}
                onCloseExpanded={handleCloseExpanded}
              >
                <p className="text-lg text-gray-700 mb-2">Outdoor Exploration</p>
                <p className="text-sm text-gray-600 mb-4">Hiking • Camping • Photography</p>
                {expandedElement === "adventure" && (
                  <div className="mt-4 pt-4 border-t border-emerald-200">
                    <p className="text-gray-600 text-sm mb-3">
                      Finding inspiration in nature and pushing personal boundaries through outdoor adventures.
                    </p>
                    <div className="space-y-2">
                      {["New England Trails", "Wildlife Photography", "Backpacking", "Rock Climbing"].map((activity) => (
                        <div key={activity} className="text-xs text-gray-600 flex items-center gap-2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                          {activity}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </InfoCard>

              {/* RIGHT SIDE - Skills & Tools Cluster */}
              
              {/* Technical Tools & Platforms - NEW CARD */}
              <InfoCard
                id="tools"
                title="Technical Tools & Platforms"
                icon={Zap}
                iconColor="text-indigo-600"
                bgColor="bg-gradient-to-br from-indigo-100/90 to-blue-100/90"
                transform="rotate-1"
                position={{ top: "top-8", right: "right-0" }}
                width="w-80"
                expandedElement={expandedElement}
                onElementClick={handleElementClick}
                onCloseExpanded={handleCloseExpanded}
              >
                <div className="flex flex-wrap gap-2 mb-4">
                  {["Git", "Docker", "AWS", "Vercel"].map((tool) => (
                    <span
                      key={tool}
                      className="skill-bubble px-3 py-1 bg-white/70 rounded-full text-sm font-medium text-gray-700"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
                {expandedElement === "tools" && (
                  <div className="mt-4 pt-4 border-t border-indigo-200">
                    <p className="text-gray-600 text-sm mb-3">
                      Essential tools and platforms that power my development workflow.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-sm font-medium text-gray-800 mb-2">DevOps</h5>
                        <div className="space-y-2">
                          {["Docker", "Git", "CI/CD", "AWS"].map((tool) => (
                            <div key={tool} className="text-xs text-gray-600 flex items-center gap-2">
                              <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                              {tool}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-gray-800 mb-2">Platforms</h5>
                        <div className="space-y-2">
                          {["Vercel", "Netlify", "Heroku", "DigitalOcean"].map((platform) => (
                            <div key={platform} className="text-xs text-gray-600 flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                              {platform}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </InfoCard>

              {/* Frontend Skills */}
              <InfoCard
                id="frontend"
                title="Frontend"
                icon={Code2}
                iconColor="text-blue-600"
                bgColor="bg-gradient-to-br from-blue-100/90 to-cyan-100/90"
                transform="rotate-2"
                position={{ top: "top-16", right: "right-[28rem]" }}
                width="w-80"
                expandedElement={expandedElement}
                onElementClick={handleElementClick}
                onCloseExpanded={handleCloseExpanded}
              >
                <div className="flex flex-wrap gap-2 mb-4">
                  {["React", "Next.js", "TypeScript", "Tailwind"].map((skill) => (
                    <span
                      key={skill}
                      className="skill-bubble px-3 py-1 bg-white/70 rounded-full text-sm font-medium text-gray-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                {expandedElement === "frontend" && (
                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-sm font-medium text-gray-800 mb-2">Advanced</h5>
                        <div className="space-y-2">
                          {["React Hooks", "Next.js 14", "TypeScript"].map((skill) => (
                            <div key={skill} className="text-xs text-gray-600 flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full" />
                              {skill}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-gray-800 mb-2">Learning</h5>
                        <div className="space-y-2">
                          {["Three.js", "Framer Motion", "Zustand"].map((skill) => (
                            <div key={skill} className="text-xs text-gray-600 flex items-center gap-2">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                              {skill}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </InfoCard>

              {/* Backend Skills */}
              <InfoCard
                id="backend"
                title="Backend"
                icon={Code2}
                iconColor="text-green-600"
                bgColor="bg-gradient-to-br from-green-100/90 to-emerald-100/90"
                transform="-rotate-1"
                position={{ top: "top-24", right: "right-[20rem]" }}
                width="w-80"
                expandedElement={expandedElement}
                onElementClick={handleElementClick}
                onCloseExpanded={handleCloseExpanded}
              >
                <div className="flex flex-wrap gap-2 mb-4">
                  {["Python", "Node.js", "PostgreSQL", "Redis"].map((skill) => (
                    <span
                      key={skill}
                      className="skill-bubble px-3 py-1 bg-white/70 rounded-full text-sm font-medium text-gray-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                {expandedElement === "backend" && (
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <p className="text-gray-600 text-sm mb-3">
                      Building scalable APIs and microservices with focus on performance and sustainability.
                    </p>
                    <div className="space-y-2">
                      {["FastAPI & Django", "Database Design", "Caching Strategies", "API Security"].map((skill) => (
                        <div key={skill} className="text-xs text-gray-600 flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          {skill}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </InfoCard>

              {/* AI/ML Skills */}
              <InfoCard
                id="aiMl"
                title="AI/ML"
                icon={Code2}
                iconColor="text-purple-600"
                bgColor="bg-gradient-to-br from-purple-100/90 to-violet-100/90"
                transform="rotate-1"
                position={{ top: "top-48", right: "right-[12rem]" }}
                width="w-80"
                expandedElement={expandedElement}
                onElementClick={handleElementClick}
                onCloseExpanded={handleCloseExpanded}
              >
                <div className="flex flex-wrap gap-2 mb-4">
                  {["TensorFlow", "PyTorch", "OpenAI API"].map((skill) => (
                    <span
                      key={skill}
                      className="skill-bubble px-3 py-1 bg-white/70 rounded-full text-sm font-medium text-gray-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                {expandedElement === "aiMl" && (
                  <div className="mt-4 pt-4 border-t border-purple-200">
                    <p className="text-gray-600 text-sm mb-3">
                      Exploring the latest advancements in AI and Machine Learning.
                    </p>
                    <div className="space-y-2">
                      {["TensorFlow", "PyTorch", "OpenAI API"].map((skill) => (
                        <div key={skill} className="text-xs text-gray-600 flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          {skill}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </InfoCard>

              {/* NEW CARD: Learning Journey */}
              <InfoCard
                id="learning"
                title="Learning Journey"
                icon={Globe}
                iconColor="text-teal-600"
                bgColor="bg-gradient-to-br from-teal-100/90 to-cyan-100/90"
                transform="-rotate-2"
                position={{ top: "top-32", right: "right-[36rem]" }}
                width="w-80"
                expandedElement={expandedElement}
                onElementClick={handleElementClick}
                onCloseExpanded={handleCloseExpanded}
              >
                <p className="text-lg text-gray-700 mb-2">Continuous Growth</p>
                <p className="text-sm text-gray-600 mb-4">Online Courses • Certifications</p>
                {expandedElement === "learning" && (
                  <div className="mt-4 pt-4 border-t border-teal-200">
                    <p className="text-gray-600 text-sm mb-3">
                      Always expanding my knowledge through structured learning and hands-on projects.
                    </p>
                    <div className="space-y-2">
                      {["Coursera", "Udemy", "AWS Certifications", "Open Source"].map((platform) => (
                        <div key={platform} className="text-xs text-gray-600 flex items-center gap-2">
                          <div className="w-2 h-2 bg-teal-500 rounded-full" />
                          {platform}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </InfoCard>

              {/* NEW CARD: Community & Networking */}
              <InfoCard
                id="community"
                title="Community & Networking"
                icon={Heart}
                iconColor="text-rose-600"
                bgColor="bg-gradient-to-br from-rose-100/90 to-pink-100/90"
                transform="rotate-1"
                position={{ top: "top-56", right: "right-[44rem]" }}
                width="w-80"
                expandedElement={expandedElement}
                onElementClick={handleElementClick}
                onCloseExpanded={handleCloseExpanded}
              >
                <p className="text-lg text-gray-700 mb-2">Building Connections</p>
                <p className="text-sm text-gray-600 mb-4">Tech Meetups • Hackathons</p>
                {expandedElement === "community" && (
                  <div className="mt-4 pt-4 border-t border-rose-200">
                    <p className="text-gray-600 text-sm mb-3">
                      Actively participating in the tech community and building meaningful professional relationships.
                    </p>
                    <div className="space-y-2">
                      {["Local Meetups", "Hackathons", "Mentorship", "Open Source"].map((activity) => (
                        <div key={activity} className="text-xs text-gray-600 flex items-center gap-2">
                          <div className="w-2 h-2 bg-rose-500 rounded-full" />
                          {activity}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </InfoCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
