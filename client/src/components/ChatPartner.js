import { useState } from 'react';
import socket from '../Socket';
import { encryptMsg } from '../lib/mode/cbc';
import { usePartner, usePartnerDispatch } from '../contexts/MessagesContext';

function ChatPartner() {
    const [isJoin, setIsJoin] = useState(false);
    const [partner, setPartner] = useState('');
    const partnerGlobal = usePartner();
    const dispatch = usePartnerDispatch();

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch({ type: 'set', partner: partner });
        setIsJoin(true);
        let sharedKey = localStorage.getItem('sharedKey');
        if(sharedKey) {
            let queryBody = {
                with: partner
            }
            console.log(queryBody);
            console.log(encryptMsg(queryBody, sharedKey));
            socket.emit('get message', encryptMsg(queryBody, sharedKey));
        }
    }
    if(isJoin) {
        return (
            <div>
                <h2>Chat partner</h2>
                <p>{partnerGlobal}</p>
            </div>
        )
    } else {
        return (
            <form onSubmit={handleSubmit}>
                <div className="control">
                    <input value={partner} onChange={(e) => setPartner(e.target.value)} className="input" type="text" placeholder="partner-id" required="required" autoFocus={true} />
                </div>
                <div className="control">
                    <input className="button" type="submit" value="Join" />
                </div>
            </form>
        )
    }
}

export default ChatPartner;