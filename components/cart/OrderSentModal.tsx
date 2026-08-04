"use client";

import Button from "@/components/ui/Button";

interface OrderSentModalProps {
    open: boolean;
    restaurantName: string;
    onClose: () => void;
}

export default function OrderSentModal({
    open,
    restaurantName,
    onClose,
}: OrderSentModalProps) {

    if (!open) {
        return null;
    }

    return (

        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">

            <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">

                <div className="text-center">

                    <div className="text-6xl">
                        🎉
                    </div>

                    <h2 className="mt-4 text-2xl font-bold">
                        ¡Gracias por tu pedido!
                    </h2>

                    <p className="mt-5 text-gray-600">

                        <strong>{restaurantName}</strong>
                        {" "}ha recibido tu solicitud.

                    </p>

                    <p className="mt-4 text-gray-600">

                        👨‍🍳 Nuestro equipo comenzará a procesar tu pedido y prepararlo lo antes posible.

                    </p>

                    <p className="mt-4 text-gray-600">

                        📲 Si necesitamos confirmar algún detalle, nos comunicaremos contigo por WhatsApp.

                    </p>

                    <p className="mt-4 text-gray-600">

                        🙏 Gracias por confiar en nosotros.

                    </p>

                </div>

                <div className="mt-8">

                    <Button
                        fullWidth
                        onClick={onClose}
                    >
                        ✅ Terminar
                    </Button>

                </div>

            </div>

        </div>

    );

}