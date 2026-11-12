"use client";

import { useCallback, useEffect, useState } from "react";

interface RestaurantOption {
    id: string;
    name: string;
}

interface Waiter {
    id: string;
    profileId: string;
    fullName: string;
    username: string;
    status: "active" | "suspended" | "deactivated";
    createdAt: string;
}

interface Props {
    restaurants: RestaurantOption[];
    initialRestaurantId?: string | null;
    isSuperAdmin: boolean;
}

export default function WaiterManagement({
    restaurants,
    initialRestaurantId,
    isSuperAdmin,
}: Props) {
    const [restaurantId, setRestaurantId] = useState(
        initialRestaurantId || ""
    );
    const [waiters, setWaiters] = useState<Waiter[]>([]);
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const loadWaiters = useCallback(async () => {
        if (!restaurantId) {
            setWaiters([]);
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await fetch(
                `/api/waiters/list?restaurantId=${encodeURIComponent(restaurantId)}`
            );
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "No se pudieron cargar los meseros.");
            }

            setWaiters(result.waiters);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error consultando meseros.");
        } finally {
            setLoading(false);
        }
    }, [restaurantId]);

    useEffect(() => {
        void loadWaiters();
    }, [loadWaiters]);

    async function createWaiter(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSaving(true);
        setError("");
        setMessage("");

        try {
            const response = await fetch("/api/waiters", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fullName,
                    email,
                    username,
                    password,
                    restaurantId,
                }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "No se pudo crear el mesero.");
            }

            setFullName("");
            setEmail("");
            setUsername("");
            setPassword("");
            setMessage("Mesero creado correctamente.");
            await loadWaiters();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error creando mesero.");
        } finally {
            setSaving(false);
        }
    }

    async function changeStatus(id: string, status: Waiter["status"]) {
        const labels = {
            active: "reactivar",
            suspended: "suspender",
            deactivated: "desactivar",
        };

        if (!window.confirm(`¿Confirmas ${labels[status]} este mesero?`)) {
            return;
        }

        setError("");
        setMessage("");

        try {
            const response = await fetch(`/api/waiters/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "No se pudo actualizar el estado.");
            }

            setMessage("Estado actualizado correctamente.");
            await loadWaiters();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error actualizando estado.");
        }
    }

    const statusLabel = {
        active: "Activo",
        suspended: "Suspendido",
        deactivated: "Desactivado",
    };

    return (
        <div className="space-y-8">
            {isSuperAdmin && (
                <div className="rounded-xl border bg-white p-5">
                    <label className="mb-2 block text-sm font-semibold">
                        Seleccionar restaurante
                    </label>
                    <select
                        value={restaurantId}
                        onChange={(event) => setRestaurantId(event.target.value)}
                        className="w-full rounded-lg border px-4 py-3"
                    >
                        <option value="">Selecciona un restaurante</option>
                        {restaurants.map((restaurant) => (
                            <option key={restaurant.id} value={restaurant.id}>
                                {restaurant.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {restaurantId ? (
                <form
                    onSubmit={createWaiter}
                    className="space-y-4 rounded-xl border bg-white p-6"
                >
                    <h2 className="text-xl font-bold">Registrar mesero</h2>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <input
                            value={fullName}
                            onChange={(event) => setFullName(event.target.value)}
                            placeholder="Nombre completo"
                            className="rounded-lg border px-4 py-3"
                            required
                            disabled={saving}
                        />
                        <input
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="Correo electrónico válido"
                            className="rounded-lg border px-4 py-3"
                            required
                            disabled={saving}
                        />
                        <input
                            value={username}
                            onChange={(event) => setUsername(event.target.value)}
                            placeholder="Nombre de usuario"
                            pattern="[a-zA-Z0-9][a-zA-Z0-9._-]{2,31}"
                            title="Entre 3 y 32 caracteres: letras, números, punto, guion o guion bajo."
                            className="rounded-lg border px-4 py-3"
                            required
                            disabled={saving}
                        />
                        <input
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="Contraseña (mínimo 8 caracteres)"
                            minLength={8}
                            className="rounded-lg border px-4 py-3"
                            required
                            disabled={saving}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {saving ? "Creando..." : "Crear mesero"}
                    </button>
                </form>
            ) : (
                isSuperAdmin && (
                    <p className="rounded-lg border bg-white p-5 text-gray-600">
                        Selecciona un restaurante para administrar sus meseros.
                    </p>
                )
            )}

            {error && (
                <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </p>
            )}

            {message && (
                <p className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                    {message}
                </p>
            )}

            {restaurantId && (
                <section className="rounded-xl border bg-white p-6">
                    <div className="mb-5 flex items-center justify-between">
                        <h2 className="text-xl font-bold">Equipo de meseros</h2>
                        <button
                            type="button"
                            onClick={() => void loadWaiters()}
                            disabled={loading}
                            className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
                        >
                            {loading ? "Cargando..." : "Actualizar"}
                        </button>
                    </div>

                    {loading ? (
                        <p className="py-6 text-gray-500">Cargando meseros...</p>
                    ) : waiters.length === 0 ? (
                        <p className="py-6 text-gray-500">
                            Todavía no hay meseros registrados.
                        </p>
                    ) : (
                        <div className="divide-y">
                            {waiters.map((waiter) => (
                                <article
                                    key={waiter.id}
                                    className="flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between"
                                >
                                    <div>
                                        <h3 className="font-semibold">{waiter.fullName}</h3>
                                        <p className="text-sm text-gray-500">
                                            Usuario: {waiter.username}
                                        </p>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Estado: {statusLabel[waiter.status]}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {waiter.status !== "active" && (
                                            <button
                                                type="button"
                                                onClick={() => void changeStatus(waiter.id, "active")}
                                                className="rounded-lg border border-green-600 px-3 py-2 text-sm text-green-700"
                                            >
                                                Reactivar
                                            </button>
                                        )}

                                        {waiter.status === "active" && (
                                            <button
                                                type="button"
                                                onClick={() => void changeStatus(waiter.id, "suspended")}
                                                className="rounded-lg border border-amber-500 px-3 py-2 text-sm text-amber-700"
                                            >
                                                Suspender
                                            </button>
                                        )}

                                        {waiter.status !== "deactivated" && (
                                            <button
                                                type="button"
                                                onClick={() => void changeStatus(waiter.id, "deactivated")}
                                                className="rounded-lg border border-red-500 px-3 py-2 text-sm text-red-700"
                                            >
                                                Desactivar
                                            </button>
                                        )}
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}
