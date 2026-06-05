import { useState, useRef, useEffect } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import {
  Save,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  GripVertical,
  Settings,
} from "lucide-react";
import FormattingToolbar from "./FormattingToolbar";

const DEFAULT_SECTIONS = [
  {
    id: "personal",
    label: "Personal",
    icon: "👤",
    description: "Your contact details and personal information",
    fields: [
      { id: "name", label: "Full Name", type: "text", placeholder: "Your Full Name" },
      { id: "email", label: "Email Address", type: "email", placeholder: "you@example.com" },
      { id: "mobileNumber", label: "Phone Number", type: "tel", placeholder: "+92 300 0000000" },
      { id: "location", label: "Location", type: "text", placeholder: "City, Country" },
      { id: "linkedin", label: "LinkedIn URL", type: "url", placeholder: "https://linkedin.com/in/yourprofile" },
      { id: "github", label: "GitHub URL", type: "url", placeholder: "https://github.com/yourusername" },
      { id: "portfolio", label: "Portfolio / Website", type: "url", placeholder: "https://yourwebsite.com" },
      { id: "summary", label: "Professional Summary", type: "textarea", placeholder: "A brief summary of your professional background and key achievements..." },
    ],
  },
  {
    id: "education",
    label: "Education",
    icon: "🎓",
    description: "Your educational background and qualifications",
    canAddMultiple: true,
    multipleKey: "education",
    fields: [
      { id: "collegeName", label: "Institution Name", type: "text", placeholder: "University / College Name" },
      { id: "course", label: "Degree / Program", type: "text", placeholder: "Bachelor of Science in Computer Science" },
      { id: "eduFrom", label: "Start Year", type: "text", placeholder: "2020" },
      { id: "eduTo", label: "End Year", type: "text", placeholder: "2024 or Present" },
      { id: "gpa", label: "GPA / Grade (optional)", type: "text", placeholder: "3.8/4.0 or A+" },
    ],
  },
  {
    id: "experience",
    label: "Experience",
    icon: "💼",
    description: "Your professional work experience",
    canAddMultiple: true,
    multipleKey: "experience",
    fields: [
      { id: "companyName", label: "Company / Organization", type: "text", placeholder: "Company Name" },
      { id: "jobTitle", label: "Job Title / Role", type: "text", placeholder: "Software Engineer" },
      { id: "workFrom", label: "Start Date", type: "text", placeholder: "Jan 2022" },
      { id: "workTo", label: "End Date", type: "text", placeholder: "Dec 2023 or Present" },
      {
        id: "workDescription",
        label: "Key Responsibilities & Achievements",
        type: "textarea",
        placeholder: "• Developed a new feature that improved user retention by 30%\n• Led a team of 3 developers to build REST APIs\n• Optimized database queries reducing load time by 50%",
      },
    ],
  },
  {
    id: "projects",
    label: "Projects",
    icon: "🚀",
    description: "Notable personal or professional projects",
    canAddMultiple: true,
    multipleKey: "projects",
    fields: [
      { id: "projectName", label: "Project Name", type: "text", placeholder: "CareerMint Resume Builder" },
      { id: "projectTech", label: "Technologies Used", type: "text", placeholder: "React, Node.js, MongoDB, TailwindCSS" },
      { id: "projectLink", label: "Project URL / GitHub", type: "url", placeholder: "https://github.com/you/project" },
      {
        id: "projectDescription",
        label: "Description & Impact",
        type: "textarea",
        placeholder: "• Built a full-stack web app with real-time resume preview\n• Deployed on Vercel with CI/CD pipeline\n• Achieved 500+ active users in the first month",
      },
    ],
  },
  {
    id: "skills",
    label: "Skills",
    icon: "⚡",
    description: "Your technical and professional skills",
    fields: [
      { id: "frontendSkills", label: "Frontend / UI Skills", type: "text", placeholder: "React, Next.js, TypeScript, TailwindCSS, HTML, CSS" },
      { id: "backendSkills", label: "Backend / Server Skills", type: "text", placeholder: "Node.js, Express, Python, Django, REST APIs, GraphQL" },
      { id: "databaseSkills", label: "Database & Cloud", type: "text", placeholder: "MongoDB, PostgreSQL, MySQL, AWS, Firebase" },
      { id: "otherSkills", label: "Tools & Other Skills", type: "text", placeholder: "Git, Docker, Figma, Agile, Jira, Linux" },
    ],
  },
  {
    id: "additional",
    label: "Additional",
    icon: "✨",
    description: "Any extra information to strengthen your resume",
    fields: [
      { id: "certifications", label: "Certifications", type: "textarea", placeholder: "• AWS Certified Developer – Associate (2023)\n• Google Professional Cloud Developer (2022)" },
      { id: "languages", label: "Languages", type: "text", placeholder: "English (Fluent), Urdu (Native), Arabic (Basic)" },
      { id: "awards", label: "Awards & Achievements", type: "textarea", placeholder: "• Dean's List – 2022, 2023\n• Hackathon Winner – DevFest 2023" },
      { id: "volunteering", label: "Volunteering / Community", type: "textarea", placeholder: "• Mentor at CodeForGood (2022–present)\n• Open source contributor to React ecosystem" },
      { id: "interests", label: "Interests & Hobbies", type: "text", placeholder: "Open Source, Tech Blogging, Chess, Hiking" },
      { id: "extraInfo", label: "Any Other Information", type: "textarea", placeholder: "Add anything else that would strengthen your application..." },
    ],
  },
];

