import {
    MenuSquare,
    ShoppingCart,
    MessageCircle,
    QrCode,
} from "lucide-react";

const features = [
    {
        icon: MenuSquare,
        title: "Menú digital",
        description:
            "Productos, precios e imágenes siempre actualizados.",
    },
    {
        icon: ShoppingCart,
        title: "Pedidos organizados",
        description:
            "Cada pedido llega estructurado y listo para revisar.",
    },
    {
        icon: MessageCircle,
        title: "WhatsApp",
        description:
            "Recibe los pedidos directamente donde ya trabaja tu restaurante.",
    },
    {
        icon: QrCode,
        title: "Comparte y vende",
        description:
            "Un enlace y un QR para llevar tu menú a mesas, redes y clientes.",
    },
];

export default function Features() {
    return (
        <section
            id="funciones"
            className="bg-white py-16 sm:py-20 lg:py-24"
        >

            <div className="mx-auto max-w-7xl px-5 sm:px-6">

                {/* =====================================================
                    ENCABEZADO
                ===================================================== */}

                <div className="mx-auto max-w-3xl text-center">

                    <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-600">
                        ¿Qué es Pedidos360?
                    </span>


                    <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl md:text-5xl">

                        Tu menú convertido
                        <br className="sm:hidden" />
                        {" "}
                        en un canal de pedidos.

                    </h2>


                    <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg sm:leading-8">

                        Tus clientes consultan, eligen y piden desde su celular.
                        Tú recibes todo organizado en WhatsApp.

                    </p>

                </div>


                {/* =====================================================
                    FUNCIONES
                ===================================================== */}

                <div className="mt-10 grid gap-4 sm:mt-14 sm:grid-cols-2 lg:grid-cols-4">

                    {features.map((feature) => {

                        const Icon = feature.icon;

                        return (

                            <div
                                key={feature.title}
                                className="
                                    group
                                    rounded-3xl
                                    border
                                    border-gray-100
                                    bg-gray-50
                                    p-6
                                    transition-all
                                    duration-300
                                    hover:-translate-y-1
                                    hover:bg-white
                                    hover:shadow-xl
                                    sm:p-7
                                "
                            >

                                {/* Icono */}

                                <div
                                    className="
                                        flex
                                        h-12
                                        w-12
                                        items-center
                                        justify-center
                                        rounded-2xl
                                        bg-orange-100
                                        text-orange-600
                                        transition-colors
                                        duration-300
                                        group-hover:bg-orange-500
                                        group-hover:text-white
                                        sm:h-14
                                        sm:w-14
                                    "
                                >

                                    <Icon className="h-6 w-6 sm:h-7 sm:w-7" />

                                </div>


                                {/* Título */}

                                <h3 className="mt-5 text-lg font-bold text-gray-900 sm:text-xl">

                                    {feature.title}

                                </h3>


                                {/* Descripción */}

                                <p className="mt-2 text-sm leading-6 text-gray-600 sm:text-base">

                                    {feature.description}

                                </p>

                            </div>

                        );

                    })}

                </div>


                {/* =====================================================
                    FRASE DE CIERRE
                ===================================================== */}

                <div className="mx-auto mt-10 max-w-2xl text-center sm:mt-14">

                    <p className="text-base font-semibold text-gray-800 sm:text-lg">

                        Una sola experiencia para que tu cliente
                        pueda descubrir, elegir y pedir.

                    </p>

                </div>

            </div>

        </section>
    );
}