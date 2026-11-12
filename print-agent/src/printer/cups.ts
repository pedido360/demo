import { spawn } from "node:child_process";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);


export class CupsSubmissionUncertainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CupsSubmissionUncertainError";
  }
}

export interface CupsPrinterInfo {
  name: string;
  isDefault: boolean;
  status: string;
}

export async function listPrinters(): Promise<CupsPrinterInfo[]> {
  const { stdout } = await execFileAsync("lpstat", ["-p", "-d"]);

  const printers: CupsPrinterInfo[] = [];
  const defaultMatch = stdout.match(/system default destination:\s*(\S+)/i);
  const defaultPrinter = defaultMatch?.[1] ?? null;

  for (const line of stdout.split("\n")) {
    const match = line.match(/^printer\s+(\S+)\s+(.+)$/);

    const name = match?.[1];
    const status = match?.[2];

    if (!name || !status) continue;

    printers.push({
      name,
      isDefault: name === defaultPrinter,
      status: status.trim(),
    });
  }

  return printers;
}

export async function printText(
  printerName: string,
  content: string
): Promise<string> {
  if (!printerName.trim()) {
    throw new Error("No hay una impresora seleccionada.");
  }

  return new Promise((resolve, reject) => {
    const process = spawn(
      "lp",
      ["-d", printerName, "-"],
      { stdio: ["pipe", "pipe", "pipe"] }
    );

    let stdout = "";
    let stderr = "";

    const timeout = setTimeout(() => {
      process.kill();
      reject(new CupsSubmissionUncertainError("Tiempo de espera agotado; CUPS pudo haber recibido el trabajo."));
    }, 20000);

    process.stdout.setEncoding("utf8");
    process.stderr.setEncoding("utf8");

    process.stdout.on("data", (chunk: string) => {
      stdout += chunk;
    });

    process.stderr.on("data", (chunk: string) => {
      stderr += chunk;
    });

    process.on("error", (error) => {
      clearTimeout(timeout);
      reject(new CupsSubmissionUncertainError(`No se pudo confirmar la respuesta de lp: ${error.message}`));
    });

    process.on("close", (code) => {
      clearTimeout(timeout);

      if (code !== 0) {
        reject(new Error(stderr || "CUPS no pudo imprimir el trabajo."));
        return;
      }

      resolve(stdout.trim());
    });

    process.stdin.on("error", (error) => {
      clearTimeout(timeout);
      reject(new CupsSubmissionUncertainError(`No se pudo confirmar el envío a CUPS: ${error.message}`));
    });

    process.stdin.end(content, "utf8");
  });
}

/**
 * Espera a que CUPS registre como completado el trabajo exacto.
 * No confirma la salida física del papel.
 */
export async function waitForCupsCompletion(
  printerName: string,
  requestId: string,
  timeoutMs = 120000,
  pollIntervalMs = 1500
): Promise<boolean> {
  if (!printerName.trim() || !requestId.trim()) {
    throw new Error("Impresora o identificador CUPS inválido.");
  }

  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const { stdout } = await execFileAsync(
      "lpstat",
      ["-W", "completed", "-o", printerName],
      { timeout: 10000 }
    );

    const completed = stdout
      .split("\n")
      .some((line) => line.trim().split(/\s+/)[0] === requestId);

    if (completed) return true;

    await new Promise((resolve) =>
      setTimeout(resolve, Math.min(pollIntervalMs, Math.max(0, deadline - Date.now())))
    );
  }

  return false;
}

/**
 * Extrae el identificador devuelto por lp y valida su impresora.
 */
export function extractCupsRequestId(
  printerName: string,
  lpOutput: string
): string | null {
  const match = lpOutput.match(/request id is\s+(\S+)/i);
  const capturedId = match?.[1];
  if (!capturedId) return null;

  const requestId = capturedId.replace(/[.,;]+$/, "");
  const prefix = `${printerName}-`;

  if (!requestId.startsWith(prefix)) return null;

  const sequence = requestId.slice(prefix.length);
  return /^\d+$/.test(sequence) ? requestId : null;
}
