import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMessage } from '@fortawesome/free-solid-svg-icons';
import type { DmResponse, User } from '../../frontenddata/types';
import { useUserStore } from '../../frontenddata/userStore';
import { LocalStorage_KEY } from '../../frontenddata/key';
import { setDmUpdater } from '../../frontenddata/userActions';
import './Dm.css';

const Dm = () => {
    const [dms, setDms] = useState<DmResponse[]>([]);//array med alla DM-meddelanden
    const [users, setUsers] = useState<User[]>([]);//array med alla användare (för att mappa userId till username)
     // Skapa userId -> username map
    const [selectedDm, setSelectedDm] = useState<DmResponse | null> (null); // vilket DM som är valt för chat
    const [dmMessage, setDmMessage] = useState(''); //text som användaren skriver i chatfönstret
    const [dmStatus, setDmStatus] = useState(''); //statusmeddelande ("Meddelande skickat!
    const isLoggedIn = useUserStore((state) => state.isLoggedIn());
    const currentUser = useUserStore((state) => state.username);

    // Hämta alla användare från '/api/users' för att mappa userId till username
    useEffect(() => {
        const fetchUsers = async () => {
            const res = await fetch('/api/users');
            const data = await res.json();
            setUsers(data.users || []);
        };
        fetchUsers();
    }, []);

   

    //filtrera dm för aktuell anv.
    const isCurrentUserReceiver =  dms.filter(dm =>
        dm.senderId === currentUser || dm.receiverId === currentUser
    );
    
    //fetch dm från backend
    // Hämtar JWT från localStorage
    // Gör fetch till '/api/dm' med Authorization header
    // Uppdaterar dms state med resultat

    const handleGetdm = async () => {
        console.log('handleGetdm körs');
        const token = localStorage.getItem(LocalStorage_KEY); 
        console.log('Token i localStorage:', token);
        if (!token) return;
        const response = await fetch('/api/dm', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('Response status:', response.status);
        if (!response.ok) {
            const text = await response.text();
            console.log('Fel vid fetch:', response.status, text);
            return;
        }
        const data = await response.json();
        console.log('DM från backend:', data.dm);
        setDms(data.dm || []);
    };
    useEffect(() => {
        if (isLoggedIn && currentUser) {
            handleGetdm(); //// Hämta DM när komponenten laddas
        }

        // uppdaterings funktion för andra komponenter 
        setDmUpdater(() => {
            if (isLoggedIn && currentUser) {
                handleGetdm();
            }
        });
    }, [isLoggedIn, currentUser]);

    const handleGetDmChat = (dm: DmResponse) => {
        setSelectedDm(dm); // Öppnar chat för valt DM
    };

    // Skickar nytt DM via POST till '/api/dm'
   //kontrollerar att ett DM är valt (selectedDm är inte null)
   //Kontrollerar att användaren har skrivit ett meddelande (dmMessage är inte tom)
    const handleSendDm = async () => {
        if (!selectedDm) return;
        if (!dmMessage) return;

        // Backend förväntar sig { userId, message }
        const payload = {
            userId: selectedDm.receiverId,
            message: dmMessage
        };
        console.log('DM payload som skickas:', payload);
        const response = await fetch('/api/dm', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem(LocalStorage_KEY)}`
            },
            body: JSON.stringify(payload)
        });
        if (response.ok) {
            setDmStatus('Meddelande skickat!');
            setDmMessage('');
            
            
        } else {
            setDmStatus('Kunde inte skicka meddelande.');
        }
    };
    //fromEntries gör om den arrayen till ett objekt där kan slå upp username med userId som nyckel. Mappa userId till username
    const userIdToUsername = Object.fromEntries(users.map(u => [u.userId, u.username]));

    return (
        <div>
            <ul className="dm-list">
                {isCurrentUserReceiver.map(dm => (
                    <li key={dm.senderId + dm.receiverId + (dm.sentAt || '')}>
                        <span className="dm-icon"><FontAwesomeIcon icon={faMessage} /></span>
                        <button className="dm-buttons" onClick={() => handleGetDmChat(dm)}>
                            {isLoggedIn ? userIdToUsername[dm.receiverId] || dm.receiverId : 'dm-from'}
                        </button>
                    </li>
                ))}
            </ul>
            {selectedDm && isLoggedIn && (
                <div className="dm-chat-box">
                    <div className='dmchat-content'>
                        <p className='dm-sender'>
                            From: {userIdToUsername[selectedDm.senderId] || selectedDm.senderId}
                        </p>
                        <p className='dmchat-text'>{selectedDm.message}</p>
                        <p className='dm-date'> {new Date(selectedDm.sentAt).toLocaleString()}</p>
                    </div>
                    <form className='send-dm-box' onSubmit={(e) => { e.preventDefault(); handleSendDm(); }}>
                        <label className='dm-label'>type a new message</label>
                        <input type="text" value={dmMessage} onChange={(e) => setDmMessage(e.target.value)} />
                        <button
                        onClick={handleSendDm} type="submit">send</button>
                        <button type="button" onClick={() => setSelectedDm(null)}>close</button>
                    </form>
                    {dmStatus && <p className="dm-status">{dmStatus}</p>}
                </div>
            )}
        </div>
    );
};

export default Dm;