import { useState, type ReactNode } from "react";
import {
  BarChart3,
  LogOut,
  Menu,
  Package,
  Receipt,
  Settings,
  ShoppingCart,
  UsersRound,
  X,
} from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import type { Business, User } from "@/types/types";
import "./AdminShell.scss";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { href: "/dashboard", label: "Overview", icon: BarChart3 },
  { href: "/pos", label: "Point of sale", icon: ShoppingCart },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/sales", label: "Sales history", icon: Receipt },
  { href: "/sales-persons", label: "Sales people", icon: UsersRound },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AdminShell({
  business,
  user,
  onSignOut,
  children,
}: {
  business: Business;
  user: User;
  onSignOut: () => void;
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="admin-shell">
      {mobileOpen && (
        <button
          aria-label="Close menu"
          className="admin-shell__overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={`admin-shell__sidebar ${mobileOpen ? "admin-shell__sidebar--open" : ""}`}
      >
        <div className="admin-shell__brand">
          <BrandMark light />
          <div className="admin-shell__brand-copy">
            <div>Bluebird POS</div>
            <span>counter control</span>
          </div>
          <button
            data-testid="button-close-mobile-menu"
            className="admin-shell__mobile-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>
        <div className="admin-shell__workspace">
          <p className="eyebrow">Workspace</p>
          <p data-testid="text-business-name">{business.name}</p>
        </div>
        <nav className="admin-shell__nav">
          {navigation.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              data-testid={`link-nav-${label.toLowerCase().replaceAll(" ", "-")}`}
              onClick={() => setMobileOpen(false)}
              className={`admin-shell__nav-link ${pathname === href ? "admin-shell__nav-link--active" : ""}`}
            >
              <Icon size={17} strokeWidth={1.8} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        <div className="admin-shell__account">
          <div className="admin-shell__identity">
            <div className="admin-shell__avatar">
              {user.name
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div>
              <p>{user.name}</p>
              <span>Administrator</span>
            </div>
          </div>
          <button
            data-testid="button-logout"
            onClick={onSignOut}
            className="admin-shell__logout"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>
      <div className="admin-shell__content">
        <header className="admin-shell__header">
          <div className="admin-shell__header-left">
            <button
              data-testid="button-open-mobile-menu"
              className="admin-shell__mobile-menu"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <div className="admin-shell__mobile-mark">
              <BrandMark />
            </div>
            <div>
              <p className="eyebrow admin-shell__header-eyebrow">
                Operations desk
              </p>
              <p className="admin-shell__greeting">
                Good to see you, {user.name.split(" ")[0]}
              </p>
            </div>
          </div>
          <div className="admin-shell__header-actions">
            <span className="admin-shell__local-status">
              <span />
              Device data is local
            </span>
            <Link
              href="/pos"
              data-testid="link-header-pos"
              className="app-button app-button--primary"
            >
              <ShoppingCart size={15} />
              Open till
            </Link>
          </div>
        </header>
        <main className="admin-shell__main">{children}</main>
      </div>
    </div>
  );
}
