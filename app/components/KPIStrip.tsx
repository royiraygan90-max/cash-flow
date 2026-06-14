interface Props {
  totalIncome: number;
  totalExpenses: number;
}

function fmtAmount(n: number): string {
  return Math.abs(n).toLocaleString("he-IL");
}

interface CardProps {
  label: string;
  value: number;
  accentColor: string;
}

function KPICard({ label, value, accentColor }: CardProps) {
  return (
    <div
      className="flex-1 w-full"
      style={{
        background: "#ffffff",
        border: "1px solid #e8e8e8",
        borderTopColor: accentColor,
        borderTopWidth: "3px",
        borderRadius: "8px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}
    >
      <div className="px-4 py-5 md:px-7 md:py-6">
        <p
          className="text-[0.7rem]"
          style={{
            fontFamily: "Inter, sans-serif",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "#9ca3af",
            marginBottom: "12px",
          }}
        >
          {label}
        </p>
        <p
          className="text-[1.75rem] md:text-[2.25rem]"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700,
            color: accentColor,
            lineHeight: 1,
            display: "flex",
            alignItems: "flex-start",
            gap: "4px",
          }}
        >
          <span
            style={{
              fontSize: "1rem",
              fontWeight: 400,
              color: accentColor,
              marginTop: "5px",
              opacity: 0.8,
            }}
          >
            ₪
          </span>
          {fmtAmount(value)}
        </p>
      </div>
    </div>
  );
}

export default function KPIStrip({ totalIncome, totalExpenses }: Props) {
  const net = totalIncome - totalExpenses;

  return (
    <div className="flex flex-col md:flex-row gap-3 mb-4 mt-4">
      <KPICard label="הכנסות" value={totalIncome} accentColor="#00875a" />
      <KPICard label="הוצאות" value={totalExpenses} accentColor="#dc2626" />
      <KPICard
        label="מאזן"
        value={net}
        accentColor={net >= 0 ? "#00875a" : "#dc2626"}
      />
    </div>
  );
}
