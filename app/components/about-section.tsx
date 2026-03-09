"use client"

import { motion } from "framer-motion"

const EASE = [0.22, 1, 0.36, 1] as const

interface LabelValueProps {
  label: string
  value: string
  className?: string
}

function LabelValue({ label, value, className = "" }: LabelValueProps) {
  return (
    <div className={className}>
      <p className="text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-1">{label}</p>
      <p className="font-serif text-lg text-white">{value}</p>
    </div>
  )
}

const PERSONALITY = [
  { label: "Location", value: "Austin, TX · Sophomore" },
  { label: "Favorite Song", value: "Calling After Me — Wallows" },
  { label: "Currently Reading", value: "Illusions — Richard Bach" },
  { label: "Philosophy", value: "When you truly want something, the whole universe conspires." },
  { label: "Hobbies", value: "Guitar · Drawing · Reading · Basketball" },
]

const BENTO_TOOLS = [
  { title: "Frontend", items: ["Next.js", "TypeScript", "React", "Tailwind"] },
  { title: "Backend", items: ["Django", "Node.js", "ASP.NET", "tRPC"] },
  { title: "AI/ML", items: ["TensorFlow", "PyTorch", "Hugging Face"] },
  { title: "DevOps", items: ["Docker", "AWS", "Git", "Vercel"] },
]

interface AboutSectionProps {
  shouldAnimate?: boolean
  isMobile?: boolean
}

export default function AboutSection({ shouldAnimate = false, isMobile = false }: AboutSectionProps) {
  return (
    <div className="relative min-h-screen bg-[var(--charcoal)] py-[100px] px-6 lg:px-12 overflow-hidden">
      {/* Blueprint grid */}
      <div className="absolute inset-0 border border-white/5 pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={shouldAnimate ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: EASE }}
          className="mb-20"
        >
          <h2
            className="font-serif font-bold text-[var(--goldenrod)] tracking-tighter"
            style={{ fontSize: "clamp(3rem, 8vw, 6rem)" }}
          >
            ABOUT
          </h2>
          <p className="text-sm tracking-widest text-gray-400 max-w-[50ch] mt-4">
            Sophomore at Texas A&M. Building things that work.
          </p>
        </motion.div>

        {isMobile ? (
          <div className="space-y-12">
            {PERSONALITY.map(({ label, value, Icon }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                animate={shouldAnimate ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.08, duration: 0.5, ease: EASE }}
                className="glass rounded-2xl p-6 border border-white/10"
              >
                <LabelValue label={label} value={value} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="relative min-h-[500px]">
            {PERSONALITY.map(({ label, value }, i) => {
              const positions = [
                { top: "8%", left: "5%" },
                { top: "25%", left: "55%" },
                { top: "45%", left: "10%" },
                { top: "60%", left: "60%" },
                { top: "78%", left: "25%" },
              ]
              const pos = positions[i % positions.length]
              return (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 24 }}
                  animate={shouldAnimate ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: i * 0.1, duration: 0.5, ease: EASE }}
                  className="absolute glass rounded-2xl p-6 border border-white/10 w-64 hover:shadow-[var(--glow-gold)] transition-shadow duration-500"
                  style={{ top: pos.top, left: pos.left }}
                >
                  <LabelValue label={label} value={value} />
                </motion.div>
              )
            })}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={shouldAnimate ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4, duration: 0.6, ease: EASE }}
          className="mt-24"
        >
          <p className="text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-6">Tools & Stack</p>
          <div className={`grid gap-4 ${isMobile ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-4"}`}>
            {BENTO_TOOLS.map(({ title, items }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 16 }}
                animate={shouldAnimate ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.5 + i * 0.08, duration: 0.5, ease: EASE }}
                className="glass rounded-2xl p-6 border border-white/10 hover:border-[var(--goldenrod)]/20 transition-colors"
              >
                <p className="text-[10px] uppercase tracking-widest text-[var(--goldenrod)]/80 mb-3">{title}</p>
                <div className="flex flex-wrap gap-2">
                  {items.map((item) => (
                    <span
                      key={item}
                      className="px-2 py-1 text-xs text-gray-400 border border-white/10 rounded"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
