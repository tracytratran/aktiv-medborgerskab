import React from "react";
import { useAppTranslation } from "../hooks/useAppTranslation";
import { UserAnswer } from "../types";
import { useNavigate } from "react-router-dom";
import useQuizHistory from "../hooks/useQuizHistory";
import { BASE_PATH } from "../App";

interface ResultsProps {
  userAnswers: UserAnswer[];
  restartQuiz: () => void;
}

const Results: React.FC<ResultsProps> = ({
  userAnswers,
  restartQuiz,
}) => {
  const { t } = useAppTranslation();
  const navigate = useNavigate();
  const { quizHistory } = useQuizHistory();
  
  const correctAnswersCount = userAnswers.filter(
    (answer) => answer.isCorrect
  ).length;
  const totalQuestions = quizHistory[0]?.totalQuestions || 0;
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

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 transition-all duration-300">
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
              onClick={() => navigate(`${BASE_PATH}/results`)}
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
    </div>
  );
};

export default Results;
