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
		console.log(users)
    }, []);

    return (
        <div className="box">
            
                <p> Users </p>
                <ul className="users-list">
					{users.filter(u => !isLoggedIn || u.username !== currentUser)
           			 	.map(u => (
                        <li key={u.userId} onClick={() => setDmReceiver(u.userId)}>
							
                            <span className="users-icon" >👤</span>
                            {u.username}
                            
                                {dmReceiver === u.userId && (
                                    <div className="dmchat-content">
                                        <input
                                            type="text"
                                            placeholder="Skriv ett meddelande..."
                                            value={dmMessage}
                                            onChange={e => setDmMessage(e.target.value)}
                                        />
										<div className='send-dm'>
											<button onClick={() => handleSendDm(dmReceiver, dmMessage, setDmStatus, setDmMessage)}>Send DM</button>
											<button onClick={() => setDmReceiver(null)}>Close</button>
											{dmStatus && <p>{dmStatus}</p>}
										</div>
                                    </div>
                                )}
                        </li>
                    ))}
                </ul>
            
        </div>
    );
};
export default Users;