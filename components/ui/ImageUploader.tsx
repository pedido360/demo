"use client";

import { useEffect, useRef, useState } from "react";

interface ImageUploaderProps {
    label: string;
    value?: string;
    onChange: (file: File | null) => void;
}

function getImageConfig(label: string) {
    const normalizedLabel = label.toLowerCase();

    if (normalizedLabel.includes("logo")) {
        return {
            maxWidth: 512,
            maxHeight: 512,
            quality: 0.8,
        };
    }

    if (normalizedLabel.includes("banner")) {
        return {
            maxWidth: 1600,
            maxHeight: 900,
            quality: 0.78,
        };
    }

    return {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.78,
    };
}

async function optimizeImage(
    file: File,
    label: string
): Promise<File> {

    const config = getImageConfig(label);

    const imageUrl =
        URL.createObjectURL(file);

    try {

        const image = new Image();

        image.src = imageUrl;

        await new Promise<void>((resolve, reject) => {

            image.onload = () => resolve();

            image.onerror = () =>
                reject(
                    new Error(
                        "No fue posible procesar la imagen."
                    )
                );

        });

        let width = image.naturalWidth;
        let height = image.naturalHeight;

        const scale =
            Math.min(
                config.maxWidth / width,
                config.maxHeight / height,
                1
            );

        width =
            Math.round(width * scale);

        height =
            Math.round(height * scale);

        const canvas =
            document.createElement("canvas");

        canvas.width = width;
        canvas.height = height;

        const context =
            canvas.getContext("2d");

        if (!context) {
            throw new Error(
                "No fue posible preparar la imagen."
            );
        }

        context.drawImage(
            image,
            0,
            0,
            width,
            height
        );

        const blob =
            await new Promise<Blob | null>(
                (resolve) =>
                    canvas.toBlob(
                        resolve,
                        "image/webp",
                        config.quality
                    )
            );

        if (!blob) {
            throw new Error(
                "No fue posible convertir la imagen a WebP."
            );
        }

        const baseName =
            file.name
                .replace(
                    /\.[^/.]+$/,
                    ""
                )
                .replace(
                    /[^a-zA-Z0-9-_]/g,
                    "-"
                );

        const optimizedFile =
            new File(
                [blob],
                `${baseName}.webp`,
                {
                    type: "image/webp",
                    lastModified:
                        Date.now(),
                }
            );

        return optimizedFile;

    } finally {

        URL.revokeObjectURL(imageUrl);

    }
}

export default function ImageUploader({
    label,
    value,
    onChange,
}: ImageUploaderProps) {

    const inputRef =
        useRef<HTMLInputElement>(null);

    const previewUrlRef =
        useRef<string | null>(null);

    const [preview, setPreview] =
        useState(value ?? "");

    const [processing, setProcessing] =
        useState(false);

    useEffect(() => {

        if (value) {
            setPreview(value);
        }

    }, [value]);

    useEffect(() => {

        return () => {

            if (previewUrlRef.current) {
                URL.revokeObjectURL(
                    previewUrlRef.current
                );
            }

        };

    }, []);

    async function handleFile(
        event: React.ChangeEvent<HTMLInputElement>
    ) {

        const file =
            event.target.files?.[0];

        if (!file) return;

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (
            !allowedTypes.includes(
                file.type
            )
        ) {

            alert(
                "Solo se permiten imágenes JPG, PNG o WEBP."
            );

            event.target.value = "";

            return;

        }

        try {

            setProcessing(true);

            const optimizedFile =
                await optimizeImage(
                    file,
                    label
                );

            if (
                previewUrlRef.current
            ) {
                URL.revokeObjectURL(
                    previewUrlRef.current
                );
            }

            const url =
                URL.createObjectURL(
                    optimizedFile
                );

            previewUrlRef.current =
                url;

            setPreview(url);

            onChange(
                optimizedFile
            );

        } catch (error) {

            console.error(
                "IMAGE OPTIMIZATION ERROR:",
                error
            );

            alert(
                "No fue posible optimizar la imagen. Intenta nuevamente."
            );

        } finally {

            setProcessing(false);

            event.target.value = "";

        }

    }

    return (

        <div>

            <label className="mb-2 block text-sm font-medium">
                {label}
            </label>

            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFile}
                className="hidden"
            />

            <div
                onClick={() => {

                    if (!processing) {
                        inputRef.current?.click();
                    }

                }}
                className={`cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-gray-300 transition hover:border-red-500 ${processing
                    ? "pointer-events-none opacity-70"
                    : ""
                    }`}
            >

                {preview ? (

                    <div className="group relative">

                        <img
                            src={preview}
                            alt={label}
                            className="h-52 w-full object-cover"
                        />

                        {processing ? (

                            <div className="absolute inset-0 flex items-center justify-center bg-black/60">

                                <span className="rounded-xl bg-white px-5 py-2 font-semibold text-gray-800 shadow">

                                    ⚙️ Optimizando imagen...

                                </span>

                            </div>

                        ) : (

                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100">

                                <span className="rounded-xl bg-white px-5 py-2 font-semibold text-gray-800 shadow">

                                    📷 Cambiar imagen

                                </span>

                            </div>

                        )}

                    </div>

                ) : (

                    <div className="flex h-52 flex-col items-center justify-center bg-gray-50 transition hover:bg-gray-100">

                        {processing ? (

                            <>
                                <div className="text-5xl">
                                    ⚙️
                                </div>

                                <p className="mt-4 text-lg font-semibold">
                                    Optimizando imagen...
                                </p>

                                <p className="mt-2 text-center text-sm text-gray-500">
                                    Preparando la imagen para Pedidos360
                                </p>
                            </>

                        ) : (

                            <>
                                <div className="text-6xl">
                                    🖼️
                                </div>

                                <p className="mt-4 text-lg font-semibold">
                                    Agregar imagen
                                </p>

                                <p className="mt-2 text-center text-sm text-gray-500">
                                    Haz clic para seleccionar una imagen
                                </p>

                                <p className="mt-1 text-xs text-gray-400">
                                    JPG • PNG • WEBP
                                </p>
                            </>

                        )}

                    </div>

                )}

            </div>

            <p className="mt-2 text-xs text-gray-400">
                La imagen se optimizará automáticamente antes de guardarse.
            </p>

        </div>

    );

}