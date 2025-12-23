import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiUser, FiHome, FiList, FiPlusCircle, FiBarChart2, FiFileText, FiMenu, FiX, FiAward } from 'react-icons/fi';
import { useState } from 'react';
import './Navbar.css';

const Navbar = () => {
    const { user, logout, isAdmin } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const closeMenu = () => {
        setMenuOpen(false);
    };

    return (
        <nav className="navbar">
            <div className="container">
                <div className="navbar-content">
                    <Link to="/" className="navbar-brand" onClick={closeMenu}>
                        <img src="/navgurukul_logo.png" alt="QuizMaster" className="navbar-logo-img" style={{ maxHeight: '40px' }} />
                    </Link>

                    <div className="navbar-actions">
                        {user && (
                            <div className="user-profile-header">
                                <img src={user.picture} alt={user.name} className="user-avatar" />
                            </div>
                        )}
                        <button className="menu-toggle" onClick={toggleMenu}>
                            {menuOpen ? <FiX /> : <FiMenu />}
                        </button>
                    </div>

                    <div className={`navbar-menu ${menuOpen ? 'active' : ''}`}>
                        {user && (
                            <div className="mobile-user-profile">
                                <img src={user.picture} alt={user.name} className="mobile-avatar" />
                                <div className="mobile-user-details">
                                    <span className="mobile-user-name">{user.name}</span>
                                    <span className="mobile-user-role">{user.role}</span>
                                </div>
                            </div>
                        )}

                        <Link to="/" className="nav-link" onClick={closeMenu}>
                            <FiHome /> Home
                        </Link>
                        <Link to="/quizzes" className="nav-link" onClick={closeMenu}>
                            <FiList /> Quizzes
                        </Link>
                        <Link to="/leaderboard" className="nav-link" onClick={closeMenu}>
                            <FiAward /> Leaderboard
                        </Link>
                        {isAdmin && (
                            <>
                                <Link to="/admin" className="nav-link admin-link" onClick={closeMenu}>
                                    <FiPlusCircle /> Create Quiz
                                </Link>
                                <Link to="/submissions" className="nav-link admin-link" onClick={closeMenu}>
                                    <FiFileText /> Submissions
                                </Link>
                            </>
                        )}
                        <Link to="/dashboard" className="nav-link" onClick={closeMenu}>
                            <FiBarChart2 /> Dashboard
                        </Link>

                        {user && (
                            <button onClick={() => { logout(); closeMenu(); }} className="nav-link btn-logout-mobile">
                                <FiLogOut /> Logout
                            </button>
                        )}
                    </div>

                    <div className="navbar-user desktop-only">
                        {user && (
                            <>
                                <div className="user-info">
                                    <img src={user.picture} alt={user.name} className="user-avatar" />
                                    <div className="user-details">
                                        <span className="user-name">{user.name}</span>
                                        <span className="user-role">{user.role}</span>
                                    </div>
                                </div>
                                <button onClick={logout} className="btn-logout">
                                    <FiLogOut /> Logout
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
