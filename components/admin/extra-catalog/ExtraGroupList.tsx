"use client";

import { Pencil, Trash2 } from "lucide-react";

import Button from "@/components/ui/Button";

import { ExtraGroup } from "@/types/extra-catalog";

interface ExtraGroupListProps {
    groups: ExtraGroup[];
    onCreate: () => void;
    onEdit: (group: ExtraGroup) => void;
    onDelete: (group: ExtraGroup) => void;
    onConfigureItems: (group: ExtraGroup) => void;
    onConfigureProducts: (group: ExtraGroup) => void;
}

export default function ExtraGroupList({
    groups,
    onCreate,
    onEdit,
    onDelete,
    onConfigureItems,
    onConfigureProducts,
}: ExtraGroupListProps) {
    return (
        <section className="rounded-2xl border border-gray-200 bg-white">
            <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                        Grupos de extras
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                        Agrupa extras y reutiliza el mismo conjunto en varios
                        productos.
                    </p>
                </div>

                <Button type="button" onClick={onCreate}>
                    + Nuevo grupo
                </Button>
            </div>

            {groups.length === 0 ? (
                <div className="px-6 py-10 text-center">
                    <div className="text-3xl">📦</div>

                    <h4 className="mt-3 font-semibold text-gray-900">
                        Aún no tienes grupos
                    </h4>

                    <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
                        Crea un grupo como “Adicionales Hamburguesas” para
                        reutilizarlo en varios productos.
                    </p>

                    <div className="mt-5">
                        <Button type="button" onClick={onCreate}>
                            Crear primer grupo
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="divide-y divide-gray-100">
                    {groups.map((group) => (
                        <div
                            key={group.id}
                            className="flex flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h4 className="font-medium text-gray-900">
                                        {group.name}
                                    </h4>

                                    <span
                                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                            group.isActive
                                                ? "bg-green-100 text-green-700"
                                                : "bg-gray-100 text-gray-500"
                                        }`}
                                    >
                                        {group.isActive
                                            ? "Activo"
                                            : "Inactivo"}
                                    </span>
                                </div>

                                <p className="mt-1 text-sm text-gray-500">
                                    Grupo reutilizable de extras
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <Button
                                    type="button"
                                    onClick={() => onConfigureItems(group)}
                                >
                                    Configurar extras
                                </Button>

                                <Button
                                    type="button"
                                    onClick={() => onConfigureProducts(group)}
                                >
                                    Aplicar a productos
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onEdit(group)}
                                >
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Editar
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onDelete(group)}
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
