"use client";

import { Pencil, Trash2 } from "lucide-react";

import Button from "@/components/ui/Button";

import { ExtraCatalogItem } from "@/types/extra-catalog";

interface ExtraCatalogListProps {
    extras: ExtraCatalogItem[];
    onCreate: () => void;
    onEdit: (extra: ExtraCatalogItem) => void;
    onDelete: (extra: ExtraCatalogItem) => void;
}

export default function ExtraCatalogList({
    extras,
    onCreate,
    onEdit,
    onDelete,
}: ExtraCatalogListProps) {
    return (
        <section className="rounded-2xl border border-gray-200 bg-white">
            <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                        Extras
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Administra los adicionales reutilizables de tu
                        restaurante.
                    </p>
                </div>

                <Button type="button" onClick={onCreate}>
                    + Nuevo extra
                </Button>
            </div>

            {extras.length === 0 ? (
                <div className="px-6 py-10 text-center">
                    <div className="text-3xl">🧀</div>

                    <h4 className="mt-3 font-semibold text-gray-900">
                        Aún no tienes extras
                    </h4>

                    <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
                        Crea tu primer extra reutilizable, como tocineta,
                        queso, huevo o una salsa.
                    </p>

                    <div className="mt-5">
                        <Button type="button" onClick={onCreate}>
                            Crear primer extra
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="divide-y divide-gray-100">
                    {extras.map((extra) => (
                        <div
                            key={extra.id}
                            className="flex flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h4 className="font-medium text-gray-900">
                                        {extra.name}
                                    </h4>

                                    <span
                                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                            extra.isActive
                                                ? "bg-green-100 text-green-700"
                                                : "bg-gray-100 text-gray-500"
                                        }`}
                                    >
                                        {extra.isActive
                                            ? "Activo"
                                            : "Inactivo"}
                                    </span>
                                </div>

                                <p className="mt-1 text-sm text-gray-500">
                                    {extra.price > 0
                                        ? `+$${extra.price.toLocaleString(
                                              "es-CO"
                                          )}`
                                        : "Sin costo adicional"}
                                </p>
                            </div>

                            <div className="flex shrink-0 gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onEdit(extra)}
                                >
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Editar
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onDelete(extra)}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Eliminar
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
