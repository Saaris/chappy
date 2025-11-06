import { useState, useEffect } from 'react';
import type { User } from '../../frontenddata/types';
import { LocalStorage_KEY } from '../../frontenddata/key';
import './Users.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark} from '@fortawesome/free-solid-svg-icons';
import { useUserStore } from '../../frontenddata/userStore';
import { useNavigate } from 'react-router';

const Users = () => {

    const [users, setUsers] = useState<User[]>([])
    const [dmReceiver, setDmReceiver] = useState<string | null>(null);
    const [dmMessage, setDmMessage] = useState('');
    const [dmStatus, setDmStatus] = useState('');
    const logout = useUserStore((state) => state.logout);
    const currentUser = useUserStore((state) => state.username);
    const navigate = useNavigate();

    const handleGetUsers = async () => {
		const response = await fetch('/api/users')
		const data = await response.json()
		
		setUsers(data.users || []);
	}
	
	const handleDeleteUser = async (userId: string): Promise<void> => {
        const jwt: string | null = localStorage.getItem(LocalStorage_KEY)
        if( !jwt ) {
            console.log('No JWT in localStorage')
            return
        }

        const response: Response = await fetch('/api/users/' + userId, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${jwt}`
            }
        })

        if( response.status === 204 ) {
            console.log('Tog bort användare!')
            handleGetUsers()
            if (userId === currentUser) {
                logout();
                localStorage.removeItem(LocalStorage_KEY);
                navigate('/'); 
            }
        } else {
            console.log('Kunde ej ta bort ' + response.status)
        }
	 }

	 const handleSendDm = async () => {
        if (!dmReceiver || !dmMessage) return;
        const jwt: string | null = localStorage.getItem(LocalStorage_KEY);
        if (!jwt) return;
        const response = await fetch('/api/dm', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt}`
            },
            body: JSON.stringify(
				{ userId: dmReceiver, message: dmMessage })
        });
        if (response.ok) {
            setDmStatus('Meddelande skickat!');
            setDmMessage('');
        } else {
            setDmStatus('Kunde inte skicka meddelande.');
        }
    };

	 useEffect(() => {  //använde useEffect för att hämta användare. 
        handleGetUsers();
    }, []);

    return (
        <div className="box">
            <div className="box">
                <p> Användare </p>
                <ul className="users-list">
                    {users.map(u => (
                        <li key={u.userId}>
                            <span className="users-icon" onClick={() => setDmReceiver(u.userId)}>👤</span>
                            {u.username}
                            {currentUser && currentUser !== 'guest' && (
                                <button onClick={() => handleDeleteUser(u.userId)}><FontAwesomeIcon icon={faXmark} /></button>
                            )}
                            {dmReceiver === u.userId && (
                                <div className="dmchat-content">
                                    <input
                                        type="text"
                                        placeholder="Skriv ett meddelande..."
                                        value={dmMessage}
                                        onChange={e => setDmMessage(e.target.value)}
                                    />
                                    <button onClick={handleSendDm}>Skicka DM</button>
                                    <button onClick={() => setDmReceiver(null)}>Stäng</button>
                                    {dmStatus && <p>{dmStatus}</p>}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};
export default Users;