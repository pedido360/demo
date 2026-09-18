"use client";

import { useState } from "react";

import Button from "@/components/ui/Button";

import {
    ExtraCatalogItem,
    ExtraGroupItem,
} from "@/types/extra-catalog";

interface ExtraGroupItemsProps {
    groupId: string;
    extras: ExtraCatalogItem[];
    items: ExtraGroupItem[];
    onSave: (items: ExtraGroupItem[]) => void;
    onCancel: () => void;
}

export default function ExtraGroupItems({
    groupId,
    extras,
    items,
    onSave,
    onCancel,
}: ExtraGroupItemsProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>(
        items.map((item) => item.extraId)
    );

    function toggleExtra(extraId: string, checked: boolean) {
        setSelectedIds((current) =>
            checked
                ? [...current, extraId]
                : current.filter((id) => id !== extraId)
        );
    }

    function handleSave() {
        const selectedItems: ExtraGroupItem[] = selectedIds.map(
            (extraId, index) => ({
                groupId,
                extraId,
                sortOrder: index,
            })
        );

        onSave(selectedItems);
    }

    return (
        <section className="rounded-2xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-6 py-5">
                <h3 className="text-lg font-semibold text-gray-900">
                    Extras del grupo
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                    Selecciona los extras que estarán disponibles dentro de
                    este grupo.
                </p>
            </div>

            {extras.length === 0 ? (
                <div className="px-6 py-10 text-center">
                    <div className="text-3xl">🧀</div>

                    <h4 className="mt-3 font-semibold text-gray-900">
                        No hay extras disponibles
                    </h4>

                    <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
                        Primero crea extras en tu catálogo para poder
                        agregarlos a este grupo.
                    </p>
                </div>
            ) : (
                <>
                    <div className="grid gap-3 p-6 md:grid-cols-2">
                        {extras.map((extra) => {
                            const selected = selectedIds.includes(extra.id);

                            return (
                                <label
                                    key={extra.id}
                                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                                        selected
                                            ? "border-green-300 bg-green-50"
                                            : "border-gray-200 bg-white hover:border-green-300"
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selected}
                                        onChange={(event) =>
                                            toggleExtra(
                                                extra.id,
                                                event.target.checked
                                            )
                                        }
                                        className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                    />

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="text-sm font-medium text-gray-900">
                                                {extra.name}
                                            </span>

                                            <span className="shrink-0 text-sm font-medium text-gray-700">
                                                {extra.price > 0
                                                    ? `+$${extra.price.toLocaleString(
                                                          "es-CO"
                                                      )}`
                                                    : "Gratis"}
                                            </span>
                                        </div>

                                        {!extra.isActive && (
                                            <span className="mt-1 block text-xs text-gray-500">
                                                Extra inactivo
                                            </span>
                                        )}
                                    </div>
                                </label>
                            );
                        })}
                    </div>

                    <div className="flex gap-3 border-t border-gray-200 px-6 py-5">
                        <Button type="button" onClick={handleSave}>
                            Guardar extras del grupo
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                        >
                            Cancelar
                        </Button>
                    </div>
                </>
            )}
        </section>
    );
}
