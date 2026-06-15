"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const pathname = usePathname();

  function linkStyle(href: string): React.CSSProperties {
    const active = pathname === href;
    return {
      fontFamily: "Inter, sans-serif",
      fontSize: "0.875rem",
      fontWeight: active ? 600 : 400,
      color: active ? "#00875a" : "#6b7280",
      textDecoration: "none",
      padding: "4px 0",
      borderBottom: active ? "2px solid #00875a" : "2px solid transparent",
      transition: "color 0.15s, border-color 0.15s",
    };
  }

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        background: "#ffffff",
        borderBottom: "1px solid #e8e8e8",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        direction: "rtl",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          gap: "24px",
          height: "56px",
        }}
      >
        <Link href="/" style={linkStyle("/")}>
          מאזן
        </Link>
        <Link href="/subscriptions" style={linkStyle("/subscriptions")}>
          מנויים
        </Link>
      </div>
    </nav>
  );
}
