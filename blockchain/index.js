const Block = require('./block');
const Transaction = require('../wallet/transaction')
const Wallet = require('../wallet')
const { cryptoHash } = require('../util');
const { REWARD_INPUT, MINING_REWARD }  = require('../config')



class Blockchain {
    constructor() {
        this.chain = [Block.genesis()];

    }

    addBlock({ data }) {
        const newBlock = Block.mineBlock({ lastBlock: this.chain[this.chain.length - 1], 
            data 
        });
        this.chain.push(newBlock);
    }

    // not a static chain as this is based on an individual instance of the blockchain
    replaceChain(chain, validateTransactions, onSuccess) {
        // create an exit in chase the new incoming chain is not longer
        if (chain.length <= this.chain.length) {
            console.error('The incoming chain must be longer')
            return;
        }

        // don't replace chain if incoming chain is invalid
        if (!Blockchain.isValidChain(chain)) {
            console.error('The incoming chain must be valid')

            return;
        }
        // use validate Transactions flag. this validates to undefined and grows to falsy. 
        if (validateTransactions && !this.validTransactionData({ chain })) {
            console.error('the incoming chain has invalid data')
            return;
        }

        if (onSuccess) onSuccess();
        console.log('replacing chain with', chain)
        this.chain = chain;

        
    }

    // valid transactionData by comparing blockchain history to a new chain (not a static function as we don't want this to refer to all blockchains but to the lcoal one)
    validTransactionData( {chain} ) {
        for (let i=1; i<chain.length; i++) {
            const block = chain[i];
            // creates a collection of unique items. Arrays can have duplicates but sets cannot. So as we create new transactions we can track if not unique and log error
            const transactionSet = new Set();
            // lets check if there are multiple rewards to make sure there aren't. we can do this using reward counter variable that increments
            let rewardTransactionCount = 0;
            for (let transaction of block.data) {
                if (transaction.input.address === REWARD_INPUT.address) {
                    rewardTransactionCount += 1;
                
                    if (rewardTransactionCount > 1) {
                        console.error('Miner rewards exceed limit')

                        return false;
                    }
                    // problem we don't know miner wallet public key. So we get the value with object.values (only one in the reward transaction so use [0])
                    if (Object.values(transaction.outputMap)[0] !== MINING_REWARD) {
                        console.error('Miner reward amount is invalid')
                        return false
                    }

                } else {
                    // transaction must be valid in amounts and signature
                    
                    if (!Transaction.validTransaction(transaction)) {
                        console.error('Invalid Transaction')
                        return false
                    }
                    // ii) the inputs amount should equal the blockchain history balance. so check it with the calculate balance and your local chain
                    const trueBalance = Wallet.calculateBalance({
                        chain: this.chain,
                        address: transaction.input.address,
                    })

                    if (transaction.input.amount !== trueBalance) {
                        console.error('Invalid input amount or balance')
                        return false;
                    }
                    // iii) not duplicated transactions 
                    // use the set created above to use set method to check if a transaction appears already
                    if (transactionSet.has(transaction)) {
                        console.error('An identical transaction appears more than once in the block')
                        return false;
                    } else {
                        // use other set method to add it to the group
                        transactionSet.add(transaction)
                    }

                }
            }
        }
        
        
        return true;
    }

    // check chain is valid based on tests in blockchain.js
    static isValidChain(chain) {
        // // first test - check that the first block is genesis
        // use stringify to check they are the same even though no blocks can be exactly the same
        if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
            return false;
        };
        // loop through blockchain. Skip genesis block and check fi the last hash is the same as one before and that new hash is legitimate
        for (let i = 1; i<chain.length; i++) {
            // this pulls each current block in chain
                // original === const block = chain[i]
                // but we destructure block using destructuring for clean text
            const { timestamp, lastHash, hash, data, nonce, difficulty } = chain[i];
             // last hash = previous hash.
                // so pull the last block's hash
            const actualLastHash = chain[i-1].hash
                // grab the current block via deconstructing
            const lastDifficulty = chain[i-1].difficulty;
           


            if (lastHash !== actualLastHash) {
                    return false;
            }

            // but is the hash that is presented correct. So we compare the current hash to running the crypto hash with the block's current data
            const validatedHash = cryptoHash (timestamp, lastHash, data, nonce, difficulty);

            if (hash !== validatedHash) {
                return false
            }

            // make sure the difficulty can't be raised too high or lowered too low
            if (Math.abs(lastDifficulty - difficulty) > 1)
                return false;

        }
        return true;
    }

}
    

module.exports = Blockchain;