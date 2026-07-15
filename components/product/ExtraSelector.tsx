"use client";

import { Extra } from "@/types/product";
import { Check } from "lucide-react";

interface ExtraSelectorProps {
    extras: Extra[];
    selectedExtras: string[];
    onToggle: (extraId: string) => void;
}

export default function ExtraSelector({
    extras,
    selectedExtras,
    onToggle,
}: ExtraSelectorProps) {
    if (!extras.length) return null;

    return (
        <section className="mt-8">

            <h3 className="text-lg font-bold">
                Extras
            </h3>

            <p className="text-sm text-gray-500 mt-1 mb-4">
                Agrega ingredientes adicionales.
            </p>

            <div className="space-y-3">

                {extras.map((extra) => {

                    const checked = selectedExtras.includes(extra.id);

                    return (
                        <button
                            key={extra.id}
                            type="button"
                            onClick={() => onToggle(extra.id)}
                            className={`w-full rounded-2xl border p-4 transition ${checked
                                    ? "border-red-600 bg-red-50"
                                    : "border-gray-200 bg-white hover:border-red-400"
                                }`}
                        >

                            <div className="flex items-center justify-between">

                                <div>

                                    <p className="font-semibold">
                                        {extra.name}
                                    </p>

                                    <p className="text-sm text-red-600 font-medium mt-1">
                                        + ${extra.price.toLocaleString("es-CO")}
                                    </p>

                                </div>

                                <div
                                    className={`flex h-6 w-6 items-center justify-center rounded-md border-2 transition ${checked
                                            ? "border-red-600 bg-red-600 text-white"
                                            : "border-gray-300"
                                        }`}
                                >
                                    {checked && <Check size={16} />}
                                </div>

                            </div>

                        </button>
                    );

                })}

            </div>

        </section>
    );
}