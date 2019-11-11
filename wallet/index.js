const { STARTING_BALANCE } = require('../config')
const { ec } = require('../util');

const cryptoHash = require('../util/crypto-hash')



class Wallet {
    constructor() {
        // add initial balance for everyone
        this.balance = STARTING_BALANCE;

        // build key pair value method from ec
        // why - key pair has private and public key
        // .encode it into hex code so its not x and y poitns anymore
        this.keyPair = ec.genKeyPair();

        // pulls public key from the keypair object
        this.publicKey = this.keyPair.getPublic().encode('hex');

        // note we aren't using .getPrivateKeyPair. As it is private
    }
    sign(data) {
        // keypair has a sign method
        //and has knowledge of private key without calling it. this we want to return
        //take in data to be signed
        return this.keyPair.sign(cryptoHash(data))
        // why cryptohash - this works best if data is in the form of a single cryptographic hash

    }
};

module.exports = Wallet;