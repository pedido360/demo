"use client";

import { CartProvider } from "@/context/CartContext";
import RestaurantContent from "./RestaurantContent";

import { RestaurantPageData } from "@/types/restaurant-page";

interface RestaurantAppProps {
    data: RestaurantPageData;
}

export default function RestaurantApp({
    data,
}: RestaurantAppProps) {
    return (
        <CartProvider>
            <main className="min-h-screen bg-gray-100">
                <div className="relative mx-auto min-h-screen max-w-md overflow-hidden bg-white shadow-xl">
                    <RestaurantContent
                        data={data}
                    />
                </div>
            </main>
        </CartProvider>
    );
}