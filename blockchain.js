const Block = require('./block');
const cryptoHash = require('./crypto-hash');


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
    replaceChain(chain) {
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

        console.log('replacing chain with', chain)
        this.chain = chain;

        
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

            console.log(lastDifficulty)
            console.log(difficulty)
            // make sure the difficulty can't be raised too high or lowered too low
            if (Math.abs(lastDifficulty - difficulty) > 1)
                return false;

        }
        return true;
    }

}
    

module.exports = Blockchain;