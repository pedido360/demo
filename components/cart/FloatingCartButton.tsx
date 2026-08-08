"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/useCart";

interface FloatingCartButtonProps {
    onClick: () => void;
}

export default function FloatingCartButton({
    onClick,
}: FloatingCartButtonProps) {

    const { totalItems } = useCart();

    if (totalItems === 0) return null;

    return (
        <button
            onClick={onClick}
            className="
                fixed
                bottom-6
                right-6
                z-50
                flex
                items-center
                gap-3
                rounded-full
                bg-red-600
                px-5
                py-3
                text-white
                shadow-2xl
                transition-all
                duration-300
                hover:scale-105
                hover:bg-red-700
                animate-cart-attention
            "
        >
            <ShoppingCart size={22} />

            <span className="font-semibold whitespace-nowrap">
                Ver mi pedido
            </span>

            <span
                className="
                    flex
                    h-7
                    min-w-7
                    items-center
                    justify-center
                    rounded-full
                    bg-red-800
                    px-2
                    text-sm
                    font-bold
                "
            >
                {totalItems}
            </span>
        </button>
    );
}