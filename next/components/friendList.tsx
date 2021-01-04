import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../common';

type Props = {
  update: number;
  token: string;
  clientApiKey: string;
};

const FriendList: React.FC<Props> = ({ update, token, clientApiKey }) => {
  const [friendList, setFriendList] = useState([]);
  const [worldList, setWorldList] = useState({});
  const updateFriendList = () => {
    //const auth = localStorage.getItem('auth');
    axios
      .get(
        API_BASE_URL +
          '/1/auth/user/friends?&apiKey=' +
          clientApiKey +
          '&authToken=' +
          token
      )
      .then((response) => {
        const friends = response.data;
        friends.map((friend) => {
          if (friend.location !== 'private') {
            const worldId = friend.location.split(':')[0];
            axios
              .get(
                API_BASE_URL +
                  '/1/worlds/' +
                  worldId +
                  '?apiKey=' +
                  clientApiKey +
                  '&authToken=' +
                  token
              )
              .then((response) => {
                //setWorldList((prevState) => {
                //  prevState[worldId] = response.data;
                //  return prevState;
                //});
                console.log(response.data);
              })
              .catch((error) => console.log(error));
          }
        });
        setFriendList(friends);
      })
      .catch((error) => console.log(error));
  };
  useEffect(() => {
    updateFriendList();
  }, [update]);

  const userIconStyle = {
    width: '2rem',
  };
  const avaterImageStyle = {
    width: '8rem',
  };
  const friendListHtml = friendList.map((obj, index) => (
    <div key={index}>
      <h3>
        <img src={obj.userIcon} style={userIconStyle} />
        <span> {obj.displayName}</span>
      </h3>
      <div>
        <img
          src={obj.currentAvatarThumbnailImageUrl}
          style={avaterImageStyle}
        />
        <h4>{obj.status}</h4>
        {obj.location}
        {obj.location !== 'private'
          ? worldList[obj.location.split(':')[0]]
          : 'private'}
      </div>
    </div>
  ));
  return (
    <>
      <h1>Online friends</h1>
      {friendListHtml}
    </>
  );
};

export default FriendList;
