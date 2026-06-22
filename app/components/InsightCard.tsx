import type { Insight } from "@/lib/insights";
import Icon from "./Icon";

const VARIANT_CARD: Record<Insight["variant"], React.CSSProperties> = {
  positive: { background: "#101a16", border: "1px solid #1c3329" },
  warning:  { background: "#1c1316", border: "1px solid #3a2226" },
  info:     { background: "rgba(129,140,248,.08)", border: "1px solid rgba(129,140,248,.25)" },
};

const VARIANT_CHIP: Record<Insight["variant"], { bg: string; color: string }> = {
  positive: { bg: "rgba(52,224,161,.13)",    color: "#34e0a1" },
  warning:  { bg: "rgba(255,107,107,.13)",   color: "#ff6b6b" },
  info:     { bg: "rgba(129,140,248,.13)",   color: "#818cf8" },
};

export default function InsightCard({ insight }: { insight: Insight }) {
  const chip = VARIANT_CHIP[insight.variant];

  return (
    <div
      style={{
        ...VARIANT_CARD[insight.variant],
        borderRadius: 20,
        padding: 16,
        display: "flex",
        gap: 14,
        direction: "rtl",
      }}
    >
      {/* Icon chip — first in DOM = rightmost in RTL */}
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 13,
          flexShrink: 0,
          background: chip.bg,
          color: chip.color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name={insight.icon} size={22} />
      </div>

      {/* Text column */}
      <div style={{ flex: 1 }}>
        {insight.label && (
          <p
            style={{
              fontSize: 11,
              color: "#7c8896",
              fontFamily: "Rubik, sans-serif",
              marginBottom: 4,
            }}
          >
            {insight.label}
          </p>
        )}
        <p
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#f2f5f8",
            fontFamily: "Rubik, sans-serif",
            marginBottom: 4,
          }}
        >
          {insight.title}
        </p>
        <p
          style={{
            fontSize: 13,
            color: "#9aa6b4",
            fontFamily: "Rubik, sans-serif",
            lineHeight: 1.4,
          }}
        >
          {insight.text}
        </p>
      </div>
    </div>
  );
}
