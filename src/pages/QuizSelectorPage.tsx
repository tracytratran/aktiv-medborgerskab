import * as React from "react";
import { useState, useEffect } from "react";
import { useAppTranslation } from "../hooks/useAppTranslation";
import { useQuizHistory } from "../hooks/useQuizHistory";
import { Question, QuizAttempt, UserAnswer } from "../types";
import { availableExams, getExamById, loadExam } from "../utils/examData";
import { logAction } from "../utils/trafficLog";
import ExamSelector from "../components/ExamSelector";
import Quiz from "../components/Quiz";
import Results from "../components/Results";

const QuizSelectorPage: React.FC = () => {
    const { t } = useAppTranslation();
    const { addQuizAttempt, wrongAnswers } = useQuizHistory();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
    const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
    const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
    const [selectedExamId, setSelectedExamId] = useState<string>("random"); // Default to random questions
    const [showExamSelector, setShowExamSelector] = useState<boolean>(true);
    const [timeRemaining, setTimeRemaining] = useState<number>(30 * 60); // 30 minutes in seconds
    const [timerActive, setTimerActive] = useState<boolean>(false);
    const [isWrongAnswersPractice, setIsWrongAnswersPractice] =
        useState<boolean>(false);

    const loadWrongAnswers = async (): Promise<Question[]> => {
        // For wrong answers practice, we need to find the original questions
        // to get their options since we don't store options in quiz history
        const allExams = await Promise.all(
            availableExams.map((exam) => loadExam(exam))
        );
        const allQuestions = allExams.flat();

        // Match wrong answers with their original questions to get options
        const practiceQuestions = wrongAnswers.map((wrongAnswer) => {
            const originalQuestion = allQuestions.find(
                (q) => q.question === wrongAnswer.question
            );
            return (
                originalQuestion || {
                    question: wrongAnswer.question,
                    answer: wrongAnswer.answer,
                    options: [wrongAnswer.answer], // Fallback if original question not found
                }
            );
        });

        // Shuffle the practice questions
        const shuffledQuestions = [...practiceQuestions].sort(
            () => Math.random() - 0.5
        );

        return shuffledQuestions;
    };

    // Load questions based on the selected exam
    const loadSelectedExam = async (examId?: string) => {
        if (examId === "wrong-answers") {
            const wrongQuestions = await loadWrongAnswers();
            setQuestions(wrongQuestions);
            setIsWrongAnswersPractice(true);
            setCurrentQuestionIndex(0);
            setUserAnswers([]);
            setQuizCompleted(false);
            setTimeRemaining(((30 * 60) / 25) * wrongQuestions.length); // Reset to 30 minutes
            setTimerActive(true);
            return;
        }
        const selectedExam = getExamById(examId || selectedExamId);

        if (!selectedExam) {
            console.error(`Exam with ID ${examId || selectedExamId} not found`);
            return;
        }

        // Load questions for the selected exam
        const examQuestions = await loadExam(selectedExam);
        setQuestions(examQuestions);
        setIsWrongAnswersPractice(false);

        // Reset quiz state when changing exam
        setCurrentQuestionIndex(0);
        setUserAnswers([]);
        setQuizCompleted(false);
        setTimeRemaining(((30 * 60) / 25) * examQuestions.length); // Reset to 30 minutes
        setTimerActive(true);
    };

    useEffect(() => {
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
            isCorrect: selectedOption === currentQuestion.answer,
        };

        setUserAnswers([...userAnswers, userAnswer]);

        // Move to next question or complete quiz
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            logAction("submit-quiz");
            setQuizCompleted(true);
            setTimerActive(false);

            // Create a new quiz attempt with the completed quiz data
            const newAnswers = [...userAnswers, userAnswer];
            const correctCount = newAnswers.filter(
                (answer) => answer.isCorrect
            ).length;
            const score = Math.round((correctCount / questions.length) * 100);

            const newQuizAttempt: QuizAttempt = {
                date: new Date().toISOString(),
                score,
                correctAnswers: correctCount,
                totalQuestions: questions.length,
                answers: newAnswers,
                examId: selectedExamId,
            };

            // Add the new attempt to history
            addQuizAttempt(newQuizAttempt);
        }
    };

    // Handle canceling a quiz without saving results
    const cancelQuiz = () => {
        // Reset the quiz state and go back to the exam selector
        setQuestions([]);
        setShowExamSelector(true);
        setCurrentQuestionIndex(0);
        setUserAnswers([]);
        setQuizCompleted(false);
        setTimerActive(false);
    };

    // Handle exam selection
    const handleSelectExam = (examId: string) => {
        setSelectedExamId(examId);
        startQuiz(examId);
    };

    // Start the quiz with the selected exam
    const startQuiz = (examId?: string) => {
        logAction("start-quiz");
        setShowExamSelector(false);
        loadSelectedExam(examId || selectedExamId);
    };

    const restartQuiz = () => {
        // Reset the quiz state and go back to the exam selector
        setQuestions([]);
        setShowExamSelector(true);
        setCurrentQuestionIndex(0);
        setUserAnswers([]);
        setQuizCompleted(false);
        setTimerActive(false);
    };

    return (
        <main className="flex-grow container mx-auto px-4 py-6 flex flex-col items-center justify-center">
            {showExamSelector ? (
                <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">
                            {t("app.selectExam")}
                        </h2>
                    </div>

                    <ExamSelector
                        options={availableExams}
                        onSelectExam={handleSelectExam}
                    />
                </div>
            ) : !quizCompleted ? (
                questions.length > 0 && (
                    <div className="w-full max-w-3xl">
                        <Quiz
                            question={questions[currentQuestionIndex]}
                            currentQuestion={currentQuestionIndex + 1}
                            totalQuestions={questions.length}
                            timeRemaining={timeRemaining}
                            setTimeRemaining={setTimeRemaining}
                            timerActive={timerActive}
                            onAnswer={handleAnswer}
                            onCancel={cancelQuiz}
                            onTimeout={() => {
                                // Auto-submit the quiz when time runs out
                                setQuizCompleted(true);
                                setTimerActive(false);

                                // Create a new quiz attempt with current answers
                                const correctCount = userAnswers.filter(
                                    (answer) => answer.isCorrect
                                ).length;
                                const score = Math.round(
                                    (correctCount / questions.length) * 100
                                );

                                const newQuizAttempt: QuizAttempt = {
                                    date: new Date().toISOString(),
                                    score,
                                    correctAnswers: correctCount,
                                    totalQuestions: questions.length,
                                    answers: userAnswers,
                                    examId: selectedExamId,
                                    timeExpired: true, // Flag to indicate the quiz was ended due to timeout
                                };

                                // Add the new attempt to history
                                addQuizAttempt(newQuizAttempt);
                            }}
                            isWrongAnswersPractice={isWrongAnswersPractice}
                        />
                    </div>
                )
            ) : (
                <Results userAnswers={userAnswers} restartQuiz={restartQuiz} />
            )}
        </main>
    );
};

export default QuizSelectorPage;
