import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey } from '@fortawesome/free-solid-svg-icons';
import { useUserStore } from '../frontenddata/userStore';

const openChannels = ['random', 'koda'];
const lockedChannels = ['grupp1', 'grupp2', 'grupp3'];

const ChatPage = () => {
  const username = useUserStore((state) => state.username);
  const isLoggedIn = !!username && username !== 'guest';

  return (
    <div>
      <h2>Channels</h2>
      <ul>
        {openChannels.map(channel => <li key={channel}>{channel}</li>)}
        {isLoggedIn && lockedChannels.map(channel => 
          <li key={channel}>
            {channel} <FontAwesomeIcon icon={faKey} style={{ marginLeft: '8px' }} />
          </li>
        )}
      </ul>
      {isLoggedIn ? (
        <div>
          <h3>Direct Messages</h3>
          
        </div>
      ) : (
        <ul>
        <li>Grupp 1</li>
        <li>Grupp 1</li>
        <li>Grupp 1</li>
        </ul>
      )}
    </div>
  );
};

export default ChatPage;