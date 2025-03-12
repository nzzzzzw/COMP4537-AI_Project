import React, { useState } from 'react';
import axios from 'axios';
import { Container, Button, Form, Card, ProgressBar } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const Chatbot = () => {
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [response, setResponse] = useState('');

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
      const { data } = await axios.post(
        'http://localhost:5000/api/chatbot/generate-response',
        { answers: Object.values(answers) },
        { withCredentials: true }
      );
      setResponse(data.reply);
      setCurrentQuestion(0);
      setAnswers({});
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100 py-5">
      <Card style={{ width: '40rem', padding: '20px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
        <h2 className="text-center mb-4">Mental Health Assessment</h2>
        <ProgressBar now={progress} className="mb-4" variant="info" label={`${Math.round(progress)}%`} />
        
        {currentQuestion < questions.length ? (
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
                >
                  Submit Assessment
                </Button>
              )}
            </div>
          </>
        ) : null}

        {response && (
          <Card className="mt-4 p-3" style={{ backgroundColor: '#f8f9fa' }}>
            <Card.Body>
              <Card.Title>Assessment Results</Card.Title>
              <Card.Text>{response}</Card.Text>
              <Button 
                variant="primary" 
                onClick={() => {
                  setResponse('');
                  setCurrentQuestion(0);
                  setAnswers({});
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
