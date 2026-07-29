import RestaurantEditor from "@/components/admin/restaurants/form/RestaurantEditor";

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

        </div>

    );

}