"use client";

import { ChevronRight, Pencil, Trash2 } from "lucide-react";

import type { Category } from "@/types/category";

interface CategoryItemProps {
    category: Category;
    onEdit: () => void;
    onDelete: () => void;
}

export default function CategoryItem({
    category,
    onEdit,
    onDelete,
}: CategoryItemProps) {

    function handleDelete(
        event: React.MouseEvent<HTMLButtonElement>
    ) {
        event.stopPropagation();

        const confirmed =
            window.confirm(
                `¿Eliminar la categoría "${category.name}"?`
            );

        if (!confirmed) {
            return;
        }

        onDelete();
    }

    return (
        <div className="flex w-full items-center rounded-xl border border-gray-200 bg-white transition-all hover:border-green-500 hover:bg-green-50">

            <button
                type="button"
                onClick={onEdit}
                className="flex min-w-0 flex-1 items-center justify-between px-4 py-4 text-left"
            >

                <div className="flex min-w-0 items-center gap-4">

                    <div className="text-2xl">
                        {category.emoji}
                    </div>

                    <div className="min-w-0">

                        <div className="flex items-center gap-2">

                            <div
                                className={`h-3 w-3 shrink-0 rounded-full ${category.isActive
                                        ? "bg-green-500"
                                        : "bg-gray-400"
                                    }`}
                            />

                            <h3 className="truncate font-semibold text-gray-900">
                                {category.name}
                            </h3>

                        </div>

                    </div>

                </div>

                <ChevronRight
                    size={20}
                    className="ml-4 shrink-0 text-gray-400"
                />

            </button>

            <div className="flex items-center gap-1 pr-3">

                <button
                    type="button"
                    onClick={onEdit}
                    title="Editar categoría"
                    aria-label="Editar categoría"
                    className="rounded-lg p-2 text-gray-500 transition hover:bg-blue-100 hover:text-blue-600"
                >
                    <Pencil size={18} />
                </button>

                <button
                    type="button"
                    onClick={handleDelete}
                    title="Eliminar categoría"
                    aria-label="Eliminar categoría"
                    className="rounded-lg p-2 text-gray-500 transition hover:bg-red-100 hover:text-red-600"
                >
                    <Trash2 size={18} />
                </button>

            </div>

        </div>
    );
}