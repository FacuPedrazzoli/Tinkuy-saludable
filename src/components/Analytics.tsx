'use client'

import { useEffect } from 'react'
import { pageView } from '@/lib/analytics'
import { trackPageView } from '@/lib/pixel'

export function Analytics() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const gaId = process.env.NEXT_PUBLIC_GA_ID
    const fbPixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID

    if (gaId) {
      const gtagScript = document.createElement('script')
      gtagScript.async = true
      gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`
      document.head.appendChild(gtagScript)

      const inlineScript = document.createElement('script')
      inlineScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${gaId}');
      `
      document.head.appendChild(inlineScript)
    }

    if (fbPixelId) {
      const fbScript = document.createElement('script')
      fbScript.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${fbPixelId}');
        fbq('track', 'PageView');
      `
      document.head.appendChild(fbScript)
    }

    const handleRouteChange = () => {
      pageView(window.location.href, document.title)
      trackPageView()
    }

    window.addEventListener('popstate', handleRouteChange)
    return () => window.removeEventListener('popstate', handleRouteChange)
  }, [])

  return null
}
