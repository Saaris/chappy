import React from 'react';
import type { DmResponse } from '../../frontenddata/types';

interface DmItemProps {
  message: DmResponse;
  isCurrentUser: boolean;
  senderName: string;
}

const DmItem: React.FC<DmItemProps> = ({ message, isCurrentUser, senderName }) => (
  <div className={`dm-message ${isCurrentUser ? 'sent' : 'received'}`}>
    <p className='dm-sender'>
      {isCurrentUser ? 'You' : senderName}
    </p>
    <p className='dmchat-text'>{message.message}</p>
    <p className='dm-date'>{new Date(message.sentAt).toLocaleString()}</p>
  </div>
);

export default DmItem;
