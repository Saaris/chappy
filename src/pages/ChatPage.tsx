import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey } from '@fortawesome/free-solid-svg-icons';
import { useUserStore } from '../frontenddata/userStore';
import Users from '../components/users/Users.tsx';
import Dm from '../components/dm/Dm.tsx';


const openChannels = ['General', 'Random', 'Announcements'];
const lockedChannels = ['grupp1', 'grupp2', 'grupp3'];

const ChatPage = () => {
  
  const username = useUserStore((state) => state.username);
  const isLoggedIn = !!username && username !== 'guest';



  return (
    <div>
      <h2>Welcome {username}</h2>
      <Users />
      <h2>Channels</h2>
      <ul>
        {openChannels.map(channel => <li key={channel}>{channel}</li>)}
        {isLoggedIn && lockedChannels.map(channel => 
          <li key={channel}>
            {channel} <FontAwesomeIcon icon={faKey} />
          </li>
        )}
      </ul>
      {isLoggedIn ? (
        <div>
          <h3>DM</h3>
          <Dm />
          
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