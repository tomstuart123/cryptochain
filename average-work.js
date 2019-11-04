const Blockchain = require('./blockchain');

const blockchain = new Blockchain();

// find difference between timestamps between blocks
blockchain.addBlock({ data: 'initial '});

console.log('first block', blockchain.chain[blockchain.chain.length - 1])

let prevTimestamp, nextTimestamp, nextBlock, timeDiff, average;

// hold the times
const times = [];

//lets mine 10,000 blocks. Each time we mine a block, lets track how long it took to mine the block by comparing timestamps. Then use times array to find the average times

// we can also check the mine rate is settling to something that make sense

for (let i=0; i< 10000; i++) {
    // find the last block with length-1
    prevTimestamp = blockchain.chain[blockchain.chain.length-1].timestamp;

    // add block with unique data
    blockchain.addBlock({ data: `block ${i}`});

    

    // pull this added block from 
    nextBlock = blockchain.chain[blockchain.chain.length - 1]

    // pull the timestamp
    nextTimestamp = nextBlock.timestamp;
    
    // how long it took to mine the new block
    timeDiff = nextTimestamp - prevTimestamp;

    //push it into new array

    times.push(timeDiff)

    // sum of everything in times array. Use reduce function puts entire array in single value and held in total. total then held in a callback. num is one item at a time. 
    average = times.reduce((total, num) => (total + num)) / times.length;

    console.log(`Time to mine block: ${timeDiff}ms. Difficulty: ${nextBlock.difficulty}. Average time: ${average}ms`)

}

