import OpenAI from "openai";

export async function POST(request: Request) {
    try {
        const apiKey =
            process.env.OPENAI_API_KEY;

        if (!apiKey) {
            return Response.json(
                {
                    error:
                        "La API de OpenAI no está configurada.",
                },
                {
                    status: 500,
                }
            );
        }

        const openai = new OpenAI({
            apiKey,
        });

        const formData =
            await request.formData();

        const file =
            formData.get("file");

        if (!(file instanceof File)) {
            return Response.json(
                {
                    error:
                        "No se recibió ninguna imagen.",
                },
                {
                    status: 400,
                }
            );
        }

        if (!file.type.startsWith("image/")) {
            return Response.json(
                {
                    error:
                        "El archivo debe ser una imagen.",
                },
                {
                    status: 400,
                }
            );
        }

        const arrayBuffer =
            await file.arrayBuffer();

        const base64 =
            Buffer
                .from(arrayBuffer)
                .toString("base64");

        const imageDataUrl =
            `data:${file.type};base64,${base64}`;

        const response =
            await openai.responses.create({
                model: "gpt-5.6-luna",

                input: [
                    {
                        role: "user",

                        content: [
                            {
                                type: "input_text",

                                text: `
Transcribe literalmente TODO el texto visible en esta imagen.

REGLAS OBLIGATORIAS:

- No inventes información.
- No completes palabras que no puedas leer.
- No corrijas errores del menú.
- No elimines información.
- No resumas.
- No interpretes el contenido.
- No conviertas el contenido en productos.
- No conviertas variantes en productos separados.
- Conserva nombres, descripciones, cantidades, números y precios.
- Respeta, en lo posible, el orden visual en el que aparece el texto.
- Mantén los encabezados y títulos.
- Si una parte realmente no puede leerse, escribe [ILEGIBLE].
- Devuelve únicamente el texto transcrito.
- No agregues explicaciones antes ni después.
                                `.trim(),
                            },

                            {
                                type: "input_image",
                                image_url:
                                    imageDataUrl,
                                detail: "high",
                            },
                        ],
                    },
                ],
            });

        return Response.json({
            text:
                response.output_text,
        });
    } catch (error) {
        console.error(
            "Error procesando menú:",
            error
        );

        return Response.json(
            {
                error:
                    "No fue posible procesar el menú.",
            },
            {
                status: 500,
            }
        );
    }
}