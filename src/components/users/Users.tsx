import { useState, useEffect } from 'react';
import type { User } from '../../frontenddata/types';
import './Users.css';
import { useUserStore } from '../../frontenddata/userStore';
import { handleGetUsers,  handleSendDm } from '../../frontenddata/userActions';


const Users = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [dmReceiver, setDmReceiver] = useState<string | null>(null);
    const [dmMessage, setDmMessage] = useState('');
    const [dmStatus, setDmStatus] = useState('');
    
     const isLoggedIn = useUserStore((state) => state.isLoggedIn());
		const currentUser = useUserStore((state) => state.username);
	
	

    useEffect(() => {
        handleGetUsers(setUsers);
    }, []);

    return (
        <div className="box">
            
                <p> Användare </p>
                <ul className="users-list">
					{users.filter(u => !isLoggedIn || u.username !== currentUser)
           			 	.map(u => (
                        <li key={u.userId}>
                            <span className="users-icon" onClick={() => setDmReceiver(u.userId)}>👤</span>
                            {u.username}
                            
                                {dmReceiver === u.userId && (
                                    <div className="dmchat-content">
                                        <input
                                            type="text"
                                            placeholder="Skriv ett meddelande..."
                                            value={dmMessage}
                                            onChange={e => setDmMessage(e.target.value)}
                                        />
                                        <button onClick={() => handleSendDm(dmReceiver, dmMessage, setDmStatus, setDmMessage)}>Skicka DM</button>
                                        <button onClick={() => setDmReceiver(null)}>Stäng</button>
                                        {dmStatus && <p>{dmStatus}</p>}
                                    </div>
                                )}
                        </li>
                    ))}
                </ul>
            
        </div>
    );
};
export default Users;