'use client'

import Link from 'next/link'
import Image from 'next/image'
import { siteConfig } from '@/data/siteConfig'

export function Logo() {
  return (
    <Link href="/" className="flex items-center">
      <Image
        src="/logo-tinkuy.png"
        alt={siteConfig.name}
        width={160}
        height={50}
        className="h-8 w-auto sm:h-10 lg:h-12"
        priority
      />
    </Link>
  )
}
