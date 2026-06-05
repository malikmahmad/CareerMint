import { useNavigate } from "react-router-dom";

export default function ErrorPage() {
  const navigate = useNavigate();
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
        fontFamily: "var(--font-body)",
        textAlign: "center",
        padding: 24,
      }}
    >
      <div style={{ fontSize: 80, marginBottom: 16 }}>404</div>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 32,
          fontWeight: 900,
          color: "var(--text-primary)",
          marginBottom: 12,
        }}
      >
        Page Not Found
      </h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: 32, maxWidth: 400 }}>
        Oops! The page you're looking for doesn't exist. Let's get you back to building your resume.
      </p>
      <button
        onClick={() => navigate("/")}
        style={{
          background: "linear-gradient(135deg, #16a34a, #22c55e)",
          color: "white",
          border: "none",
          borderRadius: 12,
          padding: "12px 28px",
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "1rem",
          cursor: "pointer",
          boxShadow: "0 4px 16px rgba(22,163,74,0.3)",
        }}
      >
        ← Back to Home
      </button>
    </div>
  );
}
