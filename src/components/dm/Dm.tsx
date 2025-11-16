import { useEffect, useState, useMemo, useRef } from 'react';
import DmItem from './DmItem';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMessage } from '@fortawesome/free-solid-svg-icons';
import type { DmResponse, User } from '../../frontenddata/types';
import { useUserStore } from '../../frontenddata/userStore';
import { LocalStorage_KEY } from '../../frontenddata/key';
import { setDmUpdater } from '../../frontenddata/userActions';
import './Dm.css';

const Dm = () => {
    const [dms, setDms] = useState<DmResponse[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [selectedDm, setSelectedDm] = useState<DmResponse | null> (null); 
    const [dmMessage, setDmMessage] = useState(''); 
    const [dmStatusWhenSend, setDmStatus] = useState(''); 
    const isLoggedIn = useUserStore((state) => state.isLoggedIn());
    const currentUser = useUserStore((state) => state.username);
    const currentUserId = useUserStore((state) => state.userId);

    // Ref för att scroll till senaste meddelande
    const messagesEndRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (selectedDm && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [selectedDm]);

    // Hämta alla användare från '/api/users' för att mappa userId till username
    useEffect(() => {
        const fetchUsers = async () => {
            const res = await fetch('/api/users');
            const data = await res.json();
            setUsers(data.users || []);
        };
        fetchUsers();
    }, []);

    const handleGetdm = async () => {
       
        const token = localStorage.getItem(LocalStorage_KEY); 

        if (!token) return;
        const response = await fetch('/api/dm', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
       
        if (!response.ok) {
            const text = await response.text();
            console.log('Fel vid fetch:', response.status, text);
            return;
        }
        const data = await response.json();
        setDms(data.dm || []);
    };
    useEffect(() => {
        if (isLoggedIn && currentUser) {
            handleGetdm(); // Hämta DM vid inloggad user
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

        // Bestäm vem som är den andra personen (inte den inloggade användaren)
        const isSender = selectedDm.senderId === currentUser || selectedDm.senderId === currentUserId;
        const otherPersonId = isSender ? selectedDm.receiverId : selectedDm.senderId;

        const payload = {
            userId: otherPersonId,  // Skicka till den andra personen, inte currentUser
            message: dmMessage
        };
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
            
            await handleGetdm();
            
            // Rensa meddelandet efter 2.5 sekunder (när animationen är klar)
            setTimeout(() => {
                setDmStatus('');
            }, 2500);
            
        } else {
            setDmStatus('Kunde inte skicka meddelande.');
            
            setTimeout(() => {
                setDmStatus('');
            }, 3000);
        }
    };
    
    const userIdToUsername = useMemo(() => {
        //  mapping för userId till username och username till username
        const mapping: { [key: string]: string } = {};
        users.forEach(u => {
            mapping[u.userId] = u.username; 
            mapping[u.username] = u.username; 
        });
        
        return mapping;
    }, [users]);


    //  oneDmConversation räknas ut på nytt om någon av dms, users, userIdToUsername, currentUser eller currentUserId ändras. Annars återanvänds det gamla värdet.
const oneDmConversation = useMemo(() => {
    const conversations = new Map();
    
    //filter används för att välja ut dm där inloggad är avsänd eller mottag.
    //forEach används för att gruppera dem per konversation.
    const isCurrentUserReceiver = dms.filter(dm => {
        
        const isSender = dm.senderId === currentUser || dm.senderId === currentUserId;
        const isReceiver = dm.receiverId === currentUser || dm.receiverId === currentUserId;
        return isSender || isReceiver;
    });
    
    isCurrentUserReceiver.forEach(dm => {

        const isSender = dm.senderId === currentUser || dm.senderId === currentUserId;
        const otherPersonRaw = isSender ? dm.receiverId : dm.senderId;
        
        // Förbättrad normalisering - försök båda riktningar
        let otherPerson = userIdToUsername[otherPersonRaw] || otherPersonRaw;
        
        // Om otherPersonRaw redan är ett username, behåll det
        // Om det är ett userId, konvertera till username
        // kolla omvänt (om någon userId mappar till otherPersonRaw)
        const userByUsername = users.find(u => u.username === otherPersonRaw);
        const userByUserId = users.find(u => u.userId === otherPersonRaw);
        
        if (userByUsername) {
            otherPerson = userByUsername.username; // Det är redan ett username
        } else if (userByUserId) {
            otherPerson = userByUserId.username; // Konvertera userId -> username
        }
        
        if (!conversations.has(otherPerson)) {
            conversations.set(otherPerson, {
                otherPerson,
                latestMessage: dm,
                messages: [dm]
            });
        } else {
            const existing = conversations.get(otherPerson);
            
            // Kolla om meddelandet redan finns (undvik dubbletter)
            const messageExists = existing.messages.some((existingDm: DmResponse) => 
                existingDm.sentAt === dm.sentAt && 
                existingDm.message === dm.message && 
                existingDm.senderId === dm.senderId
            );
            
            if (!messageExists) {
                existing.messages.push(dm);
            }
            
            // Uppdatera till senaste meddelandet (om detta är nyare)
            if (dm.sentAt > existing.latestMessage.sentAt) {
                existing.latestMessage = dm;
            }
        }
    });
    
    return Array.from(conversations.values());
}, [dms, users, userIdToUsername, currentUser, currentUserId]);

    return (
        <div className='dm-content'>

            <ul className="dm-list">
                {isLoggedIn && (
                <div className="new-dm-section">
                    <h4>Start new conversation</h4>
                    <select onChange={(e) => {
                        if (e.target.value) {
                            const userId = e.target.value;
                            // Skapa ett mock DM-objekt för att öppna chat första ggn
                            setSelectedDm({
                                senderId: currentUser || '',
                                receiverId: userId,
                                message: '',
                                sentAt: Date.now().toString()
                            });
                            e.target.value = ''; // Reseta dropdownlista
                        }
                    }}>
                        <option value="">Select user to message...</option>
                        {users
                            .filter(u => u.username !== currentUser && u.userId !== currentUserId)
                            .map(u => (
                                <option key={u.userId} value={u.userId}>
                                    {u.username}
                                </option>
                            ))
                        }
                    </select>
                </div>
            )}
        
                {oneDmConversation.length === 0 ? (
                <li className="no-dms-message">
                    <p>No DM:s yet..</p>
                </li>
                ) : (
                oneDmConversation.map((conversation: any) => (
                <li key={conversation.otherPerson}>
                        <span className="dm-icon"><FontAwesomeIcon icon={faMessage} /></span>
                        <button className="dm-buttons" onClick={() => handleGetDmChat(conversation.latestMessage)}>
                            {isLoggedIn ? userIdToUsername[conversation.otherPerson] || conversation.otherPerson : 'dm-from'}
                        </button>
                    </li>
                ))
                )}
            </ul>
            {selectedDm && isLoggedIn && (
                <div className="dm-chat-box" onClick={() => setSelectedDm(null)}>
                    <div className='dmchat-content' onClick={(e) => e.stopPropagation()}>
                        {/* Visa alla meddelanden i konversationen */}
                        {(() => {
                            const isSender = selectedDm.senderId === currentUser || selectedDm.senderId === currentUserId;
                            const otherPersonRaw = isSender ? selectedDm.receiverId : selectedDm.senderId;
                            const normalizedOtherPerson = userIdToUsername[otherPersonRaw] || otherPersonRaw;
                           
                             return oneDmConversation
                                .find((conv: any) => conv.otherPerson === normalizedOtherPerson)
                                ?.messages || [];
                        })()
                            ?.sort((a: DmResponse, b: DmResponse) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()) // Sortera kronologiskt
                            .map((message: DmResponse, index: number) => (
                                <DmItem
                                  key={index}
                                  message={message}
                                  isCurrentUser={message.senderId === currentUser || message.senderId === currentUserId}
                                  senderName={userIdToUsername[message.senderId] || message.senderId}
                                />
                            ))
                        }
                        {/* Element för auto-scroll till senaste meddelande */}
                        <div ref={messagesEndRef} />
                        <form className='send-dm-box' onSubmit={(e) => { e.preventDefault(); handleSendDm(); }}>
                        <input type='text' value={dmMessage} onChange={(e) => setDmMessage(e.target.value)} />
                        <button
                        type="submit">Send</button>
                        <button type="button" onClick={() => setSelectedDm(null)}>Close</button>
                    </form>
                    {dmStatusWhenSend && <p className="dm-status">{dmStatusWhenSend}</p>}
                    </div>
                 
                </div>
            )}
        </div>
    );
};

export default Dm;