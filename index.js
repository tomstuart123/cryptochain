// import express function
const bodyParser = require('body-parser')
const express = require('express');
const Blockchain = require('./blockchain');
const PubSub = require('./pubsub')


// run the express function and store it in the local app
const app = express();

// get a new blockchain module
const blockchain = new Blockchain();

// we need to create instant of pubsub class here to replace get and push

const pubsub = new PubSub({ blockchain });

//test code with set timeout to give everything time to register to subscribe chains etc 

setTimeout(() => pubsub.broadcastChain(), 1000);



 
//call app .get from express
// this get request will return the blocks from this instance
// add arguments of '/api/blocks' endpoint in order to read the blockchain data
app.get('/api/blocks', (req, res) => {
    // call back above has two arguments sent from express standing for request and response
    // request object gives lots of detail about the request
    // res object allows us to respond. In this case - we want to send back the blofckchain's blocks. App's method is the res objects ' json  method. which can render a js object in its json form adn send back to requester
    // so below sends back the blockchain's object in json form to whoever makes the block requests
    res.json(blockchain.chain)
});

app.use(bodyParser.json());

// from express this exists. Makes endpoint the first argument. Also has a call back function with req and res object
// receive data from user in json format. Json will provide details of new block. 
// lets set req field for body of block
app.post('/api/mine', (req, res) => {
    // lets pull the data from request body of info
    const { data } = req.body;

    // now we have the block, we can call the addblock function with this data

    blockchain.addBlock( { data })

    //   pubsub.broadcastChain();

    pubsub.broadcastChain();

    // but we need to add it to blockchain. Lets send them to the same blockchain as a receive request but instead, we'll add a block to it
    res.redirect('/api/blocks')

})

// kick off different ports based on package.json if its true. i.e. is the generate peer port set to true

//distinguish defualt port at local host 3000
const DEFAULT_PORT = 3000;

// create dynamic port as needed
let PEER_PORT;
console.log(PEER_PORT);

// check if process is true in package.json

if (process.env.GENERATE_PEER_PORT === 'true') {

    // set peer port to a random value between 3001-4000 plus original so it isn't the same as 300    
    PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

// above parameters. Ports are like addresses to reach running processes on hosted domain name. 

// if PEER PORT, then use that. If undefined, DEFAULT PORT at 3000 
const PORT = PEER_PORT || DEFAULT_PORT;

console.log(PORT);
console.log(DEFAULT_PORT);
console.log(PEER_PORT);

// start the request application by listening for requests until its told to stop
app.listen(PORT, () => console.log(`listening at localhost:${PORT}`));


// TWO ERRORS - i) POST ISN"T SENDING (error) ii) generate of peer environment not working



