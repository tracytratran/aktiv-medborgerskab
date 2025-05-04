import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppTranslation } from "../hooks/useAppTranslation";
import { QuizAttempt } from "../types";
import useQuizHistory from "../hooks/useQuizHistory";
import { BASE_PATH } from "../App";
import { generateExplanation } from "../utils/aiHelper";

const ReviewHistoryPage: React.FC = () => {
  const { t, i18n } = useAppTranslation();
  const navigate = useNavigate();
  const { quizHistory } = useQuizHistory();
  const [selectedHistoryAttempt, setSelectedHistoryAttempt] = useState<QuizAttempt | null>(null);
  const [aiExplanations, setAiExplanations] = useState<Record<string, string>>({});
  const [loadingExplanations, setLoadingExplanations] = useState<Record<string, boolean>>({});

  // Format date to a more readable format
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const restartQuiz = () => {
    navigate(`${BASE_PATH}`);
  };

  // Get AI explanation for a wrong answer
  const handleLearnMore = async (question: string, correctAnswer: string, answerId: string) => {
    // Set loading state for this specific answer
    setLoadingExplanations(prev => ({ ...prev, [answerId]: true }));
    
    try {
      // Get current language
      const currentLanguage = i18n.language;
      
      // Check if API key is configured
      if (!process.env.REACT_APP_GEMINI_API_KEY) {
        throw new Error("API key not configured");
      }
      
      // Generate explanation using Gemini
      const explanation = await generateExplanation(question, correctAnswer, currentLanguage);
      
      // Store the explanation
      setAiExplanations(prev => ({ ...prev, [answerId]: explanation }));
    } catch (error) {
      console.error("Failed to get AI explanation:", error);
      
      // Different error message based on error type
      const errorMessage = !process.env.REACT_APP_GEMINI_API_KEY
        ? t("results.apiKeyMissing")
        : t("results.aiExplanationError");
      
      // Store error message
      setAiExplanations(prev => ({ ...prev, [answerId]: errorMessage }));
    } finally {
      // Clear loading state
      setLoadingExplanations(prev => ({ ...prev, [answerId]: false }));
    }
  };

  // Generate a unique ID for each answer
  const getAnswerId = (attemptDate: string, questionText: string) => {
    return `${attemptDate}-${questionText.substring(0, 20)}`;
  };

  return (
    <div className="flex-grow container mx-auto px-4 py-6 flex flex-col items-center justify-start">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6">
          {selectedHistoryAttempt ? (
            // Review historical attempt
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    {t("results.historyReviewTitle")}
                  </h2>
                  <p className="text-gray-600">
                    {formatDate(selectedHistoryAttempt.date)} •{" "}
                    {t("results.score")}: {selectedHistoryAttempt.score}%
                  </p>
                </div>
                <button
                  onClick={() => setSelectedHistoryAttempt(null)}
                  className="py-2 px-4 text-gray-600 hover:text-gray-800 flex items-center gap-2"
                >
                  <span>←</span> {t("results.backToHistory")}
                </button>
              </div>

              <div className="space-y-8 mb-8">
                {selectedHistoryAttempt.answers
                  .filter((answer) => !answer.isCorrect)
                  .map((answer, index) => {
                    const answerId = getAnswerId(selectedHistoryAttempt.date, answer.question);
                    const hasExplanation = answerId in aiExplanations;
                    const isLoading = loadingExplanations[answerId] || false;

                    return (
                      <div
                        key={index}
                        className="p-5 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                      >
                        <h3 className="text-xl mb-4 font-medium">
                          {answer.question}
                        </h3>

                        <div className="space-y-3">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-600 mb-1">
                              {t("results.userAnswer")}:
                            </span>
                            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded">
                              {answer.userAnswer}
                            </div>
                          </div>

                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-600 mb-1">
                              {t("results.correctAnswer")}:
                            </span>
                            <div className="p-3 bg-green-50 text-green-700 border border-green-200 rounded">
                              {answer.correctAnswer}
                            </div>
                          </div>
                        </div>

                        {/* Learn more with AI button for incorrect answers */}
                        {!answer.isCorrect && (
                          <div className="mt-4">
                            {!hasExplanation ? (
                              <button
                                onClick={() => handleLearnMore(
                                  answer.question, 
                                  answer.correctAnswer, 
                                  answerId
                                )}
                                disabled={isLoading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isLoading ? (
                                  <>
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {t("results.loading")}
                                  </>
                                ) : (
                                  <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {t("results.learnMoreWithAI")}
                                  </>
                                )}
                              </button>
                            ) : (
                              <div className="mt-4">
                                <h4 className="font-medium text-gray-800 mb-2">
                                  {t("results.aiExplanation")}:
                                </h4>
                                <div className="bg-white p-4 rounded-md border border-gray-300 text-gray-700 whitespace-pre-line">
                                  {aiExplanations[answerId]}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          ) : (
            // History list view
            <div>
              <h2 className="text-2xl font-bold mb-6">
                {t("results.historyTitle")}
              </h2>

              {quizHistory.length === 0 ? (
                <p className="text-gray-600">{t("results.noHistory")}</p>
              ) : (
                <div className="space-y-4">
                  {quizHistory.map((attempt, index) => {
                    const incorrectCount = attempt.answers.filter(
                      (a) => !a.isCorrect
                    ).length;
                    return (
                      <div
                        key={index}
                        onClick={() => setSelectedHistoryAttempt(attempt)}
                        className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-600">
                            {formatDate(attempt.date)}
                          </span>
                          <span
                            className={`font-medium ${
                              attempt.score >= 75
                                ? "text-green-600"
                                : attempt.score >= 60
                                ? "text-yellow-600"
                                : "text-red-600"
                            }`}
                          >
                            {attempt.score}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            {t("results.correctCount", {
                              correct: attempt.correctAnswers,
                              total: attempt.totalQuestions,
                            })}
                          </span>
                          {incorrectCount > 0 && (
                            <button
                              className="text-primary hover:text-primary-dark text-sm font-medium"
                            >
                              {t("results.reviewIncorrect", {
                                count: incorrectCount,
                              })} →
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <button
                className="my-4 py-3 px-6 bg-primary border-2 border-primary text-white rounded-lg font-medium hover:bg-primary-dark hover:border-primary-dark transition-colors"
                onClick={restartQuiz}
              >
                {t("results.restart")}
              </button>
            </div>
          )}
        </div>
    </div>
  );
};

export default ReviewHistoryPage;
