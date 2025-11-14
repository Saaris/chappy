import { useEffect, useState, useMemo, useRef } from 'react';
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
    const currentUserId = useUserStore((state) => state.userId);

    // Ref för att scroll till senaste meddelande
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll till senaste meddelande när selectedDm ändras
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

   

    //filtrera dm för aktuell anv. (now done inside useMemo)
    
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
        console.log('Antal DM:s från backend:', data.dm?.length || 0);
        
        // Debug: visa alla DM:s
        data.dm?.forEach((dm: any, index: number) => {
            console.log(`DM ${index}:`, {
                senderId: dm.senderId,
                receiverId: dm.receiverId,
                message: dm.message?.substring(0, 20) + '...',
                sentAt: dm.sentAt
            });
        });
        
        // Ta bort eventuella dubbletter baserat på sentAt + message + senderId
        const uniqueDms = data.dm?.filter((dm: any, index: number, arr: any[]) => 
            arr.findIndex((d: any) => 
                d.sentAt === dm.sentAt && 
                d.message === dm.message && 
                d.senderId === dm.senderId
            ) === index
        ) || [];
        
        console.log(`Efter deduplicering: ${uniqueDms.length} unika DMs`);
        setDms(uniqueDms);
    };
    useEffect(() => {
        console.log('DM useEffect körs - isLoggedIn:', isLoggedIn, 'currentUser:', currentUser);
        if (isLoggedIn && currentUser) {
            console.log('Båda villkor uppfyllda, kör handleGetdm');
            handleGetdm(); //// Hämta DM när komponenten laddas
        } else {
            console.log('Villkor inte uppfyllda för handleGetdm');
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
        console.log('DM payload som skickas:', payload);
        const response = await fetch('/api/dm', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem(LocalStorage_KEY)}`
            },
            body: JSON.stringify(payload)
        });
        console.log('Response status:', response.status);
        
        if (response.ok) {
            console.log('DM skickat framgångsrikt!');
            setDmStatus('Meddelande skickat!');
            console.log('dmStatus är nu satt till: Meddelande skickat!');
            setDmMessage('');
            
            console.log('🔄 Laddar om DM-lista efter att ha skickat meddelande...');
            console.log('Antal DMs FÖRE reload:', dms.length);
            
            // Ladda om DM-listan för att visa det nya meddelandet
            await handleGetdm();
            
            console.log('✅ DM-lista laddad om');
            console.log('Antal DMs EFTER reload:', dms.length);
            
            // Rensa meddelandet efter 2.5 sekunder (när animationen är klar)
            setTimeout(() => {
                setDmStatus('');
            }, 2500);
            
        } else {
            console.log('Fel vid skickning av DM:', response.status);
            setDmStatus('Kunde inte skicka meddelande.');
            
            // Rensa felmeddelandet efter 3 sekunder
            setTimeout(() => {
                setDmStatus('');
            }, 3000);
        }
    };
    // React Hook som cachar/sparar resultatet av en beräkning och bara räknar om när dependencies ändras. Bara räkna om när 'users' ändras
    const userIdToUsername = useMemo(() => {
        console.log('All users for mapping:', users);
        
        // Skapa mapping för både userId -> username OCH username -> username
        const mapping: { [key: string]: string } = {};
        users.forEach(u => {
            mapping[u.userId] = u.username;  // Normal mapping: userId -> username
            mapping[u.username] = u.username; // Fallback: username -> username
        });
        
        console.log('userIdToUsername mapping:', mapping);
        return mapping;
    }, [users]);


    // Memoized DM conversation grouping
const oneDmConversation = useMemo(() => {
    const conversations = new Map();
    
    console.log('=== oneDmConversation START ===');
    console.log('currentUser:', currentUser);
    
    // Filter DMs for current user inside useMemo
    const isCurrentUserReceiver = dms.filter(dm => {
        // Jämför med både username OCH userId för både sender och receiver
        const isSender = dm.senderId === currentUser || dm.senderId === currentUserId;
        const isReceiver = dm.receiverId === currentUser || dm.receiverId === currentUserId;
        const match = isSender || isReceiver;
        console.log('Filtering DM:', dm, 'isSender:', isSender, 'isReceiver:', isReceiver, 'Match:', match);
        return match;
    });
    
    console.log('Total DMs to process:', isCurrentUserReceiver.length);
    
    // Debug: kolla om det finns dubbletter i rådata
    const duplicateCheck = new Map();
    isCurrentUserReceiver.forEach(dm => {
        const key = `${dm.senderId}-${dm.receiverId}-${dm.sentAt}-${dm.message}`;
        if (duplicateCheck.has(key)) {
            console.log('🚨 DUPLICATE FOUND in raw data:', dm);
        } else {
            duplicateCheck.set(key, dm);
        }
    });
    
    isCurrentUserReceiver.forEach(dm => {
        // Bestäm vem som är "den andra personen" i konversationen
        const isSender = dm.senderId === currentUser || dm.senderId === currentUserId;
        const otherPersonRaw = isSender ? dm.receiverId : dm.senderId;
        
        // Förbättrad normalisering - försök båda riktningar
        let otherPerson = userIdToUsername[otherPersonRaw] || otherPersonRaw;
        
        // Om otherPersonRaw redan är ett username, behåll det
        // Om det är ett userId, konvertera till username
        // Men vi behöver också kolla omvänt (om någon userId mappar till otherPersonRaw)
        const userByUsername = users.find(u => u.username === otherPersonRaw);
        const userByUserId = users.find(u => u.userId === otherPersonRaw);
        
        if (userByUsername) {
            otherPerson = userByUsername.username; // Det är redan ett username
        } else if (userByUserId) {
            otherPerson = userByUserId.username; // Konvertera userId -> username
        }
        
        console.log('=== DM Processing ===');
        console.log('dm.senderId:', dm.senderId, 'dm.receiverId:', dm.receiverId);
        console.log('currentUser:', currentUser, 'currentUserId:', currentUserId);
        console.log('isSender:', isSender, 'otherPersonRaw:', otherPersonRaw);
        console.log('userByUsername:', userByUsername?.username, 'userByUserId:', userByUserId?.username);
        console.log('Final otherPerson:', otherPerson);
        console.log('Available userIdToUsername mapping:', userIdToUsername);
        
        if (!conversations.has(otherPerson)) {
            console.log('➕ Creating new conversation for:', otherPerson);
            conversations.set(otherPerson, {
                otherPerson,
                latestMessage: dm,
                messages: [dm]
            });
        } else {
            console.log('📝 Adding to existing conversation for:', otherPerson);
            const existing = conversations.get(otherPerson);
            
            // Kolla om meddelandet redan finns (undvik dubbletter)
            const messageExists = existing.messages.some((existingDm: DmResponse) => 
                existingDm.sentAt === dm.sentAt && 
                existingDm.message === dm.message && 
                existingDm.senderId === dm.senderId
            );
            
            if (!messageExists) {
                existing.messages.push(dm);
                console.log('✅ Added unique message. Total messages for', otherPerson, ':', existing.messages.length);
            } else {
                console.log('🚫 Skipped duplicate message for', otherPerson);
            }
            
            // Uppdatera till senaste meddelandet (om detta är nyare)
            if (dm.sentAt > existing.latestMessage.sentAt) {
                existing.latestMessage = dm;
            }
        }
    });
    
    const result = Array.from(conversations.values());
    console.log('=== oneDmConversation END ===');
    console.log('Final conversations count:', result.length);
    result.forEach(conv => {
        console.log(`Conversation with ${conv.otherPerson}: ${conv.messages.length} messages`);
    });
    return result;
}, [dms, users, userIdToUsername, currentUser, currentUserId]);

    return (
        <div>
            {/* Sektion för att starta ny DM-konversation */}
            {isLoggedIn && (
                <div className="new-dm-section">
                    <h4>Start new DM</h4>
                    <select onChange={(e) => {
                        if (e.target.value) {
                            const userId = e.target.value;
                            // Skapa ett mock DM-objekt för att öppna chat med denna användare
                            setSelectedDm({
                                senderId: currentUser || '',
                                receiverId: userId,
                                message: '',
                                sentAt: Date.now().toString()
                            });
                            e.target.value = ''; // Reset select
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

            <ul className="dm-list">
                <h3>My Dm conversations </h3>
                {oneDmConversation.length === 0 ? (
                <li className="no-dms-message">
                    <p>No DMs yet</p>
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
                            
                            console.log('Chat lookup - selectedDm:', selectedDm);
                            console.log('Chat lookup - otherPersonRaw:', otherPersonRaw, 'normalized:', normalizedOtherPerson);
                            
                            return oneDmConversation
                                .find((conv: any) => conv.otherPerson === normalizedOtherPerson)
                                ?.messages || [];
                        })()
                            ?.sort((a: DmResponse, b: DmResponse) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()) // Sortera chronologiskt
                            .map((message: DmResponse, index: number) => (
                                <div key={index} className={`dm-message ${message.senderId === currentUser || message.senderId === currentUserId ? 'sent' : 'received'}`}>
                                    <p className='dm-sender'>
                                        {message.senderId === currentUser || message.senderId === currentUserId ? 'You' : userIdToUsername[message.senderId] || message.senderId}
                                    </p>
                                    <p className='dmchat-text'>{message.message}</p>
                                    <p className='dm-date'>{new Date(message.sentAt).toLocaleString()}</p>
                                </div>
                            ))
                        }
                        {/* Element för auto-scroll till senaste meddelande */}
                        <div ref={messagesEndRef} />
                        <form className='send-dm-box' onSubmit={(e) => { e.preventDefault(); handleSendDm(); }}>
                        {/* <label className='dm-label'>type a new message</label> */}
                        <input type="text" value={dmMessage} onChange={(e) => setDmMessage(e.target.value)} />
                        <button
                        type="submit">Send</button>
                        <button type="button" onClick={() => setSelectedDm(null)}>Close</button>
                    </form>
                    {dmStatus && <p className="dm-status">{dmStatus}</p>}
                    </div>
                 
                </div>
            )}
        </div>
    );
};

export default Dm;