import React, { useState } from 'react';
import { Button, Form, Modal, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { API_BASE_URL } from '../common';

type Props = {
  show: boolean;
  onSuccess?: () => void;
};

const LoginModal: React.FC<Props> = ({ show, onSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [logining, setLogining] = useState(false);

  const colorRed = {
    color: 'red',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(username, password);
  };
  const login = (username: string, password: string) => {
    setLogining(true);
    setErrorMessage('');
    axios
      .get(API_BASE_URL + '/1/auth', {
        headers: {
          Authorization:
            'Basic ' +
            btoa(
              encodeURIComponent(username) + ':' + encodeURIComponent(password)
            ),
        },
      })
      .then((response) => {
        setLogining(false);
        if (response.data.ok) {
          localStorage.setItem('token', response.data.token);
          if (onSuccess) {
            onSuccess();
          }
        }
      })
      .catch((error) => {
        console.log(error);
        setLogining(false);
        setErrorMessage(error.response.data.error.message);
      });
  };
  return (
    <>
      <Modal show={show} backdrop="static">
        <Form onSubmit={handleSubmit}>
          <Modal.Header>
            <Modal.Title>Login VRChat</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <span style={colorRed}>{errorMessage}</span>
            <Form.Group>
              <Form.Label>Username/Email</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Username or Email"
                required
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                }}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" type="submit">
              {logining ? (
                <>
                  <Spinner animation="border" as="span" size="sm" />
                  <span> Login</span>
                </>
              ) : (
                <>
                  <span> Login</span>
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default LoginModal;
