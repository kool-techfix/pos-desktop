"use client";

import { useState } from "react";

import { Settings } from "lucide-react";

import { Field } from "@/components/Field";
import { PageTitle } from "@/components/PageTitle";

import type { AppState, Business } from "@/types/types";
import { updateBusiness } from "@/lib/business";

import "./_page.scss";

export function SettingsPage({
  business,
  mutate,
}: {
  business: Business;
  mutate: (fn: (current: AppState) => AppState) => void;
}) {
  const [name, setName] = useState(business.name);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const save = (event: React.FormEvent) => {
    event.preventDefault();

    setSaved(false);
    setError("");

    try {
      const updatedBusiness = updateBusiness(business, {
        name,
      });

      mutate((current) => ({
        ...current,
        business: updatedBusiness,
      }));

      setName(updatedBusiness.name);
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
              <p>Keep your shop name recognizable on every receipt.</p>
            </section>
          </div>

          <div className="settings-page__field">
            <Field
              label="Business name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              testId="input-business-name"
            />

            <p>This is stored only on this device.</p>

            {error && (
              <p role="alert" data-testid="status-settings-error">
                {error}
              </p>
            )}
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
              <span data-testid="status-settings-saved">Saved locally.</span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
