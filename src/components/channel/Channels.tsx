import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey, faTowerBroadcast } from '@fortawesome/free-solid-svg-icons';
import type { Channel } from '../../frontenddata/types';
import { useUserStore } from '../../frontenddata/userStore';
import { useState, useEffect } from 'react';
import './Channels.css';


const Channels = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [channelMessages, setChannelMessages] = useState<{[key: string]: any[]}>({});
  const [activeChatChannel, setActiveChatChannel] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const username = useUserStore((state) => state.username);
  const isLoggedIn = !!username && username !== 'guest';
  const canSendChannelMessages = !!username; // Både inloggade och gäster kan skicka i kanaler

  const handleGetChannels = async () => {
    const response = await fetch('/api/channels');
    const data = await response.json();
    setChannels(data.channels || []);
  };

  useEffect(() => {
    handleGetChannels();
  }, []);

  const handleGetChannelMsg = async (channelId: string) => {
    try {
      const response = await fetch(`/api/channels/${channelId}/messages`);
      const data = await response.json();
      const messages = data.messages || [];
      
      // Lagra meddelanden för den här kanalen
      setChannelMessages(prev => ({
        ...prev,
        [channelId]: messages
      }));
      
      // Öppna chattfönstret för denna kanal
      setActiveChatChannel(channelId);
      
      console.log(`Hämtade ${messages.length} meddelanden för kanal ${channelId}`);
    } catch (error) {
      console.error('Error fetching channel messages:', error);
    }
  };

  const closeChatWindow = () => {
    setActiveChatChannel(null);
    setNewMessage(''); // Rensa input när vi stänger
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeChatChannel || !canSendChannelMessages) return;

    try {
      const headers: any = {
        'Content-Type': 'application/json'
      };

      // Endast inloggade användare behöver token
      if (isLoggedIn) {
        headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
      }

      const response = await fetch(`/api/channels/${activeChatChannel}/messages`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: newMessage,
          senderId: username || 'guest'
        })
      });

      if (response.ok) {
        // Lägg till meddelandet lokalt direkt
        const newMsg = {
          senderId: username || 'guest',
          message: newMessage,
          time: new Date().toISOString()
        };

        setChannelMessages(prev => ({
          ...prev,
          [activeChatChannel]: [...(prev[activeChatChannel] || []), newMsg]
        }));

        setNewMessage(''); // Rensa input
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // const handleKeyPress = (e: React.KeyboardEvent) => {
  //   if (e.key === 'Enter') {
  //     handleSendMessage();
  //   }
  // };

  return (
    <>
      <h2>Channels</h2>
      <ul className="channels-list">
        {channels.map(channel => (
          <li key={channel.channelId}>
            <div className='channel-box' onClick={() => handleGetChannelMsg(channel.channelId)}>
              <span><FontAwesomeIcon icon={faTowerBroadcast} /></span>
              {channel.channelId}
              <span className="message-count">
                {channelMessages[channel.channelId] ? `(${channelMessages[channel.channelId].length})` : ''}
              </span>
            </div>
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

      {/* Popup chattfönster */}
      {activeChatChannel && (
        <div className="channel-chat-overlay" onClick={closeChatWindow}>
          <div className="channel-chat-popup" onClick={(e) => e.stopPropagation()}>
            <div className="channel-chat-header">
              <h3>#{activeChatChannel}</h3>
              <button className="close-channel-chat" onClick={closeChatWindow}>×</button>
            </div>
            <div className="channel-chat-content">
              {channelMessages[activeChatChannel] && channelMessages[activeChatChannel].length === 0 ? (
                <p>Inga meddelanden i denna kanal än.</p>
              ) : (
                channelMessages[activeChatChannel]?.map((message, index) => (
                  <div key={index} className="channel-chat-message">
                    <div className="channel-message-header">
                      <p className='chat-sender'>{message.senderId || 'Okänd'}</p>
                      <span className="channel-message-time">
                        {message.time ? new Date(message.time).toLocaleTimeString() : 'Okänd tid'}
                      </span>
                    </div>
                    <div className="channel-message-text">{message.message}</div>
                  </div>
                ))
              )}
            </div>
            
            {/* Send message sektion */}
            {canSendChannelMessages && (
              <div className="channel-chat-input">
                <input
                  type="text"
                  placeholder={`Skriv meddelande i #${activeChatChannel}...`}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                
                  className="channel-message-input"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="channel-send-button"
                >
                  Send
                </button>
              </div>
            )}
            
            {/* Visa meddelande för ej inloggade */}
            {!canSendChannelMessages && (
              <div className="channel-chat-guest">
                <p>only users can send messages.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Channels;
