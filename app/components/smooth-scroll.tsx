"use client"

import { useEffect, useRef, type ReactNode } from "react"
import Lenis from "lenis"

interface SmoothScrollProps {
  children: ReactNode
  disabled?: boolean
}

export default function SmoothScroll({ children, disabled = false }: SmoothScrollProps) {
  const lenisRef = useRef<Lenis | null>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (disabled) return

    const lenis = new Lenis({
      duration: 0.8,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
    })

    lenisRef.current = lenis

    function raf(time: number) {
      lenis.raf(time)
      rafRef.current = requestAnimationFrame(raf)
    }

    rafRef.current = requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
      lenisRef.current = null
      cancelAnimationFrame(rafRef.current)
    }
  }, [disabled])

  return <>{children}</>
}
