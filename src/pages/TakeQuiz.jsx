import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { FiClock, FiCheckCircle, FiXCircle, FiAward } from 'react-icons/fi';
import './TakeQuiz.css';

const TakeQuiz = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [results, setResults] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        fetchQuiz();
    }, [id]);

    useEffect(() => {
        if (quiz && !showResults && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        handleSubmit();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [quiz, showResults, timeLeft]);

    const fetchQuiz = async () => {
        try {
            const response = await api.get(`/quizzes/${id}`);
            setQuiz(response.data.quiz);
            setTimeLeft((response.data.quiz.timeLimit || 30) * 60); // Convert to seconds
        } catch (error) {
            console.error('Error fetching quiz:', error);
            alert('Failed to load quiz');
            navigate('/quizzes');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerSelect = (questionId, answerIndex) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answerIndex
        }));
    };

    const handleNext = () => {
        if (currentQuestion < quiz.questions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        const formattedAnswers = Object.entries(answers).map(([questionId, selectedAnswer]) => ({
            questionId,
            selectedAnswer
        }));

        try {
            const response = await api.post(`/quizzes/${id}/submit`, {
                answers: formattedAnswers
            });

            setResults(response.data.result);
            setShowResults(true);
        } catch (error) {
            console.error('Error submitting quiz:', error);
            alert('Failed to submit quiz');
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getScoreColor = (percentage) => {
        if (percentage >= 80) return 'score-excellent';
        if (percentage >= 60) return 'score-good';
        if (percentage >= 40) return 'score-average';
        return 'score-poor';
    };

    if (loading) {
        return (
            <div className="flex-center" style={{ minHeight: '100vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    if (showResults && results) {
        return (
            <div className="results-page">
                <div className="quiz-container">
                    <div className="results-card fade-in">
                        <div className="results-header">
                            <div className="trophy-icon">🏆</div>
                            <h1>Quiz Completed!</h1>
                            <p>Here's how you performed</p>
                        </div>

                        <div className={`score-display ${getScoreColor(results.percentage)}`}>
                            <div className="score-circle">
                                <div className="score-value">{results.percentage}%</div>
                                <div className="score-label">Score</div>
                            </div>
                            <div className="score-details">
                                <div className="score-item">
                                    <FiCheckCircle className="icon-success" />
                                    <span>{results.score} Correct</span>
                                </div>
                                <div className="score-item">
                                    <FiXCircle className="icon-error" />
                                    <span>{results.totalQuestions - results.score} Incorrect</span>
                                </div>
                                <div className="score-item">
                                    <FiAward className="icon-primary" />
                                    <span>{results.passed ? 'Passed' : 'Keep Practicing'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="detailed-answers">
                            <h2>Detailed Review</h2>
                            {results.detailedAnswers.map((answer, index) => (
                                <div key={index} className={`answer-review ${answer.isCorrect ? 'correct' : 'incorrect'}`}>
                                    <div className="answer-header">
                                        <span className="question-number">Question {index + 1}</span>
                                        {answer.isCorrect ? (
                                            <FiCheckCircle className="icon-success" />
                                        ) : (
                                            <FiXCircle className="icon-error" />
                                        )}
                                    </div>

                                    <p className="question-text">{answer.question}</p>

                                    <div className="answer-options">
                                        {answer.options.map((option, optIndex) => (
                                            <div
                                                key={optIndex}
                                                className={`answer-option ${optIndex === answer.correctAnswer ? 'correct-answer' : ''
                                                    } ${optIndex === answer.selectedAnswer && !answer.isCorrect ? 'wrong-answer' : ''
                                                    }`}
                                            >
                                                <span className="option-label">{String.fromCharCode(65 + optIndex)}.</span>
                                                <span>{option}</span>
                                                {optIndex === answer.correctAnswer && (
                                                    <FiCheckCircle className="option-icon" />
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {answer.explanation && (
                                        <div className="explanation">
                                            <strong>Explanation:</strong> {answer.explanation}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="results-actions">
                            <button onClick={() => navigate('/quizzes')} className="btn btn-primary">
                                Back to Quizzes
                            </button>
                            <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
                                View Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const question = quiz.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

    return (
        <div className="take-quiz-page">
            <div className="quiz-container">
                <div className="quiz-header">
                    <div className="quiz-info">
                        <h1>{quiz.title}</h1>
                        <div className="quiz-progress">
                            <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
                            <div className="progress-bar">
                                <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>
                    </div>

                    <div className="timer">
                        <FiClock />
                        <span className={timeLeft < 60 ? 'time-warning' : ''}>{formatTime(timeLeft)}</span>
                    </div>
                </div>

                <div className="question-card fade-in">
                    <div className="question-header">
                        <span className="question-number">Question {currentQuestion + 1}</span>
                    </div>

                    <h2 className="question-text">{question.question}</h2>

                    <div className="options-list">
                        {question.options.map((option, index) => (
                            <button
                                key={index}
                                className={`option-button ${answers[question._id] === index ? 'selected' : ''
                                    }`}
                                onClick={() => handleAnswerSelect(question._id, index)}
                            >
                                <span className="option-label">{String.fromCharCode(65 + index)}</span>
                                <span className="option-text">{option}</span>
                                {answers[question._id] === index && (
                                    <FiCheckCircle className="selected-icon" />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="question-navigation">
                        <button
                            onClick={handlePrevious}
                            disabled={currentQuestion === 0}
                            className="btn btn-secondary"
                        >
                            Previous
                        </button>

                        {currentQuestion === quiz.questions.length - 1 ? (
                            <button
                                onClick={handleSubmit}
                                disabled={Object.keys(answers).length !== quiz.questions.length}
                                className="btn btn-success"
                            >
                                Submit Quiz
                            </button>
                        ) : (
                            <button
                                onClick={handleNext}
                                className="btn btn-primary"
                            >
                                Next
                            </button>
                        )}
                    </div>

                    <div className="answered-count">
                        Answered: {Object.keys(answers).length} / {quiz.questions.length}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TakeQuiz;
