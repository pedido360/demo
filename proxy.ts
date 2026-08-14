import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {

    const pathname = request.nextUrl.pathname;

    // Solo necesitamos validar/refrescar la sesión
    // en las rutas protegidas del dashboard.
    if (pathname.startsWith("/dashboard")) {
        return await updateSession(request);
    }

    // Las páginas públicas no necesitan consultar
    // Supabase Auth antes de renderizarse.
    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};