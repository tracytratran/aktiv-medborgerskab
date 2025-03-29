import React from 'react';
import { useAppTranslation } from '../hooks/useAppTranslation';

export interface ExamOption {
  id: string;
  label: string;
  year: number;
  season: 'summer' | 'winter';
  path: string;
}

interface ExamSelectorProps {
  options: ExamOption[];
  onSelectExam: (examId: string) => void;
}

const ExamSelector: React.FC<ExamSelectorProps> = ({ 
  options, 
  onSelectExam 
}: ExamSelectorProps) => {
  const { t } = useAppTranslation();
  
  // Sort exams by year (newest first) and season (winter before summer)
  const sortedExams = [...options].sort((a, b) => {
    if (a.id === 'random') return -1;
    if (b.id === 'random') return 1;
    
    if (a.year !== b.year) {
      return b.year - a.year;
    }
    return a.season === 'winter' ? -1 : 1;
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedExams.map(exam => (
          <button
            key={exam.id}
            onClick={() => onSelectExam(exam.id)}
            className="p-6 rounded-lg border-2 border-gray-200 hover:border-primary hover:bg-blue-50 transition-all text-left"
          >
            {exam.id === 'random' ? (
              <>
                <div className="font-medium text-lg mb-1">{t('examSelector.random')}</div>
                <div className="text-sm text-gray-600">{t('examSelector.randomQuestions')}</div>
              </>
            ) : (
              <>
                <div className="font-medium text-lg mb-1">
                  {exam.season === 'summer' ? t('examSelector.summer') : t('examSelector.winter')} {exam.year}
                </div>
                <div className="text-sm text-gray-600">{exam.label}</div>
              </>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ExamSelector;
