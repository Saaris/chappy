import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMessage } from '@fortawesome/free-solid-svg-icons';
import type { DmResponse } from '../../frontenddata/types';
import { useUserStore } from '../../frontenddata/userStore';

const Dm = () => {
    const [dms, setDms] = useState<DmResponse[]>([]);
    const isLoggedIn = useUserStore((state) => state.isLoggedIn());
    const currentUser = useUserStore((state) => state.username); //  DM där senderId eller receiverId är username

    const isCurrentUserReceiver =  dms.filter(dm =>
    dm.senderId === currentUser || dm.receiverId === currentUser
    );

    const handleGetdm = async () => {
        const response = await fetch('/api/dm');
        const data = await response.json();
        console.log('Data from server:', data);
        setDms(data.dm || []); // Spara DM-data i state
    };
    useEffect(() => {
            handleGetdm();
        }, []);

   

    return (
        <div>
            <ul className="dm-list">
                {isCurrentUserReceiver.map(dm => (
                    <li key={dm.senderId + dm.receiverId}>
                        <span className="dm-icon"><FontAwesomeIcon icon={faMessage} /></span>
                        <span className="dm-text">   {isLoggedIn ? dm.senderId : 'dm-from'}</span>
                        
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Dm;