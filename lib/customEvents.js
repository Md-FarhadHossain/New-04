import { trackEvent } from './tracker';

export const checkAndFireCustomEvents = (config) => {
    if (typeof window === 'undefined') return;

    const stats = JSON.parse(localStorage.getItem('pys_user_stats') || '{"orders_count": 0, "ltv": 0, "last_order_date": null}');
    
    // Logic from PixelYourSite (simplified)
    // 1. FirstTimeBuyer - usually fired on Purchase if it's the first.
    // However, the user request lists them as events to send.
    // We will fire them on PageView if they apply to the current user state *before* this session?
    // Or maybe we treat them as "Signals" to add to every event?
    // The user request says: "ReturningCustomer Event Send the event to Facebook". implies a standalone event.
    
    if (stats.orders_count > 0) {
        trackEvent('ReturningCustomer');
    } else {
        // FirstTimeBuyer is usually a status, not an event fired on every page view. 
        // But we can fire it on visit? No, that's weird. 
        // We'll leave FirstTimeBuyer for the Purchase Moment.
    }

    // VIPClient
    if (stats.orders_count >= 5 || stats.ltv >= 20000) { // Example thresholds
        trackEvent('VIPClient');
    }

    // BigWhale
    if (stats.ltv >= 50000) {
        trackEvent('BigWhale');
    }

    // FrequentShopper
    if (stats.orders_count >= 3) {
        trackEvent('FrequentShopper');
    }
};

export const updateStats = (orderValue) => {
    const stats = JSON.parse(localStorage.getItem('pys_user_stats') || '{"orders_count": 0, "ltv": 0}');
    stats.orders_count += 1;
    stats.ltv += parseFloat(orderValue);
    localStorage.setItem('pys_user_stats', JSON.stringify(stats));
};
