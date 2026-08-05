"use client";

import { useEffect, useMemo, useState } from "react";

import { Category } from "@/types/category";
import { Product } from "@/types/product";

import { buildMenu } from "@/lib/services/menu.service";

import {
    saveCompleteProduct,
} from "@/lib/services/product.service";

import SearchBar from "./SearchBar";
import CategoryAccordion from "./CategoryAccordion";
import ProductEditor from "./ProductEditor";
import ProductForm from "@/components/admin/products/ProductForm";

import {
    createCompleteProduct,
} from "@/lib/services/product.service";

interface SmartMenuProps {
    restaurantId: string;
    categories: Category[];
    products: Product[];

}

export default function SmartMenu({
    restaurantId,
    categories,
    products,
}: SmartMenuProps) {

    const [productList, setProductList] =
        useState<Product[]>(products);

    const [selectedProduct, setSelectedProduct] =
        useState<Product | null>(null);

    const [selectedCategoryId, setSelectedCategoryId] =
        useState<string | null>(null);

    const [creatingProduct, setCreatingProduct] =
        useState(false);

    const [search, setSearch] =
        useState("");

    useEffect(() => {

        setProductList(products);

    }, [products]);

    const filteredProducts = useMemo(() => {

        if (!search.trim()) {
            return productList;
        }

        const value = search.toLowerCase();

        return productList.filter(product =>
            product.name
                .toLowerCase()
                .includes(value)
        );

    }, [productList, search]);

    const menu = useMemo(
        () => buildMenu(
            categories,
            filteredProducts
        ),
        [categories, filteredProducts]
    );

    async function handleCreateProduct(
        product: Product
    ) {

        try {

            const created =
                await createCompleteProduct(
                    restaurantId,
                    product
                );

            setProductList(previous => [
                ...previous,
                created,
            ]);

            setCreatingProduct(false);

            setSelectedCategoryId(null);

        } catch (error) {

            console.error(error);

            alert(
                "No fue posible crear el producto."
            );

        }

    }

    async function handleSaveProduct(
        product: Product
    ) {

        try {

            const updated =
                await saveCompleteProduct(product);

            setProductList(previous =>
                previous.map(item =>
                    item.id === updated.id
                        ? updated
                        : item
                )
            );

            setSelectedProduct(null);

        } catch (error) {

            console.error(error);

            alert(
                "No fue posible guardar el producto."
            );

        }

    }

    if (creatingProduct) {

        return (

            <ProductForm
                categories={categories}
                initialCategoryId={
                    selectedCategoryId ?? undefined
                }
                onSave={handleCreateProduct}
                onCancel={() => {

                    setCreatingProduct(false);

                    setSelectedCategoryId(null);

                }}
            />

        );

    }

    if (selectedProduct) {

        return (

            <ProductEditor
                product={selectedProduct}
                categories={categories}
                onSave={handleSaveProduct}
                onDelete={() => { }}
                onClose={() =>
                    setSelectedProduct(null)
                }
            />

        );

    }

    return (

        <section className="overflow-hidden rounded-2xl border border-orange-200 bg-orange-50">

            <div className="border-b border-orange-200 bg-orange-100 px-6 py-5">

                <h2 className="text-2xl font-bold text-orange-700">
                    🍔 Smart Menu
                </h2>

                <p className="mt-1 text-sm text-orange-600">
                    Administra categorías, productos, ingredientes y extras desde un solo lugar.
                </p>

                <div className="mt-3 flex flex-wrap gap-6 text-sm">

                    <span className="font-medium text-orange-700">
                        📂 {categories.length} categorías
                    </span>

                    <span className="font-medium text-orange-700">
                        🍽️ {productList.length} productos
                    </span>

                </div>

            </div>

            <div className="space-y-5 p-6">

                <SearchBar
                    value={search}
                    onChange={setSearch}
                />

                {menu.length === 0 ? (

                    <div className="rounded-xl border border-dashed border-orange-300 bg-white p-10 text-center">

                        <p className="text-gray-500">
                            No se encontraron productos.
                        </p>

                    </div>

                ) : (

                    menu.map(group => (

                        <CategoryAccordion
                            key={group.category.id}
                            group={group}
                            onProductClick={setSelectedProduct}
                            onCreateProduct={(categoryId) => {

                                setSelectedCategoryId(categoryId);

                                setCreatingProduct(true);

                            }}
                        />

                    ))

                )}

            </div>

        </section>

    );

}