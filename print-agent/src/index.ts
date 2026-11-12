import { Pedidos360Client } from "./api/client.js";
import { loadSettings } from "./config/settings.js";
import {
  printText,
  listPrinters,
  extractCupsRequestId,
  waitForCupsCompletion,
  CupsSubmissionUncertainError,
} from "./printer/cups.js";
import { formatTicket } from "./printer/formatter.js";

const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const settings = await loadSettings();

  if (!settings) {
    throw new Error("No existe configuración del agente.");
  }

  const printers = await listPrinters();

  for (const name of [settings.kitchenPrinterName, settings.cashierPrinterName]) {
    if (!printers.some((printer) => printer.name === name)) {
      throw new Error(`Impresora no disponible: ${name}`);
    }
  }

  const client = new Pedidos360Client(settings);
  const auth = await client.authenticate();

  console.log(`Agente conectado: ${auth.agent.name}`);
  console.log(`Impresora cocina: ${settings.kitchenPrinterName}`);
  console.log(`Impresora caja: ${settings.cashierPrinterName}`);

  while (true) {
    try {
      const jobs = await client.claimJobs();

      for (const job of jobs) {
        const printerName = job.destination === "kitchen"
          ? settings.kitchenPrinterName
          : settings.cashierPrinterName;

        let finalStatus: "printed" | "submitted" | "failed";
        let errorMessage: string | undefined;

        try {
          const ticket = formatTicket(job.payload, job.destination);
          const lpOutput = await printText(printerName, ticket);
          const requestId = extractCupsRequestId(printerName, lpOutput);

          if (!requestId) {
            finalStatus = "submitted";
            errorMessage =
              "CUPS recibió respuesta de lp, pero no se pudo identificar el trabajo. IMPRESIÓN SIN CONFIRMAR.";
            console.warn(errorMessage, job.job_id);
          } else {
            console.log(`Trabajo ${job.job_id} aceptado por CUPS: ${requestId}`);

            try {
              const completed = await waitForCupsCompletion(
                printerName,
                requestId,
                120000,
                1500
              );

              finalStatus = completed ? "printed" : "submitted";

              if (!completed) {
                errorMessage =
                  `CUPS no confirmó la finalización de ${requestId}. IMPRESIÓN SIN CONFIRMAR.`;
              }
            } catch (error) {
              finalStatus = "submitted";
              errorMessage =
                `No se pudo consultar el estado de CUPS: ${
                  error instanceof Error ? error.message : "Error desconocido"
                }. IMPRESIÓN SIN CONFIRMAR.`;
            }
          }
        } catch (error) {
          if (error instanceof CupsSubmissionUncertainError) {
            finalStatus = "submitted";
            errorMessage = `${error.message} IMPRESIÓN SIN CONFIRMAR.`;
          } else {
            finalStatus = "failed";
            errorMessage =
              error instanceof Error ? error.message : "Error de impresión";
          }
        }

        try {
          await client.acknowledge(job, finalStatus, errorMessage);
          console.log(`Trabajo ${job.job_id}: estado informado ${finalStatus}`);
        } catch (error) {
          console.error(
            `No se pudo informar el estado ${finalStatus} del trabajo ${job.job_id}. No se reenviará automáticamente:`,
            error
          );
        }
      }
    } catch (error) {
      console.error("Error consultando la cola:", error);
    }

    await wait(3000);
  }
}

main().catch((error) => {
  console.error("No se pudo iniciar Pedidos360 Print Agent:", error);
  process.exitCode = 1;
});
