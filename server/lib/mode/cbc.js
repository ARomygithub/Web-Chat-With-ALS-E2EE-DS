const { encryptBlock, decryptBlock } = require("../cipher/cipher");
const { xorBlocks,byteToStr } = require("../tools/tools");


const encryptCBC =  (inputText,cypherKey,iv) =>{
    const blockSize = 128/8
    let result = '';
    let cur_xor = iv; 
    for (let i=0; i<inputText.length;i+=blockSize){
        let block =new Uint8Array(16);
        for (let j=i;j<i+blockSize;j++){
            block[j-i] = inputText[j];
        }
        
        let result_block = xorBlocks(block,cur_xor);
        // console.log(result_block)
        cur_xor = byteToStr(encryptBlock(result_block,cypherKey))
        // console.log(cur_xor)
        result += cur_xor;
        cur_xor = new Uint8Array(cur_xor.split("").map(x => x.charCodeAt()));
    }
    return result;


}
const decryptCBC =  (inputText,cypherKey,iv) =>{
    const blockSize = 128/8
    let result = '';
    let cur_xor = iv; 
    // console.log(inputText.length)
    for (let i=0; i<inputText.length;i+=blockSize){
        let block =new Uint8Array(16) ;
        for (let j=i;j<i+blockSize;j++){
            block[j-i] = inputText[j];
        }
        // console.log(block)
        let decrypt_block = byteToStr(decryptBlock(block,cypherKey));
        // console.log(decrypt_block)
        decrypt_block = new Uint8Array(decrypt_block.split("").map(x => x.charCodeAt()));
        let result_block=xorBlocks(decrypt_block,cur_xor);
        let result_string=''
        for ( let j = 0; j < result_block.length; j++) {
            result_string += String.fromCharCode(result_block[j]);
        }
        // console.log(result_string)
        result += result_string
        
        cur_xor = block
    }
    return result;


}

const encryptMsg = (msg, key) => {
    let iv = new Uint8Array(16);
    iv = byteToStr(iv);
    msg = JSON.stringify(msg);
    msg = new Uint8Array(msg.split("").map(x => x.charCodeAt()));
    let cipher = encryptCBC(msg, key, iv);
    return {
        "encrypted": cipher,
    };
};

const decryptMsg = (msg, key) => {
    let iv = new Uint8Array(16);
    iv = byteToStr(iv);
    msg = new Uint8Array(msg.split("").map(x => x.charCodeAt()));    
    let plain = decryptCBC(msg, key, iv);
    let idx = plain.length-1; 
    while(idx>=0 && plain.charCodeAt(idx) === 0){
        idx--;
    }
    plain = plain.slice(0,idx+1);
    return JSON.parse(plain);
};

module.exports = {encryptMsg,decryptMsg};