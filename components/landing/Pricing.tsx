"use client";

import { useEffect, useState } from "react";
import {
    ArrowRight,
    CheckCircle2,
} from "lucide-react";

const benefits = [
    "Menú digital personalizado",
    "Pedidos organizados en WhatsApp",
    "Código QR para compartir",
    "Constructor de Menú del Día",
];

const whatsappUrl =
    "https://wa.me/573184377576?text=Hola%20👋%0A%0AQuiero%20conocer%20Pedidos360%20para%20mi%20restaurante.%0A%0AMe%20gustaría%20conocer%20cómo%20funciona%20y%20coordinar%20el%20inicio.%0A%0AQuedo%20atento.";

export default function Pricing() {

    const [starting, setStarting] =
        useState(false);


    useEffect(() => {

        if (!starting) {
            return;
        }


        const timer =
            setTimeout(() => {

                window.open(
                    whatsappUrl,
                    "_blank"
                );

                setStarting(false);

            }, 1200);


        return () => {
            clearTimeout(timer);
        };

    }, [starting]);


    return (
        <>

            {/* =====================================================
                CTA PRINCIPAL
            ===================================================== */}

            <section
                id="empezar"
                className="
                    bg-gradient-to-br
                    from-orange-500
                    via-orange-600
                    to-red-600
                    py-16
                    sm:py-20
                    lg:py-24
                "
            >

                <div className="mx-auto max-w-5xl px-5 sm:px-6">

                    <div
                        className="
                            overflow-hidden
                            rounded-[32px]
                            bg-gray-950
                            text-white
                            shadow-2xl
                            sm:rounded-[40px]
                        "
                    >

                        <div className="grid lg:grid-cols-[1.15fr_0.85fr]">

                            {/* =================================================
                                MENSAJE
                            ================================================= */}

                            <div className="p-8 sm:p-10 lg:p-14">

                                <span
                                    className="
                                        inline-flex
                                        rounded-full
                                        border
                                        border-orange-400/30
                                        bg-orange-500/10
                                        px-4
                                        py-2
                                        text-xs
                                        font-bold
                                        text-orange-300
                                        sm:text-sm
                                    "
                                >
                                    Empieza hoy 🚀
                                </span>


                                <h2
                                    className="
                                        mt-5
                                        text-3xl
                                        font-extrabold
                                        leading-tight
                                        sm:text-4xl
                                        md:text-5xl
                                    "
                                >

                                    Tu restaurante,

                                    <br />

                                    <span className="text-orange-400">
                                        listo para recibir pedidos.
                                    </span>

                                </h2>


                                <p
                                    className="
                                        mt-5
                                        max-w-xl
                                        text-base
                                        leading-7
                                        text-gray-300
                                        sm:text-lg
                                        sm:leading-8
                                    "
                                >
                                    Nosotros configuramos tu restaurante,
                                    personalizamos tu menú y te acompañamos
                                    para que empieces a recibir pedidos.
                                </p>


                                {/* BENEFICIOS */}

                                <div className="mt-7 grid gap-3 sm:mt-9 sm:gap-4">

                                    {benefits.map((item) => (

                                        <div
                                            key={item}
                                            className="flex items-center gap-3"
                                        >

                                            <CheckCircle2
                                                className="
                                                    h-5
                                                    w-5
                                                    flex-shrink-0
                                                    text-green-400
                                                "
                                            />

                                            <span className="text-sm text-gray-200 sm:text-base">
                                                {item}
                                            </span>

                                        </div>

                                    ))}

                                </div>

                            </div>


                            {/* =================================================
                                CTA
                            ================================================= */}

                            <div
                                className="
                                    flex
                                    flex-col
                                    justify-center
                                    bg-white
                                    p-8
                                    text-gray-900
                                    sm:p-10
                                    lg:p-10
                                "
                            >

                                <p className="text-center text-xs font-extrabold uppercase tracking-[0.2em] text-orange-500 lg:text-left">
                                    Hablemos
                                </p>


                                <h3
                                    className="
                                        mt-3
                                        text-center
                                        text-2xl
                                        font-extrabold
                                        sm:text-3xl
                                        lg:text-left
                                    "
                                >
                                    ¿Quieres Pedidos360?
                                </h3>


                                <p
                                    className="
                                        mt-3
                                        text-center
                                        text-sm
                                        leading-6
                                        text-gray-600
                                        sm:text-base
                                        sm:leading-7
                                        lg:text-left
                                    "
                                >
                                    Escríbenos y te contamos cómo llevar
                                    Pedidos360 a tu restaurante.
                                </p>


                                <button
                                    type="button"
                                    onClick={() => setStarting(true)}
                                    className="
                                        mt-7
                                        flex
                                        w-full
                                        items-center
                                        justify-center
                                        gap-3
                                        rounded-2xl
                                        bg-orange-500
                                        px-6
                                        py-4
                                        text-base
                                        font-extrabold
                                        text-white
                                        shadow-lg
                                        transition
                                        hover:bg-orange-400
                                        hover:shadow-xl
                                        active:scale-[0.99]
                                    "
                                >

                                    Hablar con Pedidos360

                                    <ArrowRight className="h-5 w-5" />

                                </button>


                                <p className="mt-4 text-center text-xs text-gray-400">
                                    Atención personalizada por WhatsApp.
                                </p>

                            </div>

                        </div>

                    </div>


                    {/* =====================================================
                        CIERRE
                    ===================================================== */}

                    <div className="mt-8 text-center sm:mt-10">

                        <p className="text-lg font-bold text-white">
                            Pedidos360
                        </p>

                        <p className="mt-1 text-sm text-orange-100">
                            Tu menú. Tus pedidos. Tu restaurante.
                        </p>

                    </div>

                </div>

            </section>


            {/* =====================================================
                MODAL
            ===================================================== */}

            {starting && (

                <div
                    className="
                        fixed
                        inset-0
                        z-50
                        flex
                        items-center
                        justify-center
                        bg-black/75
                        px-5
                        backdrop-blur-sm
                    "
                >

                    <div
                        className="
                            w-full
                            max-w-md
                            rounded-[32px]
                            bg-white
                            p-8
                            text-center
                            shadow-2xl
                            sm:p-10
                        "
                    >

                        <div
                            className="
                                mx-auto
                                flex
                                h-20
                                w-20
                                items-center
                                justify-center
                                rounded-full
                                bg-orange-100
                                text-4xl
                            "
                        >
                            🚀
                        </div>


                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                            ¡Vamos a empezar!
                        </h2>


                        <p className="mt-4 text-sm leading-6 text-gray-600 sm:text-base sm:leading-7">
                            Estamos preparando tu contacto con
                            Pedidos360 por WhatsApp.
                        </p>


                        <div className="mt-7 h-2 overflow-hidden rounded-full bg-gray-200">

                            <div className="h-full w-full animate-pulse rounded-full bg-orange-500" />

                        </div>


                        <p className="mt-4 text-sm text-gray-500">
                            Abriendo WhatsApp...
                        </p>

                    </div>

                </div>

            )}

        </>
    );
}