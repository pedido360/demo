import {
    QrCode,
    Smartphone,
    MessageCircle,
    ArrowDown,
} from "lucide-react";

const steps = [
    {
        icon: QrCode,
        title: "Comparte tu menú",
        description:
            "Publica tu enlace o código QR en mesas, redes sociales o WhatsApp. Tus clientes acceden al menú en segundos.",
    },
    {
        icon: Smartphone,
        title: "El cliente hace su pedido",
        description:
            "Explora el menú, agrega productos al carrito y confirma su pedido desde cualquier celular.",
    },
    {
        icon: MessageCircle,
        title: "Recíbelo en WhatsApp",
        description:
            "El pedido llega organizado y listo para confirmar, sin llamadas ni mensajes desordenados.",
    },
];

export default function HowItWorks() {
    return (
        <section
            id="como-funciona"
            className="bg-white py-24"
        >
            <div className="mx-auto max-w-7xl px-6">

                {/* Header */}
                <div className="mx-auto max-w-3xl text-center">

                    <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-600">
                        Cómo funciona
                    </span>

                    <h2 className="mt-6 text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
                        Tres pasos. Cero complicaciones.
                    </h2>

                    <p className="mt-6 text-lg leading-8 text-gray-600">
                        En pocos minutos tendrás un menú digital listo para recibir
                        pedidos de forma organizada directamente en WhatsApp.
                    </p>

                </div>

                {/* Steps */}
                <div className="mt-20 grid gap-8 lg:grid-cols-3">

                    {steps.map((step, index) => {
                        const Icon = step.icon;

                        return (
                            <div
                                key={step.title}
                                className="relative rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl lg:text-left"
                            >

                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg lg:mx-0">
                                    <Icon className="h-8 w-8" />
                                </div>

                                <div className="mx-auto mt-8 flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-600 lg:mx-0">
                                    {index + 1}
                                </div>

                                <h3 className="mt-6 text-2xl font-bold text-gray-900">
                                    {step.title}
                                </h3>

                                <p className="mt-4 leading-7 text-gray-600">
                                    {step.description}
                                </p>

                                {index < steps.length - 1 && (
                                    <div className="absolute -right-4 top-1/2 hidden -translate-y-1/2 lg:block">
                                        <ArrowDown className="h-8 w-8 rotate-[-90deg] text-orange-300" />
                                    </div>
                                )}

                            </div>
                        );
                    })}

                </div>

                {/* Mensaje final */}

                <div className="mt-20 rounded-[32px] bg-gray-50 p-10 text-center">

                    <h3 className="text-3xl font-bold text-gray-900">
                        Tu restaurante recibe pedidos más rápido.
                    </h3>

                    <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-gray-600">
                        Sin instalar aplicaciones, sin procesos complicados y sin
                        depender de múltiples conversaciones para atender a tus clientes.
                    </p>

                </div>

            </div>
        </section>
    );
}