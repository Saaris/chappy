import { useState } from 'react';
import type { User } from '../../frontenddata/types';
import { LocalStorage_KEY } from '../../frontenddata/key';

const Users = () => {

    const [users, setUsers] = useState<User[]>([])

    const handleGetUsers = async () => {
		const response = await fetch('/api/users')
		const data = await response.json()

		console.log( data)
		const userResponse: User[] = data
		setUsers(userResponse)
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
	 			'Authorization': `Bearer: ${jwt}`
	 		}
	 	})

	 	// kontrollera status för responsen. Lyckades requestet?
	 	if( response.status === 204 ) {
	 		console.log('DELETE lyckades!')
	 		handleGetUsers() // uppdatera listan
	 		// En alternativ metod: ta bort användaren direkt ur state-variabeln <- går inte, eftersom vi inte har userId
	 		// Tips! Låt servern skicka tillbaka en ny JWT med varje request - så kan vi uppdatera JWT i localStorage, så att det dröjer längre tills JWT slutar gälla (återställa timeout)

	 	} else {
	 		console.log('DELETE failade med status ' + response.status)
	 	}
	 }


    return (
        <div className="box">
        
			<div className="box">
				<p> Användare </p>
				<button onClick={ () => handleGetUsers}> Visa alla användare </button>
				<ul className="list">
					{users.map(u => (
						<li key={u.userId} className="row">
							<div className="grow"> {u.username} </div>
							<button onClick={() => handleDeleteUser(u.userId)}> Ta bort </button>
						</li>
					))}
				</ul>
			</div>
		</div>
    );
};
export default Users;