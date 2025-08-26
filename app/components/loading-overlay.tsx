"use client"

import { useEffect, useState } from "react"

export default function LoadingOverlay() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-50 bg-[var(--portfolio-beige)] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[var(--portfolio-gold)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-2xl font-serif font-bold text-[var(--portfolio-brown)]">
          Loading Portfolio...
        </h2>
        <p className="text-sm text-[var(--portfolio-brown)] mt-2 opacity-75">
          Preparing your experience...
        </p>
      </div>
    </div>
  )
}
