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
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full bg-red-600 px-5 py-3 text-white shadow-xl transition hover:bg-red-700"
        >
            <ShoppingCart size={22} />

            <span className="font-semibold">
                {totalItems}
            </span>
        </button>
    );
}