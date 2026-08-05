"use client";

import {
    ChevronRight,
    Image as ImageIcon,
    AlertTriangle,
} from "lucide-react";

import { Product } from "@/types/product";

interface ProductRowProps {
    product: Product;
    onClick: () => void;
    onToggle: (id: string) => void;
}

export default function ProductRow({
    product,
    onClick,
    onToggle,
}: ProductRowProps) {

    const warnings: string[] = [];

    if (!product.image) {
        warnings.push("Sin imagen");
    }

    if (!product.ingredients?.length) {
        warnings.push("Sin ingredientes");
    }

    if (!product.extras?.length) {
        warnings.push("Sin extras");
    }

    return (

        <div className="rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-green-500 hover:bg-green-50">

            <div className="flex items-start justify-between">

                <div className="flex flex-1 gap-4">

                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-100">

                        {product.image ? (

                            <img
                                src={product.image}
                                alt={product.name}
                                className="h-full w-full object-cover"
                            />

                        ) : (

                            <ImageIcon
                                size={28}
                                className="text-gray-400"
                            />

                        )}

                    </div>

                    <div className="min-w-0 flex-1">

                        <button
                            type="button"
                            onClick={onClick}
                            className="text-left"
                        >

                            <h3
                                className={
                                    product.isAvailable
                                        ? "truncate font-semibold text-gray-900"
                                        : "truncate font-semibold text-gray-500"
                                }
                            >
                                {product.name}
                            </h3>

                        </button>

                        <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                            {product.description}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-500">

                            <span>
                                🥬 {product.ingredients?.length ?? 0}
                            </span>

                            <span>
                                ➕ {product.extras?.length ?? 0}
                            </span>

                        </div>

                        <p className="mt-2 font-bold text-green-700">
                            ${product.price.toLocaleString()}
                        </p>

                        {warnings.length > 0 && (

                            <div className="mt-3 flex items-center gap-2 text-xs text-orange-600">

                                <AlertTriangle size={14} />

                                <span>
                                    {warnings.join(" • ")}
                                </span>

                            </div>

                        )}

                    </div>

                </div>

                <div className="ml-4 flex flex-col items-end gap-3">

                    <button
                        type="button"
                        onClick={() => onToggle(product.id)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${product.isAvailable
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                            }`}
                    >
                        {product.isAvailable
                            ? "🟢 Activo"
                            : "⚪ Inactivo"}
                    </button>

                    <button
                        type="button"
                        onClick={onClick}
                        className="rounded-lg p-1 hover:bg-gray-200"
                    >
                        <ChevronRight
                            size={20}
                            className="text-gray-400"
                        />
                    </button>

                </div>

            </div>

        </div>

    );

}