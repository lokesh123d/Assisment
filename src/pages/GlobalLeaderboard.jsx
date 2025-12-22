import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { FiAward, FiUser, FiCheckCircle, FiBarChart2 } from 'react-icons/fi';
import './Leaderboard.css';

const GlobalLeaderboard = () => {
    const [loading, setLoading] = useState(true);
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [totalUsers, setTotalUsers] = useState(0);

    useEffect(() => {
        fetchGlobalLeaderboard();
    }, []);

    const fetchGlobalLeaderboard = async () => {
        try {
            setLoading(true);
            const response = await api.get('/leaderboard/global/all');
            setLeaderboardData(response.data.leaderboard);
            setTotalUsers(response.data.totalUsers);
        } catch (error) {
            console.error('Error fetching global leaderboard:', error);
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

    return (
        <div className="leaderboard-page">
            <div className="container">
                <div className="leaderboard-header">
                    <div className="header-content">
                        <FiAward className="trophy-icon" style={{ color: '#FFD700' }} />
                        <div>
                            <h1>Global Leaderboard</h1>
                            <p className="quiz-title">Top Performers Across All Quizzes</p>
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
                            <h3>{totalUsers}</h3>
                            <p>Active Learners</p>
                        </div>
                    </div>
                    <div className="stat-box">
                        <FiAward />
                        <div>
                            <h3>Top 10</h3>
                            <p>Displayed</p>
                        </div>
                    </div>
                </div>

                <div className="leaderboard-table-container">
                    {leaderboardData.length > 0 ? (
                        <table className="leaderboard-table">
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Student</th>
                                    <th>Quizzes Taken</th>
                                    <th>Avg. Score</th>
                                    <th>Total Score</th>
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
                                            <div className="correct-count">
                                                <FiCheckCircle /> {entry.totalQuizzes}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="percentage-bar">
                                                <div
                                                    className="percentage-fill"
                                                    style={{ width: `${entry.averagePercentage}%` }}
                                                ></div>
                                                <span className="percentage-text">{entry.averagePercentage}%</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="score-value">{entry.totalScore}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="empty-state">
                            <FiBarChart2 className="empty-icon" />
                            <h2>No Data Available</h2>
                            <p>Start taking quizzes to appear on the leaderboard!</p>
                            <Link to="/quizzes" className="btn btn-primary">
                                Brows Quizzes
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GlobalLeaderboard;
