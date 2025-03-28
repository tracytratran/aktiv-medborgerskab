import { useTranslation } from 'react-i18next';

// Define a type for our translation function
type TranslationFunction = {
  (key: string, options?: object): string;
};

/**
 * Custom hook to fix TypeScript issues with the translation function.
 * This wraps the standard i18next useTranslation hook with proper typing.
 */
export function useAppTranslation() {
  const { t, i18n } = useTranslation();

  // Use type assertion to make TypeScript accept our usage
  const typedT = t as unknown as TranslationFunction;

  return { t: typedT, i18n };
}
