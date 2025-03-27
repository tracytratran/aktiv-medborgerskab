export interface Question {
  question: string;
  options: string[];
  answer: string;
}

export interface UserAnswer {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

export interface QuizAttempt {
  date: string; // ISO string of when the attempt was completed
  score: number; // Percentage score (0-100)
  correctAnswers: number; // Number of correct answers
  totalQuestions: number; // Total number of questions
  answers: UserAnswer[]; // All answers from this attempt
}
