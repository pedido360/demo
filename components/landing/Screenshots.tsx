import {
    ArrowRight,
    CheckCircle2,
    MessageCircle,
    ShoppingCart,
    Smartphone,
} from "lucide-react";

export default function Screenshots() {
    return (
        <section
            id="demo"
            className="bg-gray-50 py-16 sm:py-20 lg:py-24"
        >

            <div className="mx-auto max-w-7xl px-5 sm:px-6">

                {/* =====================================================
                    ENCABEZADO
                ===================================================== */}

                <div className="mx-auto max-w-2xl text-center">

                    <span className="inline-flex rounded-full border border-green-200 bg-green-50 px-4 py-2 text-xs font-bold text-green-700 sm:text-sm">
                        Mira cómo funciona
                    </span>


                    <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl md:text-5xl">

                        Tu cliente pide.

                        <br />

                        <span className="text-orange-500">
                            Tú recibes.
                        </span>

                    </h2>


                    <p className="mt-4 text-base leading-7 text-gray-600 sm:text-lg">
                        Una experiencia sencilla para tu cliente y pedidos
                        mucho más fáciles de gestionar para ti.
                    </p>

                </div>


                {/* =====================================================
                    FLUJO
                ===================================================== */}

                <div className="mx-auto mt-10 grid max-w-6xl items-center gap-5 sm:mt-14 lg:grid-cols-[1fr_auto_1fr] lg:gap-7">


                    {/* =================================================
                        CLIENTE
                    ================================================= */}

                    <div className="rounded-[28px] bg-white p-5 shadow-xl ring-1 ring-gray-100 sm:rounded-[32px] sm:p-7">

                        <div className="flex items-center gap-3">

                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-orange-100">
                                <Smartphone className="h-6 w-6 text-orange-600" />
                            </div>


                            <div>

                                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 sm:text-xs">
                                    Cliente
                                </p>

                                <h3 className="text-xl font-bold text-gray-900">
                                    Menú digital
                                </h3>

                            </div>

                        </div>


                        {/* Productos */}

                        <div className="mt-6 space-y-3">

                            <ProductRow
                                emoji="🍗"
                                name="Pollo a la plancha"
                                quantity="x1"
                            />

                            <ProductRow
                                emoji="🍚"
                                name="Arroz + ensalada"
                                quantity="x1"
                            />

                            <ProductRow
                                emoji="🥤"
                                name="Jugo natural"
                                quantity="x1"
                            />

                        </div>


                        {/* Botón */}

                        <div className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-orange-500 py-3.5 text-sm font-bold text-white shadow-sm">

                            <ShoppingCart className="h-5 w-5" />

                            Enviar pedido

                        </div>

                    </div>


                    {/* =================================================
                        CONEXIÓN
                    ================================================= */}

                    <div className="flex flex-col items-center justify-center">

                        <ArrowRight className="hidden h-12 w-12 text-orange-400 lg:block" />


                        <div className="my-3 rounded-2xl border border-orange-200 bg-orange-50 px-5 py-3 text-center shadow-sm lg:my-4">

                            <div className="text-xl">
                                ⚡
                            </div>

                            <p className="mt-1 text-sm font-bold text-orange-700">
                                Pedido enviado
                            </p>

                            <p className="text-[11px] text-orange-600">
                                Automáticamente
                            </p>

                        </div>


                        <ArrowRight className="h-9 w-9 rotate-90 text-orange-400 lg:hidden" />

                    </div>


                    {/* =================================================
                        WHATSAPP
                    ================================================= */}

                    <div className="rounded-[28px] bg-[#25D366] p-5 text-white shadow-xl sm:rounded-[32px] sm:p-7">

                        <div className="flex items-center gap-3">

                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/20">
                                <MessageCircle className="h-6 w-6" />
                            </div>


                            <div>

                                <p className="text-[10px] font-bold uppercase tracking-wider text-white/70 sm:text-xs">
                                    Restaurante
                                </p>

                                <h3 className="text-xl font-bold">
                                    WhatsApp
                                </h3>

                            </div>

                        </div>


                        {/* Pedido recibido */}

                        <div className="mt-6 rounded-2xl bg-white p-5 text-gray-800">

                            <div className="flex items-center justify-between">

                                <p className="font-bold">
                                    🍽️ Nuevo pedido
                                </p>

                                <span className="rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-bold text-green-700">
                                    NUEVO
                                </span>

                            </div>


                            <div className="mt-4 space-y-2 text-sm">

                                <p className="text-gray-500">
                                    👤 Cliente
                                </p>

                                <p>
                                    • Pollo a la plancha x1
                                </p>

                                <p>
                                    • Arroz + ensalada x1
                                </p>

                                <p>
                                    • Jugo natural x1
                                </p>

                            </div>


                            <div className="mt-4 border-t border-gray-100 pt-4">

                                <div className="flex items-center justify-between">

                                    <span className="text-sm text-gray-500">
                                        Total
                                    </span>

                                    <strong className="text-lg font-extrabold">
                                        $25.000
                                    </strong>

                                </div>

                            </div>

                        </div>


                        {/* Confirmación */}

                        <div className="mt-5 flex items-center gap-2 text-sm font-semibold">

                            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />

                            Pedido listo para confirmar

                        </div>

                    </div>

                </div>


                {/* =====================================================
                    MENSAJE FINAL
                ===================================================== */}

                <div className="mx-auto mt-10 max-w-2xl text-center sm:mt-12">

                    <p className="text-base font-bold text-gray-800 sm:text-lg">
                        Sin llamadas. Sin mensajes desordenados.
                        <span className="text-orange-500">
                            {" "}Solo pedidos.
                        </span>
                    </p>

                </div>

            </div>

        </section>
    );
}


function ProductRow({
    emoji,
    name,
    quantity,
}: {
    emoji: string;
    name: string;
    quantity: string;
}) {
    return (

        <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-3">

            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white text-lg shadow-sm">
                {emoji}
            </div>


            <p className="min-w-0 flex-1 truncate text-sm font-medium text-gray-700">
                {name}
            </p>


            <span className="flex-shrink-0 text-xs font-bold text-gray-400">
                {quantity}
            </span>

        </div>

    );
}