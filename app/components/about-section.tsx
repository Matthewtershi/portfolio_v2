"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { Code2, Heart, BookOpen, MapPin, Lightbulb, Gamepad2, X, Music, Globe, Zap } from "lucide-react"



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

interface AboutSectionProps {
  shouldAnimate?: boolean
}

const AudioPlayer: React.FC<{ isExpanded: boolean }> = ({ isExpanded }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Only create audio element on client side
    const audioElement = new Audio('/audio/calling-after-me.mp3')
    setAudio(audioElement)
    
    return () => {
      if (audioElement) {
        audioElement.pause()
        audioElement.currentTime = 0
      }
    }
  }, [])

  useEffect(() => {
    if (!audio) return
    
    const handleEnded = () => setIsPlaying(false)
    const handleLoadedMetadata = () => setDuration(audio.duration)
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    
    return () => {
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
    }
  }, [audio])

  useEffect(() => {
    if (!audio || !isExpanded) return
    
    if (isPlaying) {
      audio.pause()
      audio.currentTime = 0
      setIsPlaying(false)
    }
  }, [isExpanded, audio, isPlaying])

  const togglePlay = () => {
    if (!audio) return
    
    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      if (isExpanded) {
        audio.play()
        setIsPlaying(true)
      }
    }
  }


  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="mt-3">
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={(e) => {
            e.stopPropagation()
            togglePlay()
          }}
          className="flex items-center justify-center w-12 h-12 bg-green-500 hover:bg-green-600 rounded-full text-white transition-colors shadow-md"
        >
          {isPlaying ? (
            <div className="w-5 h-5 flex items-center justify-center">
              <div className="w-1 h-5 bg-white rounded-sm mx-0.5"></div>
              <div className="w-1 h-5 bg-white rounded-sm mx-0.5"></div>
            </div>
          ) : (
            <div className="w-0 h-0 border-l-[10px] border-l-white border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ml-1"></div>
          )}
        </button>
        
        <div className="text-sm text-gray-600">
          {isPlaying ? "Playing..." : "Click to play"}
        </div>
      </div>
      
      <div className="flex justify-between text-xs text-gray-500">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
        <div 
          className="bg-green-500 h-1 rounded-full transition-all duration-100"
          style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
        />
      </div>
    </div>
  )
}

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
      className={`flow-element absolute cursor-pointer transition-all duration-300 ${width} ${position.top} ${position.left || ''} ${position.right || ''} ${isExpanded ? 'expanded' : ''}`}
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

