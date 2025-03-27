import React, { useState, useEffect } from 'react';
import Quiz from './components/Quiz';
import Results from './components/Results';
import ExamSelector from './components/ExamSelector';
import { Question, UserAnswer, QuizAttempt } from './types';
import topicQuestionsData from './medborgerskab_quiz_by_topic.json';
import { availableExams, getExamById, loadExam } from './utils/examData';

// LocalStorage key for storing quiz history
const QUIZ_HISTORY_KEY = 'medborgerskab_quiz_history';

const App: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [quizHistory, setQuizHistory] = useState<QuizAttempt[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('random'); // Default to random questions
  const [showExamSelector, setShowExamSelector] = useState<boolean>(true);

  /**
   * Generates a random set of questions from each topic in the question bank
   * @param questionsPerTopic - Number of questions to select from each topic (or percentage as a decimal)
   * @param minQuestionsPerTopic - Minimum number of questions to include from each topic
   * @returns Array of questions selected randomly from each topic
   */
  const generateRandomQuestions = (questionsPerTopic: number | number[] = 0.4, minQuestionsPerTopic: number = 2): Question[] => {
    const allTopics = Object.keys(topicQuestionsData);
    const selectedQuestions: Question[] = [];
    
    allTopics.forEach((topic, index) => {
      const topicQuestions = topicQuestionsData[topic as keyof typeof topicQuestionsData];
      let numToSelect: number;
      
      if (Array.isArray(questionsPerTopic)) {
        // If questionsPerTopic is an array, use the specific number for this topic or the last element
        numToSelect = questionsPerTopic[index] || questionsPerTopic[questionsPerTopic.length - 1];
      } else if (questionsPerTopic < 1) {
        // If questionsPerTopic is a decimal, interpret as a percentage
        numToSelect = Math.max(Math.ceil(topicQuestions.length * questionsPerTopic), minQuestionsPerTopic);
      } else {
        // If questionsPerTopic is a whole number, use it directly
        numToSelect = Math.min(questionsPerTopic, topicQuestions.length);
      }
      
      // Ensure we don't try to select more questions than are available
      numToSelect = Math.min(numToSelect, topicQuestions.length);
      
      // Create a copy of the topic questions to shuffle
      const shuffledTopicQuestions = [...topicQuestions].sort(() => Math.random() - 0.5);
      
      // Take the required number of questions from this topic
      const selectedTopicQuestions = shuffledTopicQuestions.slice(0, numToSelect);
      
      // Add to the main questions array
      selectedQuestions.push(...selectedTopicQuestions);
    });
    
    // Shuffle the final selection to mix questions from different topics
    return selectedQuestions.sort(() => Math.random() - 0.5);
  };

  // Load questions based on the selected exam
  const loadSelectedExam = async () => {
    setLoading(true);
    const selectedExam = getExamById(selectedExamId);
    
    if (!selectedExam) {
      console.error(`Exam with ID ${selectedExamId} not found`);
      setLoading(false);
      return;
    }
    
    if (selectedExam.id === 'random') {
      // For random questions, use the existing function to generate random questions from topics
      const randomQuestions = generateRandomQuestions(0.4, 2);
      setQuestions(randomQuestions);
    } else {
      // For specific exams, load from the corresponding file
      try {
        const examQuestions = await loadExam(selectedExam);
        setQuestions(examQuestions);
      } catch (error) {
        console.error(`Failed to load exam ${selectedExam.id}:`, error);
        // Fallback to random questions if loading fails
        const randomQuestions = generateRandomQuestions(0.4, 2);
        setQuestions(randomQuestions);
      }
    }
    
    // Reset quiz state when changing exam
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setQuizCompleted(false);
    setLoading(false);
  };

  useEffect(() => {
    // Load quiz history from localStorage
    const savedHistory = localStorage.getItem(QUIZ_HISTORY_KEY);
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory) as QuizAttempt[];
        setQuizHistory(parsedHistory);
      } catch (error) {
        console.error('Failed to parse quiz history:', error);
        // If there's an error parsing, start with empty history
        setQuizHistory([]);
      }
    }
    
    // Load the default selected exam (random questions)
    loadSelectedExam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  


  const handleAnswer = (selectedOption: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    
    // Record user's answer
    const userAnswer: UserAnswer = {
      question: currentQuestion.question,
      userAnswer: selectedOption,
      correctAnswer: currentQuestion.answer,
      isCorrect: selectedOption === currentQuestion.answer
    };
    
    setUserAnswers([...userAnswers, userAnswer]);
    
    // Move to next question or complete quiz
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setQuizCompleted(true);
      
      // Create a new quiz attempt with the completed quiz data
      const newAnswers = [...userAnswers, userAnswer];
      const correctCount = newAnswers.filter(answer => answer.isCorrect).length;
      const score = Math.round((correctCount / questions.length) * 100);
      
      const newQuizAttempt: QuizAttempt = {
        date: new Date().toISOString(),
        score,
        correctAnswers: correctCount,
        totalQuestions: questions.length,
        answers: newAnswers
      };
      
      // Update quiz history with the new attempt at the beginning (most recent first)
      const updatedHistory = [newQuizAttempt, ...quizHistory];
      setQuizHistory(updatedHistory);
      
      // Save updated history to localStorage
      localStorage.setItem(QUIZ_HISTORY_KEY, JSON.stringify(updatedHistory));
    }
  };

  const restartQuiz = () => {
    // Show the exam selector when restarting
    setShowExamSelector(true);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setQuizCompleted(false);
  };
  
  // Handle exam selection
  const handleSelectExam = (examId: string) => {
    setSelectedExamId(examId);
  };
  
  // Start the quiz with the selected exam
  const startQuiz = () => {
    setShowExamSelector(false);
    loadSelectedExam();
  };

  // No need to calculate results here as it's handled in the Results component

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">Aktiv Medborgerskab Quiz</h1>
        <p className="text-xl">Loading questions...</p>
        <div className="mt-4 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">Aktiv Medborgerskab Quiz</h1>
      
      {showExamSelector ? (
        <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Select Your Exam</h2>
          
          <ExamSelector 
            options={availableExams}
            selectedExamId={selectedExamId}
            onSelectExam={handleSelectExam}
          />
          
          <div className="flex justify-center mt-6">
            <button 
              onClick={startQuiz}
              className="px-8 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
            >
              Start Quiz
            </button>
          </div>
        </div>
      ) : !quizCompleted ? (
        questions.length > 0 && (
          <div className="w-full max-w-3xl">
            <Quiz 
              question={questions[currentQuestionIndex]} 
              currentQuestion={currentQuestionIndex + 1} 
              totalQuestions={questions.length}
              onAnswer={handleAnswer}
            />
          </div>
        )
      ) : (
        <div className="w-full max-w-3xl">
          <Results userAnswers={userAnswers} quizHistory={quizHistory} restartQuiz={restartQuiz} />
        </div>
      )}
    </div>
  );
};

export default App;
