import { useState, useRef, useEffect } from "react";

const themes = [
  {
    value: "light",
    label: "Light",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
    ),
  },
  {
    value: "dark",
    label: "Dark",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    ),
  },
  {
    value: "system",
    label: "System",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
];

export default function ThemeToggler({ theme, setTheme }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  /* Close dropdown on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const choose = (value) => {
    setTheme(value);
    setOpen(false);
  };

  const current = themes.find((t) => t.value === theme) || themes[0];

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        title="Toggle theme"
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "7px 12px", borderRadius: 10,
          border: "1.5px solid var(--border)", background: "var(--bg-card)",
          color: "var(--text-secondary)", cursor: "pointer",
          fontSize: "0.8rem", fontWeight: 500, fontFamily: "var(--font-body)",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
      >
        {current.icon}
        <span className="hidden sm:inline">{current.label}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          style={{ marginLeft: 2, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0)" }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0,
          background: "var(--bg-card)", border: "1.5px solid var(--border)",
          borderRadius: 12, boxShadow: "var(--shadow-md)", overflow: "hidden",
          minWidth: 130, zIndex: 200, animation: "slideDown 0.2s ease",
        }}>
          {themes.map((t) => (
            <button
              key={t.value}
              onClick={() => choose(t.value)}
              style={{
                display: "flex", alignItems: "center", gap: 8, width: "100%",
                padding: "9px 14px",
                background: theme === t.value ? "var(--accent-glow)" : "transparent",
                border: "none",
                color: theme === t.value ? "var(--accent)" : "var(--text-secondary)",
                cursor: "pointer", fontSize: "0.85rem",
                fontWeight: theme === t.value ? 600 : 400,
                fontFamily: "var(--font-body)", textAlign: "left", transition: "background 0.15s",
              }}
              onMouseEnter={(e) => { if (theme !== t.value) e.currentTarget.style.background = "var(--bg-secondary)"; }}
              onMouseLeave={(e) => { if (theme !== t.value) e.currentTarget.style.background = "transparent"; }}
            >
              {t.icon}
              {t.label}
              {theme === t.value && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: "auto" }}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
