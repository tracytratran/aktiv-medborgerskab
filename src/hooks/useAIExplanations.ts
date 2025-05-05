import { useState, useEffect } from 'react';
import { generateExplanation, isGeminiConfigured } from '../utils/aiHelper';
import { useAppTranslation } from './useAppTranslation';

interface UseAIExplanationsReturn {
  explanations: Record<string, string>;
  loadingStates: Record<string, boolean>;
  getExplanation: (question: string, correctAnswer: string) => Promise<void>;
}

const STORAGE_KEY = 'aiExplanations';

export const useAIExplanations = (): UseAIExplanationsReturn => {
  const { t, i18n } = useAppTranslation();
  const [explanations, setExplanations] = useState<Record<string, string>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  // Load explanations from local storage on mount
  useEffect(() => {
    const storedExplanations = localStorage.getItem(STORAGE_KEY);
    if (storedExplanations) {
      setExplanations(JSON.parse(storedExplanations));
    }
  }, []);

  const getExplanation = async (question: string, correctAnswer: string) => {
    // Check if explanation exists in local storage
    const storedExplanations = localStorage.getItem(STORAGE_KEY);
    if (storedExplanations) {
      const stored = JSON.parse(storedExplanations);
      if (stored[question]) {
        setExplanations(prev => ({ ...prev, [question]: stored[question] }));
        return;
      }
    }

    // Set loading state
    setLoadingStates(prev => ({ ...prev, [question]: true }));

    try {
      // Check if API key is configured
      if (!isGeminiConfigured()) {
        throw new Error("API key not configured");
      }

      // Generate explanation using Gemini
      const explanation = await generateExplanation(
        question,
        correctAnswer,
        i18n.language
      );

      const newExplanations = {
        ...explanations,
        [question]: explanation
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newExplanations));

      // Store the explanation
      setExplanations(newExplanations);
    } catch (error) {
      console.error("Failed to get AI explanation:", error);

      // Different error message based on error type
      const errorMessage = !isGeminiConfigured()
        ? t("results.apiKeyMissing")
        : t("results.aiExplanationError");

      setExplanations(prev => ({ ...prev, [question]: errorMessage }));
    } finally {
      setLoadingStates(prev => ({ ...prev, [question]: false }));
    }
  };

  return {
    explanations,
    loadingStates,
    getExplanation,
  };
};