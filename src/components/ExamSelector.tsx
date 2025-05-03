import React from "react";
import { useAppTranslation } from "../hooks/useAppTranslation";
import useQuizHistory from "../hooks/useQuizHistory";

export interface ExamOption {
  id: string;
  label: string;
  year: number;
  season: "summer" | "winter";
  path: string;
}

interface ExamSelectorProps {
  options: ExamOption[];
  onSelectExam: (examId: string) => void;
}

const ExamSelector: React.FC<ExamSelectorProps> = ({
  options,
  onSelectExam,
}: ExamSelectorProps) => {
  const { t } = useAppTranslation();
  const { wrongAnswers } = useQuizHistory();

  // Sort exams by year (newest first) and season (winter before summer)
  const sortedExams = [...options].sort((a, b) => {
    if (a.id === "random") return -1;
    if (b.id === "random") return 1;

    if (a.year !== b.year) {
      return b.year - a.year;
    }
    return a.season === "winter" ? -1 : 1;
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {wrongAnswers.length > 0 && (
          <button
            onClick={() => onSelectExam("wrong-answers")}
            className="p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-red-200 hover:border-red-300 flex flex-col items-center justify-center gap-2 text-center group"
          >
            <div className="text-xl font-semibold text-red-700 mb-2 group-hover:text-red-800">
              {t("examSelector.practiceWrongAnswers")}
            </div>
            <div className="text-sm text-red-600 group-hover:text-red-700">
              {t("examSelector.wrongAnswersCount", { count: wrongAnswers.length })}
            </div>
          </button>
        )}
        {sortedExams.map((exam) => (
          <button
            key={exam.id}
            onClick={() => onSelectExam(exam.id)}
            className="p-6 rounded-lg border-2 border-gray-200 hover:border-primary hover:bg-blue-50 transition-all text-center"
          >
            {exam.id === "random" ? (
              <>
                <div className="font-medium text-lg mb-1">
                  {t("examSelector.random")}
                </div>
                <div className="text-sm text-gray-600">
                  {t("examSelector.randomQuestions")}
                </div>
              </>
            ) : (
              <>
                <div className="font-medium text-lg mb-1">
                  {exam.season === "summer"
                    ? t("examSelector.summer")
                    : t("examSelector.winter")}{" "}
                  {exam.year}
                </div>
                <div className="text-sm text-gray-600">
                  {t(`examSelector.officialExam`, { year: exam.year })}
                </div>
              </>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ExamSelector;
