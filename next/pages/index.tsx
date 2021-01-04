import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { Container, Navbar, Spinner, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import LoginModal from '../components/loginModal';
import FriendList from '../components/friendList';

let socket = null;

export default function Home() {
  const [showLoginModal, setShowLoginModal] = useState(true);
  const [eventLog, setEventLog] = useState([]);
  const [updateFlag, setUpdateFlag] = useState(0);
  const [webSocketConnectFlag, setWebSocketConnectFlag] = useState(false);
  const [token, setToken] = useState('');
  //const [auth, setAuth] = useState('');
  const [clientApiKey, setClientApiKey] = useState('');

  // Notification settings
  const [notfFriendOnline, setNotfFriendOnline] = useState(true);
  const [notfFriendOffline, setNotfFriendOffline] = useState(true);
  const [notfFriendActive, setNotfFriendActive] = useState(true);
  const [notfFriendAdd, setNotfFriendAdd] = useState(true);
  const [notfFriendDelete, setNotfFriendDelete] = useState(true);
  const [notfFriendUpdate, setNotfFriendUpdate] = useState(true);
  const [notfFriendLocation, setNotfFriendLocation] = useState(true);

  const onWebSocketMessage = (e) => {
    const data = JSON.parse(e.data);
    if (data.err) {
      setShowLoginModal(true);
      return;
    }
    let notificationEnabled = true;
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
      notificationEnabled = notfFriendLocation;
    } else if (data.type === 'friend-online' && content) {
      notificationTitle = content.user.displayName + ' is now online!';
      notificationIcon = content.user.currentAvatarThumbnailImageUrl;
      notificationEnabled = notfFriendOnline;
    } else if (data.type === 'friend-active' && content) {
      notificationTitle = content.user.displayName + ' is now active!';
      notificationIcon = content.user.currentAvatarThumbnailImageUrl;
      notificationEnabled = notfFriendActive;
    } else if (data.type === 'friend-update' && content) {
      notificationTitle = content.user.displayName + "'s status updated";
      notificationIcon = content.user.currentAvatarThumbnailImageUrl;
      notificationEnabled = notfFriendUpdate;
      console.log(notfFriendUpdate);
    } else {
      notificationTitle = data.type;
    }
    if (notificationEnabled) {
      new Notification(notificationTitle, {
        body: notificationBody,
        icon: notificationIcon,
      });
    }

    setEventLog((prevState) =>
      [
        {
          title: notificationTitle,
          icon: notificationIcon,
          body: notificationBody,
          date: new Date(),
        },
      ].concat(prevState)
    );

    setUpdateFlag((prevState) => prevState + 1);
    console.log(updateFlag);
  };

  const onWebSocketClose = (e) => {
    setWebSocketConnectFlag(false);
    if (!showLoginModal) {
      connectWebSocket(token);
    }
  };

  const onWebSocketOpen = (e) => {
    setWebSocketConnectFlag(true);
  };

  const connectWebSocket = (token) => {
    socket = new WebSocket('wss://pipeline.vrchat.cloud/?authToken=' + token);
    socket.onmessage = onWebSocketMessage;
    socket.onclose = onWebSocketClose;
    socket.onopen = onWebSocketOpen;
  };

  useEffect(() => {
    if (typeof Notification !== 'undefined') {
      Notification.requestPermission();
    }
  }, []);

  const onLoginSuccess = (token, auth, clientApiKey) => {
    setToken(token);
    //setAuth(auth);
    setClientApiKey(clientApiKey);
    setShowLoginModal(false);
    connectWebSocket(token);
    setUpdateFlag(updateFlag + 1);
  };

  const eventLogHtml = eventLog.map((obj, index) => (
    <div key={index}>
      <h2>{obj.title}</h2>
      <div>
        <img src={obj.icon} style={{ width: '8rem' }} />
        <span>
          <p>{obj.body}</p>
          <p>{obj.date.toString()}</p>
        </span>
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
          <label>
            <input
              type="checkbox"
              checked={notfFriendOnline}
              onChange={(e) => {
                setNotfFriendOnline(e.target.checked);
              }}
            />
            Friend Online
          </label>
          <label>
            <input
              type="checkbox"
              checked={notfFriendOffline}
              onChange={(e) => {
                setNotfFriendOffline(e.target.checked);
              }}
            />
            Friend Offline
          </label>
          <label>
            <input
              type="checkbox"
              checked={notfFriendActive}
              onChange={(e) => {
                setNotfFriendActive(e.target.checked);
              }}
            />
            Friend Active
          </label>
          <label>
            <input
              type="checkbox"
              checked={notfFriendAdd}
              onChange={(e) => {
                setNotfFriendAdd(e.target.checked);
              }}
            />
            Friend Add
          </label>
          <label>
            <input
              type="checkbox"
              checked={notfFriendDelete}
              onChange={(e) => {
                setNotfFriendDelete(e.target.checked);
              }}
            />
            Friend Delete
          </label>
          <label>
            <input
              type="checkbox"
              checked={notfFriendUpdate}
              onChange={(e) => {
                setNotfFriendUpdate(e.target.checked);
              }}
            />
            Friend Update
          </label>
          <label>
            <input
              type="checkbox"
              checked={notfFriendLocation}
              onChange={(e) => {
                setNotfFriendLocation(e.target.checked);
              }}
            />
            Friend Location
          </label>
        </Row>
        <Row>
          <Col>
            <h1>Event log</h1>
            {eventLogHtml}
          </Col>
          <Col md="3">
            <FriendList
              update={updateFlag}
              token={token}
              clientApiKey={clientApiKey}
            />
          </Col>
        </Row>
      </Container>
    </>
  );
}
