// here we will store global variables


// set  MINE_RATE AT one second (1000 ms)
const MINE_RATE = 1000;

// set iniitial difficulty of mining a block low. BTC is 10mins but we want for easy coding less than that
const INITIAL_DIFFICULTY = 3;

// dummy data for the first block in our blockchain
const GENESIS_DATA = {
    timestamp: 1,
    lastHash: 'last-hash',
    hash: 'hash', 
    // all blocks after this can share this initial difficulty and work off of it
    difficulty: INITIAL_DIFFICULTY,
    nonce: 0,
    data: [],

};

    
const STARTING_BALANCE = 1000;

module.exports = { GENESIS_DATA, MINE_RATE, STARTING_BALANCE };