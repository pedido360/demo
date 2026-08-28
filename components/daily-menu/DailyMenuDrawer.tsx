"use client";

import { useEffect, useMemo, useState } from "react";

import {
    DailyMenuClient,
    DailyMenuClientOption,
} from "@/types/daily-menu";

import QuantitySelector from "@/components/product/QuantitySelector";


interface DailyMenuDrawerProps {

    menu: DailyMenuClient | null;

    open: boolean;

    onClose: () => void;

    onAdd: (selection: {

        size: {
            id: string;
            label: string;
            price: number;
        };

        soup?: DailyMenuClientOption;

        secos: DailyMenuClientOption[];

        principle?: DailyMenuClientOption;

        protein?: DailyMenuClientOption;

        drink?: DailyMenuClientOption;

        dessert?: DailyMenuClientOption;

        quantity: number;

        notes: string;

    }) => void;

}


export default function DailyMenuDrawer({

    menu,
    open,
    onClose,
    onAdd,

}: DailyMenuDrawerProps) {


    const [mounted, setMounted] =
        useState(false);

    const [selectedSize, setSelectedSize] =
        useState("");

    const [selectedPrinciple, setSelectedPrinciple] =
        useState("");

    const [selectedProtein, setSelectedProtein] =
        useState("");

    const [selectedDrink, setSelectedDrink] =
        useState("");

    const [selectedDessert, setSelectedDessert] =
        useState("");

    const [quantity, setQuantity] =
        useState(1);

    const [notes, setNotes] =
        useState("");


    useEffect(() => {

        if (open) {

            requestAnimationFrame(
                () => setMounted(true)
            );

            document.body.style.overflow =
                "hidden";

            setSelectedSize("");

            setSelectedPrinciple("");

            setSelectedProtein("");

            setSelectedDrink("");

            setSelectedDessert("");

            setQuantity(1);

            setNotes("");

        } else {

            setMounted(false);

            document.body.style.overflow =
                "";

        }

        return () => {

            document.body.style.overflow =
                "";

        };

    }, [open]);


    const soupOptions =
        useMemo(
            () =>
                menu?.options.filter(
                    option =>
                        option.section ===
                        "soup"
                ) ?? [],
            [menu]
        );


    const secoOptions =
        useMemo(
            () =>
                menu?.options.filter(
                    option =>
                        option.section ===
                        "seco"
                ) ?? [],
            [menu]
        );


    const principleOptions =
        useMemo(
            () =>
                menu?.options.filter(
                    option =>
                        option.section ===
                        "principle"
                ) ?? [],
            [menu]
        );


    const proteinOptions =
        useMemo(
            () =>
                menu?.options.filter(
                    option =>
                        option.section ===
                        "protein"
                ) ?? [],
            [menu]
        );


    const drinkOptions =
        useMemo(
            () =>
                menu?.options.filter(
                    option =>
                        option.section ===
                        "drink"
                ) ?? [],
            [menu]
        );


    const dessertOptions =
        useMemo(
            () =>
                menu?.options.filter(
                    option =>
                        option.section ===
                        "dessert"
                ) ?? [],
            [menu]
        );


    const selectedSizeObject =
        menu?.sizes.find(
            size =>
                size.id ===
                selectedSize
        );


    const selectedSoup =
        soupOptions[0];


    const selectedPrincipleObject =
        principleOptions.find(
            option =>
                option.id ===
                selectedPrinciple
        );


    const selectedProteinObject =
        proteinOptions.find(
            option =>
                option.id ===
                selectedProtein
        );


    const selectedDrinkObject =
        drinkOptions.find(
            option =>
                option.id ===
                selectedDrink
        );


    const selectedDessertObject =
        dessertOptions.find(
            option =>
                option.id ===
                selectedDessert
        );


    /*
     * La sopa y los secos vienen
     * definidos por el restaurante.
     *
     * El cliente no debe volver
     * a seleccionarlos.
     */


    const canAdd =
        !!selectedSizeObject &&
        !!selectedSoup &&
        secoOptions.length >= 3 &&
        secoOptions.length <= 4 &&
        !!selectedPrincipleObject &&
        !!selectedDrinkObject &&
        (
            proteinOptions.length === 0 ||
            !!selectedProteinObject
        );


    function handleAdd() {

        if (!canAdd) {

            return;

        }


        if (!selectedSizeObject) {

            return;

        }


        onAdd({

            size: {

                id:
                    selectedSizeObject.id,

                label:
                    selectedSizeObject.label,

                price:
                    selectedSizeObject.price,

            },

            soup:
                selectedSoup,

            secos:
                secoOptions,

            principle:
                selectedPrincipleObject,

            protein:
                selectedProteinObject,

            drink:
                selectedDrinkObject,

            dessert:
                selectedDessertObject,

            quantity,

            notes,

        });

        onClose();

    }


    if (!menu) {

        return null;

    }


    return (

        <div
            className={`
                fixed
                inset-0
                z-50
                ${open
                    ? "pointer-events-auto"
                    : "pointer-events-none"
                }
            `}
        >

            {/* Overlay */}

            <div
                onClick={onClose}
                className={`
                    absolute
                    inset-0
                    bg-black/50
                    backdrop-blur-sm
                    transition-opacity
                    duration-300
                    ${mounted
                        ? "opacity-100"
                        : "opacity-0"
                    }
                `}
            />


            {/* Drawer */}

            <div
                className={`
                    absolute
                    bottom-0
                    left-1/2
                    w-full
                    max-w-md
                    -translate-x-1/2
                    rounded-t-3xl
                    bg-white
                    shadow-2xl
                    transition-transform
                    duration-300
                    ${mounted
                        ? "translate-y-0"
                        : "translate-y-full"
                    }
                `}
            >

                <div className="flex justify-center py-3">

                    <div className="h-1.5 w-14 rounded-full bg-gray-300" />

                </div>


                <div className="flex max-h-[90vh] flex-col">

                    <div className="flex-1 overflow-y-auto px-6 pb-8">

                        <h2 className="text-center text-2xl font-bold">

                            🍽️ Menú del Día

                        </h2>


                        <p className="mt-2 text-center text-sm text-gray-500">

                            Arma tu menú y elige tus opciones.

                        </p>


                        {/* ==================================================
                            PIEZA GRÁFICA DEL MENÚ
                            Solo aplica al Menú del Día.
                            La imagen ya generada por el restaurante
                            se muestra completa antes del formulario.
                           ================================================== */}

                        {menu.image && (

                            <section className="mt-6">

                                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-sm">

                                    <img
                                        src={
                                            menu.image
                                        }
                                        alt="Menú del Día"
                                        className="block h-auto w-full object-contain"
                                    />

                                </div>


                                <div
                                    className="
        mt-3
        rounded-xl
        border
        border-green-100
        bg-green-50
        px-4
        py-3
        text-center
    "
                                >
                                    <p
                                        className="
            text-sm
            font-bold
            text-green-900
        "
                                    >
                                        🍽️ Arma tu Menú del Día
                                    </p>

                                    <p
                                        className="
            mt-1
            text-xs
            leading-5
            text-green-800
        "
                                    >
                                        Selecciona los componentes que deseas,
                                        elige tu tamaño y agrega el menú a tu pedido.
                                    </p>
                                </div>

                            </section>

                        )}


                        {/* TAMAÑO */}

                        <section className="mt-8">

                            <h3 className="mb-3 text-lg font-semibold">

                                📏 Tamaño del menú

                            </h3>


                            <div className="space-y-3">

                                {menu.sizes
                                    .filter(
                                        size =>
                                            size.isAvailable
                                    )
                                    .map(
                                        size => (

                                            <label
                                                key={size.id}
                                                className={`
                                                    flex
                                                    cursor-pointer
                                                    items-center
                                                    justify-between
                                                    rounded-xl
                                                    border
                                                    p-4
                                                    transition
                                                    ${selectedSize ===
                                                        size.id
                                                        ? "border-orange-500 bg-orange-50"
                                                        : "border-gray-200"
                                                    }
                                                `}
                                            >

                                                <div className="flex items-center gap-3">

                                                    <input
                                                        type="radio"
                                                        name="daily-menu-size"
                                                        checked={
                                                            selectedSize ===
                                                            size.id
                                                        }
                                                        onChange={() =>
                                                            setSelectedSize(
                                                                size.id
                                                            )
                                                        }
                                                    />

                                                    <span className="font-medium">

                                                        {size.label}

                                                    </span>

                                                </div>


                                                <span className="font-bold text-orange-600">

                                                    $
                                                    {size.price.toLocaleString(
                                                        "es-CO"
                                                    )}

                                                </span>

                                            </label>

                                        )
                                    )}

                            </div>

                        </section>


                        {/* SOPA FIJA */}

                        <section className="mt-8">

                            <h3 className="mb-3 text-lg font-semibold">

                                🍲 Sopa

                            </h3>


                            {selectedSoup ? (

                                <div className="rounded-xl border border-green-200 bg-green-50 p-4">

                                    <div className="flex items-center gap-3">

                                        <span className="text-green-600">
                                            ✓
                                        </span>

                                        <span className="font-medium text-gray-800">

                                            {selectedSoup.name}

                                        </span>

                                    </div>

                                </div>

                            ) : (

                                <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500">

                                    No hay sopa configurada.

                                </p>

                            )}

                        </section>


                        {/* SECOS FIJOS */}

                        <section className="mt-8">

                            <h3 className="mb-3 text-lg font-semibold">

                                🍛 Seco

                            </h3>


                            <p className="mb-3 text-sm text-gray-500">

                                Componentes incluidos en este menú.

                            </p>


                            <div className="space-y-3">

                                {secoOptions.map(
                                    option => (

                                        <div
                                            key={option.id}
                                            className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4"
                                        >

                                            <span className="text-green-600">
                                                ✓
                                            </span>

                                            <span className="font-medium">

                                                {option.name}

                                            </span>

                                        </div>

                                    )
                                )}

                            </div>

                        </section>


                        {/* PRINCIPIO */}

                        <section className="mt-8">

                            <h3 className="mb-3 text-lg font-semibold">

                                🥣 Principio

                            </h3>

                            <p className="mb-3 text-sm text-gray-500">

                                Elige una opción.

                            </p>

                            <div className="space-y-3">

                                {principleOptions.map(
                                    option => (

                                        <label
                                            key={option.id}
                                            className={`
                                                flex
                                                cursor-pointer
                                                items-center
                                                gap-3
                                                rounded-xl
                                                border
                                                p-4
                                                transition
                                                ${selectedPrinciple ===
                                                    option.id
                                                    ? "border-orange-500 bg-orange-50"
                                                    : "border-gray-200"
                                                }
                                            `}
                                        >

                                            <input
                                                type="radio"
                                                name="daily-menu-principle"
                                                checked={
                                                    selectedPrinciple ===
                                                    option.id
                                                }
                                                onChange={() =>
                                                    setSelectedPrinciple(
                                                        option.id
                                                    )
                                                }
                                            />

                                            <span>

                                                {option.name}

                                            </span>

                                        </label>

                                    )
                                )}

                            </div>

                        </section>


                        {/* PROTEÍNA */}

                        {proteinOptions.length > 0 && (

                            <section className="mt-8">

                                <h3 className="mb-3 text-lg font-semibold">

                                    🥩 Proteína

                                </h3>

                                <p className="mb-3 text-sm text-gray-500">

                                    Elige una opción.

                                </p>


                                <div className="space-y-3">

                                    {proteinOptions.map(
                                        option => (

                                            <label
                                                key={option.id}
                                                className={`
                                                    flex
                                                    cursor-pointer
                                                    items-center
                                                    gap-3
                                                    rounded-xl
                                                    border
                                                    p-4
                                                    transition
                                                    ${selectedProtein ===
                                                        option.id
                                                        ? "border-orange-500 bg-orange-50"
                                                        : "border-gray-200"
                                                    }
                                                `}
                                            >

                                                <input
                                                    type="radio"
                                                    name="daily-menu-protein"
                                                    checked={
                                                        selectedProtein ===
                                                        option.id
                                                    }
                                                    onChange={() =>
                                                        setSelectedProtein(
                                                            option.id
                                                        )
                                                    }
                                                />

                                                <span>

                                                    {option.name}

                                                </span>

                                            </label>

                                        )
                                    )}

                                </div>

                            </section>

                        )}


                        {/* BEBIDA */}

                        <section className="mt-8">

                            <h3 className="mb-3 text-lg font-semibold">

                                🥤 Bebida

                            </h3>

                            <p className="mb-3 text-sm text-gray-500">

                                Elige una opción.

                            </p>


                            <div className="space-y-3">

                                {drinkOptions.map(
                                    option => (

                                        <label
                                            key={option.id}
                                            className={`
                                                flex
                                                cursor-pointer
                                                items-center
                                                gap-3
                                                rounded-xl
                                                border
                                                p-4
                                                transition
                                                ${selectedDrink ===
                                                    option.id
                                                    ? "border-orange-500 bg-orange-50"
                                                    : "border-gray-200"
                                                }
                                            `}
                                        >

                                            <input
                                                type="radio"
                                                name="daily-menu-drink"
                                                checked={
                                                    selectedDrink ===
                                                    option.id
                                                }
                                                onChange={() =>
                                                    setSelectedDrink(
                                                        option.id
                                                    )
                                                }
                                            />

                                            <span>

                                                {option.name}

                                            </span>

                                        </label>

                                    )
                                )}

                            </div>

                        </section>


                        {/* POSTRE */}

                        {dessertOptions.length > 0 && (

                            <section className="mt-8">

                                <h3 className="mb-3 text-lg font-semibold">

                                    🍰 Postre

                                    <span className="ml-2 text-sm font-normal text-gray-500">

                                        opcional

                                    </span>

                                </h3>


                                <div className="space-y-3">

                                    {dessertOptions.map(
                                        option => (

                                            <label
                                                key={option.id}
                                                className={`
                                                    flex
                                                    cursor-pointer
                                                    items-center
                                                    gap-3
                                                    rounded-xl
                                                    border
                                                    p-4
                                                    transition
                                                    ${selectedDessert ===
                                                        option.id
                                                        ? "border-orange-500 bg-orange-50"
                                                        : "border-gray-200"
                                                    }
                                                `}
                                            >

                                                <input
                                                    type="radio"
                                                    name="daily-menu-dessert"
                                                    checked={
                                                        selectedDessert ===
                                                        option.id
                                                    }
                                                    onChange={() =>
                                                        setSelectedDessert(
                                                            option.id
                                                        )
                                                    }
                                                />

                                                <span>

                                                    {option.name}

                                                </span>

                                            </label>

                                        )
                                    )}

                                </div>

                            </section>

                        )}


                        {/* OBSERVACIONES */}

                        <section className="mt-8">

                            <h3 className="mb-3 text-lg font-semibold">

                                📝 Observaciones

                            </h3>


                            <textarea
                                value={notes}
                                onChange={event =>
                                    setNotes(
                                        event.target.value
                                    )
                                }
                                placeholder="Ejemplo: sin sopa"
                                rows={3}
                                className="w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-orange-500"
                            />

                        </section>


                        {/* CANTIDAD */}

                        <section className="mt-8">

                            <h3 className="mb-3 text-lg font-semibold">

                                Cantidad

                            </h3>


                            <QuantitySelector

                                quantity={
                                    quantity
                                }

                                onDecrease={() =>
                                    setQuantity(
                                        current =>
                                            Math.max(
                                                1,
                                                current - 1
                                            )
                                    )
                                }

                                onIncrease={() =>
                                    setQuantity(
                                        current =>
                                            current + 1
                                    )
                                }

                            />

                        </section>


                        {/* AGREGAR */}

                        <button
                            type="button"
                            disabled={!canAdd}
                            onClick={handleAdd}
                            className={`
                                mt-8
                                w-full
                                rounded-xl
                                px-5
                                py-4
                                text-lg
                                font-bold
                                text-white
                                transition
                                ${canAdd
                                    ? "bg-orange-600 hover:bg-orange-700"
                                    : "cursor-not-allowed bg-gray-300"
                                }
                            `}
                        >

                            {canAdd
                                ? "Agregar al pedido"
                                : "Selecciona tamaño, principio y bebida"}

                        </button>

                    </div>

                </div>

            </div>

        </div>

    );

}