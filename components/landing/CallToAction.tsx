export default function CallToAction() {
    return (
        <section className="bg-gradient-to-b from-white to-gray-100 py-16 px-6">
            <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl p-8 text-center border">

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
                    <div className="rounded-xl bg-gray-50 p-4">✅ Menú Digital Personalizado</div>
                    <div className="rounded-xl bg-gray-50 p-4">✅ Pedidos por WhatsApp</div>
                    <div className="rounded-xl bg-gray-50 p-4">✅ Configuración completa</div>
                    <div className="rounded-xl bg-gray-50 p-4">✅ Entrega rápida</div>
                </div>

                <a
                    href="https://wa.me/573184377576?text=Hola,%20quiero%20información%20sobre%20Pedidos360."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-10 inline-block rounded-2xl bg-green-600 px-8 py-4 font-bold text-white transition hover:bg-green-700"
                >
                    📲 Solicitar mi Menú Digital
                </a>

            </div>
        </section>
    );
}