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
    // For random questions, we'll use the existing logic in App.tsx
    return [];
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
