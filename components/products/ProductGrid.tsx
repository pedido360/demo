"use client";

import { useState } from "react";

import { Product } from "@/types/product";
import { DailyMenuClient } from "@/types/daily-menu";

import ProductCard from "./ProductCard";
import ProductDrawer from "@/components/product/ProductDrawer";
import DailyMenuDrawer from "@/components/daily-menu/DailyMenuDrawer";

import { useCart } from "@/hooks/useCart";

import {
    WEDNESDAY_PROMOTION_PRODUCT_ID,
    isWednesdayPromotionActive,
} from "@/lib/utils/isWednesdayPromotionActive";


interface ProductGridProps {

    products: Product[];

    selectedCategory: string;

    searchActive?: boolean;

    onDrawerChange?: (
        open: boolean
    ) => void;

    dailyMenu?: DailyMenuClient | null;

}


export default function ProductGrid({

    products,

    selectedCategory,

    searchActive = false,

    onDrawerChange,

    dailyMenu,

}: ProductGridProps) {

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

    const filteredProducts =
        products;

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

            onDrawerChange?.(
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

        onDrawerChange?.(
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

        onDrawerChange?.(
            false
        );

    }


    function handleCloseDailyMenu() {

        setDailyMenuOpen(
            false
        );

        onDrawerChange?.(
            false
        );

    }


    return (

        <>

            <section className="w-full px-4 py-6">

                <h2 className="mb-5 text-2xl font-bold text-gray-900">

                    {searchActive
                        ? "Resultados de búsqueda"
                        : "Productos"}

                </h2>


                {searchActive &&
                    filteredProducts.length === 0 && (

                        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">

                            <p className="text-lg font-semibold text-gray-700">

                                😕 No encontramos productos

                            </p>

                            <p className="mt-2 text-sm text-gray-500">

                                Intenta buscar con otro nombre.

                            </p>

                        </div>

                    )}


                <div className="space-y-3">

                    {filteredProducts.map(
                        product => (

                            <ProductCard
                                key={product.id}
                                product={product}
                                onSelect={
                                    handleSelectProduct
                                }
                            />

                        )
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