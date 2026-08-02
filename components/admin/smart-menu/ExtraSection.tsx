"use client";

import { useState } from "react";

import Button from "@/components/ui/Button";

import { Extra } from "@/types/product";

interface ExtraSectionProps {
    extras: Extra[];
    onDelete: (id: string) => void;
    onAdd: (extra: Omit<Extra, "id">) => void;
}

export default function ExtraSection({
    extras,
    onDelete,
    onAdd,
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

                                <div className="font-medium">
                                    {extra.name}
                                </div>

                                <div className="text-sm text-gray-500">
                                    ${extra.price.toLocaleString()}
                                </div>

                            </div>

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