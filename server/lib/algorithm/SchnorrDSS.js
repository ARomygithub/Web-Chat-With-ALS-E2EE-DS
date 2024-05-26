const crypto = require('crypto');
const bigintCryptoUtils = require('bigint-crypto-utils');
const {primeFactor } = require('../../../client/src/tools/tools.js')
const { powMod } = require('../tools/tools.js');
const generateKey = ()=>{
    let p = bigintCryptoUtils.primeSync(16);
    let factorArr = primeFactor(p-1n);
    let q = BigInt(factorArr.pop());
    let alpha = p/q; 
    while(powMod(alpha,q,p) % p != 1){
        alpha++;
    }
        
    let requestKey = {
        alpha: alpha,
        p: p,
        q: q
    }
    return requestKey
}


module.exports ={generateKey};

// requestKey = generateKey();
// console.log(requestKey);
// key = createPublicPrivateKey(requestKey.alpha,requestKey.p,requestKey.q);
// console.log(key)
// signature = createDigitalSignature(requestKey.alpha,requestKey.p,requestKey.q,"Hallo",key.private,key.public)
// console.log(signature)
// console.log(verifySignature(requestKey.alpha,key.public,signature.e,requestKey.p,"Hallo",signature))