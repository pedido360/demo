const MAX_WIDTH = 1200;
const MAX_HEIGHT = 630;
const TARGET_SIZE = 300 * 1024;

export async function optimizeRestaurantBanner(
    file: File
): Promise<File> {
    if (!file.type.startsWith("image/")) {
        throw new Error("El archivo seleccionado no es una imagen.");
    }

    const imageUrl = URL.createObjectURL(file);

    try {
        const image = new Image();

        await new Promise<void>((resolve, reject) => {
            image.onload = () => resolve();
            image.onerror = () => reject(
                new Error("No fue posible leer la imagen seleccionada.")
            );
            image.src = imageUrl;
        });

        let width = MAX_WIDTH;
        let height = MAX_HEIGHT;

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) {
            throw new Error("No fue posible procesar la imagen.");
        }

        const scale = Math.max(
            MAX_WIDTH / image.width,
            MAX_HEIGHT / image.height
        );

        const sourceWidth = MAX_WIDTH / scale;
        const sourceHeight = MAX_HEIGHT / scale;
        const sourceX = (image.width - sourceWidth) / 2;
        const sourceY = (image.height - sourceHeight) / 2;

        let optimizedBlob: Blob | null = null;

        while (width >= 600 && height >= 315) {
            canvas.width = width;
            canvas.height = height;

            context.fillStyle = "#ffffff";
            context.fillRect(0, 0, width, height);

            context.drawImage(
                image,
                sourceX,
                sourceY,
                sourceWidth,
                sourceHeight,
                0,
                0,
                width,
                height
            );

            for (const quality of [0.85, 0.75, 0.65, 0.55, 0.45, 0.35]) {
                const blob = await new Promise<Blob | null>((resolve) => {
                    canvas.toBlob(resolve, "image/jpeg", quality);
                });

                if (!blob) {
                    throw new Error("No fue posible comprimir la portada.");
                }

                if (blob.size <= TARGET_SIZE) {
                    optimizedBlob = blob;
                    break;
                }
            }

            if (optimizedBlob) break;

            width = Math.round(width * 0.85);
            height = Math.round(height * 0.85);
        }

        if (!optimizedBlob) {
            throw new Error(
                "No fue posible reducir la portada a menos de 300 KB. Prueba con otra imagen."
            );
        }

        return new File(
            [optimizedBlob],
            "banner.jpg",
            {
                type: "image/jpeg",
                lastModified: Date.now(),
            }
        );
    } finally {
        URL.revokeObjectURL(imageUrl);
    }
}
