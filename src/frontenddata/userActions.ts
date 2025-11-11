import { LocalStorage_KEY } from './key'

// Global DM uppdateringshantering
export let showNewDm: (() => void) | null = null;

export const setDmUpdater = (updater: () => void) => {
    showNewDm = updater;
};

export const triggerDmUpdate = () => {
    if (showNewDm) {
        showNewDm();
    }
};


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
    setDmMessage: (msg: string) => void,
    setCloseMessage: (msg: string) => void,
    onSuccess?: () => void  // Callback för att trigga uppdatering
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
        setCloseMessage('')
        // Trigga uppdatering av DM-lista
        triggerDmUpdate();
        if (onSuccess) {
            onSuccess();
        }
    } else {
        setDmStatus('Kunde inte skicka meddelande.');
    }
};

// Hämta DM
export const handleGetDm = async () => {
    const jwt: string | null = localStorage.getItem(LocalStorage_KEY);
    if (!jwt) {
        console.log('Ingen JWT hittades');
        return [];
    }

    const response = await fetch('/api/dm', {
        headers: {
            'Authorization': `Bearer ${jwt}`
        }
    });

    if (response.ok) {
        const data = await response.json();
        return data.dm || [];
    } else {
        console.log('Kunde inte hämta DM:', response.status);
        return [];
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

        console.log('Försöker ta bort användare:', userId);
        const response: Response = await fetch('/api/users/' + userId, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${jwt}`
            }
        })

        console.log('Delete response status:', response.status);
        if( response.status === 204 ) {
            console.log('Tog bort användare!', userId)
            // Om man tar bort sig själv, logga ut
            if (userId === currentUser) {
                logout();
                localStorage.removeItem(LocalStorage_KEY);
                navigate('/login'); 
            }
        } else {
            console.log('Kunde ej ta bort användare', userId, 'Status:', response.status)
        }
}






