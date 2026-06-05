import { Bold, Italic } from "lucide-react";

const FormattingToolbar = ({ isBold, isItalic, onToggleBold, onToggleItalic }) => {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      <button
        type="button"
        onClick={onToggleBold}
        title="Toggle Bold"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 32,
          height: 32,
          padding: 0,
          borderRadius: 6,
          border: `1.5px solid ${isBold ? "var(--accent)" : "var(--border)"}`,
          background: isBold ? "var(--accent-glow)" : "transparent",
          color: isBold ? "var(--accent)" : "var(--text-secondary)",
          cursor: "pointer",
          transition: "all 0.2s",
          fontWeight: 700,
          fontSize: "0.9rem",
        }}
        onMouseEnter={(e) => {
          e.target.style.borderColor = "var(--accent)";
          e.target.style.color = "var(--accent)";
        }}
        onMouseLeave={(e) => {
          e.target.style.borderColor = isBold ? "var(--accent)" : "var(--border)";
          e.target.style.color = isBold ? "var(--accent)" : "var(--text-secondary)";
        }}
      >
        <Bold size={14} />
      </button>

      <button
        type="button"
        onClick={onToggleItalic}
        title="Toggle Italic"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 32,
          height: 32,
          padding: 0,
          borderRadius: 6,
          border: `1.5px solid ${isItalic ? "var(--accent)" : "var(--border)"}`,
          background: isItalic ? "var(--accent-glow)" : "transparent",
          color: isItalic ? "var(--accent)" : "var(--text-secondary)",
          cursor: "pointer",
          transition: "all 0.2s",
          fontStyle: "italic",
          fontSize: "0.9rem",
          fontWeight: 600,
        }}
        onMouseEnter={(e) => {
          e.target.style.borderColor = "var(--accent)";
          e.target.style.color = "var(--accent)";
        }}
        onMouseLeave={(e) => {
          e.target.style.borderColor = isItalic ? "var(--accent)" : "var(--border)";
          e.target.style.color = isItalic ? "var(--accent)" : "var(--text-secondary)";
        }}
      >
        <Italic size={14} />
      </button>
    </div>
  );
};

export default FormattingToolbar;
