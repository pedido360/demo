"use client";

import { X } from "lucide-react";

import { useCart } from "@/hooks/useCart";

import CartItem from "./CartItem";

interface CartDrawerProps {
    open: boolean;
    onClose: () => void;
}

export default function CartDrawer({
    open,
    onClose,
}: CartDrawerProps) {

    const {
        items,
        totalPrice,
        removeFromCart,
    } = useCart();

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50">

            {/* Overlay */}

            <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
            />

            {/* Drawer */}

            <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">

                <header className="flex items-center justify-between border-b p-5">

                    <h2 className="text-2xl font-bold">
                        🛒 Mi Pedido
                    </h2>

                    <button
                        onClick={onClose}
                        className="rounded-full p-2 hover:bg-gray-100"
                    >
                        <X size={24} />
                    </button>

                </header>

                <div className="flex-1 overflow-y-auto p-5">

                    {items.length === 0 ? (

                        <div className="text-center text-gray-500 mt-20">

                            <p className="text-lg font-medium">
                                Tu carrito está vacío.
                            </p>

                        </div>

                    ) : (

                        <div className="space-y-4">

                            {items.map((item, index) => (

                                <CartItem
                                    key={index}
                                    item={item}
                                    index={index}
                                    onRemove={removeFromCart}
                                />

                            ))}

                        </div>

                    )}

                </div>

                <footer className="border-t p-5">

                    <div className="flex justify-between text-lg font-bold mb-4">

                        <span>Total</span>

                        <span className="text-red-600">
                            ${totalPrice.toLocaleString("es-CO")}
                        </span>

                    </div>

                    <button
                        className="w-full rounded-2xl bg-green-600 py-4 font-bold text-white transition hover:bg-green-700"
                    >
                        Continuar por WhatsApp
                    </button>

                </footer>

            </div>

        </div>
    );
}