import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { FiAward, FiUser, FiCalendar, FiCheckCircle } from 'react-icons/fi';
import './Leaderboard.css';

const Leaderboard = () => {
    const { quizId } = useParams();
    const [loading, setLoading] = useState(true);
    const [leaderboardData, setLeaderboardData] = useState(null);
    const [quizInfo, setQuizInfo] = useState(null);

    useEffect(() => {
        fetchLeaderboard();
    }, [quizId]);

    const fetchLeaderboard = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/leaderboard/${quizId}`);
            setLeaderboardData(response.data.leaderboard);
            setQuizInfo(response.data.quiz);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRankBadge = (rank) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return `#${rank}`;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="leaderboard-page">
                <div className="container">
                    <div className="flex-center" style={{ minHeight: '60vh' }}>
                        <div className="spinner"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!leaderboardData || leaderboardData.length === 0) {
        return (
            <div className="leaderboard-page">
                <div className="container">
                    <div className="empty-state">
                        <FiAward className="empty-icon" />
                        <h2>No Attempts Yet</h2>
                        <p>Be the first to take this quiz!</p>
                        <Link to="/quizzes" className="btn btn-primary">
                            Browse Quizzes
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="leaderboard-page">
            <div className="container">
                <div className="leaderboard-header">
                    <div className="header-content">
                        <FiAward className="trophy-icon" />
                        <div>
                            <h1>Leaderboard</h1>
                            {quizInfo && (
                                <p className="quiz-title">{quizInfo.title}</p>
                            )}
                        </div>
                    </div>
                    <Link to="/quizzes" className="btn btn-secondary">
                        Back to Quizzes
                    </Link>
                </div>

                <div className="leaderboard-stats">
                    <div className="stat-box">
                        <FiUser />
                        <div>
                            <h3>{leaderboardData.length}</h3>
                            <p>Total Attempts</p>
                        </div>
                    </div>
                    {quizInfo && (
                        <>
                            <div className="stat-box">
                                <FiCheckCircle />
                                <div>
                                    <h3>{quizInfo.totalQuestions}</h3>
                                    <p>Questions</p>
                                </div>
                            </div>
                            <div className="stat-box">
                                <FiAward />
                                <div>
                                    <h3>{quizInfo.category}</h3>
                                    <p>Category</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="leaderboard-table-container">
                    <table className="leaderboard-table">
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>User</th>
                                <th>Score</th>
                                <th>Percentage</th>
                                <th>Correct Answers</th>
                                <th>Completed</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaderboardData.map((entry, index) => (
                                <tr key={index} className={`rank-${entry.rank <= 3 ? entry.rank : 'other'}`}>
                                    <td>
                                        <span className="rank-badge">{getRankBadge(entry.rank)}</span>
                                    </td>
                                    <td>
                                        <div className="user-info">
                                            <div className="user-details">
                                                <span className="user-name">{entry.name}</span>
                                                <span className="user-email">{entry.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="score-value">
                                            {entry.score}/{entry.totalQuestions}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="percentage-bar">
                                            <div
                                                className="percentage-fill"
                                                style={{ width: `${entry.percentage}%` }}
                                            ></div>
                                            <span className="percentage-text">{entry.percentage}%</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="correct-count">
                                            <FiCheckCircle /> {entry.answers.filter(a => a.isCorrect).length}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="completion-date">
                                            <FiCalendar /> {formatDate(entry.completedAt)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;
