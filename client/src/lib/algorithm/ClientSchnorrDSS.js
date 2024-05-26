
var Hashes = require('jshashes')
const bigintCryptoUtils = require('bigint-crypto-utils');
const { powMod } = require('../tools/tools.js');



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
    var e = new Hashes.SHA1().hex(message+x)
    //let e = crypto.createHash('sha1').update(message+x).digest('hex')   
    let y = (r + s * BigInt("0x"+e))%q 
    let signature = {
        e :e,
        y :y
    }
    return signature
}

const verifySignature=(alpha,v,y,e,p,message) =>{
    alpha = BigInt(alpha)
    v = BigInt(v)
    y = BigInt(y)
    p = BigInt(p)

    let xBar = (powMod(alpha,y,p) * powMod(v,BigInt("0x"+e),p))% p
    let e2 =  new Hashes.SHA1().hex(message+xBar)
    console.log(e2)
    return e === e2
}
module.exports ={createPublicPrivateKey,createDigitalSignature,verifySignature };