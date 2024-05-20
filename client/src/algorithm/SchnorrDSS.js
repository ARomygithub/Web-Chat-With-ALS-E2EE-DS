const crypto = require('crypto')


const generateKey = ()=>{
    q =getRadPrime(1000,10000);
    p = primeFactor(q-1);
    alpha = (p* Math.floor(Math.random() * 10)+1)
    let requestKey = {
        alpha: alpha,
        p: p,
        q: q
    }
    return requestKey
}
const createPublicPrivateKey= (alpha,p,q) =>{
    s = Math.floor(Math.random() * q)
    v = modInverse(Math.pow(alpha,s),p)
    let key = {
        private:s,
        public:v
    }
    return key
}

const createDigitalSignature =(alpha,p,q,message,s,v) =>{
    r = Math.floor(Math.random() * q)
    x = modulo(Math.pow(alpha,r),p)
    e = crypto.createHash('md5').update(message+x).digest('hex')   
    y = modulo((r + s * e),q) 
    let signature = {
        e :e,
        y :y
    }
    return signature
}

const verifySignature=(alpha,v,e,p,message,signature) =>{
    xBar = modulo((Math.pow(alpha,signature.requestKey) * Math.pow(v,e)),p)
    e2 =  crypto.createHash('md5').update(message+x).digest('hex')
    return signature.e == e2
}