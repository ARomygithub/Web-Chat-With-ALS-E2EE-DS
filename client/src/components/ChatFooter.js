import Status from './Status';
import { useEffect, useState } from 'react';
import socket from '../Socket';
import { decryptMsg } from '../lib/mode/cbc';

function ChatFooter() {
  const [id, setId] = useState(null);
  useEffect(() => {
    socket.on('user', (cipherBody) => {
      let sharedKey = localStorage.getItem('sharedKey');
      if(sharedKey) {
        console.log(cipherBody.encrypted);
        console.log(sharedKey);
        const userBody = decryptMsg(cipherBody.encrypted, sharedKey);
        setId(userBody.id);
      }
    });
  });
  return (
    <footer className="columns">
      <div className="column is-hidden-mobile has-text-left">
        <small>&copy; {new Date().getFullYear()} - Yusuf Sezer (<a href="https://www.yusufsezer.com" target="_blank" rel="noreferrer" className="has-text-white">yusufsezer.com</a>)</small>
      </div>
      <div className='column has-text-centered'>
        <small>Your Id: {id}</small>
      </div>
      <div className="column has-text-right-tablet has-text-centered">
        <Status />
      </div>
    </footer>
  );
}

export default ChatFooter;
