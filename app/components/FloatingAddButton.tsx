"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const AddTransactionModal = dynamic(() => import("./AddTransactionModal"), { ssr: false });

export default function FloatingAddButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="הוסף עסקה"
        className="bottom-6 right-5 md:bottom-8 md:right-8"
        style={{
          position: "fixed",
          width: "48px",
          height: "48px",
          background: "#111111",
          color: "#ffffff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.5rem",
          fontWeight: 300,
          zIndex: 40,
          transition: "background 0.15s",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#333333")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "#111111")}
      >
        +
      </button>

      {open && <AddTransactionModal onClose={() => setOpen(false)} />}
    </>
  );
}
