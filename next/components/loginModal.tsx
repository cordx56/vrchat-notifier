import React, { useState, useEffect } from 'react';
import { Button, Form, Modal, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { API_BASE_URL } from '../common';

type Props = {
  show: boolean;
  onSuccess?: (token: string, auth: string, clientApiKey: string) => void;
};

const LoginModal: React.FC<Props> = ({ show, onSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [logining, setLogining] = useState(false);
  const [saveUsernamePassword, setSaveUsernamePassword] = useState(false);

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
      .get(API_BASE_URL + '/1/config')
      .then((response) => {
        const clientApiKey = response.data.clientApiKey;
        let auth = localStorage.getItem('auth');
        if (!auth) {
          auth = btoa(
            encodeURIComponent(username) + ':' + encodeURIComponent(password)
          );
        }
        axios
          .get(API_BASE_URL + '/1/auth', {
            headers: {
              Authorization: 'Basic ' + auth,
            },
          })
          .then((response) => {
            setLogining(false);
            if (response.data.ok) {
              localStorage.setItem('token', response.data.token);
              if (saveUsernamePassword) {
                localStorage.setItem('auth', auth);
              }
              if (onSuccess) {
                onSuccess(response.data.token, auth, clientApiKey);
              }
            }
          })
          .catch((error) => {
            setLogining(false);
            if (error.response) {
              setErrorMessage(error.response.data.error.message);
            } else {
              setErrorMessage(error);
            }
          });
      })
      .catch((error) => console.log(error));
  };
  useEffect(() => {
    if (show) {
      const authToken = localStorage.getItem('token');
      if (authToken) {
        axios
          .get(API_BASE_URL + '/1/auth/user?authToken=' + authToken)
          .then((response) => {
            axios.get(API_BASE_URL + '/1/config').then((response) => {
              const clientApiKey = response.data.clientApiKey;
              if (onSuccess) {
                onSuccess(authToken, '', clientApiKey);
              }
            });
          })
          .catch((error) => {
            if (localStorage.getItem('auth')) {
              login('', '');
            }
          });
      }
    }
  }, [show]);
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
            <Form.Group>
              <label>
                <input
                  type="checkbox"
                  checked={saveUsernamePassword}
                  onChange={(e) => {
                    setSaveUsernamePassword(e.target.checked);
                  }}
                />
                <span> Save Username and Password</span>
              </label>
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
                  <span>Login</span>
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
