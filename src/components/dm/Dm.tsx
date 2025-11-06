import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMessage } from '@fortawesome/free-solid-svg-icons';
import type { DmResponse } from '../../frontenddata/types';
import { useUserStore } from '../../frontenddata/userStore';
import './Dm.css';

const Dm = () => {
    const [dms, setDms] = useState<DmResponse[]>([]);
    const [selectedDm, setSelectedDm] = useState<DmResponse | null>(null);
    const [dmMessage, setDmMessage] = useState('');
    const [dmStatus, setDmStatus] = useState('');
    const isLoggedIn = useUserStore((state) => state.isLoggedIn());
    const currentUser = useUserStore((state) => state.username);

    const isCurrentUserReceiver =  dms.filter(dm =>
        dm.senderId === currentUser || dm.receiverId === currentUser
    );

    const handleGetdm = async () => {
        const response = await fetch('/api/dm');
        const data = await response.json();
        setDms(data.dm || []);
    };
    useEffect(() => {
        handleGetdm();
    }, []);

    const handleGetDmChat = (dm: DmResponse) => {
        setSelectedDm(dm);
    };
    const handleSendDm = async () => {
        if (!selectedDm) return;
        if (!dmMessage) return;
        const response = await fetch('/api/dm', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                senderId: currentUser,
                receiverId: selectedDm.receiverId,
                message: dmMessage
            })
        });
        if (response.ok) {
            setDmStatus('Meddelande skickat!');
            setDmMessage('');
            handleGetdm();
        } else {
            setDmStatus('Kunde inte skicka meddelande.');
        }
    };

    return (
        <div>
            <ul className="dm-list">
                {isCurrentUserReceiver.map(dm => (
                    <li key={dm.senderId + dm.receiverId}>
                        <span className="dm-icon"><FontAwesomeIcon icon={faMessage} /></span>
                        <button className="dm-buttons" onClick={() => handleGetDmChat(dm)}>
                            {isLoggedIn ? dm.receiverId : 'dm-from'}
                        </button>
                    </li>
                ))}
            </ul>
            {selectedDm && (
                <div className="dm-chat-box">
                   
                    <div className='dmchat-content'>
                         <p className='dm-sender'> From: {selectedDm.senderId === currentUser ? selectedDm.receiverId : selectedDm.senderId}</p>
                    <p className='dmchat-text'>{selectedDm.message}</p>
                    <p className='dm-date'> {new Date(selectedDm.sentAt).toLocaleString()}</p>
                    </div>
                    
                       <form className='send-dm-box' onSubmit={(e) => { e.preventDefault(); handleSendDm(); }}>
                        <label className='dm-label'>type a new message</label>
                        <input type="text" value={dmMessage} onChange={(e) => setDmMessage(e.target.value)} />
                        <button type="submit">send</button>
                        <button type="button" onClick={() => setSelectedDm(null)}>close</button>
                     </form>
                     {dmStatus && <p className="dm-status">{dmStatus}</p>}
                </div>
            )}
        </div>
    );
};

export default Dm;