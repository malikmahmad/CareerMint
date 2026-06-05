import { useState, useRef } from "react";
import { Bold, Italic, Underline, Copy, RotateCcw } from "lucide-react";

const TextFormatter = ({ value = "", onChange, placeholder = "" }) => {
  const textareaRef = useRef(null);
  const [showFormatting, setShowFormatting] = useState(false);

  const applyFormatting = (type) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    if (!selectedText) {
      alert("Please select text to format");
      return;
    }

    let formattedText = selectedText;
    switch (type) {
      case "bold":
        formattedText = `**${selectedText}**`;
        break;
      case "italic":
        formattedText = `*${selectedText}*`;
        break;
      case "underline":
        formattedText = `__${selectedText}__`;
        break;
      default:
        break;
    }

    const newValue =
      value.substring(0, start) + formattedText + value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start;
      textarea.selectionEnd = start + formattedText.length;
    }, 0);
  };

  const insertFormattingMenu = (type) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || "text";

    let formattedText = selectedText;
    switch (type) {
      case "size":
        formattedText = `{SIZE:16}${selectedText}{/SIZE}`;
        break;
      case "color":
        formattedText = `{COLOR:#16a34a}${selectedText}{/COLOR}`;
        break;
      default:
        break;
    }

    const newValue =
      value.substring(0, start) + formattedText + value.substring(end);
    onChange(newValue);
  };

  const parseFormatting = (text) => {
    if (!text) return "";

    let formatted = text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/__(.*?)__/g, "<u>$1</u>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/{SIZE:(\d+)}(.*?){\/SIZE}/g, '<span style="font-size: $1px;">$2</span>')
      .replace(/{COLOR:(#[0-9a-fA-F]{6})}(.*?){\/COLOR}/g, '<span style="color: $1;">$2</span>');

    return formatted;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ position: "relative" }}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={5}
          className="resume-input"
          style={{
            resize: "vertical",
            fontFamily: "monospace",
            fontSize: "13px",
            width: "100%",
            border: "1px solid var(--border)",
            borderRadius: 6,
            padding: "10px",
            color: "var(--text-primary)",
            background: "var(--bg)",
          }}
        />

        {/* Formatting Toolbar */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            marginTop: 8,
            padding: "10px",
            background: "var(--bg-secondary)",
            borderRadius: 8,
            border: "1px solid var(--border)",
          }}
        >
          <button
            type="button"
            onClick={() => applyFormatting("bold")}
            title="Bold (Select text first)"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "6px 10px",
              borderRadius: 6,
              border: "1px solid var(--border)",
              background: "var(--bg-card)",
              color: "var(--text-primary)",
              cursor: "pointer",
              fontSize: "0.78rem",
              fontWeight: 600,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "var(--accent)";
              e.target.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "var(--bg-card)";
              e.target.style.color = "var(--text-primary)";
            }}
          >
            <Bold size={14} style={{ marginRight: 4 }} />
            Bold
          </button>

          <button
            type="button"
            onClick={() => applyFormatting("italic")}
            title="Italic (Select text first)"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "6px 10px",
              borderRadius: 6,
              border: "1px solid var(--border)",
              background: "var(--bg-card)",
              color: "var(--text-primary)",
              cursor: "pointer",
              fontSize: "0.78rem",
              fontWeight: 600,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "var(--accent)";
              e.target.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "var(--bg-card)";
              e.target.style.color = "var(--text-primary)";
            }}
          >
            <Italic size={14} style={{ marginRight: 4 }} />
            Italic
          </button>

          <button
            type="button"
            onClick={() => applyFormatting("underline")}
            title="Underline (Select text first)"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "6px 10px",
              borderRadius: 6,
              border: "1px solid var(--border)",
              background: "var(--bg-card)",
              color: "var(--text-primary)",
              cursor: "pointer",
              fontSize: "0.78rem",
              fontWeight: 600,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "var(--accent)";
              e.target.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "var(--bg-card)";
              e.target.style.color = "var(--text-primary)";
            }}
          >
            <Underline size={14} style={{ marginRight: 4 }} />
            Underline
          </button>

          <div style={{ display: "flex", gap: 4, alignItems: "center", marginLeft: "auto" }}>
            <button
              type="button"
              onClick={() => insertFormattingMenu("size")}
              title="Insert size tag"
              style={{
                padding: "6px 10px",
                borderRadius: 6,
                border: "1px solid var(--border)",
                background: "var(--bg-card)",
                color: "var(--text-primary)",
                cursor: "pointer",
                fontSize: "0.78rem",
                fontWeight: 600,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "var(--accent)";
                e.target.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "var(--bg-card)";
                e.target.style.color = "var(--text-primary)";
              }}
            >
              Size
            </button>

            <button
              type="button"
              onClick={() => insertFormattingMenu("color")}
              title="Insert color tag"
              style={{
                padding: "6px 10px",
                borderRadius: 6,
                border: "1px solid var(--border)",
                background: "var(--bg-card)",
                color: "var(--text-primary)",
                cursor: "pointer",
                fontSize: "0.78rem",
                fontWeight: 600,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "var(--accent)";
                e.target.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "var(--bg-card)";
                e.target.style.color = "var(--text-primary)";
              }}
            >
              Color
            </button>

            <button
              type="button"
              onClick={() => onChange("")}
              title="Clear formatting"
              style={{
                padding: "6px 10px",
                borderRadius: 6,
                border: "1px solid var(--border)",
                background: "var(--bg-card)",
                color: "var(--text-primary)",
                cursor: "pointer",
                fontSize: "0.78rem",
                fontWeight: 600,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "#ef4444";
                e.target.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "var(--bg-card)";
                e.target.style.color = "var(--text-primary)";
              }}
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 6, lineHeight: 1.5 }}>
          <strong>Formatting Guide:</strong>
          <div>• Select text then click <strong>Bold</strong> for <strong>bold text</strong></div>
          <div>• Select text then click <strong>Italic</strong> for <em>italic text</em></div>
          <div>• Select text then click <strong>Underline</strong> for <u>underlined text</u></div>
          <div>• Use <strong>Size</strong> to {"{SIZE:16}change text size{/SIZE}"}</div>
          <div>• Use <strong>Color</strong> to {"{COLOR:#16a34a}change color{/COLOR}"}</div>
        </div>
      </div>
    </div>
  );
};

const parseFormatting = (text) => {
  if (!text) return "";
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/__(.*?)__/g, "<u>$1</u>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/{SIZE:(\d+)}(.*?){\/SIZE}/g, '<span style="font-size: $1px;">$2</span>')
    .replace(/{COLOR:(#[0-9a-fA-F]{6})}(.*?){\/COLOR}/g, '<span style="color: $1;">$2</span>');
};

export { TextFormatter, parseFormatting };
export default TextFormatter;
