import { NextResponse } from "next/server";

// El acceso de todos los roles se realiza por /login con correo y contraseña.
export async function POST() {
    return NextResponse.json(
        {
            success: false,
            message: "El acceso se realiza desde /login con correo electrónico y contraseña.",
        },
        { status: 410 }
    );
}
