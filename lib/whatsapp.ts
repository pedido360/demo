import { ProductSelection } from "@/types/product";
import { restaurant } from "@/data/restaurant";

export function buildWhatsAppMessage(
    items: ProductSelection[],
    totalPrice: number
) {

    const lines: string[] = [];

    lines.push("🍔 *NUEVO PEDIDO*");
    lines.push(`📍 *${restaurant.name}*`);
    lines.push("");

    lines.push("Hola 👋");
    lines.push("Quiero realizar el siguiente pedido:");
    lines.push("");

    lines.push("━━━━━━━━━━━━━━━━━━━━");

    items.forEach((item, index) => {

        lines.push(`🍽️ *${index + 1}. ${item.product.name}*`);

        lines.push(`   Cantidad: ${item.quantity}`);

        if (item.notes.trim()) {
            lines.push(`   📝 ${item.notes}`);
        }

        lines.push(
            `   💲 $${(
                item.product.price * item.quantity
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
    lines.push("Gracias. Quedo atento a la confirmación del pedido. 🙌");

    return lines.join("\n");
}
