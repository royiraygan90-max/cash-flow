const BADGES: Record<string, { label: string; color: string }> = {
  "home-hub": { label: "מהבית", color: "#34e0a1" },
  "home-hub-upcoming": { label: "צפוי", color: "#f5b942" },
  sms: { label: "אשראי", color: "#52b9ff" },
};

/** Marks a transaction that arrived from somewhere other than manual entry. */
export default function SourceBadge({ source }: { source?: string | null }) {
  const badge = source ? BADGES[source] : undefined;
  if (!badge) return null;
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 500,
        color: badge.color,
        background: `${badge.color}22`,
        border: `1px solid ${badge.color}44`,
        borderRadius: 6,
        padding: "1px 6px",
        marginInlineEnd: 6,
        fontFamily: "Rubik, sans-serif",
        verticalAlign: "middle",
      }}
    >
      {badge.label}
    </span>
  );
}
