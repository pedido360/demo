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

    lines.push("🍔 *NUEVO PEDIDO*");
    lines.push("");
    lines.push(`🏪 *${restaurant.name}*`);
    lines.push("");

    lines.push("━━━━━━━━━━━━━━━━━━━━");
    lines.push("👤 *DATOS DEL CLIENTE*");
    lines.push("━━━━━━━━━━━━━━━━━━━━");
    lines.push("");

    lines.push(`Nombre: ${order.customerName}`);
    lines.push(`Dirección: ${order.address}`);
    lines.push(`Pago: ${order.paymentMethod}`);

    if (
        order.paymentMethod === "Efectivo" &&
        order.cashChange.trim()
    ) {

        lines.push(
            `Cambio para: ${order.cashChange}`
        );

    }

    if (order.observations.trim()) {

        lines.push(
            `Observaciones: ${order.observations}`
        );

    }

    lines.push("");
    lines.push("━━━━━━━━━━━━━━━━━━━━");
    lines.push("🛒 *DETALLE DEL PEDIDO*");
    lines.push("━━━━━━━━━━━━━━━━━━━━");
    lines.push("");

    items.forEach((item, index) => {

        lines.push(
            `${index + 1}. ${item.product.name}`
        );

        lines.push(
            `Cantidad: ${item.quantity}`
        );

        if (item.notes?.trim()) {

            lines.push(
                `Notas: ${item.notes}`
            );

        }

        lines.push(
            `Subtotal: $${(
                item.product.price *
                item.quantity
            ).toLocaleString("es-CO")}`
        );

        lines.push("");

    });

    lines.push("━━━━━━━━━━━━━━━━━━━━");

    lines.push("");

    lines.push(
        `💰 *TOTAL: $${totalPrice.toLocaleString("es-CO")}*`
    );

    lines.push("");

    lines.push("━━━━━━━━━━━━━━━━━━━━");

    lines.push("");

    lines.push("✅ ¡Gracias!");

    lines.push("Quedo atent@ a la confirmación de mi pedido. 🙌");
    return lines.join("\n");

}