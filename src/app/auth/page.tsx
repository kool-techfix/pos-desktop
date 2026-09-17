"use client";

import { Suspense, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

import { BrandMark } from "@/components/BrandMark";
import { Field } from "@/components/Field";
import { useApp } from "@/providers/AppProvider";

import "./page.scss";

type AuthForm = {
  business: string;
  name: string;
  username: string;
  password: string;
  confirm: string;
  code: string;
};

function sanitizeRedirect(value: string | null): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  return value;
}

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthPageContent />
    </Suspense>
  );
}

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
  registerBusiness,
  loginAsAdmin: authenticateAdmin,
  loginAsSalesPerson: authenticateSalesPerson,
} = useApp();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [loginType, setLoginType] = useState<"admin" | "sales">("admin");

  const [form, setForm] = useState<AuthForm>({
    business: "",
    name: "",
    username: "",
    password: "",
    confirm: "",
    code: "",
  });

  const [error, setError] = useState("");

  const update =
    (key: keyof AuthForm) => (event: ChangeEvent<HTMLInputElement>) => {
      setForm((current) => ({
        ...current,
        [key]: event.target.value,
      }));

      if (error) {
        setError("");
      }
    };

  const submitLogin = async (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();

  try {
    const user =
      loginType === "admin"
        ? await authenticateAdmin({
            username: form.username,
            password: form.password,
          })
        : await authenticateSalesPerson({
            signInCode: form.code,
          });

    const defaultTarget =
      user.role === "SALES_PERSON" ? "/sales-pos" : "/dashboard";

    router.replace(
      sanitizeRedirect(searchParams.get("redirect")) ?? defaultTarget,
    );
  } catch (error) {
    setError(
      error instanceof Error
        ? error.message
        : "Those details did not match an active account.",
    );
  }
};

  const submitRegister = async (
  event: FormEvent<HTMLFormElement>,
) => {
  event.preventDefault();

  if (form.password !== form.confirm) {
    setError("Password confirmation does not match.");
    return;
  }

  try {
    await registerBusiness({
      businessName: form.business,
      name: form.name,
      username: form.username,
      password: form.password,
    });

    router.replace("/dashboard");
  } catch (error) {
    setError(
      error instanceof Error
        ? error.message
        : "Unable to create business account.",
    );
  }
};

  const setModeAndClearError = (nextMode: "login" | "register") => {
    setMode(nextMode);
    setError("");
  };

  return (
    <main className="auth-page">
      <div className="auth-page__card panel">
        <section className="auth-page__intro">
          <div>
            <div className="auth-page__brand">
              <BrandMark light />
              <span>Bluebird POS</span>
            </div>

            <div className="auth-page__message">
              <p className="eyebrow">The counter, in order</p>

              <h1>
                Fast hands.
                <br />
                <span>Clear stock.</span>
              </h1>

              <p>
                A calm, dependable till for the drinks that keep your shop
                moving.
              </p>
            </div>
          </div>

          <div className="auth-page__proof">
            <span>
              <strong>Local</strong> data by default
            </span>

            <span>
              <strong>Ready</strong> for every shift
            </span>
          </div>
        </section>

        <section className="auth-page__form-area">
          <div className="auth-page__mobile-brand">
            <BrandMark />
            <span>Bluebird POS</span>
          </div>

          <p className="eyebrow">Welcome back</p>

          <h2>
            {mode === "login" ? "Sign in to your till" : "Set up your shop"}
          </h2>

          <p className="auth-page__subtitle">
            {mode === "login"
              ? "Use an admin account or a sales person code to start a shift."
              : "Your business data stays on this device."}
          </p>

          <div className="auth-page__tabs">
            <button
              type="button"
              data-testid="button-auth-login-tab"
              className={
                mode === "login"
                  ? "auth-page__tab auth-page__tab--active"
                  : "auth-page__tab"
              }
              onClick={() => setModeAndClearError("login")}
            >
              Sign in
            </button>

            <button
              type="button"
              data-testid="button-auth-register-tab"
              className={
                mode === "register"
                  ? "auth-page__tab auth-page__tab--active"
                  : "auth-page__tab"
              }
              onClick={() => setModeAndClearError("register")}
            >
              New business
            </button>
          </div>

          {mode === "login" ? (
            <form onSubmit={submitLogin} className="auth-page__form">
              <div className="auth-page__login-switch">
                <button
                  type="button"
                  data-testid="button-login-admin"
                  className={
                    loginType === "admin"
                      ? "auth-page__switch auth-page__switch--active"
                      : "auth-page__switch"
                  }
                  onClick={() => {
                    setLoginType("admin");
                    setError("");
                  }}
                >
                  Admin account
                </button>

                <button
                  type="button"
                  data-testid="button-login-sales"
                  className={
                    loginType === "sales"
                      ? "auth-page__switch auth-page__switch--active"
                      : "auth-page__switch"
                  }
                  onClick={() => {
                    setLoginType("sales");
                    setError("");
                  }}
                >
                  Sales person
                </button>
              </div>

              {loginType === "admin" ? (
                <>
                  <Field
                    label="Username or email"
                    value={form.username}
                    onChange={update("username")}
                    testId="input-login-username"
                    autoComplete="username"
                  />

                  <Field
                    label="Password"
                    type="password"
                    value={form.password}
                    onChange={update("password")}
                    testId="input-login-password"
                    autoComplete="current-password"
                  />
                </>
              ) : (
                <>
                  <Field
                    label="Shift sign-in code"
                    value={form.code}
                    onChange={update("code")}
                    testId="input-login-code"
                    inputMode="text"
                  />

                  <p className="auth-page__hint">
                    Ask your admin for your sign-in code.
                  </p>
                </>
              )}

              {error && (
                <p data-testid="status-auth-error" className="auth-page__error">
                  {error}
                </p>
              )}

              <button
                type="submit"
                data-testid="button-submit-login"
                className="app-button app-button--primary auth-page__submit"
              >
                Enter Bluebird POS
                <ArrowUpRight size={16} />
              </button>
            </form>
          ) : (
            <form
              onSubmit={submitRegister}
              className="auth-page__form auth-page__form--register"
            >
              <Field
                label="Business name"
                value={form.business}
                onChange={update("business")}
                testId="input-register-business"
                placeholder="e.g. The Corner Bottle"
              />

              <Field
                label="Your name"
                value={form.name}
                onChange={update("name")}
                testId="input-register-name"
                placeholder="e.g. Sam Rivera"
              />

              <Field
                label="Admin username or email"
                value={form.username}
                onChange={update("username")}
                testId="input-register-username"
              />

              <div className="auth-page__field-grid">
                <Field
                  label="Password"
                  type="password"
                  value={form.password}
                  onChange={update("password")}
                  testId="input-register-password"
                />

                <Field
                  label="Confirm password"
                  type="password"
                  value={form.confirm}
                  onChange={update("confirm")}
                  testId="input-register-confirm"
                />
              </div>

              {error && (
                <p
                  data-testid="status-register-error"
                  className="auth-page__error"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                data-testid="button-submit-register"
                className="app-button app-button--primary auth-page__submit"
              >
                Create business account
                <ArrowUpRight size={16} />
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
