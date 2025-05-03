import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppTranslation } from "../hooks/useAppTranslation";
import LanguageSelector from "./LanguageSelector";
import useQuizHistory from "../hooks/useQuizHistory";

const Header: React.FC = () => {
  const { t } = useAppTranslation();
  const navigate = useNavigate();
  const { quizHistory } = useQuizHistory();

  return (
    <header className="sticky top-0 bg-white bg-opacity-95 shadow-sm z-10 py-4">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 
          onClick={() => navigate("/")} 
          className="text-2xl sm:text-3xl font-bold text-blue-600 text-center sm:text-left cursor-pointer hover:text-blue-700 transition-colors"
        >
          {t("app.title")}
        </h1>
        <div className="flex flex-row items-center gap-4">
          {
            quizHistory.length > 0 && (
              <button
                onClick={() => navigate("/results")}
                className="flex items-center gap-2 py-2 px-4 text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                <span>{t("app.reviewHistory")}</span>
              </button>
            )
          }
          <div className="flex justify-center sm:justify-end">
            <LanguageSelector />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
