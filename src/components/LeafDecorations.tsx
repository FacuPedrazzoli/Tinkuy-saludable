'use client'

export function MonsteraLeaf({ className = '', style = 'left' }: { className?: string, style?: 'left' | 'right' }) {
  const rotation = style === 'left' ? 'rotate-0' : 'rotate-12'
  const flip = style === 'right' ? '-scale-x-100' : ''

  return (
    <svg
      viewBox="0 0 200 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${rotation} ${flip}`}
      style={{ width: '180px', height: 'auto' }}
    >
      <path
        d="M100 280 C100 280 100 200 100 150 C100 100 130 50 100 20 C70 50 50 80 40 120 C30 160 20 200 30 240 C40 280 70 300 100 280"
        fill="#5A6E3F"
        opacity="0.15"
      />
      <path
        d="M100 280 C100 280 100 220 100 170 C100 130 120 90 100 60 C80 90 70 110 60 140 C50 170 50 200 60 230 C70 260 85 280 100 280"
        fill="#7A9E5A"
        opacity="0.15"
      />
      <path
        d="M100 150 L100 260"
        stroke="#5A6E3F"
        strokeWidth="3"
        opacity="0.2"
      />
      <path
        d="M100 180 C80 170 60 160 50 140"
        stroke="#5A6E3F"
        strokeWidth="2"
        opacity="0.15"
        fill="none"
      />
      <path
        d="M100 200 C120 190 140 180 150 160"
        stroke="#5A6E3F"
        strokeWidth="2"
        opacity="0.15"
        fill="none"
      />
      <path
        d="M100 220 C85 215 70 210 55 195"
        stroke="#5A6E3F"
        strokeWidth="1.5"
        opacity="0.1"
        fill="none"
      />
      <ellipse cx="60" cy="140" rx="15" ry="20" fill="#5A6E3F" opacity="0.08" />
      <ellipse cx="140" cy="160" rx="12" ry="18" fill="#5A6E3F" opacity="0.06" />
    </svg>
  )
}

export function SmallLeaf({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 50 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ width: '40px', height: 'auto' }}
    >
      <path
        d="M25 75 C25 75 25 50 25 35 C25 20 35 10 25 5 C15 10 10 20 10 35 C10 50 15 65 25 75"
        fill="#7A9E5A"
        opacity="0.3"
      />
      <path
        d="M25 75 L25 30"
        stroke="#5A6E3F"
        strokeWidth="1.5"
        opacity="0.2"
      />
    </svg>
  )
}

export function LeafPattern({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ width: '60px', height: 'auto' }}
    >
      <circle cx="50" cy="50" r="45" stroke="#7A9E5A" strokeWidth="0.5" opacity="0.3" fill="none" />
      <path d="M50 5 C50 5 50 35 50 50 C50 65 65 80 50 95 C35 80 20 65 20 50 C20 35 35 20 50 5" fill="#7A9E5A" opacity="0.2" />
      <path d="M50 15 C50 15 50 40 50 50 C50 60 60 72 50 85 C40 72 30 60 30 50 C30 40 40 25 50 15" fill="#5A6E3F" opacity="0.15" />
      <line x1="50" y1="15" x2="50" y2="85" stroke="#5A6E3F" strokeWidth="1" opacity="0.2" />
    </svg>
  )
}