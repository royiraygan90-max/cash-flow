"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Renders a modal straight under <body>, outside the page scroller.
 *
 * The page scrolls inside `.app-scroll`, with the mobile bottom nav as its flex sibling. On iOS
 * that scroller is its own stacking context, so a `position: fixed` modal inside it can never rise
 * above the nav (z-index 40): the bottom of a sheet, and its save button, ended up behind the nav.
 * Mounted under <body>, the modal's z-index 50 competes with the nav directly.
 */
export default function ModalPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? createPortal(children, document.body) : null;
}
