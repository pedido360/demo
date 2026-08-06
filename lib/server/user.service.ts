import { supabaseAdmin } from "@/lib/supabase/admin";

interface CreateRestaurantUserData {
    fullName: string;
    email: string;
    password: string;
    restaurantId: string;
}

export async function createRestaurantUser({
    fullName,
    email,
    password,
    restaurantId,
}: CreateRestaurantUserData) {

    // 1. Crear usuario en Auth
    const { data, error } =
        await supabaseAdmin.auth.admin.createUser({

            email,

            password,

            email_confirm: true,

            user_metadata: {
                full_name: fullName,
            },

        });

    if (error) {
        throw new Error(error.message);
    }

    const user = data.user;

    if (!user) {
        throw new Error(
            "No fue posible crear el usuario."
        );
    }

    // 2. Crear/Actualizar profile
    const { error: profileError } =
        await supabaseAdmin
            .from("profiles")
            .upsert({
                id: user.id,
                email,
                full_name: fullName,
                role: "restaurant_admin",
                restaurant_id: restaurantId,
            });

    if (profileError) {
        throw new Error(profileError.message);
    }

    return user;

}