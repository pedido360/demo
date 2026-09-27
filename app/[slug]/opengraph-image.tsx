import { ImageResponse } from "next/og";
import sharp from "sharp";

import {
    getRestaurantBySlug,
} from "@/lib/repositories/restaurant.repository";

export const runtime = "nodejs";

export const alt = "Pedidos360";

export const size = {
    width: 1200,
    height: 630,
};

export const contentType = "image/png";

interface OpenGraphImageProps {
    params: Promise<{
        slug: string;
    }>;
}

export default async function OpenGraphImage({
    params,
}: OpenGraphImageProps) {

    const { slug } = await params;

    const restaurant =
        await getRestaurantBySlug(slug);

    const logo =
        restaurant.logo?.trim()
            ? restaurant.logo
            : null;

    const banner =
        restaurant.banner?.trim()
            ? restaurant.banner
            : null;

    async function imageToDataUri(
        imageUrl: string | null,
        width?: number,
        height?: number
    ): Promise<string | null> {
        if (!imageUrl) {
            return null;
        }

        try {
            const response = await fetch(imageUrl);

            if (!response.ok) {
                return null;
            }

            const sourceBuffer = Buffer.from(
                await response.arrayBuffer()
            );

            let image = sharp(sourceBuffer);

            if (width && height) {
                image = image.resize(
                    width,
                    height,
                    {
                        fit: "cover",
                        position: "centre",
                    }
                );
            }

            const pngBuffer = await image
                .png({
                    compressionLevel: 9,
                    palette: true,
                })
                .toBuffer();

            return (
                "data:image/png;base64," +
                pngBuffer.toString("base64")
            );
        } catch (error) {
            console.error(
                "Error convirtiendo imagen para Open Graph:",
                error
            );

            return null;
        }
    }

    const [
        logoDataUri,
        bannerDataUri,
    ] = await Promise.all([
        imageToDataUri(logo),
        imageToDataUri(
            banner,
            1200,
            630
        ),
    ]);

    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    position: "relative",
                    overflow: "hidden",
                    backgroundColor: "#111827",
                }}
            >
                {banner && (
                    <img
                        src={bannerDataUri || banner}
                        alt=""
                        width={1200}
                        height={630}
                        style={{
                            position: "absolute",
                            inset: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                        }}
                    />
                )}

                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(0, 0, 0, 0.80)",
                    }}
                />

                <div
                    style={{
                        position: "relative",
                        zIndex: 2,
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "55px",
                        textAlign: "center",
                    }}
                >
                    {logo && (
                        <img
                            src={logoDataUri || logo}
                            alt={restaurant.name}
                            width={190}
                            height={190}
                            style={{
                                objectFit: "contain",
                                borderRadius: "30px",
                                marginBottom: "28px",
                            }}
                        />
                    )}

                    <div
                        style={{
                            fontSize: "58px",
                            fontWeight: 800,
                            color: "#ffffff",
                            lineHeight: 1.1,
                            maxWidth: "1050px",
                            marginBottom: "18px",
                        }}
                    >
                        {restaurant.name}
                    </div>

                    <div
                        style={{
                            fontSize: "28px",
                            color: "#ffffff",
                            maxWidth: "900px",
                            lineHeight: 1.25,
                        }}
                    >
                        {restaurant.description ||
                            "Haz tu pedido en línea."}
                    </div>

                    <div
                        style={{
                            display: "flex",
                            marginTop: "38px",
                            padding: "12px 28px",
                            borderRadius: "999px",
                            backgroundColor: "#DC2626",
                            color: "#ffffff",
                            fontSize: "24px",
                            fontWeight: 800,
                        }}
                    >
                        Pide ahora · Pedidos360
                    </div>
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
        }
    );
}