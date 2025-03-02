import React from 'react';

const styles = {
  floatingAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
};

const FloatingChatIcon = ({ onClick, style }) => (
  <button style={style} onClick={onClick}>
    <img src="/avatar.png" alt="Chat Icon" style={{
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      borderRadius: '50%',
      backgroundColor: '#5e3977',
      padding: '4px'
    }} />
  </button>
);

export default FloatingChatIcon;
