import React, { useState, useEffect } from 'react';
import { Container, Table, Card, Button, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
    const [users, setUsers] = useState([]);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user?.isAdmin) {
            navigate('/dashboard');
            return;
        }

        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('token');
                const { data } = await axios.get(
                    `${process.env.REACT_APP_API_URL}/auth/users`, 
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );
                setUsers(data);
            } catch (error) {
                console.error('Error fetching users:', error.response?.data || error.message);
                if (error.response?.status === 401) {
                    // Handle unauthorized error
                    logout();
                    navigate('/login');
                }
            }
        };

        fetchUsers();
    }, [user, navigate]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <Container className="mt-4 mb-4">
            <Row>
                <Col>
                    <Card className="shadow-sm mb-4">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <Card.Title>Admin Dashboard</Card.Title>
                                    <Card.Text>
                                        Welcome administrator: {user?.username}
                                    </Card.Text>
                                </div>
                                <div>
                                    <Button 
                                        variant="outline-danger" 
                                        onClick={handleLogout}
                                        className="me-2"
                                    >
                                        Logout
                                    </Button>
                                    <Button 
                                        variant="secondary" 
                                        onClick={() => navigate('/dashboard')}
                                    >
                                        View Dashboard
                                    </Button>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col>
                    <Card className="shadow-sm">
                        <Card.Body>
                            <Card.Title className="mb-4">User Statistics</Card.Title>
                            <div className="table-responsive">
                                <Table striped bordered hover>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Username</th>
                                            <th>Email</th>
                                            <th>API Calls</th>
                                            <th>Join Date</th>
                                            <th>Admin</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((user, index) => (
                                            <tr key={user._id}>
                                                <td>{index + 1}</td>
                                                <td>{user.username}</td>
                                                <td>{user.email}</td>
                                                <td>{user.apiCalls}</td>
                                                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                                <td>{user.isAdmin ? 'Yes' : 'No'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Admin;
