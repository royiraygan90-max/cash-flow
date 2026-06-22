interface Props {
  net: number;
}

function fmt(n: number): string {
  return Math.round(n).toLocaleString("he-IL");
}

export default function NetCard({ net }: Props) {
  return (
    <div
      style={{
        background: "linear-gradient(150deg, #0f1d18, #0c1714)",
        border: "1px solid #1c3a2e",
        borderRadius: 24,
        padding: 24,
        textAlign: "center",
        marginBottom: 12,
      }}
    >
      <p style={{ fontSize: 12, color: "#5f8a76", marginBottom: 8, fontFamily: "Rubik, sans-serif" }}>
        שכר נטו
      </p>
      <p
        style={{
          fontSize: 42,
          fontWeight: 600,
          color: "#34e0a1",
          fontFamily: "Rubik, sans-serif",
          lineHeight: 1,
          direction: "ltr",
          display: "inline-block",
        }}
      >
        ₪{fmt(net)}
      </p>
      <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
        <span
          style={{
            padding: "5px 14px",
            borderRadius: 99,
            background: "rgba(52,224,161,.12)",
            color: "#9fd9c2",
            fontSize: 12,
            fontFamily: "Rubik, sans-serif",
            fontWeight: 500,
          }}
        >
          מוזן לתחזית
        </span>
      </div>
    </div>
  );
}
