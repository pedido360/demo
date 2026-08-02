"use client";

import { Search, X } from "lucide-react";

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
}

export default function SearchBar({
    value,
    onChange,
}: SearchBarProps) {

    return (

        <div className="sticky top-0 z-10 bg-white pb-4">

            <div className="relative">

                <Search
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                    type="text"
                    placeholder="Buscar producto..."
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 py-3 pl-12 pr-12 text-sm outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />

                {value && (

                    <button
                        type="button"
                        onClick={() => onChange("")}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                    >

                        <X size={18} />

                    </button>

                )}

            </div>

        </div>

    );

}