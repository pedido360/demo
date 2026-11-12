"use client";

import { useEffect, useState } from "react";

export default function PrintingSettings() {
    const [isOpen, setIsOpen] = useState(false);
    const [agentName, setAgentName] = useState("");
    const [secret, setSecret] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [copyMessage, setCopyMessage] = useState("");
    const [agents, setAgents] = useState<Array<{
        id: string;
        agent_name: string;
        is_active: boolean;
        created_at: string;
        last_seen_at: string | null;
    }>>([]);
    const [agentsLoading, setAgentsLoading] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        setAgentsLoading(true);
        fetch("/api/restaurant/printing")
            .then(async (response) => {
                const data = await response.json();
                if (!response.ok) throw new Error(data.error);
                setAgents(data.agents ?? []);
            })
            .catch((err) => setError(err.message || "No se pudieron cargar los agentes."))
            .finally(() => setAgentsLoading(false));
    }, [isOpen]);

    async function registerAgent() {
        if (!agentName.trim()) {
            setError("Escribe el nombre del computador.");
            return;
        }

        if (!window.confirm("¿Confirmas registrar este computador como agente de impresión? Guarda la clave que se mostrará una sola vez.")) return;

        setLoading(true);
        setError("");
        setSecret("");

        try {
            const response = await fetch("/api/restaurant/printing", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ agentName: agentName.trim() }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "No se pudo registrar el agente.");
            }

            setSecret(data.secret);
            setAgents((current) => [data.agent, ...current]);
            setAgentName("");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error inesperado.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="rounded-xl border border-amber-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                        Configuración avanzada de impresión
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Administración técnica del agente y las impresoras.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setIsOpen((current) => !current)}
                    aria-expanded={isOpen}
                    className="rounded-xl border border-gray-300 bg-gray-50 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-100"
                >
                    {isOpen ? "Cerrar configuración" : "Ver configuración"}
                </button>
            </div>

            <div role="alert" className="mx-5 mb-5 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
                <p className="font-bold">⚠️ ADVERTENCIA: NO MANIPULAR SI YA ESTÁ CONFIGURADO.</p>
                <p className="mt-1">
                    Si la impresión automática funciona correctamente, no registres
                    nuevamente el equipo. Podrías interrumpir la impresión.
                </p>
            </div>

            {isOpen && (
                <div className="space-y-4 border-t border-gray-200 p-5">
                    <div className="rounded-lg border border-gray-200 p-4">
                        <h3 className="font-semibold text-gray-900">Equipos registrados</h3>
                        {agentsLoading && <p className="mt-2 text-sm text-gray-500">Consultando equipos...</p>}
                        {!agentsLoading && agents.length === 0 && (
                            <p className="mt-2 text-sm text-gray-500">Todavía no hay equipos registrados.</p>
                        )}
                        <div className="mt-3 space-y-3">
                            {agents.map((agent) => (
                                <div key={agent.id} className="rounded-lg bg-gray-50 p-3 text-sm">
                                    <p className="font-semibold text-gray-900">{agent.agent_name}</p>
                                    <p className="mt-1 break-all text-xs text-gray-500">ID: {agent.id}</p>
                                    <p className={agent.is_active ? "mt-1 font-medium text-green-700" : "mt-1 font-medium text-red-700"}>
                                        {agent.is_active ? "Activo" : "Inactivo"}
                                    </p>
                                    <p className="text-gray-600">
                                        Registrado: {new Date(agent.created_at).toLocaleString("es-CO")}
                                    </p>
                                    <p className="text-gray-600">
                                        Última conexión: {agent.last_seen_at ? new Date(agent.last_seen_at).toLocaleString("es-CO") : "Aún no se ha conectado"}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold text-gray-900">Registrar computador</h3>
                        <p className="mt-1 text-sm text-gray-600">
                            Registra el equipo donde funcionará el agente de impresión.
                        </p>
                    </div>

                    <input
                        value={agentName}
                        onChange={(event) => setAgentName(event.target.value)}
                        placeholder="Ej. Computador de caja"
                        maxLength={80}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3"
                        disabled={loading || !!secret}
                    />

                    <button
                        type="button"
                        onClick={registerAgent}
                        disabled={loading || !!secret}
                        className="rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
                    >
                        {loading ? "Registrando..." : "Registrar agente"}
                    </button>

                    {error && (
                        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                            {error}
                        </p>
                    )}

                    {secret && (
                        <div className="space-y-3 rounded-lg border border-green-300 bg-green-50 p-4">
                            <p className="font-bold text-green-900">Agente registrado correctamente.</p>
                            <p className="text-sm text-green-800">
                                Copia y guarda esta clave. No volverá a mostrarse.
                            </p>
                            <code className="block break-all rounded bg-white p-3 text-sm text-gray-900">
                                {secret}
                            </code>
                            <button
                                type="button"
                                onClick={async () => {
                                    try {
                                        await navigator.clipboard.writeText(secret);
                                        setCopyMessage("¡Clave copiada correctamente!");
                                    } catch {
                                        setCopyMessage("No se pudo copiar. Selecciona y copia la clave manualmente.");
                                    }
                                }}
                                className="rounded-lg bg-green-700 px-4 py-2 font-semibold text-white hover:bg-green-800"
                            >
                                Copiar clave
                            </button>
                            {copyMessage && (
                                <p role="status" className="text-sm font-semibold text-green-800">
                                    {copyMessage}
                                </p>
                            )}
                            <p className="text-xs text-green-800">
                                No cierres esta pantalla hasta haber guardado la clave.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}
