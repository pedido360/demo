import { RestaurantOwner } from "@/types/restaurant-owner";

interface RestaurantOwnerFormProps {
    owner: RestaurantOwner;
    setOwner: React.Dispatch<React.SetStateAction<RestaurantOwner>>;
}

export default function RestaurantOwnerForm({
    owner,
    setOwner,
}: RestaurantOwnerFormProps) {

    function handleChange(
        field: keyof RestaurantOwner,
        value: string
    ) {
        setOwner((prev) => ({
            ...prev,
            [field]: value,
        }));
    }

    return (

        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">

            <div className="mb-6">

                <h2 className="text-xl font-bold">
                    👤 Propietario del restaurante
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                    Esta persona será quien ingrese al Smart Panel.
                </p>

            </div>

            <div className="space-y-5">

                <div>

                    <label className="mb-2 block text-sm font-medium">
                        Nombre completo
                    </label>

                    <input
                        type="text"
                        value={owner.fullName}
                        onChange={(e) =>
                            handleChange("fullName", e.target.value)
                        }
                        className="w-full rounded-xl border px-4 py-3"
                        placeholder="Juan Pérez"
                    />

                </div>

                <div>

                    <label className="mb-2 block text-sm font-medium">
                        Correo electrónico
                    </label>

                    <input
                        type="email"
                        value={owner.email}
                        onChange={(e) =>
                            handleChange("email", e.target.value)
                        }
                        className="w-full rounded-xl border px-4 py-3"
                        placeholder="correo@empresa.com"
                    />

                </div>

                <div>

                    <label className="mb-2 block text-sm font-medium">
                        Contraseña temporal
                    </label>

                    <input
                        type="password"
                        value={owner.password}
                        onChange={(e) =>
                            handleChange("password", e.target.value)
                        }
                        className="w-full rounded-xl border px-4 py-3"
                        placeholder="********"
                    />

                </div>

            </div>

        </section>

    );

}