/* ─── FORM FIELD ─── */
const FormField = ({ field, value = "", onChange, section, fieldPath, getFieldFormatting, updateFieldFormatting }) => {
  const formatting = getFieldFormatting ? getFieldFormatting(fieldPath) : { isBold: false, isItalic: false };

  const handleBoldToggle = () => {
    if (updateFieldFormatting) {
      updateFieldFormatting(fieldPath, "isBold", !formatting.isBold);
    }
  };

  const handleItalicToggle = () => {
    if (updateFieldFormatting) {
      updateFieldFormatting(fieldPath, "isItalic", !formatting.isItalic);
    }
  };

  // Don't show formatting toolbar for end date fields
  const showFormattingToolbar = field.id !== "eduTo" && field.id !== "workTo";

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-semibold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}>
          {field.label}
        </label>
        <div className="flex items-center gap-3">
          {showFormattingToolbar && (field.type === "text" || field.type === "textarea") && (
            <FormattingToolbar
              isBold={formatting.isBold}
              isItalic={formatting.isItalic}
              onToggleBold={handleBoldToggle}
              onToggleItalic={handleItalicToggle}
            />
          )}
        </div>
      </div>
      {field.type === "textarea" ? (
        <textarea
          id={field.id}
          value={value}
          onChange={(e) => onChange(section, field.id, e.target.value)}
          placeholder={field.placeholder}
          className="resume-textarea"
        />
      ) : (
        <input
          id={field.id}
          type={field.type}
          value={value}
          onChange={(e) => onChange(section, field.id, e.target.value)}
          placeholder={field.placeholder}
          className="resume-input"
        />
      )}
    </div>
  );
};

/* ─── MULTIPLE ENTRIES ─── */
const MultipleEntryFields = ({ section, entries = [], sectionConfig, updateArrayField, addNewEntry, removeEntry, getFieldFormatting, updateFieldFormatting }) => {
  const safeEntries = Array.isArray(entries) ? entries : [];

  return (
    <>
      {safeEntries.map((entry, index) => (
        <div
          key={entry?.id ?? index}
          className="mb-6 pb-6"
          style={{ borderBottom: index < safeEntries.length - 1 ? "1px dashed var(--border)" : "none" }}
        >
          {safeEntries.length > 1 && (
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center"
                  style={{ background: "var(--accent)", fontFamily: "var(--font-display)" }}>
                  {index + 1}
                </span>
                <h4 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  {sectionConfig.label} #{index + 1}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => removeEntry(section, index)}
                className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors"
                style={{ color: "#ef4444", background: "#fef2f2", border: "1px solid #fecaca", cursor: "pointer", fontFamily: "var(--font-body)" }}
                disabled={safeEntries.length <= 1}
              >
                <Trash2 size={12} /> Remove
              </button>
            </div>
          )}
          {sectionConfig.fields.map((field) => (
            <FormField
              key={`${entry?.id ?? index}-${field.id}`}
              field={field}
              value={entry?.[field.id] || ""}
              onChange={(_, fieldId, val) => updateArrayField(section, index, fieldId, val)}
              section={section}
              fieldPath={`${section}[${index}].${field.id}`}
              getFieldFormatting={getFieldFormatting}
              updateFieldFormatting={updateFieldFormatting}
            />
          ))}
        </div>
      ))}
      <button
        type="button"
        onClick={() => addNewEntry(section)}
        className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all border-2 border-dashed w-full justify-center"
        style={{
          color: "var(--accent)",
          borderColor: "var(--accent)",
          background: "var(--accent-glow)",
          cursor: "pointer",
          fontFamily: "var(--font-body)",
        }}
      >
        <Plus size={16} />
        Add Another {sectionConfig.label}
      </button>
    </>
  );
};

