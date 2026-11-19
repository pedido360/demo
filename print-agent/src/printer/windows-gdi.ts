import { randomUUID } from "node:crypto";
import { CupsSubmissionUncertainError } from "./cups.js";
import { spawn } from "node:child_process";

export class WindowsSubmissionUncertainError extends CupsSubmissionUncertainError {
  constructor(message: string) {
    super(message);
    this.name = "WindowsSubmissionUncertainError";
  }
}

export interface WindowsPrinterInfo {
  name: string;
  isDefault: boolean;
  status: string;
  driverName: string;
  portName: string;
}

const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

function psQuote(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

async function runPowerShell(
  script: string,
  timeoutMs = 20000
): Promise<string> {
  const encoded = Buffer.from(script, "utf16le").toString("base64");

  return new Promise((resolve, reject) => {
    const child = spawn(
      "powershell.exe",
      [
        "-NoLogo",
        "-NoProfile",
        "-NonInteractive",
        "-ExecutionPolicy",
        "Bypass",
        "-EncodedCommand",
        encoded,
      ],
      { windowsHide: true, stdio: ["ignore", "pipe", "pipe"] }
    );

    let stdout = "";
    let stderr = "";

    const timeout = setTimeout(() => {
      child.kill();
      reject(new WindowsSubmissionUncertainError(
        "Windows no respondió a tiempo. El trabajo pudo haber sido enviado."
      ));
    }, timeoutMs);

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");

    child.stdout.on("data", (chunk: string) => { stdout += chunk; });
    child.stderr.on("data", (chunk: string) => { stderr += chunk; });

    child.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });

    child.on("close", (code) => {
      clearTimeout(timeout);
      if (code !== 0) {
        reject(new Error(stderr.trim() || "Error de impresión de Windows."));
        return;
      }
      resolve(stdout.trim());
    });
  });
}

export async function listPrinters(): Promise<WindowsPrinterInfo[]> {
  const script = `
$ErrorActionPreference = 'Stop'
$printers = @(Get-Printer | Select-Object Name, DriverName, PortName, PrinterStatus)
$printers | ConvertTo-Json -Compress
`;

  const output = await runPowerShell(script);
  if (!output) return [];

  const parsed = JSON.parse(output) as
    | Array<Record<string, unknown>>
    | Record<string, unknown>;

  const entries = Array.isArray(parsed) ? parsed : [parsed];

  return entries.map((printer) => ({
    name: String(printer.Name ?? ""),
    isDefault: false,
    status: String(printer.PrinterStatus ?? "Unknown"),
    driverName: String(printer.DriverName ?? ""),
    portName: String(printer.PortName ?? ""),
  })).filter((printer) => printer.name.length > 0);
}

export async function printText(
  printerName: string,
  content: string
): Promise<string> {
  if (!printerName.trim()) {
    throw new Error("No hay una impresora seleccionada.");
  }

  const documentName = `Pedidos360-${randomUUID()}`;

  const script = `
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Windows.Forms

$printer = ${psQuote(printerName)}
$documentName = ${psQuote(documentName)}
$content = ${psQuote(content)}

$source = @'
using System;
using System.Drawing;
using System.Drawing.Printing;

public static class Pedidos360GdiPrinter {
    public static void Print(string printer, string document, string content) {
        using (PrintDocument doc = new PrintDocument()) {
            doc.PrinterSettings.PrinterName = printer;
            doc.DocumentName = document;

            if (!doc.PrinterSettings.IsValid)
                throw new InvalidOperationException(
                    "La impresora seleccionada no está disponible."
                );

            doc.DefaultPageSettings.Margins = new Margins(5, 5, 5, 5);

            using (Font font = new Font("Consolas", 9))
            using (StringFormat format =
                new StringFormat(StringFormat.GenericTypographic)) {

                string remaining = content;

                doc.PrintPage += (sender, e) => {
                    RectangleF bounds = e.MarginBounds;
                    int fitted = 0;
                    int lines = 0;

                    e.Graphics.MeasureString(
                        remaining,
                        font,
                        (int)bounds.Width,
                        format,
                        out fitted,
                        out lines
                    );

                    if (fitted <= 0 && remaining.Length > 0)
                        fitted = 1;

                    string pageText = remaining.Substring(0, fitted);

                    e.Graphics.DrawString(
                        pageText,
                        font,
                        Brushes.Black,
                        bounds,
                        format
                    );

                    remaining = remaining.Substring(fitted);
                    e.HasMorePages = remaining.Length > 0;
                };

                doc.Print();
            }
        }
    }
}
'@

Add-Type -TypeDefinition $source -ReferencedAssemblies System.Drawing.dll
[Pedidos360GdiPrinter]::Print($printer, $documentName, $content)
Write-Output ("P360DOC:" + $documentName)
`;

  let output: string;

  try {
    output = await runPowerShell(script, 60000);
  } catch (error) {
    if (error instanceof WindowsSubmissionUncertainError) throw error;
    throw new WindowsSubmissionUncertainError(
      `No se pudo confirmar el envío al controlador Windows: ${
        error instanceof Error ? error.message : "Error desconocido"
      }`
    );
  }

  const match = output.match(/P360DOC:(Pedidos360-[a-f0-9-]+)/i);

  if (!match?.[1]) {
    throw new WindowsSubmissionUncertainError(
      "Windows no devolvió el identificador del documento."
    );
  }

  return match[1];
}

export function extractWindowsRequestId(
  printerName: string,
  output: string
): string | null {
  if (!printerName.trim()) return null;
  const match = output.match(/^(Pedidos360-[a-f0-9-]+)$/i);
  return match?.[1] ?? null;
}

export async function waitForWindowsCompletion(
  printerName: string,
  requestId: string,
  timeoutMs = 120000,
  pollIntervalMs = 1500
): Promise<boolean> {
  if (!printerName.trim() || !/^Pedidos360-[a-f0-9-]+$/i.test(requestId)) {
    throw new Error("Impresora o identificador Windows inválido.");
  }

  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const script = `
$ErrorActionPreference = 'Stop'
$jobs = @(Get-PrintJob -PrinterName ${psQuote(printerName)} -ErrorAction Stop |
  Where-Object { $_.JobName -eq ${psQuote(requestId)} })
if ($jobs.Count -eq 0) {
  Write-Output '{"found":false}'
} else {
  $job = $jobs[0]
  @{ found = $true; status = [string]$job.JobStatus } |
    ConvertTo-Json -Compress
}
`;

    const output = await runPowerShell(script, 15000);
    const result = JSON.parse(output) as {
      found: boolean;
      status?: string;
    };

    if (result.found && result.status) {
      const status = result.status.toLowerCase();

      if (/error|offline|paperout|blocked|userintervention/.test(status)) {
        throw new Error(`Windows reportó un problema: ${result.status}`);
      }

      if (/printed|completed/.test(status)) return true;
    }

    await wait(Math.min(pollIntervalMs, Math.max(0, deadline - Date.now())));
  }

  return false;
}
