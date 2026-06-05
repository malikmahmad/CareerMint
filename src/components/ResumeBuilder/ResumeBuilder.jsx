import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ResumeForm from "./ResumeForm";
import ResumePreview from "./ResumePreview";
import ThemeToggler from "../ThemeToggler/ThemeToggler";

const DEFAULT_STATE = {
  // Global formatting options
  formatting: {
    fontFamily: "Arial", // Arial, Times New Roman, Calibri, Georgia
    template: "ATS Friendly", // ATS Friendly, Modern, Professional, Executive
    accentColor: "darkgreen", // black, navy, darkgreen, darkgray
  },
  // Field-level formatting (stores bold/italic for each field)
  fieldFormatting: {},
  sectionNames: {
    personal: "Personal",
    education: "Education",
    experience: "Experience",
    projects: "Projects",
    skills: "Skills",
    additional: "Additional",
  },
  personal: {
    name: "",
    email: "",
    mobileNumber: "",
    location: "",
    linkedin: "",
    github: "",
    portfolio: "",
    summary: "",
  },
  education: [{ id: 0, collegeName: "", course: "", eduFrom: "", eduTo: "", gpa: "" }],
  experience: [{ id: 0, companyName: "", jobTitle: "", workFrom: "", workTo: "", workDescription: "" }],
  projects: [{ id: 0, projectName: "", projectTech: "", projectLink: "", projectDescription: "" }],
  skills: {
    frontendSkills: "",
    backendSkills: "",
    databaseSkills: "",
    otherSkills: "",
  },
  additional: {
    certifications: "",
    languages: "",
    awards: "",
    volunteering: "",
    interests: "",
    extraInfo: "",
  },
};

