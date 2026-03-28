import { useState, useCallback } from 'react';
import { Brain, RotateCcw, CheckCircle, XCircle, Eye, ArrowRight } from 'lucide-react';
import { useGenerateQuiz, useSubmitQuiz } from '@/hooks/useQuiz';

type QuizMode = 'setup' | 'playing' | 'result';

interface QuizQuestion {
  id: string;
  word: string;
  correctAnswer: string;
  options?: string[];
  type: string;
}

export function QuizPage() {
  const [mode, setMode] = useState<QuizMode>('setup');
  const [quizType, setQuizType] = useState('FLASHCARD');
  const [questionCount, setQuestionCount] = useState(10);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [answers, setAnswers] = useState<
    Array<{ vocabularyId: string; answer: string; correct: boolean }>
  >([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [fetchQuiz, setFetchQuiz] = useState(false);

  const {
    data: questions,
    isLoading,
    refetch,
  } = useGenerateQuiz(quizType, questionCount, fetchQuiz);
  const submitMutation = useSubmitQuiz();

  const startQuiz = useCallback(() => {
    setMode('playing');
    setCurrentIndex(0);
    setAnswers([]);
    setShowAnswer(false);
    setSelectedOption(null);
    setFetchQuiz(true);
    refetch();
  }, [refetch]);

  const currentQuestion = questions?.[currentIndex];

  const handleFlashcardAnswer = (quality: 'easy' | 'hard' | 'wrong') => {
    if (!currentQuestion) return;

    const correct = quality !== 'wrong';
    setAnswers((prev) => [
      ...prev,
      { vocabularyId: currentQuestion.id, answer: quality, correct },
    ]);

    nextQuestion();
  };

  const handleMultipleChoiceAnswer = (option: string) => {
    if (!currentQuestion || selectedOption) return;

    setSelectedOption(option);
    const correct = option === currentQuestion.correctAnswer;

    setAnswers((prev) => [
      ...prev,
      { vocabularyId: currentQuestion.id, answer: option, correct },
    ]);

    setTimeout(() => {
      setSelectedOption(null);
      nextQuestion();
    }, 1000);
  };

  const nextQuestion = () => {
    setShowAnswer(false);

    if (currentIndex + 1 >= (questions?.length || 0)) {
      finishQuiz();
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  const finishQuiz = () => {
    setMode('result');
    submitMutation.mutate({ quizType, answers });
  };

  if (mode === 'setup') {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Quiz</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Practice your vocabulary with quizzes
        </p>

        <div className="mt-8 mx-auto max-w-md">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Quiz Settings</h2>

            <div className="mt-4 space-y-4">
              <div>
                <label className="input-label">Quiz Type</label>
                <select
                  value={quizType}
                  onChange={(e) => setQuizType(e.target.value)}
                  className="input-field"
                >
                  <option value="FLASHCARD">Flashcards</option>
                  <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                </select>
              </div>

              <div>
                <label className="input-label">Number of Questions</label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="input-field"
                >
                  <option value={5}>5 questions</option>
                  <option value={10}>10 questions</option>
                  <option value={20}>20 questions</option>
                </select>
              </div>

              <button onClick={startQuiz} className="btn-primary w-full">
                <Brain className="mr-2 h-4 w-4" />
                Start Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || !questions) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-pulse text-gray-400 dark:text-gray-500">Generating quiz...</div>
      </div>
    );
  }

  if (mode === 'result') {
    const correct = answers.filter((a) => a.correct).length;
    const total = answers.length;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

    return (
      <div className="mx-auto max-w-md pt-12">
        <div className="card p-8 text-center">
          <div
            className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${
              percentage >= 70
                ? 'bg-green-100 dark:bg-green-950'
                : 'bg-secondary-100 dark:bg-secondary-950'
            }`}
          >
            {percentage >= 70 ? (
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
            ) : (
              <Brain className="h-10 w-10 text-secondary-600 dark:text-secondary-400" />
            )}
          </div>

          <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
            {percentage}% Correct
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {correct} out of {total} answers correct
          </p>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => {
                setMode('setup');
                setFetchQuiz(false);
              }}
              className="btn-secondary flex-1"
            >
              Back
            </button>
            <button onClick={startQuiz} className="btn-primary flex-1">
              <RotateCcw className="mr-2 h-4 w-4" />
              Play Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Playing mode
  return (
    <div className="mx-auto max-w-lg pt-8">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span>{answers.filter((a) => a.correct).length} correct</span>
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className="h-2 rounded-full bg-primary-500 transition-all"
            style={{
              width: `${((currentIndex + 1) / questions.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {currentQuestion && quizType === 'FLASHCARD' ? (
        <FlashcardQuestion
          question={currentQuestion}
          showAnswer={showAnswer}
          onReveal={() => setShowAnswer(true)}
          onAnswer={handleFlashcardAnswer}
        />
      ) : currentQuestion ? (
        <MultipleChoiceQuestion
          question={currentQuestion}
          selectedOption={selectedOption}
          onSelect={handleMultipleChoiceAnswer}
        />
      ) : null}
    </div>
  );
}

function FlashcardQuestion({
  question,
  showAnswer,
  onReveal,
  onAnswer,
}: {
  question: QuizQuestion;
  showAnswer: boolean;
  onReveal: () => void;
  onAnswer: (quality: 'easy' | 'hard' | 'wrong') => void;
}) {
  return (
    <div className="card overflow-hidden">
      <div className="flex min-h-[240px] flex-col items-center justify-center p-8">
        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{question.word}</p>

        {showAnswer ? (
          <p className="mt-4 text-2xl text-primary-600 dark:text-primary-400">{question.correctAnswer}</p>
        ) : (
          <button
            onClick={onReveal}
            className="mt-6 flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            <Eye className="h-4 w-4" />
            Show Answer
          </button>
        )}
      </div>

      {showAnswer && (
        <div className="grid grid-cols-3 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={() => onAnswer('wrong')}
            className="flex items-center justify-center gap-2 border-r border-gray-200 py-3.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-gray-800 dark:text-red-400 dark:hover:bg-red-950"
          >
            <XCircle className="h-4 w-4" />
            Wrong
          </button>
          <button
            onClick={() => onAnswer('hard')}
            className="flex items-center justify-center gap-2 border-r border-gray-200 py-3.5 text-sm font-medium text-secondary-600 transition-colors hover:bg-secondary-50 dark:border-gray-800 dark:text-secondary-400 dark:hover:bg-secondary-950"
          >
            Hard
          </button>
          <button
            onClick={() => onAnswer('easy')}
            className="flex items-center justify-center gap-2 py-3.5 text-sm font-medium text-green-600 transition-colors hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950"
          >
            <CheckCircle className="h-4 w-4" />
            Easy
          </button>
        </div>
      )}
    </div>
  );
}

function MultipleChoiceQuestion({
  question,
  selectedOption,
  onSelect,
}: {
  question: QuizQuestion;
  selectedOption: string | null;
  onSelect: (option: string) => void;
}) {
  return (
    <div className="card p-8">
      <p className="text-center text-2xl font-bold text-gray-900 dark:text-gray-100">
        {question.word}
      </p>
      <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
        Select the correct translation
      </p>

      <div className="mt-6 space-y-3">
        {question.options?.map((option) => {
          const isSelected = selectedOption === option;
          const isCorrect = option === question.correctAnswer;
          const showResult = selectedOption !== null;

          let style = 'border-gray-200 hover:border-primary-300 hover:bg-primary-50 dark:border-gray-700 dark:hover:border-primary-600 dark:hover:bg-primary-950';
          if (showResult && isCorrect) {
            style = 'border-green-500 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400 dark:border-green-600';
          } else if (showResult && isSelected && !isCorrect) {
            style = 'border-red-500 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400 dark:border-red-600';
          }

          return (
            <button
              key={option}
              onClick={() => onSelect(option)}
              disabled={selectedOption !== null}
              className={`w-full rounded-lg border-2 px-4 py-3 text-left text-sm font-medium transition-colors ${style}`}
            >
              <span className="flex items-center justify-between">
                {option}
                {showResult && isCorrect && (
                  <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
                )}
                {showResult && isSelected && !isCorrect && (
                  <XCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
