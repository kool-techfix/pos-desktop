"use client";

import { useState } from "react";

import { Plus, Trash2, UsersRound } from "lucide-react";

import { EmptyState } from "@/components/EmptyState";
import { Field } from "@/components/Field";
import { Modal } from "@/components/Modal";
import { PageTitle } from "@/components/PageTitle";

import { getSalesPersons } from "@/lib/salesPerson";

import type { User } from "@/types/types";

import "./_page.scss";
import { useApp } from "@/providers/AppProvider";

export default function SalesPeoplePage() {
  const {
    state,
    addSalesPerson,
    setSalesPersonActive,
    deleteSalesPerson,
  } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");

  const people = getSalesPersons(state.users);

  const closeForm = () => {
    setName("");
    setShowForm(false);
  };

  const handleAdd = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      addSalesPerson({ name });
      closeForm();
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to create sales person",
      );
    }
  };

  const handleToggle = (person: User) => {
    try {
      setSalesPersonActive(person.id, !person.active);
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to update sales person",
      );
    }
  };

  const handleDelete = (person: User) => {
    if (
      !window.confirm(
        `Remove ${person.name} as a sales person?`,
      )
    ) {
      return;
    }

    try {
      deleteSalesPerson(person.id);
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to remove sales person",
      );
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
            type="button"
            data-testid="button-add-sales-person"
            onClick={() => setShowForm(true)}
            className="app-button app-button--primary"
          >
            <Plus size={16} aria-hidden="true" />
            Add sales person
          </button>
        }
      />

      <section className="panel sales-people-page__panel">
        <div className="sales-people-page__header">
          <p>Attendant accounts</p>

          <span>
            {people.length}{" "}
            {people.length === 1 ? "account" : "accounts"} created
          </span>
        </div>

        {people.length > 0 ? (
          <div>
            {people.map((person) => (
              <SalesPersonRow
                key={person.id}
                person={person}
                onToggle={() => handleToggle(person)}
                onDelete={() => handleDelete(person)}
              />
            ))}
          </div>
        ) : (
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
        <Modal
          title="Add sales person"
          onClose={closeForm}
        >
          <form
            onSubmit={handleAdd}
            className="sales-people-page__form"
          >
            <Field
              label="Name"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              testId="input-sales-person-name"
              placeholder="e.g. Yusuf Mukhtar"
            />

            <p>
              A unique 6-character sign-in code will be
              generated automatically.
            </p>

            <div className="sales-people-page__form-actions">
              <button
                type="button"
                data-testid="button-cancel-sales-person"
                onClick={closeForm}
              >
                Cancel
              </button>

              <button
                type="submit"
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

type SalesPersonRowProps = {
  person: User;
  onToggle: () => void;
  onDelete: () => void;
};

function SalesPersonRow({
  person,
  onToggle,
  onDelete,
}: SalesPersonRowProps) {
  const initials = person.name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      data-testid={`row-sales-person-${person.id}`}
      className="sales-people-page__row"
    >
      <div className="sales-people-page__person">
        <div className="sales-people-page__avatar">
          {initials}
        </div>

        <div>
          <p>{person.name}</p>

          <span>
            {person.active
              ? "Active account"
              : "Access paused"}
          </span>
        </div>
      </div>

      <div className="sales-people-page__controls">
        <div>
          <p className="eyebrow">Sign-in code</p>
          <strong>{person.signInCode}</strong>
        </div>

        <button
          type="button"
          data-testid={`button-toggle-sales-person-${person.id}`}
          onClick={onToggle}
          className={
            person.active
              ? "sales-people-page__pause"
              : "sales-people-page__activate"
          }
        >
          {person.active ? "Pause" : "Activate"}
        </button>

        <button
          type="button"
          data-testid={`button-delete-sales-person-${person.id}`}
          onClick={onDelete}
          className="sales-people-page__delete"
          aria-label={`Delete ${person.name}`}
        >
          <Trash2 size={15} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}