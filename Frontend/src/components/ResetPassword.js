import React, { useState } from 'react';
import { Container, Form, Button, Alert, Card } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { token } = useParams();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return setStatus({
                type: 'danger',
                message: 'Passwords do not match'
            });
        }

        setLoading(true);
        try {
            await axios.put(`${process.env.REACT_APP_API_URL}/auth/reset-password/${token}`, { 
                password 
            });
            setStatus({
                type: 'success',
                message: 'Password has been reset successfully'
            });
            setTimeout(() => navigate('/login'), 3000);
        } catch (error) {
            setStatus({
                type: 'danger',
                message: error.response?.data?.message || 'Error resetting password'
            });
        }
        setLoading(false);
    };

    return (
        <Container className="mt-5">
            <Card className="shadow-sm" style={{ maxWidth: '500px', margin: '0 auto' }}>
                <Card.Body>
                    <h2 className="text-center mb-4">Set New Password</h2>
                    {status.message && (
                        <Alert variant={status.type}>{status.message}</Alert>
                    )}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>New Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Enter new password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Confirm Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Button 
                            type="submit" 
                            variant="primary" 
                            className="w-100"
                            disabled={loading}
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default ResetPassword;