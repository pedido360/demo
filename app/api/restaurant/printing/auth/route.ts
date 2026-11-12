import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
    try {
        const authorization = request.headers.get("authorization");
        const match = authorization?.match(/^Bearer ([a-f0-9]{64})$/i);

        if (!match) {
            return NextResponse.json(
                { error: "Credencial de agente inválida." },
                { status: 401 }
            );
        }

        const tokenHash = createHash("sha256")
            .update(match[1])
            .digest("hex");

        const { data: agent, error } = await supabaseAdmin
            .from("print_agents")
            .select("id, restaurant_id, agent_name, is_active")
            .eq("token_hash", tokenHash)
            .eq("is_active", true)
            .maybeSingle();

        if (error) throw error;

        if (!agent) {
            return NextResponse.json(
                { error: "Agente inexistente o desactivado." },
                { status: 401 }
            );
        }

        const { error: updateError } = await supabaseAdmin
            .from("print_agents")
            .update({ last_seen_at: new Date().toISOString() })
            .eq("id", agent.id)
            .eq("is_active", true);

        if (updateError) throw updateError;

        return NextResponse.json({
            success: true,
            agent: {
                id: agent.id,
                restaurantId: agent.restaurant_id,
                name: agent.agent_name,
            },
        });
    } catch (error) {
        console.error("Printing agent authentication:", error);

        return NextResponse.json(
            { error: "No se pudo autenticar el agente." },
            { status: 500 }
        );
    }
}
