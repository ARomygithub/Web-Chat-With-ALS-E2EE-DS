const bn = require('bn.js');

const xorBlocks = (block1, block2) => {
    const result = new Uint8Array(16);
    for (let i = 0; i < 16; i++) {
        
        result[i] = block1[i] ^ block2[i];
        // console.log(block1[i])
        // console.log(block2[i])
        // console.log(result[i])
    }
    return result;
};

const byteToStr = (block) => {
    let result = '';
    for (let i = 0; i < block.length; i++) {
        result += String.fromCharCode(block[i]);
    }
    return result;
};

const arrToHexStr= (arr) => {
    let res = "";
    for (let i = 0; i < arr.length; i++) {
        if(arr[i]<16) {
            res += "0";
        }
        res += arr[i].toString(16);
    }
    return res;
};

const differentBit = (arr1, arr2) => {
    let res = 0;
    for (let i = 0; i < arr1.length; i++) {
        res += (arr1[i] ^ arr2[i]).toString(2).split("1").length - 1;
    }
    return res;
};

// ECDH GF(P)
class Curve {
    constructor(a, b, p) {
        this.a = a;
        this.b = b;
        this.p = p;
    }
}

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

const mulmod = (a, b, mod) => {
    return a.mul(b).umod(mod);
}

const addmod = (a, b, mod) => {
    return a.add(b).umod(mod);
}

const invmod = (a, mod) => {
    return a.invm(mod);
}

const negmod = (a, mod) => {
    return mod.sub(a);
}

/**
 * 
 * @param {Curve} curve 
 * @param {Point} p1 
 * @param {Point} p2
 * @returns {Point} 
 */
const addTwoPoint = (curve, p1, p2) => {
    if(p1.x == p2.x) {
        return Point(p1.x, curve.p);
    }
    const m = mulmod(addmod(p1.y, negmod(p2.y, curve.p), curve.p),
                     invmod(addmod(p1.x, negmod(p2.x, curve.p), curve.p), curve.p),
                     curve.p);
    let ret = new Point();
    ret.x = addmod(mulmod(m, m, curve.p), negmod(addmod(p1.x, p2.x, curve.p), curve.p), curve.p);
    ret.y = addmod(mulmod(m, addmod(p1.x, negmod(ret.x, curve.p), curve.p), curve.p), negmod(p1.y, curve.p), curve.p);
    return ret;
}

/**
 * 
 * @param {Curve} curve 
 * @param {Point} p1 
 * @param {bn} k 
 * @returns {Point}
 */
const scalarMul = (curve, p1, k) => {
    let ret = new Point(-1,-1);
    let a = new Point(p1.x, p1.y);
    let b = k.clone();
    while(b.cmp(new bn(0)) > 0) {
        if(b.and(new bn(1)).cmp(new bn(1)) == 0) {
            if(ret.x == -1) {
                ret.x = a.x;
                ret.y = a.y;
            } else {
                ret = addTwoPoint(curve, ret, a);
            }
        }
        a = addTwoPoint(curve, a, a);
        b = b.shrn(1);
    }
    return ret;   
};

export {xorBlocks, byteToStr, arrToHexStr, differentBit };