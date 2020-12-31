import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../common';

type Props = {
  update: number;
  auth: string;
};

const FriendList: React.FC<Props> = ({ update, auth }) => {
  const [friendList, setFriendList] = useState([]);
  const [worldList, setWorldList] = useState({});
  const updateFriendList = () => {
    //const auth = localStorage.getItem('auth');
    const apiKey = localStorage.getItem('apiKey');
    if (auth && apiKey) {
      axios
        .get(API_BASE_URL + '/1/auth/user/friends?&apiKey=' + apiKey, {
          headers: {
            Authorization: 'Basic ' + auth,
          },
        })
        .then((response) => {
          const friends = response.data;
          const newFriends = [];
          friends.map((friend) => {
            newFriends.push(friend);
          });
          setFriendList(newFriends);
          console.log(newFriends);
        })
        .catch((error) => console.log(error));
    }
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
