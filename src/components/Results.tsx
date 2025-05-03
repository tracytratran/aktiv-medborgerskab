import React, { useState } from "react";
import { useAppTranslation } from "../hooks/useAppTranslation";
import { UserAnswer, QuizAttempt } from "../types";

interface ResultsProps {
  userAnswers: UserAnswer[];
  quizHistory: QuizAttempt[];
  restartQuiz: () => void;
  showHistory: boolean;
}

const Results: React.FC<ResultsProps> = ({
  userAnswers,
  quizHistory,
  restartQuiz,
  showHistory,
}) => {
  const { t } = useAppTranslation();
  const [showReview, setShowReview] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"current" | "history">(showHistory ? "history" : "current");
  const [selectedHistoryAttempt, setSelectedHistoryAttempt] = useState<QuizAttempt | null>(null);

  const correctAnswersCount = userAnswers.filter(
    (answer) => answer.isCorrect
  ).length;
  const totalQuestions = userAnswers.length;
  const percentage = Math.round((correctAnswersCount / totalQuestions) * 100);

  const incorrectAnswers = userAnswers.filter((answer) => !answer.isCorrect);

  const getFeedbackMessage = (): string => {
    if (percentage >= 90) return t("results.feedback.expert");
    if (percentage >= 75) return t("results.feedback.advanced");
    if (percentage >= 60) return t("results.feedback.intermediate");
    return t("results.feedback.beginner");
  };

  const getGradeColorClasses = (): string => {
    if (percentage >= 90) return "border-green-500 text-green-500";
    if (percentage >= 75) return "border-green-400 text-green-400";
    if (percentage >= 60) return "border-yellow-500 text-yellow-500";
    return "border-red-500 text-red-500";
  };

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

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 transition-all duration-300">
      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "current"
              ? "text-primary border-b-2 border-primary"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("current")}
        >
          {t("results.title")}
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "history"
              ? "text-primary border-b-2 border-primary"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("history")}
        >
          {t("results.history")}
          {quizHistory.length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full">
              {quizHistory.length}
            </span>
          )}
        </button>
      </div>

      {/* Content area */}
      {activeTab === "current" && !showReview ? (
        // Current results view
        <div className="flex flex-col items-center text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">
            {t("results.title")}
          </h2>

          <div
            className={`w-40 h-40 md:w-48 md:h-48 rounded-full border-8 flex flex-col justify-center items-center mb-8 ${getGradeColorClasses()}`}
          >
            <span className="text-4xl md:text-5xl font-bold">
              {percentage}%
            </span>
            <span className="text-sm mt-2">
              {t("results.correct", {
                correct: correctAnswersCount,
                total: totalQuestions,
              })}
            </span>
          </div>

          {quizHistory.length > 0 && quizHistory[0].timeExpired && (
            <div className="flex items-center text-amber-600 mb-4 p-3 bg-amber-50 rounded-lg">
              <span className="mr-2">⏱️</span>
              <span>{t("results.timeExpired")}</span>
            </div>
          )}

          <p className="text-xl mb-8">{getFeedbackMessage()}</p>

          <div className="flex flex-col w-full max-w-xs gap-4">
            {incorrectAnswers.length > 0 && (
              <button
                className="py-3 px-6 bg-white border-2 border-primary text-primary rounded-lg font-medium hover:bg-blue-50 transition-colors"
                onClick={() => setShowReview(true)}
              >
                {t("results.review")}
              </button>
            )}

            <button
              className="py-3 px-6 bg-primary border-2 border-primary text-white rounded-lg font-medium hover:bg-primary-dark hover:border-primary-dark transition-colors"
              onClick={restartQuiz}
            >
              {t("results.restart")}
            </button>
          </div>
        </div>
      ) : activeTab === "current" && showReview ? (
        // Review incorrect answers view
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold mb-2">Review Incorrect Answers</h2>
          <p className="text-gray-600 mb-8">
            {incorrectAnswers.length}{" "}
            {incorrectAnswers.length === 1 ? "question" : "questions"} to review
          </p>

          <div className="space-y-8 mb-8">
            {incorrectAnswers.map((answer, index) => (
              <div
                key={index}
                className="p-5 border border-gray-200 rounded-lg"
              >
                <h3 className="text-xl mb-4 font-medium">{answer.question}</h3>

                <div className="space-y-3">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-600 mb-1">
                      Your answer:
                    </span>
                    <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded">
                      {answer.userAnswer}
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-600 mb-1">
                      Correct answer:
                    </span>
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
            {t("results.title")}
          </button>
        </div>
      ) : (
        // History tab view
        <div>
          {selectedHistoryAttempt ? (
            // Review historical attempt
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    {t("results.historyReviewTitle")}
                  </h2>
                  <p className="text-gray-600">
                    {formatDate(selectedHistoryAttempt.date)} • {t("results.score")}: {selectedHistoryAttempt.score}%
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
                  .map((answer, index) => (
                    <div
                      key={index}
                      className="p-5 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                    >
                      <h3 className="text-xl mb-4 font-medium">{answer.question}</h3>

                      <div className="space-y-3">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-600 mb-1">
                            {t("results.yourAnswer")}:
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
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            // History list view
            <div>
              <h2 className="text-2xl font-bold mb-6">{t("results.historyTitle")}</h2>

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
                        className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
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
                              onClick={() => setSelectedHistoryAttempt(attempt)}
                              className="text-primary hover:text-primary-dark text-sm font-medium"
                            >
                              {t("results.reviewIncorrect", {
                                count: incorrectCount,
                              })} →
                            </button>
                          )}
                        </div>
                        {attempt.timeExpired && (
                          <div className="mt-2 text-sm text-amber-600 flex items-center gap-1">
                            <span>⏱️</span>
                            {t("results.timeExpired")}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Results;
