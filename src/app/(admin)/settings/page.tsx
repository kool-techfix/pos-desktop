"use client";

import { useState } from "react";

import { Printer, Settings } from "lucide-react";

import { Field } from "@/components/Field";
import { PageTitle } from "@/components/PageTitle";

import "./_page.scss";
import { useApp } from "@/providers/AppProvider";

export default function SettingsPage() {
  const { business, updateBusiness } = useApp();

  const [name, setName] = useState(business.name);
  const [printerInterface, setPrinterInterface] = useState(
    business.printerInterface ?? "",
  );
  const [printerCharsPerLine, setPrinterCharsPerLine] = useState(
    String(business.printerCharsPerLine ?? 32),
  );
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const save = (event: React.FormEvent) => {
    event.preventDefault();

    setSaved(false);
    setError("");

    try {
      const parsedWidth = Number.parseInt(printerCharsPerLine, 10);

      updateBusiness({
        name,
        printerInterface: printerInterface.trim() || undefined,
        printerCharsPerLine: Number.isFinite(parsedWidth) && parsedWidth > 0
          ? parsedWidth
          : undefined,
      });

      setSaved(true);
      window.setTimeout(() => setSaved(false), 1800);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save business settings.",
      );
    }
  };

  return (
    <div className="settings-page">
      <PageTitle
        eyebrow="Settings"
        title="Business settings"
        description="A few details that appear across your counter and receipts."
      />

      <div className="panel settings-page__panel">
        <form onSubmit={save}>
          <div className="settings-page__intro">
            <div>
              <Settings size={20} />
            </div>

            <section>
              <h2>Business identity</h2>
              <p>
                Keep your shop name recognizable on every receipt.
              </p>
            </section>
          </div>

          <div className="settings-page__field">
            <Field
              label="Business name"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              testId="input-business-name"
            />

            <p>This is stored only on this device.</p>

            {error && (
              <p
                role="alert"
                data-testid="status-settings-error"
              >
                {error}
              </p>
            )}
          </div>

          <div className="settings-page__intro">
            <div>
              <Printer size={20} />
            </div>

            <section>
              <h2>Receipt printer</h2>
              <p>
                Connect a 58mm thermal printer to print receipts directly,
                without the system print dialog.
              </p>
            </section>
          </div>

          <div className="settings-page__field">
            <Field
              label="Printer connection"
              value={printerInterface}
              onChange={(event) => setPrinterInterface(event.target.value)}
              placeholder="tcp://192.168.1.87:9100"
              testId="input-printer-interface"
            />

            <p>
              A network printer address (e.g. tcp://192.168.1.87:9100) or a
              local port (e.g. /dev/usb/lp0, \\.\COM1). Leave blank to use the
              system print dialog instead.
            </p>
          </div>

          <div className="settings-page__field">
            <Field
              label="Characters per line"
              value={printerCharsPerLine}
              onChange={(event) => setPrinterCharsPerLine(event.target.value)}
              type="number"
              inputMode="numeric"
              placeholder="32"
              testId="input-printer-width"
            />

            <p>Most 58mm printers fit 32 characters per line.</p>
          </div>

          <div className="settings-page__actions">
            <button
              type="submit"
              data-testid="button-save-settings"
              className="app-button app-button--primary"
            >
              Save changes
            </button>

            {saved && (
              <span data-testid="status-settings-saved">
                Saved locally.
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

