"use client";

import { useState } from "react";
import { Product, ProductAvailableHour } from "@/types/product";
import { saveCompleteProduct } from "@/lib/services/product.service";

const DAYS = [
    { value: 1, label: "Lunes" },
    { value: 2, label: "Martes" },
    { value: 3, label: "Miércoles" },
    { value: 4, label: "Jueves" },
    { value: 5, label: "Viernes" },
    { value: 6, label: "Sábado" },
    { value: 0, label: "Domingo" },
];

type Mode = "everyday" | "scheduled" | "purchase";

export default function DailyMenuAvailabilitySettings({
    product,
    onSaved,
}: {
    product: Product;
    onSaved: (product: Product) => void;
}) {
    const initialMode: Mode = product.restrictPurchaseHours
        ? "purchase"
        : (product.availableDays?.length || product.availableHours?.length)
            ? "scheduled"
            : "everyday";

    const [mode, setMode] = useState<Mode>(initialMode);
    const [days, setDays] = useState<number[]>(
        product.availableDays?.length ? product.availableDays : [1, 2, 3, 4, 5]
    );
    const [hours, setHours] = useState<Record<number, { start: string; end: string }>>(() => {
        const result: Record<number, { start: string; end: string }> = {};
        for (const day of DAYS) {
            const current = product.availableHours?.find(h => h.dayOfWeek === day.value);
            result[day.value] = {
                start: current?.startTime.slice(0, 5) || "09:00",
                end: current?.endTime.slice(0, 5) || "17:00",
            };
        }
        return result;
    });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    function copyFirstDayHours() {
        const selectedDays = DAYS
            .map(day => day.value)
            .filter(day => days.includes(day));

        if (selectedDays.length === 0) {
            setMessage("Selecciona al menos un día para copiar los horarios.");
            return;
        }

        const firstDay = selectedDays[0];
        const sourceHours = hours[firstDay];

        setHours(old => {
            const updated = { ...old };

            for (const day of selectedDays) {
                updated[day] = {
                    start: sourceHours.start,
                    end: sourceHours.end,
                };
            }

            return updated;
        });

        setMessage(
            `Horario de ${DAYS.find(day => day.value === firstDay)?.label} copiado a los días seleccionados. Recuerda guardar los cambios.`
        );
    }

    async function save() {
        setSaving(true);
        setMessage("");
        try {
            const scheduled = mode !== "everyday";
            if (scheduled && days.length === 0) {
                throw new Error("Selecciona al menos un día.");
            }

            const availableHours: ProductAvailableHour[] = scheduled
                ? days.map(day => {
                    const h = hours[day];
                    if (!h?.start || !h?.end || h.start >= h.end) {
                        throw new Error("Revisa los horarios: la hora final debe ser posterior a la inicial.");
                    }
                    return {
                        id: product.availableHours?.find(item => item.dayOfWeek === day)?.id ?? crypto.randomUUID(),
                        productId: product.id,
                        dayOfWeek: day,
                        startTime: h.start,
                        endTime: h.end,
                    };
                })
                : [];

            const updated = await saveCompleteProduct({
                ...product,
                restrictPurchaseHours: mode === "purchase",
                availableDays: scheduled ? [...days] : [],
                availableHours,
            });
            onSaved(updated);
            setMessage("Disponibilidad guardada correctamente.");
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "No fue posible guardar la configuración.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <section className="rounded-2xl border border-orange-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-bold">🕒 Disponibilidad general del Menú del Día</h3>
            <p className="mt-1 text-sm text-gray-600">
                Se aplica a los menús de todas las fechas, actuales y futuras.
            </p>

            <div className="mt-4 grid gap-3">
                <label className="flex gap-3 rounded-xl border p-3">
                    <input type="radio" name="daily-menu-mode" checked={mode === "everyday"} onChange={() => setMode("everyday")} />
                    <span><strong>Todos los días</strong><span className="block text-sm text-gray-600">Sin restricciones adicionales; sigue el horario habitual del restaurante.</span></span>
                </label>
                <label className="flex gap-3 rounded-xl border p-3">
                    <input type="radio" name="daily-menu-mode" checked={mode === "scheduled"} onChange={() => setMode("scheduled")} />
                    <span><strong>Disponibilidad por días y horarios</strong><span className="block text-sm text-gray-600">Oculta el producto fuera de los días y horarios configurados.</span></span>
                </label>
                <label className="flex gap-3 rounded-xl border p-3">
                    <input type="radio" name="daily-menu-mode" checked={mode === "purchase"} onChange={() => setMode("purchase")} />
                    <span><strong>Limitar horario de compra</strong><span className="block text-sm text-gray-600">Permanece visible, pero bloquea la compra fuera del horario.</span></span>
                </label>
            </div>

            {mode !== "everyday" && (
                <div className="mt-5 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h4 className="font-semibold">Días y horarios · hora de Colombia</h4>
                        <button
                            type="button"
                            onClick={copyFirstDayHours}
                            disabled={saving || days.length === 0}
                            className="rounded-lg border border-orange-300 px-4 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-50 disabled:opacity-50"
                        >
                            Copiar horario del primer día a todos los días seleccionados
                        </button>
                    </div>
                    {DAYS.map(day => (
                        <div key={day.value} className="grid gap-3 rounded-xl border p-3 sm:grid-cols-3 sm:items-center">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={days.includes(day.value)}
                                    onChange={e => setDays(old => e.target.checked ? [...old, day.value] : old.filter(d => d !== day.value))}
                                />
                                {day.label}
                            </label>
                            <label className="text-sm">Desde
                                <input type="time" disabled={!days.includes(day.value)} value={hours[day.value].start}
                                    onChange={e => setHours(old => ({ ...old, [day.value]: { ...old[day.value], start: e.target.value } }))}
                                    className="mt-1 w-full rounded-lg border p-2 disabled:bg-gray-100" />
                            </label>
                            <label className="text-sm">Hasta
                                <input type="time" disabled={!days.includes(day.value)} value={hours[day.value].end}
                                    onChange={e => setHours(old => ({ ...old, [day.value]: { ...old[day.value], end: e.target.value } }))}
                                    className="mt-1 w-full rounded-lg border p-2 disabled:bg-gray-100" />
                            </label>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-3">
                <button type="button" disabled={saving} onClick={save}
                    className="rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white hover:bg-orange-700 disabled:opacity-60">
                    {saving ? "Guardando..." : "Guardar disponibilidad"}
                </button>
                {message && <p role="status" className="text-sm">{message}</p>}
            </div>
        </section>
    );
}
