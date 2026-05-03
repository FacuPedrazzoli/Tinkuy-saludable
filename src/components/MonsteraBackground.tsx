'use client'

import { MonsteraLeafSVG, SmallLeafSVG, StemSVG } from './MonsteraSVGs'

export function MonsteraBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      <div className="absolute inset-0 bg-gradient-to-br from-cream-50 via-white to-cream-100" />

      <div className="absolute -top-20 -left-20 animate-float-slow">
        <MonsteraLeafSVG
          style="left"
          variant="primary"
          blur={false}
          className="rotate-[-15deg]"
        />
      </div>

      <div className="absolute top-32 left-8 animate-float">
        <SmallLeafSVG style="left" blur={true} />
      </div>

      <div className="absolute -top-10 -right-10 animate-float-slow" style={{ animationDelay: '-2s' }}>
        <MonsteraLeafSVG
          style="right"
          variant="secondary"
          blur={false}
          className="rotate-[10deg]"
        />
      </div>

      <div className="absolute top-40 right-16 animate-float" style={{ animationDelay: '-1s' }}>
        <SmallLeafSVG style="right" blur={true} />
      </div>

      <div className="absolute top-0 right-32">
        <StemSVG className="rotate-[5deg]" />
      </div>

      <div className="absolute -bottom-16 -left-16 animate-float-slow" style={{ animationDelay: '-3s' }}>
        <MonsteraLeafSVG
          style="left"
          variant="secondary"
          blur={false}
          className="rotate-[20deg]"
        />
      </div>

      <div className="absolute bottom-24 left-20 animate-float" style={{ animationDelay: '-4s' }}>
        <SmallLeafSVG style="left" blur={false} />
      </div>

      <div className="absolute -bottom-10 -right-20 animate-float-slow" style={{ animationDelay: '-1.5s' }}>
        <MonsteraLeafSVG
          style="right"
          variant="primary"
          blur={false}
          className="rotate-[-8deg]"
        />
      </div>

      <div className="absolute bottom-40 right-24 animate-float" style={{ animationDelay: '-2.5s' }}>
        <SmallLeafSVG style="right" blur={true} />
      </div>

      <div className="absolute top-1/4 left-4 opacity-[0.06] blur-[3px]">
        <MonsteraLeafSVG style="left" variant="background" blur={true} />
      </div>

      <div className="absolute bottom-1/4 right-8 opacity-[0.05] blur-[4px]">
        <MonsteraLeafSVG style="right" variant="background" blur={true} />
      </div>

      <div className="absolute top-1/3 left-0 opacity-[0.08]">
        <SmallLeafSVG style="left" blur={true} />
      </div>

      <div className="absolute top-1/2 right-0 opacity-[0.07]">
        <SmallLeafSVG style="right" blur={true} />
      </div>
    </div>
  )
}

export function MobileMonsteraBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      <div className="absolute inset-0 bg-gradient-to-br from-cream-50 via-white to-cream-100" />

      <div className="absolute -top-8 -left-8 opacity-10">
        <MonsteraLeafSVG
          style="left"
          variant="primary"
          blur={true}
          className="rotate-[-10deg]"
        />
      </div>

      <div className="absolute -bottom-6 -right-10 opacity-10">
        <MonsteraLeafSVG
          style="right"
          variant="secondary"
          blur={true}
          className="rotate-[5deg]"
        />
      </div>

      <div className="absolute top-20 right-4 opacity-6 blur-[2px]">
        <SmallLeafSVG style="right" blur={true} />
      </div>

      <div className="absolute bottom-32 left-4 opacity-6 blur-[2px]">
        <SmallLeafSVG style="left" blur={true} />
      </div>
    </div>
  )
}
