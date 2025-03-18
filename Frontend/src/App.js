import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import 'bootstrap/dist/css/bootstrap.min.css';
import Admin from './components/Admin';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';

const PrivateRoute = ({ children }) => {
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
  
    useEffect(() => {
        // Check if user exists and is admin
        if (!user) {
            navigate('/login');
        } else if (!user.isAdmin) {
            navigate('/dashboard');
        }
    }, [user, navigate]);
  
    // Only render children if user exists and is admin
    return user && user.isAdmin ? children : null;
};

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <Container>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
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
                                <AdminRoute>
                                    <Admin />
                                </AdminRoute>
                            }
                        />
                        <Route path="/" element={<Navigate to="/login" />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password/:token" element={<ResetPassword />} />    
                    </Routes>
                </Container>
            </Router>
        </AuthProvider>
    );
};

export default App;