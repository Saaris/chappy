import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTowerBroadcast, faLock, faXmark, faTrash } from '@fortawesome/free-solid-svg-icons';
import type { Channel } from '../../frontenddata/types';
import { useUserStore } from '../../frontenddata/userStore';
import { useState, useEffect } from 'react';
import { LocalStorage_KEY } from '../../frontenddata/key';
import './Channels.css';


const Channels = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [channelMessages, setChannelMessages] = useState<{[key: string]: any[]}>({}); //Meddelanden för varje kanal 
  const [activeChatChannel, setActiveChatChannel] = useState<string | null>(null); //Vilken kanal som är öppen just nu
  const [newMessage, setNewMessage] = useState('');
  const username = useUserStore((state) => state.username); //från zustand
  const userId = useUserStore((state) => state.userId); // userId från zustand
  const [newChannelId, setNewChannelId] = useState(''); // Namn för ny kanal
  const [showCreateChannel, setShowCreateChannel] = useState(false); // Visa/dölj formulär för att skapa kanal
  const isLoggedIn = username && username !== 'guest'; 
  const [removeMessage, setRemoveMessage] = useState<string | null>(null);
   


  const handleGetChannels = async () => {

    const response = await fetch('/api/channels');
    const data = await response.json();
    setChannels(data.channels || []);
  };
//useeffect när komponenten laddas första gången
  useEffect(() => {
    handleGetChannels();
  }, []);

//hämta meddelanden i kanal
  const handleGetChannelMsg = async (channelId: string) => {
    try {
      // Kontrollera om användaren är inloggad och hämta token
    
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
      
      // Lagra meddelanden för den här kanalen, kopierar och uppd. med prev(previous)
      setChannelMessages(prev => ({
        ...prev,
        [channelId]: messages
      }));
      
      // Öppna chattfönstret för denna kanal
      setActiveChatChannel(channelId);
      
      // console.log(`Hämtade ${messages.length} meddelanden för kanal ${channelId}`);
    } catch (error) {
      console.error('Error fetching channel messages:', error);
    }
  };
  //stäng chattfönster
  const closeChatWindow = () => {
    setActiveChatChannel(null);
    setNewMessage(''); // Rensa input när man stänger
  };

  const handleSendMessage = async () => {
     //kontr det finns medd. och aktiv kanal, trim tar bort space
    const activeChannelId = activeChatChannel;
    if (!activeChannelId || !newMessage.trim()) return;

    // Kontrollera om användaren är inloggad och hämta token
   
    const token = localStorage.getItem(LocalStorage_KEY);

    try {
      const response = await fetch(`/api/channels/${activeChannelId}/messages`, {
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
        handleGetChannelMsg(activeChannelId); // Hämta meddelanden igen
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
    
    const token = localStorage.getItem(LocalStorage_KEY);
    
    const response = await fetch('/api/channels', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(isLoggedIn && token && {
          'Authorization': `Bearer ${token}`
        }),
      },
      //skickar med kanalnamn, låsstatus, creator
      body: JSON.stringify({
        channelId: channelId,
        isLocked: false
        // creatorUserId sätts automatiskt av backend från JWT token
      })
    });
    
   
    if (response.ok) {
      handleGetChannels(); // Uppdatera kanallista
      setNewChannelId(''); // Rensa inputfältet
    } else {
      console.error('Failed to create channel');
    }
  };

  const handleDeleteChannel = async (channelId: string) => {
    const token = localStorage.getItem(LocalStorage_KEY);

    try {
      const response = await fetch(`/api/channels/${channelId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        } 
      });

      if (response.ok) {
        setRemoveMessage('Channel removed');
        handleGetChannels(); // Uppdatera
        
        // Stäng overlay:n efter 2 sekunder för att visa animationen
        setTimeout(() => {
          setActiveChatChannel(null);
          setRemoveMessage(null); // Rensa meddelandet
        }, 2000);
      } else {
        console.error('Failed to delete channel:', response.status);
        const errorData = await response.text();
        console.error('Delete error details:', errorData);
      }
    } catch (error) {
      console.error('Error deleting channel:', error);
    }
  };

  // endast för UX , göm knappen
  const isChannelCreator = (channelId: string): boolean => {
      // Säkerhetscheck: Om channels inte är laddade än, returnera false
      if (!channels || channels.length === 0) {
        return false;
      }
      
      const channel = channels.find(ch => ch.channelId === channelId);
      
      // Om kanalen inte hittas, returnera false
      if (!channel) {
        return false;
      }
      
      // Primärt: jämför med userId (för nya kanaler)
      // Fallback: jämför med username (för gamla kanaler som kan ha userId som creatorUserId)
      return channel?.creatorUserId === userId || channel?.creatorUserId === username;
    };

  return (
    <>
      
     
    
      {showCreateChannel && isLoggedIn &&  (
        <div className="create-channel-form">
          <input 
            value={newChannelId}
            onChange={(e) => setNewChannelId(e.target.value)}
            placeholder="Channel name"
          />
          <button className="create-button" onClick={handleCreateChannel}>Create</button>
          <button className="close-channel-button" onClick={() => setShowCreateChannel(false)}>Cancel</button>
        </div>
      )}
      <ul className="channels-list">
      
        <h2>Channels</h2>
              {!showCreateChannel && isLoggedIn && (
          <button className={`create-channel-button ${!isLoggedIn ? 'transparent' : ''}`} onClick={() => setShowCreateChannel(true)}>
            Create new channel
          </button>
        )}
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
              
              {isLoggedIn && isChannelCreator(activeChatChannel) && (
                <button className="delete-own-channel" onClick={() => handleDeleteChannel(activeChatChannel)}>
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              )}
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
               {removeMessage && (
        <p className="remove-message">{removeMessage}</p>
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
