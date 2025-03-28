import { ExamOption } from '../components/ExamSelector';
import { Question } from '../types';

// Define available exams
export const availableExams: ExamOption[] = [
  {
    id: 'random',
    label: 'Random Questions (All Topics)',
    year: 0,
    season: 'summer',
    path: '' // No path needed for random selection
  },
  {
    id: '2024-winter',
    label: 'Official Exam 2024',
    year: 2024,
    season: 'winter',
    path: '/banks/2024/winter/medborgerskabsproeven_2024_11_full.json'
  },
  {
    id: '2024-summer',
    label: 'Official Exam 2024',
    year: 2024,
    season: 'summer',
    path: '/banks/2024/summer/medborgerskabsproeven_2024_05_full.json'
  },
  {
    id: '2023-winter',
    label: 'Official Exam 2023',
    year: 2023,
    season: 'winter',
    path: '/banks/2023/winter/medborgerskabsproeven_2023_11_full.json'
  },
  {
    id: '2023-summer',
    label: 'Official Exam 2023',
    year: 2023,
    season: 'summer',
    path: '/banks/2023/summer/medborgerskabsproeven_2023_05_full.json'
  },
  {
    id: '2022-winter',
    label: 'Official Exam 2022',
    year: 2022,
    season: 'winter',
    path: '/banks/2022/winter/medborgerskabsproeven_2022_11_full.json'
  },
  {
    id: '2022-summer',
    label: 'Official Exam 2022',
    year: 2022,
    season: 'summer',
    path: '/banks/2022/summer/medborgerskabsproeven_2022_05_full.json'
  },
  {
    id: '2021-winter',
    label: 'Official Exam 2021',
    year: 2021,
    season: 'winter',
    path: '/banks/2021/winter/medborgerskabsproeven_2021_11_full.json'
  },
  {
    id: '2021-summer',
    label: 'Official Exam 2021',
    year: 2021,
    season: 'summer',
    path: '/banks/2021/summer/medborgerskabsproeven_2021_05_full.json'
  },

];

// Get a specific exam by ID
export const getExamById = (examId: string): ExamOption | undefined => {
  return availableExams.find(exam => exam.id === examId);
};

// Dynamically import an exam from its path
export const loadExam = async (examOption: ExamOption): Promise<Question[]> => {
  if (examOption.id === 'random') {
    // For random questions, we'll generate a mix from different exams
    return generateRandomExamQuestions();
  }
  
  try {
    // Using dynamic import based on the exam's year and season
    const examModule = await import(`../banks/${examOption.year}/${examOption.season}/medborgerskabsproeven_${examOption.year}_${examOption.season === 'summer' ? '06' : '11'}_full.json`);
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
    const examOptions = availableExams.filter(exam => exam.id !== 'random');
    
    // Define how many questions we want in total
    const totalQuestionsNeeded = 25;
    
    // We'll select questions from all exams and then shuffle and pick 25 total
    
    // Load all questions from all exams
    const allQuestionsPromises = examOptions.map(async (exam) => {
      try {
        const questions = await import(`../banks/${exam.year}/${exam.season}/medborgerskabsproeven_${exam.year}_${exam.season === 'summer' ? '06' : '11'}_full.json`);
        return questions.default.map((q: Question) => ({
          ...q,
          source: `${exam.year} ${exam.season}` // Add source metadata for tracking
        }));
      } catch (error) {
        console.error(`Failed to load exam ${exam.id}:`, error);
        return [];
      }
    });
    
    const allQuestionsArrays = await Promise.all(allQuestionsPromises);
    
    // Flatten and deduplicate questions (using the question text as a unique identifier)
    const uniqueQuestions = Array.from(
      new Map(
        allQuestionsArrays
          .flat()
          .map(q => [q.question, q])
      ).values()
    );
    
    // Shuffle the questions
    const shuffledQuestions = [...uniqueQuestions].sort(() => Math.random() - 0.5);
    
    // Take the first 25 questions (or all if less than 25)
    return shuffledQuestions.slice(0, totalQuestionsNeeded);
    
  } catch (error) {
    console.error('Error generating random exam questions:', error);
    return [];
  }
};
