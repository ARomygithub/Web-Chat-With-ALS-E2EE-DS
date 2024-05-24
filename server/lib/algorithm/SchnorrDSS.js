const crypto = require('crypto');
const bigintCryptoUtils = require('bigint-crypto-utils');
const {getRandPrime,modulo,primeFactor,modInverse } = require('../../../client/src/tools/tools.js')
const { getPrimeECDH, invmod,powMod } = require('../tools/tools.js');
const generateKey = ()=>{
    let p = bigintCryptoUtils.primeSync(16);
    let factorArr = primeFactor(p-1n);
    console.log(factorArr)
    let q = BigInt(factorArr.pop());
    let alpha = p/q; 
    while(powMod(alpha,q,p) % p != 1){
        alpha++;
    }
    console.log(alpha)
        
    let requestKey = {
        alpha: alpha,
        p: p,
        q: q
    }
    return requestKey
}
const createPublicPrivateKey= (alpha,p,q) =>{
    let s = bigintCryptoUtils.randBetween(q,1n);
    let v = powMod(alpha,-s,p)
    let key = {
        private:s,
        public:v
    }
    return key
}

const createDigitalSignature =(alpha,p,q,message,s,v) =>{
    let r = bigintCryptoUtils.randBetween(q,1n);
    let x = powMod(alpha,r,p)
    console.log("x = "+x)
    let e = crypto.createHash('sha1').update(message+x).digest('hex')   
    console.log(e)
    y = (r + s * BigInt("0x"+e))%q 
    let signature = {
        e :e,
        y :y
    }
    return signature
}

const verifySignature=(alpha,v,e,p,message,signature) =>{
    xBar = (powMod(alpha,y,p) * powMod(v,BigInt("0x"+e),p))% p
    console.log("xBar = "+xBar);
    console.log(xBar % p)
    e2 =  crypto.createHash('sha1').update(message+xBar).digest('hex')
    console.log(e2)
    return signature.e == e2
}

requestKey = generateKey();
console.log(requestKey);
key = createPublicPrivateKey(requestKey.alpha,requestKey.p,requestKey.q);
console.log(key)
signature = createDigitalSignature(requestKey.alpha,requestKey.p,requestKey.q,"Hallo",key.private,key.public)
console.log(signature)
console.log(verifySignature(requestKey.alpha,key.public,signature.e,requestKey.p,"Hallo",signature))