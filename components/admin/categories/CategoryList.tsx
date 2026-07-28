"use client";

import type { Category } from "@/types/category";

import CategoryItem from "./CategoryItem";

interface CategoryListProps {
    categories: Category[];
    onEdit: (category: Category) => void;
    onDelete: (id: string) => void;
}

export default function CategoryList({
    categories,
    onEdit,
    onDelete,
}: CategoryListProps) {
    if (categories.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-gray-300 py-12 text-center">
                <p className="text-gray-500">
                    Aún no has creado ninguna categoría.
                </p>

                <p className="mt-2 text-sm text-gray-400">
                    Haz clic en <strong>"Nueva categoría"</strong> para comenzar.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {categories.map((category) => (
                <CategoryItem
                    key={category.id}
                    category={category}
                    onEdit={() => onEdit(category)}
                    onDelete={() => onDelete(category.id)}
                />
            ))}
        </div>
    );
}