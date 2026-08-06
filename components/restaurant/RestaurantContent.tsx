"use client";

import { useEffect, useState } from "react";

import { RestaurantPageData } from "@/types/restaurant-page";

import RestaurantHero from "./RestaurantHero";
import FeaturedProducts from "./FeaturedProducts";
import Categories from "./Categories";
import CallToAction from "./CallToAction";

import ProductGrid from "@/components/products/ProductGrid";

import FloatingCartButton from "@/components/cart/FloatingCartButton";
import CartDrawer from "@/components/cart/CartDrawer";
import PoweredBy from "./PoweredBy";

interface RestaurantContentProps {
    data: RestaurantPageData;
}

export default function RestaurantContent({
    data,
}: RestaurantContentProps) {

    const [selectedCategory, setSelectedCategory] =
        useState("");

    const [cartOpen, setCartOpen] =
        useState(false);
    useEffect(() => {

        if (
            data.categories.length > 0 &&
            !selectedCategory
        ) {

            setSelectedCategory(
                data.categories[0].id
            );

        }

    }, [
        data.categories,
        selectedCategory,
    ]);

    return (

        <>

            <RestaurantHero
                restaurant={data.restaurant}
                hours={data.hours}
            />

            <section className="mx-auto mt-6 max-w-2xl px-5">

                <div className="rounded-2xl border border-orange-200 bg-orange-50 p-6 text-center">

                    <h2 className="text-2xl font-bold text-orange-700">
                        🍔 Así de fácil
                    </h2>

                    <p className="mt-2 text-sm text-gray-600">
                        En solo tres pasos podrás realizar tu pedido.
                    </p>

                    <div className="mt-8">

                        <div>

                            <h3 className="text-lg font-semibold text-orange-700">
                                🛒 1. Elige tus productos
                            </h3>

                            <p className="mt-2 text-gray-600">
                                Explora el menú y agrega tus productos favoritos al carrito.
                            </p>

                        </div>



                        <div>

                            <h3 className="text-lg font-semibold text-orange-700">
                                ✏️ 2. Revisa tu pedido
                            </h3>

                            <p className="mt-2 text-gray-600">
                                Modifica cantidades, ingredientes y extras antes de confirmar.
                            </p>

                        </div>



                        <div>

                            <h3 className="text-lg font-semibold text-orange-700">
                                📲 3. Envíalo por WhatsApp
                            </h3>

                            <p className="mt-2 text-gray-600">
                                Presiona <strong>"Enviar pedido"</strong> y tu orden llegará directamente al restaurante.
                            </p>

                        </div>

                    </div>

                </div>

            </section>

            <Categories
                categories={data.categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
            />

            <ProductGrid
                products={data.products}
                selectedCategory={selectedCategory}
            />

            <FeaturedProducts
                products={data.products}
            />

            {data.restaurant.slug === "demo" && (

                <CallToAction />

            )}

            <PoweredBy />

            <FloatingCartButton
                onClick={() =>
                    setCartOpen(true)
                }
            />

            <CartDrawer
                restaurant={data.restaurant}
                open={cartOpen}
                onClose={() =>
                    setCartOpen(false)
                }
            />
        </>

    );

}