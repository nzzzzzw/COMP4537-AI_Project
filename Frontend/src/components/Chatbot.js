import React, { useState } from 'react';
import axios from 'axios';
import { Container, Button, Form, Card, ProgressBar, Spinner, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const Chatbot = () => {
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(''); 

  const questions = [
    {
      question: 'How are you feeling today overall?',
      options: [
        'Very Happy 😊',
        'Somewhat Happy 🙂',
        'Neutral 😐',
        'Somewhat Sad 😕',
        'Very Sad 😢'
      ]
    },
    {
      question: 'How many hours did you sleep last night?',
      options: [
        'Less than 4 hours 😴',
        '4-6 hours 🛏️',
        '6-8 hours 💤',
        '8-10 hours 😌',
        'More than 10 hours 🌙'
      ]
    },
    {
      question: 'How would you rate your stress level?',
      options: [
        'No stress at all 😌',
        'Mild stress 😅',
        'Moderate stress 😓',
        'High stress 😖',
        'Severe stress 😣'
      ]
    },
    {
      question: 'How is your energy level today?',
      options: [
        'Very energetic ⚡',
        'Somewhat energetic 🌟',
        'Normal 🌞',
        'Somewhat tired 🌥️',
        'Very tired 💤'
      ]
    },
    {
      question: 'How would you describe your appetite today?',
      options: [
        'Very good appetite 🍽️',
        'Normal appetite 🍴',
        'Somewhat reduced 🥄',
        'Poor appetite 😕',
        'No appetite at all 😣'
      ]
    },
    {
      question: 'How well can you concentrate today?',
      options: [
        'Excellent focus 🎯',
        'Good focus 👀',
        'Moderate focus 🤔',
        'Poor focus 😵',
        'Cannot concentrate 😫'
      ]
    },
    {
      question: 'How social have you been lately?',
      options: [
        'Very social 👥',
        'Moderately social 🗣️',
        'Sometimes social 💭',
        'Rarely social 🤐',
        'Not social at all 😶'
      ]
    },
    {
      question: 'How satisfied are you with your daily activities?',
      options: [
        'Very satisfied 🌟',
        'Somewhat satisfied 😊',
        'Neutral 😐',
        'Somewhat dissatisfied 😕',
        'Very dissatisfied 😞'
      ]
    }
  ];

  const handleAnswer = (answer) => {
    setAnswers({ ...answers, [currentQuestion]: answer });
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      console.log('Token:', token ? token.substring(0, 10) + '...' : 'Not found');
      console.log('API URL:', process.env.REACT_APP_API_URL);
      console.log('Answers:', Object.values(answers));
      
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/chatbot/generate-response`,
        { answers: Object.values(answers) },
        { 
          // withCredentials: true,
          headers: {
            'Content-Type': 'application/json', 
            'Authorization': token ? `Bearer ${token}` : '' 
          }
        }
      );
      
      console.log('Response received:', data);
      
      if (data.reply) {
        setResponse(data.reply);
      } else {
        console.error('Response missing reply property:', data);
        setError('Invalid response format from server');
      }
    } catch (error) {
      console.error('Error details:', error);
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      
      if (error.response?.status === 403) {
        setError('You have exceeded the free API call limit.');
      } else if (error.response?.status === 401) {
        setError('Authentication failed. Please try logging in again.');
      } else if (error.message === 'Network Error') {
        setError('Network error. Please check your connection or the server might be down.');
      } else {
        setError(`Error: ${error.response?.data?.message || error.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const progress = ((Object.keys(answers).length) / questions.length) * 100;

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100 py-5">
      <Card style={{ width: '40rem', padding: '20px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
        <h2 className="text-center mb-4">Mental Health Assessment</h2>
        <ProgressBar now={progress} className="mb-4" variant="info" label={`${Math.round(progress)}%`} />
        
        {/* Display error message */}
        {error && <Alert variant="danger">{error}</Alert>}
        
        {/* Conditional rendering: If still answering questions and no response */}
        {currentQuestion < questions.length && !response ? (
          <>
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">{questions[currentQuestion].question}</Form.Label>
              {questions[currentQuestion].options.map((option, index) => (
                <Button
                  key={index}
                  variant={answers[currentQuestion] === option ? "primary" : "outline-primary"}
                  className="w-100 mb-2 text-start"
                  onClick={() => handleAnswer(option)}
                >
                  {option}
                </Button>
              ))}
            </Form.Group>
            
            <div className="d-flex justify-content-between mt-3">
              <Button 
                variant="secondary" 
                onClick={handleBack}
                disabled={currentQuestion === 0}
              >
                ← Back
              </Button>
              
              {Object.keys(answers).length === questions.length && (
                <Button 
                  variant="success" 
                  onClick={handleSubmit}
                  disabled={loading} // Disable button while loading
                >
                  {loading ? ( // Show loading state
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                      />{' '}
                      Generating...
                    </>
                  ) : (
                    'Submit Assessment'
                  )}
                </Button>
              )}
            </div>
          </>
        ) : null}

        {/* Loading display state */}
        {loading && (
          <div className="text-center p-5">
            <Spinner animation="border" role="status" variant="primary" />
            <p className="mt-3">Analyzing your responses and generating personalized advice...</p>
          </div>
        )}

        {/* Display results with better formatting and disclaimer */}
        {response && !loading && (
          <Card className="mt-4 p-3" style={{ backgroundColor: '#f8f9fa' }}>
            <Card.Body>
              <Card.Title>Your Personalized Assessment</Card.Title>
              <Card.Text style={{ whiteSpace: 'pre-line' }}>{response}</Card.Text>
              <div className="mt-4 small text-muted">
                <p>Please remember, this is AI-generated advice and is not a substitute for professional mental health care. 
                If you are experiencing serious symptoms, please consult a healthcare professional.</p>
              </div>
              <Button 
                variant="primary" 
                onClick={() => {
                  setResponse('');
                  setCurrentQuestion(0);
                  setAnswers({});
                  setError('');
                }}
                className="mt-3"
              >
                Start New Assessment
              </Button>
            </Card.Body>
          </Card>
        )}
      </Card>
    </Container>
  );
};

export default Chatbot;
