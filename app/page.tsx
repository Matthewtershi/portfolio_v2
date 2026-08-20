"use client"

import { useEffect, useState } from "react"
import SmoothScroll from "./components/smooth-scroll"
import ScrollRig from "./components/scroll-rig"

/* Phones and tablets get the reduced build: no dino game, no idle greeting,
   and the narrow artwork crop. A 12.9" iPad in landscape is 1366 wide, so
   width alone is not enough — a coarse pointer means touch. */
function readCompact() {
  const w = window.innerWidth
  const coarse = window.matchMedia("(pointer: coarse)").matches
  return w < 1024 || (coarse && w < 1400)
}

export default function Portfolio() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(readCompact())
    check()
    window.addEventListener("resize", check)
    window.addEventListener("orientationchange", check)
    return () => {
      window.removeEventListener("resize", check)
      window.removeEventListener("orientationchange", check)
    }
  }, [])

  return (
    <SmoothScroll disabled={isMobile}>
      <main className="bg-[var(--charcoal)]">
        <ScrollRig isMobile={isMobile} />
      </main>
    </SmoothScroll>
  )
}
