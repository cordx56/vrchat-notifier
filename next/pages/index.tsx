import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { Container, Navbar, Spinner, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import LoginModal from '../components/loginModal';
import FriendList from '../components/friendList';

export default function Home() {
  let socket = null;
  const [showLoginModal, setShowLoginModal] = useState(true);
  const [eventLog, setEventLog] = useState([]);
  const [updateFlag, setUpdateFlag] = useState(0);
  const [webSocketConnectFlag, setWebSocketConnectFlag] = useState(false);
  const [token, setToken] = useState('');
  const [auth, setAuth] = useState('');

  const onWebSocketMessage = (e) => {
    const data = JSON.parse(e.data);
    let notificationTitle = '';
    let notificationBody = '';
    let notificationIcon = '';
    let content = null;
    if (data.content) {
      content = JSON.parse(data.content);
    }
    if (data.type === 'friend-location' && content) {
      let world = content.location;
      if (world !== 'private') {
        world = content.world.name;
      }
      notificationTitle = content.user.displayName + ' moved world';
      notificationBody = content.user.displayName + ' moved to ' + world;
      notificationIcon = content.user.currentAvatarThumbnailImageUrl;
    } else if (data.type === 'friend-online' && content) {
      notificationTitle = content.user.displayName + ' is now online!';
      notificationIcon = content.user.currentAvatarThumbnailImageUrl;
    } else if (data.type === 'friend-active' && content) {
      notificationTitle = content.user.displayName + ' is now active!';
      notificationIcon = content.user.currentAvatarThumbnailImageUrl;
    } else if (data.type === 'friend-update' && content) {
      notificationTitle = content.user.displayName + "'s status updated";
      notificationIcon = content.user.currentAvatarThumbnailImageUrl;
    } else {
      notificationTitle = data.type;
    }
    new Notification(notificationTitle, {
      body: notificationBody,
      icon: notificationIcon,
    });

    setEventLog(
      [
        {
          title: notificationTitle,
          icon: notificationIcon,
          body: notificationBody,
        },
      ].concat(eventLog)
    );

    setUpdateFlag(updateFlag + 1);
  };

  const onWebSocketClose = (e) => {
    setWebSocketConnectFlag(false);
    connectWebSocket();
  };

  const onWebSocketOpen = (e) => {
    setWebSocketConnectFlag(true);
  };

  const connectWebSocket = () => {
    const token = localStorage.getItem('token');
    if (token) {
      socket = new WebSocket('wss://pipeline.vrchat.cloud/?authToken=' + token);
      socket.onmessage = onWebSocketMessage;
      socket.onclose = onWebSocketClose;
      socket.onopen = onWebSocketOpen;
    }
  };

  useEffect(() => {
    if (typeof Notification !== 'undefined') {
      Notification.requestPermission();
    }
  }, []);

  const onLoginSuccess = (token, auth) => {
    setToken(token);
    setAuth(auth);
    setShowLoginModal(false);
    connectWebSocket();
    setUpdateFlag(updateFlag + 1);
  };

  const eventLogHtml = eventLog.map((obj, index) => (
    <div key={index}>
      <h2>{obj.title}</h2>
      <div>
        <img src={obj.icon} />
        <span> {obj.body}</span>
      </div>
    </div>
  ));
  return (
    <>
      <Head>
        <title>VRChat Notifier</title>
      </Head>
      <LoginModal show={showLoginModal} onSuccess={onLoginSuccess} />
      <Navbar bg="dark" variant="dark">
        <Container>
          <Navbar.Brand>VRChat Notifier</Navbar.Brand>
          <Navbar.Text>
            {webSocketConnectFlag ? (
              <FontAwesomeIcon icon={faCheck} />
            ) : (
              <Spinner animation="grow" variant="primary" size="sm" />
            )}
          </Navbar.Text>
        </Container>
      </Navbar>
      <Container>
        <Row>
          <Col>
            <h1>Event log</h1>
            {eventLogHtml}
          </Col>
          <Col md="3">
            <FriendList update={updateFlag} auth={auth} />
          </Col>
        </Row>
      </Container>
    </>
  );
}
