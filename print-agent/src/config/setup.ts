import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { saveSettings } from "./settings.js";
import { listPrinters } from "../printer/cups.js";
import { Pedidos360Client } from "../api/client.js";

async function readHidden(prompt: string): Promise<string> {
  if (!stdin.isTTY) throw new Error("Se necesita una terminal interactiva.");

  stdout.write(prompt);
  stdin.setRawMode(true);
  stdin.resume();

  return new Promise((resolve, reject) => {
    let value = "";

    const finish = () => {
      stdin.setRawMode(false);
      stdin.pause();
      stdin.removeListener("data", onData);
      stdout.write("\n");
    };

    const onData = (chunk: string) => {
      for (const char of chunk) {
        if (char === "\u0003") {
          finish();
          reject(new Error("Configuración cancelada."));
          return;
        }
        if (char === "\r" || char === "\n") {
          finish();
          resolve(value.trim());
          return;
        }
        if (char === "\u007f" || char === "\b") {
          value = value.slice(0, -1);
        } else {
          value += char;
        }
      }
    };

    stdin.setEncoding("utf8");
    stdin.on("data", onData);
  });
}

async function main() {
  const rl = createInterface({ input: stdin, output: stdout });
  let input: ReturnType<typeof createInterface> | undefined;

  try {
    console.log("\n=== CONFIGURACIÓN PEDIDOS360 PRINT AGENT ===\n");

    const serverUrl = (await rl.question("URL del servidor: ")).trim();
    rl.close();

    const token = await readHidden("Token de instalación (entrada oculta): ");
    input = createInterface({ input: stdin, output: stdout });

    const url = new URL(serverUrl);
    if (!["http:", "https:"].includes(url.protocol) || !token) {
      throw new Error("URL o token inválido.");
    }

    console.log("\nBuscando impresoras CUPS...");
    const printers = await listPrinters();

    if (printers.length === 0) {
      throw new Error("No se encontraron impresoras.");
    }

    printers.forEach((printer, index) => {
      console.log(`${index + 1}. ${printer.name} - ${printer.status}`);
    });

    const kitchenChoice = Number(await input.question("\\nSelecciona la impresora de COCINA: "));
    const kitchenPrinter = printers[kitchenChoice - 1];
    if (!kitchenPrinter) throw new Error("Selección de cocina inválida.");

    const cashierChoice = Number(await input.question("Selecciona la impresora de CAJA: "));
    const cashierPrinter = printers[cashierChoice - 1];
    if (!cashierPrinter) throw new Error("Selección de caja inválida.");

    const settings = {
      serverUrl: url.origin,
      token,
      kitchenPrinterName: kitchenPrinter.name,
      cashierPrinterName: cashierPrinter.name,
    };

    console.log("\nValidando conexión con Pedidos360...");
    const client = new Pedidos360Client(settings);
    const auth = await client.authenticate();

    if (!auth.success || !auth.agent?.id) {
      throw new Error("El servidor no autorizó este agente.");
    }

    await saveSettings(settings);
    console.log(`\nAgente registrado: ${auth.agent.name}`);
    console.log(`Impresora de cocina: ${kitchenPrinter.name}`);
    console.log(`Impresora de caja: ${cashierPrinter.name}`);
    console.log("Configuración guardada correctamente.");
  } finally {
    rl.close();
    input?.close();
  }
}
main().catch((error) => {
  console.error("Error de configuración:", error.message);
  process.exitCode = 1;
});
