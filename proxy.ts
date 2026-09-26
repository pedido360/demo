import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {

    const pathname = request.nextUrl.pathname;
    const hostname = request.nextUrl.hostname;

    // Subdominios de restaurantes: reescritura interna
    // sin cambiar la URL visible del navegador.
    const baseDomain = "pedidos360.shop";
    const isProductionSubdomain =
        hostname.endsWith(`.${baseDomain}`);

    const isLocalSubdomain =
        hostname.endsWith(".localhost");

    if (isProductionSubdomain || isLocalSubdomain) {

        const slug = isProductionSubdomain
            ? hostname.slice(
                0,
                -(baseDomain.length + 1)
            )
            : hostname.slice(
                0,
                -".localhost".length
            );

        if (
            slug &&
            pathname !== "/dashboard" &&
            !pathname.startsWith("/dashboard/")
        ) {

            const url = request.nextUrl.clone();

            url.pathname =
                `/${slug}${pathname === "/" ? "" : pathname}`;

            return NextResponse.rewrite(url);
        }
    }

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