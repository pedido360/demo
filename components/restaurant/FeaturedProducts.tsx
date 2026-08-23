"use client";

import Image from "next/image";
import { useState } from "react";

import { Product } from "@/types/product";
import { DailyMenuClient } from "@/types/daily-menu";

import ProductDrawer from "@/components/product/ProductDrawer";
import DailyMenuDrawer from "@/components/daily-menu/DailyMenuDrawer";

import { useCart } from "@/hooks/useCart";

import {
    WEDNESDAY_PROMOTION_PRODUCT_ID,
    isWednesdayPromotionActive,
} from "@/lib/utils/isWednesdayPromotionActive";


interface FeaturedProductsProps {

    products: Product[];

    dailyMenu?: DailyMenuClient | null;

}


export default function FeaturedProducts({

    products,

    dailyMenu,

}: FeaturedProductsProps) {

    const [
        selectedProduct,
        setSelectedProduct,
    ] = useState<Product | null>(null);


    const [
        drawerOpen,
        setDrawerOpen,
    ] = useState(false);


    const [
        dailyMenuOpen,
        setDailyMenuOpen,
    ] = useState(false);


    const { addToCart } =
        useCart();


    const featuredProducts =
        products.filter(
            product =>
                product.featured
        );


    if (
        featuredProducts.length === 0
    ) {

        return null;

    }


    function handleSelectProduct(
        product: Product
    ) {

        if (
            product.productType ===
            "daily_menu"
        ) {

            setDailyMenuOpen(
                true
            );

            return;

        }


        setSelectedProduct(
            product
        );

        setDrawerOpen(
            true
        );

    }


    function handleCloseDrawer() {

        setDrawerOpen(
            false
        );

        setSelectedProduct(
            null
        );

    }


    function handleCloseDailyMenu() {

        setDailyMenuOpen(
            false
        );

    }


    function getDailyMenuMinimumPrice(): number | null {

        if (
            !dailyMenu ||
            !dailyMenu.sizes ||
            dailyMenu.sizes.length === 0
        ) {

            return null;

        }


        const prices =
            dailyMenu.sizes
                .map(
                    size =>
                        Number(size.price)
                )
                .filter(
                    price =>
                        Number.isFinite(
                            price
                        ) &&
                        price >= 0
                );


        if (
            prices.length === 0
        ) {

            return null;

        }


        return Math.min(
            ...prices
        );

    }


    const dailyMenuMinimumPrice =
        getDailyMenuMinimumPrice();


    return (

        <>

            <section className="w-full px-4 py-5">

                <div className="mb-4 flex items-center justify-between">

                    <h2 className="text-xl font-bold">
                        ⭐ Los más pedidos
                    </h2>

                    <span className="text-sm font-medium text-red-600">
                        Recomendados
                    </span>

                </div>


                <div className="space-y-3">

                    {featuredProducts.map(
                        product => {

                            const isDailyMenu =
                                product.productType ===
                                "daily_menu";


                            return (

                                <article
                                    key={product.id}
                                    className="flex items-center gap-3 rounded-2xl border border-yellow-200 bg-yellow-50 p-3"
                                >

                                    {/* Imagen */}

                                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-white">

                                        {product.image ? (

                                            <Image
                                                src={
                                                    product.image
                                                }
                                                alt={
                                                    product.name
                                                }
                                                fill
                                                sizes="80px"
                                                className="object-cover"
                                            />

                                        ) : (

                                            <div className="flex h-full w-full items-center justify-center text-3xl">
                                                🍔
                                            </div>

                                        )}

                                    </div>


                                    {/* Información */}

                                    <div className="min-w-0 flex-1">

                                        <h3 className="truncate font-semibold text-gray-900">
                                            {
                                                product.name
                                            }
                                        </h3>

                                        <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                                            {
                                                product.description
                                            }
                                        </p>

                                    </div>


                                    {/* Precio y botón */}

                                    <div className="ml-2 flex flex-col items-end gap-2">

                                        <span className="whitespace-nowrap font-bold text-red-600">

                                            {isDailyMenu ? (

                                                dailyMenuMinimumPrice !==
                                                    null ? (

                                                    <>
                                                        Desde $
                                                        {dailyMenuMinimumPrice.toLocaleString(
                                                            "es-CO"
                                                        )}
                                                    </>

                                                ) : (

                                                    "Ver opciones"

                                                )

                                            ) : (

                                                <>
                                                    $
                                                    {product.price.toLocaleString(
                                                        "es-CO"
                                                    )}
                                                </>

                                            )}

                                        </span>


                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleSelectProduct(
                                                    product
                                                )
                                            }
                                            className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-lg font-bold text-white transition hover:bg-red-700"
                                        >
                                            +
                                        </button>

                                    </div>

                                </article>

                            );

                        }
                    )}

                </div>

            </section>


            <ProductDrawer

                product={
                    selectedProduct
                }

                open={
                    drawerOpen
                }

                onClose={
                    handleCloseDrawer
                }

                onAdd={
                    selection => {

                        if (
                            selection.product.id ===
                            WEDNESDAY_PROMOTION_PRODUCT_ID
                        ) {

                            if (
                                !isWednesdayPromotionActive()
                            ) {

                                alert(
                                    "⏰ Esta promoción está disponible los miércoles después de las 2:00 P.M. No está disponible en enero ni diciembre."
                                );

                                return;

                            }

                        }


                        addToCart(
                            selection
                        );

                        handleCloseDrawer();

                    }
                }

            />


            <DailyMenuDrawer

                menu={
                    dailyMenu ?? null
                }

                open={
                    dailyMenuOpen
                }

                onClose={
                    handleCloseDailyMenu
                }

                onAdd={
                    selection => {

                        if (
                            !dailyMenu
                        ) {

                            return;

                        }


                        const dailyMenuProduct =
                            products.find(
                                product =>
                                    product.productType ===
                                    "daily_menu"
                            );


                        if (
                            !dailyMenuProduct
                        ) {

                            console.error(
                                "No se encontró el producto del Menú del Día."
                            );

                            return;

                        }


                        addToCart({

                            product:
                                dailyMenuProduct,

                            quantity:
                                selection.quantity,

                            ingredients:
                                [],

                            extras:
                                [],

                            notes:
                                selection.notes,

                            dailyMenu: {

                                size:
                                    selection.size,

                                soup:
                                    selection.soup,

                                secos:
                                    selection.secos,

                                principle:
                                    selection.principle,

                                protein:
                                    selection.protein,

                                drink:
                                    selection.drink,

                                dessert:
                                    selection.dessert,

                                quantity:
                                    selection.quantity,

                                notes:
                                    selection.notes,

                            },

                        });


                        handleCloseDailyMenu();

                    }
                }

            />

        </>

    );

}