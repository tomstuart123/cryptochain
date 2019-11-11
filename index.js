// import express function
const bodyParser = require('body-parser')
const express = require('express');
// pull installed request function for get request
const request = require('request')
const Blockchain = require('./blockchain');
const PubSub = require('./app/pubsub')

// run the express function and store it in the local app
const app = express();
// get a new blockchain module
const blockchain = new Blockchain();
// we need to create instant of pubsub class here to replace get and push
const pubsub = new PubSub({ blockchain });

//distinguish defualt port at local host 3000
const DEFAULT_PORT = 3000;

// define root blockchain address for new blockchains to pull historic data from. This way each new connection understands where the blockchain is
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`

//test code with set timeout to give everything time to register to subscribe chains etc 
// setTimeout(() => pubsub.broadcastChain(), 1000);

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
// lets set req field for body of block.
app.post('/api/mine', (req, res) => {
    // lets pull the data from request body of info
    const { data } = req.body;

    // now we have the block, we can call the addblock function with this data

    blockchain.addBlock({ data });

    pubsub.broadcastChain();

    // but we need to add it to blockchain. Lets send them to the same blockchain as a receive request but instead, we'll add a block to it
    res.redirect('/api/blocks');

});

// sync peers to the root blockchain called at the top
const syncChains = () => {
    // use installed request to get root node api blocks for historical data
    request({ url: `${ROOT_NODE_ADDRESS}/api/blocks` }, (error, response, body) => {
        // only want this to fire when request completes so add error parameter above.
        // if all goes well we need body filled which is filled with response from api/blocks endpoint in JSON as we see in postman
        //response also holds meta details about request

        // checks not an error
        // && check the status code in response meta data. Successful get request should give 200 accroding to http protocol
        if (!error && response.statusCode === 200) {
            // if successful - pull the rootchain and parse it from string to object
            const rootChain = JSON.parse(body);

            // then replace new chain with historic chain
            console.log('replace chain on a sync with', rootChain)
            blockchain.replaceChain(rootChain);
        }
    })
}


// kick off different ports based on package.json if its true. i.e. is the generate peer port set to true

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
app.listen(PORT, () => { 
    console.log(`listening at localhost:${PORT}`);
    // run sync chains we created above to make sure new peers are updated to historic blockchian

    //remove redundant messages between root and itself
    if (PORT !== DEFAULT_PORT) {
        syncChains();
    }

});


// TWO ERRORS - i) POST ISN"T SENDING (error) ii) generate of peer environment not working