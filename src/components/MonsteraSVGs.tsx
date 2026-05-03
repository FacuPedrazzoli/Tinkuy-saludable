'use client'

interface MonsteraLeafProps {
  className?: string
  style?: 'left' | 'right'
  variant?: 'primary' | 'secondary' | 'background'
  blur?: boolean
}

export function MonsteraLeafSVG({ 
  className = '', 
  style = 'left', 
  variant = 'primary',
  blur = false 
}: MonsteraLeafProps) {
  const flip = style === 'right' ? 'scale-x-[-1]' : ''
  
  const colors = {
    primary: {
      fill: '#4a6236',
      vein: '#3b4c2b',
      shadow: '#5A6E3F',
    },
    secondary: {
      fill: '#7A9E5A',
      vein: '#5A6E3F',
      shadow: '#9ab37a',
    },
    background: {
      fill: '#b4c89a',
      vein: '#9ab37a',
      shadow: '#d1dfc1',
    }
  }

  const c = colors[variant]
  const blurFilter = blur ? 'blur-[2px]' : ''
  const opacity = blur ? 'opacity-10' : 'opacity-15'

  return (
    <svg
      viewBox="0 0 400 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${flip} ${blurFilter} ${opacity}`}
      style={{ width: '320px', height: 'auto' }}
    >
      <defs>
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="8" result="blur"/>
          <feOffset in="blur" dx="4" dy="8" result="offsetBlur"/>
          <feFlood floodColor={c.shadow} floodOpacity="0.15"/>
          <feComposite in2="offsetBlur" operator="in"/>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c.fill} stopOpacity="0.9"/>
          <stop offset="50%" stopColor={c.fill} stopOpacity="0.7"/>
          <stop offset="100%" stopColor={c.fill} stopOpacity="0.5"/>
        </linearGradient>
        <linearGradient id="veinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={c.vein} stopOpacity="0.4"/>
          <stop offset="100%" stopColor={c.vein} stopOpacity="0.2"/>
        </linearGradient>
      </defs>

      <g filter="url(#softShadow)">
        <path
          d="M200 480 
             C200 480 180 400 160 320 
             C140 240 120 180 100 120 
             C80 60 60 30 80 10 
             C100 -10 140 10 160 40 
             C180 70 200 100 220 140 
             C240 180 260 220 280 280 
             C300 340 320 400 320 450 
             C320 500 260 520 200 480"
          fill="url(#leafGrad)"
        />
        
        <path
          d="M200 480 
             C200 480 190 420 180 360 
             C170 300 160 250 150 200 
             C140 150 130 110 140 80 
             C150 50 170 40 185 55 
             C200 70 200 100 210 130 
             C220 160 240 200 260 250 
             C280 300 300 360 300 420 
             C300 460 250 490 200 480"
          fill={c.fill}
          fillOpacity="0.6"
        />

        <ellipse cx="160" cy="200" rx="25" ry="35" fill={c.shadow} fillOpacity="0.15" transform="rotate(-20 160 200)"/>
        <ellipse cx="240" cy="250" rx="20" ry="30" fill={c.shadow} fillOpacity="0.12" transform="rotate(15 240 250)"/>
        <ellipse cx="180" cy="320" rx="18" ry="25" fill={c.shadow} fillOpacity="0.1" transform="rotate(-10 180 320)"/>
        
        <path
          d="M200 480 L200 60"
          stroke="url(#veinGrad)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        
        <path
          d="M200 150 C170 140 130 130 110 110"
          stroke={c.vein}
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.5"
        />
        <path
          d="M200 150 C230 140 270 130 290 110"
          stroke={c.vein}
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.5"
        />
        
        <path
          d="M200 220 C165 205 125 195 95 175"
          stroke={c.vein}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity="0.4"
        />
        <path
          d="M200 220 C235 205 275 195 305 175"
          stroke={c.vein}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity="0.4"
        />
        
        <path
          d="M200 290 C170 280 140 270 115 255"
          stroke={c.vein}
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.35"
        />
        <path
          d="M200 290 C230 280 260 270 285 255"
          stroke={c.vein}
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.35"
        />
        
        <path
          d="M200 360 C175 350 150 345 130 335"
          stroke={c.vein}
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.3"
        />
        <path
          d="M200 360 C225 350 250 345 270 335"
          stroke={c.vein}
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.3"
        />

        <path
          d="M200 180 C185 175 170 172 160 175"
          stroke={c.vein}
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
          opacity="0.3"
        />
        <path
          d="M200 180 C215 175 230 172 240 175"
          stroke={c.vein}
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
          opacity="0.3"
        />
        
        <path
          d="M200 250 C180 245 160 242 145 245"
          stroke={c.vein}
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
          opacity="0.25"
        />
        <path
          d="M200 250 C220 245 240 242 255 245"
          stroke={c.vein}
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
          opacity="0.25"
        />

        <path
          d="M100 120 C90 115 85 105 90 95 C95 85 110 85 115 95 C120 105 110 115 100 120"
          fill={c.shadow}
          fillOpacity="0.2"
        />
        <path
          d="M280 280 C275 275 280 265 290 260 C300 255 310 265 305 275 C300 285 285 285 280 280"
          fill={c.shadow}
          fillOpacity="0.15"
        />
        
        <path
          d="M140 180 C135 175 138 165 148 162 C158 159 165 168 160 178 C155 188 142 185 140 180"
          fill={c.shadow}
          fillOpacity="0.12"
        />
        <path
          d="M260 220 C258 212 268 205 278 210 C288 215 285 228 275 232 C265 236 262 228 260 220"
          fill={c.shadow}
          fillOpacity="0.1"
        />
      </g>
    </svg>
  )
}

