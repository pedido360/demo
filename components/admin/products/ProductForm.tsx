'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Label from '@/components/ui/Label';
import Textarea from '@/components/ui/Textarea';

import { Category } from '@/types/category';
import { Extra, Ingredient, Product } from '@/types/product';

interface ProductFormProps {
    categories: Category[];
    product?: Product;
    onSave: (product: Product) => void;
    onCancel: () => void;
}

const emptyProduct: Product = {
    id: '',
    categoryId: '',
    name: '',
    description: '',
    price: 0,
    image: '',
    featured: false,
    isAvailable: true,
    ingredients: [],
    extras: [],
};

export default function ProductForm({
    categories,
    product,
    onSave,
    onCancel,
}: ProductFormProps) {
    const [form, setForm] = useState<Product>(emptyProduct);

    const [ingredientName, setIngredientName] = useState('');

    const [extraName, setExtraName] = useState('');
    const [extraPrice, setExtraPrice] = useState('');

    useEffect(() => {
        if (product) {
            setForm(product);
        } else {
            setForm(emptyProduct);
        }
    }, [product]);

    function updateField<K extends keyof Product>(
        key: K,
        value: Product[K]
    ) {
        setForm((prev) => ({
            ...prev,
            [key]: value,
        }));
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault();

        onSave({
            ...form,
            id: form.id || crypto.randomUUID(),
        });
    }

    function addIngredient() {
        if (!ingredientName.trim()) return;

        const ingredient: Ingredient = {
            id: crypto.randomUUID(),
            name: ingredientName.trim(),
        };

        updateField('ingredients', [
            ...(form.ingredients ?? []),
            ingredient,
        ]);

        setIngredientName('');
    }

    function removeIngredient(id: string) {
        updateField(
            'ingredients',
            (form.ingredients ?? []).filter(
                (ingredient) => ingredient.id !== id
            )
        );
    }

    function addExtra() {
        if (!extraName.trim()) return;

        const extra: Extra = {
            id: crypto.randomUUID(),
            name: extraName.trim(),
            price: Number(extraPrice) || 0,
        };

        updateField('extras', [
            ...(form.extras ?? []),
            extra,
        ]);

        setExtraName('');
        setExtraPrice('');
    }

    function removeExtra(id: string) {
        updateField(
            'extras',
            (form.extras ?? []).filter(
                (extra) => extra.id !== id
            )
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-6"
        >

            <Card title={product ? 'Editar producto' : 'Nuevo producto'}>

                <div className="grid gap-5 md:grid-cols-2">

                    <div>

                        <Label required>
                            Categoría
                        </Label>

                        <select
                            value={form.categoryId}
                            onChange={(e) =>
                                updateField(
                                    'categoryId',
                                    e.target.value
                                )
                            }
                            className="h-11 w-full rounded-lg border px-3"
                        >
                            <option value="">
                                Selecciona una categoría
                            </option>

                            {categories.map((category) => (
                                <option
                                    key={category.id}
                                    value={category.id}
                                >
                                    {category.emoji} {category.name}
                                </option>
                            ))}

                        </select>

                    </div>

                    <div>

                        <Label required>
                            Nombre
                        </Label>

                        <Input
                            required
                            value={form.name}
                            onChange={(e) =>
                                updateField(
                                    'name',
                                    e.target.value
                                )
                            }
                        />

                    </div>

                    <div className="md:col-span-2">

                        <Label>
                            Descripción
                        </Label>

                        <Textarea
                            rows={4}
                            value={form.description}
                            onChange={(e) =>
                                updateField(
                                    'description',
                                    e.target.value
                                )
                            }
                        />

                    </div>

                    <div>

                        <Label required>
                            Precio
                        </Label>

                        <Input
                            type="number"
                            min={0}
                            step="0.01"
                            value={form.price}
                            onChange={(e) =>
                                updateField(
                                    'price',
                                    Number(e.target.value)
                                )
                            }
                        />

                    </div>

                    <div>

                        <Label>
                            URL de la imagen
                        </Label>

                        <Input
                            placeholder="https://..."
                            value={form.image}
                            onChange={(e) =>
                                updateField(
                                    'image',
                                    e.target.value
                                )
                            }
                        />

                    </div>

                    <label className="flex items-center gap-3">

                        <input
                            type="checkbox"
                            checked={form.featured}
                            onChange={(e) =>
                                updateField(
                                    'featured',
                                    e.target.checked
                                )
                            }
                        />

                        <span>Producto destacado</span>

                    </label>

                    <label className="flex items-center gap-3">

                        <input
                            type="checkbox"
                            checked={form.isAvailable}
                            onChange={(e) =>
                                updateField(
                                    'isAvailable',
                                    e.target.checked
                                )
                            }
                        />

                        <span>Disponible</span>

                    </label>

                </div>

            </Card>

            <Card title="Ingredientes">

                <div className="flex gap-3">

                    <div className="flex-1">

                        <Label>
                            Ingrediente
                        </Label>

                        <Input
                            placeholder="Ej. Queso mozzarella"
                            value={ingredientName}
                            onChange={(e) =>
                                setIngredientName(
                                    e.target.value
                                )
                            }
                        />

                    </div>

                    <div className="flex items-end">

                        <Button
                            type="button"
                            leftIcon={<Plus size={18} />}
                            onClick={addIngredient}
                        >
                            Agregar
                        </Button>

                    </div>

                </div>

                {(form.ingredients?.length ?? 0) > 0 && (

                    <div className="mt-5 space-y-2">

                        {form.ingredients!.map((ingredient) => (

                            <div
                                key={ingredient.id}
                                className="flex items-center justify-between rounded-lg border p-3"
                            >

                                <span>
                                    {ingredient.name}
                                </span>

                                <Button
                                    type="button"
                                    variant="danger"
                                    size="sm"
                                    leftIcon={<Trash2 size={16} />}
                                    onClick={() =>
                                        removeIngredient(
                                            ingredient.id
                                        )
                                    }
                                >
                                    Eliminar
                                </Button>

                            </div>

                        ))}

                    </div>

                )}

            </Card>
            <Card title="Extras">

                <div className="grid gap-3 md:grid-cols-[1fr_160px_auto]">

                    <div>

                        <Label>
                            Nombre del extra
                        </Label>

                        <Input
                            placeholder="Ej. Tocineta"
                            value={extraName}
                            onChange={(e) =>
                                setExtraName(e.target.value)
                            }
                        />

                    </div>

                    <div>

                        <Label>
                            Precio
                        </Label>

                        <Input
                            type="number"
                            min={0}
                            step="0.01"
                            value={extraPrice}
                            onChange={(e) =>
                                setExtraPrice(e.target.value)
                            }
                        />

                    </div>

                    <div className="flex items-end">

                        <Button
                            type="button"
                            leftIcon={<Plus size={18} />}
                            onClick={addExtra}
                        >
                            Agregar
                        </Button>

                    </div>

                </div>

                {(form.extras?.length ?? 0) > 0 && (

                    <div className="mt-5 space-y-2">

                        {form.extras!.map((extra) => (

                            <div
                                key={extra.id}
                                className="flex items-center justify-between rounded-lg border p-3"
                            >

                                <div>

                                    <p className="font-medium">
                                        {extra.name}
                                    </p>

                                    <p className="text-sm text-gray-500">
                                        ${extra.price.toFixed(2)}
                                    </p>

                                </div>

                                <Button
                                    type="button"
                                    variant="danger"
                                    size="sm"
                                    leftIcon={<Trash2 size={16} />}
                                    onClick={() =>
                                        removeExtra(extra.id)
                                    }
                                >
                                    Eliminar
                                </Button>

                            </div>

                        ))}

                    </div>

                )}

            </Card>

            <div className="flex justify-end gap-3">

                <Button
                    type="button"
                    variant="secondary"
                    onClick={onCancel}
                >
                    Cancelar
                </Button>

                <Button type="submit">
                    {product
                        ? 'Guardar cambios'
                        : 'Crear producto'}
                </Button>

            </div>

        </form>
    );
}