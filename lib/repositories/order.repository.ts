import { supabase } from "@/lib/supabase";

export interface CreateOrderInput {
    restaurantId: string;

    customerName: string;

    deliveryMethod:
        | "Domicilio"
        | "Recoger";

    address: string;

    paymentMethod: string;

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

export async function getConfirmedOrders(
    restaurantId: string
) {
    const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .eq("status", "confirmed")
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