export function SmallLeafSVG({ className = '', style = 'left', blur = false }: { className?: string, style?: 'left' | 'right', blur?: boolean }) {
  const flip = style === 'right' ? 'scale-x-[-1]' : ''
  const blurClass = blur ? 'blur-[1px]' : ''
  const opacityClass = blur ? 'opacity-8' : 'opacity-12'

  return (
    <svg
      viewBox="0 0 100 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${flip} ${blurClass} ${opacityClass}`}
      style={{ width: '80px', height: 'auto' }}
    >
      <defs>
        <filter id="smallShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur"/>
          <feOffset in="blur" dx="2" dy="3" result="offsetBlur"/>
          <feFlood floodColor="#5A6E3F" floodOpacity="0.2"/>
          <feComposite in2="offsetBlur" operator="in"/>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <g filter="url(#smallShadow)">
        <path
          d="M50 140 
             C50 140 45 110 40 80 
             C35 50 30 30 40 15 
             C50 0 60 10 65 25 
             C70 40 65 60 60 80 
             C55 100 55 120 55 135 
             C55 145 52 145 50 140"
          fill="#5A6E3F"
          fillOpacity="0.7"
        />
        
        <path
          d="M50 140 
             C50 140 48 115 45 90 
             C42 65 45 45 50 30 
             C55 45 58 60 55 80 
             C52 100 52 120 52 135"
          fill="#7A9E5A"
          fillOpacity="0.5"
        />
        
        <path
          d="M50 135 L50 35"
          stroke="#4a6236"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.5"
        />
        
        <path
          d="M50 60 C40 55 30 50 25 40"
          stroke="#4a6236"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.4"
        />
        <path
          d="M50 60 C60 55 70 50 75 40"
          stroke="#4a6236"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.4"
        />
        
        <path
          d="M50 90 C42 85 35 82 28 78"
          stroke="#4a6236"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
          opacity="0.3"
        />
        <path
          d="M50 90 C58 85 65 82 72 78"
          stroke="#4a6236"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
          opacity="0.3"
        />
        
        <ellipse cx="35" cy="65" rx="8" ry="12" fill="#5A6E3F" fillOpacity="0.15" transform="rotate(-15 35 65)"/>
        <ellipse cx="65" cy="75" rx="6" ry="10" fill="#5A6E3F" fillOpacity="0.1" transform="rotate(10 65 75)"/>
      </g>
    </svg>
  )
}

export function StemSVG({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 30 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ width: '20px', height: 'auto' }}
    >
      <path
        d="M15 200 C15 200 12 150 10 100 C8 50 12 20 15 0"
        stroke="#5A6E3F"
        strokeWidth="6"
        strokeLinecap="round"
        opacity="0.15"
      />
      <path
        d="M15 200 C15 200 14 160 13 120 C12 80 14 40 15 0"
        stroke="#7A9E5A"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.12"
      />
    </svg>
  )
}
