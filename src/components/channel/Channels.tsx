import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey, faTowerBroadcast } from '@fortawesome/free-solid-svg-icons';
import type { Channel } from '../../frontenddata/types';
import { useUserStore } from '../../frontenddata/userStore';
import { useState, useEffect } from 'react';
import './Channels.css';


const Channels = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const username = useUserStore((state) => state.username);
  const isLoggedIn = !!username && username !== 'guest';

  const handleGetChannels = async () => {
    const response = await fetch('/api/channels');
    const data = await response.json();
    setChannels(data.channels || []);
  };

  useEffect(() => {
    handleGetChannels();
  }, []);

  return (
    <>
      <h2>Channels</h2>
      <ul className="channels-list">
        {channels.map(channel => (
          <li key={channel.channelId}>
            <span><FontAwesomeIcon icon={faTowerBroadcast} /></span>
            {channel.channelId}
          </li>
        ))}
      </ul>
      <h2>Channels for users</h2>
      <ul className="locked-channels-list">
        {channels.filter(channel => channel.isLocked === true).map(channel => (
          <li
            key={channel.channelId}
            className={isLoggedIn ? 'unlocked-channel' : 'locked-channel'}
          >
            <span><FontAwesomeIcon icon={faTowerBroadcast} /></span>
            {channel.channelId}
            {!isLoggedIn && (
              <span className="locked-channel-info"><FontAwesomeIcon icon={faKey} /></span>
            )}
          </li>
        ))}
      </ul>
    </>
  );
};

export default Channels;
