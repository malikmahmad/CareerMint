import { GoogleGenerativeAI } from "@google/generative-ai";

export const getData = (originalData, userData, key) => {
  let updatedData = {};
  originalData.forEach((eachInfo) => {
    if (eachInfo.id === key) {
      Object.values(eachInfo.data).forEach((values) => {
        values.forEach((value) => {
          const id = value.id.split("#")[1];
          const workKey = value.id.split("#")[0];
          if (id) {
            updatedData[id] = {
              ...(updatedData[id] || {}),
              [workKey]: userData[value.id],
            };
          } else {
            updatedData["1"] = {
              ...(updatedData["1"] || {}),
              [workKey]: userData[value.id],
            };
          }
        });
      });
    }
  });

  return updatedData;
};

export const getArrayOfFieldsData = (updatedData) => {
  const data = Object.values(updatedData).map((values) => {
    const eachData = {};
    let subtitles = [];
    let dates = [];
    for (let [key, value] of Object.entries(values)) {
      if (key === "workRole") {
        subtitles[0] = value;
      }
      if (key === "workCompanyName") {
        subtitles[1] = value;
      }
      if (key === "workFrom") {
        dates[0] = value;
      }
      if (key === "workTo") {
        dates[1] = value;
      }
      if (key === "workData") {
        const cleanedData = value?.replace(/```json|```/g, "") || "[]";
        eachData.workData = JSON.parse(cleanedData);
      }
    }
    eachData.subtitles = [subtitles.join(" | ")];
    eachData.dates = [dates.join(" - ")];
    return eachData;
  });

  return data;
};

export const getArrayOfProjectsData = (projectData) => {
  const data = Object.values(projectData).map((values) => {
    const eachData = {
      subtitles: [`${values.projectName} | ${values.projectSkills}`],
      link: values.projectLink,
    };
    if (values.description) {
      const cleanedData =
        values.description?.replace(/```json|```/g, "") || "[]";
      eachData.description = JSON.parse(cleanedData);
    }
    return eachData;
  });

  return data;
};

const generatePrompt = (value, key) => {
  const prompt = `Act as a specialized career consultant and resume expert. Your focus is crafting highly targeted resumes optimized for applicant tracking systems (ATS). Analyze the provided job description focus and candidate data to generate at least 4 impactful resume bullet points.
  **Input:**
  * **Job description focus:** ${key}
  * **Candidate data:** ${value}
  **Output:**
  Return an exact array of strings, where each string is a concise and compelling resume bullet point addressing the job description focus based on the candidate data. Do not include any additional text, explanations, or formatting—only return the raw array of strings.`;
  return prompt;
};

export const handleGenerate = async (
  id,
  parentId,
  value,
  setValue,
  setLoading
) => {
  if (!value) return "Please add summary";
  setLoading(true);

  const prompt = generatePrompt(value, parentId);

  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const result = await model.generateContent(prompt);

  setLoading(false);

  setValue(id, result.response.text());
};
