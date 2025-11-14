import Users from '../components/users/Users.tsx';
import Dm from '../components/dm/Dm.tsx';
import { useUserStore } from '../frontenddata/userStore';
import Channels from '../components/channel/Channels';
import './ChatPage.css';


const ChatPage = () => {
  const username = useUserStore((state) => state.username);
  const isLoggedIn = !!username && username !== 'guest';


  return (
    <div className='chat-container'>
      <p className="welcome">Welcome {isLoggedIn ? username : 'Guest'} </p>
      {isLoggedIn && (
        <div className='dm-selection'>
          <Dm />
        </div>
      )}
       <div className='chatpage'>
        <div className='sidebar'>
      <Users />
      <Channels />
      </div>
    </div>
   </div> 
  );
};

export default ChatPage;