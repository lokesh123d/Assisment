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
    const [result, setResult] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        // Load saved state if exists
        const savedState = localStorage.getItem(`quiz_state_${id}`);
        if (savedState) {
            const parsed = JSON.parse(savedState);
            setAnswers(parsed.answers || {});
            setCurrentQuestion(parsed.currentQuestion || 0);
            if (parsed.timeLeft) setTimeLeft(parsed.timeLeft);
        }
    }, [id]);

    useEffect(() => {
        // Save state on change
        if (quiz && !showResults) {
            const state = {
                answers,
                currentQuestion,
                timeLeft
            };
            localStorage.setItem(`quiz_state_${id}`, JSON.stringify(state));
        }
    }, [answers, currentQuestion, timeLeft, quiz, showResults, id]);

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

            const savedState = localStorage.getItem(`quiz_state_${id}`);
            if (!savedState) {
                setTimeLeft((response.data.quiz.timeLimit || 30) * 60);
            }
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

    const handleQuit = () => {
        if (window.confirm("Are you sure you want to quit? Your progress will be lost.")) {
            localStorage.removeItem(`quiz_state_${id}`);
            navigate('/quizzes');
        }
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
        try {
            setLoading(true);
            const formattedAnswers = Object.entries(answers).map(([questionId, selectedAnswer]) => ({
                questionId,
                selectedAnswer
            }));

            const response = await api.post(`/quizzes/${id}/submit`, {
                answers: formattedAnswers
            });

            console.log('Submission result:', response.data);
            setResult(response.data.result);
            setShowResults(true);
            localStorage.removeItem(`quiz_state_${id}`);
        } catch (error) {
            console.error('Error submitting quiz:', error);
            alert('Failed to submit quiz');
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading && !quiz) {
        return <div className="loading-spinner"><div className="spinner"></div></div>;
    }

    if (showResults && result) {
        return (
            <div className="take-quiz-page fade-in">
                <div className="container">
                    <div className="results-card card-glass">
                        <div className="score-section">
                            <div className="score-circle">
                                <span className="score-text">{result.percentage}%</span>
                                <span className="score-label">Score</span>
                            </div>
                            <h2>{result.passed ? 'Congratulations! 🎉' : 'Keep Learning! 📚'}</h2>
                            <p>You scored {result.score} out of {result.totalQuestions}</p>

                            <div className="results-actions">
                                <button className="btn btn-primary" onClick={() => navigate('/quizzes')}>
                                    Back to Quizzes
                                </button>
                                <button className="btn btn-secondary" onClick={() => navigate('/leaderboard')}>
                                    View Leaderboard
                                </button>
                            </div>
                        </div>

                        <div className="detailed-analysis">
                            <h3>Detailed Analysis</h3>
                            <div className="answers-list">
                                {result.detailedAnswers.map((answer, index) => (
                                    <div key={index} className={`answer-item ${answer.isCorrect ? 'correct' : 'incorrect'}`}>
                                        <div className="question-header">
                                            <span className="question-number">Question {index + 1}</span>
                                            {answer.isCorrect ? (
                                                <FiCheckCircle className="icon-success" />
                                            ) : (
                                                (answer.type === 'long-answer' || answer.type === 'short-answer' || answer.type === 'code-write') ? (
                                                    <span className="status-pending" title="Pending Review">
                                                        <FiClock className="icon-warning" /> Pending
                                                    </span>
                                                ) : (
                                                    <FiXCircle className="icon-error" />
                                                )
                                            )}
                                        </div>

                                        <p className="question-text">{answer.question}</p>

                                        <div className="options-review">
                                            {(!answer.type || answer.type === 'mcq') && answer.options && answer.options.map((opt, i) => (
                                                <div key={i} className={`review-option 
                                                    ${i === answer.correctAnswer ? 'correct-option' : ''}
                                                    ${i === answer.selectedAnswer && i !== answer.correctAnswer ? 'wrong-selection' : ''}
                                                `}>
                                                    {opt}
                                                </div>
                                            ))}
                                            {(answer.type === 'code-output' || answer.type === 'short-answer') && (
                                                <div className="text-review">
                                                    <p><strong>Your Answer:</strong> {answer.selectedAnswer}</p>
                                                    <p><strong>Correct Answer:</strong> {answer.correctAnswer}</p>
                                                </div>
                                            )}
                                            {(answer.type === 'long-answer' || answer.type === 'code-write') && (
                                                <div className="text-review">
                                                    <p><strong>Your Answer:</strong></p>
                                                    <pre>{answer.selectedAnswer}</pre>
                                                </div>
                                            )}
                                        </div>

                                        {answer.explanation && (
                                            <div className="explanation">
                                                <strong>Explanation:</strong> {answer.explanation}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const question = quiz.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

    return (
        <div className="take-quiz-page fade-in">
            <div className="container">
                <div className="quiz-header card-glass">
                    <div className="header-content">
                        <div>
                            <h2>{quiz.title}</h2>
                            <div className="timer-badge">
                                <FiClock /> {formatTime(timeLeft)}
                            </div>
                        </div>
                        <button className="btn btn-danger btn-sm" onClick={handleQuit} style={{ marginLeft: 'auto' }}>
                            Quit Quiz
                        </button>
                    </div>
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>

                <div className="question-card fade-in">
                    <div className="question-header">
                        <span className="question-number">Question {currentQuestion + 1}</span>
                    </div>

                    <h2 className="question-text">{question.question}</h2>

                    <div className="question-content">
                        {/* 1. MCQ / True-False / Default */}
                        {(!question.type || question.type === 'mcq' || question.type === 'true-false') && (
                            <div className="options-list">
                                {question.options.map((option, index) => (
                                    <button
                                        key={index}
                                        className={`option-button ${answers[question._id] === index ? 'selected' : ''}`}
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
                        )}

                        {/* 2. Short Answer / Long Answer (Essay) */}
                        {(question.type === 'short-answer' || question.type === 'long-answer') && (
                            <div className="written-answer-section">
                                <textarea
                                    className="written-input"
                                    placeholder="Type your answer here..."
                                    rows={question.type === 'long-answer' ? 8 : 3}
                                    value={answers[question._id] || ''}
                                    onChange={(e) => handleAnswerSelect(question._id, e.target.value)}
                                />
                                <div className="word-count">
                                    {answers[question._id] ? answers[question._id].split(/\s+/).filter(w => w.length > 0).length : 0} words
                                    {question.maxWords ? ` / ${question.maxWords} max` : ''}
                                </div>
                            </div>
                        )}

                        {/* 3. Code Output Prediction */}
                        {question.type === 'code-output' && (
                            <div className="code-output-section">
                                <pre className="code-snippet">
                                    <code>{question.codeSnippet}</code>
                                </pre>
                                <div className="output-input-wrapper">
                                    <label>Predicted Output:</label>
                                    <input
                                        type="text"
                                        className="output-input"
                                        placeholder="Enter the code output..."
                                        value={answers[question._id] || ''}
                                        onChange={(e) => handleAnswerSelect(question._id, e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        {/* 4. Code Writing */}
                        {question.type === 'code-write' && (
                            <div className="code-write-section">
                                <div className="code-header">
                                    <span>Language: {question.language || 'Any'}</span>
                                </div>
                                <textarea
                                    className="code-editor-input"
                                    placeholder={`// Write your ${question.language || 'code'} here...`}
                                    value={answers[question._id] || ''}
                                    onChange={(e) => handleAnswerSelect(question._id, e.target.value)}
                                    spellCheck="false"
                                />
                            </div>
                        )}
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
                                disabled={!answers[question._id]}
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
