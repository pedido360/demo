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
import ProductEditor from "./ProductEditor"

import CategoryForm from "@/components/admin/categories/CategoryForm";
import ProductForm from "@/components/admin/products/ProductForm";

import {
    createCompleteProduct,
} from "@/lib/services/product.service";

import {
    createCategory,
    updateCategory,
    deleteCategory,
} from "@/lib/repositories/category.repository";

import {
    getCategoryEmoji,
} from "@/lib/getCategoryEmoji";

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

    const [categoryList, setCategoryList] =
        useState<Category[]>(categories);

    const [productList, setProductList] =
        useState<Product[]>(products);

    const [selectedProduct, setSelectedProduct] =
        useState<Product | null>(null);

    const [selectedCategoryId, setSelectedCategoryId] =
        useState<string | null>(null);


    const [creatingProduct, setCreatingProduct] =
        useState(false);

    const [creatingCategory, setCreatingCategory] =
        useState(false);

    const [editingCategory, setEditingCategory] =
        useState<Category | null>(null);

    const [search, setSearch] =
        useState("");

    useEffect(() => {

        setCategoryList(categories);

        setProductList(products);

    }, [categories, products]);

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
            categoryList,
            filteredProducts
        ),
        [categoryList, filteredProducts]
    );

    async function handleCreateCategory(
        data: Omit<Category, "id" | "emoji">
    ) {

        try {

            const created =
                await createCategory(
                    restaurantId,
                    {
                        id: "",
                        emoji: getCategoryEmoji(data.name),
                        ...data,
                    }
                );

            setCategoryList(previous => [
                ...previous,
                created,
            ]);

            setCreatingCategory(false);

        } catch (error) {

            console.error(error);

            alert(
                "No fue posible crear la categoría."
            );

        }

    }

    async function handleEditCategory(
        data: Omit<Category, "id" | "emoji">
    ) {

        if (!editingCategory) {
            return;
        }

        try {

            const updated =
                await updateCategory({
                    ...editingCategory,
                    ...data,
                    emoji: getCategoryEmoji(
                        data.name
                    ),
                });

            setCategoryList(previous =>
                previous.map(category =>
                    category.id === updated.id
                        ? updated
                        : category
                )
            );

            setEditingCategory(null);

        } catch (error) {

            console.error(error);

            alert(
                "No fue posible actualizar la categoría."
            );

        }
    }

    async function handleDeleteCategory(
        categoryId: string
    ) {
        const category =
            categoryList.find(
                item => item.id === categoryId
            );

        if (!category) {
            return;
        }

        const group =
            menu.find(
                item =>
                    item.category.id === categoryId
            );

        const productCount =
            group?.products.length ?? 0;

        if (productCount > 0) {
            alert(
                `No puedes eliminar "${category.name}" porque tiene ${productCount} producto${productCount === 1 ? "" : "s"} asociado${productCount === 1 ? "" : "s"}.`
            );

            return;
        }

        const confirmed =
            window.confirm(
                `¿Eliminar la categoría "${category.name}"?\n\nEsta acción no se puede deshacer.`
            );

        if (!confirmed) {
            return;
        }

        try {

            await deleteCategory(categoryId);

            setCategoryList(previous =>
                previous.filter(
                    item => item.id !== categoryId
                )
            );

        } catch (error) {

            console.error(error);

            alert(
                "No fue posible eliminar la categoría."
            );
        }
    }

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

    async function handleToggleProduct(
        id: string
    ) {

        const product =
            productList.find(
                item => item.id === id
            );

        if (!product) {
            return;
        }

        try {

            const updated =
                await saveCompleteProduct({
                    ...product,
                    isAvailable: !product.isAvailable,
                });

            setProductList(previous =>
                previous.map(item =>
                    item.id === updated.id
                        ? updated
                        : item
                )
            );

        } catch (error) {

            console.error(error);

            alert(
                "No fue posible actualizar el estado del producto."
            );

        }

    }

    if (creatingCategory || editingCategory) {

        return (

            <CategoryForm
                category={editingCategory}
                onSave={
                    editingCategory
                        ? handleEditCategory
                        : handleCreateCategory
                }
                onCancel={() => {
                    setCreatingCategory(false);
                    setEditingCategory(null);
                }}
            />

        );

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

                <div className="mt-4">

                    <button
                        type="button"
                        onClick={() => setCreatingCategory(true)}
                        className="rounded-xl bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
                    >
                        + Nueva categoría
                    </button>

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
                            onToggleProduct={handleToggleProduct}
                            onCreateProduct={(categoryId) => {

                                setSelectedCategoryId(categoryId);

                                setCreatingProduct(true);

                            }}
                            onEditCategory={(category) => {
                                setEditingCategory(category);
                            }}

                            onDeleteCategory={
                                handleDeleteCategory
                            }
                        />

                    ))

                )}

            </div>

        </section>

    );

}