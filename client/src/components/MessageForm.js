import { useEffect, useRef,useState } from 'react';
import { useMessagesDispatch, usePartner } from '../contexts/MessagesContext';
import socket from '../Socket';
import { encryptMsg } from '../lib/mode/cbc';
import {e2eeCurve, base} from '../E2EE/constant';
import {createDigitalSignature, createPublicPrivateKey } from "../lib/algorithm/ClientSchnorrDSS";
function MessageForm({ fullName }) {
  const textareaRef = useRef(null);
  const emojiRef = useRef(null);
  const dispatch = useMessagesDispatch();
  const partner = usePartner();
  const [requestKey, setRequestKey] = useState("");
  const checkSubmit = (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.keyCode === 13 || e.keyCode === 10)) {
      handleSubmit();
    }
  }

  const handleSubmit = () => {
    let textarea = textareaRef.current;
    console.log(e2eeCurve.a);
    console.log(base.x);
    console.log(base.y);
    let sharedKey = localStorage.getItem('sharedKey');
    if(sharedKey) {
      let msgBody = {
          to: partner,
          message: textarea.value
      }
      console.log(msgBody);
      socket.emit('send message', encryptMsg(msgBody, sharedKey));
  
      dispatch({
        type: 'newmessage',
        message: {
          type: 'primary',
          user: fullName,
          text: textarea.value
        }
      });
    }

    textarea.value = '';
  }
  const readKey = async (e) => {
    e.preventDefault()
    const reader = new FileReader()
    reader.onload = async (e) => { 
      setRequestKey(e.target.result);
    };
    reader.readAsText(e.target.files[0]);
    
  }
  const parseKey = (key) =>{
    key = key.replace("alpha:","")
    key = key.replace("q:","")
    key = key.replace("p:","")
    key = key.split("\n")
    return key
  }
  const createKeyFile= (dssKey)=>{
    let key = "alpha:"+ requestKey.alpha+ "\nq:" +requestKey.q +"\np:" + requestKey.p +"\nv:"+dssKey.public
    const buffer = Uint8Array.from(key, c => c.charCodeAt(0));
    const file = new Blob([buffer], { type:"text/plain"});
    const link = document.createElement("a");
    link.href = URL.createObjectURL(file);
    link.download = "schnorrpub.scpub";
  }
  const handleSignatureSubmit= () =>{
    let textarea = textareaRef.current;
    if(requestKey===""){
      socket.emit('request key',"key");
      return 
    }
    let key =parseKey(requestKey)

    let sharedKey = localStorage.getItem('sharedKey');
    if(sharedKey) {
      let dssKey =  createPublicPrivateKey(BigInt(key[0]),BigInt(key[2]),BigInt(key[1]))
      createKeyFile(dssKey)
      let signedMessage = createDigitalSignature(BigInt(key[0]),BigInt(key[2]),BigInt(key[1]),textarea.value,BigInt(dssKey.private),BigInt(dssKey.public))
      let msgBody = {
          to: partner,
          message: textarea.value + ";;" +signedMessage.e+ ";;"+ signedMessage.y+";;"+dssKey.public,
      }
      console.log(msgBody);


      socket.emit('send message', encryptMsg(msgBody, sharedKey));
  
      dispatch({
        type: 'newmessage',
        message: {
          type: 'primary',
          user: fullName,
          text: textarea.value
        }
      });
    }

    textarea.value = '';
  }
  
  

  const appendEmoji = (e) => {
    let emoji = e.target.textContent;
    const textarea = textareaRef.current;
    textarea.value += emoji;
  }

  useEffect(() => {
    let fragment = document.createDocumentFragment();
    let emojRange = [[128513, 128591], [128640, 128704]];

    for (let i = 0, length = emojRange.length; i < length; i++) {
      let range = emojRange[i];
      for (let x = range[0]; x < range[1]; x++) {
        let newEmoji = document.createElement('button');
        newEmoji.className = 'button is-white is-paddingless is-medium'
        newEmoji.innerHTML = '&#' + x + ';';
        newEmoji.addEventListener('click', appendEmoji);
        fragment.appendChild(newEmoji);
      }
    }

    emojiRef.current.appendChild(fragment);
  }, []);

  return (
    <>
      <div className="column is-paddingless">
        <textarea ref={textareaRef} autoFocus={true} className="textarea is-shadowless" rows="2" placeholder="Type a message" onKeyDown={checkSubmit}></textarea>
      </div>

      <div className="column is-2-mobile is-1-tablet is-paddingless">

        <div className="emoji-wrapper">
          <button className="button is-medium is-paddingless is-white" id="Emoji">
            <i className="far fa-smile"></i>
          </button>
          <div ref={emojiRef} id="EmojiList" className="popover has-background-white"></div>
        </div>

        <button className="button is-medium is-paddingless is-white" onClick={handleSubmit}><i className="far fa-paper-plane"></i></button>
        <button className="button is-medium is-paddingless is-white" onClick={handleSignatureSubmit}><i className="far fa-paper-plane"></i>Signature</button>
      </div>
      <div className="column is-2-mobile is-1-tablet is-paddingless">
          <label>Input File: </label>
          <input type="file" id="uploadFile" name="uploadFile"  onChange={(e) => readKey(e)}/>
      </div>
    </>
  );
}

export default MessageForm;
