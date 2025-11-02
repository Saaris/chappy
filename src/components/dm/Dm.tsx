import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMessage } from '@fortawesome/free-solid-svg-icons';
import type { DmResponse } from '../../frontenddata/types';

const Dm = () => {
    const [dms, setDms] = useState<DmResponse[]>([]);

    const handleGetdm = async () => {
        const response = await fetch('/api/dm');
        const data = await response.json();
        console.log('Data from server:', data);
        setDms(data.dm || []); // Spara DM-data i state
    };

   
    return (
        <div>
            <button onClick={handleGetdm}>Hämta DM</button>
            <ul className="dm-list">
                {dms.map(dm => (
                    <li key={dm.senderId + dm.receiverId}>
                        <span className="dm-icon"><FontAwesomeIcon icon={faMessage} /></span>
                        <span className="dm-text"> <b>{dm.receiverId}</b></span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Dm;