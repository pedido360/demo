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
import ImageUploader from '@/components/ui/ImageUploader';

interface ProductFormProps {
    categories: Category[];
    product?: Product;
    initialCategoryId?: string;
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
    initialCategoryId,
    onSave,
    onCancel,
}: ProductFormProps) {

    const [form, setForm] = useState<Product>(emptyProduct);

    const [allDays, setAllDays] = useState(true);

    const [ingredientName, setIngredientName] = useState('');

    const [extraName, setExtraName] = useState('');
    const [extraPrice, setExtraPrice] = useState('');

    // Variantes
    const [variantLabel, setVariantLabel] = useState('');
    const [variantPrice, setVariantPrice] = useState('');

    useEffect(() => {

        if (product) {

            setForm({
                ...product,
                availableDays:
                    product.availableDays ?? [],
            });

            setAllDays(
                !product.availableDays ||
                product.availableDays.length === 0
            );

        } else {

            setForm({
                ...emptyProduct,
                categoryId:
                    initialCategoryId ?? "",
                availableDays: [],
            });

            setAllDays(true);

        }
    }, [product, initialCategoryId]);

    function updateField<K extends keyof Product>(
        key: K,
        value: Product[K]
    ) {
        setForm((prev) => ({
            ...prev,
            [key]: value,
        }));
    }

    function handleImage(
        file: File | null
    ) {

        if (!file) return;

        setForm((prev) => ({
            ...prev,
            image: URL.createObjectURL(file),
            imageFile: file,
        }));

    }

    function handleSubmit(e: FormEvent) {

        e.preventDefault();


        const availableDays =
            form.availableDays ?? [];


        if (
            !allDays &&
            availableDays.length === 0
        ) {

            alert(
                "Selecciona al menos un día de disponibilidad."
            );

            return;

        }


        onSave({

            ...form,

            id:
                form.id ||
                crypto.randomUUID(),

            availableDays:
                allDays
                    ? []
                    : availableDays,

        });

    }

    function addIngredient() {
        if (!ingredientName.trim()) return;

        const ingredient: Ingredient = {
            id: crypto.randomUUID(),
            name: ingredientName.trim(),
            isActive: true,
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
            isActive: true,
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

    function addVariant() {

        if (!variantLabel.trim()) return;

        const variants = form.variants ?? [];

        updateField(
            "variants",
            [
                ...variants,
                {
                    id: crypto.randomUUID(),
                    productId: form.id,
                    label: variantLabel.trim(),
                    price: Number(variantPrice) || 0,
                    isDefault: variants.length === 0,
                    isAvailable: true,
                    sortOrder: variants.length,
                },
            ]
        );

        setVariantLabel("");

        setVariantPrice("");

    }

    function removeVariant(
        id: string
    ) {

        updateField(
            "variants",
            (form.variants ?? []).filter(
                variant => variant.id !== id
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

                        <ImageUploader
                            label="Imagen del producto"
                            value={form.image}
                            onChange={handleImage}
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

                    <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">

                        <div className="mb-3">

                            <p className="font-semibold text-gray-900">
                                📅 Días de disponibilidad
                            </p>

                            <p className="mt-1 text-sm text-gray-500">
                                Define en qué días de la semana se puede vender este producto.
                            </p>

                        </div>


                        <label className="flex items-center gap-3">

                            <input
                                type="checkbox"
                                checked={allDays}
                                onChange={(e) => {

                                    const checked =
                                        e.target.checked;

                                    setAllDays(
                                        checked
                                    );

                                    if (checked) {

                                        updateField(
                                            'availableDays',
                                            []
                                        );

                                    }

                                }}
                            />

                            <span className="font-medium">
                                Disponible todos los días
                            </span>

                        </label>


                        {!allDays && (

                            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">

                                {[
                                    {
                                        value: 1,
                                        label: 'Lunes',
                                    },
                                    {
                                        value: 2,
                                        label: 'Martes',
                                    },
                                    {
                                        value: 3,
                                        label: 'Miércoles',
                                    },
                                    {
                                        value: 4,
                                        label: 'Jueves',
                                    },
                                    {
                                        value: 5,
                                        label: 'Viernes',
                                    },
                                    {
                                        value: 6,
                                        label: 'Sábado',
                                    },
                                    {
                                        value: 0,
                                        label: 'Domingo',
                                    },
                                ].map((day) => {

                                    const selected =
                                        (
                                            form.availableDays ??
                                            []
                                        ).includes(
                                            day.value
                                        );


                                    return (

                                        <label
                                            key={day.value}
                                            className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white p-3 hover:border-orange-300"
                                        >

                                            <input
                                                type="checkbox"
                                                checked={selected}
                                                onChange={(e) => {

                                                    const current =
                                                        form.availableDays ??
                                                        [];

                                                    const next =
                                                        e.target.checked

                                                            ? [
                                                                ...current,
                                                                day.value,
                                                            ]

                                                            : current.filter(
                                                                value =>
                                                                    value !==
                                                                    day.value
                                                            );

                                                    updateField(
                                                        'availableDays',
                                                        next
                                                    );

                                                }}
                                            />

                                            <span className="text-sm font-medium">
                                                {day.label}
                                            </span>

                                        </label>

                                    );

                                })}

                            </div>

                        )}

                    </div>

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

            <Card title="Variantes">

                <div className="grid gap-3 md:grid-cols-[1fr_160px_auto]">

                    <div>

                        <Label>
                            Presentación
                        </Label>

                        <Input
                            placeholder="Ej. 250 g"
                            value={variantLabel}
                            onChange={(e) =>
                                setVariantLabel(
                                    e.target.value
                                )
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
                            value={variantPrice}
                            onChange={(e) =>
                                setVariantPrice(
                                    e.target.value
                                )
                            }
                        />

                    </div>

                    <div className="flex items-end">

                        <Button
                            type="button"
                            leftIcon={<Plus size={18} />}
                            onClick={addVariant}
                        >
                            Agregar
                        </Button>

                    </div>

                </div>

                {(form.variants?.length ?? 0) > 0 && (

                    <div className="mt-5 space-y-2">

                        {form.variants!.map((variant) => (

                            <div
                                key={variant.id}
                                className="flex items-center justify-between rounded-lg border p-3"
                            >

                                <div>

                                    <p className="font-medium">
                                        {variant.label}
                                    </p>

                                    <p className="text-sm text-gray-500">
                                        ${variant.price.toFixed(2)}
                                    </p>

                                </div>

                                <Button
                                    type="button"
                                    variant="danger"
                                    size="sm"
                                    leftIcon={<Trash2 size={16} />}
                                    onClick={() =>
                                        removeVariant(
                                            variant.id
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