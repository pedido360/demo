import {
  listPrinters as listCupsPrinters,
  printText as printCupsText,
  extractCupsRequestId,
  waitForCupsCompletion,
  CupsSubmissionUncertainError,
} from "./cups.js";

import {
  listPrinters as listWindowsPrinters,
  printText as printWindowsText,
  extractWindowsRequestId,
  waitForWindowsCompletion,
} from "./windows-gdi.js";

export const SubmissionUncertainError = CupsSubmissionUncertainError;

export async function listPrinters() {
  if (process.platform === "win32") {
    return listWindowsPrinters();
  }

  if (process.platform === "linux") {
    return listCupsPrinters();
  }

  throw new Error(`Sistema operativo no compatible: ${process.platform}`);
}

export async function printText(printerName: string, content: string) {
  if (process.platform === "win32") {
    return printWindowsText(printerName, content);
  }

  if (process.platform === "linux") {
    return printCupsText(printerName, content);
  }

  throw new Error(`Sistema operativo no compatible: ${process.platform}`);
}

export function extractRequestId(printerName: string, output: string) {
  if (process.platform === "win32") {
    return extractWindowsRequestId(printerName, output);
  }

  if (process.platform === "linux") {
    return extractCupsRequestId(printerName, output);
  }

  return null;
}

export async function waitForCompletion(
  printerName: string,
  requestId: string,
  timeoutMs = 120000,
  pollIntervalMs = 1500
) {
  if (process.platform === "win32") {
    return waitForWindowsCompletion(
      printerName,
      requestId,
      timeoutMs,
      pollIntervalMs
    );
  }

  if (process.platform === "linux") {
    return waitForCupsCompletion(
      printerName,
      requestId,
      timeoutMs,
      pollIntervalMs
    );
  }

  return false;
}
