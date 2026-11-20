import { Pedidos360Client } from "./api/client.js";
import { loadSettings } from "./config/settings.js";
import {
  printText,
  listPrinters,
  extractRequestId,
  waitForCompletion,
  SubmissionUncertainError,
} from "./printer/index.js";
import { formatTicket } from "./printer/formatter.js";

const printSystem = process.platform === "win32" ? "Windows" : "CUPS";

const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const settings = await loadSettings();

  if (!settings) {
    throw new Error("No existe configuración del agente.");
  }

  const client = new Pedidos360Client(settings);
  let auth: Awaited<ReturnType<Pedidos360Client["authenticate"]>>;

  while (true) {
    try {
      const printers = await listPrinters();

      for (const name of [settings.kitchenPrinterName, settings.cashierPrinterName]) {
        if (!printers.some((printer) => printer.name === name)) {
          throw new Error(`Impresora no disponible: ${name}`);
        }
      }

      auth = await client.authenticate();
      break;
    } catch (error) {
      console.error(
        "Servidor o impresoras no disponibles. Nuevo intento en 10 segundos:",
        error
      );
      await wait(10000);
    }
  }

  console.log(`Agente conectado: ${auth.agent.name}`);
  console.log(`Impresora cocina: ${settings.kitchenPrinterName}`);
  console.log(`Impresora caja: ${settings.cashierPrinterName}`);

  while (true) {
    try {
      const printers = await listPrinters();

      for (const name of [settings.kitchenPrinterName, settings.cashierPrinterName]) {
        if (!printers.some((printer) => printer.name === name)) {
          throw new Error(`Impresora no disponible: ${name}. No se reclamarán trabajos.`);
        }
      }

      const jobs = await client.claimJobs();

      for (const job of jobs) {
        const printerName = job.destination === "kitchen"
          ? settings.kitchenPrinterName
          : settings.cashierPrinterName;

        let finalStatus: "printed" | "submitted" | "failed";
        let errorMessage: string | undefined;

        try {
          const ticket = formatTicket(job.payload, job.destination);
          const printOutput = await printText(printerName, ticket);
          const requestId = extractRequestId(printerName, printOutput);

          if (!requestId) {
            finalStatus = "submitted";
            errorMessage =
              `El sistema ${printSystem} recibió respuesta, pero no se pudo identificar el trabajo. IMPRESIÓN SIN CONFIRMAR.`;
            console.warn(errorMessage, job.job_id);
          } else {
            console.log(`Trabajo ${job.job_id} aceptado por ${printSystem}: ${requestId}`);

            try {
              const completed = await waitForCompletion(
                printerName,
                requestId,
                30000,
                1500
              );

              finalStatus = completed ? "printed" : "submitted";

              if (!completed) {
                errorMessage =
                  `${printSystem} no confirmó la finalización de ${requestId}. IMPRESIÓN SIN CONFIRMAR.`;
              }
            } catch (error) {
              finalStatus = "submitted";
              errorMessage =
                `No se pudo consultar el estado de ${printSystem}: ${
                  error instanceof Error ? error.message : "Error desconocido"
                }. IMPRESIÓN SIN CONFIRMAR.`;
            }
          }
        } catch (error) {
          if (error instanceof SubmissionUncertainError) {
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
