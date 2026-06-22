"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import dynamic from "next/dynamic";
import Icon from "./Icon";

const AddTransactionModal = dynamic(() => import("./AddTransactionModal"), { ssr: false });

const NAV_ITEMS = [
  { href: "/",              label: "בית",       icon: "home" },
  { href: "/statistics",   label: "סטטיסטיקה", icon: "monitoring" },
  { href: "/insights",     label: "תובנות",    icon: "notifications" },
  { href: "/subscriptions", label: "מנויים",   icon: "autorenew" },
];

// Mobile: first FAB_SPLIT items appear on the right side of FAB (in RTL);
// remaining items appear on the left side.
const FAB_SPLIT = Math.ceil(NAV_ITEMS.length / 2); // 2

export default function AppNav() {
  const pathname = usePathname();
  const [modalOpen, setModalOpen] = useState(false);

  function isActive(href: string) {
    return pathname === href || (href !== "/" && pathname.startsWith(href + "/"));
  }

  function NavTab({ item }: { item: (typeof NAV_ITEMS)[0] }) {
    const active = isActive(item.href);
    return (
      <Link
        href={item.href}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          textDecoration: "none",
          color: active ? "#34e0a1" : "#5c6776",
          fontWeight: active ? 500 : 400,
          fontSize: 11,
          fontFamily: "Rubik, sans-serif",
          transition: "color 0.15s",
          minWidth: 52,
        }}
      >
        <Icon name={item.icon} size={22} />
        {item.label}
      </Link>
    );
  }

  const rightItems = NAV_ITEMS.slice(0, FAB_SPLIT);
  const leftItems  = NAV_ITEMS.slice(FAB_SPLIT);

  return (
    <>
      {modalOpen && <AddTransactionModal onClose={() => setModalOpen(false)} />}

      {/* ── Mobile bottom tab bar ── */}
      <nav
        className="md:hidden"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          background: "#0b0e12",
          borderTop: "1px solid #161b22",
          padding: "14px 20px calc(26px + env(safe-area-inset-bottom))",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-around",
        }}
      >
        {/* Right side tabs (first in DOM → right in RTL) */}
        {rightItems.map((item) => (
          <NavTab key={item.href} item={item} />
        ))}

        {/* Center FAB */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: -28 }}>
          <button
            onClick={() => setModalOpen(true)}
            aria-label="הוסף עסקה"
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "#34e0a1",
              color: "#06231a",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 20px -6px rgba(52,224,161,.6)",
              transition: "transform 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <Icon name="add" size={28} />
          </button>
        </div>

        {/* Left side tabs (last in DOM → left in RTL) */}
        {leftItems.map((item) => (
          <NavTab key={item.href} item={item} />
        ))}
      </nav>

      {/* ── Desktop top bar ── */}
      <nav
        className="hidden md:flex"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: "#0b0e12",
          borderBottom: "1px solid #161b22",
          height: 56,
          alignItems: "center",
          padding: "0 24px",
          gap: 24,
          direction: "rtl",
        }}
      >
        {NAV_ITEMS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            style={{
              fontFamily: "Rubik, sans-serif",
              fontSize: 14,
              fontWeight: isActive(href) ? 500 : 400,
              color: isActive(href) ? "#34e0a1" : "#5c6776",
              textDecoration: "none",
              padding: "4px 0",
              borderBottom: isActive(href) ? "2px solid #34e0a1" : "2px solid transparent",
              transition: "color 0.15s, border-color 0.15s",
            }}
          >
            {label}
          </Link>
        ))}

        <div style={{ marginRight: "auto" }}>
          <button
            onClick={() => setModalOpen(true)}
            style={{
              background: "#34e0a1",
              color: "#06231a",
              border: "none",
              borderRadius: 10,
              padding: "7px 14px",
              fontSize: 13,
              fontFamily: "Rubik, sans-serif",
              fontWeight: 600,
              cursor: "pointer",
              transition: "opacity 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            + הוסף עסקה
          </button>
        </div>
      </nav>
    </>
  );
}
