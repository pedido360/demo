import { createClient } from "@/lib/supabase/server";

export interface CurrentProfile {
    id: string;
    email: string;
    full_name: string | null;
    role: string;
    restaurant_id: string | null;
}

export async function getCurrentProfile(): Promise<CurrentProfile | null> {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }

    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    if (error || !data) {
        return null;
    }

    return {
        id: data.id,
        email: data.email,
        full_name: data.full_name,
        role: data.role,
        restaurant_id: data.restaurant_id,
    };
}