/* ─── RESUME FORM ─── */
const ResumeForm = ({ userData, updateBasicField, updateArrayField, addNewEntry, removeEntry, updateSectionName, updateGlobalFormatting, updateFieldFormatting, getFieldFormatting, saveDraft, isMobileView }) => {
  const [selectedTab, setSelectedTab] = useState("personal");
  const scrollViewportRef = useRef(null);
  const sections = DEFAULT_SECTIONS;

  // Scroll to top when tab changes
  useEffect(() => {
    if (scrollViewportRef.current) {
      scrollViewportRef.current.scrollTop = 0;
    }
  }, [selectedTab]);

  const goToNextTab = () => {
    const idx = sections.findIndex((s) => s.id === selectedTab);
    if (idx < sections.length - 1) setSelectedTab(sections[idx + 1].id);
  };

  const goToPrevTab = () => {
    const idx = sections.findIndex((s) => s.id === selectedTab);
    if (idx > 0) setSelectedTab(sections[idx - 1].id);
  };

  const currentIndex = sections.findIndex((s) => s.id === selectedTab);
  const progress = ((currentIndex + 1) / sections.length) * 100;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      {/* Header - Removed for now, can be re-enabled later
      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", background: "var(--bg-card)" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-black" style={{ background: "linear-gradient(135deg, #16a34a, #22c55e)", fontFamily: "var(--font-display)", fontSize: 13 }}>C</div>
            <span className="font-black text-lg" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
              Career<span style={{ color: "var(--accent)" }}>Mint</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
              {currentIndex + 1} / {sections.length}
            </span>
          </div>
        </div>
        <div className="w-full h-1.5 rounded-full" style={{ background: "var(--border)" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: "linear-gradient(90deg, var(--accent-dark), var(--accent-light))" }}
          />
        </div>
      </div>
      */}

      {/* Global Formatting Controls */}
      <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)", background: "var(--bg-card)" }}>
        <div className="grid grid-cols-3 gap-4">
          {/* Font Family */}
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, fontFamily: "var(--font-body)" }}>
              Font
            </label>
            <select
              value={userData.formatting?.fontFamily || "Arial"}
              onChange={(e) => updateGlobalFormatting("fontFamily", e.target.value)}
              style={{
                width: "100%",
                padding: "6px 8px",
                fontSize: "0.875rem",
                borderRadius: 6,
                border: "1px solid var(--border)",
                background: "var(--bg)",
                color: "var(--text-primary)",
                fontFamily: "var(--font-body)",
                cursor: "pointer",
              }}
            >
              <option value="Arial">Arial</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Calibri">Calibri</option>
              <option value="Georgia">Georgia</option>
            </select>
          </div>

          {/* Template */}
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, fontFamily: "var(--font-body)" }}>
              Template
            </label>
            <select
              value={userData.formatting?.template || "ATS Friendly"}
              onChange={(e) => updateGlobalFormatting("template", e.target.value)}
              style={{
                width: "100%",
                padding: "6px 8px",
                fontSize: "0.875rem",
                borderRadius: 6,
                border: "1px solid var(--border)",
                background: "var(--bg)",
                color: "var(--text-primary)",
                fontFamily: "var(--font-body)",
                cursor: "pointer",
              }}
            >
              <option value="ATS Friendly">ATS Friendly</option>
              <option value="Modern">Modern</option>
              <option value="Professional">Professional</option>
              <option value="Executive">Executive</option>
            </select>
          </div>

          {/* Accent Color */}
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, fontFamily: "var(--font-body)" }}>
              Accent Color
            </label>
            <select
              value={userData.formatting?.accentColor || "darkgreen"}
              onChange={(e) => updateGlobalFormatting("accentColor", e.target.value)}
              style={{
                width: "100%",
                padding: "6px 8px",
                fontSize: "0.875rem",
                borderRadius: 6,
                border: "1px solid var(--border)",
                background: "var(--bg)",
                color: "var(--text-primary)",
                fontFamily: "var(--font-body)",
                cursor: "pointer",
              }}
            >
              <option value="black">Black</option>
              <option value="navy">Navy Blue</option>
              <option value="darkgreen">Dark Green</option>
              <option value="darkgray">Dark Gray</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs.Root value={selectedTab} onValueChange={setSelectedTab} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Tab list */}
        <div style={{ overflowX: "auto", borderBottom: "1px solid var(--border)", background: "var(--bg-card)" }}>
          <Tabs.List className="flex min-w-max px-4">
            {sections.map((section) => (
              <Tabs.Trigger
                key={section.id}
                value={section.id}
                style={{
                  padding: "10px 14px",
                  fontSize: "0.78rem",
                  fontWeight: selectedTab === section.id ? 700 : 500,
                  fontFamily: "var(--font-body)",
                  color: selectedTab === section.id ? "var(--accent)" : "var(--text-secondary)",
                  borderBottom: selectedTab === section.id ? "2px solid var(--accent)" : "2px solid transparent",
                  background: "transparent",
                  border: "none",
                  borderBottomWidth: 2,
                  borderBottomStyle: "solid",
                  borderBottomColor: selectedTab === section.id ? "var(--accent)" : "transparent",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  transition: "all 0.2s",
                }}
              >
                <span>{section.icon}</span>
                {section.label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: "hidden" }}>
          <ScrollArea.Root style={{ height: "100%" }}>
            <ScrollArea.Viewport ref={scrollViewportRef} style={{ height: "100%", padding: "20px" }}>
              {sections.map((section) => (
                <Tabs.Content key={section.id} value={section.id} style={{ outline: "none" }}>
                  <div
                    className="rounded-2xl p-5 mb-4"
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">{section.icon}</span>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={userData.sectionNames?.[section.id] || section.label}
                          onChange={(e) => updateSectionName(section.id, e.target.value)}
                          className="font-display font-bold text-base mb-1"
                          style={{
                            background: "transparent",
                            border: "1px solid var(--border)",
                            borderRadius: 6,
                            color: "var(--text-primary)",
                            padding: "6px 10px",
                            width: "100%",
                            fontFamily: "var(--font-display)",
                          }}
                          placeholder={section.label}
                        />
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{section.description}</p>
                      </div>
                    </div>

                    {/* Single fields */}
                    {!section.canAddMultiple && section.fields.map((field) => {
                      return (
                        <FormField
                          key={field.id}
                          field={field}
                          value={
                            section.id === "additional"
                              ? userData.additional?.[field.id] || ""
                              : section.id === "skills"
                              ? userData.skills?.[field.id] || ""
                              : userData[section.id]?.[field.id] || ""
                          }
                          onChange={updateBasicField}
                          section={section.id}
                          fieldPath={`${section.id}.${field.id}`}
                          getFieldFormatting={getFieldFormatting}
                          updateFieldFormatting={updateFieldFormatting}
                        />
                      );
                    })}

                    {/* Multiple entries */}
                    {section.canAddMultiple && (
                      <MultipleEntryFields
                        section={section.id}
                        entries={userData[section.id] || []}
                        sectionConfig={section}
                        updateArrayField={updateArrayField}
                        addNewEntry={addNewEntry}
                        removeEntry={removeEntry}
                        getFieldFormatting={getFieldFormatting}
                        updateFieldFormatting={updateFieldFormatting}
                      />
                    )}
                  </div>
                </Tabs.Content>
              ))}
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar orientation="vertical" style={{ width: 5, padding: 2, background: "var(--bg-secondary)" }}>
              <ScrollArea.Thumb style={{ background: "var(--accent)", borderRadius: 3 }} />
            </ScrollArea.Scrollbar>
          </ScrollArea.Root>
        </div>

        {/* Navigation */}
        <div
          style={{
            padding: "12px 20px",
            borderTop: "1px solid var(--border)",
            background: "var(--bg-card)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <button
            type="button"
            onClick={goToPrevTab}
            disabled={selectedTab === sections[0].id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: "8px 16px",
              borderRadius: 10,
              border: "1.5px solid var(--border)",
              background: "transparent",
              color: selectedTab === sections[0].id ? "var(--text-muted)" : "var(--text-primary)",
              cursor: selectedTab === sections[0].id ? "not-allowed" : "pointer",
              fontSize: "0.82rem",
              fontWeight: 600,
              fontFamily: "var(--font-body)",
              opacity: selectedTab === sections[0].id ? 0.5 : 1,
            }}
          >
            <ChevronLeft size={15} />
            Back
          </button>

          <button
            type="button"
            onClick={saveDraft}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: "8px 16px",
              borderRadius: 10,
              border: "1.5px solid var(--border)",
              background: "transparent",
              color: "var(--text-secondary)",
              cursor: "pointer",
              fontSize: "0.82rem",
              fontWeight: 600,
              fontFamily: "var(--font-body)",
            }}
          >
            <Save size={14} />
            Save
          </button>

          {selectedTab !== sections[sections.length - 1].id ? (
            <button
              type="button"
              onClick={goToNextTab}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "8px 16px",
                borderRadius: 10,
                border: "none",
                background: "linear-gradient(135deg, #16a34a, #22c55e)",
                color: "white",
                cursor: "pointer",
                fontSize: "0.82rem",
                fontWeight: 700,
                fontFamily: "var(--font-body)",
                boxShadow: "0 2px 10px rgba(22,163,74,0.3)",
              }}
            >
              Next
              <ChevronRight size={15} />
            </button>
          ) : (
            <span style={{ fontSize: "0.75rem", color: "var(--accent)", fontWeight: 700, fontFamily: "var(--font-body)" }}>
              ✓ All Done!
            </span>
          )}
        </div>
      </Tabs.Root>
    </div>
  );
};

export default ResumeForm;
