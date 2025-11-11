import Users from '../components/users/Users.tsx';
import Dm from '../components/dm/Dm.tsx';
import './ChatPage.css';
import { useUserStore } from '../frontenddata/userStore';
import Channels from '../components/channel/Channels';
import './ChatPage.css'




const ChatPage = () => {
  // Removed unused channels state and related logic

  const username = useUserStore((state) => state.username);
  const isLoggedIn = !!username && username !== 'guest';



  return (
    <div>
      <p className="welcome">Welcome {isLoggedIn ? username : 'Guest'}
      </p>
      <Users />
      <Channels />
      {isLoggedIn && (
        <>
          <h3>MY DMs</h3>
          <Dm />
        </>
      )}
    </div>
    
  );
};

export default ChatPage;