import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    const handleSuccess = async (credentialResponse) => {
        const result = await login(credentialResponse.credential);

        if (result.success) {
            navigate('/');
        } else {
            alert(result.error || 'Login failed. Please try again.');
        }
    };

    const handleError = () => {
        alert('Login failed. Please try again.');
    };

    return (
        <div className="login-wrapper">
            <div className="login-content-centered">
                <div className="brand-logo">
                    <img src="/navgurukul_logo.png" alt="navgurukul" className="nav-logo" />
                    {/* Fallback text if logo doesn't load immediately or to match style if transparent bg looks better with dark text */}
                </div>

                <h1 className="login-title">Campus Learning<br />Dashboard</h1>
                <p className="login-subtitle">Sign in to access your learning journey</p>

                <div className="info-card">
                    <div className="info-icon-wrapper">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                    </div>
                    <div className="info-text">
                        <h3>Navgurukul Access Only</h3>
                        <p>Only users with <strong>@navgurukul.org</strong> email addresses can access this platform.</p>
                    </div>
                </div>

                <div className="google-btn-container">
                    <GoogleLogin
                        onSuccess={handleSuccess}
                        onError={handleError}
                        useOneTap
                        theme="filled_white"
                        size="large"
                        text="continue_with"
                        shape="rectangular"
                        width="320"
                    />
                </div>

                <p className="terms-footer">
                    By signing in, you agree to our Terms of Service and Privacy Policy
                </p>
            </div>
        </div>
    );
};

export default Login;
