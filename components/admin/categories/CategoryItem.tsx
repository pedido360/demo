"use client";

import { Pencil, Trash2 } from "lucide-react";

import Button from "@/components/ui/Button";

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
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-orange-300 hover:shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-orange-50 text-3xl">
                        {category.emoji}
                    </div>

                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {category.name}
                            </h3>

                            <span
                                className={`rounded-full px-2 py-1 text-xs font-medium ${category.isActive
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-200 text-gray-600"
                                    }`}
                            >
                                {category.isActive ? "Activa" : "Oculta"}
                            </span>
                        </div>

                        {category.description ? (
                            <p className="mt-2 text-sm text-gray-500">
                                {category.description}
                            </p>
                        ) : (
                            <p className="mt-2 text-sm italic text-gray-400">
                                Sin descripción.
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex gap-2 self-end md:self-center">
                    <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Pencil size={16} />}
                        onClick={onEdit}
                    >
                        Editar
                    </Button>

                    <Button
                        variant="danger"
                        size="sm"
                        leftIcon={<Trash2 size={16} />}
                        onClick={onDelete}
                    >
                        Eliminar
                    </Button>
                </div>
            </div>
        </div>
    );
}