import Link from "next/link";
import { Store, Plus } from "lucide-react";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/LinkButton";

export default function DashboardPage() {
    return (
        <div className="space-y-8">

            <div>
                <h1 className="text-3xl font-bold">
                    Dashboard
                </h1>

                <p className="mt-2 text-gray-500">
                    Bienvenido a Pedidos360.
                </p>
            </div>

            <Card
                title="Restaurantes"
                description="Administra los restaurantes registrados."
            >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex items-center gap-3">

                        <div className="rounded-xl bg-orange-100 p-3">
                            <Store
                                className="text-orange-600"
                                size={24}
                            />
                        </div>

                        <div>

                            <h2 className="font-semibold">
                                Restaurantes
                            </h2>

                            <p className="text-sm text-gray-500">
                                Crear, editar y administrar restaurantes.
                            </p>

                        </div>

                    </div>

                    <div className="flex gap-3">

                        <Link href="/dashboard/restaurants">
                            <Button>
                                Ver restaurantes
                            </Button>
                        </Link>

                        <Link href="/dashboard/restaurants/new">
                            <Button
                                leftIcon={<Plus size={18} />}
                            >
                                Nuevo
                            </Button>
                        </Link>

                    </div>

                </div>

            </Card>

        </div>
    );
}