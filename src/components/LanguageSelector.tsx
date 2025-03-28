import React from 'react';
import { useAppTranslation } from '../hooks/useAppTranslation';

interface Language {
  code: string;
  name: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English' },
  { code: 'zh', name: '中文' },
  { code: 'vi', name: 'Tiếng Việt' }
];

const LanguageSelector: React.FC = () => {
  const { i18n } = useAppTranslation();
  
  const changeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    // Save the language preference to localStorage
    localStorage.setItem('i18nextLng', languageCode);
  };

  return (
    <div className="flex items-center space-x-2">
      {languages.map((language) => (
        <button
          key={language.code}
          onClick={() => changeLanguage(language.code)}
          className={`px-2 py-1 text-sm rounded-md transition-colors ${
            i18n.language === language.code 
              ? 'bg-primary text-white' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
          }`}
        >
          {language.name}
        </button>
      ))}
    </div>
  );
};

export default LanguageSelector;
