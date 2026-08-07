"use client";

import { useState } from "react";

import RestaurantHoursEditor from "@/components/admin/restaurants/form/RestaurantHoursEditor";

import { RestaurantHour } from "@/types/restaurant-hour";

import { updateRestaurantHours } from "@/lib/repositories/restaurant-hours.repository";

interface RestaurantHoursPanelProps {
    restaurantId: string;
    hours: RestaurantHour[];
}

export default function RestaurantHoursPanel({
    restaurantId,
    hours: initialHours,
}: RestaurantHoursPanelProps) {

    const [hours, setHours] = useState(initialHours);

    const [saving, setSaving] = useState(false);

    async function handleSave() {

        try {

            setSaving(true);

            await updateRestaurantHours(
                restaurantId,
                hours
            );

            alert("✅ Horarios guardados correctamente.");

        } catch (error) {

            console.error(error);

            alert("❌ No fue posible guardar los horarios.");

        } finally {

            setSaving(false);

        }

    }

    return (

        <div className="space-y-4">

            <RestaurantHoursEditor
                hours={hours}
                setHours={setHours}
            />

            <div className="flex justify-end">

                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-xl bg-orange-600 px-5 py-2 font-semibold text-white transition hover:bg-orange-700 disabled:opacity-50"
                >
                    {saving
                        ? "Guardando..."
                        : "💾 Guardar horarios"}
                </button>

            </div>

        </div>

    );

}