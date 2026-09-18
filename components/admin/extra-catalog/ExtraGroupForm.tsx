"use client";

import { useState } from "react";

import Button from "@/components/ui/Button";

import { ExtraGroup } from "@/types/extra-catalog";

interface ExtraGroupFormProps {
    group?: ExtraGroup | null;
    nextSortOrder: number;
    onSave: (group: ExtraGroup) => void;
    onCancel: () => void;
}

export default function ExtraGroupForm({
    group,
    nextSortOrder,
    onSave,
    onCancel,
}: ExtraGroupFormProps) {
    const [name, setName] = useState(group?.name ?? "");
    const [isActive, setIsActive] = useState(group?.isActive ?? true);

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const trimmedName = name.trim();

        if (!trimmedName) {
            alert("El nombre del grupo es obligatorio.");
            return;
        }

        onSave({
            id: group?.id ?? "",
            restaurantId: group?.restaurantId ?? "",
            name: trimmedName,
            isActive,
            sortOrder: group?.sortOrder ?? nextSortOrder,
        });
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-gray-200 bg-gray-50 p-6"
        >
            <div className="mb-5">
                <h3 className="text-lg font-semibold text-gray-900">
                    {group ? "Editar grupo" : "Nuevo grupo"}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                    Agrupa extras reutilizables para asignarlos posteriormente
                    a varios productos.
                </p>
            </div>

            <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    Nombre del grupo
                </label>

                <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Ej. Adicionales Hamburguesas"
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
            </div>

            <label className="mt-5 flex cursor-pointer items-center gap-3">
                <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(event) => setIsActive(event.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />

                <span className="text-sm font-medium text-gray-700">
                    Grupo activo
                </span>
            </label>

            <div className="mt-6 flex gap-3">
                <Button type="submit">
                    {group ? "Guardar cambios" : "Crear grupo"}
                </Button>

                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                >
                    Cancelar
                </Button>
            </div>
        </form>
    );
}
