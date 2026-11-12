import RestaurantEditor from "@/components/admin/restaurants/form/RestaurantEditor";
import WaiterManagement from "@/components/admin/waiters/WaiterManagement";

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function EditRestaurantPage({
    params,
}: PageProps) {

    const { id } = await params;

    return (

        <div className="mx-auto max-w-7xl p-6">

            <div className="mb-6">

                <h1 className="text-3xl font-bold">
                    Editar restaurante
                </h1>

                <p className="mt-2 text-gray-500">
                    Actualiza la información del restaurante.
                </p>

            </div>

            <RestaurantEditor restaurantId={id} />

            <section className="mt-10 border-t border-gray-200 pt-8">
                <div className="mb-5">
                    <h2 className="text-2xl font-bold">Gestión de meseros</h2>
                    <p className="mt-2 text-gray-500">
                        Administra las cuentas de los meseros de este restaurante.
                    </p>
                </div>

                <WaiterManagement
                    restaurants={[]}
                    initialRestaurantId={id}
                    isSuperAdmin={false}
                />
            </section>

        </div>

    );

}