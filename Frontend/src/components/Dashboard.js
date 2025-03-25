import React from 'react';
import { Container, Card, Button, Row, Col, Badge } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Chatbot from './Chatbot';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Calculate API usage percentage
    const apiUsagePercent = user?.apiCalls ? (user.apiCalls / 20) * 100 : 0;
    
    // Determine badge color based on usage
    const getBadgeVariant = () => {
        if (apiUsagePercent >= 90) return "danger";
        if (apiUsagePercent >= 70) return "warning";
        return "success";
    };

    return (
        <Container>
            <Row className="mt-4">
                <Col>
                    <Card className="shadow-sm">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <Card.Title>Welcome, {user?.username}!</Card.Title>
                                    <Card.Text>
                                        Email: {user?.email}
                                    </Card.Text>
                                    <Card.Text>
                                        API Usage: <Badge bg={getBadgeVariant()}>{user?.apiCalls || 0}/20 calls</Badge>
                                        {user?.apiCalls >= 20 && (
                                            <span className="ms-2 text-danger">
                                                (You've reached your free limit)
                                            </span>
                                        )}
                                    </Card.Text>
                                    {user?.isAdmin && (
                                        <Link to="/admin" className="btn btn-primary">
                                            Admin Dashboard
                                        </Link>
                                    )}
                                </div>
                                <Button variant="outline-danger" onClick={handleLogout}>
                                    Logout
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <Row className="mt-4">
                <Col>
                    <Chatbot />
                </Col>
            </Row>
        </Container>
    );
};
export default Dashboard;