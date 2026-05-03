'use client'

import { useEffect, useState } from 'react'
import { MonsteraBackground, MobileMonsteraBackground } from './MonsteraBackground'

export function MonsteraBackgroundWrapper() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return isMobile ? <MobileMonsteraBackground /> : <MonsteraBackground />
}
