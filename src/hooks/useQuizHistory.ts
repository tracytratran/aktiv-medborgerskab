import { useState, useEffect } from 'react';
import { Question, QuizAttempt } from '../types';

const QUIZ_HISTORY_KEY = "medborgerskab_quiz_history";

function getWrongAnswers(quizHistory: QuizAttempt[]): Question[] {
    const uniqueWrongAnswers = new Map();
    
    quizHistory.forEach(attempt => {
      attempt.answers.forEach(answer => {
        if (!answer.isCorrect && !uniqueWrongAnswers.has(answer.question)) {
          uniqueWrongAnswers.set(answer.question, {
            question: answer.question,
            answer: answer.correctAnswer
          });
        }
      });
    });
    
    return Array.from(uniqueWrongAnswers.values());
}

export const useQuizHistory = () => {
  const [quizHistory, setQuizHistory] = useState<QuizAttempt[]>([]);
  const [wrongAnswers, setWrongAnswers] = useState<Question[]>([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem(QUIZ_HISTORY_KEY);
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory) as QuizAttempt[];
        const wrongAnswers = getWrongAnswers(parsedHistory);
        setQuizHistory(parsedHistory);
        setWrongAnswers(wrongAnswers);
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
    wrongAnswers,
    addQuizAttempt
  };
};

export default useQuizHistory;