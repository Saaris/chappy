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
    // console.log(data)
};



// handleSendDm function removed - DM functionality now handled in Dm.tsx component

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






