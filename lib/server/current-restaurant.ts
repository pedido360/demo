import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function getCurrentRestaurantId(): Promise<string> {

    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data, error } = await supabase
        .from("profiles")
        .select("restaurant_id")
        .eq("id", user.id)
        .single();

    if (error) {
        throw new Error(error.message);
    }

    if (!data?.restaurant_id) {
        throw new Error(
            "El usuario no tiene un restaurante asociado."
        );
    }

    return data.restaurant_id;

}