import React, { useState } from 'react';
import { Question } from '../types';

interface QuizProps {
  question: Question;
  currentQuestion: number;
  totalQuestions: number;
  onAnswer: (selectedOption: string) => void;
}

const Quiz: React.FC<QuizProps> = ({ 
  question, 
  currentQuestion, 
  totalQuestions, 
  onAnswer 
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  
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
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 transition-all duration-300">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between mb-2 text-sm text-gray-600">
          <span>Question {currentQuestion} of {totalQuestions}</span>
          <span>{Math.round((currentQuestion / totalQuestions) * 100)}%</span>
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
    </div>
  );
};

export default Quiz;
