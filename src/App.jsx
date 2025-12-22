import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Home from './pages/Home';
import Quizzes from './pages/Quizzes';
import TakeQuiz from './pages/TakeQuiz';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import Submissions from './pages/Submissions';
import Leaderboard from './pages/Leaderboard';
import GlobalLeaderboard from './pages/GlobalLeaderboard';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your_google_client_id_here';

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />

      <Route
        path="/quizzes"
        element={
          <PrivateRoute>
            <Quizzes />
          </PrivateRoute>
        }
      />

      <Route
        path="/quiz/:id"
        element={
          <PrivateRoute>
            <TakeQuiz />
          </PrivateRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <PrivateRoute adminOnly={true}>
            <Admin />
          </PrivateRoute>
        }
      />

      <Route
        path="/submissions"
        element={
          <PrivateRoute adminOnly={true}>
            <Submissions />
          </PrivateRoute>
        }
      />

      <Route
        path="/leaderboard/:quizId"
        element={
          <PrivateRoute>
            <Leaderboard />
          </PrivateRoute>
        }
      />

      <Route
        path="/leaderboard"
        element={
          <PrivateRoute>
            <GlobalLeaderboard />
          </PrivateRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Router>
          <div className="app">
            <AuthWrapper />
          </div>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

function AuthWrapper() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <>
      {isAuthenticated && <Navbar />}
      <AppRoutes />
    </>
  );
}

export default App;
