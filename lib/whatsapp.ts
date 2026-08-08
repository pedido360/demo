import { ProductSelection } from "@/types/product";
import { restaurant } from "@/data/restaurant";

interface OrderInfo {
    customerName: string;
    address: string;
    paymentMethod: string;
    cashChange: string;
    observations: string;
}

export function buildWhatsAppMessage(
    items: ProductSelection[],
    totalPrice: number,
    order: OrderInfo
) {

    const lines: string[] = [];

    const now = new Date();

    const date = now.toLocaleDateString("es-CO");

    const time = now.toLocaleTimeString("es-CO", {
        hour: "2-digit",
        minute: "2-digit",
    });

    lines.push("🛎️ *NUEVO PEDIDO*");
    lines.push(`🕒 ${date} • ${time}`);
    lines.push("");

    lines.push(`🏪 *${restaurant.name}*`);
    lines.push("");

    lines.push("━━━━━━━━━━━━━━━━━━━━");
    lines.push("👤 *DATOS DEL CLIENTE*");
    lines.push("━━━━━━━━━━━━━━━━━━━━");
    lines.push("");

    lines.push(`👤 Nombre: ${order.customerName}`);
    lines.push(`📍 Dirección: ${order.address}`);
    lines.push(`💳 Pago: ${order.paymentMethod}`);

    if (
        order.paymentMethod === "Efectivo" &&
        order.cashChange.trim()
    ) {

        lines.push(
            `💵 Cambio para: ${order.cashChange}`
        );

    }

    if (order.observations.trim()) {

        lines.push("");

        lines.push("📝 Observaciones generales:");

        lines.push(order.observations);

    }

    lines.push("");
    lines.push("━━━━━━━━━━━━━━━━━━━━");
    lines.push("🛒 *DETALLE DEL PEDIDO*");
    lines.push("━━━━━━━━━━━━━━━━━━━━");
    lines.push("");

    items.forEach((item, index) => {

        const extrasTotal =
            (item.extras ?? []).reduce(
                (total, extra) => total + extra.price,
                0
            );

        const productPrice =
            item.variant?.price ??
            item.product.price;

        const subtotal =
            (productPrice + extrasTotal) *
            item.quantity;

        lines.push(
            `${index + 1}. 🍽️ *${item.product.name}*`
        );

        lines.push(
            `Cantidad: ${item.quantity}`
        );

        if (item.variant) {

            lines.push(
                `📏 Presentación: ${item.variant.label}`
            );

        }

        if ((item.extras ?? []).length > 0) {

            lines.push("");

            lines.push("➕ Extras:");

            item.extras.forEach(extra => {

                lines.push(
                    `   ✓ ${extra.name}`
                );

            });

        }

        if (item.notes?.trim()) {

            lines.push("");

            lines.push("📝 Observaciones:");

            lines.push(item.notes);

        }

        lines.push("");

        lines.push(
            `Subtotal: $${subtotal.toLocaleString("es-CO")}`
        );

        lines.push("");
        lines.push("────────────────────");
        lines.push("");

    });

    lines.push("💰 *TOTAL PRODUCTOS*");
    lines.push(
        `$${totalPrice.toLocaleString("es-CO")}`
    );

    lines.push("");
    lines.push("━━━━━━━━━━━━━━━━━━━━");
    lines.push("");

    lines.push("🙏 Muchas gracias.");
    lines.push("");
    lines.push(
        "Quedo atento a la confirmación del valor del domicilio y al despacho de mi pedido."
    );

    return lines.join("\n");

}