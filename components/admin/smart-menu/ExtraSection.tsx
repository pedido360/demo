"use client";

import { useState } from "react";

import Button from "@/components/ui/Button";

import { Extra } from "@/types/product";

interface ExtraSectionProps {
    extras: Extra[];
    onDelete: (id: string) => void;
    onAdd: (extra: Omit<Extra, "id">) => void;
    onToggle: (id: string) => void;
}

export default function ExtraSection({
    extras,
    onDelete,
    onAdd,
    onToggle,
}: ExtraSectionProps) {

    const [isAdding, setIsAdding] =
        useState(false);

    const [name, setName] =
        useState("");

    const [price, setPrice] =
        useState(0);

    function handleAdd() {

        if (!name.trim()) {
            return;
        }

        onAdd({
            name: name.trim(),
            price,
            isActive: true,
        });

        setName("");
        setPrice(0);
        setIsAdding(false);

    }

    return (

        <section className="rounded-xl border border-gray-200 p-6">

            <h2 className="mb-5 text-lg font-semibold">
                ➕ Extras
            </h2>

            {extras.length === 0 ? (

                <p className="text-sm text-gray-500">
                    Este producto no tiene extras.
                </p>

            ) : (

                <div className="space-y-3">

                    {extras.map(extra => (

                        <div
                            key={extra.id}
                            className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3"
                        >

                            <div>

                                <div
                                    className={
                                        extra.isActive
                                            ? "font-medium text-gray-900"
                                            : "font-medium text-gray-500"
                                    }
                                >
                                    {extra.name}
                                </div>

                                <div className="text-sm text-gray-500">
                                    ${extra.price.toLocaleString()}
                                </div>

                            </div>

                            <div className="flex items-center gap-3">

                                <button
                                    type="button"
                                    onClick={() => onToggle(extra.id)}
                                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${extra.isActive
                                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                                            : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                                        }`}
                                >
                                    {extra.isActive
                                        ? "🟢 Activo"
                                        : "⚪ Inactivo"}
                                </button>

                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() =>
                                        onDelete(extra.id)
                                    }
                                >
                                    Eliminar
                                </Button>

                            </div>

                        </div>

                    ))}

                </div>

            )}

            {!isAdding ? (

                <div className="mt-6">

                    <Button
                        variant="outline"
                        onClick={() =>
                            setIsAdding(true)
                        }
                    >
                        ➕ Agregar extra
                    </Button>

                </div>

            ) : (

                <div className="mt-6 rounded-xl border border-orange-200 bg-orange-50 p-4">

                    <label className="mb-2 block text-sm font-medium">
                        Nombre
                    </label>

                    <input
                        className="mb-4 w-full rounded-lg border border-gray-300 p-3"
                        value={name}
                        onChange={(event) =>
                            setName(event.target.value)
                        }
                    />

                    <label className="mb-2 block text-sm font-medium">
                        Precio
                    </label>

                    <input
                        type="number"
                        className="w-full rounded-lg border border-gray-300 p-3"
                        value={price}
                        onChange={(event) =>
                            setPrice(
                                Number(event.target.value)
                            )
                        }
                    />

                    <div className="mt-4 flex justify-end gap-2">

                        <Button
                            variant="outline"
                            onClick={() => {

                                setName("");
                                setPrice(0);
                                setIsAdding(false);

                            }}
                        >
                            Cancelar
                        </Button>

                        <Button
                            onClick={handleAdd}
                        >
                            Guardar
                        </Button>

                    </div>

                </div>

            )}

        </section>

    );

}