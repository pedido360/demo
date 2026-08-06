import { MessageCircle } from "lucide-react";

export default function SmartSupport() {

    const whatsapp =
        "573001234567"; // <-- luego lo moveremos al .env

    const message =
        encodeURIComponent(
            "Hola, necesito ayuda con mi restaurante en Pedidos360."
        );

    return (

        <a
            href={`https://wa.me/${whatsapp}?text=${message}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
        >

            <div className="rounded-3xl bg-green-600 p-6 text-white shadow-sm transition hover:bg-green-700">

                <div className="flex items-center gap-4">

                    <div className="rounded-2xl bg-white/20 p-3">

                        <MessageCircle size={28} />

                    </div>

                    <div>

                        <h2 className="text-lg font-bold">
                            ¿Necesitas ayuda?
                        </h2>

                        <p className="text-sm text-green-100">
                            Escríbenos directamente por WhatsApp.
                        </p>

                    </div>

                </div>

            </div>

        </a>

    );

}