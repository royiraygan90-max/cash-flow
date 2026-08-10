interface PageProps {
  searchParams: { e?: string };
}

export default function WelcomePage({ searchParams }: PageProps) {
  const invalid = searchParams.e === "invalid";

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--bg-primary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        direction: "rtl",
      }}
    >
      <div
        style={{
          background: "#11151b",
          border: "1px solid #1b212a",
          borderRadius: 20,
          padding: "40px 28px",
          maxWidth: 420,
          width: "100%",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: "#f2f5f8",
            fontFamily: "Rubik, sans-serif",
            marginBottom: 12,
          }}
        >
          מאזן חודשי
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "#9aa6b4",
            fontFamily: "Rubik, sans-serif",
            lineHeight: 1.7,
          }}
        >
          {invalid
            ? "הקישור שבו השתמשת אינו תקין. בדוק שהעתקת אותו במלואו, או פנה למי ששלח לך אותו."
            : "כדי להשתמש באפליקציה צריך קישור אישי. אם קיבלת קישור ממישהו, פתח אותו כדי להתחבר."}
        </p>
      </div>
    </main>
  );
}
