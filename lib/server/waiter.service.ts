import "server-only";

import { supabaseAdmin } from "@/lib/supabase/admin";

interface CreateWaiterData {
    fullName: string;
    email: string;
    username: string;
    password: string;
    restaurantId: string;
    createdByProfileId: string;
}

export async function createWaiter({
    fullName,
    email,
    username,
    password,
    restaurantId,
    createdByProfileId,
}: CreateWaiterData) {
    const normalizedUsername = username.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = fullName.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        throw new Error("Ingresa un correo electrónico válido.");
    }

    if (!/^[a-z0-9][a-z0-9._-]{2,31}$/.test(normalizedUsername)) {
        throw new Error("El usuario debe tener entre 3 y 32 caracteres válidos.");
    }

    if (password.length < 8) {
        throw new Error("La contraseña debe tener al menos 8 caracteres.");
    }

    if (!normalizedName || !restaurantId || !createdByProfileId) {
        throw new Error("Faltan datos obligatorios del mesero.");
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: normalizedEmail,
        password,
        email_confirm: true,
        user_metadata: {
            full_name: normalizedName,
            username: normalizedUsername,
            account_type: "waiter",
        },
    });

    if (error) {
        throw new Error(error.message);
    }

    const user = data.user;

    if (!user) {
        throw new Error("No fue posible crear la identidad del mesero.");
    }

    // Crear el perfil integrado con la autenticación de Pedidos360.
    const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .insert({
            id: user.id,
            email: normalizedEmail,
            full_name: normalizedName,
            role: "waiter",
            restaurant_id: restaurantId,
        });

    if (profileError) {
        const { error: rollbackError } =
            await supabaseAdmin.auth.admin.deleteUser(user.id);

        if (rollbackError) {
            console.error("Error revirtiendo identidad del mesero:", rollbackError.message);
        }

        throw new Error(profileError.message);
    }

    // Crear su cuenta operativa y asignarla exclusivamente al restaurante.
    const { error: waiterError } = await supabaseAdmin
        .from("waiter_accounts")
        .insert({
            profile_id: user.id,
            restaurant_id: restaurantId,
            username: normalizedUsername,
            status: "active",
            created_by_profile_id: createdByProfileId,
        });

    if (waiterError) {
        const { error: profileRollbackError } = await supabaseAdmin
            .from("profiles")
            .delete()
            .eq("id", user.id);

        if (profileRollbackError) {
            console.error("Error revirtiendo perfil del mesero:", profileRollbackError.message);
        }

        const { error: authRollbackError } =
            await supabaseAdmin.auth.admin.deleteUser(user.id);

        if (authRollbackError) {
            console.error("Error revirtiendo identidad del mesero:", authRollbackError.message);
        }

        throw new Error(waiterError.message);
    }

    return {
        id: user.id,
        fullName: normalizedName,
        username: normalizedUsername,
        restaurantId,
        status: "active",
    };
}
