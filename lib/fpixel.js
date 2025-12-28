export const FB_PIXEL_ID = ''; // Will be loaded dynamically

export const pageview = (pixelId) => {
  if (typeof window !== 'undefined') {
    window.fbq('track', 'PageView');
  }
};

// https://developers.facebook.com/docs/facebook-pixel/advanced/
export const event = (name, options = {}, pixelId) => {
  if (typeof window !== 'undefined') {
    // If pixelId is provided, we might need to ensuring init (usually handled globally)
    // But for this dynamic setup, we assume init was called in FacebookPixel component.
    
    // Check if standard event or custom
    const standardEvents = [
      'AddPaymentInfo', 'AddToCart', 'AddToWishlist', 'CompleteRegistration',
      'Contact', 'CustomizeProduct', 'Donate', 'FindLocation', 'InitiateCheckout',
      'Lead', 'Purchase', 'Schedule', 'Search', 'StartTrial', 'SubmitApplication',
      'Subscribe', 'ViewContent', 'ViewCategory'
    ];

    if (standardEvents.includes(name)) {
      window.fbq('track', name, options);
    } else {
      window.fbq('trackCustom', name, options);
    }
  }
};
