const uuid = require('uuid/v1')
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
}

module.exports = Transaction;