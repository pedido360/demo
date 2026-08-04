"use client";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface RestaurantCreatedModalProps {
    open: boolean;
    url: string;
    onClose: () => void;
}

export default function RestaurantCreatedModal({
    open,
    url,
    onClose,
}: RestaurantCreatedModalProps) {
    if (!open) {
        return null;
    }

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(url);
        } catch (error) {
            console.error(error);
            alert("No fue posible copiar el enlace.");
        }
    }

    function handleOpenRestaurant() {
        window.open(url, "_blank", "noopener,noreferrer");
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg">
                <Card
                    title="🎉 Restaurante creado"
                    description="Tu restaurante ya está listo para recibir pedidos."
                >
                    <div className="space-y-6">
                        <div>
                            <p className="mb-2 text-sm font-medium">
                                Enlace del restaurante
                            </p>

                            <div className="rounded-lg border bg-gray-50 p-3 break-all text-sm">
                                {url}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Button
                                variant="outline"
                                onClick={handleCopy}
                            >
                                📋 Copiar enlace
                            </Button>

                            <Button
                                onClick={handleOpenRestaurant}
                            >
                                🚀 Ver restaurante
                            </Button>
                        </div>

                        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-gray-500">
                            📱 Código QR
                            <br />
                            Próximamente
                        </div>

                        <div className="flex justify-end">
                            <Button
                                variant="secondary"
                                onClick={onClose}
                            >
                                Cerrar
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}