import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiArrowRight, FiAward, FiTrendingUp, FiZap } from 'react-icons/fi';
import './Home.css';

const Home = () => {
    const { user, isAdmin } = useAuth();

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="container">
                    <div className="hero-content fade-in">
                        <h1 className="hero-title">
                            Master Your Knowledge with
                            <span className="gradient-text"> AI-Powered Quizzes</span>
                        </h1>
                        <p className="hero-description">
                            Take interactive quizzes, track your progress, and achieve your learning goals
                            with our intelligent quiz platform designed for Navgurukul students.
                        </p>
                        <div className="hero-actions">
                            <Link to="/quizzes" className="btn btn-primary btn-large">
                                Start Learning <FiArrowRight />
                            </Link>
                            {isAdmin && (
                                <Link to="/admin" className="btn btn-secondary btn-large">
                                    Create Quiz
                                </Link>
                            )}
                        </div>
                    </div>


                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="container">
                    <div className="stats-grid">
                        <div className="stat-item">
                            <div className="stat-number">14+</div>
                            <div className="stat-label">Question Types</div>
                            <p>MCQ, Code, Fill Blanks & More</p>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number">100%</div>
                            <div className="stat-label">Free Forever</div>
                            <p>No Hidden Charges</p>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number">24/7</div>
                            <div className="stat-label">Available</div>
                            <p>Learn Anytime, Anywhere</p>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number">∞</div>
                            <div className="stat-label">Practice Tests</div>
                            <p>Unlimited Attempts</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Features */}
            <section className="quick-features-section">
                <div className="container">
                    <div className="section-header">
                        <h2>Powerful Features</h2>
                        <p>Everything you need for effective learning</p>
                    </div>

                    <div className="quick-features-grid">
                        <div className="quick-feature">
                            <span className="qf-icon">⚡</span>
                            <h4>Instant Results</h4>
                            <p>Get scores immediately</p>
                        </div>
                        <div className="quick-feature">
                            <span className="qf-icon">📊</span>
                            <h4>Progress Tracking</h4>
                            <p>Monitor your growth</p>
                        </div>
                        <div className="quick-feature">
                            <span className="qf-icon">🏆</span>
                            <h4>Leaderboards</h4>
                            <p>Compete with peers</p>
                        </div>
                        <div className="quick-feature">
                            <span className="qf-icon">📱</span>
                            <h4>Mobile Friendly</h4>
                            <p>Works on all devices</p>
                        </div>
                        <div className="quick-feature">
                            <span className="qf-icon">🎯</span>
                            <h4>Smart Grading</h4>
                            <p>Automated evaluation</p>
                        </div>
                        <div className="quick-feature">
                            <span className="qf-icon">📝</span>
                            <h4>PDF Reports</h4>
                            <p>Download your results</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="how-it-works-section">
                <div className="container">
                    <div className="section-header">
                        <h2>How It Works</h2>
                        <p>Get started in three simple steps</p>
                    </div>

                    <div className="steps-container">
                        <div className="step-card">
                            <div className="step-number">1</div>
                            <h3>Choose a Quiz</h3>
                            <p>Browse through available quizzes or wait for your admin to create new ones</p>
                        </div>

                        <div className="step-arrow">→</div>

                        <div className="step-card">
                            <div className="step-number">2</div>
                            <h3>Take the Test</h3>
                            <p>Answer questions at your own pace with a clean, distraction-free interface</p>
                        </div>

                        <div className="step-arrow">→</div>

                        <div className="step-card">
                            <div className="step-number">3</div>
                            <h3>View Results</h3>
                            <p>Get instant feedback with detailed explanations and track your progress</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-content">
                        <h2>Ready to Start Your Learning Journey?</h2>
                        <p>Join hundreds of students already improving their knowledge</p>
                        <Link to="/quizzes" className="btn btn-primary btn-large">
                            Explore Quizzes <FiArrowRight />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
