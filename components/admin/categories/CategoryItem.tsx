"use client";

import { ChevronRight } from "lucide-react";

import type { Category } from "@/types/category";

interface CategoryItemProps {
    category: Category;
    onEdit: () => void;
    onDelete: () => void;
}

export default function CategoryItem({
    category,
    onEdit,
}: CategoryItemProps) {

    return (

        <button
            type="button"
            onClick={onEdit}
            className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-4 transition-all hover:border-green-500 hover:bg-green-50"
        >

            <div className="flex items-center gap-4">

                <div className="text-2xl">
                    {category.emoji}
                </div>

                <div className="text-left">

                    <div className="flex items-center gap-2">

                        <div
                            className={`h-3 w-3 rounded-full ${category.isActive
                                ? "bg-green-500"
                                : "bg-gray-400"
                                }`}
                        />

                        <h3 className="font-semibold text-gray-900">
                            {category.name}
                        </h3>

                    </div>

                </div>

            </div>

            <ChevronRight
                size={20}
                className="text-gray-400"
            />

        </button>

    );

}