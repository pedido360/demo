"use client";

import Image from "next/image";
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

    const [selectedExtras, setSelectedExtras] =
        useState<string[]>([]);

    const [selectedVariantId, setSelectedVariantId] =
        useState<string>("");

    useEffect(() => {
        if (open) {
            requestAnimationFrame(() => setMounted(true));

            document.body.style.overflow = "hidden";

            setQuantity(1);

            setNotes("");

            setSelectedExtras([]);

            setSelectedVariantId(
                product?.variants?.find(
                    variant => variant.isDefault
                )?.id ??
                product?.variants?.[0]?.id ??
                ""
            );
        } else {
            setMounted(false);
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    if (!product) return null;

    const selectedVariant =
        product.variants?.find(
            variant =>
                variant.id === selectedVariantId
        );

    const productPrice =
        selectedVariant?.price ??
        product.price;

    const extrasTotal =
        (product.extras ?? [])
            .filter(extra =>
                selectedExtras.includes(extra.id)
            )
            .reduce(
                (total, extra) =>
                    total + extra.price,
                0
            );

    const total =
        (productPrice + extrasTotal)
        * quantity;

    function handleAdd() {

        if (!product) return;

        const selectedExtraObjects =
            (product.extras ?? []).filter(
                extra =>
                    selectedExtras.includes(
                        extra.id
                    )
            );

        onAdd({

            product,

            variant: selectedVariant,

            quantity,

            ingredients:
                product.ingredients ?? [],

            extras:
                selectedExtraObjects,

            notes,

        });

        onClose();

    }

    return (
        <div
            className={`fixed inset-0 z-50 ${open
                    ? "pointer-events-auto"
                    : "pointer-events-none"
                }`}
        >

            {/* Overlay */}

            <div
                onClick={onClose}
                className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${mounted
                        ? "opacity-100"
                        : "opacity-0"
                    }`}
            />

            {/* Drawer */}

            <div
                className={`absolute bottom-0 left-1/2 w-full max-w-md -translate-x-1/2 rounded-t-3xl bg-white shadow-2xl transition-transform duration-300 ${mounted
                        ? "translate-y-0"
                        : "translate-y-full"
                    }`}
            >

                <div className="flex justify-center py-3">
                    <div className="h-1.5 w-14 rounded-full bg-gray-300" />
                </div>

                <div className="flex max-h-[85vh] flex-col">

                    <div className="flex-1 overflow-y-auto px-6 pb-6">

                        {/* Imagen del producto */}

                        <div className="mb-6 flex justify-center">

                            <div className="relative h-40 w-40 overflow-hidden rounded-3xl">

                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    sizes="160px"
                                    className="object-cover"
                                />

                            </div>

                        </div>

                        <h2 className="text-center text-2xl font-bold">
                            {product.name}
                        </h2>

                        <p className="mt-2 text-center text-xl font-bold text-red-600">
                            ${productPrice.toLocaleString("es-CO")}
                        </p>

                        <p className="mt-4 text-center text-gray-500">
                            {product.description}
                        </p>

                        {/* Variantes */}

                        {(product.variants?.length ?? 0) > 0 && (

                            <div className="mt-8">

                                <h3 className="mb-3 text-lg font-semibold">
                                    Presentación
                                </h3>

                                <div className="space-y-3">

                                    {product.variants!
                                        .filter(variant => variant.isAvailable)
                                        .map(variant => (

                                            <label
                                                key={variant.id}
                                                className="
                                                    flex
                                                    cursor-pointer
                                                    items-center
                                                    justify-between
                                                    rounded-xl
                                                    border
                                                    p-4
                                                    transition
                                                    hover:border-red-500
                                                "
                                            >

                                                <div className="flex items-center gap-3">

                                                    <input
                                                        type="radio"
                                                        name="variant"
                                                        checked={
                                                            selectedVariantId ===
                                                            variant.id
                                                        }
                                                        onChange={() =>
                                                            setSelectedVariantId(
                                                                variant.id
                                                            )
                                                        }
                                                    />

                                                    <span>
                                                        {variant.label}
                                                    </span>

                                                </div>

                                                <span className="font-bold text-red-600">
                                                    ${variant.price.toLocaleString("es-CO")}
                                                </span>

                                            </label>

                                        ))}

                                </div>

                            </div>

                        )}

                        {/* Ingredientes */}

                        {(product.ingredients?.length ?? 0) > 0 && (

                            <div className="mt-8">

                                <h3 className="mb-3 text-lg font-semibold">
                                    Ingredientes
                                </h3>

                                <p className="text-gray-600 leading-6">

                                    {(product.ingredients ?? [])
                                        .filter(
                                            ingredient =>
                                                ingredient.isActive
                                        )
                                        .map(
                                            ingredient =>
                                                ingredient.name
                                        )
                                        .join(", ")}

                                </p>

                            </div>

                        )}

                        {/* Extras */}

                        {(product.extras?.length ?? 0) > 0 && (

                            <div className="mt-8">

                                <h3 className="mb-3 text-lg font-semibold">
                                    Extras
                                </h3>

                                <p className="mb-3 text-sm text-gray-500">
                                    ✨ Personaliza tu pedido seleccionando tus extras favoritos.
                                </p>

                                <div className="space-y-2">

                                    {product.extras!
                                        .filter(extra => extra.isActive)
                                        .map(extra => (

                                            <label
                                                key={extra.id}
                                                className="flex items-center justify-between"
                                            >

                                                <div className="flex items-center gap-3">

                                                    <input
                                                        type="checkbox"
                                                        checked={selectedExtras.includes(
                                                            extra.id
                                                        )}
                                                        onChange={(e) => {

                                                            if (
                                                                e.target.checked
                                                            ) {

                                                                setSelectedExtras(
                                                                    current => [
                                                                        ...current,
                                                                        extra.id,
                                                                    ]
                                                                );

                                                            } else {

                                                                setSelectedExtras(
                                                                    current =>
                                                                        current.filter(
                                                                            id =>
                                                                                id !==
                                                                                extra.id
                                                                        )
                                                                );

                                                            }

                                                        }}
                                                    />

                                                    <span>
                                                        {extra.name}
                                                    </span>

                                                </div>

                                                <span className="font-semibold text-red-600">
                                                    +${extra.price.toLocaleString("es-CO")}
                                                </span>

                                            </label>

                                        ))}

                                </div>

                            </div>

                        )}

                        {/* Cantidad */}

                        <div className="mt-8">

                            <QuantitySelector
                                quantity={quantity}
                                onDecrease={() =>
                                    setQuantity(
                                        q => Math.max(1, q - 1)
                                    )
                                }
                                onIncrease={() =>
                                    setQuantity(
                                        q => q + 1
                                    )
                                }
                            />

                        </div>

                        {/* Observaciones */}

                        <div className="mt-8">

                            <label className="mb-2 block font-semibold">
                                Observaciones
                            </label>

                            <textarea
                                rows={4}
                                value={notes}
                                onChange={(e) =>
                                    setNotes(e.target.value)
                                }
                                placeholder="Ej: Sin cebolla..."
                                className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-red-500"
                            />

                        </div>

                    </div>

                    {/* Botón inferior */}

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