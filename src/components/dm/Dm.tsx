import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMessage } from '@fortawesome/free-solid-svg-icons';
import type { DmResponse } from '../../frontenddata/types';

const Dm = () => {
    const [dms, setDms] = useState<DmResponse[]>([]);
    const [selectedPair, setSelectedPair] = useState<{ sender: string, receiver: string } | null>(null);

    const handleGetdm = async () => {
        const response = await fetch('/api/dm');
        const data = await response.json();
        setDms(data.dm || []);
    };

    // Hitta unika DM-par
    const dmPairs = Array.from(new Set(
        dms.map(dm => [dm.senderId, dm.receiverId].sort().join('-'))
    ));

    return (
        <div>
            <button onClick={handleGetdm}>Hämta DM</button>
            {!selectedPair ? (
                <ul className="dm-list">
                    {dmPairs.map((pair, i) => {
                        const [userA, userB] = pair.split('-');
                        return (
                            <li key={pair} onClick={() => setSelectedPair({ sender: userA, receiver: userB })} style={{ cursor: 'pointer' }}>
                                <span className="dm-icon"><FontAwesomeIcon icon={faMessage} /></span>
                                <span className="dm-text">DM mellan <b>{userA}</b> och <b>{userB}</b></span>
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <div className="chat-box">
                    <h4>DM mellan {selectedPair.sender} och {selectedPair.receiver}</h4>
                    <ul>
                        {dms.filter(dm =>
                            (dm.senderId === selectedPair.sender && dm.receiverId === selectedPair.receiver) ||
                            (dm.senderId === selectedPair.receiver && dm.receiverId === selectedPair.sender)
                        ).map((dm, i) => (
                            <li key={i}>
                                <b>{dm.senderId}:</b> {dm.message}
                            </li>
                        ))}
                    </ul>
                    <button onClick={() => setSelectedPair(null)}>Tillbaka</button>
                </div>
            )}
        </div>
    );
};

export default Dm;