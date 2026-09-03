"use client";

import { useState } from "react";

import {
    CheckCircle2,
    Download,
    Link2,
    MessageCircle,
    Settings2,
    Share2,
    ShoppingBag,
    Sparkles,
    Utensils,
    ChevronDown,
} from "lucide-react";

const steps = [
    {
        number: "01",
        icon: Settings2,
        title: "Configura tus opciones",
        description:
            "Define las opciones que quieres ofrecer en tu Menú del Día.",
        items: [
            "Sopas",
            "Secos y principios",
            "Proteínas",
            "Bebidas y postres",
        ],
    },
    {
        number: "02",
        icon: Utensils,
        title: "Crea tu menú",
        description:
            "Elige las opciones disponibles, define tamaños y establece tus precios.",
        items: [
            "Tamaños personalizados",
            "Precios por tamaño",
            "Opciones disponibles",
        ],
    },
    {
        number: "03",
        icon: Sparkles,
        title: "Genera tu imagen automáticamente",
        description:
            "Pedidos360 crea automáticamente una imagen lista para promocionar tu Menú del Día.",
        items: [
            "Diseño automático",
            "Menú organizado",
            "Lista para compartir",
        ],
    },
    {
        number: "04",
        icon: Share2,
        title: "Comparte",
        description:
            "Lleva tu Menú del Día a tus clientes de la forma que prefieras.",
        items: [
            "Descarga la imagen",
            "Compártela en WhatsApp y redes",
            "Comparte la URL directa del menú",
        ],
    },
    {
        number: "05",
        icon: ShoppingBag,
        title: "Tu cliente elige",
        description:
            "El cliente entra a tu menú digital y selecciona únicamente las opciones que tú configuraste.",
        items: [
            "Elige su tamaño",
            "Selecciona sus opciones",
            "Agrega el menú al pedido",
        ],
    },
    {
        number: "06",
        icon: MessageCircle,
        title: "Recibes el pedido",
        description:
            "El pedido llega organizado directamente a tu WhatsApp para que puedas confirmarlo y continuar la atención.",
        items: [
            "Datos del cliente",
            "Detalle del pedido",
            "Total y forma de pago",
        ],
    },
];

