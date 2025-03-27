import React, { useState } from 'react';
import { UserAnswer, QuizAttempt } from '../types';

interface ResultsProps {
  userAnswers: UserAnswer[];
  quizHistory: QuizAttempt[];
  restartQuiz: () => void;
}

const Results: React.FC<ResultsProps> = ({ userAnswers, quizHistory, restartQuiz }) => {
  const [showReview, setShowReview] = useState<boolean>(false);
  const [showDonateModal, setShowDonateModal] = useState<boolean>(false);
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
          Current Result
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'history' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
          onClick={() => setActiveTab('history')}
        >
          History
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
          <h2 className="text-2xl md:text-3xl font-bold mb-8">Quiz Complete!</h2>
          
          <div 
            className={`w-40 h-40 md:w-48 md:h-48 rounded-full border-8 flex flex-col justify-center items-center mb-8 ${getGradeColorClasses()}`}
          >
            <span className="text-4xl md:text-5xl font-bold">{percentage}%</span>
            <span className="text-sm mt-2">
              {correctAnswersCount} of {totalQuestions} correct
            </span>
          </div>
          
          <p className="text-xl mb-8">{getFeedbackMessage()}</p>
          
          <div className="flex flex-col w-full max-w-xs gap-4">
            {incorrectAnswers.length > 0 && (
              <button 
                className="py-3 px-6 bg-white border-2 border-primary text-primary rounded-lg font-medium hover:bg-blue-50 transition-colors"
                onClick={() => setShowReview(true)}
              >
                Review Incorrect Answers
              </button>
            )}
            
            <button 
              className="py-3 px-6 bg-primary border-2 border-primary text-white rounded-lg font-medium hover:bg-primary-dark hover:border-primary-dark transition-colors"
              onClick={restartQuiz}
            >
              Start New Quiz
            </button>
            
            <button 
              className="py-3 px-6 bg-blue-500 border-2 border-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 hover:border-blue-600 transition-colors flex items-center justify-center gap-2"
              onClick={() => setShowDonateModal(true)}
            >
              <span>Support This Project</span>
              <span role="img" aria-label="qr-code" className="text-lg">🔗</span>
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
            Back to Results
          </button>
        </div>
      ) : (
        // History tab view
        <div className="flex flex-col">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4">Your Progress</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">Total Attempts</p>
                <p className="text-2xl font-bold text-blue-700">{quizHistory.length}</p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">Average Score</p>
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
          
          <h3 className="text-lg font-semibold mb-3">Quiz History</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {quizHistory.map((attempt, index) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">{formatDate(attempt.date)}</span>
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
      
      {/* Modal for donations remains unchanged */}
      {showDonateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-opacity">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
            <button 
              onClick={() => setShowDonateModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">Medborgerskab Quiz</h3>
              
              <p className="text-gray-600 text-lg mb-4">
                5186WU
              </p>
              
              <div className="mb-6 flex justify-center">
                <div className="border border-gray-200 rounded-lg p-3 inline-block">
                  <img 
                    src="/5186WU.jpg" 
                    alt="QR Code for MobilePay donation" 
                    className="w-48 h-48" 
                  />
                </div>
              </div>
              
              <p className="mb-6 text-gray-700">
                If you found this quiz useful for your Danish citizenship test preparation, consider supporting this project to help with development and server costs.
              </p>
              
              <button
                onClick={() => setShowDonateModal(false)}
                className="py-2 px-6 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;
