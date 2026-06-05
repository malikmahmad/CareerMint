import { StyleSheet } from "@react-pdf/renderer";

// PDF Styles
export const pdfStyles = StyleSheet.create({
  page: {
    flexDirection: "column",
    padding: 30,
    fontFamily: "Arial",
    fontSize: 11,
  },
  section: {
    marginBottom: 10,
  },
  header: {
    marginBottom: 20,
    textAlign: "center",
  },
  headerName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  headerContact: {
    fontSize: 10,
    marginBottom: 3,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#cccccc",
    paddingBottom: 2,
  },
  entryContainer: {
    marginBottom: 8,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  entryTitle: {
    fontSize: 11,
    fontWeight: "bold",
  },
  entrySubtitle: {
    fontSize: 10,
    fontStyle: "italic",
  },
  entryDate: {
    fontSize: 10,
    textAlign: "right",
  },
  bulletList: {
    marginLeft: 10,
    marginTop: 4,
  },
  bulletItem: {
    flexDirection: "row",
    marginBottom: 2,
  },
  bulletPoint: {
    width: 10,
    fontSize: 10,
  },
  bulletText: {
    fontSize: 10,
    flex: 1,
  },
  skillsSection: {
    marginTop: 4,
  },
  skillCategory: {
    flexDirection: "row",
    marginBottom: 3,
  },
  skillCategoryTitle: {
    fontSize: 10,
    fontWeight: "bold",
    width: 80,
  },
  skillList: {
    fontSize: 10,
    flex: 1,
  },
  link: {
    color: "blue",
    textDecoration: "underline",
  },
});
