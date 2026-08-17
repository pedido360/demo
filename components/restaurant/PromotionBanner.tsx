"use client";

import { useEffect, useState } from "react";

import { Product, ProductSelection } from "@/types/product";

import { useCart } from "@/hooks/useCart";

import {
    isWednesdayPromotionActive,
} from "@/lib/utils/isWednesdayPromotionActive";

interface PromotionBannerProps {
    product: Product;
}

export default function PromotionBanner({
    product,
}: PromotionBannerProps) {

    const { addToCart } =
        useCart();

    const [active, setActive] =
        useState(
            isWednesdayPromotionActive()
        );

    useEffect(() => {

        function updatePromotionStatus() {
            setActive(
                isWednesdayPromotionActive()
            );
        }

        updatePromotionStatus();

        const interval =
            window.setInterval(
                updatePromotionStatus,
                60 * 1000
            );

        return () =>
            window.clearInterval(
                interval
            );

    }, []);

    function handlePromotion() {

        if (
            !isWednesdayPromotionActive()
        ) {
            alert(
                "⏰ Esta promoción está disponible los miércoles después de las 2:00 P.M. No está disponible en enero ni diciembre."
            );

            return;
        }

        const selection: ProductSelection = {
            product,
            quantity: 1,
            ingredients: [],
            extras: [],
        };

        addToCart(selection);

        alert(
            "🔥 ¡Promoción agregada a tu pedido!"
        );
    }

    return (
        <section className="mx-auto mt-8 max-w-2xl px-5">

            <div
                className={`relative overflow-hidden rounded-3xl p-1 shadow-lg ${active
                    ? "bg-gradient-to-r from-orange-500 via-red-500 to-orange-500"
                    : "bg-gradient-to-r from-orange-300 via-amber-400 to-orange-300"
                    }`}
            >

                <div className="relative overflow-hidden rounded-[1.35rem] bg-white">

                    <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-orange-100 opacity-70" />

                    <div className="pointer-events-none absolute -bottom-16 -left-10 h-32 w-32 rounded-full bg-red-100 opacity-60" />

                    <div className="relative p-6 sm:p-8">

                        <div className="flex justify-center">

                            <span
                                className={`rounded-full px-4 py-2 text-xs font-extrabold tracking-wide ${active
                                    ? "bg-red-100 text-red-700"
                                    : "bg-orange-100 text-orange-700"
                                    }`}
                            >
                                {active
                                    ? "🔥 ACTIVA AHORA"
                                    : "🔥 PROMOCIÓN ESPECIAL"}
                            </span>

                        </div>

                        <h2 className="mt-4 text-center text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
                            {product.name}
                        </h2>

                        {product.image && (
                            <div className="mt-5 overflow-hidden rounded-2xl">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="h-52 w-full object-cover sm:h-64"
                                />
                            </div>
                        )}

                        <div className="mt-4 text-center">

                            <span className="text-sm font-semibold text-gray-500">
                                POR SOLO
                            </span>

                            <div
                                className={`mt-1 text-4xl font-black sm:text-5xl ${active
                                    ? "text-red-600"
                                    : "text-orange-600"
                                    }`}
                            >
                                ${product.price.toLocaleString("es-CO")}
                            </div>

                        </div>

                        <div className="mx-auto mt-6 max-w-md rounded-2xl bg-gray-50 p-5 text-center">

                            <p className="text-sm font-bold leading-6 text-gray-800 sm:text-base">
                                {product.description}
                            </p>

                        </div>

                        <div className="mt-5 text-center">

                            <p className="text-sm font-semibold text-gray-600">
                                🕑 Todos los miércoles después de las 2:00 P.M.
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                                No disponible en enero ni diciembre.
                            </p>

                        </div>

                        <div
                            className={`mx-auto mt-5 max-w-md rounded-2xl px-5 py-4 text-center ${active
                                ? "bg-green-50"
                                : "bg-orange-50"
                                }`}
                        >

                            <p
                                className={`font-bold ${active
                                    ? "text-green-700"
                                    : "text-orange-700"
                                    }`}
                            >
                                {active
                                    ? "🟢 PROMOCIÓN ACTIVA"
                                    : "⏰ Disponible los miércoles después de las 2:00 P.M."}
                            </p>

                        </div>

                        <button
                            type="button"
                            onClick={handlePromotion}
                            disabled={!active}
                            className={`mt-6 w-full rounded-2xl py-4 text-base font-extrabold text-white shadow-md transition ${active
                                ? "bg-red-600 hover:bg-red-700 active:scale-[0.99]"
                                : "cursor-not-allowed bg-gray-300"
                                }`}
                        >
                            {active
                                ? "🛒 PEDIR PROMOCIÓN"
                                : "⏰ PROMOCIÓN NO DISPONIBLE"}
                        </button>

                    </div>

                </div>

            </div>

        </section>
    );
}