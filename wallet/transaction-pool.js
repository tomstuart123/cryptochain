const Transaction = require('./transaction');

class TransactionPool {
    constructor() {
        this.transactionMap = {}
    }

    clear() {
        this.transactionMap = {};
    }

    setTransaction(transaction) {
        this.transactionMap[transaction.id] = transaction;

    }

    setMap(transactionMap) {
        this.transactionMap = transactionMap
    }

    existingTransaction({ inputAddress }) {
        // return transaction for inputaddress if it already exists
        // so first get array of all transactions in map
        const transactions = Object.values(this.transactionMap);

        // find the first transaction item value found that meets the input address of the function
        return transactions.find(transaction => transaction.input.address === inputAddress);

    }
    validTransactions() {
        // get all the values in this.transaction map in an array with Object.values
        // then filter this array of transactions based on conditions 
        // these conditions are based on if they are a valid transaction from the transaction.js
        // then return it

        return Object.values(this.transactionMap).filter(
            transaction => Transaction.validTransaction(transaction)
        )
    }

    clearBlockchainTransactions({chain}) {
        // iterate through array of blocks in the entire chain.
        for (let i = 1; i < chain.length; i++) {
            const block = chain[i];
            // pull out the transaction of each block
            for (let transaction of block.data) {
                // if transactionMap includes a value at transaction ID, then remove the reference
                if (this.transactionMap[transaction.id]) {
                    delete this.transactionMap[transaction.id]
                }
            }
        }
    }

    
}

module.exports = TransactionPool;