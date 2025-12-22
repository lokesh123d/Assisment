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
        <div className="login-page">
            <div className="login-sidebar">
                <div className="sidebar-brand">
                    <div className="brand-icon">📝</div>
                    <span>QuizMaster</span>
                </div>
            </div>

            <div className="login-main">
                <div className="login-container">
                    <div className="login-box">
                        <h1>Welcome back</h1>

                        <div className="form-group">
                            <label>Email address</label>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="form-input"
                                disabled
                            />
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                placeholder="Enter password"
                                className="form-input"
                                disabled
                            />
                        </div>

                        <div className="form-options">
                            <label className="checkbox-label">
                                <input type="checkbox" disabled />
                                <span>Remember me for 30 days</span>
                            </label>
                            <a href="#" className="forgot-link">Forgot password?</a>
                        </div>

                        <button className="btn-signin" disabled>
                            Sign in
                        </button>

                        <div className="divider">
                            <span>Or sign in with Google</span>
                        </div>

                        <div className="google-signin">
                            <GoogleLogin
                                onSuccess={handleSuccess}
                                onError={handleError}
                                useOneTap
                                theme="outline"
                                size="large"
                                text="signin_with"
                                shape="rectangular"
                                width="100%"
                            />
                        </div>

                        <div className="signup-link">
                            New to QuizMaster? <a href="#">Sign up</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
