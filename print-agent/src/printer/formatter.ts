import type {
  PrintJobPayload,
  PrintOrderItem,
  NormalProductItem,
  DailyMenuItem,
  PrintDestination,
} from "../types/print-job.js";

function money(value: number): string {
  return `$${value.toLocaleString("es-CO")}`;
}

function separator(): string {
  return "--------------------------------";
}

function formatDate(value?: string): string | null {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("es-CO", {
    timeZone: "America/Bogota",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function formatNormalItem(
  item: NormalProductItem,
  destination: PrintDestination,
): string[] {
  const lines = [`${item.quantity} x ${item.product.name}`];

  if (item.variant) lines.push(`  Variante: ${item.variant.label}`);

  for (const extra of item.extras) {
    lines.push(`  Adicional: ${extra.name}`);
  }

  if (item.notes?.trim()) lines.push(`  NOTA: ${item.notes.trim()}`);

  if (destination === "cashier") {
    lines.push(`  Vr. unitario: ${money(item.unitPrice)}`);
    lines.push(`  Vr. total: ${money(item.total)}`);
  }

  return lines;
}

function formatDailyMenu(
  item: DailyMenuItem,
  destination: PrintDestination,
): string[] {
  const menu = item.dailyMenu;
  const lines = [
    `${item.quantity} x ${item.product.name}`,
    `  Tamaño: ${menu.size.label}`,
  ];

  if (menu.soup) lines.push(`  Sopa: ${menu.soup.name}`);
  for (const seco of menu.secos) lines.push(`  Seco: ${seco.name}`);
  if (menu.principle) lines.push(`  Principio: ${menu.principle.name}`);
  if (menu.protein) lines.push(`  Proteína: ${menu.protein.name}`);
  if (menu.drink) lines.push(`  Bebida: ${menu.drink.name}`);
  if (menu.dessert) lines.push(`  Postre: ${menu.dessert.name}`);
  if (menu.notes?.trim()) lines.push(`  NOTA: ${menu.notes.trim()}`);

  if (destination === "cashier") {
    lines.push(`  Vr. unitario: ${money(item.unitPrice)}`);
    lines.push(`  Vr. total: ${money(item.total)}`);
  }

  return lines;
}

function formatItem(
  item: PrintOrderItem,
  destination: PrintDestination,
): string[] {
  return "dailyMenu" in item
    ? formatDailyMenu(item, destination)
    : formatNormalItem(item, destination);
}

export function formatTicket(
  payload: PrintJobPayload,
  destination: PrintDestination,
): string {
  const lines: string[] = [];
  const isKitchen = destination === "kitchen";

  lines.push("");
  lines.push("             PEDIDOS360");
  if (payload.restaurant_name) lines.push(payload.restaurant_name);
  if (payload.order_number != null) {
    lines.push(`ORDEN No. ${payload.order_number}`);
  }

  const date = formatDate(payload.order_created_at);
  if (date) lines.push(`Fecha: ${date}`);

  lines.push(separator());

  if (isKitchen) {
    lines.push("COMANDA PARA PREPARACION");
  } else {
    lines.push(payload.title);
    if (payload.copy_label) lines.push(payload.copy_label);
  }

  if (payload.order_type === "takeaway") {
    lines.push(payload.table_label?.trim() || "PARA LLEVAR");
  } else if (payload.table_label) {
    lines.push(`Mesa: ${payload.table_label}`);
  }

  if (payload.waiter_name) lines.push(`Mesero: ${payload.waiter_name}`);

  if (!isKitchen && payload.warning) {
    lines.push("");
    lines.push(`*** ${payload.warning} ***`);
  }

  lines.push(separator());

  for (const item of payload.items) {
    lines.push(...formatItem(item, destination));
    lines.push("");
  }

  lines.push(separator());

  if (!isKitchen) {
    if (payload.subtotal !== undefined) {
      lines.push(`Subtotal: ${money(payload.subtotal)}`);
    }
    if (payload.total !== undefined) {
      lines.push(`TOTAL: ${money(payload.total)}`);
    }
    if (payload.order_total !== undefined && payload.order_total !== payload.total) {
      lines.push(`Total del pedido: ${money(payload.order_total)}`);
    }
    if (payload.table_accumulated_total != null) {
      lines.push(`Acumulado de mesa: ${money(payload.table_accumulated_total)}`);
    }
  }

  if (payload.notes?.trim()) {
    lines.push("");
    lines.push("OBSERVACIONES:");
    lines.push(payload.notes.trim());
  }

  lines.push("");
  lines.push(separator());
  if (!isKitchen) lines.push("       Gracias por su pedido");
  lines.push("\n\n\n");

  return lines.join("\n");
}
