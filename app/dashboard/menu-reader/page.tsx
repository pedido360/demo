"use client";

import { useState } from "react";

export default function MenuReaderPage() {
    const [files, setFiles] = useState<File[]>([]);
    const [text, setText] = useState("");
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState("");

    function handleFileChange(
        event: React.ChangeEvent<HTMLInputElement>
    ) {
        const selectedFiles = Array.from(
            event.target.files ?? []
        );

        setFiles(selectedFiles);
        setText("");
        setError("");
    }

    async function handleProcess() {
        if (files.length === 0 || processing) {
            return;
        }

        setProcessing(true);
        setText("");
        setError("");

        try {
            const formData = new FormData();

            formData.append("file", files[0]);

            const response = await fetch(
                "/api/menu-reader",
                {
                    method: "POST",
                    body: formData,
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "No fue posible procesar el menú."
                );
            }

            setText(data.text ?? "");
        } catch (error) {
            console.error(error);

            setError(
                error instanceof Error
                    ? error.message
                    : "No fue posible procesar el menú."
            );
        } finally {
            setProcessing(false);
        }
    }

    async function handleCopy() {
        if (!text) {
            return;
        }

        try {
            await navigator.clipboard.writeText(text);
        } catch (error) {
            console.error(error);

            setError(
                "No fue posible copiar el texto."
            );
        }
    }

    function handleClear() {
        setFiles([]);
        setText("");
        setError("");
    }

    return (
        <div className="mx-auto max-w-6xl space-y-8">
            <div>
                <h1 className="text-3xl font-bold">
                    Digitaliza tu menú
                </h1>

                <p className="mt-2 max-w-3xl text-gray-500">
                    Sube una foto del menú y extrae su texto
                    para copiarlo y utilizarlo posteriormente
                    en Pedidos360.
                </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="space-y-4">
                    <div>
                        <h2 className="text-lg font-semibold">
                            1. Sube la foto del menú
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            En esta primera prueba procesaremos
                            una sola imagen.
                        </p>
                    </div>

                    <label
                        htmlFor="menu-images"
                        className="flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center transition hover:border-green-500 hover:bg-green-50"
                    >
                        <div className="text-4xl">
                            📷
                        </div>

                        <p className="mt-4 font-semibold text-gray-700">
                            Seleccionar foto del menú
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                            JPG, PNG o WEBP
                        </p>

                        <input
                            id="menu-images"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            multiple
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </label>
                </div>
            </div>

            {files.length > 0 && (
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold">
                                Imagen seleccionada
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                {files[0].name}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={handleClear}
                            disabled={processing}
                            className="rounded-xl px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Limpiar
                        </button>
                    </div>
                </div>
            )}

            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={handleProcess}
                    disabled={
                        files.length === 0 ||
                        processing
                    }
                    className="rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                    {processing
                        ? "Leyendo menú..."
                        : "Procesar menú"}
                </button>
            </div>

            {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                    {error}
                </div>
            )}

            {text && (
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-semibold">
                                Texto extraído
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Revisa y corrige el contenido
                                antes de copiarlo.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={handleCopy}
                            className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
                        >
                            📋 Copiar
                        </button>
                    </div>

                    <textarea
                        value={text}
                        onChange={(event) =>
                            setText(
                                event.target.value
                            )
                        }
                        className="mt-5 min-h-[500px] w-full resize-y rounded-xl border border-gray-300 bg-gray-50 p-4 font-mono text-sm leading-6 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                        spellCheck={false}
                    />
                </div>
            )}
        </div>
    );
}