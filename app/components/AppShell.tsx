"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Fixed-viewport app frame: the page content scrolls inside `.app-scroll`
 * while the nav (a flex sibling) stays put at the bottom of the screen.
 *
 * Why not a `position: fixed` nav over a scrolling document? On iOS Safari /
 * installed PWAs a fixed element is pinned to the *layout* viewport, which
 * drifts away from what's visible during rubber-banding, momentum scroll,
 * toolbar collapse and after the keyboard closes — the bar then ends up stuck
 * mid-screen or at the top. Here the document itself never scrolls, so there
 * is nothing for the bar to detach from.
 */
export default function AppShell({
  nav,
  children,
}: {
  nav: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const scrollRef = useRef<HTMLDivElement>(null);

  // The window no longer scrolls, so Next's reset-to-top on navigation has to
  // happen on our scroller instead.
  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="app-shell">
      {nav}
      <div ref={scrollRef} className="app-scroll">
        {children}
      </div>
    </div>
  );
}
