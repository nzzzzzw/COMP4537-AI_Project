import React, { useState, useEffect } from 'react';
import { Container, Table, Card, Button, Row, Col, Modal } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
    const [users, setUsers] = useState([]);
    const [apiStats, setApiStats] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user?.isAdmin) {
            navigate('/dashboard');
            return;
        }

        fetchData();
    }, [user, navigate]);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = {
                'Authorization': `Bearer ${token}`
            };

            // Fetch users and API stats in parallel
            const [usersRes, statsRes] = await Promise.all([
                axios.get(`${process.env.REACT_APP_API_URL}/auth/users`, { headers }),
                axios.get(`${process.env.REACT_APP_API_URL}/auth/api-stats`, { headers })
            ]);

            setUsers(usersRes.data);
            setApiStats(statsRes.data);
        } catch (error) {
            console.error('Error fetching data:', error.response?.data || error.message);
            if (error.response?.status === 401) {
                logout();
                navigate('/login');
            }
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleDeleteUser = (user) => {
        setSelectedUser(user);
        setShowDeleteModal(true);
    };

    const confirmDeleteUser = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(
                `${process.env.REACT_APP_API_URL}/auth/users/${selectedUser._id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            // Update users list
            setUsers(users.filter(u => u._id !== selectedUser._id));
            setShowDeleteModal(false);
        } catch (error) {
            console.error('Error deleting user:', error.response?.data || error.message);
        }
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

            {/* API Stats Table */}
            <Row className="mb-4">
                <Col>
                    <Card className="shadow-sm">
                        <Card.Body>
                            <Card.Title className="mb-4">API Endpoint Statistics</Card.Title>
                            <div className="table-responsive">
                                <Table striped bordered hover>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Method</th>
                                            <th>Endpoint</th>
                                            <th>Requests</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {apiStats.map((stat, index) => (
                                            <tr key={stat._id}>
                                                <td>{index + 1}</td>
                                                <td>
                                                    <span className={`badge bg-${
                                                        stat.method === 'GET' ? 'success' : 
                                                        stat.method === 'POST' ? 'primary' : 
                                                        stat.method === 'PUT' ? 'warning' : 
                                                        'danger'
                                                    }`}>
                                                        {stat.method}
                                                    </span>
                                                </td>
                                                <td>{stat.endpoint}</td>
                                                <td>{stat.requests}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Users Table */}
            <Row>
                <Col>
                    <Card className="shadow-sm">
                        <Card.Body>
                            <Card.Title className="mb-4">User API Consumption</Card.Title>
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
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((userData, index) => (
                                            <tr key={userData._id}>
                                                <td>{index + 1}</td>
                                                <td>{userData.username}</td>
                                                <td>{userData.email}</td>
                                                <td>
                                                    <span className={`badge bg-${
                                                        userData.apiCalls >= 18 ? 'danger' : 
                                                        userData.apiCalls >= 10 ? 'warning' : 
                                                        'success'
                                                    }`}>
                                                        {userData.apiCalls}
                                                    </span>
                                                </td>
                                                <td>{new Date(userData.createdAt).toLocaleDateString()}</td>
                                                <td>{userData.isAdmin ? 'Yes' : 'No'}</td>
                                                <td>
                                                    <Button 
                                                        variant="outline-danger" 
                                                        size="sm"
                                                        onClick={() => handleDeleteUser(userData)}
                                                        disabled={userData._id === user?._id}
                                                    >
                                                        Delete
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Delete User Modal */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Delete User</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete {selectedUser?.username}? This action cannot be undone.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={confirmDeleteUser}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Admin;
