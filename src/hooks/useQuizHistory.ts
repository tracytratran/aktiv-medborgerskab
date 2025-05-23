import { useState, useEffect, useMemo } from 'react';
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
        
        // Handle migration of existing attempts that don't have examId
        const migratedHistory = parsedHistory.map((attempt: QuizAttempt) => {
          if (!('examId' in attempt)) {
            return {
              ...attempt as any, // Use type assertion to bypass the type checking
              examId: 'unknown' // Default value for existing attempts
            } as QuizAttempt;
          }
          return attempt;
        });
        
        const wrongAnswers = getWrongAnswers(migratedHistory);
        setQuizHistory(migratedHistory);
        setWrongAnswers(wrongAnswers);
        
        // If we had to migrate, save the updated history
        if (JSON.stringify(migratedHistory) !== savedHistory) {
          localStorage.setItem(QUIZ_HISTORY_KEY, JSON.stringify(migratedHistory));
        }
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
  
  // Get a list of attempted exam IDs
  const attemptedExamIds = useMemo(() => {
    const examIds = new Set<string>();
    quizHistory.forEach(attempt => {
      if (attempt.examId) {
        examIds.add(attempt.examId);
      }
    });
    return Array.from(examIds);
  }, [quizHistory]);
  
  // Get the best score for a specific exam
  const getExamBestScore = (examId: string): number | null => {
    const attempts = quizHistory.filter(attempt => attempt.examId === examId);
    if (attempts.length === 0) return null;
    
    return Math.max(...attempts.map(attempt => attempt.score));
  };

  return {
    quizHistory,
    wrongAnswers,
    addQuizAttempt,
    attemptedExamIds,
    getExamBestScore,
    hasAttemptedExam: (examId: string) => attemptedExamIds.includes(examId)
  };
};

export default useQuizHistory;