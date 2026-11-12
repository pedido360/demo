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

        const { data: agent, error: agentError } = await supabaseAdmin
            .from("print_agents")
            .select("id")
            .eq("token_hash", tokenHash)
            .eq("is_active", true)
            .maybeSingle();

        if (agentError) throw agentError;

        if (!agent) {
            return NextResponse.json(
                { error: "Agente inexistente o desactivado." },
                { status: 401 }
            );
        }

        const { data: jobs, error: claimError } = await supabaseAdmin.rpc(
            "claim_print_jobs",
            {
                p_agent_id: agent.id,
                p_limit: 1,
                p_lease_seconds: 180,
            }
        );

        if (claimError) throw claimError;

        const { error: updateError } = await supabaseAdmin
            .from("print_agents")
            .update({ last_seen_at: new Date().toISOString() })
            .eq("id", agent.id)
            .eq("is_active", true);

        if (updateError) throw updateError;

        return NextResponse.json({
            success: true,
            jobs: jobs ?? [],
        });
    } catch (error) {
        console.error("Printing job claim:", error);

        return NextResponse.json(
            { error: "No se pudieron consultar los trabajos de impresión." },
            { status: 500 }
        );
    }
}
