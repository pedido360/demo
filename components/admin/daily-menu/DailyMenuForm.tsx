"use client";

import { useMemo, useState } from "react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

import {
    DailyMenu,
    DailyMenuItem,
    DailyMenuOption,
    DailyMenuSection,
    DailyMenuSize,
} from "@/types/daily-menu";

import {
    getDailyMenuOptions,
    createDailyMenuOption,
} from "@/lib/repositories/daily-menu-option.repository";

import ImageUploader from "@/components/ui/ImageUploader";

import {
    uploadDailyMenuImage,
} from "@/lib/services/daily-menu-image-upload.service";

import {
    supabase,
} from "@/lib/supabase";

interface DailyMenuFormProps {

    restaurantId: string;

    menu: DailyMenu;

    onSave:
    (menu: DailyMenu) =>
        Promise<void>;

    onCancel:
    () => void;

}


export default function DailyMenuForm({

    restaurantId,
    menu,
    onSave,
    onCancel,

}: DailyMenuFormProps) {


    const [draft, setDraft] =
        useState<DailyMenu>(menu);

    const [menuCoverUrl, setMenuCoverUrl] =
        useState<string>("");

    useMemo(
        () => {

            const coverPath =
                `restaurants/${restaurantId}/daily-menu/${menu.id}/cover.webp`;

            const {
                data,
            } =
                supabase.storage
                    .from(
                        "restaurant-images"
                    )
                    .getPublicUrl(
                        coverPath
                    );

            setMenuCoverUrl(
                data.publicUrl
            );

        },
        [
            restaurantId,
            menu.id,
        ]
    );


    const [options, setOptions] =
        useState<DailyMenuOption[]>([]);


    const [saving, setSaving] =
        useState(false);

    const [uploadingImage, setUploadingImage] =
        useState(false);


    const [loadingOptions, setLoadingOptions] =
        useState(true);


    const [error, setError] =
        useState<string | null>(null);

    const [successMessage, setSuccessMessage] =
        useState<string | null>(null);


    const [newOptionSection, setNewOptionSection] =
        useState<DailyMenuSection | null>(null);


    const [newOptionName, setNewOptionName] =
        useState("");


    const [creatingOption, setCreatingOption] =
        useState(false);


    /*
     * Cargamos la biblioteca de opciones
     * del restaurante.
     */

    useMemo(
        () => {

            let cancelled = false;


            async function loadOptions() {

                try {

                    setLoadingOptions(true);


                    const result =
                        await getDailyMenuOptions(
                            restaurantId
                        );


                    if (!cancelled) {

                        setOptions(
                            result
                        );

                    }

                } catch (error) {

                    console.error(error);


                    if (!cancelled) {

                        setError(
                            error instanceof Error
                                ? error.message
                                : "No fue posible cargar las opciones."
                        );

                    }

                } finally {

                    if (!cancelled) {

                        setLoadingOptions(
                            false
                        );

                    }

                }

            }


            loadOptions();


            return () => {

                cancelled = true;

            };

        },
        [restaurantId]
    );


    const selectedSoup =
        draft.items.find(
            item =>
                item.section ===
                "soup"
        );


    const selectedSeco =
        draft.items
            .filter(
                item =>
                    item.section ===
                    "seco"
            )
            .sort(
                (a, b) =>
                    a.sortOrder -
                    b.sortOrder
            );


    const selectedPrinciples =
        draft.items
            .filter(
                item =>
                    item.section ===
                    "principle"
            )
            .sort(
                (a, b) =>
                    a.sortOrder -
                    b.sortOrder
            );


    const selectedProteins =
        draft.items
            .filter(
                item =>
                    item.section ===
                    "protein"
            )
            .sort(
                (a, b) =>
                    a.sortOrder -
                    b.sortOrder
            );


    const selectedDrinks =
        draft.items
            .filter(
                item =>
                    item.section ===
                    "drink"
            )
            .sort(
                (a, b) =>
                    a.sortOrder -
                    b.sortOrder
            );


    const selectedDesserts =
        draft.items
            .filter(
                item =>
                    item.section ===
                    "dessert"
            )
            .sort(
                (a, b) =>
                    a.sortOrder -
                    b.sortOrder
            );


    function getOptions(
        section: DailyMenuSection
    ) {

        return options.filter(
            option =>
                option.section ===
                section &&
                option.isActive
        );

    }


    function optionName(
        optionId: string
    ): string {

        return (
            options.find(
                option =>
                    option.id ===
                    optionId
            )?.name ??
            "Opción"
        );

    }


    function selectFixedOption(
        section: "soup",
        optionId: string
    ) {

        setDraft(
            current => {

                const remaining =
                    current.items.filter(
                        item =>
                            item.section !==
                            section
                    );


                const item:
                    DailyMenuItem = {

                    id:
                        selectedSoup?.id ??
                        crypto.randomUUID(),

                    dailyMenuId:
                        current.id,

                    optionId,

                    section,

                    sortOrder:
                        0,

                };


                return {

                    ...current,

                    items: [
                        ...remaining,
                        item,
                    ],

                };

            }
        );

    }


    function toggleSectionOption(
        section:
            | "seco"
            | "principle"
            | "protein"
            | "drink"
            | "dessert",
        optionId: string
    ) {

        setDraft(
            current => {

                const currentItems =
                    current.items
                        .filter(
                            item =>
                                item.section ===
                                section
                        );


                const alreadySelected =
                    currentItems.some(
                        item =>
                            item.optionId ===
                            optionId
                    );


                if (
                    alreadySelected
                ) {

                    const remaining =
                        currentItems
                            .filter(
                                item =>
                                    item.optionId !==
                                    optionId
                            )
                            .map(
                                (
                                    item,
                                    index
                                ) => ({

                                    ...item,

                                    sortOrder:
                                        index,

                                })
                            );


                    return {

                        ...current,

                        items: [

                            ...current.items
                                .filter(
                                    item =>
                                        item.section !==
                                        section
                                ),

                            ...remaining,

                        ],

                    };

                }


                const limits: Record<
                    string,
                    number
                > = {

                    seco: 4,

                    principle: 4,

                    protein: 4,

                    drink: 20,

                    dessert: 20,

                };


                const limit =
                    limits[section];


                if (
                    currentItems.length >=
                    limit
                ) {

                    setError(

                        section === "seco"

                            ? "El seco puede tener máximo 4 componentes."

                            : section === "principle"

                                ? "Debes seleccionar un solo principio."

                                : section === "protein"

                                    ? "Puedes habilitar máximo 4 proteínas."

                                    : section === "drink"

                                        ? "Puedes configurar varias bebidas."

                                        : "Puedes configurar varias opciones de postre."

                    );


                    return current;

                }


                const item:
                    DailyMenuItem = {

                    id:
                        crypto.randomUUID(),

                    dailyMenuId:
                        current.id,

                    optionId,

                    section,

                    sortOrder:
                        currentItems.length,

                };


                return {

                    ...current,

                    items: [

                        ...current.items,

                        item,

                    ],

                };

            }
        );

    }


    function openNewOption(
        section: DailyMenuSection
    ) {

        setNewOptionSection(
            section
        );

        setNewOptionName(
            ""
        );

        setError(
            null
        );

    }


    function cancelNewOption() {

        setNewOptionSection(
            null
        );

        setNewOptionName(
            ""
        );

    }


    async function handleCreateOption() {

        if (
            !newOptionSection
        ) {

            return;

        }


        const name =
            newOptionName.trim();


        if (!name) {

            setError(
                "Escribe el nombre de la opción."
            );

            return;

        }


        try {

            setCreatingOption(
                true
            );

            setError(
                null
            );


            const created =
                await createDailyMenuOption({

                    id: "",

                    restaurantId,

                    section:
                        newOptionSection,

                    name,

                    isActive:
                        true,

                    sortOrder:
                        getOptions(
                            newOptionSection
                        ).length,

                    createdAt:
                        new Date().toISOString(),

                });


            setOptions(
                current => [
                    ...current,
                    created,
                ]
            );


            /*
             * La nueva opción queda
             * automáticamente seleccionada
             * en el menú actual.
             */

            if (
                newOptionSection ===
                "soup"
            ) {

                selectFixedOption(
                    "soup",
                    created.id
                );

            } else {

                toggleSectionOption(
                    newOptionSection,
                    created.id
                );

            }


            cancelNewOption();

        } catch (error) {

            console.error(error);

            setError(

                error instanceof Error
                    ? error.message
                    : "No fue posible crear la opción."

            );

        } finally {

            setCreatingOption(
                false
            );

        }

    }

    async function handleMenuImageUpload(
        file: File | null
    ) {

        if (!file) {

            return;

        }


        try {

            setUploadingImage(
                true
            );

            setError(
                null
            );


            await uploadDailyMenuImage(
                restaurantId,
                draft.id,
                file
            );


        } catch (error) {

            console.error(
                "Error subiendo imagen del Menú del Día:",
                error
            );


            setError(

                error instanceof Error
                    ? error.message
                    : "No fue posible subir la imagen."

            );

        } finally {

            setUploadingImage(
                false
            );

        }

    }

    function addSize() {

        const newSize:
            DailyMenuSize = {

            id:
                crypto.randomUUID(),

            dailyMenuId:
                draft.id,

            label:
                "",

            price:
                0,

            isAvailable:
                true,

            sortOrder:
                draft.sizes.length,

        };


        setDraft(
            current => ({

                ...current,

                sizes: [

                    ...current.sizes,

                    newSize,

                ],

            })
        );

    }


    function updateSize(

        id: string,

        field:
            "label"
            | "price"
            | "isAvailable",

        value:
            string
            | number
            | boolean

    ) {

        setDraft(
            current => ({

                ...current,

                sizes:
                    current.sizes.map(
                        size =>
                            size.id === id
                                ? {

                                    ...size,

                                    [field]:
                                        value,

                                }
                                : size
                    ),

            })
        );

    }


    function removeSize(
        id: string
    ) {

        setDraft(
            current => ({

                ...current,

                sizes:
                    current.sizes

                        .filter(
                            size =>
                                size.id !==
                                id
                        )

                        .map(
                            (
                                size,
                                index
                            ) => ({

                                ...size,

                                sortOrder:
                                    index,

                            })
                        ),

            })
        );

    }


    async function handleSave(
        publish: boolean
    ) {

        setError(
            null
        );


        if (
            !selectedSoup
        ) {

            setError(
                "Debes seleccionar una sopa."
            );

            return;

        }


        if (
            selectedSeco.length < 3
            ||
            selectedSeco.length > 4
        ) {

            setError(
                "Debes seleccionar entre 3 y 4 componentes para el seco."
            );

            return;

        }

        if (
            selectedPrinciples.length < 2
        ) {

            setError(
                "Debes seleccionar al menos 2 opciones de principio."
            );

            return;

        }


        /*
         * Proteína es opcional.
         *
         * Si se configura,
         * debe tener entre 3 y 4 opciones.
         */

        if (

            selectedProteins.length > 0
            &&
            (
                selectedProteins.length < 3
                ||
                selectedProteins.length > 4
            )

        ) {

            setError(
                "La proteína debe tener 3 o 4 opciones."
            );

            return;

        }



        /*
* Bebida:
*
* El restaurante debe configurar
* al menos una opción.
*
* El cliente posteriormente
* escogerá exactamente una.
*/

        if (
            selectedDrinks.length === 0
        ) {

            setError(
                "Debes configurar al menos una bebida."
            );

            return;

        }

        /*
 * Postre:
 *
 * Es opcional.
 *
 * Puede haber varias opciones.
 *
 * El cliente posteriormente
 * escogerá exactamente una.
 */


        if (
            draft.sizes.length === 0
        ) {

            setError(
                "Debes agregar al menos un tamaño de plato."
            );

            return;

        }


        for (
            const size
            of draft.sizes
        ) {

            if (
                !size.label.trim()
            ) {

                setError(
                    "Todos los tamaños deben tener un nombre."
                );

                return;

            }


            if (
                size.price < 0
            ) {

                setError(
                    "El precio no puede ser negativo."
                );

                return;

            }

        }


        try {

            setSaving(
                true
            );


            await onSave({

                ...draft,

                restaurantId,

                isPublished:
                    publish,

            });

        } catch (error) {

            console.error(
                error
            );


            setError(

                error instanceof Error
                    ? error.message
                    : "No fue posible guardar el menú."

            );

        } finally {

            setSaving(
                false
            );

        }

    }


    function renderOptionSection(

        section:
            DailyMenuSection,

        title:
            string,

        description:
            string,

        selectedItems:
            DailyMenuItem[],

        color:
            "orange"
            | "green"
            | "blue"
            | "purple"

    ) {

        const sectionOptions =
            getOptions(
                section
            );


        const isSingle =
            section === "soup"
            ||
            section === "principle";


        const isOptional =
            section ===
            "protein"
            ||
            section ===
            "dessert";


        return (

            <Card
                title={title}
                description={
                    description
                }
            >

                <div className="space-y-4">

                    <div className="grid gap-3 sm:grid-cols-2">

                        {sectionOptions.map(

                            option => {

                                const selected =
                                    selectedItems.some(
                                        item =>
                                            item.optionId ===
                                            option.id
                                    );


                                return (

                                    <button

                                        key={
                                            option.id
                                        }

                                        type="button"

                                        onClick={() => {

                                            if (
                                                section === "soup"
                                            ) {

                                                selectFixedOption(
                                                    "soup",
                                                    option.id
                                                );

                                            } else {

                                                toggleSectionOption(
                                                    section as
                                                    | "seco"
                                                    | "principle"
                                                    | "protein"
                                                    | "drink"
                                                    | "dessert",
                                                    option.id
                                                );

                                            }

                                        }}

                                        className={`

                                            rounded-xl
                                            border
                                            p-4
                                            text-left
                                            transition

                                            ${selected

                                                ? color ===
                                                    "green"

                                                    ? "border-green-500 bg-green-50 ring-2 ring-green-100"

                                                    : color ===
                                                        "blue"

                                                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"

                                                        : color ===
                                                            "purple"

                                                            ? "border-purple-500 bg-purple-50 ring-2 ring-purple-100"

                                                            : "border-orange-500 bg-orange-50 ring-2 ring-orange-100"

                                                : "border-gray-200 bg-white hover:border-orange-300"

                                            }

                                        `}

                                    >

                                        <div className="flex items-center justify-between gap-3">

                                            <span className="font-semibold text-gray-900">

                                                {
                                                    option.name
                                                }

                                            </span>


                                            {selected && (

                                                <span className="text-sm font-bold">

                                                    ✓

                                                </span>

                                            )}

                                        </div>

                                    </button>

                                );

                            }

                        )}

                    </div>


                    {sectionOptions.length === 0 && (

                        <div className="rounded-xl border border-dashed p-5 text-center text-sm text-gray-500">

                            No hay opciones creadas todavía.

                        </div>

                    )}


                    {isOptional && (

                        <p className="text-sm text-gray-500">

                            Este componente es opcional.

                        </p>

                    )}


                    {newOptionSection ===
                        section ? (

                        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">

                            <label className="text-sm font-semibold text-gray-800">

                                Nombre de la nueva opción

                            </label>


                            <input

                                type="text"

                                value={
                                    newOptionName
                                }

                                onChange={
                                    event =>
                                        setNewOptionName(
                                            event.target.value
                                        )
                                }

                                placeholder={
                                    section === "soup"

                                        ? "Ej. Sopa de menudencia"

                                        : section === "seco"

                                            ? "Ej. Papa en chupe"

                                            : section === "principle"

                                                ? "Ej. Lentejas"

                                                : section === "protein"

                                                    ? "Ej. Pollo"

                                                    : section === "drink"

                                                        ? "Ej. Limonada"

                                                        : "Ej. Arroz con leche"
                                }

                                className="mt-2 h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-orange-500"

                            />


                            <div className="mt-3 flex gap-2">

                                <Button

                                    type="button"

                                    onClick={
                                        handleCreateOption
                                    }

                                    disabled={
                                        creatingOption
                                    }

                                >

                                    {creatingOption
                                        ? "Guardando..."
                                        : "Guardar opción"}

                                </Button>


                                <Button

                                    type="button"

                                    variant="secondary"

                                    onClick={
                                        cancelNewOption
                                    }

                                    disabled={
                                        creatingOption
                                    }

                                >

                                    Cancelar

                                </Button>

                            </div>

                        </div>

                    ) : (

                        <Button

                            type="button"

                            variant="secondary"

                            onClick={() =>
                                openNewOption(
                                    section
                                )
                            }

                        >

                            + Agregar opción

                        </Button>

                    )}

                </div>

            </Card>

        );

    }


    if (
        loadingOptions
    ) {

        return (

            <div className="rounded-xl border bg-white p-8 text-center text-sm text-gray-500">

                Cargando opciones del Menú del Día...

            </div>

        );

    }


    return (

        <div className="space-y-6">

            {error && (

                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">

                    {error}

                </div>

            )}


            <Card

                title="📅 Fecha del menú"

                description="Cada fecha tiene su propia configuración."

            >

                <div className="rounded-xl bg-gray-50 p-4">

                    <p className="text-sm font-medium text-gray-500">

                        Menú configurado para

                    </p>


                    <p className="mt-1 text-lg font-bold capitalize text-gray-900">

                        {formatDate(
                            draft.menuDate
                        )}

                    </p>

                </div>

            </Card>

            <Card

                title="🖼️ Imagen del Menú"

                description="Esta imagen será utilizada como fotografía principal de la pieza gráfica del Menú del Día."

            >

                <div className="space-y-4">

                    <ImageUploader

                        label="Imagen del Menú"

                        value={
                            menuCoverUrl
                        }

                        onChange={
                            handleMenuImageUpload
                        }

                    />

                    {uploadingImage && (

                        <p className="text-sm text-gray-500">
                            Subiendo imagen...
                        </p>

                    )}

                    <p className="text-xs text-gray-500">
                        Recomendamos una fotografía horizontal,
                        clara y relacionada con el plato o la
                        especialidad del restaurante.
                    </p>

                </div>

            </Card>


            {renderOptionSection(

                "soup",

                "🍲 Sopa",

                "Selecciona una sola sopa para este día. Es un componente fijo.",

                selectedSoup
                    ? [selectedSoup]
                    : [],

                "orange"

            )}


            {renderOptionSection(

                "seco",

                "🍛 Seco",

                `Selecciona entre 3 y 4 componentes fijos. Actualmente: ${selectedSeco.length}/4.`,

                selectedSeco,

                "orange"

            )}

            {renderOptionSection(

                "principle",

                "🥣 Principio",

                "Selecciona un solo principio para este día. El cliente escogerá uno.",

                selectedPrinciples,

                "green"

            )}


            {renderOptionSection(

                "protein",

                "🥩 Proteína",

                "Opcional. Si la habilitas, el cliente escogerá una de las opciones.",

                selectedProteins,

                "green"

            )}


            {renderOptionSection(

                "drink",

                "🥤 Bebida",

                "Puedes configurar varias bebidas. El cliente escogerá una sola.",

                selectedDrinks,

                "blue"

            )}


            {renderOptionSection(

                "dessert",

                "🍰 Postre",

                "Opcional. Puedes configurar varias opciones. El cliente escogerá una sola.",

                selectedDesserts,

                "purple"

            )}


            <Card

                title="📏 Tamaño del plato"

                description="El cliente deberá escoger una sola opción."

            >

                <div className="space-y-3">

                    {draft.sizes.map(

                        size => (

                            <div

                                key={
                                    size.id
                                }

                                className="grid gap-3 rounded-xl border bg-white p-4 sm:grid-cols-[1fr_180px_auto]"

                            >

                                <input

                                    type="text"

                                    value={
                                        size.label
                                    }

                                    onChange={
                                        event =>
                                            updateSize(

                                                size.id,

                                                "label",

                                                event.target.value

                                            )
                                    }

                                    placeholder="Ej. Ejecutivo"

                                    className="h-11 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-orange-500"

                                />


                                <input

                                    type="number"

                                    min="0"

                                    value={
                                        size.price
                                    }

                                    onChange={
                                        event =>
                                            updateSize(

                                                size.id,

                                                "price",

                                                Number(
                                                    event.target.value
                                                )

                                            )
                                    }

                                    placeholder="Precio"

                                    className="h-11 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-orange-500"

                                />


                                <Button

                                    type="button"

                                    variant="danger"

                                    size="sm"

                                    onClick={() =>
                                        removeSize(
                                            size.id
                                        )
                                    }

                                >

                                    Eliminar

                                </Button>

                            </div>

                        )

                    )}


                    <Button

                        type="button"

                        variant="secondary"

                        onClick={
                            addSize
                        }

                    >

                        + Agregar tamaño

                    </Button>

                </div>

            </Card>


            <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">

                <Button

                    type="button"

                    variant="secondary"

                    onClick={
                        onCancel
                    }

                    disabled={
                        saving
                    }

                >

                    Cancelar

                </Button>


                <Button

                    type="button"

                    variant="secondary"

                    onClick={() =>
                        handleSave(
                            false
                        )
                    }

                    disabled={
                        saving
                    }

                >

                    {saving

                        ? "Guardando..."

                        : "Guardar borrador"}

                </Button>


                <Button

                    type="button"

                    onClick={() =>
                        handleSave(
                            true
                        )
                    }

                    disabled={
                        saving
                    }

                >

                    {saving

                        ? "Guardando..."

                        : "Guardar y publicar"}

                </Button>

            </div>

        </div>

    );

}


function formatDate(
    value: string
): string {

    const date =
        new Date(
            `${value}T00:00:00`
        );


    return date.toLocaleDateString(

        "es-CO",

        {

            weekday:
                "long",

            day:
                "numeric",

            month:
                "long",

            year:
                "numeric",

        }

    );

}