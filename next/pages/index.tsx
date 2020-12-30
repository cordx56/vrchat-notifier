import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { Container, Navbar } from 'react-bootstrap';
import LoginModal from '../components/loginModal';

export default function Home() {
  let socket = null;
  const [showLoginModal, setShowLoginModal] = useState(true);
  const [eventLog, setEventLog] = useState([]);

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
  };

  const connectWebSocket = () => {
    socket = new WebSocket(
      'wss://pipeline.vrchat.cloud/?authToken=' + localStorage.getItem('token')
    );
    socket.onmessage = onWebSocketMessage;
    socket.onclose = (e) => {
      setShowLoginModal(true);
    };
  };

  useEffect(() => {
    if (typeof Notification !== 'undefined') {
      Notification.requestPermission();
    }
  }, []);

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
      <LoginModal
        show={showLoginModal}
        onSuccess={() => {
          setShowLoginModal(false);
          connectWebSocket();
        }}
      />
      <Navbar bg="dark" variant="dark">
        <Container>
          <Navbar.Brand>VRChat Notifier</Navbar.Brand>
        </Container>
      </Navbar>
      <Container>
        <h1>Event log</h1>
        {eventLogHtml}
      </Container>
    </>
  );
}
