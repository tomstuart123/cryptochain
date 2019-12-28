const hexToBinary = require('hex-to-binary');
const { GENESIS_DATA, MINE_RATE } = require('../config'); 
//connects to config.js
const { cryptoHash } = require('../util');
// connect crypto-hash function
 
class Block {
    constructor({ timestamp, lastHash, hash, data, nonce, difficulty }) {
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;
        this.nonce = nonce;
        this.difficulty = difficulty;

    }
    // create method inside block. This method can return a new block (represented by this) but loaded with Genesis Data from config file
    static genesis() {
        return new this(GENESIS_DATA);
    }
    // create a minedBlock function that can create new blocks without a hash
    static mineBlock({ lastBlock, data }) {
        const lastHash = lastBlock.hash;
        let hash, timestamp;
        // grab last block difficulty
        let { difficulty } = lastBlock;
        // make nonce a variable that can change. nonce should be able to adjust in mining algorithm
        let nonce = 0;

        // introduce a pattern to create a new hash until one is find with the right amount of leading 0s. DO WHILE LOOP   increments the non-value until the difficulty criteria is met
        do {
            // whilst below isn't true keep >
            // adjusting the nonce
            nonce++;
            // setting the timestamp to current
            timestamp = Date.now();
            // adjust difficulty by calling the below function. do this on every loop to find the valid hash
            difficulty = Block.adjustDifficulty({ 
                originalBlock: lastBlock, 
                timestamp
            })
            // setting the hash based on the data and the above
            hash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);
            // note  add hexto binary to see the binary form

        } while (hexToBinary(hash).substring(0, difficulty) !== '0'.repeat(difficulty));
        
        return new this({
            timestamp,
            lastHash,
            data,
            difficulty,
            nonce,
            hash,
        });
    }
    // need to generate unique hash value from block. all data fields (time stamp, data, unique hash of block before)
    // we will use algorith SHA-256 (Secure Hash Algorith 256 size of bits for hash). See word for description of this

    // adjsut difficulty function that takes in a block and a timestamp
    static adjustDifficulty( { originalBlock, timestamp }) {
        // deconstruct original block to get difficulty
        const { difficulty } = originalBlock;

        if (difficulty < 1) {
            return 1;
        }
        // check incoming timestamp and original
        // const difference = timestamp - originalBlock.timestamp;

        if ((timestamp - originalBlock.timestamp) > MINE_RATE) {
            return difficulty - 1;
        }

        // update difficulty up if difference < MINE_RATE
        return difficulty + 1;
    }


}

module.exports = Block;
// export default { Block };
//node.js sharing code syntax between files

