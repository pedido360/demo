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
            className="bg-gradient-to-b from-gray-50 to-white py-24"
        >
            <div className="mx-auto max-w-7xl px-6">

                {/* Header */}

                <div className="mx-auto max-w-3xl text-center">

                    <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-600">
                        Así trabaja Pedidos360
                    </span>

                    <h2 className="mt-6 text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
                        Desde el pedido hasta WhatsApp.
                    </h2>

                    <p className="mt-6 text-lg leading-8 text-gray-600">
                        Todo el proceso está pensado para que el cliente compre
                        fácilmente y el restaurante reciba pedidos claros, organizados
                        y listos para confirmar.
                    </p>

                </div>

                {/* Flow */}

                <div className="mt-20 grid items-center gap-10 lg:grid-cols-3">

                    {/* Cliente */}

                    <div className="rounded-[32px] bg-white p-8 shadow-xl ring-1 ring-gray-100">

                        <div className="flex items-center gap-3">

                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100">
                                <Smartphone className="h-7 w-7 text-orange-600" />
                            </div>

                            <div>

                                <p className="text-sm text-gray-500">
                                    Cliente
                                </p>

                                <h3 className="text-xl font-bold text-gray-900">
                                    Menú Digital
                                </h3>

                            </div>

                        </div>

                        <div className="mt-8 space-y-4">

                            <div className="rounded-2xl bg-orange-50 p-4">
                                🍔 Burger BBQ
                            </div>

                            <div className="rounded-2xl bg-orange-50 p-4">
                                🍟 Papas Grandes
                            </div>

                            <div className="rounded-2xl bg-orange-50 p-4">
                                🥤 Coca-Cola
                            </div>

                        </div>

                        <button className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 py-4 font-semibold text-white">
                            <ShoppingCart className="h-5 w-5" />
                            Confirmar pedido
                        </button>

                    </div>

                    {/* Centro */}

                    <div className="flex flex-col items-center justify-center text-center">

                        <ArrowRight className="hidden h-16 w-16 text-orange-400 lg:block" />

                        <div className="mt-6 rounded-full bg-orange-100 px-6 py-3 font-semibold text-orange-600">
                            Envío automático
                        </div>

                    </div>

                    {/* Restaurante */}

                    <div className="rounded-[32px] bg-[#25D366] p-8 text-white shadow-2xl">

                        <div className="flex items-center gap-3">

                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
                                <MessageCircle className="h-7 w-7" />
                            </div>

                            <div>

                                <p className="text-sm opacity-80">
                                    Restaurante
                                </p>

                                <h3 className="text-xl font-bold">
                                    WhatsApp
                                </h3>

                            </div>

                        </div>

                        <div className="mt-8 rounded-3xl bg-white p-6 text-gray-800">

                            <p className="font-bold">
                                🍔 Nuevo pedido
                            </p>

                            <div className="mt-4 space-y-2 text-sm">

                                <p>👤 Carlos Pérez</p>

                                <p>• Burger BBQ x1</p>

                                <p>• Papas Grandes x1</p>

                                <p>• Coca-Cola x1</p>

                                <p className="pt-2 font-bold">
                                    Total: $24.80
                                </p>

                            </div>

                        </div>

                        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-white/15 p-4">

                            <CheckCircle2 className="h-6 w-6" />

                            <span className="font-medium">
                                Pedido listo para confirmar
                            </span>

                        </div>

                    </div>

                </div>

            </div>
        </section>
    );
}