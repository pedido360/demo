import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value;
                },

                set(name: string, value: string, options) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    });

                    response = NextResponse.next({
                        request,
                    });

                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                },

                remove(name: string, options) {
                    request.cookies.set({
                        name,
                        value: "",
                        ...options,
                    });

                    response = NextResponse.next({
                        request,
                    });

                    response.cookies.set({
                        name,
                        value: "",
                        ...options,
                    });
                },
            },
        }
    );

    console.time("P360 - auth.getUser");

    await supabase.auth.getUser();

    console.timeEnd("P360 - auth.getUser");

    return response;
}