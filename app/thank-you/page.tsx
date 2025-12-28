"use client";

import { useEffect, useState } from "react";
import { useAdmin } from "../context/AdminContext";
import { trackEvent } from "../../lib/tracker";
import { updateStats } from "../../lib/customEvents";
import Link from "next/link";


interface Order {
    id: string;
    total: number;
    qty: number;
    shipping: number;
    tax: number;
    items: any[];
    fn: string;
    ln: string;
    em: string;
    ph: string;
    city: string;
    zip: string;
    country: string;
}

export default function ThankYouPage() {
    const { config, isLoaded } = useAdmin();
    const [order, setOrder] = useState<Order | null>(null);

    useEffect(() => {
        const storedOrder = localStorage.getItem("last_order");
        if(storedOrder) {
            const parsedOrder = JSON.parse(storedOrder);
            setOrder(parsedOrder);
            
            const trackedOrders = JSON.parse(localStorage.getItem("tracked_orders") || "[]");
            if(isLoaded && config.pixelId && !trackedOrders.includes(parsedOrder.id)) {
                
                // Get Stats BEFORE this purchase to calculate predicted LTV etc? 
                // Or AFTER? Typically "transactions_count" includes this one.
                const stats = JSON.parse(localStorage.getItem('pys_user_stats') || '{"orders_count": 0, "ltv": 0}');
                const newCount = stats.orders_count + 1;
                const newLtv = stats.ltv + parsedOrder.total;
                const avgOrder = newCount > 0 ? (newLtv / newCount).toFixed(2) : 0;

                // Fire Purchase Event with Extended Data
                trackEvent("Purchase", {
                    // Standard
                    value: parsedOrder.total,
                    currency: config.currency,
                    content_type: "product",
                    content_ids: ["PRODUCT_123"],
                    contents: parsedOrder.items,
                    num_items: parsedOrder.qty,
                    order_id: parsedOrder.id,
                    
                    // User Request Specific
                    category_name: "Electronics", // Mock
                    coupon_used: "no",
                    shipping: parsedOrder.shipping,
                    shipping_cost: parsedOrder.shipping,
                    tax: parsedOrder.tax,
                    total: parsedOrder.total, // Same as value usually
                    
                    // Extended Data for "More Data"
                    external_id: parsedOrder.id, // User ID if logged in, or Order ID if not
                    payment_method: "cash_on_delivery", // Example
                    shipping_method: "flat_rate", // Example
                    status: "processing",
                    
                    // PixelYourSite typical extras
                    f5first: "no",
                    f5last: "no",
                    
                    // User Stats
                    transactions_count: newCount,
                    width: 0, // ??
                    average_order: avgOrder,
                    predicted_ltv: newLtv, // Simple prediction: LTV is current LTV
                    
                    // User Data for Advanced Matching
                    userData: {
                        fn: parsedOrder.fn,
                        ln: parsedOrder.ln,
                        em: parsedOrder.em,
                        ph: parsedOrder.ph,
                        ct: parsedOrder.city,
                        st: "",
                        country: "bd", 
                        zp: parsedOrder.zip,
                        external_id: parsedOrder.id, // For Advanced Matching
                    }
                });
                
                // Update User Stats
                updateStats(parsedOrder.total);

                trackedOrders.push(parsedOrder.id);
                localStorage.setItem("tracked_orders", JSON.stringify(trackedOrders));
            }
        }
    }, [isLoaded, config]);

    if(!order) return <div className="p-10 text-center">Loading Order...</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                 {/* ... UI same as before ... */}
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Order Confirmed!</h2>
                <p className="text-gray-500 mb-8">Order <span className="font-bold">#{order.id}</span></p>
                <Link href="/" className="text-blue-600 hover:underline">Continue Shopping</Link>
            </div>
        </div>
    );
}
