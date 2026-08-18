"use client";

import {
    ChevronDown,
    ChevronRight,
    Pencil,
    Trash2,
} from "lucide-react";

import { Category } from "@/types/category";

interface CategoryHeaderProps {
    category: Category;
    productCount: number;
    open: boolean;
    onToggle: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
}

export default function CategoryHeader({
    category,
    productCount,
    open,
    onToggle,
    onEdit,
    onDelete,
}: CategoryHeaderProps) {

    return (
        <div className="flex w-full items-center justify-between px-5 py-4">

            <button
                type="button"
                onClick={onToggle}
                className="flex min-w-0 flex-1 items-center gap-3 text-left hover:bg-gray-50"
            >

                <span className="text-2xl">
                    {category.emoji}
                </span>

                <div>

                    <h2 className="font-semibold">
                        {category.name}
                    </h2>

                    <p className="text-sm text-gray-500">
                        {productCount} productos
                    </p>

                </div>

            </button>

            <div className="ml-3 flex items-center gap-1">

                {onEdit && (
                    <button
                        type="button"
                        onClick={onEdit}
                        title="Editar categoría"
                        aria-label="Editar categoría"
                        className="rounded-lg p-2 text-gray-500 transition hover:bg-blue-100 hover:text-blue-600"
                    >
                        <Pencil size={18} />
                    </button>
                )}

                {onDelete && (
                    <button
                        type="button"
                        onClick={onDelete}
                        title="Eliminar categoría"
                        aria-label="Eliminar categoría"
                        className="rounded-lg p-2 text-gray-500 transition hover:bg-red-100 hover:text-red-600"
                    >
                        <Trash2 size={18} />
                    </button>
                )}

                <button
                    type="button"
                    onClick={onToggle}
                    aria-label={
                        open
                            ? "Contraer categoría"
                            : "Expandir categoría"
                    }
                    className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100"
                >
                    {open ? (
                        <ChevronDown size={20} />
                    ) : (
                        <ChevronRight size={20} />
                    )}
                </button>

            </div>

        </div>
    );
}