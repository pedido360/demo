"use client";

import Card from "@/components/ui/Card";

import { RestaurantHour } from "@/types/restaurant-hour";

interface Props {
    hours: RestaurantHour[];
    setHours: React.Dispatch<React.SetStateAction<RestaurantHour[]>>;
}

const DAYS = [
    { value: 1, label: "Lunes" },
    { value: 2, label: "Martes" },
    { value: 3, label: "Miércoles" },
    { value: 4, label: "Jueves" },
    { value: 5, label: "Viernes" },
    { value: 6, label: "Sábado" },
    { value: 0, label: "Domingo" },
];

export default function RestaurantHoursEditor({
    hours,
    setHours,
}: Props) {

    function updateHour(
        dayOfWeek: number,
        field: keyof RestaurantHour,
        value: string | boolean
    ) {
        setHours((current) =>
            current.map((hour) =>
                hour.dayOfWeek === dayOfWeek
                    ? {
                        ...hour,
                        [field]: value,
                    }
                    : hour
            )
        );
    }

    function copyMondayToAllDays() {
        const monday = hours.find(
            (hour) => hour.dayOfWeek === 1
        );

        if (!monday) return;

        setHours((current) =>
            current.map((hour) => ({
                ...hour,
                isOpen: monday.isOpen,
                openTime: monday.openTime,
                closeTime: monday.closeTime,
            }))
        );
    }

    return (
        <Card
            title="Horario de Atención"
            description="Configura los días y horarios en los que el restaurante recibirá pedidos."
        >
            <div className="mb-6 flex justify-end">

                <button
                    type="button"
                    onClick={copyMondayToAllDays}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                    Copiar horario de lunes a todos los días
                </button>

            </div>

            <div className="space-y-4">

                {DAYS.map((day) => {

                    const hour = hours.find(
                        (h) => h.dayOfWeek === day.value
                    );

                    if (!hour) return null;

                    return (
                        <div
                            key={day.value}
                            className="rounded-xl border p-4"
                        >

                            <div className="flex items-center justify-between">

                                <h3 className="font-medium">
                                    {day.label}
                                </h3>

                                <label className="flex items-center gap-2 text-sm">

                                    <input
                                        type="checkbox"
                                        checked={hour.isOpen}
                                        onChange={(e) =>
                                            updateHour(
                                                day.value,
                                                "isOpen",
                                                e.target.checked
                                            )
                                        }
                                    />

                                    Abierto

                                </label>

                            </div>

                            {hour.isOpen ? (<div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">

                                <div>

                                    <label className="mb-1 block text-sm font-medium">
                                        Hora de apertura
                                    </label>

                                    <input
                                        type="time"
                                        value={hour.openTime}
                                        onChange={(e) =>
                                            updateHour(
                                                day.value,
                                                "openTime",
                                                e.target.value
                                            )
                                        }
                                        className="w-full rounded-lg border px-3 py-2"
                                    />

                                </div>

                                <div>

                                    <label className="mb-1 block text-sm font-medium">
                                        Hora de cierre
                                    </label>

                                    <input
                                        type="time"
                                        value={hour.closeTime}
                                        onChange={(e) =>
                                            updateHour(
                                                day.value,
                                                "closeTime",
                                                e.target.value
                                            )
                                        }
                                        className="w-full rounded-lg border px-3 py-2"
                                    />

                                </div>

                            </div>

                            ) : (

                                <p className="mt-3 text-sm text-gray-500">
                                    El restaurante permanecerá cerrado este día.
                                </p>

                            )}

                        </div>
                    );

                })}

            </div>

        </Card>
    );
}