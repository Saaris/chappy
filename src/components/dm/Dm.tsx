import { useState } from 'react';
import type { DmResponse } from '../../frontenddata/types';

const Dm = () => {
    const [dms, setDms] = useState<DmResponse[]>([]);

    const handleGetdm = async () => {
        const response = await fetch('/api/dm');
        const data = await response.json();
        console.log('Data from server:', data);
        setDms(data); // Spara DM-data i state
    };

   
    return (
        <div>
            <button onClick={handleGetdm}>Hämta DM</button>
            <ul>
                {dms.map((dm, i) => (
                    <li key={i}>
                        Från: <b>{dm.senderId}</b> &rarr; Till: <b>{dm.receiverId}</b>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Dm;