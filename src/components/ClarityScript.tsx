'use client'

import Script from 'next/script'
import { useEffect } from 'react'

declare global {
  interface Window {
    clarity?: (...args: unknown[]) => void
  }
}

export function ClarityScript() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return
  }, [])

  const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID

  if (!clarityId || process.env.NODE_ENV !== 'production') {
    return null
  }

  return (
    <Script
      id="clarity-script"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "${clarityId}");
        `,
      }}
    />
  )
}