export default function DailyMenuFlow() {

    const [open, setOpen] = useState(false);

    return (
        <section className="mt-6">

            <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

                {/* =====================================================
                    ACORDEÓN
                ===================================================== */}

                <button
                    type="button"
                    onClick={() => setOpen(!open)}
                    className="
                        flex
                        w-full
                        items-center
                        justify-between
                        gap-4
                        px-5
                        py-5
                        text-left
                        transition
                        hover:bg-gray-50
                        sm:px-6
                    "
                >

                    <div className="flex items-center gap-4">

                        <div
                            className="
                                flex
                                h-11
                                w-11
                                flex-shrink-0
                                items-center
                                justify-center
                                rounded-2xl
                                bg-orange-50
                                text-orange-600
                            "
                        >
                            <Sparkles className="h-5 w-5" />
                        </div>

                        <div>

                            <p className="text-base font-extrabold text-gray-900 sm:text-lg">
                                ¿Cómo funciona para tu restaurante?
                            </p>

                            <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                                Descubre cómo Pedidos360 convierte tu menú en pedidos.
                            </p>

                        </div>

                    </div>

                    <ChevronDown
                        className={`
                            h-5
                            w-5
                            flex-shrink-0
                            text-gray-500
                            transition-transform
                            duration-200
                            ${open ? "rotate-180" : ""}
                        `}
                    />

                </button>


                {/* =====================================================
                    CONTENIDO
                ===================================================== */}

                {open && (

                    <div className="border-t border-gray-100 bg-gray-50 px-4 py-5 sm:px-6 sm:py-6">

                        <div className="space-y-3 sm:space-y-4">

                            {steps.map((step, index) => {

                                const Icon = step.icon;

                                return (

                                    <div
                                        key={step.number}
                                        className="
                                            overflow-hidden
                                            rounded-2xl
                                            border
                                            border-gray-200
                                            bg-white
                                        "
                                    >

                                        <div className="p-4 sm:p-5">

                                            <div className="flex gap-4">

                                                <div className="flex flex-shrink-0 flex-col items-center">

                                                    <div
                                                        className="
                                                            flex
                                                            h-10
                                                            w-10
                                                            items-center
                                                            justify-center
                                                            rounded-xl
                                                            bg-orange-50
                                                            text-orange-600
                                                        "
                                                    >
                                                        <Icon className="h-5 w-5" />
                                                    </div>

                                                    <span className="mt-2 text-[10px] font-extrabold tracking-wider text-orange-500">
                                                        {step.number}
                                                    </span>

                                                </div>


                                                <div className="min-w-0 flex-1">

                                                    <h3 className="text-base font-extrabold text-gray-900 sm:text-lg">
                                                        {step.title}
                                                    </h3>

                                                    <p className="mt-1 text-xs leading-5 text-gray-600 sm:text-sm sm:leading-6">
                                                        {step.description}
                                                    </p>


                                                    <div className="mt-3 grid gap-2 sm:grid-cols-2">

                                                        {step.items.map((item) => (

                                                            <div
                                                                key={item}
                                                                className="flex items-center gap-2 text-xs font-semibold text-gray-700 sm:text-sm"
                                                            >

                                                                <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-600" />

                                                                <span>
                                                                    {item}
                                                                </span>

                                                            </div>

                                                        ))}

                                                    </div>

                                                </div>

                                            </div>

                                        </div>


                                        {/* =================================================
                                            PASO 04 — COMPARTIR
                                        ================================================= */}

                                        {index === 3 && (

                                            <div className="border-t border-gray-100 bg-gray-50 px-4 py-4 sm:px-5">

                                                <div className="grid gap-3 sm:grid-cols-2">

                                                    <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-3">

                                                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600">

                                                            <Download className="h-4 w-4" />

                                                        </div>

                                                        <div>

                                                            <p className="text-xs font-extrabold text-gray-900 sm:text-sm">
                                                                Imagen lista para compartir
                                                            </p>

                                                            <p className="mt-1 text-[11px] leading-4 text-gray-500 sm:text-xs">
                                                                Descarga la imagen automática y publícala en WhatsApp, estados, redes o donde quieras.
                                                            </p>

                                                        </div>

                                                    </div>


                                                    <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-3">

                                                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-600">

                                                            <Link2 className="h-4 w-4" />

                                                        </div>

                                                        <div>

                                                            <p className="text-xs font-extrabold text-gray-900 sm:text-sm">
                                                                URL directa del Menú del Día
                                                            </p>

                                                            <p className="mt-1 text-[11px] leading-4 text-gray-500 sm:text-xs">
                                                                Comparte el enlace para que tus clientes entren directamente a elegir y pedir.
                                                            </p>

                                                        </div>

                                                    </div>

                                                </div>

                                            </div>

                                        )}

                                    </div>

                                );

                            })}

                        </div>


                        {/* =================================================
                            CIERRE
                        ================================================= */}

                        <div className="mx-auto mt-5 max-w-2xl rounded-2xl border border-green-200 bg-white p-5 text-center">

                            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">

                                <MessageCircle className="h-5 w-5" />

                            </div>

                            <h3 className="mt-3 text-base font-extrabold text-gray-900 sm:text-lg">
                                De tu configuración al pedido.
                            </h3>

                            <p className="mx-auto mt-1 max-w-xl text-xs leading-5 text-gray-600 sm:text-sm sm:leading-6">
                                Tú decides el menú. Tu cliente elige entre tus opciones.
                                Y el pedido llega organizado directamente a WhatsApp.
                            </p>

                        </div>

                    </div>

                )}

            </div>

        </section>
    );
}