"use client";

import { useState } from "react";

import { Pencil, Plus, Search, Trash2 } from "lucide-react";

import { EmptyState } from "@/components/EmptyState";
import { Field } from "@/components/Field";
import { Modal } from "@/components/Modal";
import { PageTitle } from "@/components/PageTitle";
import { money } from "@/lib/helpers";
import { searchProducts } from "@/lib/products";
import type { Product } from "@/types/types";

import "./_page.scss";
import { useApp } from "@/providers/AppProvider";

type ProductForm = {
  name: string;
  size: string;
  category: string;
  price: string;
  stock: string;
  lowStockThreshold: string;
};

export default function InventoryPage() {
  const {
    state,
    addProduct,
    updateProduct,
    deleteProduct,
  } = useApp();

  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);

  const [form, setForm] = useState<ProductForm>({
    name: "",
    size: "",
    category: "",
    price: "",
    stock: "",
    lowStockThreshold: "",
  });

  const products = searchProducts(state.products, query);

  const openForm = (product?: Product) => {
    const item = product ?? {
      id: "",
      name: "",
      size: "",
      category: "",
      price: 0,
      stock: 0,
      lowStockThreshold: 8,
    };

    setEditing(product ?? item);

    setForm({
      name: item.name,
      size: item.size,
      category: item.category,
      price: String(item.price || ""),
      stock: String(item.stock || ""),
      lowStockThreshold: String(item.lowStockThreshold || ""),
    });
  };

  const save = (event: React.FormEvent) => {
    event.preventDefault();

    if (
      !form.name.trim() ||
      !form.size.trim() ||
      !form.category.trim()
    ) {
      return;
    }

    const data = {
      name: form.name.trim(),
      size: form.size.trim(),
      category: form.category.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
      lowStockThreshold: Number(form.lowStockThreshold),
    };

    try {
      if (editing?.id) {
        updateProduct(editing.id, data);
      } else {
        addProduct(data);
      }

      setEditing(null);
    } catch (error) {
      console.error(error);
    }
  };

  const remove = (id: string) => {
    if (!window.confirm("Remove this product from inventory?")) {
      return;
    }

    try {
      deleteProduct(id);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="inventory-page">
      <PageTitle
        eyebrow="Inventory"
        title="Products & stock"
        description="Keep pricing and shelf counts accurate."
        action={
          <button
            data-testid="button-add-product"
            onClick={() => openForm()}
            className="app-button app-button--primary"
          >
            <Plus size={16} />
            Add product
          </button>
        }
      />

      <section className="panel inventory-page__panel">
        <div className="inventory-page__toolbar">
          <div className="inventory-page__search">
            <Search size={16} />

            <input
              data-testid="input-inventory-search"
              placeholder="Search products..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <span>{products.length} products shown</span>
        </div>

        <div className="inventory-page__table-scroll">
          <table className="inventory-page__table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>On hand</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>

            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  data-testid={`row-product-${product.id}`}
                >
                  <td>
                    <p>{product.name}</p>
                    <small>{product.size}</small>
                  </td>

                  <td className="muted">
                    {product.category}
                  </td>

                  <td>
                    <strong>{money(product.price)}</strong>
                  </td>

                  <td>
                    <span className="mono">
                      {product.stock}
                    </span>

                    <small className="inline">
                      {" "}
                      units
                    </small>
                  </td>

                  <td>
                    <span
                      className={
                        product.stock <=
                        product.lowStockThreshold
                          ? "inventory-page__status inventory-page__status--low"
                          : "inventory-page__status"
                      }
                    >
                      {product.stock <=
                      product.lowStockThreshold
                        ? "Restock soon"
                        : "Healthy"}
                    </span>
                  </td>

                  <td>
                    <div className="inventory-page__actions">
                      <button
                        data-testid={`button-edit-product-${product.id}`}
                        onClick={() => openForm(product)}
                        aria-label={`Edit ${product.name}`}
                      >
                        <Pencil size={15} />
                      </button>

                      <button
                        data-testid={`button-delete-product-${product.id}`}
                        onClick={() => remove(product.id)}
                        aria-label={`Delete ${product.name}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!products.length && (
          <div className="inventory-page__empty">
            <EmptyState
              icon={Search}
              title="No products found"
              body="Try a different search term."
            />
          </div>
        )}
      </section>

      {editing && (
        <Modal
          title={editing.id ? "Edit product" : "Add product"}
          onClose={() => setEditing(null)}
        >
          <form
            onSubmit={save}
            className="inventory-page__form"
          >
            <Field
              label="Product name"
              value={form.name}
              onChange={(event) =>
                setForm({
                  ...form,
                  name: event.target.value,
                })
              }
              testId="input-product-name"
            />

            <div className="inventory-page__form-grid inventory-page__form-grid--two">
              <Field
                label="Size"
                value={form.size}
                onChange={(event) =>
                  setForm({
                    ...form,
                    size: event.target.value,
                  })
                }
                testId="input-product-size"
                placeholder="500 ml bottle"
              />

              <Field
                label="Category"
                value={form.category}
                onChange={(event) =>
                  setForm({
                    ...form,
                    category: event.target.value,
                  })
                }
                testId="input-product-category"
                placeholder="Cola"
              />
            </div>

            <div className="inventory-page__form-grid inventory-page__form-grid--three">
              <Field
                label="Price"
                type="number"
                value={form.price}
                onChange={(event) =>
                  setForm({
                    ...form,
                    price: event.target.value,
                  })
                }
                testId="input-product-price"
              />

              <Field
                label="Stock"
                type="number"
                value={form.stock}
                onChange={(event) =>
                  setForm({
                    ...form,
                    stock: event.target.value,
                  })
                }
                testId="input-product-stock"
              />

              <Field
                label="Low threshold"
                type="number"
                value={form.lowStockThreshold}
                onChange={(event) =>
                  setForm({
                    ...form,
                    lowStockThreshold:
                      event.target.value,
                  })
                }
                testId="input-product-threshold"
              />
            </div>

            <div className="inventory-page__form-actions">
              <button
                type="button"
                data-testid="button-cancel-product"
                onClick={() => setEditing(null)}
              >
                Cancel
              </button>

              <button
                type="submit"
                data-testid="button-save-product"
                className="app-button app-button--primary"
              >
                Save product
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
