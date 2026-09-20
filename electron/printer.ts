import { ThermalPrinter, PrinterTypes, CharacterSet } from "node-thermal-printer";

import { dateTime, money } from "../src/lib/helpers";
import type { Business, Sale } from "../src/types/types";

const DEFAULT_CHARS_PER_LINE = 32;

export async function printReceipt(sale: Sale, business: Business): Promise<void> {
  const printerInterface = business.printerInterface?.trim();

  if (!printerInterface) {
    throw new Error(
      "No thermal printer configured. Add a printer connection in Settings.",
    );
  }

  const width = business.printerCharsPerLine ?? DEFAULT_CHARS_PER_LINE;

  const printer = new ThermalPrinter({
    type: PrinterTypes.EPSON,
    interface: printerInterface,
    width,
    characterSet: CharacterSet.PC852_LATIN2,
    removeSpecialCharacters: false,
    options: { timeout: 5000 },
  });

  const isConnected = await printer.isPrinterConnected();

  if (!isConnected) {
    throw new Error(`Unable to reach thermal printer at "${printerInterface}".`);
  }

  printer.alignCenter();
  printer.bold(true);
  printer.println(business.name);
  printer.bold(false);
  printer.alignLeft();

  printer.println(`Receipt ${sale.receiptNumber}`);
  printer.println(dateTime(sale.createdAt));
  printer.drawLine();

  for (const item of sale.items) {
    const label = `${item.quantity} x ${item.name}${item.size ? ` (${item.size})` : ""}`;

    printer.println(label);
    printer.alignRight();
    printer.println(money(item.unitPrice * item.quantity));
    printer.alignLeft();
  }

  printer.drawLine();
  printer.leftRight("TOTAL", money(sale.total));
  printer.leftRight("PAID", money(sale.amountPaid));
  printer.leftRight("CHANGE", money(sale.change));
  printer.newLine();
  printer.println(`Cashier: ${sale.cashierName}`);

  printer.cut();

  await printer.execute();
}
