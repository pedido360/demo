"use client";

import { useCallback, useEffect, useState } from "react";

interface FixedTable {
    id: string;
    table_number: number;
    label: string;
    is_active: boolean;
    hasOpenSession: boolean;
}

export default function FixedTableManagement() {
    const [tables, setTables] = useState<FixedTable[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [retiringId, setRetiringId] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const loadTables = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/restaurant/tables", {
                method: "GET",
                cache: "no-store",
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "No fue posible consultar las mesas.");
            }

            setTables(result.tables ?? []);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "No fue posible consultar las mesas."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadTables();
    }, [loadTables]);

    const createTable = async () => {
        setCreating(true);
        setError("");
        setMessage("");

        try {
            const response = await fetch("/api/restaurant/tables", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "No fue posible crear la mesa.");
            }

            setMessage(`${result.table.label} creada correctamente.`);
            await loadTables();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "No fue posible crear la mesa."
            );
        } finally {
            setCreating(false);
        }
    };

    const retireTable = async (table: FixedTable) => {
        if (table.hasOpenSession) {
            setError("No puedes retirar una mesa que tiene una cuenta abierta.");
            return;
        }

        if (!window.confirm(
            `¿Deseas retirar ${table.label}? Se conservará su historial y no se podrá usar para nuevas cuentas.`
        )) {
            return;
        }

        setRetiringId(table.id);
        setError("");
        setMessage("");

        try {
            const response = await fetch("/api/restaurant/tables", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tableId: table.id }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "No fue posible retirar la mesa.");
            }

            setMessage(`${table.label} fue retirada. Su historial se conserva.`);
            await loadTables();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "No fue posible retirar la mesa."
            );
        } finally {
            setRetiringId(null);
        }
    };

    const activeTables = tables.filter((table) => table.is_active);
    const retiredTables = tables.filter((table) => !table.is_active);

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="text-sm font-semibold text-gray-800">
                        Mesas permanentes del restaurante
                    </p>
                    <p className="text-xs text-gray-500">
                        Administra las mesas fijas sin afectar el historial.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={createTable}
                    disabled={creating || loading}
                    className="rounded-xl bg-green-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {creating ? "Creando..." : "+ Agregar mesa"}
                </button>
            </div>

            {error && (
                <div
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                >
                    {error}
                </div>
            )}

            {message && (
                <div
                    role="status"
                    className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700"
                >
                    {message}
                </div>
            )}

            {loading ? (
                <p className="py-5 text-center text-sm text-gray-500">
                    Cargando mesas...
                </p>
            ) : (
                <>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-gray-800">
                                Mesas activas
                            </h3>
                            <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-800">
                                {activeTables.length}
                            </span>
                        </div>

                        {activeTables.length === 0 ? (
                            <p className="rounded-lg bg-gray-50 px-3 py-4 text-sm text-gray-500">
                                Todavía no hay mesas fijas registradas.
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {activeTables.map((table) => (
                                    <div
                                        key={table.id}
                                        className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-3"
                                    >
                                        <div className="min-w-0">
                                            <p className="font-bold text-gray-900">
                                                {table.label}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {table.hasOpenSession
                                                    ? "Cuenta abierta"
                                                    : "Disponible para nuevas cuentas"}
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => void retireTable(table)}
                                            disabled={
                                                table.hasOpenSession ||
                                                retiringId !== null
                                            }
                                            title={
                                                table.hasOpenSession
                                                    ? "No se puede retirar porque tiene una cuenta abierta."
                                                    : "Retirar mesa"
                                            }
                                            className="shrink-0 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            {retiringId === table.id
                                                ? "Retirando..."
                                                : "Retirar"}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {retiredTables.length > 0 && (
                        <div className="space-y-2 border-t border-gray-100 pt-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-gray-700">
                                    Mesas retiradas
                                </h3>
                                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-600">
                                    {retiredTables.length}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {retiredTables.map((table) => (
                                    <div
                                        key={table.id}
                                        className="rounded-xl border border-gray-200 bg-gray-50 p-3"
                                    >
                                        <p className="font-semibold text-gray-600">
                                            {table.label}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Retirada · Historial conservado
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
