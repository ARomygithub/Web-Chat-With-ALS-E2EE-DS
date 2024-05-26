import React, {useState, memo } from 'react';
import {verifySignature} from "../lib/algorithm/ClientSchnorrDSS";
function Primary({ data: { user, text, time } }) {
  
  return (
    <div className="column is-12 has-text-right is-paddingless is-clearfix secondary">
      <strong className="is-block">{user}</strong>
      <div className="text is-pulled-right">
        {text}
        <time className="is-block has-text-right">{time}</time>
      </div>
    </div>
  );
}

function Information({ data: { user, text } }) {
  return (
    <div className="column is-12 has-text-centered is-paddingless">
      <strong>{user}</strong> {text}
    </div>
  );
}

function Secondary({ data: { user, text, time } }) {
  return (
    <div className="column is-12 is-paddingless primary">
      <strong className="is-block">{user}</strong>
      <div className="text">
        {text}
        <time className="is-block has-text-right">{time}</time>
      </div>
    </div>
  );
}


function SecondarySigned({ data: { user, text, time } }) {
  const [verify,setVerify] = useState(false);
  const [key,setKey] = useState("");
  const [requestKey, setRequestKey] = useState("");
  
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
    key = key.replace("v:","")
    key = key.split("\n")
    return key
  }
  const verifySigned = async (event)=>{
    event.preventDefault();
    let key =  text;
    key = key.split(";;")
    if(requestKey===""){
      return 
    }
    let globalKey =parseKey(requestKey)
    setVerify(verifySignature(globalKey[0],key[3],key[2],key[1],globalKey[2],key[0]))
    
  }
  return (
    <div className="column is-12 is-paddingless primary">
      <strong className="is-block">{user}</strong>
      <div className="text">
        {text}
        <time className="is-block has-text-right">{time}</time>
        <input type="file" id="uploadFile" name="uploadFile"  onChange={(e) => readKey(e)}/>
        <form onSubmit={verifySigned}>
          <label>Public Key Signature: </label>
          <input type="text" value={key} onInput={(event)=>setKey(event.target.value)}/>
          <input className="button" type="submit" value="Verify" />
        </form>
          
      </div>
    </div>
  );
}

function Message({ data }) {
  console.log('refresh:' + Math.random());
  switch (data.type) {
    case 'primary':
      return <Primary data={data} />;
    case 'information':
      return <Information data={data} />;
    case 'secondary':
      return <Secondary data={data} />;
    case 'signed':
      return <SecondarySigned data={data} />;
    default:
      return <>Grrr</>;
  }
}

export default memo(Message);
