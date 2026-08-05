export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
];

export interface ImageValidationResult {

    valid: boolean;

    message?: string;

}

export function validateImage(
    file: File
): ImageValidationResult {

    if (
        !ALLOWED_IMAGE_TYPES.includes(file.type)
    ) {

        return {

            valid: false,

            message:
                "Solo se permiten imágenes JPG, PNG o WEBP.",

        };

    }

    if (
        file.size > MAX_IMAGE_SIZE
    ) {

        return {

            valid: false,

            message:
                "La imagen supera el tamaño máximo de 5 MB.",

        };

    }

    return {

        valid: true,

    };

}