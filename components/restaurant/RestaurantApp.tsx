"use client";

import { CartProvider } from "@/context/CartContext";
import RestaurantContent from "./RestaurantContent";

export default function RestaurantApp() {
    return (
        <CartProvider>
            <main className="min-h-screen bg-gray-100">
                <div className="relative mx-auto min-h-screen max-w-md overflow-hidden bg-white shadow-xl">
                    <RestaurantContent />
                </div>
            </main>
        </CartProvider>
    );
}