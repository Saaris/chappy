import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMessage } from '@fortawesome/free-solid-svg-icons';
import type { DmResponse } from '../../frontenddata/types';
import { useUserStore } from '../../frontenddata/userStore';
import './Dm.css';

const Dm = () => {
    const [dms, setDms] = useState<DmResponse[]>([]);
    const [selectedDm, setSelectedDm] = useState<DmResponse | null>(null);
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
                    
                       <div className='send-dm-box'>
                        <label>type a new message</label>
                        <input type="text" />
                        <button>send</button>
                        <button>close</button>
                     </div>
                </div>
            )}
        </div>
    );
};

export default Dm;