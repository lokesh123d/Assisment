import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { FiTrendingUp, FiAward, FiClock, FiTarget } from 'react-icons/fi';
import './Dashboard.css';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, historyRes] = await Promise.all([
                api.get('/users/stats'),
                api.get('/users/history')
            ]);

            setStats(statsRes.data.stats);
            setHistory(historyRes.data.history);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getGradeColor = (percentage) => {
        if (percentage >= 80) return 'grade-a';
        if (percentage >= 60) return 'grade-b';
        if (percentage >= 40) return 'grade-c';
        return 'grade-d';
    };

    const getGradeLetter = (percentage) => {
        if (percentage >= 80) return 'A';
        if (percentage >= 60) return 'B';
        if (percentage >= 40) return 'C';
        return 'D';
    };

    if (loading) {
        return (
            <div className="flex-center" style={{ minHeight: '80vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            <div className="container">
                <div className="dashboard-header fade-in">
                    <div>
                        <h1>Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
                        <p>Here's your learning progress</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card-large fade-in">
                        <div className="stat-info-text">
                            <h3>Total Quizzes</h3>
                            <p className="stat-value">{stats?.totalQuizzes || 0}</p>
                        </div>
                        <div className="stat-indicator indicator-blue"></div>
                    </div>

                    <div className="stat-card-large fade-in" style={{ animationDelay: '0.1s' }}>
                        <div className="stat-info-text">
                            <h3>Average Score</h3>
                            <p className="stat-value">{stats?.averagePercentage || 0}%</p>
                        </div>
                        <div className="stat-indicator indicator-green"></div>
                    </div>

                    <div className="stat-card-large fade-in" style={{ animationDelay: '0.2s' }}>
                        <div className="stat-info-text">
                            <h3>Questions Answered</h3>
                            <p className="stat-value">{stats?.totalQuestions || 0}</p>
                        </div>
                        <div className="stat-indicator indicator-orange"></div>
                    </div>

                    <div className="stat-card-large fade-in" style={{ animationDelay: '0.3s' }}>
                        <div className="stat-info-text">
                            <h3>Correct Answers</h3>
                            <p className="stat-value">{stats?.totalScore || 0}</p>
                        </div>
                        <div className="stat-indicator indicator-purple"></div>
                    </div>
                </div>

                {/* Performance Chart */}
                {stats && stats.averagePercentage > 0 && (
                    <div className="performance-card fade-in">
                        <h2>Overall Performance</h2>
                        <div className="performance-visual">
                            <div className="linear-progress-wrapper">
                                <div className="progress-info-row">
                                    <span className="progress-label">Average Score</span>
                                    <span className="progress-value-text">{stats.averagePercentage}%</span>
                                </div>
                                <div className="linear-progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${stats.averagePercentage}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div className="performance-insights">
                                <div className="insight-item">
                                    <span className="insight-label">Grade</span>
                                    <span className={`insight-value ${getGradeColor(stats.averagePercentage)}`}>
                                        {getGradeLetter(stats.averagePercentage)}
                                    </span>
                                </div>
                                <div className="insight-item">
                                    <span className="insight-label">Status</span>
                                    <span className="insight-value">
                                        {stats.averagePercentage >= 60 ? '✅ Passing' : '📚 Keep Learning'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quiz History */}
                <div className="history-section">
                    <div className="section-header">
                        <h2>Recent Quiz History</h2>
                        {history.length > 0 && (
                            <Link to="/quizzes" className="btn btn-primary">
                                Take Another Quiz
                            </Link>
                        )}
                    </div>

                    {history.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">📊</div>
                            <h3>No Quiz History Yet</h3>
                            <p>Start taking quizzes to see your progress here!</p>
                            <Link to="/quizzes" className="btn btn-primary">
                                Browse Quizzes
                            </Link>
                        </div>
                    ) : (
                        <div className="history-list">
                            {history.map((item, index) => (
                                <div key={index} className="history-item fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                                    <div className="history-info">
                                        <h3>{item.quizId?.title || 'Quiz'}</h3>
                                        <div className="history-meta">
                                            <span className="meta-badge">
                                                {item.quizId?.category || 'General'}
                                            </span>
                                            <span className="meta-badge">
                                                {item.quizId?.difficulty || 'Medium'}
                                            </span>
                                            <span className="meta-date">
                                                {new Date(item.completedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="history-score">
                                        <div className={`score-badge ${getGradeColor(item.percentage)}`}>
                                            <span className="score-percentage">{item.percentage}%</span>
                                            <span className="score-fraction">{item.score}/{item.totalQuestions}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
