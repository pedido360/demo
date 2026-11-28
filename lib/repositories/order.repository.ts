import { supabase } from "@/lib/supabase";

export interface CreateOrderInput {
    restaurantId: string;

    customerName: string;

    deliveryMethod:
        | "Domicilio"
        | "Recoger";

    address: string;

    paymentMethod: "Efectivo" | "Transferencia";

    cashChange: string;

    observations: string;

    items: unknown[];

    subtotal: number;

    deliveryFee: number;

    total: number;
}

export async function createOrder(
    input: CreateOrderInput
) {
    if (
        input.paymentMethod !== "Efectivo" &&
        input.paymentMethod !== "Transferencia"
    ) {
        throw new Error("Método de pago no permitido.");
    }

    const { data, error } = await supabase
        .from("orders")
        .insert({
            restaurant_id: input.restaurantId,

            customer_name: input.customerName,

            delivery_method:
                input.deliveryMethod,

            address:
                input.deliveryMethod === "Domicilio"
                    ? input.address
                    : null,

            payment_method:
                input.paymentMethod,

            cash_change:
                input.cashChange || null,

            observations:
                input.observations || null,

            items:
                input.items,

            subtotal:
                input.subtotal,

            delivery_fee:
                input.deliveryFee,

            total:
                input.total,

            source: "whatsapp",

            status: "pending",
        })
        .select()
        .single();

    if (error) {
        console.error(
            "SUPABASE ERROR:",
            error
        );

        throw new Error(error.message);
    }

    return data;
}

export async function getPendingOrders(
    restaurantId: string
) {
    const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .eq("status", "pending")
        .eq("source", "whatsapp")
        .is("archived_at", null)
        .order("created_at", {
            ascending: false,
        });

    if (error) {
        console.error(
            "SUPABASE ERROR:",
            error
        );

        throw new Error(error.message);
    }

    return data ?? [];
}

export async function archiveOrder(
    orderId: string,
    restaurantId: string
) {
    const { data, error } = await supabase
        .from("orders")
        .update({
            archived_at: new Date().toISOString(),
        })
        .eq("id", orderId)
        .eq("restaurant_id", restaurantId)
        .eq("source", "whatsapp")
        .eq("status", "pending")
        .is("archived_at", null)
        .select("id")
        .single();

    if (error) {
        console.error("SUPABASE ERROR:", error);
        throw new Error(error.message);
    }

    return data;
}

export async function getConfirmedOrders(
    restaurantId: string
) {
    const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .eq("status", "confirmed")
        .eq("source", "whatsapp")
        .order("created_at", {
            ascending: false,
        });

    if (error) {
        console.error(
            "SUPABASE ERROR:",
            error
        );

        throw new Error(error.message);
    }

    return data ?? [];
}

export async function confirmOrder(orderId: string) {
    const { data, error } = await supabase
        .from("orders")
        .update({
            status: "confirmed",
        })
        .eq("id", orderId)
        .eq("status", "pending")
        .select()
        .single();

    if (error) {
        console.error(
            "SUPABASE ERROR:",
            error
        );

        throw new Error(error.message);
    }

    return data;
}
