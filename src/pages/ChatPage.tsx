import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey } from '@fortawesome/free-solid-svg-icons';
import { useUserStore } from '../frontenddata/userStore';
import Users from '../components/users/Users.tsx';
import Dm from '../components/dm/Dm.tsx';
import './ChatPage.css';
import type { Channel } from '../frontenddata/types.ts';
import { useState, useEffect } from 'react';



// const openChannels = ['General', 'Random', 'Announcements'];
// const lockedChannels = ['grupp1', 'grupp2', 'grupp3'];

const ChatPage = () => {
  const [channels, setChannels] = useState<Channel[]>([]);

  const handleGetChannels = async () => {
    const response = await fetch('/api/channels');
    const data = await response.json();
    setChannels(data.channels || []);
  };

  useEffect(() => {
    handleGetChannels();
  }, []);

  const username = useUserStore((state) => state.username);
  const isLoggedIn = !!username && username !== 'guest';



  return (
    <div>
      <p className="welcome">
        {isLoggedIn ? username : 'Guest'}
      </p>
      <Users />
      <h2>Channels</h2>
      <ul>
        {channels.map(channel => <li key={channel.channelId}>{channel.channelId}</li>)}  {/* lista öppna kanaler */}
      </ul>
      <h2>Channels for users</h2> 
      <ul>
         {/* lista låsta kanaler */}
        {channels.filter(channel => channel.isLocked === true).map(channel => (
          <li
            key={channel.channelId}
            className={isLoggedIn ? 'unlocked-channel' : 'locked-channel'}
          >
            {channel.channelId} 
            {!isLoggedIn && (
              <span className="locked-channel-info"><FontAwesomeIcon icon={faKey} /></span>
            )}
          </li>
        ))}
      </ul>
      {isLoggedIn && (
        <>
          <h3>DM</h3>
          <Dm />
        </>
      )}
    </div>
    
  );
};

export default ChatPage;