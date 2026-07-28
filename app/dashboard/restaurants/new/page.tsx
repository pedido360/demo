import RestaurantEditor from '@/components/admin/restaurants/form/RestaurantEditor';

export default function NewRestaurantPage() {
    return (
        <div className="mx-auto max-w-7xl p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">
                    Nuevo restaurante
                </h1>

                <p className="mt-2 text-gray-500">
                    Completa la información para crear un nuevo restaurante.
                </p>
            </div>

            <RestaurantEditor />
        </div>
    );
}