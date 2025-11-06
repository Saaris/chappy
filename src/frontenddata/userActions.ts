import { LocalStorage_KEY } from './key'


// Hämta alla användare
export const handleGetUsers = async (setUsers: (users: any[]) => void) => {
    const response = await fetch('/api/users');
    const data = await response.json();
    setUsers(data.users || []);
    console.log(data)
};



// Skicka DM
export const handleSendDm = async (
    dmReceiver: string | null,
    dmMessage: string,
    setDmStatus: (msg: string) => void,
    setDmMessage: (msg: string) => void
) => {
    console.log('handleSendDm called', { dmReceiver, dmMessage });
    if (!dmReceiver) {
        console.log('Ingen mottagare (dmReceiver) angiven!');
        return;
    }
    if (!dmMessage) {
        console.log('Ingen meddelandetext (dmMessage) angiven!');
        return;
    }
    const jwt: string | null = localStorage.getItem(LocalStorage_KEY);
    console.log('JWT i localStorage:', jwt);
    if (!jwt) {
        console.log('Ingen JWT hittades, avbryter DM-sändning.');
        return;
    }

    console.log('Skickar DM:', { userId: dmReceiver, message: dmMessage });
    const response = await fetch('/api/dm', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
        },
        body: JSON.stringify({ userId: dmReceiver, message: dmMessage })
    });
    if (response.ok) {
        setDmStatus('Meddelande skickat!');
        setDmMessage('');
       
    } else {
        setDmStatus('Kunde inte skicka meddelande.');
    }
};

export const handleDeleteUser = async (
  userId: string,
  currentUser: string,
  logout: () => void,
  navigate: (path: string) => void
) => {
        const jwt: string | null = localStorage.getItem(LocalStorage_KEY)
        if( !jwt ) {
            console.log('No JWT in localStorage')
            return
        }

        const response: Response = await fetch('/api/users/' + currentUser, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${jwt}`
            }
        })

        if( response.status === 204 ) {
            console.log('Tog bort användare!')
            if (userId === currentUser) {
                logout();
                localStorage.removeItem(LocalStorage_KEY);
                navigate('/logout'); 
            }
        } else {
            console.log('Kunde ej ta bort ' + response.status)
        }
}





