export default function CallToAction() {
    return (
        <section className="bg-gradient-to-b from-white to-gray-100 px-6 py-16">
            <div className="mx-auto max-w-md rounded-3xl border bg-white p-8 text-center shadow-xl">
                <div className="inline-flex items-center rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-700">
                    🚀 PEDIDOS360
                </div>

                <h2 className="mt-6 text-3xl font-bold">
                    ¿Te gustó este menú digital?
                </h2>

                <p className="mt-4 text-gray-600">
                    Adaptamos esta misma plataforma con el nombre, logo, colores,
                    productos y WhatsApp de tu restaurante.
                </p>

                <div className="mt-8 space-y-3 text-left">
                    <div className="rounded-xl bg-gray-50 p-4">
                        ✅ Menú Digital Personalizado
                    </div>

                    <div className="rounded-xl bg-gray-50 p-4">
                        ✅ Pedidos directo a tu WhatsApp
                    </div>

                    <div className="rounded-xl bg-gray-50 p-4">
                        ✅ Configuración completa
                    </div>

                    <div className="rounded-xl bg-gray-50 p-4">
                        ✅ Entrega rápida
                    </div>
                </div>

                <a
                    href="https://pedidos360.shop"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-10 inline-flex items-center justify-center rounded-2xl bg-red-600 px-8 py-4 font-bold text-white transition hover:bg-red-700"
                >
                    🚀 Quiero mi Menú Digital
                </a>
            </div>
        </section>
    );
}