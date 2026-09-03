import Image from "next/image";

import {
    ArrowRight,
    CheckCircle2,
    MessageCircle,
    Smartphone,
} from "lucide-react";

export default function Screenshots() {
    return (
        <section
            id="demo"
            className="
                relative
                overflow-hidden
                bg-white
                py-16
                sm:py-20
                lg:py-24
            "
        >

            {/* Separación visual */}

            <div className="absolute inset-x-0 top-0 h-2 bg-gray-50" />

            <div className="relative mx-auto max-w-7xl px-5 sm:px-6">

                {/* =====================================================
                    ENCABEZADO
                ===================================================== */}

                <div className="mx-auto max-w-3xl text-center">

                    <span
                        className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-full
                            border
                            border-green-200
                            bg-green-50
                            px-4
                            py-2
                            text-xs
                            font-bold
                            text-green-700
                            sm:text-sm
                        "
                    >
                        <MessageCircle className="h-4 w-4" />
                        Así recibe tu restaurante
                    </span>


                    <h2
                        className="
                            mt-5
                            text-3xl
                            font-extrabold
                            tracking-tight
                            text-gray-900
                            sm:text-4xl
                            md:text-5xl
                        "
                    >
                        Tu cliente pide.

                        <br />

                        <span className="text-orange-500">
                            Tú recibes.
                        </span>
                    </h2>


                    <p
                        className="
                            mx-auto
                            mt-4
                            max-w-2xl
                            text-base
                            leading-7
                            text-gray-600
                            sm:text-lg
                            sm:leading-8
                        "
                    >
                        Mira lo que ocurre desde que tu cliente entra
                        a tu menú hasta que el pedido llega a tu restaurante.
                    </p>

                </div>


                {/* =====================================================
                    FLUJO
                ===================================================== */}

                <div
                    className="
                        mx-auto
                        mt-10
                        grid
                        max-w-6xl
                        items-center
                        gap-6
                        sm:mt-14
                        lg:grid-cols-[1fr_auto_1fr]
                        lg:gap-8
                    "
                >


                    {/* =================================================
                        CLIENTE
                    ================================================= */}

                    <div className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-xl sm:rounded-[32px]">

                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">

                            <Image
                                src="/images/landing/pedidos360-cliente-menu.png"
                                alt="Cliente realizando un pedido desde el menú digital de Pedidos360"
                                fill
                                sizes="(max-width: 1024px) 100vw, 520px"
                                className="object-cover"
                            />

                        </div>


                        <div className="p-5 sm:p-6">

                            <div className="flex items-center gap-3">

                                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">

                                    <Smartphone className="h-5 w-5" />

                                </div>


                                <div>

                                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 sm:text-xs">
                                        Experiencia del cliente
                                    </p>

                                    <h3 className="text-xl font-extrabold text-gray-900">
                                        Tu cliente pide
                                    </h3>

                                </div>

                            </div>


                            <p className="mt-4 text-sm leading-6 text-gray-600 sm:text-base">
                                Navega tu menú, elige productos, personaliza
                                y confirma su pedido.
                            </p>


                            <div className="mt-4 flex items-center gap-2 text-sm font-bold text-green-700">

                                <CheckCircle2 className="h-5 w-5 flex-shrink-0" />

                                Sin descargar ninguna aplicación.

                            </div>

                        </div>

                    </div>


                    {/* =================================================
                        CONEXIÓN
                    ================================================= */}

                    <div className="flex flex-col items-center justify-center">

                        <div
                            className="
                                flex
                                flex-col
                                items-center
                                rounded-3xl
                                border
                                border-orange-200
                                bg-orange-50
                                px-6
                                py-5
                                text-center
                                shadow-sm
                            "
                        >

                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-orange-500 shadow-sm">

                                <ArrowRight className="h-6 w-6 rotate-90 lg:rotate-0" />

                            </div>


                            <p className="mt-3 text-sm font-extrabold text-orange-700">
                                Pedido enviado
                            </p>

                            <p className="mt-0.5 text-xs font-medium text-orange-600">
                                Automáticamente
                            </p>

                        </div>

                    </div>


                    {/* =================================================
                        WHATSAPP
                    ================================================= */}

                    <div className="overflow-hidden rounded-[28px] border border-green-200 bg-white shadow-xl sm:rounded-[32px]">

                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">

                            <Image
                                src="/images/landing/pedidos360-whatsapp-pedido.png"
                                alt="Restaurante recibiendo un pedido organizado de Pedidos360 por WhatsApp"
                                fill
                                sizes="(max-width: 1024px) 100vw, 520px"
                                className="object-cover"
                            />

                        </div>


                        <div className="p-5 sm:p-6">

                            <div className="flex items-center gap-3">

                                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-green-50 text-green-600">

                                    <MessageCircle className="h-5 w-5" />

                                </div>


                                <div>

                                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 sm:text-xs">
                                        Restaurante
                                    </p>

                                    <h3 className="text-xl font-extrabold text-gray-900">
                                        Tú recibes por WhatsApp
                                    </h3>

                                </div>

                            </div>


                            <p className="mt-4 text-sm leading-6 text-gray-600 sm:text-base">
                                El pedido llega completo y organizado
                                directamente a tu WhatsApp.
                            </p>


                            <div className="mt-4 flex items-center gap-2 text-sm font-bold text-green-700">

                                <CheckCircle2 className="h-5 w-5 flex-shrink-0" />

                                Tú confirmas y continúas la atención.

                            </div>

                        </div>

                    </div>

                </div>


                {/* =====================================================
                    MENSAJE FINAL
                ===================================================== */}

                <div
                    className="
                        mx-auto
                        mt-10
                        max-w-2xl
                        rounded-2xl
                        border
                        border-gray-200
                        bg-gray-50
                        px-5
                        py-4
                        text-center
                        sm:mt-12
                        sm:px-7
                        sm:py-5
                    "
                >

                    <p className="text-base font-bold text-gray-800 sm:text-lg">

                        Sin largas llamadas,chat infinitos y Sin mensajes desordenados.

                        <span className="text-orange-500">
                            {" "}Solo pedidos.
                        </span>

                    </p>

                </div>

            </div>

        </section>
    );
}