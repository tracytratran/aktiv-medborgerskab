import React, { useState, useEffect } from 'react';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { Question } from '../types';

interface QuizProps {
  question: Question;
  currentQuestion: number;
  totalQuestions: number;
  timeRemaining: number;
  setTimeRemaining: React.Dispatch<React.SetStateAction<number>>;
  timerActive: boolean;
  onAnswer: (selectedOption: string) => void;
  onCancel: () => void;
  onTimeout: () => void;
  isWrongAnswersPractice?: boolean;
}

const Quiz: React.FC<QuizProps> = ({ 
  question, 
  currentQuestion, 
  totalQuestions,
  timeRemaining,
  setTimeRemaining,
  timerActive,
  onAnswer,
  onCancel,
  onTimeout,
  isWrongAnswersPractice = false
}) => {
  const { t } = useAppTranslation();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  
  // Format time remaining as MM:SS
  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const handleOptionSelect = (option: string): void => {
    setSelectedOption(option);
    setShowFeedback(true);
    
    // Move to next question after a delay
    setTimeout(() => {
      onAnswer(option);
      setSelectedOption(null);
      setShowFeedback(false);
    }, 1000);
  };
  
  // Timer effect - update the timer every second when active
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (timerActive && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Time is up, clear the interval and call the timeout handler
            clearInterval(timer);
            onTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    // Cleanup interval on component unmount or when timer is not active
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timerActive, timeRemaining, onTimeout, setTimeRemaining]);
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 transition-all duration-300">
      {/* Timer and Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between mb-2 text-sm text-gray-600">
          <span className='flex flex-row gap-1'>
            {`${isWrongAnswersPractice ? t('quiz.practiceMode') : t('quiz.title')} ${t('quiz.question', { current: currentQuestion, total: totalQuestions })}`} 
          </span>
          <div className="flex items-center">
            <span className={`font-medium mr-2 ${timeRemaining < 300 ? 'text-red-600' : ''}`}>
              ⏱️ {formatTime(timeRemaining)}
            </span>
            <span>{Math.round((currentQuestion / totalQuestions) * 100)}%</span>
          </div>
        </div>
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
          ></div>
        </div>
      </div>
      
      {/* Question */}
      <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6">
        {question.question}
      </h2>
      
      {/* Options */}
      <div className="space-y-3">
        {question.options.map((option, index) => {
          let optionClasses = "w-full p-4 text-left rounded-lg border-2 focus:outline-none transition-all duration-200";
          
          if (!showFeedback) {
            optionClasses += " border-gray-200 hover:border-primary hover:bg-blue-50";
          } else if (option === question.answer) {
            optionClasses += " border-green-500 bg-green-50 text-green-800";
          } else if (option === selectedOption) {
            optionClasses += " border-red-500 bg-red-50 text-red-800";
          } else {
            optionClasses += " border-gray-200 opacity-60";
          }
          
          return (
            <button
              key={index}
              className={optionClasses}
              onClick={() => !showFeedback && handleOptionSelect(option)}
              disabled={showFeedback}
            >
              <div className="flex items-start">
                <div className="min-w-8 h-8 flex items-center justify-center mr-3 rounded-full bg-gray-100 text-gray-700">
                  {String.fromCharCode(65 + index)}
                </div>
                <span>{option}</span>
              </div>
            </button>
          );
        })}
      </div>
      
      {/* Cancel quiz button */}
      <div className="mt-6 flex justify-center">
        <button
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors focus:outline-none"
          onClick={onCancel}
          disabled={showFeedback}
        >
          {t('quiz.cancel')}
        </button>
      </div>
    </div>
  );
};

export default Quiz;
