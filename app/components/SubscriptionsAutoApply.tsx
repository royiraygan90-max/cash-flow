"use client";

import { useEffect } from "react";

export default function SubscriptionsAutoApply() {
  useEffect(() => {
    fetch("/api/subscriptions/apply", { method: "POST" }).catch(() => {});
  }, []);
  return null;
}
