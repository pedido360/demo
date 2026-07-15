"use client";

import { ProductSelection } from "@/types/product";
import { Trash2 } from "lucide-react";

interface CartItemProps {
    item: ProductSelection;
    index: number;
    onRemove: (index: number) => void;
}

export default function CartItem({
    item,
    index,
    onRemove,
}: CartItemProps) {

    const subtotal = item.product.price * item.quantity;

    return (
        <article className="rounded-2xl border border-gray-200 bg-white p-4">

            <div className="flex items-start justify-between">

                <div>

                    <h3 className="font-bold">
                        {item.product.name}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                        Cantidad: {item.quantity}
                    </p>

                    {item.notes && (
                        <p className="mt-2 text-sm italic text-gray-500">
                            "{item.notes}"
                        </p>
                    )}

                </div>

                <button
                    onClick={() => onRemove(index)}
                    className="text-red-600 transition hover:text-red-700"
                >
                    <Trash2 size={20} />
                </button>

            </div>

            <div className="mt-4 flex justify-between border-t pt-3">

                <span className="font-medium">
                    Subtotal
                </span>

                <span className="font-bold text-red-600">
                    ${subtotal.toLocaleString("es-CO")}
                </span>

            </div>

        </article>
    );
}