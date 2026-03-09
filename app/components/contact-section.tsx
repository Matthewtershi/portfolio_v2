"use client"

import type React from "react"
import { ArrowLeft, Send, Copy, Check } from "lucide-react"
import { useState } from "react"
import { motion } from "framer-motion"
import GitHubStats from "./github-stats"

const EASE = [0.22, 1, 0.36, 1] as const

interface ContactSectionProps {
  shouldAnimate?: boolean
}

export default function ContactSection({ shouldAnimate = false }: ContactSectionProps) {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" })
  const [copied, setCopied] = useState(false)

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
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText("matthewtershi@gmail.com")
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const ta = document.createElement("textarea")
      ta.value = "matthewtershi@gmail.com"
      document.body.appendChild(ta)
      ta.select()
      document.execCommand("copy")
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--charcoal)] flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={shouldAnimate ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: EASE }}
            >
              <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--goldenrod)] mb-4">Get in touch</p>
              <h2 className="font-serif font-bold text-white text-4xl lg:text-5xl mb-8">Contact</h2>
              <p className="text-sm tracking-widest text-gray-400 mb-8 max-w-md">
                Have a project in mind? Drop a line.
              </p>
              <button
                onClick={copyEmail}
                className="glass px-6 py-3 rounded-sm border border-white/10 flex items-center gap-3 text-gray-300 hover:text-[var(--goldenrod)] hover:border-[var(--goldenrod)]/30 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                <span className="text-sm">{copied ? "Copied!" : "matthewtershi@gmail.com"}</span>
              </button>
            </motion.div>
          </div>

          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={shouldAnimate ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
            className="space-y-6"
          >
            <div>
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full bg-transparent border-b border-white/20 py-4 text-white placeholder-gray-500 focus:border-[var(--goldenrod)] outline-none transition-colors text-sm tracking-wide"
                required
              />
            </div>
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full bg-transparent border-b border-white/20 py-4 text-white placeholder-gray-500 focus:border-[var(--goldenrod)] outline-none transition-colors text-sm tracking-wide"
                required
              />
            </div>
            <div>
              <textarea
                name="message"
                placeholder="Message"
                rows={4}
                value={formData.message}
                onChange={handleInputChange}
                className="w-full bg-transparent border-b border-white/20 py-4 text-white placeholder-gray-500 focus:border-[var(--goldenrod)] outline-none resize-none transition-colors text-sm tracking-wide"
                required
              />
            </div>
            <button
              type="submit"
              className="px-8 py-3 bg-[var(--goldenrod)] text-[var(--charcoal)] font-semibold text-sm tracking-widest uppercase rounded-sm hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              Send <Send className="w-4 h-4" />
            </button>
          </motion.form>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={shouldAnimate ? { opacity: 1 } : {}}
          transition={{ delay: 0.3 }}
          className="mt-16 glass rounded-2xl p-6 border border-white/10"
        >
          <GitHubStats />
        </motion.div>

        <motion.button
          onClick={() => document.getElementById("section-0")?.scrollIntoView({ behavior: "smooth" })}
          initial={{ opacity: 0 }}
          animate={shouldAnimate ? { opacity: 1 } : {}}
          transition={{ delay: 0.4 }}
          className="mt-16 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-gray-500 hover:text-[var(--goldenrod)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to start
        </motion.button>
      </div>
    </div>
  )
}
