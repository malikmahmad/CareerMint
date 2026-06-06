import { memo, useMemo, useState, useRef, useEffect } from "react";
import { Download, FileText, File } from "lucide-react";
import { Document, Page, Text, View, Link, pdf, StyleSheet } from "@react-pdf/renderer";

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

const ACCENT_COLORS = {
  black: "#000000",
  navy: "#001f3f",
  darkgreen: "#16a34a",
  darkgray: "#4b5563",
};

const TEMPLATES = {
  "ATS Friendly": {
    accentColor: ACCENT_COLORS.darkgray,
    dividerColor: ACCENT_COLORS.darkgray,
    heading: { color: ACCENT_COLORS.darkgray, borderColor: ACCENT_COLORS.darkgray },
    spacing: { section: 16, entry: 10, item: 6 },
    showDivider: true,
    dividerStyle: "line", // line or none
  },
  Modern: {
    accentColor: ACCENT_COLORS.darkgreen,
    dividerColor: ACCENT_COLORS.darkgreen,
    heading: { color: ACCENT_COLORS.darkgreen, borderColor: ACCENT_COLORS.darkgreen },
    spacing: { section: 18, entry: 12, item: 7 },
    showDivider: true,
    dividerStyle: "line",
  },
  Professional: {
    accentColor: ACCENT_COLORS.navy,
    dividerColor: ACCENT_COLORS.navy,
    heading: { color: ACCENT_COLORS.navy, borderColor: ACCENT_COLORS.navy },
    spacing: { section: 16, entry: 10, item: 6 },
    showDivider: true,
    dividerStyle: "line",
  },
  Executive: {
    accentColor: ACCENT_COLORS.darkgray,
    dividerColor: ACCENT_COLORS.navy,
    heading: { color: ACCENT_COLORS.navy, borderColor: ACCENT_COLORS.navy },
    spacing: { section: 20, entry: 14, item: 8 },
    showDivider: true,
    dividerStyle: "line",
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

const getTemplate = (templateName, accentColorKey) => {
  const template = { ...TEMPLATES[templateName] || TEMPLATES["ATS Friendly"] };
  const accentColor = ACCENT_COLORS[accentColorKey] || ACCENT_COLORS.darkgreen;
  template.accentColor = accentColor;
  template.heading.color = accentColor;
  template.heading.borderColor = accentColor;
  template.dividerColor = accentColor;
  return template;
};

const escapeXml = (str) => {
  if (!str) return "";
  return str.replace(/[<>&'"]/g, (c) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    '"': "&quot;",
  }[c]));
};

const parseBullets = (text) => {
  if (!text) return [];
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => (l.startsWith("•") ? l.slice(1).trim() : l));
};

// Helper function to extract label and ensure URL is valid
const getLinkInfo = (url) => {
  if (!url) return null;
  
  let label = "Link";
  let href = url;
  
  // Add https if not present
  if (!href.startsWith("http://") && !href.startsWith("https://")) {
    href = "https://" + href;
  }
  
  // Extract label from URL
  if (url.toLowerCase().includes("linkedin")) {
    label = "LinkedIn";
  } else if (url.toLowerCase().includes("github")) {
    label = "GitHub";
  } else {
    // For all other URLs (portfolio, personal websites, etc), show as "Portfolio"
    label = "Portfolio";
  }
  
  return { label, href };
};

