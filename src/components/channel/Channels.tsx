import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTowerBroadcast, faLock, faXmark } from '@fortawesome/free-solid-svg-icons';
import type { Channel } from '../../frontenddata/types';
import { useUserStore } from '../../frontenddata/userStore';
import { useState, useEffect } from 'react';
import { LocalStorage_KEY } from '../../frontenddata/key';
import './Channels.css';


const Channels = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [channelMessages, setChannelMessages] = useState<{[key: string]: any[]}>({});
  const [activeChatChannel, setActiveChatChannel] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const username = useUserStore((state) => state.username);
  const [newChannelId, setNewChannelId] = useState('');
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  


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
      // Kontrollera om användaren är inloggad och hämta token
      const isLoggedIn = username && username !== 'guest';
      const token = localStorage.getItem(LocalStorage_KEY);
      
      const response = await fetch(`/api/channels/${channelId}/messages`, {
        headers: {
          ...(isLoggedIn && token && {
            'Authorization': `Bearer ${token}`
          }),
        }
      });
      
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
    const channelId = activeChatChannel;
    if (!channelId || !newMessage.trim()) return;

    // Kontrollera om användaren är inloggad och hämta token
    const isLoggedIn = username && username !== 'guest';
    const token = localStorage.getItem(LocalStorage_KEY);

    try {
      const response = await fetch(`/api/channels/${channelId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(isLoggedIn && token && {
            'Authorization': `Bearer ${token}`
          }),
        },
        body: JSON.stringify({
          message: newMessage,
          senderId: username || 'guest'
        })
      });

      if (response.ok) {
        setNewMessage(''); // Rensa input
        handleGetChannelMsg(channelId); // Hämta meddelanden igen
      } else {
        console.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  //skapa ny kanal 
  const handleCreateChannel = async () => {
    const channelId = newChannelId;
    const isLoggedIn = username && username !== 'guest';
    const token = localStorage.getItem(LocalStorage_KEY);
    
    const response = await fetch('/api/channels', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(isLoggedIn && token && {
          'Authorization': `Bearer ${token}`
        }),
      },
      body: JSON.stringify({
        channelId: channelId,
        isLocked: false //
      })
    });
    
    if (response.ok) {
      handleGetChannels(); // Uppdatera
      setNewChannelId(''); // Rensa inputfältets
    }
  };
  
    

  return (
    <>
      <h2>Channels</h2>
      <ul className="channels-list">
        {channels.map(channel => {
          const isGuest = !username || username === 'guest';
          const isDisabled = channel.isLocked && isGuest;
          
          
          return (
            
            <li key={channel.channelId}>
              <div 
                className={`channel-box ${isDisabled ? 'disabled' : ''}`}
                onClick={isDisabled ? undefined : () => handleGetChannelMsg(channel.channelId)}
              >
                <span><FontAwesomeIcon icon={faTowerBroadcast} /></span>
                {channel.channelId}
                {isDisabled && <span className="lock-icon"><FontAwesomeIcon icon={faLock} /></span>}
                <span className="message-count">
                  {channelMessages[channel.channelId] ? `(${channelMessages[channel.channelId].length})` : ''}
                </span>
              </div>
              {showCreateChannel && (
              <div className="create-channel-form">
                <input 
                  value={newChannelId}
                  onChange={(e) => setNewChannelId(e.target.value)}
                  placeholder="Channel name"
                />
                <button onClick={() => setShowCreateChannel(true)}>Cancel</button>
                <button onClick={() => handleCreateChannel}>Create new channel</button>
              </div>
              )}
            </li>
          );
        })}
      </ul>
    

      {/* Popup chattfönster */}
      {activeChatChannel && (
        <div className="channel-chat-overlay" onClick={closeChatWindow}>
          <div className="channel-chat-popup" onClick={(e) => e.stopPropagation()}>
            <div className="channel-chat-header">
              <h3>#{activeChatChannel}</h3>
              <button className="close-channel-chat" onClick={closeChatWindow}><FontAwesomeIcon icon={faXmark} /></button>
            </div>
            <div className="channel-chat-content">
              {channelMessages[activeChatChannel] && channelMessages[activeChatChannel].length === 0 ? (
                <p>No messages in this channel</p>
              ) : (
                channelMessages[activeChatChannel]?.map((message, index) => (
                  <div key={index} className="channel-chat-message">
                    <div className="channel-message-header">
                      <p className='chat-sender'>{String(message.senderId || 'Unknown')}</p>
                      <span className="channel-message-time">
                        {message.time ? new Date(message.time).toLocaleTimeString() : null}
                      </span>
                    </div>
                    <div className="channel-message-text">{String(message.message || '')}</div>
                  </div>
                ))
              )}
            </div>
            
            {/* alla kan skicka i öppna kanaler */}
            <div className="channel-chat-input">
              <input
                type="text"
                placeholder='type a message...'
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              
                className="channel-message-input"
              />
              <button 
                onClick={handleSendMessage}
                className="channel-send-button"
              >
                Send
              </button>
            </div>
          </div>
        </div>
        
      )}
    </>
    
  );
};

export default Channels;
