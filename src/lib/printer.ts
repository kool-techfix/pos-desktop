import type { Business, Sale } from "@/types/types";

function isElectron(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.electronAPI !== "undefined"
  );
}

/**
 * Print a receipt.
 *
 * Electron → raw ESC/POS bytes sent straight to the configured
 *            58mm thermal printer (bypasses the OS print dialog).
 * Browser  → native print dialog (window.print()), for local dev
 *            or when no printer connection has been configured.
 */
export async function printReceipt(sale: Sale, business: Business): Promise<void> {
  if (isElectron() && business.printerInterface?.trim()) {
    try {
      await window.electronAPI!.printer.print({ sale, business });
      return;
    } catch (error) {
      console.error(
        "Thermal print failed, falling back to the system print dialog:",
        error,
      );
    }
  }

  window.print();
}
