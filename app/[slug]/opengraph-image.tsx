import { ImageResponse } from "next/og";

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

    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#ffffff",
                    padding: "60px",
                    textAlign: "center",
                }}
            >
                {logo && (
                    <img
                        src={logo}
                        alt={restaurant.name}
                        width={180}
                        height={180}
                        style={{
                            objectFit: "cover",
                            borderRadius: "40px",
                            marginBottom: "30px",
                        }}
                    />
                )}

                <div
                    style={{
                        fontSize: "56px",
                        fontWeight: 800,
                        color: "#111827",
                        marginBottom: "18px",
                    }}
                >
                    {restaurant.name}
                </div>

                <div
                    style={{
                        fontSize: "28px",
                        color: "#6B7280",
                        maxWidth: "900px",
                    }}
                >
                    {restaurant.description ||
                        "Haz tu pedido en línea."}
                </div>

                <div
                    style={{
                        display: "flex",
                        marginTop: "40px",
                        fontSize: "24px",
                        fontWeight: 700,
                        color: "#DC2626",
                    }}
                >
                    Pedidos360
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
        }
    );
}