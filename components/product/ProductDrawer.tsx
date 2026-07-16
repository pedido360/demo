"use client";

import { useEffect, useState } from "react";

import { Product, ProductSelection } from "@/types/product";

import QuantitySelector from "@/components/product/QuantitySelector";

interface ProductDrawerProps {
    product: Product | null;
    open: boolean;
    onClose: () => void;
    onAdd: (selection: ProductSelection) => void;
}

export default function ProductDrawer({
    product,
    open,
    onClose,
    onAdd,
}: ProductDrawerProps) {
    const [mounted, setMounted] = useState(false);

    const [quantity, setQuantity] = useState(1);

    const [notes, setNotes] = useState("");

    useEffect(() => {
        if (open) {
            requestAnimationFrame(() => setMounted(true));

            document.body.style.overflow = "hidden";

            setQuantity(1);
            setNotes("");
        } else {
            setMounted(false);
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    if (!product) return null;

    const total = product.price * quantity;

    function handleAdd() {

        if (!product) return;

        onAdd({
            product,
            quantity,
            ingredients: [],
            extras: [],
            notes,
        });

        onClose();
    }

    return (
        <div
            className={`fixed inset-0 z-50 ${open ? "pointer-events-auto" : "pointer-events-none"
                }`}
        >
            {/* Overlay */}

            <div
                onClick={onClose}
                className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${mounted ? "opacity-100" : "opacity-0"
                    }`}
            />

            {/* Drawer */}

            <div
                className={`absolute bottom-0 left-1/2 w-full max-w-md -translate-x-1/2 rounded-t-3xl bg-white shadow-2xl transition-transform duration-300 ${mounted ? "translate-y-0" : "translate-y-full"
                    }`}
            >
                <div className="flex justify-center py-3">
                    <div className="h-1.5 w-14 rounded-full bg-gray-300" />
                </div>

                <div className="flex max-h-[85vh] flex-col">
                    <div className="flex-1 overflow-y-auto px-6 pb-6">
                        <div className="mb-6 flex justify-center">

                            <img
                                src={product.image}
                                alt={product.name}
                                className="h-40 w-40 rounded-3xl object-cover"
                            />

                        </div>

                        <h2 className="text-center text-2xl font-bold">
                            {product.name}
                        </h2>

                        <p className="mt-2 text-center text-xl font-bold text-red-600">
                            ${product.price.toLocaleString("es-CO")}
                        </p>

                        <p className="mt-4 text-center text-gray-500">
                            {product.description}
                        </p>

                        <div className="mt-8">
                            <QuantitySelector
                                quantity={quantity}
                                onDecrease={() =>
                                    setQuantity((q) => Math.max(1, q - 1))
                                }
                                onIncrease={() =>
                                    setQuantity((q) => q + 1)
                                }
                            />
                        </div>

                        <div className="mt-8">
                            <label className="mb-2 block font-semibold">
                                Observaciones
                            </label>

                            <textarea
                                rows={4}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Ej: Sin cebolla..."
                                className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-red-500"
                            />
                        </div>
                    </div>

                    <div className="border-t bg-white p-5">
                        <div className="mb-3 flex items-center justify-between">
                            <span className="font-semibold">
                                Total
                            </span>

                            <span className="text-xl font-bold text-red-600">
                                ${total.toLocaleString("es-CO")}
                            </span>
                        </div>

                        <button
                            onClick={handleAdd}
                            className="w-full rounded-2xl bg-red-600 py-4 font-bold text-white transition hover:bg-red-700"
                        >
                            Agregar al pedido
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}