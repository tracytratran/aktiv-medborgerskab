import React, { useState, useMemo } from 'react';

export interface ExamOption {
  id: string;
  label: string;
  year: number;
  season: 'summer' | 'winter';
  path: string;
}

interface ExamSelectorProps {
  options: ExamOption[];
  selectedExamId: string;
  onSelectExam: (examId: string) => void;
}

const ExamSelector: React.FC<ExamSelectorProps> = ({ 
  options, 
  selectedExamId, 
  onSelectExam 
}) => {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  
  // Group exams by year for easier selection
  const groupedExams = useMemo(() => {
    const grouped: Record<string, ExamOption[]> = {};
    
    // Add the random questions option to a special category
    const randomOption = options.find(opt => opt.id === 'random');
    if (randomOption) {
      grouped['Random'] = [randomOption];
    }
    
    // Group the rest by year
    options.forEach(option => {
      if (option.id === 'random') return; // Skip random as we've already handled it
      
      const yearKey = option.year.toString();
      if (!grouped[yearKey]) {
        grouped[yearKey] = [];
      }
      grouped[yearKey].push(option);
    });
    
    return grouped;
  }, [options]);
  
  // Get sorted list of years
  const years = useMemo(() => {
    return Object.keys(groupedExams)
      .filter(year => year !== 'Random')
      .sort((a, b) => parseInt(b) - parseInt(a));
  }, [groupedExams]);
  
  // Get the currently selected exam
  const selectedExam = options.find(opt => opt.id === selectedExamId);
  
  // When selecting a year, auto-select if there's only one option for that year
  const handleYearSelect = (year: string) => {
    const yearNum = year === 'Random' ? 0 : parseInt(year);
    setSelectedYear(yearNum);
    
    const yearExams = groupedExams[year];
    if (yearExams.length === 1) {
      // If only one option for this year, select it automatically
      onSelectExam(yearExams[0].id);
    }
  };
  
  return (
    <div className="mb-6">
      {/* Year Selection */}
      <div className="mb-6">
        <h3 className="font-medium text-gray-700 mb-2">Select Year:</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            key="random"
            onClick={() => handleYearSelect('Random')}
            className={`p-3 rounded-lg border-2 transition-all ${selectedYear === 0
              ? 'border-primary bg-blue-50 text-primary'
              : 'border-gray-200 hover:border-primary hover:bg-blue-50'
            }`}
          >
            Random
          </button>
          
          {years.map(year => (
            <button
              key={year}
              onClick={() => handleYearSelect(year)}
              className={`p-3 rounded-lg border-2 transition-all ${parseInt(year) === selectedYear
                ? 'border-primary bg-blue-50 text-primary'
                : 'border-gray-200 hover:border-primary hover:bg-blue-50'
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>
      
      {/* Season Selection (if year is selected) */}
      {selectedYear !== null && selectedYear !== 0 && (
        <div className="mb-6">
          <h3 className="font-medium text-gray-700 mb-2">Select Season:</h3>
          <div className="grid grid-cols-2 gap-3">
            {groupedExams[selectedYear.toString()].map(option => (
              <button
                key={option.id}
                onClick={() => onSelectExam(option.id)}
                className={`p-4 rounded-lg border-2 transition-all ${selectedExamId === option.id
                  ? 'border-primary bg-blue-50 text-primary'
                  : 'border-gray-200 hover:border-primary hover:bg-blue-50'
                }`}
              >
                <div className="font-medium">{option.season === 'summer' ? 'Summer' : 'Winter'}</div>
                <div className="text-sm text-gray-600">{option.label}</div>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Show selection summary */}
      {selectedExam && (
        <div className="bg-gray-100 p-3 rounded-lg">
          <p className="font-medium">Selected Exam:</p>
          <p className="text-sm text-gray-700">
            {selectedExam.id === 'random' 
              ? 'Random Questions from All Topics' 
              : `${selectedExam.year} - ${selectedExam.season === 'summer' ? 'Summer' : 'Winter'}`
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default ExamSelector;
