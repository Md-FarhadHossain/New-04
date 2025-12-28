import * as fpixel from './fpixel';

// Helper to get formatted date
const getEventTime = () => {
    const now = new Date();
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    
    return {
        event_day: days[now.getDay()],
        event_hour: now.getHours(),
        event_month: months[now.getMonth()],
    };
};

export const trackEvent = async (eventName, params = {}) => {
    // 1. Load Config
    const config = JSON.parse(localStorage.getItem('fb_pixel_config') || '{}');
    if (!config.pixelId) {
        // console.warn("Pixel ID not set"); // Silent fail if not configured
        return;
    }

    // 2. Gather User Stats (for LTV, Order Counts etc. if needed globally, but mostly for Purchase)
    // We don't necessarily send LTV on every PageView, usually just on specific events or Purchase.
    // But PYS might send user_role, etc. everywhere.
    
    // Retrieve Cached User Data (if available from previous checkout)
    const cachedUserData = JSON.parse(localStorage.getItem('user_data_cache') || '{}');
    
    // 3. Generate Deduplication ID (Event ID)
    const eventId = params.eventID || crypto.randomUUID();

    // 4. Construct Common Parameters
    const commonParams = {
        // --- Requested Custom Parameters ---
        // event_day, event_hour, event_month
        ...getEventTime(),
        
        event_url: window.location.href,
        landing_page: params.landing_page || window.location.href, 
        
        page_title: document.title,
        post_id: params.post_id || '123', // Mock ID for Next.js pages
        post_type: params.post_type || 'page',
        
        traffic_source: document.referrer || 'direct',
        user_role: 'guest', // In a real app, read from auth context
        
        // Include eventID for Browser Pixel Deduplication
        eventID: eventId,
        
        // Frame (Device Type)
        frame: getDeviceFrame(),

        // Merge passed params (overwrites defaults)
        ...params,
        
        // Merge User Data (Priority: Params > Cache)
        userData: {
            ...cachedUserData,
            ...(params.userData || {})
        }
    };

    // 5. Fire Frontend Pixel
    // Note: fbq('track', ...) only accepts standard properties for Standard Events unless we use 'trackCustom'?
    // Actually PYS sends these as properties even for Standard events. FB Pixel allows extra object properties.
    fpixel.event(eventName, commonParams, config.pixelId);

    // 6. Fire Server-Side API (CAPI)
    if (config.accessToken) {
        try {
            // eventId is already generated above
            
            const fbp = getCookie('_fbp');
            const fbc = getCookie('_fbc');
            
            // Separate User Data (hashed) from Custom Data
            const { userData, ...restParams } = commonParams;

            await fetch('/api/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventName,
                    eventSourceUrl: window.location.href,
                    eventId,
                    userData: {
                        fbp,
                        fbc,
                        ...(userData || {}) 
                    },
                    customData: restParams, // Send all properties as custom_data
                    config
                })
            });
        } catch (e) {
            console.error("CAPI Error:", e);
        }
    }
};

function getCookie(name) {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

function getDeviceFrame() {
    if (typeof navigator === 'undefined') return 'unknown';
    const ua = navigator.userAgent;
    if (/android/i.test(ua)) return 'Android';
    if (/iPad|iPhone|iPod/.test(ua)) return 'iOS';
    if (/windows/i.test(ua)) return 'Windows';
    if (/mac os/i.test(ua)) return 'Mac';
    if (/linux/i.test(ua)) return 'Linux';
    return 'Desktop';
}
