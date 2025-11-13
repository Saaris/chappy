import { useState, useEffect } from 'react';
import type { User } from '../../frontenddata/types';
import './Users.css';
import { useUserStore } from '../../frontenddata/userStore';
import { handleGetUsers,  handleSendDm, triggerDmUpdate } from '../../frontenddata/userActions';

//triggerDmUpdate, callback för att trigga uppdatering av DM-listan.
//stopPropagation används för att förhindra att klick på DM-inputen och knapparna stänger DM-fönstret.

const Users = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [dmReceiver, setDmReceiver] = useState<string | null>(null); //vem som ska få medd
    const [dmMessage, setDmMessage] = useState(''); //medd som ska skickas, setDmMessage rensa fältet
    const [dmStatus, setDmStatus] = useState(''); //status för meddelande

    
     const isLoggedIn = useUserStore((state) => state.isLoggedIn());
		const currentUser = useUserStore((state) => state.username);
	
	

    useEffect(() => {
        handleGetUsers(setUsers);
		console.log(users)
    }, []);

    return (
        <div className="box">
            
                <h2> Users </h2>
                <ul className="users-list">
					{users.filter(u => !isLoggedIn || u.username !== currentUser)
           			 	.map(u => (
                        <li 
                            key={u.userId} 
                            onClick={() => setDmReceiver(u.userId)}
                            className="user-item"
                        >
							
                            <span className="users-icon" >👤</span>
                            {u.username}
                            
                                {dmReceiver === u.userId && isLoggedIn && (
                                    <div className="dmchat-content" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="text"
                                            placeholder="Skriv ett meddelande..."
                                            value={dmMessage}
                                            onChange={e => setDmMessage(e.target.value)}
                                        />
										<div className='send-dm'>
											<button onClick={(e) => { e.stopPropagation(); handleSendDm(dmReceiver, dmMessage, setDmStatus, setDmMessage, () => setDmReceiver(null), () => triggerDmUpdate()); }}>Send DM</button>
											<button onClick={(e) => { e.stopPropagation(); setDmReceiver(null); }}>Close</button>
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