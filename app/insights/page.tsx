import { computeInsights } from "@/lib/insights";
import InsightCard from "@/app/components/InsightCard";
import Icon from "@/app/components/Icon";

export const dynamic = "force-dynamic";

export default async function InsightsPage() {
  const insights = await computeInsights();

  return (
    <main
      className="min-h-screen"
      style={{
        background: "var(--bg-primary)",
        padding: "0 18px 80px",
        maxWidth: 640,
        margin: "0 auto",
        direction: "rtl",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 16,
          marginBottom: 20,
        }}
      >
        {/* Title first in DOM = right in RTL */}
        <h1
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: "#f2f5f8",
            fontFamily: "Rubik, sans-serif",
          }}
        >
          תובנות
        </h1>

        {/* Bell icon chip second in DOM = left in RTL */}
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: "#161b22",
            color: "#9aa6b4",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon name="notifications" size={18} />
        </div>
      </div>

      {insights.length === 0 ? (
        <div
          style={{
            background: "#11151b",
            border: "1px solid #1b212a",
            borderRadius: 20,
            padding: 40,
            textAlign: "center",
            color: "#6b7785",
            fontSize: 14,
            fontFamily: "Rubik, sans-serif",
            lineHeight: 1.6,
          }}
        >
          אין עדיין תובנות להציג. תמשיך להזין עסקאות ונעדכן אותך כשיהיה מה לספר.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {insights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      )}
    </main>
  );
}
