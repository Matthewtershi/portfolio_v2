"use client"

import { motion } from "framer-motion"

interface GlassCardProps {
  children: React.ReactNode
  hoverVariant?: "glow" | "lift" | "tilt"
  hoverGlow?: boolean
  className?: string
  onClick?: () => void
}

export function GlassCard({ children, hoverVariant = "glow", hoverGlow = false, className = "", onClick }: GlassCardProps) {
  const baseClasses = "rounded-2xl p-6 backdrop-blur-sm transition-all duration-300"

  const hoverVariants = {
    glow: {
      rest: { boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)" },
      hover: {
        boxShadow: hoverGlow ? "0 0 30px rgba(212, 175, 55, 0.2)" : "0 20px 25px -5px rgba(184, 138, 30, 0.15), 0 8px 10px -6px rgba(184, 138, 30, 0.1)",
        transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const },
      },
    },
    lift: {
      rest: { y: 0, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)" },
      hover: {
        y: -8,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.2)",
        transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const },
      },
    },
    tilt: {
      rest: {
        y: 0,
        rotateX: 0,
        rotateY: 0,
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
      },
      hover: {
        y: -4,
        rotateX: 2,
        rotateY: -2,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15)",
        transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const },
      },
    },
  }

  const variant = hoverVariants[hoverVariant]

  return (
    <motion.div
      className={`${baseClasses} ${className}`}
      initial="rest"
      whileHover="hover"
      variants={variant}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}
