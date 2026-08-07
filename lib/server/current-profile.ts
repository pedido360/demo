import { createClient } from "@/lib/supabase/server";

export async function getCurrentProfile() {

    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }

    const { data, error } = await supabase
        .from("profiles")
        .select("full_name,email")
        .eq("id", user.id)
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;

}