import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");
    const token = authorization?.startsWith("Bearer ")
      ? authorization.slice(7).trim()
      : "";

    if (!/^[a-f0-9]{64}$/i.test(token)) {
      return NextResponse.json(
        { error: "Credencial inválida." },
        { status: 401 }
      );
    }

    const tokenHash = createHash("sha256").update(token).digest("hex");

    const { data: agent, error: agentError } = await supabaseAdmin
      .from("print_agents")
      .select("id")
      .eq("token_hash", tokenHash)
      .eq("is_active", true)
      .maybeSingle();

    if (agentError || !agent) {
      return NextResponse.json(
        { error: "Agente no autorizado." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const jobId = typeof body.jobId === "string" ? body.jobId : "";
    const claimToken =
      typeof body.claimToken === "string" ? body.claimToken : "";
    const result = body.result;
    const errorMessage =
      typeof body.error === "string" ? body.error.slice(0, 1000) : null;

    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(jobId) ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(claimToken) ||
      !["submitted", "printed", "failed"].includes(result)
    ) {
      return NextResponse.json(
        { error: "Datos de confirmación inválidos." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin.rpc(
      "acknowledge_print_job",
      {
        p_job_id: jobId,
        p_agent_id: agent.id,
        p_claim_token: claimToken,
        p_result: result,
        p_error: ["failed", "submitted"].includes(result) ? errorMessage : null,
      }
    );

    if (error) {
      console.error("Error confirmando impresión:", error.message);
      return NextResponse.json(
        { error: "No se pudo confirmar el trabajo de impresión." },
        { status: 500 }
      );
    }

    await supabaseAdmin
      .from("print_agents")
      .update({ last_seen_at: new Date().toISOString() })
      .eq("id", agent.id);

    return NextResponse.json({ success: true, result: data });
  } catch (error) {
    console.error("Error en confirmación de impresión:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
