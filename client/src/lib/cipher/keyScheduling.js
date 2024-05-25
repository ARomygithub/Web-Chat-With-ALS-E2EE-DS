const { sBox } = require("./feistel");
const { arrToHexStr } = require("../tools/tools");

const generateSubkeys = (key) => {
    const subkeys = [];
    let keyMatrix = [];
    for(let i = 0; i < 4; i++) {
        let row = [];
        for(let j = 0; j < 4; j++) {
            row.push(key[i*4+j]);
        }
        keyMatrix.push(row);
    }
    for (let i = 0; i < 8; i++) {
        let newKeyMatrix = [];
        for(let j = 0; j < 4; j++) {
            let row = [];
            for(let k = 0; k < 4; k++) {
                row.push(keyMatrix[k][j]);
            }
            newKeyMatrix.push(row);
        }
        for(let j = 0; j < 4; j++) {
            newKeyMatrix[j][j] = keyMatrix[3-j][3-j];
        }
        for(let j = 0; j < 4; j++) {
            for(let k = 0; k < 4; k++) {
                newKeyMatrix[j][k] = sBox[newKeyMatrix[j][k]>>4][newKeyMatrix[j][k]%16] ^ keyMatrix[j][k];
            }
        }
        keyMatrix = newKeyMatrix;
        let oddSubkey = [];
        let evenSubkey = [];
        for(let j = 0; j < 4; j++) {
            for(let k = 0; k < 4; k++) {
                if((j+k)%2) {
                    oddSubkey.push(keyMatrix[j][k]);
                } else {
                    evenSubkey.push(keyMatrix[j][k]);
                }
            }
        }
        // console.log(`Subkey ${i*2+1}: ${arrToHexStr(oddSubkey)}`);
        // console.log(`Subkey ${i*2+2}: ${arrToHexStr(evenSubkey)}`);
        subkeys.push(oddSubkey);
        subkeys.push(evenSubkey);
    }
    return subkeys;
}

module.exports = {generateSubkeys};