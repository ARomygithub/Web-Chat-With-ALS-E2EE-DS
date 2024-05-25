const { generateSubkeys } = require("./keyScheduling");
const { feistelEncrypt, feistelDecrypt } = require("./feistel");
const { differentBit } = require("../tools/tools");

const encryptBlock = (input, key) => {
    // let keyAvalanche = key.slice(0,16);
    // keyAvalanche[3] = keyAvalanche[3] ^ 0x01;
    // console.log(`${key}`);
    // console.log(`${keyAvalanche}`);
    let subkeys = generateSubkeys(key);
    // let subkeysAvalanche = generateSubkeys(keyAvalanche);
    let result = feistelEncrypt(input, subkeys);
    // let resultAvalanche = feistelEncrypt(input, subkeysAvalanche);
    // console.log(`Different bit with original key: ${differentBit(result, resultAvalanche)}`);
    return result;
};

const decryptBlock = (input, key) => {
    let subkeys = generateSubkeys(key);
    let result = feistelDecrypt(input, subkeys);
    return result;
};

module.exports = {encryptBlock, decryptBlock };