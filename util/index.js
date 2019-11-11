
// .ec is a property held in elliptic
const EC = require('elliptic').ec;

const cryptoHash = require('./crypto-hash');

// local instance of ec class
// handful of implemnetations. Bitcoin uses secp256k1 stands for standards of efficient cryptography. p stands for prime. 256 bits. algorithm uses a prime number to build the curve. the prime number behind elliptic is 256. k is for the mathemeticio. 1 is the first attempt at this 
const ec = new EC('secp256k1')


const verifySignature = ({ publicKey, data, signature}) => {
    // implement logic for verification
    //ec provides a verify method but only available in key object
    // use temporary object from public key
    // hex makes sure ec knows that it'll be hex as we converted it
    const keyFromPublic = ec.keyFromPublic(publicKey, 'hex');

    // data also needs to be in hash form for verification
    return keyFromPublic.verify(cryptoHash(data), signature);

};

// export the ec class to other files

module.exports = { ec, verifySignature };

//methods in ec class are key pair generator