const ResumeBuilder = () => {
  const navigate = useNavigate();
  const [isMobileView, setIsMobileView] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [saved, setSaved] = useState(false);
  const [theme, setTheme] = useState(() => {
    const t = localStorage.getItem("careermint-theme");
    // If stored theme exists, return it
    if (t) return t;
    // Otherwise default to "system" so OS preference is used
    return "system";
  });

  const [userData, setUserData] = useState(DEFAULT_STATE);

  // Get actual theme value (resolve "system" to "dark" or "light")
  const getActualTheme = (themeValue) => {
    if (themeValue === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return themeValue;
  };

  // Apply theme and listen for system changes
  useEffect(() => {
    const actualTheme = getActualTheme(theme);
    document.documentElement.setAttribute("data-theme", actualTheme);
    localStorage.setItem("careermint-theme", theme);

    // If in system mode, listen for OS preference changes
    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => {
        const newActual = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", newActual);
      };
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [theme]);

  // Screen size
  useEffect(() => {
    const check = () => setIsMobileView(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Load draft
  useEffect(() => {
    const saved = localStorage.getItem("careermint-draft");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUserData({
          ...DEFAULT_STATE,
          ...parsed,
          personal: { ...DEFAULT_STATE.personal, ...(parsed.personal || {}) },
          skills: { ...DEFAULT_STATE.skills, ...(parsed.skills || {}) },
          additional: { ...DEFAULT_STATE.additional, ...(parsed.additional || {}) },
          education: Array.isArray(parsed.education) && parsed.education.length > 0
            ? parsed.education : DEFAULT_STATE.education,
          experience: Array.isArray(parsed.experience) && parsed.experience.length > 0
            ? parsed.experience : DEFAULT_STATE.experience,
          projects: Array.isArray(parsed.projects) && parsed.projects.length > 0
            ? parsed.projects : DEFAULT_STATE.projects,
        });
      } catch (e) {
        console.error("Error loading draft:", e);
      }
    }
  }, []);

  const updateBasicField = (section, fieldId, value) => {
    setUserData((prev) => ({
      ...prev,
      [section]: { ...(prev[section] || {}), [fieldId]: value },
    }));
  };

  const updateArrayField = (section, index, fieldId, value) => {
    setUserData((prev) => {
      if (!Array.isArray(prev[section])) return prev;
      const arr = [...prev[section]];
      arr[index] = { ...arr[index], [fieldId]: value };
      return { ...prev, [section]: arr };
    });
  };

  const addNewEntry = (section) => {
    setUserData((prev) => {
      if (!Array.isArray(prev[section])) return prev;
      const newId = prev[section].length > 0
        ? Math.max(...prev[section].map((i) => i.id || 0)) + 1 : 0;

      const templates = {
        education: { id: newId, collegeName: "", course: "", eduFrom: "", eduTo: "", gpa: "" },
        experience: { id: newId, companyName: "", jobTitle: "", workFrom: "", workTo: "", workDescription: "" },
        projects: { id: newId, projectName: "", projectTech: "", projectLink: "", projectDescription: "" },
      };

      return { ...prev, [section]: [...prev[section], templates[section] || { id: newId }] };
    });
  };

  const removeEntry = (section, index) => {
    setUserData((prev) => {
      if (!Array.isArray(prev[section]) || prev[section].length <= 1) return prev;
      const arr = [...prev[section]];
      arr.splice(index, 1);
      return { ...prev, [section]: arr };
    });
  };

  const updateSectionName = (section, newName) => {
    setUserData((prev) => ({
      ...prev,
      sectionNames: {
        ...prev.sectionNames,
        [section]: newName,
      },
    }));
  };

  const updateGlobalFormatting = (key, value) => {
    setUserData((prev) => ({
      ...prev,
      formatting: {
        ...prev.formatting,
        [key]: value,
      },
    }));
  };

  const updateFieldFormatting = (fieldPath, key, value) => {
    setUserData((prev) => ({
      ...prev,
      fieldFormatting: {
        ...prev.fieldFormatting,
        [fieldPath]: {
          ...(prev.fieldFormatting[fieldPath] || {}),
          [key]: value,
        },
      },
    }));
  };

  const getFieldFormatting = (fieldPath) => {
    return userData.fieldFormatting?.[fieldPath] || { isBold: false, isItalic: false };
  };

  const saveDraft = () => {
    try {
      localStorage.setItem("careermint-draft", JSON.stringify(userData));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error("Save error:", e);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg)",
        fontFamily: "var(--font-body)",
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          height: 52,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-card)",
          flexShrink: 0,
          zIndex: 20,
        }}
      >
        {/* Logo */}
        <button
          onClick={() => navigate("/")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "linear-gradient(135deg, #16a34a, #22c55e)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 900,
              fontSize: 13,
              fontFamily: "var(--font-display)",
            }}
          >
            C
          </div>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: 17,
              color: "var(--text-primary)",
            }}
          >
            Career<span style={{ color: "var(--accent)" }}>Mint</span>
          </span>
        </button>

        {/* Center: mobile toggle */}
        {isMobileView && (
          <div
            style={{
              display: "flex",
              background: "var(--bg-secondary)",
              borderRadius: 8,
              padding: 3,
              gap: 2,
            }}
          >
            {["Edit", "Preview"].map((label) => (
              <button
                key={label}
                onClick={() => setShowPreview(label === "Preview")}
                style={{
                  padding: "4px 14px",
                  borderRadius: 6,
                  border: "none",
                  background:
                    (label === "Preview") === showPreview
                      ? "var(--accent)"
                      : "transparent",
                  color:
                    (label === "Preview") === showPreview ? "white" : "var(--text-secondary)",
                  cursor: "pointer",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  fontFamily: "var(--font-body)",
                  transition: "all 0.2s",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Right actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {saved && (
            <span
              style={{
                fontSize: "0.75rem",
                color: "var(--accent)",
                fontWeight: 600,
                fontFamily: "var(--font-body)",
                display: "flex",
                alignItems: "center",
                gap: 4,
                animation: "fadeInUp 0.3s ease",
              }}
            >
              ✓ Saved
            </span>
          )}
          <ThemeToggler theme={theme} setTheme={setTheme} />
          <button
            onClick={() => navigate("/")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: "6px 12px",
              borderRadius: 8,
              border: "1.5px solid var(--border)",
              background: "transparent",
              color: "var(--text-secondary)",
              cursor: "pointer",
              fontSize: "0.78rem",
              fontWeight: 600,
              fontFamily: "var(--font-body)",
            }}
          >
            ← Home
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Form Panel */}
        <div
          style={{
            width: isMobileView ? "100%" : "45%",
            display: isMobileView ? (showPreview ? "none" : "flex") : "flex",
            flexDirection: "column",
            borderRight: "1px solid var(--border)",
            overflow: "hidden",
          }}
        >
          <ResumeForm
            userData={userData}
            updateBasicField={updateBasicField}
            updateArrayField={updateArrayField}
            addNewEntry={addNewEntry}
            removeEntry={removeEntry}
            updateSectionName={updateSectionName}
            updateGlobalFormatting={updateGlobalFormatting}
            updateFieldFormatting={updateFieldFormatting}
            getFieldFormatting={getFieldFormatting}
            saveDraft={saveDraft}
            isMobileView={isMobileView}
          />
        </div>

        {/* Preview Panel */}
        <div
          style={{
            width: isMobileView ? "100%" : "55%",
            display: isMobileView ? (showPreview ? "flex" : "none") : "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <ResumePreview userData={userData} getFieldFormatting={getFieldFormatting} />
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
