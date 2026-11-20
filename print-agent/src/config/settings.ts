import { chmod, mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

export interface AgentSettings {
  serverUrl: string;
  token: string;
  kitchenPrinterName: string;
  cashierPrinterName: string;
}

const configDirectory = process.platform === "win32"
  ? join(process.env.ProgramData ?? "C:\\ProgramData", "Pedidos360Agent")
  : join(homedir(), ".pedidos360");

const configPath = join(configDirectory, "agent.json");

export async function saveSettings(
  settings: AgentSettings
): Promise<void> {
  if (
    !settings.serverUrl.trim() ||
    !settings.token.trim() ||
    !settings.kitchenPrinterName.trim() ||
    !settings.cashierPrinterName.trim()
  ) {
    throw new Error("La configuración del agente está incompleta.");
  }

  await mkdir(configDirectory, {
    recursive: true,
    mode: 0o700,
  });

  await writeFile(
    configPath,
    JSON.stringify(settings, null, 2),
    {
      encoding: "utf8",
      mode: 0o600,
    }
  );

  if (process.platform !== "win32") {
    await chmod(configPath, 0o600);
  }
}

export async function loadSettings(): Promise<AgentSettings | null> {
  try {
    const content = await readFile(configPath, "utf8");
    const saved = JSON.parse(content);
    const settings: AgentSettings = {
      serverUrl: saved.serverUrl,
      token: saved.token,
      kitchenPrinterName: saved.kitchenPrinterName ?? saved.printerName,
      cashierPrinterName: saved.cashierPrinterName ?? saved.printerName,
    };

    if (
      !settings.serverUrl ||
      !settings.token ||
      !settings.kitchenPrinterName ||
      !settings.cashierPrinterName
    ) {
      throw new Error("La configuración guardada está incompleta.");
    }

    return settings;
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return null;
    }

    throw error;
  }
}
