"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useAdmin } from "../context/AdminContext";
import { trackEvent } from "../../lib/tracker";
import { useRouter, useSearchParams } from "next/navigation";

import { Suspense } from "react";

function CheckoutContent() {
    const { config, isLoaded } = useAdmin();
    const router = useRouter();
    const searchParams = useSearchParams();
    const qty = parseInt(searchParams.get("qty") || "1");

    const [form, setForm] = useState({
        fn: "",
        ln: "",
        em: "",
        ph: "",
        addr: "",
        city: "",
        zip: "",
        country: "Bangladesh"
    });

    const subtotal = isLoaded ? parseFloat(config.productPrice) * qty : 0;

    // Fire InitiateCheckout on Mount
    useEffect(() => {
        if(isLoaded && config.pixelId) {
            trackEvent("InitiateCheckout", {
                content_type: "product",
                content_ids: ["PRODUCT_123"],
                content_name: "Premium Wireless Headphones",
                num_items: qty,
                subtotal: subtotal,
                value: subtotal,
                currency: config.currency,
                category_name: "Electronics",
                contents: [{id: "PRODUCT_123", quantity: qty}],
                // Extra Params
                post_id: "PRODUCT_123",
                post_type: "product",
                tags: "headphones, wireless, premium",
                user_role: "guest",
                landing_page: window.location.href,
            });
        }
    }, [isLoaded, config, qty, subtotal]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setForm({...form, [e.target.name]: e.target.value});
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        // Save Order Data for Thank You Page (Purchase Event)
        const orderData = {
            id: "ORD-" + Math.floor(Math.random() * 100000),
            ...form,
            qty,
            total: subtotal + 50, // + Shipping
            tax: 0,
            shipping: 50,
            items: [{id: "PRODUCT_123", quantity: qty, price: parseFloat(config.productPrice)}]
        };

        localStorage.setItem("last_order", JSON.stringify(orderData));

        // Fire AddPaymentInfo (Optional but good practice)
        trackEvent("AddPaymentInfo", {
             value: subtotal,
             currency: config.currency,
             content_ids: ["PRODUCT_123"],
             contents: [{id: "PRODUCT_123", quantity: qty}]
        });

        router.push("/thank-you");
    };

    if(!isLoaded) return <div className="p-8 text-center">Loading Checkout...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Checkout</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Order Summary */}
                    <div className="bg-white p-6 rounded-xl shadow-lg h-fit">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Order Summary</h2>
                        <div className="flex justify-between items-center py-2 border-b">
                            <span>Premium Wireless Headphones x {qty}</span>
                            <span className="font-medium">{config.currency} {subtotal}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                            <span>Shipping</span>
                            <span>{config.currency} 50</span>
                        </div>
                         <div className="flex justify-between items-center py-4 text-xl font-bold text-blue-600">
                            <span>Total</span>
                            <span>{config.currency} {subtotal + 50}</span>
                        </div>
                    </div>

                    {/* Billing Details */}
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                         <h2 className="text-xl font-semibold mb-6 text-gray-800">Billing Details</h2>
                         <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                                    <input required name="fn" onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                    <input required name="ln" onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                                <input required type="email" name="em" onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Phone</label>
                                <input required type="tel" name="ph" onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
                            </div>

                             <div>
                                <label className="block text-sm font-medium text-gray-700">Address</label>
                                <input required name="addr" onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">City</label>
                                    <input required name="city" onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Zip Code</label>
                                    <input required name="zip" onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
                                </div>
                            </div>
                            
                            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition mt-6 shadow-md hover:shadow-lg">
                                Place Order
                            </button>
                         </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center">Loading Checkout...</div>}>
            <CheckoutContent />
        </Suspense>
    );
}
