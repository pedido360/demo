"use client";

import { useEffect, useState } from "react";

import {
    Plus,
    CalendarDays,
    Pencil,
    Trash2,
    ArrowLeft,
} from "lucide-react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

import { Product } from "@/types/product";
import { DailyMenu } from "@/types/daily-menu";

import DailyMenuForm from "./DailyMenuForm";

import {
    getRestaurantDailyMenus,
    createRestaurantDailyMenu,
    deleteRestaurantDailyMenu,
    publishRestaurantDailyMenu,
    saveRestaurantDailyMenu,
} from "@/lib/services/daily-menu.service";

import {
    getOrCreateDailyMenuProduct,
} from "@/lib/services/daily-menu-product.service";

import {
    generateDailyMenuImageAction,
} from "@/app/actions/daily-menu-image.action";


interface DailyMenuEditorProps {

    restaurantId: string;

    products: Product[];

    onBack: () => void;

}


export default function DailyMenuEditor({

    restaurantId,
    products,
    onBack,

}: DailyMenuEditorProps) {


    const [menus, setMenus] =
        useState<DailyMenu[]>([]);


    const [loading, setLoading] =
        useState(true);


    const [creating, setCreating] =
        useState(false);


    const [editingMenu, setEditingMenu] =
        useState<DailyMenu | null>(null);


    const [selectedDate, setSelectedDate] =
        useState("");


    const [error, setError] =
        useState<string | null>(null);

    const [successMessage, setSuccessMessage] =
        useState<string | null>(null);


    /*
     * El producto especial "Menú del Día"
     * continúa existiendo porque daily_menus
     * lo utiliza como producto principal.
     *
     * Las opciones internas del menú,
     * en cambio, ya NO utilizan products.
     */

    const dailyMenuProduct =
        products.find(
            product =>
                product.productType ===
                "daily_menu"
        );


    useEffect(() => {

        async function loadMenus() {

            try {

                setLoading(true);

                setError(null);


                const result =
                    await getRestaurantDailyMenus(
                        restaurantId
                    );


                setMenus(

                    result.sort(
                        (a, b) =>
                            a.menuDate.localeCompare(
                                b.menuDate
                            )
                    )

                );

            } catch (error) {

                console.error(error);


                setError(
                    "No fue posible cargar los Menús del Día."
                );

            } finally {

                setLoading(false);

            }

        }


        loadMenus();

    }, [restaurantId]);


    async function handleCreateMenu() {

        if (!selectedDate) {

            setError(
                "Selecciona una fecha."
            );

            return;

        }


        const alreadyExists =
            menus.some(
                menu =>
                    menu.menuDate ===
                    selectedDate
            );


        if (alreadyExists) {

            setError(
                "Ya existe un Menú del Día para esa fecha."
            );

            return;

        }


        try {

            setError(null);


            /*
             * Si el producto especial todavía
             * no existe, lo creamos.
             *
             * Este producto NO representa
             * las opciones internas.
             */

            const menuProduct =
                dailyMenuProduct ??
                await getOrCreateDailyMenuProduct(
                    restaurantId
                );


            const created =
                await createRestaurantDailyMenu(

                    restaurantId,

                    menuProduct.id,

                    selectedDate

                );


            setMenus(

                previous =>

                    [

                        ...previous,

                        created,

                    ].sort(
                        (a, b) =>
                            a.menuDate.localeCompare(
                                b.menuDate
                            )
                    )

            );


            setCreating(false);

            setSelectedDate("");


            setEditingMenu(
                created
            );

        } catch (error) {

            console.error(error);


            setError(

                error instanceof Error

                    ? error.message

                    : "No fue posible crear el menú."

            );

        }

    }


    async function handleSaveMenu(
        menu: DailyMenu
    ) {

        try {

            setError(null);


            const saved =
                await saveRestaurantDailyMenu(
                    restaurantId,
                    menu
                );


            let generatedMenu =
                saved;


            try {

                await generateDailyMenuImageAction(
                    restaurantId,
                    saved.id
                );


                const refreshedMenus =
                    await getRestaurantDailyMenus(
                        restaurantId
                    );


                const refreshedMenu =
                    refreshedMenus.find(
                        item =>
                            item.id ===
                            saved.id
                    );


                if (
                    refreshedMenu
                ) {

                    generatedMenu =
                        refreshedMenu;

                }

            } catch (imageError) {

                console.error(
                    "No fue posible generar la imagen del Menú del Día:",
                    imageError
                );

            }


            setSuccessMessage(
                menu.isPublished
                    ? "✓ Menú publicado correctamente."
                    : "✓ Menú guardado correctamente."
            );


            setMenus(

                previous =>

                    previous

                        .map(
                            item =>
                                item.id ===
                                    generatedMenu.id

                                    ? generatedMenu

                                    : item
                        )

                        .sort(
                            (a, b) =>
                                a.menuDate.localeCompare(
                                    b.menuDate
                                )
                        )

            );


            setEditingMenu(
                generatedMenu
            );


        } catch (error) {

            console.error(error);


            setError(

                error instanceof Error

                    ? error.message

                    : "No fue posible guardar el menú."

            );

        }

    }


    async function handleDeleteMenu(
        menu: DailyMenu
    ) {

        const confirmed =
            window.confirm(

                `¿Eliminar el Menú del Día del ${formatDate(
                    menu.menuDate
                )}?`

            );


        if (!confirmed) {

            return;

        }


        try {

            setError(null);


            await deleteRestaurantDailyMenu(

                restaurantId,

                menu.id

            );


            setMenus(

                previous =>
                    previous.filter(
                        item =>
                            item.id !==
                            menu.id
                    )

            );

        } catch (error) {

            console.error(error);


            setError(

                error instanceof Error

                    ? error.message

                    : "No fue posible eliminar el menú."

            );

        }

    }


    async function handleTogglePublished(
        menu: DailyMenu
    ) {

        try {

            setError(null);


            await publishRestaurantDailyMenu(

                restaurantId,

                menu.id,

                !menu.isPublished

            );


            setMenus(

                previous =>

                    previous.map(

                        item =>

                            item.id ===
                                menu.id

                                ? {

                                    ...item,

                                    isPublished:
                                        !item.isPublished,

                                }

                                : item

                    )

            );

        } catch (error) {

            console.error(error);


            setError(

                error instanceof Error

                    ? error.message

                    : "No fue posible cambiar el estado del menú."

            );

        }

    }


    function handleEditMenu(
        menu: DailyMenu
    ) {

        setError(null);

        setSuccessMessage(null);

        setEditingMenu(
            menu
        );

    }


    function handleCancelEdit() {

        setEditingMenu(
            null
        );

        setCreating(
            false
        );

        setSelectedDate("");

        setError(null);

    }


    if (loading) {

        return (

            <div className="space-y-4">

                <Button

                    type="button"

                    variant="secondary"

                    onClick={
                        onBack
                    }

                    leftIcon={
                        <ArrowLeft
                            size={16}
                        />
                    }

                >

                    Volver a Smart Menu

                </Button>


                <Card

                    title="🍽️ Menú del Día"

                    description="Configuración diaria del menú."

                >

                    <div className="rounded-xl border border-dashed p-8 text-center">

                        <p className="text-sm text-gray-500">

                            Cargando Menús del Día...

                        </p>

                    </div>

                </Card>

            </div>

        );

    }


    if (editingMenu) {

        const downloadDate =
            new Date(
                `${editingMenu.menuDate}T12:00:00`
            );


        const downloadFileName =
            `Menu-del-Dia-${String(
                downloadDate.getDate()
            ).padStart(
                2,
                "0"
            )
            }-${String(
                downloadDate.getMonth() + 1
            ).padStart(
                2,
                "0"
            )
            }-${downloadDate.getFullYear()
            }-Pedidos360.webp`;


        return (

            <div className="space-y-4">

                <Button

                    type="button"

                    variant="secondary"

                    onClick={
                        handleCancelEdit
                    }

                    leftIcon={
                        <ArrowLeft
                            size={16}
                        />
                    }

                >

                    Volver a Menús

                </Button>


                <Card

                    title="🍽️ Configurar Menú del Día"

                    description="Configura las opciones disponibles para esta fecha."

                >

                    <DailyMenuForm

                        restaurantId={
                            restaurantId
                        }

                        menu={
                            editingMenu
                        }

                        onSave={
                            handleSaveMenu
                        }

                        onCancel={
                            handleCancelEdit
                        }

                    />

                </Card>


                {editingMenu.image && (

                    <Card

                        title="🖼️ Imagen del Menú del Día"

                        description="Esta es la pieza gráfica generada para esta fecha."

                    >

                        <div className="space-y-4">

                            <div className="flex justify-center rounded-2xl border border-gray-200 bg-gray-50 p-4 shadow-sm">

                                <img
                                    src={
                                        editingMenu.image
                                    }
                                    alt="Imagen del Menú del Día"
                                    className="
                                        block
                                        h-auto
                                        max-h-[720px]
                                        w-auto
                                        max-w-full
                                        rounded-xl
                                        object-contain
                                    "
                                />

                            </div>


                            <button

                                type="button"

                                onClick={
                                    async () => {

                                        try {

                                            const response =
                                                await fetch(
                                                    editingMenu.image!
                                                );


                                            if (
                                                !response.ok
                                            ) {

                                                throw new Error(
                                                    "No fue posible descargar la imagen."
                                                );

                                            }


                                            const blob =
                                                await response.blob();


                                            const blobUrl =
                                                URL.createObjectURL(
                                                    blob
                                                );


                                            const link =
                                                document.createElement(
                                                    "a"
                                                );


                                            link.href =
                                                blobUrl;


                                            link.download =
                                                downloadFileName;


                                            document.body.appendChild(
                                                link
                                            );


                                            link.click();


                                            link.remove();


                                            URL.revokeObjectURL(
                                                blobUrl
                                            );

                                        } catch (
                                        downloadError
                                        ) {

                                            console.error(
                                                "No fue posible descargar la imagen:",
                                                downloadError
                                            );

                                        }

                                    }
                                }

                                className="
                                    flex
                                    w-full
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-xl
                                    bg-green-700
                                    px-5
                                    py-3
                                    text-sm
                                    font-bold
                                    text-white
                                    shadow-sm
                                    transition
                                    hover:bg-green-800
                                    active:scale-[0.99]
                                "

                            >

                                <span
                                    aria-hidden="true"
                                    className="text-lg"
                                >
                                    ↓
                                </span>

                                Descargar imagen

                            </button>


                            <p className="text-center text-xs text-gray-500">

                                Archivo:
                                {" "}
                                {downloadFileName}

                            </p>

                        </div>

                    </Card>

                )}

            </div>

        );

    }

    return (

        <div className="space-y-4">

            <Button

                type="button"

                variant="secondary"

                onClick={
                    onBack
                }

                leftIcon={
                    <ArrowLeft
                        size={16}
                    />
                }

            >

                Volver a Smart Menu

            </Button>


            <Card

                title="🍽️ Menú del Día"

                description="Configura el menú de cada día de forma independiente."

                actions={

                    !creating && (

                        <Button

                            leftIcon={
                                <Plus
                                    size={18}
                                />
                            }

                            onClick={() => {

                                setError(null);

                                setSuccessMessage(null);

                                setCreating(
                                    true
                                );

                            }}

                        >

                            Crear menú

                        </Button>

                    )

                }

            >

                {successMessage && (

                    <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">

                        {successMessage}

                    </div>

                )}

                {error && (

                    <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">

                        {error}

                    </div>

                )}

                {creating && (

                    <div className="mb-6 rounded-2xl border border-orange-200 bg-orange-50 p-5">

                        <div className="flex items-center gap-3">

                            <CalendarDays

                                size={22}

                                className="text-orange-600"

                            />

                            <div>

                                <h3 className="font-semibold text-gray-900">

                                    Crear Menú del Día

                                </h3>

                                <p className="text-sm text-gray-500">

                                    Primero selecciona la fecha.

                                </p>

                            </div>

                        </div>


                        <div className="mt-5">

                            <label className="mb-2 block text-sm font-medium text-gray-700">

                                Fecha

                            </label>


                            <input

                                type="date"

                                value={
                                    selectedDate
                                }

                                onChange={
                                    event =>
                                        setSelectedDate(
                                            event.target.value
                                        )
                                }

                                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"

                            />

                        </div>


                        <div className="mt-5 flex justify-end gap-3">

                            <Button

                                type="button"

                                variant="secondary"

                                onClick={() => {

                                    setCreating(
                                        false
                                    );

                                    setSelectedDate(
                                        ""
                                    );

                                    setError(
                                        null
                                    );

                                }}

                            >

                                Cancelar

                            </Button>


                            <Button

                                type="button"

                                onClick={
                                    handleCreateMenu
                                }

                            >

                                Continuar

                            </Button>

                        </div>

                    </div>

                )}


                {menus.length === 0 &&
                    !creating ? (

                    <div className="rounded-2xl border border-dashed border-orange-300 bg-orange-50 p-10 text-center">

                        <div className="text-4xl">

                            🍽️

                        </div>


                        <h3 className="mt-3 text-lg font-semibold text-gray-900">

                            Aún no hay Menús del Día

                        </h3>


                        <p className="mt-2 text-sm text-gray-500">

                            Crea el menú de una fecha y configura sus opciones.

                        </p>

                    </div>

                ) : (

                    <div className="space-y-3">

                        {menus.map(

                            menu => (

                                <div

                                    key={
                                        menu.id
                                    }

                                    className="flex flex-col gap-4 rounded-2xl border bg-white p-4 md:flex-row md:items-center md:justify-between"

                                >

                                    <div>

                                        <p className="font-semibold capitalize text-gray-900">

                                            {formatDate(
                                                menu.menuDate
                                            )}

                                        </p>


                                        <p className="mt-1 text-sm text-gray-500">

                                            {menu.items.length}

                                            {" "}

                                            componentes ·{" "}

                                            {menu.sizes.length}

                                            {" "}

                                            tamaños

                                        </p>

                                    </div>


                                    <div className="flex flex-wrap items-center gap-2">

                                        <span

                                            className={

                                                menu.isPublished

                                                    ? "rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700"

                                                    : "rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600"

                                            }

                                        >

                                            {menu.isPublished

                                                ? "Publicado"

                                                : "Borrador"}

                                        </span>


                                        <Button

                                            type="button"

                                            size="sm"

                                            variant="secondary"

                                            onClick={() =>
                                                handleEditMenu(
                                                    menu
                                                )
                                            }

                                        >

                                            <Pencil
                                                size={15}
                                            />

                                            Editar

                                        </Button>


                                        <Button

                                            type="button"

                                            size="sm"

                                            onClick={() =>
                                                handleTogglePublished(
                                                    menu
                                                )
                                            }

                                        >

                                            {menu.isPublished

                                                ? "Despublicar"

                                                : "Publicar"}

                                        </Button>


                                        <Button

                                            type="button"

                                            size="sm"

                                            variant="danger"

                                            onClick={() =>
                                                handleDeleteMenu(
                                                    menu
                                                )
                                            }

                                        >

                                            <Trash2
                                                size={15}
                                            />

                                            Eliminar

                                        </Button>

                                    </div>

                                </div>

                            )

                        )}

                    </div>

                )}

            </Card>

        </div >

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