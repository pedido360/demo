"use client";

import { useEffect, useMemo, useState } from "react";

import { RestaurantPageData } from "@/types/restaurant-page";
import { Product } from "@/types/product";

import RestaurantHero from "./RestaurantHero";
import FeaturedProducts from "./FeaturedProducts";
import Categories from "./Categories";
import CallToAction from "./CallToAction";
import PromotionBanner from "./PromotionBanner";

import SearchBar from "@/components/admin/smart-menu/SearchBar";
import ProductGrid from "@/components/products/ProductGrid";

import FloatingCartButton from "@/components/cart/FloatingCartButton";
import CartDrawer from "@/components/cart/CartDrawer";
import PoweredBy from "./PoweredBy";

import { isRestaurantOpen } from "@/lib/utils/isRestaurantOpen";

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

    const [search, setSearch] =
        useState("");

    const [productDrawerOpen, setProductDrawerOpen] =
        useState(false);

    const isOpen =
        data.restaurant.slug === "demo"
            ? true
            : isRestaurantOpen(data.hours ?? []);

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

    function isProductAvailableToday(
        product: Product
    ): boolean {

        const availableDays =
            product.availableDays ?? [];

        // Sin días configurados =
        // disponible todos los días.
        if (
            availableDays.length === 0
        ) {

            return true;

        }

        const weekday =
            new Intl.DateTimeFormat(
                "en-US",
                {
                    timeZone:
                        "America/Bogota",
                    weekday:
                        "short",
                }
            ).format(
                new Date()
            );

        const dayMap: Record<
            string,
            number
        > = {

            Sun: 0,
            Mon: 1,
            Tue: 2,
            Wed: 3,
            Thu: 4,
            Fri: 5,
            Sat: 6,

        };

        const today =
            dayMap[weekday];

        return availableDays.includes(
            today
        );

    }

    const promotionProduct =
        data.restaurant.slug ===
            "la-arroceria-colombiana"
            ? data.products.find(
                (product) =>
                    product.id ===
                    "65dff65e-6b8d-495a-abbf-77343ec11169"
            )
            : undefined;

    const filteredProducts = useMemo(() => {

        const value =
            search
                .normalize("NFD")
                .replace(
                    /[\u0300-\u036f]/g,
                    ""
                )
                .toLowerCase()
                .trim();

        /*
         * Sin búsqueda:
         *
         * Filtramos por categoría
         * y disponibilidad del día.
         */

        if (!value) {

            return data.products.filter(
                (product) =>
                    product.categoryId ===
                    selectedCategory &&
                    isProductAvailableToday(
                        product
                    )
            );

        }

        /*
         * Con búsqueda:
         *
         * Primero descartamos productos
         * que no están disponibles hoy.
         *
         * Después buscamos por nombre
         * o descripción.
         */

        return data.products.filter(
            (product) => {

                if (
                    !isProductAvailableToday(
                        product
                    )
                ) {

                    return false;

                }

                const name =
                    product.name
                        .normalize("NFD")
                        .replace(
                            /[\u0300-\u036f]/g,
                            ""
                        )
                        .toLowerCase();

                const description =
                    product.description
                        ?.normalize("NFD")
                        .replace(
                            /[\u0300-\u036f]/g,
                            ""
                        )
                        .toLowerCase() ?? "";

                return (
                    name.includes(value) ||
                    description.includes(value)
                );

            }
        );

    }, [
        data.products,
        selectedCategory,
        search,
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

            <section className="mx-auto max-w-2xl px-5 py-2">

                <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 shadow-sm">

                    <div className="mb-3 text-center">

                        <h2 className="text-lg font-bold text-orange-700">
                            🔎 ¿Qué estás buscando?
                        </h2>

                        <p className="mt-1 text-sm text-gray-600">
                            Busca cualquier producto del menú.
                        </p>

                    </div>

                    <SearchBar
                        value={search}
                        onChange={setSearch}
                    />

                </div>

            </section>

            <ProductGrid
                products={filteredProducts}
                selectedCategory={selectedCategory}
                searchActive={search.trim() !== ""}
                onDrawerChange={setProductDrawerOpen}
                dailyMenu={data.dailyMenu}
            />

            {promotionProduct && (
                <PromotionBanner
                    product={promotionProduct}
                />
            )}

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
                hidden={productDrawerOpen}
            />

            <CartDrawer
                restaurant={data.restaurant}
                hours={data.hours}
                isOpen={isOpen}
                open={cartOpen}
                onClose={() =>
                    setCartOpen(false)
                }
            />

        </>
    );
}