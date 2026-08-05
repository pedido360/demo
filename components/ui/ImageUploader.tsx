"use client";

import { useRef, useState } from "react";

interface ImageUploaderProps {
    label: string;
    value?: string;
    onChange: (file: File | null) => void;
}

export default function ImageUploader({
    label,
    value,
    onChange,
}: ImageUploaderProps) {

    const inputRef = useRef<HTMLInputElement>(null);

    const [preview, setPreview] = useState(value ?? "");

    function handleFile(
        event: React.ChangeEvent<HTMLInputElement>
    ) {

        const file = event.target.files?.[0];

        if (!file) return;

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.type)) {

            alert(
                "Solo se permiten imágenes JPG, PNG o WEBP."
            );

            return;

        }

        const maxSize = 5 * 1024 * 1024;

        if (file.size > maxSize) {

            alert(
                "La imagen no puede superar los 5 MB."
            );

            return;

        }

        const url = URL.createObjectURL(file);

        setPreview(url);

        onChange(file);

    }

    return (

        <div>

            <label className="mb-2 block text-sm font-medium">
                {label}
            </label>

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleFile}
                className="hidden"
            />

            <div
                onClick={() => inputRef.current?.click()}
                className="cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-gray-300 transition hover:border-red-500"
            >

                {preview ? (

                    <div className="group relative">

                        <img
                            src={preview}
                            alt={label}
                            className="h-52 w-full object-cover"
                        />

                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100">

                            <span className="rounded-xl bg-white px-5 py-2 font-semibold text-gray-800 shadow">

                                📷 Cambiar imagen

                            </span>

                        </div>

                    </div>

                ) : (

                    <div className="flex h-52 flex-col items-center justify-center bg-gray-50 transition hover:bg-gray-100">

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

                    </div>

                )}

            </div>

        </div>

    );

}