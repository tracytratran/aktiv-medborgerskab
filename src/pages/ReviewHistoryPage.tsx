import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppTranslation } from "../hooks/useAppTranslation";
import { QuizAttempt } from "../types";
import useQuizHistory from "../hooks/useQuizHistory";
import { BASE_PATH } from "../App";

const ReviewHistoryPage: React.FC = () => {
  const { t } = useAppTranslation();
  const navigate = useNavigate();
  const { quizHistory } = useQuizHistory();
  const [selectedHistoryAttempt, setSelectedHistoryAttempt] = useState<QuizAttempt | null>(null);

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
                  .map((answer, index) => (
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
                    </div>
                  ))}
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
