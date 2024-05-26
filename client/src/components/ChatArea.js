import { useEffect, useState } from 'react';
import { useMessages, useMessagesDispatch, usePartner } from '../contexts/MessagesContext';
import socket from '../Socket';
import MessageForm from './MessageForm';
import MessageList from './MessageList';
import { encryptMsg, decryptMsg } from '../lib/mode/cbc';
const { formatDateTime } = require('../lib/tools/tools.js');

function ChatArea() {
  const [userName, setUserName] = useState('');
  const messages = useMessages();
  const dispatch = useMessagesDispatch();
  const [userId, setUserId] = useState(null);
  const partner = usePartner();
  useEffect(() => {

    function onNewMessage(otherUser) {
      console.log("partner & other user");
      console.log(partner + ' & ' + otherUser);
      if(partner === otherUser) {
        let sharedKey = localStorage.getItem('sharedKey');
        if(sharedKey) {
          let queryBody = {
            with: partner
          }
          socket.emit('get message', encryptMsg(queryBody, sharedKey));
        }
      }
    }

    const onUser = (cipherBody) => {
      let sharedKey = localStorage.getItem('sharedKey');
      if(sharedKey) {
        const userBody = decryptMsg(cipherBody.encrypted, sharedKey);
        setUserName(userBody.name);
        setUserId(userBody.id);
      }
    }

    const onReceiveMessages = (cipherBody) => {
      let sharedKey = localStorage.getItem('sharedKey');
      if(sharedKey) {
        const messageArr = decryptMsg(cipherBody.encrypted, sharedKey);
        // console.log(userId);
        dispatch({
          type: 'fetch',
          messages: messageArr.map((msg) => {
            if(msg.fromId === userId) {
              return {
                type: 'primary',
                user: msg.from.name,
                text: msg.message,
                time: formatDateTime(msg.createdAt)
              }
            }
            else if (msg.message.includes(";;")){
              return {
                type: 'signed',
                user: msg.from.name,
                text: msg.message,
                time: formatDateTime(msg.createdAt)
              }
            } 
            else {
              return {
                type: 'secondary',
                user: msg.from.name,
                text: msg.message,
                time: formatDateTime(msg.createdAt)
              }
            }
          })
        });
      }
    }

    const onReceiveKey= (requestKey) => {
      // localStorage.setItem('publicKeyAlpha', requestKey.alpha);
      // localStorage.setItem('publicKeyP',requestKey.p);
      // localStorage.setItem('publicKeyQ',requestKey.q);
      console.log(requestKey)
      let key = "alpha:"+ requestKey.alpha+ "\nq:" +requestKey.q +" \np:" + requestKey.p 
      const buffer = Uint8Array.from(key, c => c.charCodeAt(0));
      const file = new Blob([buffer], { type:"text/plain"});
      const link = document.createElement("a");
      link.href = URL.createObjectURL(file);
      link.download = "schnorrpub.scpub";
      link.click();
    } 
    socket.on('user 1', onUser);
    socket.on('messages', onReceiveMessages);

    // New message
    socket.on('new message', onNewMessage);

    socket.on('receive key', onReceiveKey);

    return () => {
      socket.off('new message', onNewMessage);
      socket.off('user 1', onUser);
      socket.off('messages', onReceiveMessages);
      socket.off('receive key', onReceiveKey);
    }
  }, [dispatch, userId, partner]);

  return (
    <section className="column">
      <MessageList messages={messages} />
      <div className="columns is-mobile has-background-white is-paddingless has-text-centered messageform">
        <MessageForm fullName={userName} />
      </div>
    </section>
  );
}

export default ChatArea;
