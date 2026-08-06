import { NextRequest, NextResponse } from "next/server";

import { createRestaurantUser } from "@/lib/server/user.service";

export async function POST(
    request: NextRequest
) {

    try {

        const body = await request.json();

        const user =
            await createRestaurantUser(body);

        return NextResponse.json({
            success: true,
            user,
        });

    } catch (error) {

        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : "Error desconocido",
            },
            {
                status: 500,
            }
        );

    }

}