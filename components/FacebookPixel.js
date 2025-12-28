"use client";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { useAdmin } from "../app/context/AdminContext";
import * as fpixel from "../lib/fpixel";
import { trackEvent } from "../lib/tracker";

const FacebookPixel = () => {
  const { config, isLoaded } = useAdmin();
  const searchParams = useSearchParams();

  // Load Pixel when config is ready
  useEffect(() => {
    if (isLoaded && config.pixelId) {
      // Initialize Pixel Explicitly
      if (typeof window !== 'undefined' && window.fbq) {
          window.fbq('init', config.pixelId);
      }
      
      // Fire Standard PageView via our unified tracker for CAPI support
      trackEvent('PageView');
    }
  }, [isLoaded, config.pixelId, searchParams]); // Fire on route change too if we want

  if (!isLoaded || !config.pixelId) return null;

  return (
    <div>
      <Script
        id="fb-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
          `,
        }}
      />
    </div>
  );
};

export default FacebookPixel;
