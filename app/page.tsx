"use client"

import { useEffect, useState } from "react"
import SmoothScroll from "./components/smooth-scroll"
import ScrollRig from "./components/scroll-rig"

/* One breakpoint, by width alone: 1024 and up always gets the full desktop
   layout, everything below gets the compact build (no dino game, no idle
   greeting, narrow artwork crop). Pointer type is deliberately not consulted —
   a large touch screen still has the room, and mixing the two rules meant a
   1366px iPad landscape rendered the phone layout. */
const DESKTOP_MIN = 1024

export default function Portfolio() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < DESKTOP_MIN)
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
