const Transaction = require('../wallet/transaction')

class TransactionMiner {
    constructor({ blockchain, transactionPool, wallet, pubsub })  {
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.wallet = wallet;
        this.pubsub = pubsub;
    }
    // adds transaction to chain
    mineTransaction() {
        // get the transaction pool valid transactions in an array
        const validTransactions = this.transactionPool.validTransactions(); 

        // generate reward transaction for mining work. include it as valid transactions also with push
        validTransactions.push(
            Transaction.rewardTransaction({ minerWallet: this.wallet })
        )

        // add a block consisting of these transactions from this pushed array
        this.blockchain.addBlock({data: validTransactions})

        // broadcast the updated blockchain to pubsub so all in the network can access via the API
        this.pubsub.broadcastChain();

        // clear transaction pool lcoally

        this.transactionPool.clear();
    }
}

module.exports = TransactionMiner