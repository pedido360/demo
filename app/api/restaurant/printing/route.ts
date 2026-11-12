import { randomBytes, createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: "Debes iniciar sesión." },
                { status: 401 }
            );
        }

        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("id, role, restaurant_id")
            .eq("id", user.id)
            .maybeSingle();

        if (profileError) throw profileError;

        if (
            !profile ||
            profile.role !== "restaurant_admin" ||
            !profile.restaurant_id
        ) {
            return NextResponse.json(
                { error: "No tienes permisos para configurar la impresión." },
                { status: 403 }
            );
        }

        const body: unknown = await request.json().catch(() => null);

        if (
            !body ||
            typeof body !== "object" ||
            !("agentName" in body) ||
            typeof body.agentName !== "string"
        ) {
            return NextResponse.json(
                { error: "Indica un nombre válido para el agente." },
                { status: 400 }
            );
        }

        const agentName = body.agentName.trim();

        if (
            agentName.length < 2 ||
            agentName.length > 80
        ) {
            return NextResponse.json(
                { error: "El nombre debe tener entre 2 y 80 caracteres." },
                { status: 400 }
            );
        }

        const secret = randomBytes(32).toString("hex");
        const tokenHash = createHash("sha256")
            .update(secret)
            .digest("hex");

        const { data: agent, error: insertError } = await supabaseAdmin
            .from("print_agents")
            .insert({
                restaurant_id: profile.restaurant_id,
                agent_name: agentName,
                token_hash: tokenHash,
            })
            .select("id, agent_name, is_active, created_at")
            .single();

        if (insertError) {
            if (insertError.code === "23505") {
                return NextResponse.json(
                    { error: "Ya existe un agente con ese nombre en este restaurante." },
                    { status: 409 }
                );
            }

            throw insertError;
        }

        return NextResponse.json(
            {
                success: true,
                agent,
                secret,
                warning: "Guarda esta credencial ahora. No volverá a mostrarse.",
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Printing agent registration:", error);

        return NextResponse.json(
            { error: "No se pudo registrar el agente de impresión." },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
        }

        const { data: profile } = await supabase
            .from("profiles")
            .select("role, restaurant_id")
            .eq("id", user.id)
            .maybeSingle();

        if (profile?.role !== "restaurant_admin" || !profile.restaurant_id) {
            return NextResponse.json({ error: "Sin permisos." }, { status: 403 });
        }

        const { data, error } = await supabaseAdmin
            .from("print_agents")
            .select("id, agent_name, is_active, last_seen_at, created_at")
            .eq("restaurant_id", profile.restaurant_id)
            .order("created_at", { ascending: false });

        if (error) throw error;

        return NextResponse.json({ agents: data ?? [] });
    } catch (error) {
        console.error("Printing agents list:", error);
        return NextResponse.json({ error: "No se pudieron consultar los agentes." }, { status: 500 });
    }
}
