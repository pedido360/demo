import {
    AlertTriangle,
    Clock3,
    FileText,
    MessageCircle,
    CheckCircle2,
} from "lucide-react";

const problems = [
    {
        icon: MessageCircle,
        title: "Pedidos por todos lados",
        description:
            "WhatsApp, llamadas y redes sociales. Es fácil perder pedidos o responder tarde.",
    },
    {
        icon: FileText,
        title: "Menú desactualizado",
        description:
            "Cada cambio implica enviar otro PDF o volver a explicar precios a cada cliente.",
    },
    {
        icon: Clock3,
        title: "Tiempo perdido",
        description:
            "Responder las mismas preguntas una y otra vez consume horas todos los días.",
    },
    {
        icon: AlertTriangle,
        title: "Ventas que no vuelven",
        description:
            "Si tardas en responder, muchos clientes simplemente compran en otro restaurante.",
    },
];

const solutions = [
    "Menú digital siempre actualizado.",
    "Pedidos organizados automáticamente.",
    "Confirmación inmediata al cliente.",
    "Todo centralizado en un solo lugar.",
];

export default function Problem() {
    return (
        <section
            id="problema"
            className="bg-white py-24"
        >
            <div className="mx-auto max-w-7xl px-6">

                {/* Header */}
                <div className="mx-auto max-w-3xl text-center">

                    <span className="inline-flex rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600">
                        El problema
                    </span>

                    <h2 className="mt-6 text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
                        ¿Te resulta familiar?
                    </h2>

                    <p className="mt-6 text-lg leading-8 text-gray-600">
                        Muchos restaurantes todavía gestionan sus pedidos de forma
                        manual. Eso significa más trabajo, más errores y clientes
                        que terminan comprando en otro lugar.
                    </p>

                </div>

                {/* Problem Cards */}
                <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

                    {problems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <div
                                key={item.title}
                                className="group rounded-3xl border border-gray-100 bg-white p-7 text-center shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-orange-200 hover:shadow-xl lg:text-left"
                            >
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 transition-colors group-hover:bg-orange-500 group-hover:text-white lg:mx-0">
                                    <Icon className="h-7 w-7" />
                                </div>

                                <h3 className="mt-6 text-xl font-bold text-gray-900">
                                    {item.title}
                                </h3>

                                <p className="mt-3 leading-7 text-gray-600">
                                    {item.description}
                                </p>
                            </div>
                        );
                    })}

                </div>

                {/* Solution */}
                <div className="mt-20 overflow-hidden rounded-[32px] bg-gradient-to-r from-orange-500 to-red-500 p-10 text-white shadow-2xl">

                    <div className="grid items-center gap-10 lg:grid-cols-2">

                        <div className="text-center lg:text-left">

                            <span className="rounded-full bg-white/20 px-4 py-2 text-sm font-semibold">
                                La solución
                            </span>

                            <h3 className="mt-5 text-3xl font-bold md:text-4xl">
                                Con Pedidos360 todo cambia.
                            </h3>

                            <p className="mt-5 text-lg leading-8 text-orange-50">
                                Centraliza tus pedidos, mantén tu menú siempre
                                actualizado y ofrece una experiencia moderna a tus
                                clientes sin depender de procesos manuales.
                            </p>

                        </div>

                        <div className="space-y-5">

                            {solutions.map((item) => (
                                <div
                                    key={item}
                                    className="flex items-center justify-center gap-4 rounded-2xl bg-white/10 px-5 py-4 text-center backdrop-blur lg:justify-start lg:text-left"
                                >
                                    <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-white" />

                                    <span className="text-lg font-medium">
                                        {item}
                                    </span>
                                </div>
                            ))}

                        </div>

                    </div>

                </div>

            </div>
        </section>
    );
}