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
                navigate('/'); // Navigera till startsidan eller login
            }
        } else {
            console.log('Kunde ej ta bort ' + response.status)
        }
	 }

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
                            <span className="user-icon">👤</span>
                            {u.username}
                            {currentUser && currentUser !== 'guest' && (
                                <button onClick={() => handleDeleteUser(u.userId)}><FontAwesomeIcon icon={faXmark} /></button>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};
export default Users;