import { ExamOption } from "../components/ExamSelector";
import { Question } from "../types";

// Define available exams
export const availableExams: ExamOption[] = [
  {
    id: "random",
    label: "examSelector.randomQuestions",
    year: 0,
    season: "summer",
    path: "", // No path needed for random selection
  },
  {
    id: "2025-winter",
    label: "examSelector.officialExam2025",
    year: 2025,
    season: "summer",
    path: "/banks/2025/summer/medborgerskabsproeven.json",
  },
  {
    id: "2024-summer",
    label: "examSelector.officialExam2024",
    year: 2024,
    season: "summer",
    path: "/banks/2024/summer/medborgerskabsproeven.json",
  },
  {
    id: "2023-winter",
    label: "examSelector.officialExam2023",
    year: 2023,
    season: "winter",
    path: "/banks/2023/winter/medborgerskabsproeven.json",
  },
  {
    id: "2023-summer",
    label: "examSelector.officialExam2023",
    year: 2023,
    season: "summer",
    path: "/banks/2023/summer/medborgerskabsproeven.json",
  },
  {
    id: "2022-winter",
    label: "examSelector.officialExam2022",
    year: 2022,
    season: "winter",
    path: "/banks/2022/winter/medborgerskabsproeven.json",
  },
  {
    id: "2022-summer",
    label: "examSelector.officialExam2022",
    year: 2022,
    season: "summer",
    path: "/banks/2022/summer/medborgerskabsproeven.json",
  },
  {
    id: "2021-winter",
    label: "examSelector.officialExam2021",
    year: 2021,
    season: "winter",
    path: "/banks/2021/winter/medborgerskabsproeven.json",
  },
  {
    id: "2021-summer",
    label: "examSelector.officialExam2021",
    year: 2021,
    season: "summer",
    path: "/banks/2021/summer/medborgerskabsproeven.json",
  },
  {
    id: "2020-winter",
    label: "examSelector.officialExam2020",
    year: 2020,
    season: "winter",
    path: "/banks/2020/winter/medborgerskabsproeven.json",
  },
  {
    id: "2020-summer",
    label: "examSelector.officialExam2020",
    year: 2020,
    season: "summer",
    path: "/banks/2020/summer/medborgerskabsproeven.json",
  },
  {
    id: "2019-winter",
    label: "examSelector.officialExam2019",
    year: 2019,
    season: "winter",
    path: "/banks/2019/winter/medborgerskabsproeven.json",
  },
  {
    id: "2019-summer",
    label: "examSelector.officialExam2019",
    year: 2019,
    season: "summer",
    path: "/banks/2019/summer/medborgerskabsproeven.json",
  },
  {
    id: "2018-winter",
    label: "examSelector.officialExam2018",
    year: 2018,
    season: "winter",
    path: "/banks/2018/winter/medborgerskabsproeven.json",
  },
  {
    id: "2018-summer",
    label: "examSelector.officialExam2018",
    year: 2018,
    season: "summer",
    path: "/banks/2018/summer/medborgerskabsproeven.json",
  },
  {
    id: "2017-winter",
    label: "examSelector.officialExam2017",
    year: 2017,
    season: "winter",
    path: "/banks/2017/winter/medborgerskabsproeven.json",
  },
  {
    id: "2017-summer",
    label: "examSelector.officialExam2017",
    year: 2017,
    season: "summer",
    path: "/banks/2017/summer/medborgerskabsproeven.json",
  },
  {
    id: "2016-winter",
    label: "examSelector.officialExam2016",
    year: 2016,
    season: "winter",
    path: "/banks/2016/winter/medborgerskabsproeven.json",
  },
];

// Get a specific exam by ID
export const getExamById = (examId: string): ExamOption | undefined => {
  return availableExams.find((exam) => exam.id === examId);
};

// Dynamically import an exam from its path
export const loadExam = async (examOption: ExamOption): Promise<Question[]> => {
  if (examOption.id === "random") {
    // For random questions, we'll generate a mix from different exams
    return generateRandomExamQuestions();
  }

  try {
    // Using dynamic import based on the exam's year and season
    const examModule = await import(
      `../banks/${examOption.year}/${examOption.season}/medborgerskabsproeven.json`
    );
    return examModule.default;
  } catch (error) {
    console.error(`Failed to load exam ${examOption.id}:`, error);
    return [];
  }
};

/**
 * Generates a random set of 25 questions from different years and seasons
 * @returns Promise<Question[]> A promise that resolves to an array of 25 randomly selected questions
 */
export const generateRandomExamQuestions = async (): Promise<Question[]> => {
  try {
    // Get all exam options except the random one
    const examOptions = availableExams.filter((exam) => exam.id !== "random");

    // Define how many questions we want in total
    const totalQuestionsNeeded = 25;

    // We'll select questions from all exams and then shuffle and pick 25 total

    // Load all questions from all exams
    const allQuestionsPromises = examOptions.map(async (exam) => {
      try {
        const questions = await import(
          `../banks/${exam.year}/${exam.season}/medborgerskabsproeven.json`
        );
        return questions.default.map((q: Question) => ({
          ...q,
          source: `${exam.year} ${exam.season}`, // Add source metadata for tracking
        }));
      } catch (error) {
        console.error(`Failed to load exam ${exam.id}:`, error);
        return [];
      }
    });

    const allQuestionsArrays = await Promise.all(allQuestionsPromises);

    // Flatten and deduplicate questions (using the question text as a unique identifier)
    const uniqueQuestions = Array.from(
      new Map(allQuestionsArrays.flat().map((q) => [q.question, q])).values()
    );

    // Shuffle the questions
    const shuffledQuestions = [...uniqueQuestions].sort(
      () => Math.random() - 0.5
    );

    // Take the first 25 questions (or all if less than 25)
    return shuffledQuestions.slice(0, totalQuestionsNeeded);
  } catch (error) {
    console.error("Error generating random exam questions:", error);
    return [];
  }
};
