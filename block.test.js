
const hexToBinary = require('hex-to-binary');
const Block = require('./block'); //links this to block.js (js not needed by node)
const { GENESIS_DATA, MINE_RATE } = require('./config') //connects to config.js

const cryptoHash = require('./crypto-hash') // connect crypto-hash function

describe('Block', () => { 
    // set 2 seconds
    const timestamp = 2000;
    const lastHash = 'foo-last-hash';
    const hash = 'foo-hash';
    const data = ['blockchain', 'data'];
    const nonce = 1;
    const difficulty = 1;
    const block = new Block({
        timestamp: timestamp,
        lastHash: lastHash,
        hash: hash,
        data: data,
        //set nonce and difficulty for POW
        nonce: nonce,
        difficulty: difficulty,
        //or just new Block ({timestamp, lastHash, hash, data, nonce, diff})
    });

    it('has a timestamp, hash and data property', () => {
        // note on order. Most programming languages you want the expected value first and actual value second. In jest, you do this other way around
        expect(block.timestamp).toEqual(timestamp);
        expect(block.lastHash).toEqual(lastHash);
        expect(block.hash).toEqual(hash);
        expect(block.data).toEqual(data);
        expect(block.nonce).toEqual(nonce);
        expect(block.difficulty).toEqual(difficulty);

    });

    describe('genesis()', () => {
        const genesisBlock = Block.genesis();
        it('returns a Block instance', () => {
            expect(genesisBlock instanceof Block).toBe(true);
        })

        it('returns the correct genesis data', () => {
            expect(genesisBlock).toEqual(GENESIS_DATA)
            // this works even though one is a class and one is an object. Under the hood, classes are also objects. So all have key store values that are the same
        })


    })

    // create mineBlock method. Should return a new block based on algorithm work
    // POTENTIAL ERROR IN BLOCK>JS - change minedBlock there to mineBlock
    describe('mineBlock()', () => {
        const lastBlock = Block.genesis();
        const data = 'minded data';
        const minedBlock = Block.mineBlock({ lastBlock, data });

        it('returns a Block instance', () => {
            expect(minedBlock instanceof Block).toBe(true);
        })

        it('sets the `lastHash` to be the `hash` of the lastBlock', () => {
            expect(minedBlock.lastHash).toEqual(lastBlock.hash)
        })


        it('sets the `data`', () => {
            expect(minedBlock.data).toEqual(data)
        });

        it('sets a `timestamp`', () => {
            expect(minedBlock.timestamp).not.toEqual(undefined) // makes sure timestamp isn't undefined via.not
        });

        it('creates a SHA-256 `hash` based on the proper inputs', () => {
            expect(minedBlock.hash)
            .toEqual(
                cryptoHash(
                    minedBlock.timestamp, 
                    minedBlock.nonce,
                    minedBlock.difficulty, 
                    lastBlock.hash, 
                    data,
                )
            );

        });

        // tests proof of work out
        it('sets a `hash` that matches the difficulty criteria', () => {
            // expect a substring from 0-difficulty matches string of 0s.length
            expect(hexToBinary(minedBlock.hash).substring(0, minedBlock.difficulty)).toEqual('0'.repeat(minedBlock.difficulty));
        })

        // add a test that says it adjusts the difficulty
        it('adjusts the difficulty', () => {
            const possibleResults = [lastBlock.difficulty+1, lastBlock.difficulty-1]

            // check the minedBlock.difficulty is either +1 or -1
            expect(possibleResults.includes(minedBlock.difficulty)).toBe(true);
        }) 
    })

    describe('adjust difficulty', () => {
        //check the function raises the difficulty for quickly mined block
        it('raises the difficulty for a quickly mined block', () => {
            // new function in block to adjust difficulty. accepts the block in the test at the top
            expect(Block.adjustDifficulty({ 
                // takes in a block as argument the original block
                // checks if timestampe of new block. check if this timestamp falls between original timestamp and the mine rate. 

                // raise or lower the difficulty based on the above
                originalBlock: block, timestamp: block.timestamp + MINE_RATE - 100,
            })).toEqual(block.difficulty+1);
                
            

        }) 

        //check the function raises the difficulty for quickly mined block

        it('lowers the difficulty for a slowly mined block', () => {
            // new function in block to adjust difficulty. accepts the block in the test at the top
            expect(Block.adjustDifficulty({
                // gives as argument the original block
                originalBlock: block,
                //gives as argument the original timestamp - some time in millisencds
                timestamp: block.timestamp + MINE_RATE + 100,
                // raise or lower the difficulty based on the above

            })).toEqual(block.difficulty-1);
        }) 

        it('has a lower limit of 1', () => {
            block.difficulty = -1;

            expect(Block.adjustDifficulty({ originalBlock: block })).toEqual(1);
        })

    })

// end overall function
})