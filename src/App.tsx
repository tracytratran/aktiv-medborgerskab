import React, { useState, useEffect } from 'react';
import Quiz from './components/Quiz';
import Results from './components/Results';
import ExamSelector from './components/ExamSelector';
import { Question, UserAnswer, QuizAttempt } from './types';
// No longer needed as we're using exam data directly
// import topicQuestionsData from './medborgerskab_quiz_by_topic.json';
import { availableExams, getExamById, loadExam } from './utils/examData';

// LocalStorage key for storing quiz history
const QUIZ_HISTORY_KEY = 'medborgerskab_quiz_history';

const App: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [quizHistory, setQuizHistory] = useState<QuizAttempt[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('random'); // Default to random questions
  const [showExamSelector, setShowExamSelector] = useState<boolean>(true);
  const [showDonateModal, setShowDonateModal] = useState<boolean>(false);

  // Random questions are now generated in the examData.ts file

  // Load questions based on the selected exam
  const loadSelectedExam = async () => {
    setLoading(true);
    const selectedExam = getExamById(selectedExamId);
    
    if (!selectedExam) {
      console.error(`Exam with ID ${selectedExamId} not found`);
      setLoading(false);
      return;
    }
    
    // Load questions for the selected exam
    try {
      const examQuestions = await loadExam(selectedExam);
      setQuestions(examQuestions);
    } catch (error) {
      console.error(`Failed to load exam ${selectedExam.id}:`, error);
      setLoading(false);
    }
    
    // Reset quiz state when changing exam
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setQuizCompleted(false);
    setLoading(false);
  };

  useEffect(() => {
    // Load quiz history from localStorage
    const savedHistory = localStorage.getItem(QUIZ_HISTORY_KEY);
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory) as QuizAttempt[];
        setQuizHistory(parsedHistory);
      } catch (error) {
        console.error('Failed to parse quiz history:', error);
        // If there's an error parsing, start with empty history
        setQuizHistory([]);
      }
    }
    
    // Load the default selected exam (random questions)
    loadSelectedExam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  


  const handleAnswer = (selectedOption: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    
    // Record user's answer
    const userAnswer: UserAnswer = {
      question: currentQuestion.question,
      userAnswer: selectedOption,
      correctAnswer: currentQuestion.answer,
      isCorrect: selectedOption === currentQuestion.answer
    };
    
    setUserAnswers([...userAnswers, userAnswer]);
    
    // Move to next question or complete quiz
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setQuizCompleted(true);
      
      // Create a new quiz attempt with the completed quiz data
      const newAnswers = [...userAnswers, userAnswer];
      const correctCount = newAnswers.filter(answer => answer.isCorrect).length;
      const score = Math.round((correctCount / questions.length) * 100);
      
      const newQuizAttempt: QuizAttempt = {
        date: new Date().toISOString(),
        score,
        correctAnswers: correctCount,
        totalQuestions: questions.length,
        answers: newAnswers
      };
      
      // Update quiz history with the new attempt at the beginning (most recent first)
      const updatedHistory = [newQuizAttempt, ...quizHistory];
      setQuizHistory(updatedHistory);
      
      // Save updated history to localStorage
      localStorage.setItem(QUIZ_HISTORY_KEY, JSON.stringify(updatedHistory));
    }
  };

  const restartQuiz = () => {
    // Show the exam selector when restarting
    setShowExamSelector(true);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setQuizCompleted(false);
  };
  
  // Handle canceling a quiz without saving results
  const cancelQuiz = () => {
    // Reset the quiz state and go back to the exam selector
    setShowExamSelector(true);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setQuizCompleted(false);
  };
  
  // Handle exam selection
  const handleSelectExam = (examId: string) => {
    setSelectedExamId(examId);
  };
  
  // Start the quiz with the selected exam
  const startQuiz = () => {
    setShowExamSelector(false);
    loadSelectedExam();
  };

  // No need to calculate results here as it's handled in the Results component

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">Aktiv Medborgerskab Quiz</h1>
        <p className="text-xl">Loading questions...</p>
        <div className="mt-4 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 relative">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">Aktiv Medborgerskab Quiz</h1>
      
      {showExamSelector ? (
        <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Select Your Exam</h2>
          
          <ExamSelector 
            options={availableExams}
            selectedExamId={selectedExamId}
            onSelectExam={handleSelectExam}
          />
          
          <div className="flex justify-center mt-6">
            <button 
              onClick={startQuiz}
              className="px-8 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
            >
              Start Quiz
            </button>
          </div>
        </div>
      ) : !quizCompleted ? (
        questions.length > 0 && (
          <div className="w-full max-w-3xl">
            <Quiz 
              question={questions[currentQuestionIndex]} 
              currentQuestion={currentQuestionIndex + 1} 
              totalQuestions={questions.length}
              onAnswer={handleAnswer}
              onCancel={cancelQuiz}
            />
          </div>
        )
      ) : (
        <div className="w-full max-w-3xl">
          <Results userAnswers={userAnswers} quizHistory={quizHistory} restartQuiz={restartQuiz} />
        </div>
      )}
      
      {/* Coffee button that appears on all pages */}
      <div className="fixed bottom-4 right-4">
        <button 
          className="py-2 px-4 bg-blue-500 border-2 border-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 hover:border-blue-600 transition-colors flex items-center justify-center gap-1 shadow-md opacity-75 hover:opacity-100"
          onClick={() => setShowDonateModal(true)}
        >
          Buy me a coffee<span role="img" aria-label="coffee cup" className="text-md">☕️</span>
        </button>
      </div>
      
      {/* Donate modal with MobilePay details */}
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
                    src={process.env.PUBLIC_URL + "/5186WU.jpg"} 
                    alt="QR Code for MobilePay donation" 
                    className="w-48 h-48" 
                  />
                </div>
              </div>
              
              <p className="mb-6 text-gray-700">
                If you found this quiz useful for your Danish active citizenship test preparation, consider supporting this project to help with development and server costs.
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

export default App;
