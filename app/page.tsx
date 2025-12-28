"use client";

import { useEffect, useState, useRef } from "react";
import { useAdmin } from "./context/AdminContext";
import { trackEvent } from "../lib/tracker";
import { checkAndFireCustomEvents } from "../lib/customEvents";
import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  const { config, isLoaded } = useAdmin();
  const [qty, setQty] = useState(1);
  const scrollTracked = useRef(new Set());
  const maxScroll = useRef(0);
  
  // -- 1. PageView & Custom Events on Mount --
  useEffect(() => {
    if (isLoaded && config.pixelId) {
       // Custom Events (BigWhale, etc.)
       checkAndFireCustomEvents(config);
    }
  }, [isLoaded, config]);

  // -- 2. ViewContent on Mount (Product Page) --
  useEffect(() => {
    if (isLoaded && config.pixelId) {
        trackEvent("ViewContent", {
            content_type: "product",
            content_ids: ["PRODUCT_123"],
            content_name: "Premium Wireless Headphones",
            category_name: "Electronics",
            value: parseFloat(config.productPrice),
            currency: config.currency,
            // Extra Params
            post_id: "PRODUCT_123",
            post_type: "product",
            tags: "headphones, wireless, premium",
        });
    }
  }, [isLoaded, config]);

  // -- 3. TimeOnPage (every 5s, 10s, 30s...) --
  const timeOnPageTracked = useRef(new Set());
  useEffect(() => {
    if(!isLoaded || !config.pixelId) return;

    const timers = [5, 10, 30, 60, 120];
    const timeouts = timers.map(seconds => 
        setTimeout(() => {
            if (!timeOnPageTracked.current.has(seconds)) {
                timeOnPageTracked.current.add(seconds);
                trackEvent("TimeOnPage", {
                    seconds: seconds,
                    event_url: window.location.href
                });
            }
        }, seconds * 1000)
    );

    return () => timeouts.forEach(clearTimeout);
  }, [isLoaded, config.pixelId]); // Depend ONLY on ID, not full config object to prevent resets

  // -- 4. PageScroll (10%, 25%, 50%, 75%, 90%) --
  useEffect(() => {
    if(!isLoaded || !config.pixelId) return;

    const handleScroll = () => {
        const scrollTop = window.scrollY;
        const winHeight = window.innerHeight;
        const docHeight = document.documentElement.scrollHeight;
        const totalDocScrollLength = docHeight - winHeight;
        const scrollPercent = Math.floor((scrollTop / totalDocScrollLength) * 100);

        if(scrollPercent > maxScroll.current) {
            maxScroll.current = scrollPercent;
        }

        [10, 25, 50, 75, 90].forEach(p => {
             if(maxScroll.current >= p && !scrollTracked.current.has(p)) {
                 scrollTracked.current.add(p);
                 trackEvent("PageScroll", {
                     scroll_percent: p,
                     event_url: window.location.href
                 });
             }
        });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoaded, config]);


  const handleAddToCart = () => {
    trackEvent("AddToCart", {
        content_type: "product",
        content_ids: ["PRODUCT_123"],
        content_name: "Premium Wireless Headphones",
        value: parseFloat(config.productPrice) * qty,
        currency: config.currency,
        contents: [{ id: "PRODUCT_123", quantity: qty }],
        // Extra Params
        post_id: "PRODUCT_123",
        post_type: "product",
        tags: "headphones, wireless, premium",
        category_name: "Electronics",
    });
    alert("Added to Cart!");
  };

  const productPrice = isLoaded ? config.productPrice : "...";

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
                <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                    StoreName
                </div>
                <div className="space-x-4">
                    <Link href="/admin" className="text-gray-500 hover:text-gray-900">Admin</Link>
                </div>
            </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
            
            {/* Product Image */}
            <div className="relative h-96 w-full bg-gray-200 rounded-2xl overflow-hidden shadow-lg mb-8 lg:mb-0 transform hover:scale-105 transition-transform duration-300">
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                   {/* Placeholder if no image */}
                   <span className="text-4xl">🎧</span>
                </div>
                {/* Real Usage: <Image src="/path/to/img" fill ... /> */}
            </div>

            {/* Product Details */}
            <div>
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
                    Premium Wireless Headphones
                </h1>
                <p className="text-lg text-gray-500 mb-6">
                    Experience crystal clear sound with our latest noise-cancelling technology. Perfect for audiophiles and professionals alike.
                </p>

                <div className="flex items-center mb-6">
                    <span className="text-3xl font-bold text-gray-900 mr-4">
                        {config.currency} {productPrice}
                    </span>
                    <span className="text-sm text-green-500 bg-green-100 px-2 py-1 rounded">
                        In Stock
                    </span>
                </div>

                <div className="flex items-center space-x-4 mb-8">
                    <div className="flex items-center border rounded-lg">
                        <button onClick={() => setQty(Math.max(1, qty-1))} className="px-3 py-2 text-gray-600 hover:bg-gray-100">-</button>
                        <span className="px-3 py-2 font-medium">{qty}</span>
                        <button onClick={() => setQty(qty+1)} className="px-3 py-2 text-gray-600 hover:bg-gray-100">+</button>
                    </div>
                </div>

                <div className="flex space-x-4">
                    <button 
                        onClick={handleAddToCart}
                        className="flex-1 bg-white border border-gray-300 text-gray-700 font-bold py-3 px-6 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                    >
                        Add to Cart
                    </button>
                    <Link 
                        href={`/checkout?qty=${qty}`}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl text-center transform hover:-translate-y-0.5 transition-all"
                    >
                        Buy Now
                    </Link>
                </div>
            </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-8 mt-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
              <p>&copy; 2024 StoreName. All rights reserved.</p>
          </div>
      </footer>
    </div>
  );
}
