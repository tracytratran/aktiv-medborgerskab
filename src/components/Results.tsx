import React, { useState } from 'react';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { UserAnswer, QuizAttempt } from '../types';

interface ResultsProps {
  userAnswers: UserAnswer[];
  quizHistory: QuizAttempt[];
  restartQuiz: () => void;
}

const Results: React.FC<ResultsProps> = ({ userAnswers, quizHistory, restartQuiz }) => {
  const { t } = useAppTranslation();
  const [showReview, setShowReview] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  
  const correctAnswersCount = userAnswers.filter(answer => answer.isCorrect).length;
  const totalQuestions = userAnswers.length;
  const percentage = Math.round((correctAnswersCount / totalQuestions) * 100);
  
  const incorrectAnswers = userAnswers.filter(answer => !answer.isCorrect);

  const getFeedbackMessage = (): string => {
    if (percentage >= 90) return 'Fantastic! You\'re a Danish citizenship expert!';
    if (percentage >= 75) return 'Great job! You know Danish citizenship well!';
    if (percentage >= 60) return 'Good work! Keep studying to improve further.';
    return 'Keep practicing! You\'ll improve with more study.';
  };
  
  const getGradeColorClasses = (): string => {
    if (percentage >= 90) return 'border-green-500 text-green-500';
    if (percentage >= 75) return 'border-green-400 text-green-400';
    if (percentage >= 60) return 'border-yellow-500 text-yellow-500';
    return 'border-red-500 text-red-500';
  };

  // Format date to a more readable format
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate progress over time
  const calculateProgress = (): { improvement: number; lastFive: number[] } => {
    if (quizHistory.length <= 1) {
      return { improvement: 0, lastFive: [quizHistory[0]?.score || 0] };
    }
    
    // Get the first and latest scores to calculate overall improvement
    const latest = quizHistory[0].score;
    const first = quizHistory[quizHistory.length - 1].score;
    const improvement = latest - first;
    
    // Get the scores of the last 5 attempts (or fewer if there aren't 5)
    const lastFive = quizHistory.slice(0, 5).map(attempt => attempt.score);
    
    return { improvement, lastFive };
  };

  const { improvement, lastFive } = calculateProgress();
  
  // Get average score of all attempts
  const averageScore = quizHistory.length > 0
    ? Math.round(quizHistory.reduce((sum, attempt) => sum + attempt.score, 0) / quizHistory.length)
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 transition-all duration-300">
      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'current' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
          onClick={() => setActiveTab('current')}
        >
          {t('results.title')}
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'history' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
          onClick={() => setActiveTab('history')}
        >
          {t('results.history')}
          {quizHistory.length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full">
              {quizHistory.length}
            </span>
          )}
        </button>
      </div>

      {/* Content area */}
      {activeTab === 'current' && !showReview ? (
        // Current results view
        <div className="flex flex-col items-center text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">{t('results.title')}</h2>
          
          <div 
            className={`w-40 h-40 md:w-48 md:h-48 rounded-full border-8 flex flex-col justify-center items-center mb-8 ${getGradeColorClasses()}`}
          >
            <span className="text-4xl md:text-5xl font-bold">{percentage}%</span>
            <span className="text-sm mt-2">
              {t('results.correct', { correct: correctAnswersCount, total: totalQuestions })}
            </span>
          </div>
          
          <p className="text-xl mb-8">{getFeedbackMessage()}</p>
          
          <div className="flex flex-col w-full max-w-xs gap-4">
            {incorrectAnswers.length > 0 && (
              <button 
                className="py-3 px-6 bg-white border-2 border-primary text-primary rounded-lg font-medium hover:bg-blue-50 transition-colors"
                onClick={() => setShowReview(true)}
              >
                {t('results.restart')}
              </button>
            )}
            
            <button 
              className="py-3 px-6 bg-primary border-2 border-primary text-white rounded-lg font-medium hover:bg-primary-dark hover:border-primary-dark transition-colors"
              onClick={restartQuiz}
            >
              {t('results.restart')}
            </button>
            

          </div>
        </div>
      ) : activeTab === 'current' && showReview ? (
        // Review incorrect answers view
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold mb-2">Review Incorrect Answers</h2>
          <p className="text-gray-600 mb-8">
            {incorrectAnswers.length} {incorrectAnswers.length === 1 ? 'question' : 'questions'} to review
          </p>
          
          <div className="space-y-8 mb-8">
            {incorrectAnswers.map((answer, index) => (
              <div key={index} className="p-5 border border-gray-200 rounded-lg">
                <h3 className="text-xl mb-4 font-medium">{answer.question}</h3>
                
                <div className="space-y-3">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-600 mb-1">Your answer:</span>
                    <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded">
                      {answer.userAnswer}
                    </div>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-600 mb-1">Correct answer:</span>
                    <div className="p-3 bg-green-50 text-green-700 border border-green-200 rounded">
                      {answer.correctAnswer}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <button 
            className="self-start py-3 px-6 bg-primary border-2 border-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
            onClick={() => setShowReview(false)}
          >
            {t('results.title')}
          </button>
        </div>
      ) : (
        // History tab view
        <div className="flex flex-col">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4">{t('results.title')}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">{t('results.previousAttempts')}</p>
                <p className="text-2xl font-bold text-blue-700">{quizHistory.length}</p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">{t('results.score', { score: averageScore })}</p>
                <p className="text-2xl font-bold text-green-700">{averageScore}%</p>
              </div>
              
              <div className={`${improvement >= 0 ? 'bg-green-50' : 'bg-red-50'} rounded-lg p-4 text-center`}>
                <p className="text-sm text-gray-600 mb-1">Overall Improvement</p>
                <p className={`text-2xl font-bold ${improvement >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {improvement > 0 && '+'}{improvement}%
                </p>
              </div>
            </div>
            
            {quizHistory.length > 1 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Recent Performance</h3>
                <div className="h-40 flex items-end space-x-2">
                  {lastFive.map((score, index) => (
                    <div 
                      key={index} 
                      className="flex-1 bg-blue-500 rounded-t-md relative group"
                      style={{ height: `${Math.max(10, score)}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                        {score}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <h3 className="text-lg font-semibold mb-3">{t('results.history')}</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {quizHistory.map((attempt, index) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">{t('results.date')}: {formatDate(attempt.date)}</span>
                  <span className={`px-2 py-1 rounded-full text-sm font-medium ${attempt.score >= 75 ? 'bg-green-100 text-green-800' : attempt.score >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                    {attempt.score}%
                  </span>
                </div>
                <p className="text-gray-700">
                  {attempt.correctAnswers} correct out of {attempt.totalQuestions} questions
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      

    </div>
  );
};

export default Results;
