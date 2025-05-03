import { useState, useEffect } from 'react';
import { QuizAttempt } from '../types';

const QUIZ_HISTORY_KEY = "medborgerskab_quiz_history";

export const useQuizHistory = () => {
  const [quizHistory, setQuizHistory] = useState<QuizAttempt[]>([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem(QUIZ_HISTORY_KEY);
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory) as QuizAttempt[];
        setQuizHistory(parsedHistory);
      } catch (error) {
        console.error("Failed to parse quiz history:", error);
        setQuizHistory([]);
      }
    }
  }, []);

  const addQuizAttempt = (attempt: QuizAttempt) => {
    const updatedHistory = [attempt, ...quizHistory];
    setQuizHistory(updatedHistory);
    localStorage.setItem(QUIZ_HISTORY_KEY, JSON.stringify(updatedHistory));
  };

  return {
    quizHistory,
    addQuizAttempt
  };
};

export default useQuizHistory;