export default function AboutSection({ shouldAnimate = false }: AboutSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [expandedElement, setExpandedElement] = useState<string | null>(null)

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
      className="relative h-full bg-orange-50 overflow-hidden"
    >
      <div className="absolute inset-0 opacity-50">
        <div className="absolute top-20 left-20 w-32 h-32 bg-amber-400 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 left-32 w-24 h-24 bg-orange-400 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-32 left-1/3 w-40 h-40 bg-yellow-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-20 w-16 h-16 bg-amber-500 rotate-45 blur-xl animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-1/3 left-1/2 w-28 h-28 bg-yellow-300 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.8s' }} />
        <div className="absolute top-1/6 left-1/8 w-36 h-36 bg-amber-200 rounded-full blur-2xl opacity-70 animate-pulse" style={{ animationDelay: '0.4s' }} />
        <div className="absolute bottom-1/6 left-1/8 w-32 h-32 bg-orange-200 rounded-full blur-2xl opacity-80 animate-pulse" style={{ animationDelay: '1.8s' }} />
        <div className="absolute top-1/2 left-1/8 w-20 h-20 bg-yellow-200 rounded-full blur-xl opacity-75 animate-pulse" style={{ animationDelay: '0.2s' }} />
        
        <div className="absolute top-1/4 left-2/3 w-18 h-18 bg-amber-400 rounded-full blur-lg animate-pulse" style={{ animationDelay: '0.1s' }} />
        <div className="absolute bottom-1/3 left-3/4 w-14 h-14 bg-orange-300 rounded-full blur-xl animate-pulse" style={{ animationDelay: '0.8s' }} />
        
        <div className="absolute top-1/2 left-4/5 w-10 h-10 bg-amber-300 rounded-full blur-lg animate-pulse" style={{ animationDelay: '0.6s' }} />
        
        <div className="absolute top-1/3 left-6/7 w-6 h-6 bg-yellow-300 rounded-full blur-sm animate-pulse" style={{ animationDelay: '0.9s' }} />
      </div>

      <div className="relative z-10 h-full flex flex-col px-8">
        <div className="about-header py-12">
          <div className="journey-header">
            <h2 className="text-4xl lg:text-5xl font-serif font-bold text-[var(--portfolio-brown)] mb-4">About Me</h2>
            <p className="text-lg text-gray-600 font-medium">
              Beyond coding, I&apos;m passionate about basketball, drawing, and the outdoors. Here&apos;s a little more about me inluding my tastes, interests, and skills!
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-hidden pb-8">
            <div className="relative h-full max-w-[1400px] mx-auto">
              
              
              {/* Personal Introduction */}
              <InfoCard
                id="intro"
                title="Who I Am"
                icon={Heart}
                iconColor="text-red-500"
                bgColor="bg-white/90"
                borderColor="border-amber-200/40"
                transform="-rotate-1"
                position={{ top: "top-8", left: "left-4" }}
                width="w-80"
                expandedElement={expandedElement}
                onElementClick={handleElementClick}
                onCloseExpanded={handleCloseExpanded}
              >
                <p className="text-gray-700 leading-relaxed mb-4">
                  I&apos;m a student pursuing a career in software engineering
                </p>
                {expandedElement === "intro" && (
                  <div className="mt-4 pt-4 border-t border-amber-200">
                    <p className="text-gray-600 text-sm leading-relaxed mb-3">
                      I&apos;m passionate about turning ideas into solutions that people can utilize to improve theirs or others lives.
                    </p>
                  </div>
                )}
                <div className="flex items-center gap-2 text-amber-800 text-sm mt-4">
                  <MapPin className="w-4 h-4" />
                  <span>Austin, TX • Sophomore</span>
                </div>
              </InfoCard>

              {/* Favorite Song */}
              <InfoCard
                id="music"
                title="Favorite Song"
                icon={Music}
                iconColor="text-blue-600"
                bgColor="bg-gradient-to-br from-blue-50/95 to-cyan-50/95"
                borderColor="border-blue-200/40"
                transform="-rotate-1"
                position={{ top: "top-40", left: "left-44" }}
                width="w-80"
                expandedElement={expandedElement}
                onElementClick={handleElementClick}
                onCloseExpanded={handleCloseExpanded}
              >
                <p className="text-lg text-gray-700 mb-2">Calling After Me</p>
                <p className="text-sm text-gray-600 mb-4">Wallows</p>
                {expandedElement === "music" && (
                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <p className="text-gray-600 text-sm mb-3">
                      My favorite music genres for late-nights, exercise, and just relaxing:
                    </p>
                    <div className="space-y-2">
                      {["Indie-Pop", "Hip Hop", "C-Pop"].map((genre) => (
                        <div key={genre} className="text-xs text-gray-600 flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          {genre}
                        </div>
                      ))}
                    </div>
                    <AudioPlayer isExpanded={expandedElement === "music"} />
                  </div>
                )}
              </InfoCard>

              {/* Philosophy */}
              <InfoCard
                id="philosophy"
                title="Philosophy"
                icon={Lightbulb}
                iconColor="text-yellow-600"
                bgColor="bg-gradient-to-br from-amber-50/95 to-yellow-50/95"
                borderColor="border-amber-200/40"
                transform="rotate-1"
                position={{ top: "top-24", left: "left-[28rem]" }}
                width="w-80"
                expandedElement={expandedElement}
                onElementClick={handleElementClick}
                onCloseExpanded={handleCloseExpanded}
              >
                <p className="text-gray-700 leading-relaxed text-sm mb-4 italic">
                                     &quot;When you truly want something, the whole universe conspires to help you achieve it.&quot;
                </p>
                <p className="text-xs text-gray-500 text-right">— The Alchemist</p>
                {expandedElement === "philosophy" && (
                  <div className="mt-4 pt-4 border-t border-yellow-200">
                    <p className="text-gray-600 text-sm mb-3">
                      The world responds to authentic commitment
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-sm font-medium text-gray-800 mb-2">What This Means</h5>
                        <div className="space-y-2">
                          {["Authentic Goals", "Persistent Action", "Open to Opportunities", "Trust the Process"].map((value) => (
                            <div key={value} className="text-xs text-gray-600 flex items-center gap-2">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                              {value}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-gray-800 mb-2">In Practice</h5>
                        <div className="space-y-2">
                          {["Daily Learning", "Building Projects", "Helping Others", "Staying Curious"].map((goal) => (
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
                bgColor="bg-gradient-to-br from-purple-50/95 to-violet-50/95"
                borderColor="border-purple-200/40"
                transform="rotate-1"
                position={{ top: "top-80", left: "left-0" }}
                width="w-80"
                expandedElement={expandedElement}
                onElementClick={handleElementClick}
                onCloseExpanded={handleCloseExpanded}
              >
                <p className="text-lg text-gray-700 font-medium mb-2"> Illusions</p>
                <p className="text-sm text-gray-600 mb-4">By Richard Bach</p>
                {expandedElement === "reading" && (
                  <div className="mt-4 pt-4 border-t border-purple-200">
                    <p className="text-gray-600 text-sm mb-3">
                      A book to question my perception of reality and challenge the illusions I have been living in.
                    </p>
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-gray-800">Recent Reads</h5>
                      {["Zero to One", "Person of Interest", "Tuesdays with Morrie"].map((book) => (
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
                bgColor="bg-gradient-to-br from-orange-50/95 to-red-50/95"
                borderColor="border-orange-200/40"
                transform="-rotate-2"
                position={{ top: "top-28", left: "left-[56rem]" }}
                width="w-80"
                expandedElement={expandedElement}
                onElementClick={handleElementClick}
                onCloseExpanded={handleCloseExpanded}
              >
                <p className="text-lg text-gray-700 font-medium mb-2"> Clash of Clans</p>
                <p className="text-sm text-gray-600 mb-4"> Town Hall 15 max lab max heroes basically the goat </p>
                {expandedElement === "currentGame" && (
                  <div className="mt-4 pt-4 border-t border-orange-200">
                    <p className="text-gray-600 text-sm mb-3">
                      Other games:
                    </p>
                    <div className="space-y-2">
                      {["Genshin Impact", "Minecraft", "Valorant"].map((genre) => (
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
                icon={Music}
                iconColor="text-green-600"
                bgColor="bg-gradient-to-br from-green-50/95 to-emerald-50/95"
                borderColor="border-green-200/40"
                transform="rotate-1"
                position={{ top: "top-72", left: "left-[16rem]" }}
                width="w-80"
                expandedElement={expandedElement}
                onElementClick={handleElementClick}
                onCloseExpanded={handleCloseExpanded}
              >
                <p className="text-lg text-gray-700 mb-2">Creative & Intellectual</p>
                <p className="text-sm text-gray-600 mb-4">Music • Art • Reflection</p>
                {expandedElement === "hobbies" && (
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <p className="text-gray-600 text-sm mb-3">
                      Finding things that keep me grounded (also off my phone)
                    </p>
                    <div className="space-y-2">
                      {["Acoustic Guitar", "Sketching", "Reading"].map((interest) => (
                        <div key={interest} className="text-xs text-gray-600 flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          {interest}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </InfoCard>

              {/* Random Facts */}
              <InfoCard
                id="randomFacts"
                title="Random Facts"
                icon={Zap}
                iconColor="text-orange-600"
                bgColor="bg-gradient-to-br from-orange-50/95 to-amber-50/95"
                borderColor="border-orange-200/40"
                transform="rotate-2"
                position={{ top: "top-18", left: "left-[72rem]" }}
                width="w-80"
                expandedElement={expandedElement}
                onElementClick={handleElementClick}
                onCloseExpanded={handleCloseExpanded}
              >
                <p className="text-lg text-gray-700 mb-2">Fun Facts</p>
                <p className="text-sm text-gray-600 mb-4">Weird Stuff About Me</p>
                {expandedElement === "randomFacts" && (
                  <div className="mt-4 pt-4 border-t border-orange-200">
                    <p className="text-gray-600 text-sm mb-3">
                      Everyone has their quirks. Here are a few of mine.
                    </p>
                    <div className="space-y-2">
                      {["Can't read cursive", "Scared of colored pencils", "Self conscious about keychains", "Don't touch my mechanical pencils"].map((fact) => (
                        <div key={fact} className="text-xs text-gray-600 flex items-center gap-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full" />
                          {fact}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </InfoCard>
              
              {/* Technical Tools & Platforms - NEW CARD */}
              <InfoCard
                id="tools"
                title="Technical Tools & Platforms"
                icon={Zap}
                iconColor="text-indigo-600"
                bgColor="bg-gradient-to-br from-indigo-50/95 to-blue-50/95"
                borderColor="border-indigo-200/40"
                transform="rotate-1"
                position={{ top: "top-40", right: "right-4" }}
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
                          {["Kubernetes", "CI/CD Pipelines", "Terraform", "Sentry"].map((tool) => (
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
                          {["Netlify", "Heroku", "DigitalOcean", "Cloudflare"].map((platform) => (
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
                bgColor="bg-gradient-to-br from-blue-50/95 to-cyan-50/95"
                borderColor="border-blue-200/40"
                transform="rotate-2"
                position={{ top: "top-96", right: "right-[26rem]" }}
                width="w-80"
                expandedElement={expandedElement}
                onElementClick={handleElementClick}
                onCloseExpanded={handleCloseExpanded}
              >
                <div className="flex flex-wrap gap-2 mb-4">
                                     {["Next.js 14", "TypeScript", "React", "Tailwind CSS"].map((skill) => (
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
                          {["Server Components", "React Hooks", "CSS-in-JS", "State Management"].map((skill) => (
                            <div key={skill} className="text-xs text-gray-600 flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full" />
                              {skill}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-gray-800 mb-2">Additional</h5>
                        <div className="space-y-2">
                          {["Framer Motion", "Three.js", "Zustand", "Svelte"].map((skill) => (
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
                bgColor="bg-gradient-to-br from-green-50/95 to-emerald-50/95"
                borderColor="border-green-200/40"
                transform="-rotate-1"
                position={{ top: "top-56", right: "right-[20rem]" }}
                width="w-80"
                expandedElement={expandedElement}
                onElementClick={handleElementClick}
                onCloseExpanded={handleCloseExpanded}
              >
                <div className="flex flex-wrap gap-2 mb-4">
                                     {["Django", "Node.js", "ASP.NET Core", "tRPC"].map((skill) => (
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
                      Building scalable APIs and microservices
                    </p>
                    <div className="space-y-2">
                      {["Microservices", "Django & FastAPI", "C# & .NET", "Docker Containers"].map((skill) => (
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
                bgColor="bg-gradient-to-br from-purple-50/95 to-violet-50/95"
                borderColor="border-purple-200/40"
                transform="rotate-1"
                position={{ top: "top-80", right: "right-[12rem]" }}
                width="w-80"
                expandedElement={expandedElement}
                onElementClick={handleElementClick}
                onCloseExpanded={handleCloseExpanded}
              >
                <div className="flex flex-wrap gap-2 mb-4">
                                     {["TensorFlow", "PyTorch", "Hugging Face"].map((skill) => (
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
                      Learning as much as I can about model engineering and enhancement.
                    </p>
                    <div className="space-y-2">
                      {["Azure ML", "Feature Engineering", "Model Deployment"].map((skill) => (
                        <div key={skill} className="text-xs text-gray-600 flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          {skill}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </InfoCard>

              {/* Learning Journey */}
              <InfoCard
                id="learning"
                title="Learning Journey"
                icon={Globe}
                iconColor="text-teal-600"
                bgColor="bg-gradient-to-br from-teal-50/95 to-cyan-50/95"
                borderColor="border-teal-200/40"
                transform="-rotate-2"
                position={{ top: "top-8", right: "right-[28rem]" }}
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
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-sm font-medium text-gray-800 mb-2">Completed</h5>
                        <div className="space-y-2">
                          {["Coursera (Deep Learning)", "Udemy (DeepRacer CV)", "AWS Certifications", "Open Source"].map((platform) => (
                            <div key={platform} className="text-xs text-gray-600 flex items-center gap-2">
                              <div className="w-2 h-2 bg-teal-500 rounded-full" />
                              {platform}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-gray-800 mb-2">Roadmap</h5>
                        <div className="space-y-2">
                          {["Kubernetes", "Terraform Automation", "Cloud Architecture", "Security"].map((platform) => (
                            <div key={platform} className="text-xs text-gray-600 flex items-center gap-2">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                              {platform}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </InfoCard>

              {/* Community & Leadership */}
              <InfoCard
                id="community"
                title="Community"
                icon={Heart}
                iconColor="text-rose-600"
                bgColor="bg-gradient-to-br from-rose-50/95 to-pink-50/95"
                borderColor="border-rose-200/40"
                transform="rotate-1"
                position={{ top: "top-64", right: "right-[38rem]" }}
                width="w-80"
                expandedElement={expandedElement}
                onElementClick={handleElementClick}
                onCloseExpanded={handleCloseExpanded}
            >
                <p className="text-lg text-gray-700 mb-2">Building Connections</p>
                <p className="text-sm text-gray-600 mb-4">Clubs • Hackathons</p>
                {expandedElement === "community" && (
                  <div className="mt-4 pt-4 border-t border-rose-200">
                    <p className="text-gray-600 text-sm mb-3">
                      Actively participating in the academic community and building meaningful relationships with my peers
                    </p>
                    <div className="space-y-2">
                      {["Tidal TAMU", "Workshops", "Hackathons", "Mentoring"].map((activity) => (
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
