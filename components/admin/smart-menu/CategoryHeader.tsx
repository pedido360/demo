"use client";

import {
    ChevronDown,
    ChevronRight,
} from "lucide-react";

import { Category } from "@/types/category";

interface CategoryHeaderProps {
    category: Category;
    productCount: number;
    open: boolean;
    onToggle: () => void;
}

export default function CategoryHeader({
    category,
    productCount,
    open,
    onToggle,
}: CategoryHeaderProps) {

    return (

        <button
            type="button"
            onClick={onToggle}
            className="flex w-full items-center justify-between px-5 py-4 hover:bg-gray-50"
        >

            <div className="flex items-center gap-3">

                <span className="text-2xl">
                    {category.emoji}
                </span>

                <div className="text-left">

                    <h2 className="font-semibold">
                        {category.name}
                    </h2>

                    <p className="text-sm text-gray-500">
                        {productCount} productos
                    </p>

                </div>

            </div>

            {open ? (

                <ChevronDown size={20} />

            ) : (

                <ChevronRight size={20} />

            )}

        </button>

    );

}