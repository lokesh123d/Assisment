import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { FiClock, FiFileText, FiTrendingUp, FiPlay, FiAward } from 'react-icons/fi';
import './Quizzes.css';

const Quizzes = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        try {
            const response = await api.get('/quizzes');
            setQuizzes(response.data.quizzes);
        } catch (error) {
            console.error('Error fetching quizzes:', error);
            alert('Failed to load quizzes');
        } finally {
            setLoading(false);
        }
    };

    const filteredQuizzes = quizzes.filter(quiz => {
        if (filter === 'all') return true;
        return quiz.difficulty === filter;
    });

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'easy':
                return 'badge-success';
            case 'medium':
                return 'badge-warning';
            case 'hard':
                return 'badge-error';
            default:
                return 'badge-primary';
        }
    };

    if (loading) {
        return (
            <div className="flex-center" style={{ minHeight: '80vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="quizzes-page">
            <div className="container">
                <div className="page-header fade-in">
                    <div>
                        <h1>Available Quizzes</h1>
                        <p>Choose a quiz and test your knowledge</p>
                    </div>

                    <div className="filter-buttons">
                        <button
                            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            All
                        </button>
                        <button
                            className={`filter-btn ${filter === 'easy' ? 'active' : ''}`}
                            onClick={() => setFilter('easy')}
                        >
                            Easy
                        </button>
                        <button
                            className={`filter-btn ${filter === 'medium' ? 'active' : ''}`}
                            onClick={() => setFilter('medium')}
                        >
                            Medium
                        </button>
                        <button
                            className={`filter-btn ${filter === 'hard' ? 'active' : ''}`}
                            onClick={() => setFilter('hard')}
                        >
                            Hard
                        </button>
                    </div>
                </div>

                {filteredQuizzes.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📝</div>
                        <h2>No Quizzes Available</h2>
                        <p>Check back later for new quizzes!</p>
                    </div>
                ) : (
                    <div className="quizzes-grid">
                        {filteredQuizzes.map((quiz, index) => (
                            <div
                                key={quiz._id}
                                className="quiz-card fade-in"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="quiz-card-header">
                                    <h3>{quiz.title}</h3>
                                    <span className={`badge ${getDifficultyColor(quiz.difficulty)}`}>
                                        {quiz.difficulty}
                                    </span>
                                </div>

                                <p className="quiz-description">{quiz.description || 'Test your knowledge with this quiz'}</p>

                                <div className="quiz-meta">
                                    <div className="meta-item">
                                        <FiFileText />
                                        <span>{quiz.questions?.length || 0} Questions</span>
                                    </div>
                                    <div className="meta-item">
                                        <FiClock />
                                        <span>{quiz.timeLimit || 30} mins</span>
                                    </div>
                                    <div className="meta-item">
                                        <FiTrendingUp />
                                        <span>{quiz.category || 'General'}</span>
                                    </div>
                                </div>

                                <div className="quiz-card-actions">
                                    <Link to={`/quiz/${quiz._id}`} className="btn btn-primary">
                                        <FiPlay /> Start
                                    </Link>
                                    <Link to={`/leaderboard/${quiz._id}`} className="btn btn-secondary btn-icon">
                                        <FiAward />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Quizzes;
