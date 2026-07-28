"use client";

import { useEffect, useState } from "react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import Textarea from "@/components/ui/Textarea";

import { getCategoryEmoji } from "@/lib/getCategoryEmoji";
import type { Category } from "@/types/category";

interface CategoryFormProps {
    category: Category | null;
    onSave: (
        data: Omit<Category, "id" | "emoji">
    ) => void;
    onCancel: () => void;
}

export default function CategoryForm({
    category,
    onSave,
    onCancel,
}: CategoryFormProps) {
    const [form, setForm] = useState({
        name: "",
        description: "",
        isActive: true,
    });

    useEffect(() => {
        if (category) {
            setForm({
                name: category.name,
                description: category.description,
                isActive: category.isActive,
            });
        } else {
            setForm({
                name: "",
                description: "",
                isActive: true,
            });
        }
    }, [category]);

    function handleChange(
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement
        >
    ) {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    function handleSubmit(
        e: React.FormEvent<HTMLFormElement>
    ) {
        e.preventDefault();

        if (!form.name.trim()) return;

        onSave(form);
    }

    return (
        <Card
            title={
                category
                    ? "Editar categoría"
                    : "Nueva categoría"
            }
            description="Completa la información de la categoría."
        >
            <form
                onSubmit={handleSubmit}
                className="space-y-6"
            >
                <div>
                    <Label required>Nombre</Label>

                    <Input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Ej. Hamburguesas"
                    />

                    {form.name && (
                        <p className="mt-2 text-sm text-gray-500">
                            Emoji asignado automáticamente:
                            <span className="ml-2 text-xl">
                                {getCategoryEmoji(form.name)}
                            </span>
                        </p>
                    )}
                </div>

                <div>
                    <Label>Descripción</Label>

                    <Textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Describe esta categoría..."
                        helperText="Opcional."
                    />
                </div>

                <div className="flex items-center gap-3">
                    <input
                        id="isActive"
                        type="checkbox"
                        checked={form.isActive}
                        onChange={(e) =>
                            setForm((prev) => ({
                                ...prev,
                                isActive: e.target.checked,
                            }))
                        }
                        className="h-4 w-4 rounded border-gray-300"
                    />

                    <Label htmlFor="isActive">
                        Categoría activa
                    </Label>
                </div>

                <div className="flex justify-end gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                    >
                        Cancelar
                    </Button>

                    <Button type="submit">
                        {category
                            ? "Guardar cambios"
                            : "Crear categoría"}
                    </Button>
                </div>
            </form>
        </Card>
    );
}