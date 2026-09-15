import { LogOut } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import type { Business, User } from "@/types/types";
import "./SalesShell.scss";

export function SalesPersonShell({
  business,
  user,
  onSignOut,
  children,
}: {
  business: Business;
  user: User;
  onSignOut: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="sales-person-shell">
      <header className="sales-person-shell__header">
        <div className="sales-person-shell__brand">
          <BrandMark />
          <div>
            <strong>Bluebird POS</strong>
            <span>{business.name}</span>
          </div>
        </div>
        <div className="sales-person-shell__account">
          <div>
            <strong>{user.name}</strong>
            <span>Sales person</span>
          </div>
          <button data-testid="button-pos-logout" onClick={onSignOut}>
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </header>
      <main className="sales-person-shell__main">{children}</main>
    </div>
  );
}
