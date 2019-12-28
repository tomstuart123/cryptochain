const Transaction = require('./transaction')
const { STARTING_BALANCE } = require('../config')
const { ec, cryptoHash } = require('../util');


// removed as we are getting it from util
// const cryptoHash = require('../util/crypto-hash')



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

    createTransaction({ recipient, amount, chain }) {

        // if chain passed and defined, then set your balance not to starting balance (in constructor above) but to calculate balance on any transaction history so far

        if (chain) {
            this.balance = Wallet.calculateBalance({
                chain,
                address: this.publicKey
            })
        }
        if (amount > this.balance) {
            throw new Error('Amount exceeds balance')
        }
        return new Transaction({ senderWallet: this, recipient, amount })
        
    }

    static calculateBalance({ chain, address }) {
        // set variable that allows tracking of run or not. switched to true if the input address has been run. then only the false ones are done
        let hasConductedTransaction = false;
        // start outputs total to 0 then increment on it
        let outputsTotal = 0;

        // loop through chain but skip genesis block and go backwards so that we start with the latest transactions
        for (let i=chain.length-1; i > 0; i--) {
            // loop through each block
            const block = chain[i];
            for (let transaction of block.data) {
                // if the address on calc balance ==== the address in the input
                if (transaction.input.address == address) {
                    hasConductedTransaction = true;
                }
                // pull out value of outputMap at this block
                const addressOutput = transaction.outputMap[address]

                if(addressOutput) {
                    outputsTotal = outputsTotal + addressOutput;
                }

                // then add it to outputs total
            }
            // we are running backwards through the chain. If we hit the fact that we have already made the transaction, then we don't need to loop through anymore as we have the latest balnace from the latest public address
            if (hasConductedTransaction) {
                break;
            }
        }

        // add ternary operator on the return. If has conducted transaction before and stopped the loop, then starting balance is already included so just return outputsTotal. But if the first transaction, then add outputs total to starting balance 
        return hasConductedTransaction ? 
            outputsTotal: 
            STARTING_BALANCE + outputsTotal;
    }
};

module.exports = Wallet;