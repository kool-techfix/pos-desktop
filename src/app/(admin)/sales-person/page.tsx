import { useState } from "react";
import { Plus, Trash2, UsersRound } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { Field } from "@/components/Field";
import { Modal } from "@/components/Modal";
import { PageTitle } from "@/components/PageTitle";
import { uid } from "@/lib/helpers";
import type { AppState } from "@/types/types";
import "./_page.scss";

export function SalesPeoplePage({
  state,
  mutate,
}: {
  state: AppState;
  mutate: (fn: (current: AppState) => AppState) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const people = state.users.filter((user) => user.role === "SALES_PERSON");

  const add = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    const code = String(Math.floor(1000 + Math.random() * 9000));
    mutate((current) => ({
      ...current,
      users: [
        ...current.users,
        {
          id: uid("sales"),
          name: name.trim(),
          role: "SALES_PERSON",
          signInCode: code,
          active: true,
        },
      ],
    }));
    setName("");
    setShowForm(false);
  };

  const toggle = (id: string) =>
    mutate((current) => ({
      ...current,
      users: current.users.map((user) =>
        user.id === id ? { ...user, active: !user.active } : user,
      ),
    }));
  const remove = (id: string) => {
    if (window.confirm("Remove this sales person?")) {
      mutate((current) => ({
        ...current,
        users: current.users.filter((user) => user.id !== id),
      }));
    }
  };

  return (
    <div className="sales-people-page">
      <PageTitle
        eyebrow="Team"
        title="Sales people"
        description="Give attendants a quick code for their shift."
        action={
          <button
            data-testid="button-add-sales-person"
            onClick={() => setShowForm(true)}
            className="app-button app-button--primary"
          >
            <Plus size={16} />
            Add sales person
          </button>
        }
      />
      <section className="panel sales-people-page__panel">
        <div className="sales-people-page__header">
          <p>Attendant accounts</p>
          <span>{people.length} accounts created</span>
        </div>
        <div>
          {people.map((person) => (
            <div
              key={person.id}
              data-testid={`row-sales-person-${person.id}`}
              className="sales-people-page__row"
            >
              <div className="sales-people-page__person">
                <div className="sales-people-page__avatar">
                  {person.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div>
                  <p>{person.name}</p>
                  <span>
                    {person.active ? "Active account" : "Access paused"}
                  </span>
                </div>
              </div>
              <div className="sales-people-page__controls">
                <div>
                  <p className="eyebrow">Sign-in code</p>
                  <strong>{person.signInCode}</strong>
                </div>
                <button
                  data-testid={`button-toggle-sales-person-${person.id}`}
                  onClick={() => toggle(person.id)}
                  className={
                    person.active
                      ? "sales-people-page__pause"
                      : "sales-people-page__activate"
                  }
                >
                  {person.active ? "Pause" : "Activate"}
                </button>
                <button
                  data-testid={`button-delete-sales-person-${person.id}`}
                  onClick={() => remove(person.id)}
                  className="sales-people-page__delete"
                  aria-label={`Delete ${person.name}`}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
        {!people.length && (
          <div className="sales-people-page__empty">
            <EmptyState
              icon={UsersRound}
              title="No attendant accounts"
              body="Create a code for the next person behind the counter."
            />
          </div>
        )}
      </section>
      {showForm && (
        <Modal title="Add sales person" onClose={() => setShowForm(false)}>
          <form onSubmit={add} className="sales-people-page__form">
            <Field
              label="Name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              testId="input-sales-person-name"
              placeholder="e.g. Alex Morgan"
            />
            <p>
              A unique four digit sign-in code will be generated automatically.
            </p>
            <div className="sales-people-page__form-actions">
              <button
                type="button"
                data-testid="button-cancel-sales-person"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
              <button
                data-testid="button-save-sales-person"
                className="app-button app-button--primary"
              >
                Create account
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
