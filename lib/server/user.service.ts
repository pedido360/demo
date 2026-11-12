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
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
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
        throw new Error("No fue posible crear el usuario.");
    }

    const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .upsert({
            id: user.id,
            email,
            full_name: fullName,
            role: "restaurant_admin",
            restaurant_id: restaurantId,
        });

    if (profileError) {
        // Evitar dejar una cuenta de Auth sin su perfil correspondiente.
        const { error: rollbackError } =
            await supabaseAdmin.auth.admin.deleteUser(user.id);

        if (rollbackError) {
            console.error(
                "No se pudo revertir la cuenta de Auth tras fallar el perfil:",
                rollbackError.message
            );
        }

        throw new Error(profileError.message);
    }

    return user;
}
