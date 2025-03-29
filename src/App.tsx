import React, { useState, useEffect } from "react";
import { useAppTranslation } from "./hooks/useAppTranslation";
import LanguageSelector from "./components/LanguageSelector";
import Quiz from "./components/Quiz";
import Results from "./components/Results";
import ExamSelector from "./components/ExamSelector";
import { Question, UserAnswer, QuizAttempt } from "./types";
// No longer needed as we're using exam data directly
// import topicQuestionsData from './medborgerskab_quiz_by_topic.json';
import { availableExams, getExamById, loadExam } from "./utils/examData";

// LocalStorage key for storing quiz history
const QUIZ_HISTORY_KEY = "medborgerskab_quiz_history";

const App: React.FC = () => {
  const { t } = useAppTranslation();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [quizHistory, setQuizHistory] = useState<QuizAttempt[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>("random"); // Default to random questions
  const [showExamSelector, setShowExamSelector] = useState<boolean>(true);
  const [showDonateModal, setShowDonateModal] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(30 * 60); // 30 minutes in seconds
  const [timerActive, setTimerActive] = useState<boolean>(false);

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
        console.error("Failed to parse quiz history:", error);
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
      isCorrect: selectedOption === currentQuestion.answer,
    };

    setUserAnswers([...userAnswers, userAnswer]);

    // Move to next question or complete quiz
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setQuizCompleted(true);
      setTimerActive(false);

      // Create a new quiz attempt with the completed quiz data
      const newAnswers = [...userAnswers, userAnswer];
      const correctCount = newAnswers.filter(
        (answer) => answer.isCorrect
      ).length;
      const score = Math.round((correctCount / questions.length) * 100);

      const newQuizAttempt: QuizAttempt = {
        date: new Date().toISOString(),
        score,
        correctAnswers: correctCount,
        totalQuestions: questions.length,
        answers: newAnswers,
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
    setTimerActive(false);
  };

  // Handle canceling a quiz without saving results
  const cancelQuiz = () => {
    // Reset the quiz state and go back to the exam selector
    setShowExamSelector(true);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setQuizCompleted(false);
    setTimerActive(false);
  };

  // Handle exam selection
  const handleSelectExam = (examId: string) => {
    setSelectedExamId(examId);
    startQuiz();
  };

  // Start the quiz with the selected exam
  const startQuiz = () => {
    setShowExamSelector(false);
    loadSelectedExam();
    // Reset and start timer
    setTimeRemaining(30 * 60); // Reset to 30 minutes
    setTimerActive(true);
  };

  // No need to calculate results here as it's handled in the Results component

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">
          {t("app.title")}
        </h1>
        <p className="text-xl">{t("app.loading")}</p>
        <div className="mt-4 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 relative">
      {/* Header with language selector */}
      <header className="sticky top-0 bg-white bg-opacity-95 shadow-sm z-10 py-4">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-600 text-center sm:text-left">
            {t("app.title")}
          </h1>
          <div className="flex justify-center sm:justify-end">
            <LanguageSelector />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow container mx-auto px-4 py-6 flex flex-col items-center justify-center">

      {showExamSelector ? (
        <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {t("app.selectExam")}
          </h2>

          <ExamSelector
            options={availableExams}
            onSelectExam={handleSelectExam}
          />
        </div>
      ) : !quizCompleted ? (
        questions.length > 0 && (
          <div className="w-full max-w-3xl">
            <Quiz
              question={questions[currentQuestionIndex]}
              currentQuestion={currentQuestionIndex + 1}
              totalQuestions={questions.length}
              timeRemaining={timeRemaining}
              setTimeRemaining={setTimeRemaining}
              timerActive={timerActive}
              onAnswer={handleAnswer}
              onCancel={cancelQuiz}
              onTimeout={() => {
                // Auto-submit the quiz when time runs out
                setQuizCompleted(true);
                setTimerActive(false);

                // Create a new quiz attempt with current answers
                const correctCount = userAnswers.filter(
                  (answer) => answer.isCorrect
                ).length;
                const score = Math.round(
                  (correctCount / userAnswers.length) * 100
                );

                const newQuizAttempt: QuizAttempt = {
                  date: new Date().toISOString(),
                  score,
                  correctAnswers: correctCount,
                  totalQuestions: userAnswers.length,
                  answers: userAnswers,
                  timeExpired: true, // Flag to indicate the quiz was ended due to timeout
                };

                // Update quiz history
                const updatedHistory = [newQuizAttempt, ...quizHistory];
                setQuizHistory(updatedHistory);
                localStorage.setItem(
                  QUIZ_HISTORY_KEY,
                  JSON.stringify(updatedHistory)
                );
              }}
            />
          </div>
        )
      ) : (
        <div className="w-full max-w-3xl">
          <Results
            userAnswers={userAnswers}
            quizHistory={quizHistory}
            restartQuiz={restartQuiz}
          />
        </div>
      )}

      </main>

      {/* Mobile-friendly footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white bg-opacity-95 shadow-lg p-4 z-10">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs sm:text-sm text-gray-500 text-center sm:text-left order-2 sm:order-1">
            © {new Date().getFullYear()} Tracy Tra Tran. All rights reserved.
          </p>
          
          {/* Social buttons */}
          <div className="flex gap-2 order-1 sm:order-2">
            <a
              href="https://www.linkedin.com/in/tracytratran"
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-4 bg-[#0077b5] border-2 border-[#0077b5] text-white rounded-lg text-sm font-medium hover:bg-[#006396] hover:border-[#006396] transition-colors flex items-center justify-center gap-1 shadow-md opacity-75 hover:opacity-100"
            >
              {t("app.connectLinkedIn")}
              <svg
                className="w-4 h-4 fill-current"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
            {/* <button
              className="py-2 px-4 bg-blue-500 border-2 border-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 hover:border-blue-600 transition-colors flex items-center justify-center gap-1 shadow-md opacity-75 hover:opacity-100"
              onClick={() => setShowDonateModal(true)}
            >
              {t("donate.buyMeACoffee")}
              <span role="img" aria-label="coffee cup" className="text-md">
                ☕️
              </span>
            </button> */}
          </div>
        </div>
      </footer>

      {/* Add padding to prevent content from being hidden behind the fixed footer */}
      <div className="pb-32 sm:pb-24"></div>

      {/* Donate modal with MobilePay details */}
      {showDonateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-opacity">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowDonateModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">{t("app.title")}</h3>

              <p className="text-gray-600 text-lg mb-4">5186WU</p>

              <div className="mb-6 flex justify-center">
                <div className="border border-gray-200 rounded-lg p-3 inline-block">
                  <img
                    src={process.env.PUBLIC_URL + "/5186WU.jpg"}
                    alt="QR Code for MobilePay donation"
                    className="w-48 h-48"
                  />
                </div>
              </div>

              <p className="mb-6 text-gray-700">{t("donate.support")}</p>

              <button
                onClick={() => setShowDonateModal(false)}
                className="py-2 px-6 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                {t("close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
