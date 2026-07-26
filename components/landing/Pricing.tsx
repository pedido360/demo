"use client";

import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const benefits = [
    "Menú digital completamente personalizado",
    "Configuración de tu restaurante",
    "Código QR listo para compartir",
    "Pedidos organizados directamente en WhatsApp",
];

const whatsappUrl =
    "https://wa.me/573180972943?text=Hola%20👋%0A%0AQuiero%20iniciar%20con%20Pedidos360%20para%20mi%20restaurante.%0A%0AMe%20gustaría%20coordinar%20la%20contratación%20del%20servicio%20y%20comenzar%20la%20personalización%20de%20mi%20menú%20digital.%0A%0AQuedo%20atento%20para%20iniciar%20el%20proceso.";

export default function Pricing() {
    const [starting, setStarting] = useState(false);

    useEffect(() => {
        if (!starting) return;

        const timer = setTimeout(() => {
            window.open(whatsappUrl, "_blank");
            setStarting(false);
        }, 1800);

        return () => clearTimeout(timer);
    }, [starting]);

    return (
        <>
            <section
                id="empezar"
                className="bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 py-24"
            >
                <div className="mx-auto max-w-7xl px-6">
                    <div className="overflow-hidden rounded-[40px] bg-white shadow-2xl">
                        <div className="grid lg:grid-cols-2">
                            {/* Información */}

                            <div className="p-10 lg:p-14">
                                <span className="inline-flex rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-600">
                                    El siguiente paso empieza aquí 🚀
                                </span>

                                <h2 className="mt-6 text-center text-4xl font-extrabold leading-tight text-gray-900 md:text-5xl lg:text-left">
                                    Hoy empieza la transformación digital de tu
                                    restaurante.
                                </h2>

                                <p className="mt-6 text-center text-lg leading-8 text-gray-600 lg:text-left">
                                    Ya conoces cómo funciona Pedidos360. Ahora
                                    solo queda un paso: coordinar la
                                    implementación de tu restaurante para que
                                    muy pronto estés recibiendo pedidos
                                    organizados directamente por WhatsApp.
                                </p>

                                <div className="mt-10 space-y-5">
                                    {benefits.map((item) => (
                                        <div
                                            key={item}
                                            className="flex items-center gap-3"
                                        >
                                            <CheckCircle2 className="h-6 w-6 text-green-500" />

                                            <span className="text-gray-700">
                                                {item}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* CTA */}

                            <div className="flex flex-col justify-center bg-gray-900 p-10 text-white lg:p-14">
                                <span className="text-center text-sm font-semibold uppercase tracking-[0.3em] text-orange-400 lg:text-left">
                                    Comencemos
                                </span>

                                <h3 className="mt-5 text-center text-4xl font-bold lg:text-left">
                                    Activa tu Pedidos360.
                                </h3>

                                <p className="mt-6 text-center text-lg leading-8 text-gray-300 lg:text-left">
                                    Después de hacer clic coordinaremos contigo
                                    la contratación del servicio, la
                                    personalización de tu restaurante y la
                                    puesta en marcha de tu menú digital.
                                </p>

                                <button
                                    onClick={() => setStarting(true)}
                                    className="mt-10 flex items-center justify-center gap-3 rounded-2xl bg-orange-500 px-8 py-5 text-lg font-bold transition duration-300 hover:scale-105 hover:bg-orange-400"
                                >
                                    Activar mi Pedidos360

                                    <ArrowRight className="h-6 w-6" />
                                </button>

                                <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
                                    <p className="font-semibold text-white">
                                        ¿Qué pasará después?
                                    </p>

                                    <ul className="mt-4 space-y-3 text-sm text-gray-300">
                                        <li>
                                            ✅ Coordinaremos la contratación.
                                        </li>

                                        <li>
                                            ✅ Personalizaremos tu restaurante.
                                        </li>

                                        <li>
                                            ✅ Configuraremos tu menú digital.
                                        </li>

                                        <li>
                                            ✅ Comenzarás a recibir pedidos.
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cierre */}

                    <div className="mt-20 text-center">
                        <h3 className="text-3xl font-bold text-white">
                            Bienvenido a la nueva forma de recibir pedidos.
                        </h3>

                        <p className="mt-4 text-lg text-orange-100">
                            Bienvenido a{" "}
                            <span className="font-bold">
                                Pedidos360.
                            </span>
                        </p>
                    </div>
                </div>
            </section>

            {/* Modal */}

            {starting && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md">
                    <div className="mx-6 max-w-lg rounded-[36px] bg-white p-12 text-center shadow-2xl">
                        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-orange-100 text-5xl">
                            🚀
                        </div>

                        <h2 className="mt-8 text-4xl font-extrabold text-gray-900">
                            ¡Excelente decisión!
                        </h2>

                        <p className="mt-6 text-lg leading-8 text-gray-600">
                            Ahora vamos a coordinar la contratación y la
                            personalización de tu restaurante.
                        </p>

                        <div className="mt-10 h-2 overflow-hidden rounded-full bg-gray-200">
                            <div className="h-full w-full origin-left animate-pulse rounded-full bg-orange-500" />
                        </div>

                        <p className="mt-6 text-sm text-gray-500">
                            Abriendo WhatsApp...
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}