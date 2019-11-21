const uuid = require('uuid/v1')
const { verifySignature } = require('../util');
//uuid is timestamp based so gives unique time for each transaction

class Transaction { 
    constructor({ senderWallet, recipient, amount }) {
        // gives transaction an ID
        this.id = uuid();
        // gives transaction an output map
        this.outputMap = this.createOutputMap({ senderWallet, recipient, amount });
        this.input = this.createInput({ senderWallet, outputMap: this.outputMap });
    }

    // logic to designate the amount to the recipient
    createOutputMap({ senderWallet, recipient, amount }) {
        const outputMap = {};

        outputMap[recipient] = amount;
        outputMap[senderWallet.publicKey] = senderWallet.balance - amount;

        return outputMap;
    }
    //logic to calc remaining balance once amount is taken

    // needs senderwallet and outputMap
    createInput({ senderWallet, outputMap }) {
        return {
            timestamp: Date.now(),
            amount: senderWallet.balance,
            address: senderWallet.publicKey,
            signature: senderWallet.sign(outputMap),
        };
    }

    // create a function that allows you to update the transaction
    // 
    update({ senderWallet, recipient, amount }) {

        if (amount > this.outputMap[senderWallet.publicKey]) {
            throw new Error('Amount exceeds balance');
        } 
        
        if(!this.outputMap[recipient]) {
            this.outputMap[recipient] = amount;
        } else {
            this.outputMap[recipient] = this.outputMap[recipient] + amount;
        }

        // designate an amount to the next recipient
             // this.outputMap[recipient] = amount;
        // we need to subtract new amount from sender public key
        this.outputMap[senderWallet.publicKey] = this.outputMap[senderWallet.publicKey] - amount;

        // make sure signature can be resigned. need a new signature
        this.input = this.createInput({ senderWallet, outputMap: this.outputMap });
    }

    static validTransaction(transaction) {
        // pull apart the transaction with deconstructor. Also next deconstructor for th einput in the transaction.
        // this gives us all three fields and output map
        const { input: { address, amount, signature }, outputMap } = transaction;
        
        // check if input amount is the same as values in the output map

        // get values from outputmap
        const outputTotal = Object.values(outputMap).reduce((total, outputAmount) => total + outputAmount)
        // above used a reduce function that reduces the array to a single value. in result we add output amount to the total

        // run check now
        if (amount !== outputTotal) {
            console.error(`Invalid transaction from ${address}`);
            return false;
        }

        if (!verifySignature({ publicKey: address, data: outputMap, signature})) {
            console.error(`Invalid transaction from ${signature}`)
            return false;
        }

        return true;

    }
}

module.exports = Transaction;