// ═══════════════════════════════════════════════════════════════════════════════
// HTML PREVIEW COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const ResumeHTMLPreview = ({ userData, getFieldFormatting }) => {
  const formatting = userData.formatting || {
    fontFamily: "Arial",
    template: "ATS Friendly",
    accentColor: "darkgreen",
  };
  const template = getTemplate(formatting.template, formatting.accentColor);
  const getFormatting = (fieldPath) =>
    getFieldFormatting ? getFieldFormatting(fieldPath) : { isBold: false, isItalic: false };

  const TextElement = ({ text, fieldPath, style = {} }) => {
    const fmt = getFormatting(fieldPath);
    return (
      <span
        style={{
          fontWeight: fmt.isBold ? 700 : 400,
          fontStyle: fmt.isItalic ? "italic" : "normal",
          ...style,
        }}
      >
        {text}
      </span>
    );
  };

  return (
    <div
      style={{
        fontFamily: formatting.fontFamily,
        padding: 40,
        maxWidth: 800,
        margin: "0 auto",
        background: "white",
        color: "#1a1a1a",
        lineHeight: 1.6,
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px 0", color: "#000000" }}>
          <TextElement text={userData.personal?.name || "Your Name"} fieldPath="personal.name" />
        </h1>

        {/* Contact Info - Single Line */}
        <div style={{ fontSize: 10, color: "#4b5563", marginBottom: 12 }}>
          {(userData.personal?.email || userData.personal?.mobileNumber || userData.personal?.location) && (
            <div>
              {userData.personal?.email && (
                <TextElement text={userData.personal.email} fieldPath="personal.email" />
              )}
              {userData.personal?.mobileNumber && (
                <>
                  {userData.personal?.email && " · "}
                  <TextElement text={userData.personal.mobileNumber} fieldPath="personal.mobileNumber" />
                </>
              )}
              {userData.personal?.location && (
                <>
                  {(userData.personal?.email || userData.personal?.mobileNumber) && " · "}
                  <TextElement text={userData.personal.location} fieldPath="personal.location" />
                </>
              )}
            </div>
          )}
        </div>

        {/* Links */}
        {(userData.personal?.linkedin || userData.personal?.github || userData.personal?.portfolio) && (
          <div
            style={{
              fontSize: 10,
              color: template.accentColor,
              borderBottom: `1.5px solid ${template.accentColor}`,
              paddingBottom: 8,
              marginBottom: 12,
              display: "flex",
              justifyContent: "center",
              gap: 16,
            }}
          >
            {userData.personal?.linkedin && (
              <a
                href={getLinkInfo(userData.personal.linkedin)?.href || "#"}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: template.accentColor,
                  textDecoration: "none",
                  cursor: "pointer",
                  fontSize: 10,
                }}
              >
                <TextElement text={getLinkInfo(userData.personal.linkedin)?.label || "LinkedIn"} fieldPath="personal.linkedin" />
              </a>
            )}
            {userData.personal?.github && (
              <a
                href={getLinkInfo(userData.personal.github)?.href || "#"}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: template.accentColor,
                  textDecoration: "none",
                  cursor: "pointer",
                  fontSize: 10,
                }}
              >
                <TextElement text={getLinkInfo(userData.personal.github)?.label || "GitHub"} fieldPath="personal.github" />
              </a>
            )}
            {userData.personal?.portfolio && (
              <a
                href={getLinkInfo(userData.personal.portfolio)?.href || "#"}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: template.accentColor,
                  textDecoration: "none",
                  cursor: "pointer",
                  fontSize: 10,
                }}
              >
                <TextElement text={getLinkInfo(userData.personal.portfolio)?.label || "Portfolio"} fieldPath="personal.portfolio" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Professional Summary Section */}
      {userData.personal?.summary && (
        <div style={{ marginBottom: template.spacing.section }}>
          <h3
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: template.heading.color,
              borderBottom: `1.5px solid ${template.heading.borderColor}`,
              paddingBottom: 6,
              marginBottom: 10,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Professional Summary
          </h3>
          <div
            style={{
              fontSize: 10.5,
              color: "#374151",
              textAlign: "left",
              lineHeight: 1.5,
            }}
          >
            <TextElement text={userData.personal.summary} fieldPath="personal.summary" />
          </div>
        </div>
      )}

      {/* Education Section */}
      {userData.education?.some((e) => e.collegeName) && (
        <div style={{ marginBottom: template.spacing.section }}>
          <h3
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: template.heading.color,
              borderBottom: `1.5px solid ${template.heading.borderColor}`,
              paddingBottom: 6,
              marginBottom: 10,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            {userData.sectionNames?.education || "EDUCATION"}
          </h3>
          {userData.education
            .filter((e) => e.collegeName)
            .map((edu, idx) => (
              <div key={idx} style={{ marginBottom: template.spacing.entry }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#000000" }}>
                      <TextElement text={edu.collegeName} fieldPath={`education[${idx}].collegeName`} />
                    </div>
                    {edu.course && (
                      <div style={{ fontSize: 11, color: "#4b5563", marginTop: 2 }}>
                        <TextElement text={edu.course} fieldPath={`education[${idx}].course`} />
                      </div>
                    )}
                  </div>
                  {edu.eduFrom && (
                    <div style={{ fontSize: 10, color: "#6b7280", textAlign: "right", fontStyle: "italic" }}>
                      <TextElement
                        text={`${edu.eduFrom} – ${edu.eduTo || "Present"}`}
                        fieldPath={`education[${idx}].eduFrom`}
                      />
                    </div>
                  )}
                </div>
                {edu.gpa && (
                  <div style={{ fontSize: 10, color: "#6b7280", marginTop: 4 }}>
                    GPA: <TextElement text={edu.gpa} fieldPath={`education[${idx}].gpa`} />
                  </div>
                )}
              </div>
            ))}
        </div>
      )}

      {/* Experience Section */}
      {userData.experience?.some((e) => e.companyName || e.jobTitle) && (
        <div style={{ marginBottom: template.spacing.section }}>
          <h3
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: template.heading.color,
              borderBottom: `1.5px solid ${template.heading.borderColor}`,
              paddingBottom: 6,
              marginBottom: 10,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            {userData.sectionNames?.experience || "EXPERIENCE"}
          </h3>
          {userData.experience
            .filter((e) => e.companyName || e.jobTitle)
            .map((exp, idx) => (
              <div key={idx} style={{ marginBottom: template.spacing.entry }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    {exp.jobTitle && (
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#000000" }}>
                        <TextElement text={exp.jobTitle} fieldPath={`experience[${idx}].jobTitle`} />
                      </div>
                    )}
                    {exp.companyName && (
                      <div style={{ fontSize: 11, color: "#4b5563", marginTop: 2 }}>
                        <TextElement text={exp.companyName} fieldPath={`experience[${idx}].companyName`} />
                      </div>
                    )}
                  </div>
                  {exp.workFrom && (
                    <div style={{ fontSize: 10, color: "#6b7280", textAlign: "right", fontStyle: "italic" }}>
                      <TextElement
                        text={`${exp.workFrom} – ${exp.workTo || "Present"}`}
                        fieldPath={`experience[${idx}].workFrom`}
                      />
                    </div>
                  )}
                </div>
                {exp.workDescription && (
                  <ul style={{ fontSize: 10.5, color: "#374151", marginTop: 6, paddingLeft: 16 }}>
                    {parseBullets(exp.workDescription).map((bullet, bidx) => (
                      <li key={bidx} style={{ marginBottom: template.spacing.item }}>
                        <TextElement text={bullet} fieldPath={`experience[${idx}].workDescription`} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
        </div>
      )}

      {/* Projects Section */}
      {userData.projects?.some((p) => p.projectName) && (
        <div style={{ marginBottom: template.spacing.section }}>
          <h3
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: template.heading.color,
              borderBottom: `1.5px solid ${template.heading.borderColor}`,
              paddingBottom: 6,
              marginBottom: 10,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            {userData.sectionNames?.projects || "PROJECTS"}
          </h3>
          {userData.projects
            .filter((p) => p.projectName)
            .map((proj, idx) => (
              <div key={idx} style={{ marginBottom: template.spacing.entry }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#000000" }}>
                  <TextElement text={proj.projectName} fieldPath={`projects[${idx}].projectName`} />
                </div>
                {proj.projectTech && (
                  <div style={{ fontSize: 10, color: "#4b5563", marginTop: 2 }}>
                    <TextElement text={proj.projectTech} fieldPath={`projects[${idx}].projectTech`} />
                  </div>
                )}
                {proj.projectLink && (
                  <div style={{ fontSize: 10, color: template.accentColor, marginTop: 2 }}>
                    <TextElement text={proj.projectLink} fieldPath={`projects[${idx}].projectLink`} />
                  </div>
                )}
                {proj.projectDescription && (
                  <ul style={{ fontSize: 10.5, color: "#374151", marginTop: 6, paddingLeft: 16 }}>
                    {parseBullets(proj.projectDescription).map((bullet, bidx) => (
                      <li key={bidx} style={{ marginBottom: template.spacing.item }}>
                        <TextElement text={bullet} fieldPath={`projects[${idx}].projectDescription`} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
        </div>
      )}

      {/* Skills Section */}
      {(userData.skills?.frontendSkills ||
        userData.skills?.backendSkills ||
        userData.skills?.databaseSkills ||
        userData.skills?.otherSkills) && (
        <div style={{ marginBottom: template.spacing.section }}>
          <h3
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: template.heading.color,
              borderBottom: `1.5px solid ${template.heading.borderColor}`,
              paddingBottom: 6,
              marginBottom: 10,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            {userData.sectionNames?.skills || "SKILLS"}
          </h3>
          <div style={{ fontSize: 10.5, color: "#374151" }}>
            {userData.skills?.frontendSkills && (
              <div style={{ marginBottom: 6 }}>
                <span style={{ fontWeight: 700 }}>Frontend: </span>
                <TextElement text={userData.skills.frontendSkills} fieldPath="skills.frontendSkills" />
              </div>
            )}
            {userData.skills?.backendSkills && (
              <div style={{ marginBottom: 6 }}>
                <span style={{ fontWeight: 700 }}>Backend: </span>
                <TextElement text={userData.skills.backendSkills} fieldPath="skills.backendSkills" />
              </div>
            )}
            {userData.skills?.databaseSkills && (
              <div style={{ marginBottom: 6 }}>
                <span style={{ fontWeight: 700 }}>Database: </span>
                <TextElement text={userData.skills.databaseSkills} fieldPath="skills.databaseSkills" />
              </div>
            )}
            {userData.skills?.otherSkills && (
              <div>
                <span style={{ fontWeight: 700 }}>Other: </span>
                <TextElement text={userData.skills.otherSkills} fieldPath="skills.otherSkills" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Additional Section */}
      {(userData.additional?.certifications ||
        userData.additional?.languages ||
        userData.additional?.awards ||
        userData.additional?.volunteering ||
        userData.additional?.interests ||
        userData.additional?.extraInfo) && (
        <div>
          <h3
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: template.heading.color,
              borderBottom: `1.5px solid ${template.heading.borderColor}`,
              paddingBottom: 6,
              marginBottom: 10,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            {userData.sectionNames?.additional || "ADDITIONAL"}
          </h3>
          <div style={{ fontSize: 10.5, color: "#374151" }}>
            {userData.additional?.certifications && (
              <div style={{ marginBottom: 10 }}>
                <h4 style={{ fontSize: 11, fontWeight: 700, color: "#000000", marginBottom: 4 }}>Certifications</h4>
                <ul style={{ paddingLeft: 16, margin: 0 }}>
                  {parseBullets(userData.additional.certifications).map((bullet, bidx) => (
                    <li key={bidx} style={{ marginBottom: 4 }}>
                      <TextElement text={bullet} fieldPath="additional.certifications" />
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {userData.additional?.languages && (
              <div style={{ marginBottom: 10 }}>
                <h4 style={{ fontSize: 11, fontWeight: 700, color: "#000000", marginBottom: 4 }}>Languages</h4>
                <div>
                  <TextElement text={userData.additional.languages} fieldPath="additional.languages" />
                </div>
              </div>
            )}
            {userData.additional?.awards && (
              <div style={{ marginBottom: 10 }}>
                <h4 style={{ fontSize: 11, fontWeight: 700, color: "#000000", marginBottom: 4 }}>Awards</h4>
                <ul style={{ paddingLeft: 16, margin: 0 }}>
                  {parseBullets(userData.additional.awards).map((bullet, bidx) => (
                    <li key={bidx} style={{ marginBottom: 4 }}>
                      <TextElement text={bullet} fieldPath="additional.awards" />
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {userData.additional?.volunteering && (
              <div style={{ marginBottom: 10 }}>
                <h4 style={{ fontSize: 11, fontWeight: 700, color: "#000000", marginBottom: 4 }}>Volunteering</h4>
                <ul style={{ paddingLeft: 16, margin: 0 }}>
                  {parseBullets(userData.additional.volunteering).map((bullet, bidx) => (
                    <li key={bidx} style={{ marginBottom: 4 }}>
                      <TextElement text={bullet} fieldPath="additional.volunteering" />
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {userData.additional?.interests && (
              <div style={{ marginBottom: 10 }}>
                <h4 style={{ fontSize: 11, fontWeight: 700, color: "#000000", marginBottom: 4 }}>Interests</h4>
                <div>
                  <TextElement text={userData.additional.interests} fieldPath="additional.interests" />
                </div>
              </div>
            )}
            {userData.additional?.extraInfo && (
              <div>
                <h4 style={{ fontSize: 11, fontWeight: 700, color: "#000000", marginBottom: 4 }}>Additional Info</h4>
                <div>
                  <TextElement text={userData.additional.extraInfo} fieldPath="additional.extraInfo" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// PDF EXPORT COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const ResumePDF = ({ userData, getFieldFormatting }) => {
  const formatting = userData.formatting || {
    fontFamily: "Helvetica",
    template: "ATS Friendly",
    accentColor: "darkgreen",
  };
  const template = getTemplate(formatting.template, formatting.accentColor);

  const fontFamilyMap = {
    "Times New Roman": "Times-Roman",
    Arial: "Helvetica",
    Calibri: "Courier",
    Georgia: "Times-Roman",
  };
  const fontFamily = fontFamilyMap[formatting.fontFamily] || "Helvetica";

  const pdfStyles = StyleSheet.create({
    page: { padding: 40, fontFamily, fontSize: 10, color: "#1a1a1a" },
    header: { marginBottom: 20, textAlign: "center" },
    name: { fontSize: 18, fontWeight: "bold", marginBottom: 8, color: "#000000" },
    contact: { fontSize: 10, color: "#4b5563", marginBottom: 12 },
    summary: { fontSize: 10.5, fontStyle: "italic", color: "#374151", marginTop: 8, marginBottom: 4 },
    summaryText: { fontSize: 10.5, color: "#374151", marginBottom: template.spacing.section, textAlign: "left", lineHeight: 1.5 },
    section: { marginBottom: template.spacing.section },
    sectionTitle: {
      fontSize: 14,
      fontWeight: "bold",
      color: template.heading.color,
      borderBottomWidth: 1.5,
      borderBottomColor: template.heading.borderColor,
      paddingBottom: 6,
      marginBottom: 10,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    entry: { marginBottom: template.spacing.entry },
    entryTitle: { fontSize: 12, fontWeight: "bold", color: "#000000" },
    entrySubtitle: { fontSize: 11, color: "#4b5563", marginTop: 2 },
    entryDate: { fontSize: 10, color: "#6b7280" },
    bullet: { fontSize: 10.5, color: "#374151", marginLeft: 12, marginBottom: template.spacing.item },
  });

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.header}>
          <Text style={pdfStyles.name}>{userData.personal?.name || "Your Name"}</Text>
          {(userData.personal?.email || userData.personal?.mobileNumber || userData.personal?.location) && (
            <Text style={pdfStyles.contact}>
              {userData.personal?.email}
              {userData.personal?.email && userData.personal?.mobileNumber ? " · " : ""}
              {userData.personal?.mobileNumber}
              {(userData.personal?.email || userData.personal?.mobileNumber) && userData.personal?.location ? " · " : ""}
              {userData.personal?.location}
            </Text>
          )}
          {(userData.personal?.linkedin || userData.personal?.github || userData.personal?.portfolio) && (
            <Text style={[pdfStyles.contact, { borderBottomWidth: 1, borderBottomColor: template.accentColor, paddingBottom: 6, marginBottom: 8, marginTop: -4 }]}>
              {userData.personal?.linkedin && (
                <Link src={getLinkInfo(userData.personal.linkedin)?.href || "#"}>
                  {getLinkInfo(userData.personal.linkedin)?.label || "LinkedIn"}
                </Link>
              )}
              {userData.personal?.linkedin && userData.personal?.github ? "  " : ""}
              {userData.personal?.github && (
                <Link src={getLinkInfo(userData.personal.github)?.href || "#"}>
                  {getLinkInfo(userData.personal.github)?.label || "GitHub"}
                </Link>
              )}
              {(userData.personal?.linkedin || userData.personal?.github) && userData.personal?.portfolio ? "  " : ""}
              {userData.personal?.portfolio && (
                <Link src={getLinkInfo(userData.personal.portfolio)?.href || "#"}>
                  {getLinkInfo(userData.personal.portfolio)?.label || "Portfolio"}
                </Link>
              )}
            </Text>
          )}
        </View>

        {userData.personal?.summary && (
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>PROFESSIONAL SUMMARY</Text>
            <Text style={pdfStyles.summaryText}>{userData.personal.summary}</Text>
          </View>
        )}

        {userData.education?.some((e) => e.collegeName) && (
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>{userData.sectionNames?.education || "EDUCATION"}</Text>
            {userData.education
              .filter((e) => e.collegeName)
              .map((edu, idx) => (
                <View key={idx} style={pdfStyles.entry}>
                  <Text style={pdfStyles.entryTitle}>{edu.collegeName}</Text>
                  {edu.course && <Text style={pdfStyles.entrySubtitle}>{edu.course}</Text>}
                  {edu.eduFrom && (
                    <Text style={pdfStyles.entryDate}>
                      {edu.eduFrom} – {edu.eduTo || "Present"}
                    </Text>
                  )}
                  {edu.gpa && <Text style={pdfStyles.entryDate}>GPA: {edu.gpa}</Text>}
                </View>
              ))}
          </View>
        )}

        {userData.experience?.some((e) => e.companyName || e.jobTitle) && (
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>{userData.sectionNames?.experience || "EXPERIENCE"}</Text>
            {userData.experience
              .filter((e) => e.companyName || e.jobTitle)
              .map((exp, idx) => (
                <View key={idx} style={pdfStyles.entry}>
                  {exp.jobTitle && <Text style={pdfStyles.entryTitle}>{exp.jobTitle}</Text>}
                  {exp.companyName && <Text style={pdfStyles.entrySubtitle}>{exp.companyName}</Text>}
                  {exp.workFrom && (
                    <Text style={pdfStyles.entryDate}>
                      {exp.workFrom} – {exp.workTo || "Present"}
                    </Text>
                  )}
                  {exp.workDescription &&
                    parseBullets(exp.workDescription).map((bullet, bidx) => (
                      <Text key={bidx} style={pdfStyles.bullet}>
                        • {bullet}
                      </Text>
                    ))}
                </View>
              ))}
          </View>
        )}

        {userData.projects?.some((p) => p.projectName) && (
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>{userData.sectionNames?.projects || "PROJECTS"}</Text>
            {userData.projects
              .filter((p) => p.projectName)
              .map((proj, idx) => (
                <View key={idx} style={pdfStyles.entry}>
                  <Text style={pdfStyles.entryTitle}>{proj.projectName}</Text>
                  {proj.projectTech && <Text style={pdfStyles.entrySubtitle}>{proj.projectTech}</Text>}
                  {proj.projectLink && <Text style={pdfStyles.entryDate}>{proj.projectLink}</Text>}
                  {proj.projectDescription &&
                    parseBullets(proj.projectDescription).map((bullet, bidx) => (
                      <Text key={bidx} style={pdfStyles.bullet}>
                        • {bullet}
                      </Text>
                    ))}
                </View>
              ))}
          </View>
        )}

        {(userData.skills?.frontendSkills ||
          userData.skills?.backendSkills ||
          userData.skills?.databaseSkills ||
          userData.skills?.otherSkills) && (
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>{userData.sectionNames?.skills || "SKILLS"}</Text>
            {userData.skills?.frontendSkills && (
              <Text style={[pdfStyles.entry, { marginBottom: 4 }]}>
                <Text style={{ fontWeight: "bold" }}>Frontend: </Text>
                {userData.skills.frontendSkills}
              </Text>
            )}
            {userData.skills?.backendSkills && (
              <Text style={[pdfStyles.entry, { marginBottom: 4 }]}>
                <Text style={{ fontWeight: "bold" }}>Backend: </Text>
                {userData.skills.backendSkills}
              </Text>
            )}
            {userData.skills?.databaseSkills && (
              <Text style={[pdfStyles.entry, { marginBottom: 4 }]}>
                <Text style={{ fontWeight: "bold" }}>Database: </Text>
                {userData.skills.databaseSkills}
              </Text>
            )}
            {userData.skills?.otherSkills && (
              <Text style={pdfStyles.entry}>
                <Text style={{ fontWeight: "bold" }}>Other: </Text>
                {userData.skills.otherSkills}
              </Text>
            )}
          </View>
        )}

        {(userData.additional?.certifications ||
          userData.additional?.languages ||
          userData.additional?.awards ||
          userData.additional?.volunteering ||
          userData.additional?.interests ||
          userData.additional?.extraInfo) && (
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>{userData.sectionNames?.additional || "ADDITIONAL"}</Text>
            {userData.additional?.certifications && (
              <View style={pdfStyles.entry}>
                <Text style={{ fontWeight: "bold", marginBottom: 4 }}>Certifications</Text>
                {parseBullets(userData.additional.certifications).map((bullet, bidx) => (
                  <Text key={bidx} style={pdfStyles.bullet}>
                    • {bullet}
                  </Text>
                ))}
              </View>
            )}
            {userData.additional?.languages && (
              <View style={pdfStyles.entry}>
                <Text style={{ fontWeight: "bold", marginBottom: 4 }}>Languages</Text>
                <Text style={{ fontSize: 10.5, color: "#374151" }}>{userData.additional.languages}</Text>
              </View>
            )}
            {userData.additional?.awards && (
              <View style={pdfStyles.entry}>
                <Text style={{ fontWeight: "bold", marginBottom: 4 }}>Awards</Text>
                {parseBullets(userData.additional.awards).map((bullet, bidx) => (
                  <Text key={bidx} style={pdfStyles.bullet}>
                    • {bullet}
                  </Text>
                ))}
              </View>
            )}
            {userData.additional?.volunteering && (
              <View style={pdfStyles.entry}>
                <Text style={{ fontWeight: "bold", marginBottom: 4 }}>Volunteering</Text>
                {parseBullets(userData.additional.volunteering).map((bullet, bidx) => (
                  <Text key={bidx} style={pdfStyles.bullet}>
                    • {bullet}
                  </Text>
                ))}
              </View>
            )}
            {userData.additional?.interests && (
              <View style={pdfStyles.entry}>
                <Text style={{ fontWeight: "bold", marginBottom: 4 }}>Interests</Text>
                <Text style={{ fontSize: 10.5, color: "#374151" }}>{userData.additional.interests}</Text>
              </View>
            )}
            {userData.additional?.extraInfo && (
              <View style={pdfStyles.entry}>
                <Text style={{ fontWeight: "bold", marginBottom: 4 }}>Additional Info</Text>
                <Text style={{ fontSize: 10.5, color: "#374151" }}>{userData.additional.extraInfo}</Text>
              </View>
            )}
          </View>
        )}
      </Page>
    </Document>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// WORD EXPORT FUNCTION (RTF Format)
// ═══════════════════════════════════════════════════════════════════════════════

const generateWordDoc = (userData) => {
  const p = userData.personal || {};
  const formatting = userData.formatting || { fontFamily: "Arial", template: "ATS Friendly", accentColor: "darkgreen" };

  let rtf = `{\\rtf1\\ansi\\ansicpg1252\\cocoartf2\n\\cf0\n{\\colortbl;\\red255\\green255\\blue255;}\n{\\*\\expandedcolortbl;;}\n{\\fonttbl\\f0\\fswiss ${formatting.fontFamily};}\n{\\colortbl;\\red0\\green0\\blue0;}\\margl1440\\margr1440\\margtsxn1440\\margbsxn1440\\mghdr720\\mgft720\\marglsxn1440\\margrsxn1440\n\\vieww12240\\viewh15840\\viewkind4\n\\pard\\f0\\fs22`;

  // Name
  rtf += `\\pard\\qc\\fs44\\b ${rtfEscape(p.name || "Your Name")}\\b0\\fs22\n`;

  // Contact info
  if (p.email || p.mobileNumber || p.location) {
    rtf += `\\pard\\qc\\fs20`;
    let contact = "";
    if (p.email) contact += rtfEscape(p.email);
    if (p.mobileNumber) contact += (contact ? " · " : "") + rtfEscape(p.mobileNumber);
    if (p.location) contact += (contact ? " · " : "") + rtfEscape(p.location);
    rtf += `${contact}\\par\n`;
    rtf += `\\fs22\\par\n`;
  }

  // Links
  if (p.linkedin || p.github || p.portfolio) {
    rtf += `\\pard\\qc\\fs20`;
    if (p.linkedin) {
      const linkedinInfo = getLinkInfo(p.linkedin);
      rtf += `{\\field{\\*\\fldinst{HYPERLINK "${linkedinInfo?.href || "#"}"}} {\\fldrslt ${rtfEscape(linkedinInfo?.label || "LinkedIn")}}}`;
    }
    if (p.github) {
      const githubInfo = getLinkInfo(p.github);
      rtf += (p.linkedin ? "  " : "") + `{\\field{\\*\\fldinst{HYPERLINK "${githubInfo?.href || "#"}"}} {\\fldrslt ${rtfEscape(githubInfo?.label || "GitHub")}}}`;
    }
    if (p.portfolio) {
      const portfolioInfo = getLinkInfo(p.portfolio);
      rtf += ((p.linkedin || p.github) ? "  " : "") + `{\\field{\\*\\fldinst{HYPERLINK "${portfolioInfo?.href || "#"}"}} {\\fldrslt ${rtfEscape(portfolioInfo?.label || "Portfolio")}}}`;
    }
    rtf += `\\par\n`;
    rtf += `\\fs22\\par\n`;
  }

  // Summary with heading
  if (p.summary) {
    rtf += `\\pard\\b\\fs24 PROFESSIONAL SUMMARY\\b0\\fs22\\par`;
    rtf += `${rtfEscape(p.summary)}\\par\\par\n`;
  }

  // Education
  if (userData.education?.some((e) => e.collegeName)) {
    rtf += `\\pard\\b\\fs24 ${rtfEscape(userData.sectionNames?.education || "EDUCATION")}\\b0\\fs22\\par\\pard\n`;
    userData.education.filter((e) => e.collegeName).forEach((edu) => {
      rtf += `\\b${rtfEscape(edu.collegeName)}\\b0\\par\n`;
      if (edu.course) rtf += `${rtfEscape(edu.course)}\\par\n`;
      if (edu.eduFrom) rtf += `\\i${rtfEscape(edu.eduFrom)} \\endash  ${rtfEscape(edu.eduTo || "Present")}\\i0\\par\n`;
      if (edu.gpa) rtf += `GPA: ${rtfEscape(edu.gpa)}\\par\n`;
      rtf += `\\par\n`;
    });
  }

  // Experience
  if (userData.experience?.some((e) => e.companyName || e.jobTitle)) {
    rtf += `\\pard\\b\\fs24 ${rtfEscape(userData.sectionNames?.experience || "EXPERIENCE")}\\b0\\fs22\\par\\pard\n`;
    userData.experience.filter((e) => e.companyName || e.jobTitle).forEach((exp) => {
      if (exp.jobTitle) rtf += `\\b${rtfEscape(exp.jobTitle)}\\b0\\par\n`;
      if (exp.companyName) rtf += `${rtfEscape(exp.companyName)}\\par\n`;
      if (exp.workFrom) rtf += `\\i${rtfEscape(exp.workFrom)} \\endash  ${rtfEscape(exp.workTo || "Present")}\\i0\\par\n`;
      if (exp.workDescription) {
        parseBullets(exp.workDescription).forEach((b) => {
          rtf += `\\bullet ${rtfEscape(b)}\\par\n`;
        });
      }
      rtf += `\\par\n`;
    });
  }

  // Projects
  if (userData.projects?.some((p) => p.projectName)) {
    rtf += `\\pard\\b\\fs24 ${rtfEscape(userData.sectionNames?.projects || "PROJECTS")}\\b0\\fs22\\par\\pard\n`;
    userData.projects.filter((p) => p.projectName).forEach((proj) => {
      rtf += `\\b${rtfEscape(proj.projectName)}\\b0\\par\n`;
      if (proj.projectTech) rtf += `${rtfEscape(proj.projectTech)}\\par\n`;
      if (proj.projectLink) rtf += `${rtfEscape(proj.projectLink)}\\par\n`;
      if (proj.projectDescription) {
        parseBullets(proj.projectDescription).forEach((b) => {
          rtf += `\\bullet ${rtfEscape(b)}\\par\n`;
        });
      }
      rtf += `\\par\n`;
    });
  }

  // Skills
  if (userData.skills?.frontendSkills || userData.skills?.backendSkills || userData.skills?.databaseSkills || userData.skills?.otherSkills) {
    rtf += `\\pard\\b\\fs24 ${rtfEscape(userData.sectionNames?.skills || "SKILLS")}\\b0\\fs22\\par\\pard\n`;
    if (userData.skills?.frontendSkills) rtf += `\\b Frontend:\\b0  ${rtfEscape(userData.skills.frontendSkills)}\\par\n`;
    if (userData.skills?.backendSkills) rtf += `\\b Backend:\\b0  ${rtfEscape(userData.skills.backendSkills)}\\par\n`;
    if (userData.skills?.databaseSkills) rtf += `\\b Database:\\b0  ${rtfEscape(userData.skills.databaseSkills)}\\par\n`;
    if (userData.skills?.otherSkills) rtf += `\\b Other:\\b0  ${rtfEscape(userData.skills.otherSkills)}\\par\n`;
    rtf += `\\par\n`;
  }

  // Additional
  if (userData.additional?.certifications || userData.additional?.languages || userData.additional?.awards || userData.additional?.volunteering || userData.additional?.interests || userData.additional?.extraInfo) {
    rtf += `\\pard\\b\\fs24 ${rtfEscape(userData.sectionNames?.additional || "ADDITIONAL")}\\b0\\fs22\\par\\pard\n`;
    if (userData.additional?.certifications) {
      rtf += `\\b Certifications:\\b0\\par\n`;
      parseBullets(userData.additional.certifications).forEach((b) => {
        rtf += `\\bullet ${rtfEscape(b)}\\par\n`;
      });
    }
    if (userData.additional?.languages) rtf += `\\b Languages:\\b0  ${rtfEscape(userData.additional.languages)}\\par\n`;
    if (userData.additional?.awards) {
      rtf += `\\b Awards:\\b0\\par\n`;
      parseBullets(userData.additional.awards).forEach((b) => {
        rtf += `\\bullet ${rtfEscape(b)}\\par\n`;
      });
    }
    if (userData.additional?.volunteering) {
      rtf += `\\b Volunteering:\\b0\\par\n`;
      parseBullets(userData.additional.volunteering).forEach((b) => {
        rtf += `\\bullet ${rtfEscape(b)}\\par\n`;
      });
    }
    if (userData.additional?.interests) rtf += `\\b Interests:\\b0  ${rtfEscape(userData.additional.interests)}\\par\n`;
    if (userData.additional?.extraInfo) rtf += `\\b Additional Info:\\b0  ${rtfEscape(userData.additional.extraInfo)}\\par\n`;
  }

  rtf += `}`;
  return rtf;
};

const rtfEscape = (str) => {
  if (!str) return "";
  return str
    .replace(/\\/g, "\\\\")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/"/g, '\\"')
    .replace(/[\u0100-\uffff]/g, (ch) => `\\u${ch.charCodeAt(0)}?`);
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const ResumePreview = memo(({ userData, getFieldFormatting, fullscreen = false }) => {
  const [downloading, setDownloading] = useState(null);
  const previewRef = useRef(null);

  // Scroll to top on mount
  useEffect(() => {
    if (previewRef.current) {
      previewRef.current.scrollTop = 0;
    }
  }, []);

  // Only scroll on actual content changes, NOT formatting/styling changes
  const contentSnapshot = useMemo(() => JSON.stringify({
    personal: {
      name: userData.personal?.name,
      email: userData.personal?.email,
      mobileNumber: userData.personal?.mobileNumber,
      location: userData.personal?.location,
      linkedin: userData.personal?.linkedin,
      github: userData.personal?.github,
      portfolio: userData.personal?.portfolio,
      summary: userData.personal?.summary,
    },
    education: userData.education,
    experience: userData.experience,
    projects: userData.projects,
    skills: userData.skills,
    additional: userData.additional,
    sectionNames: userData.sectionNames,
  }), [userData.personal?.name, userData.personal?.email, userData.personal?.mobileNumber, 
       userData.personal?.location, userData.personal?.linkedin, userData.personal?.github,
       userData.personal?.portfolio, userData.personal?.summary,
       userData.education, userData.experience, userData.projects, userData.skills, 
       userData.additional, userData.sectionNames]);

  useEffect(() => {
    setTimeout(() => {
      if (previewRef.current) {
        previewRef.current.scrollTop = previewRef.current.scrollHeight - previewRef.current.clientHeight;
      }
    }, 0);
  }, [contentSnapshot]);

  const downloadPDF = async () => {
    setDownloading("pdf");
    try {
      const doc = <ResumePDF userData={userData} getFieldFormatting={getFieldFormatting} />;
      const asPdf = pdf();
      asPdf.updateContainer(doc);
      const blob = await asPdf.toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const userName = userData.personal?.name || "resume";
      link.download = `${userName}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF export error:", error);
    } finally {
      setDownloading(null);
    }
  };

  const downloadWord = () => {
    setDownloading("word");
    try {
      const docContent = generateWordDoc(userData);
      const blob = new Blob([docContent], {
        type: "application/rtf",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const userName = userData.personal?.name || "resume";
      link.download = `${userName}.doc`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Word export error:", error);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg)",
        overflow: "hidden",
      }}
    >
      {/* Toolbar - hidden in fullscreen */}
      {!fullscreen && (
        <div
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid var(--border)",
            background: "var(--bg-card)",
            display: "flex",
            gap: 8,
          }}
        >
          <button
            onClick={downloadPDF}
            disabled={downloading === "pdf"}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 12px",
              borderRadius: 6,
              border: "1px solid var(--border)",
              background: "var(--bg)",
              color: "var(--text-primary)",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontFamily: "var(--font-body)",
              opacity: downloading === "pdf" ? 0.6 : 1,
            }}
          >
            <FileText size={16} /> {downloading === "pdf" ? "Exporting..." : "Download PDF"}
          </button>
          <button
            onClick={downloadWord}
            disabled={downloading === "word"}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 12px",
              borderRadius: 6,
              border: "1px solid var(--border)",
              background: "var(--bg)",
              color: "var(--text-primary)",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontFamily: "var(--font-body)",
              opacity: downloading === "word" ? 0.6 : 1,
            }}
          >
            <File size={16} /> {downloading === "word" ? "Exporting..." : "Download DOCX"}
          </button>
        </div>
      )}

      {/* Preview */}
      <div
        ref={previewRef}
        style={{
          flex: 1,
          overflowY: "auto",
          background: fullscreen ? "var(--bg-secondary)" : "#f5f5f5",
          padding: fullscreen ? 0 : "16px",
        }}
      >
        <ResumeHTMLPreview userData={userData} getFieldFormatting={getFieldFormatting} />
      </div>
    </div>
  );
});

export default ResumePreview;
