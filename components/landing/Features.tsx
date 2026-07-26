import {
    MenuSquare,
    ShoppingCart,
    MessageCircle,
    BarChart3,
    Smartphone,
    BellRing,
} from "lucide-react";

const features = [
    {
        icon: MenuSquare,
        title: "Menú digital inteligente",
        description:
            "Actualiza productos, precios y promociones en segundos. Tus clientes siempre ven la versión correcta.",
    },
    {
        icon: ShoppingCart,
        title: "Pedidos organizados",
        description:
            "Cada pedido llega estructurado, evitando errores y reduciendo el tiempo de atención.",
    },
    {
        icon: MessageCircle,
        title: "Integración con WhatsApp",
        description:
            "El restaurante recibe pedidos listos para confirmar directamente desde WhatsApp.",
    },
    {
        icon: BellRing,
        title: "Notificaciones instantáneas",
        description:
            "Nunca vuelvas a perder un pedido por responder demasiado tarde.",
    },
    {
        icon: Smartphone,
        title: "Funciona en cualquier celular",
        description:
            "Tus clientes no necesitan descargar ninguna aplicación para hacer un pedido.",
    },
    {
        icon: BarChart3,
        title: "Más control para tu negocio",
        description:
            "Organiza tus pedidos y brinda una experiencia más profesional desde el primer día.",
    },
];

export default function Features() {
    return (
        <section
            id="funciones"
            className="bg-gray-50 py-24"
        >
            <div className="mx-auto max-w-7xl px-6">

                {/* Header */}
                <div className="mx-auto max-w-3xl text-center">

                    <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-600">
                        Todo lo que necesitas
                    </span>

                    <h2 className="mt-6 text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
                        Diseñado para vender más y trabajar menos.
                    </h2>

                    <p className="mt-6 text-lg leading-8 text-gray-600">
                        Pedidos360 automatiza las tareas repetitivas para que puedas
                        dedicar más tiempo a preparar pedidos y atender mejor a tus clientes.
                    </p>

                </div>

                {/* Cards */}
                <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-3">

                    {features.map((feature) => {
                        const Icon = feature.icon;

                        return (
                            <div
                                key={feature.title}
                                className="group rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:ring-orange-200 lg:text-left"
                            >
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 transition-all duration-300 group-hover:bg-orange-500 group-hover:text-white lg:mx-0">
                                    <Icon className="h-8 w-8" />
                                </div>

                                <h3 className="mt-6 text-xl font-bold text-gray-900">
                                    {feature.title}
                                </h3>

                                <p className="mt-4 leading-7 text-gray-600">
                                    {feature.description}
                                </p>
                            </div>
                        );
                    })}

                </div>

            </div>
        </section>
    );
}