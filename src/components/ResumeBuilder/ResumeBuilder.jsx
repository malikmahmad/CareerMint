import { useState, useEffect, useRef } from "react";
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
  const [showFullscreenPreview, setShowFullscreenPreview] = useState(false);
  const [shouldShowAllDone, setShouldShowAllDone] = useState(false);
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

  // Browser back behavior for overlays:
  // Back closes Fullscreen Preview first, then All Done overlay.
  // Only after both are closed, allow navigation to exit builder.
  const didPushBackStateRef = useRef(false);
  useEffect(() => {
    const shouldIntercept = showFullscreenPreview || shouldShowAllDone;

    if (shouldIntercept) {
      if (!didPushBackStateRef.current) {
        didPushBackStateRef.current = true;
        // Push a history entry so browser back triggers popstate instead of leaving the route.
        window.history.pushState({ careerMintBuilderOverlay: true }, "");
      }

      const onPopState = () => {
        // Close in priority order: fullscreen preview -> all done overlay.
        if (showFullscreenPreview) {
          setShowFullscreenPreview(false);
        } else if (shouldShowAllDone) {
          setShouldShowAllDone(false);
        }

        // After closing overlays, allow the next back press to exit the builder.
        if (!showFullscreenPreview && !shouldShowAllDone) {
          didPushBackStateRef.current = false;
        }

        // If we still have an overlay open after handling, immediately keep the user on the page
        // by pushing another state.
        if (showFullscreenPreview || shouldShowAllDone) {
          window.history.pushState({ careerMintBuilderOverlay: true }, "");
        }
      };

      window.addEventListener("popstate", onPopState);
      return () => window.removeEventListener("popstate", onPopState);
    }

    // No overlays open: reset ref so future overlay opens work correctly.
    didPushBackStateRef.current = false;
    return;
  }, [showFullscreenPreview, shouldShowAllDone]);


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

  // Check if resume has meaningful content
  const hasContent = () => {
    return (
      userData.personal.name?.trim() &&
      (userData.personal.email?.trim() || userData.personal.mobileNumber?.trim()) &&
      (userData.education.some(e => e.collegeName?.trim()) ||
       userData.experience.some(e => e.companyName?.trim()) ||
       userData.projects.some(p => p.projectName?.trim()) ||
       userData.skills.frontendSkills?.trim())
    );
  };

  // Fullscreen preview modal component
  const FullscreenPreview = () => {
    return (
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "var(--bg)",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
      }}>
        {/* Header */}
        <div style={{
          height: 52,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-card)",
          flexShrink: 0,
        }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 18, color: "var(--text-primary)", margin: 0 }}>
            Resume Preview
          </h2>
          <button
            onClick={() => setShowFullscreenPreview(false)}
            style={{
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
            ← Back
          </button>
        </div>

        {/* Resume content - full width */}
        <div style={{ flex: 1, overflow: "auto", background: "var(--bg-secondary)" }}>
          <div style={{ maxWidth: 900, margin: "40px auto", background: "var(--bg-card)", padding: 40, borderRadius: 12 }}>
            <ResumePreview userData={userData} getFieldFormatting={getFieldFormatting} fullscreen={true} />
          </div>
        </div>
      </div>
    );
  };

  // "All Done" screen
  const AllDoneScreen = () => {
    return (
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "linear-gradient(135deg, var(--bg), var(--bg-secondary))",
        zIndex: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(10px)",
      }}>
        <div style={{
          background: "var(--bg-card)",
          padding: 40,
          borderRadius: 20,
          maxWidth: 500,
          textAlign: "center",
          boxShadow: "var(--shadow-lg)",
          border: "1px solid var(--border)",
          animation: "slideUp 0.4s ease",
        }}>
          {/* Checkmark animation */}
          <div style={{
            width: 80,
            height: 80,
            background: "linear-gradient(135deg, var(--accent-dark), var(--accent-light))",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            fontSize: 40,
            animation: "popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}>
            ✓
          </div>

          <h1 style={{
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            fontSize: 32,
            color: "var(--text-primary)",
            margin: "0 0 12px 0",
          }}>
            All Done!
          </h1>

          <p style={{
            fontSize: 16,
            color: "var(--text-secondary)",
            margin: "0 0 32px 0",
            lineHeight: 1.6,
          }}>
            Your resume is ready. Preview it below or download as PDF/Word to get started with your job search.
          </p>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 12, flexDirection: "column" }}>
            <button
              onClick={() => {
                setShowFullscreenPreview(true);
              }}
              style={{
                padding: "12px 24px",
                borderRadius: 10,
                border: "none",
                background: "linear-gradient(135deg, var(--accent-dark), var(--accent))",
                color: "white",
                fontWeight: 600,
                fontSize: 15,
                fontFamily: "var(--font-body)",
                cursor: "pointer",
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) => e.target.style.transform = "scale(1.02)"}
              onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
            >
              👁️ Preview Full Resume
            </button>

            <button
              onClick={() => setShouldShowAllDone(false)}
              style={{
                padding: "12px 24px",
                borderRadius: 10,
                border: "1.5px solid var(--border)",
                background: "transparent",
                color: "var(--text-secondary)",
                fontWeight: 600,
                fontSize: 15,
                fontFamily: "var(--font-body)",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "var(--bg-secondary)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "transparent";
              }}
            >
              ← Continue Editing
            </button>
          </div>

          <style>{`
            @keyframes popIn {
              0% { transform: scale(0); opacity: 0; }
              50% { transform: scale(1.1); }
              100% { transform: scale(1); opacity: 1; }
            }
            @keyframes slideUp {
              0% { transform: translateY(30px); opacity: 0; }
              100% { transform: translateY(0); opacity: 1; }
            }
          `}</style>
        </div>
      </div>
    );
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
      {/* Fullscreen Preview Modal */}
      {showFullscreenPreview && <FullscreenPreview />}

      {/* All Done Screen */}
      {shouldShowAllDone && <AllDoneScreen />}

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
          {hasContent() && (
            <button
              onClick={() => setShouldShowAllDone(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "6px 12px",
                borderRadius: 8,
                background: "linear-gradient(135deg, var(--accent-dark), var(--accent))",
                color: "white",
                cursor: "pointer",
                fontSize: "0.78rem",
                fontWeight: 600,
                fontFamily: "var(--font-body)",
                border: "none",
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"}
              onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
            >
              ✓ All Done
            </button>
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
