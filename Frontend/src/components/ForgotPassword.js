import React, { useState } from 'react';
import { Container, Form, Button, Alert, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
            setStatus({
                type: 'success',
                message: 'If an account exists with this email, you will receive a password reset link'
            });
        } catch (error) {
            setStatus({
                type: 'danger',
                message: 'Something went wrong. Please try again.'
            });
        }
        setLoading(false);
    };

    return (
        <Container className="mt-5">
            <Card className="shadow-sm" style={{ maxWidth: '500px', margin: '0 auto' }}>
                <Card.Body>
                    <h2 className="text-center mb-4">Reset Password</h2>
                    {status.message && (
                        <Alert variant={status.type}>{status.message}</Alert>
                    )}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Email Address</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <Form.Text className="text-muted">
                                We'll send a password reset link to this email address.
                            </Form.Text>
                        </Form.Group>
                        <Button 
                            type="submit" 
                            variant="primary" 
                            className="w-100"
                            disabled={loading}
                        >
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </Button>
                        <div className="text-center mt-3">
                            <Link to="/login">Back to Login</Link>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default ForgotPassword;