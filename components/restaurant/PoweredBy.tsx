export default function PoweredBy() {

    const message = encodeURIComponent(
        "Hola 👋. Acabo de realizar un pedido desde un restaurante que usa Pedidos360 y me gustaría conocer cómo puedo tener esta plataforma para mi negocio."
    );

    return (

        <footer className="border-t border-gray-200 bg-white px-6 py-10">

            <div className="mx-auto max-w-md text-center">

                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-400">
                    Impulsado por
                </p>

                <h3 className="mt-3 text-2xl font-bold text-gray-900">
                    🚀 Pedidos360
                </h3>

                <p className="mt-4 text-gray-600">
                    La forma más fácil de recibir pedidos por WhatsApp.
                </p>

                <a
                    href={`https://wa.me/573184377576?text=${message}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex items-center font-semibold text-red-600 transition hover:text-red-700"
                >
                    Solicitar información →
                </a>

                <p className="mt-5 text-xs text-gray-400">
                    Configuración rápida • Sin comisiones • Personalizado
                </p>

            </div>

        </footer>

    );

}