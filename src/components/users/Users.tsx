import { useState, useEffect } from 'react';
import type { User } from '../../frontenddata/types';
import './Users.css';
import { useUserStore } from '../../frontenddata/userStore';
import { handleGetUsers } from '../../frontenddata/userActions';



const Users = () => {
    const [users, setUsers] = useState<User[]>([]);


    
     const isLoggedIn = useUserStore((state) => state.isLoggedIn());
		const currentUser = useUserStore((state) => state.username);
	
	

    useEffect(() => {
        handleGetUsers(setUsers);
	
    }, []);

    return (
        <div className="box">
            
                <h2> Users </h2>
                <ul className="users-list">
					{users.filter(u => !isLoggedIn || u.username !== currentUser)
           			 	.map(u => (
                        <li 
                            key={u.userId}
                            className="user-item"
                        >
							
                            <span className="users-icon" >👤</span>
                            {u.username}
                        </li>
                    ))}
                </ul>
            
        </div>
    );
};
export default Users;