import {
    Settings2,
    QrCode,
    MessageCircle,
} from "lucide-react";

const steps = [
    {
        number: "01",
        icon: Settings2,
        title: "Configura",
        description:
            "Crea tu menú, productos y opciones del Menú del Día.",
    },
    {
        number: "02",
        icon: QrCode,
        title: "Comparte",
        description:
            "Publica tu enlace o código QR en mesas, redes y WhatsApp.",
    },
    {
        number: "03",
        icon: MessageCircle,
        title: "Recibe",
        description:
            "Tu cliente hace el pedido y tú lo recibes organizado.",
    },
];

export default function HowItWorks() {
    return (
        <section
            id="como-funciona"
            className="bg-white py-16 sm:py-20 lg:py-24"
        >

            <div className="mx-auto max-w-6xl px-5 sm:px-6">

                {/* =====================================================
                    ENCABEZADO
                ===================================================== */}

                <div className="mx-auto max-w-2xl text-center">

                    <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-bold text-orange-600 sm:text-sm">
                        Así de sencillo
                    </span>


                    <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl md:text-5xl">
                        Del menú al pedido.
                    </h2>


                    <p className="mt-4 text-base leading-7 text-gray-600 sm:text-lg sm:leading-8">
                        Tres pasos y tu restaurante está listo para recibir pedidos.
                    </p>

                </div>


                {/* =====================================================
                    PASOS
                ===================================================== */}

                <div className="mt-10 grid gap-4 sm:mt-14 md:grid-cols-3 md:gap-6">

                    {steps.map((step) => {

                        const Icon = step.icon;

                        return (

                            <div
                                key={step.number}
                                className="
                                    relative
                                    rounded-3xl
                                    border
                                    border-gray-100
                                    bg-gray-50
                                    p-6
                                    sm:p-8
                                "
                            >

                                {/* Número + icono */}

                                <div className="flex items-center justify-between">

                                    <span className="text-sm font-extrabold text-orange-500">
                                        {step.number}
                                    </span>


                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-orange-500 shadow-sm sm:h-12 sm:w-12">

                                        <Icon className="h-5 w-5 sm:h-6 sm:w-6" />

                                    </div>

                                </div>


                                <h3 className="mt-6 text-xl font-bold text-gray-900 sm:text-2xl">
                                    {step.title}
                                </h3>


                                <p className="mt-2 text-sm leading-6 text-gray-600 sm:text-base">
                                    {step.description}
                                </p>

                            </div>

                        );

                    })}

                </div>


                {/* =====================================================
                    FRASE FINAL
                ===================================================== */}

                <div className="mx-auto mt-10 max-w-2xl text-center sm:mt-12">

                    <p className="text-base font-bold text-gray-800 sm:text-lg">
                        Sin aplicaciones para tus clientes.
                        Sin procesos complicados.
                    </p>

                </div>

            </div>

        </section>
    );
}