// import express function
const bodyParser = require('body-parser');
const express = require('express');
// pull installed request function for get request
const request = require('request');
const path = require('path');
const Blockchain = require('./blockchain');
const PubSub = require('./app/pubsub')

// set transaction pool class from transaction pool file
const TransactionPool = require('./wallet/transaction-pool');
const Wallet = require('./wallet');
// pull mine transaction
const TransactionMiner = require('./app/transaction-miner')

// run the express function (playing the role of an API) and store it in the local app. Allows HTTP requests --> JSON but we also include giving it HTML
const app = express();
// get a new blockchain module
const blockchain = new Blockchain();

const transactionPool = new TransactionPool();
const wallet = new Wallet();
// we need to create instant of pubsub class here to replace get and push
const pubsub = new PubSub({ blockchain, transactionPool, wallet });
// create this new transactionminer class
const transactionMiner = new TransactionMiner({ blockchain, transactionPool, wallet, pubsub})

//distinguish defualt port at local host 3000
const DEFAULT_PORT = 3000;

// define root blockchain address for new blockchains to pull historic data from. This way each new connection understands where the blockchain is
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`

// app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'client/dist')))

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
// add api to add generate block to blockchain
app.post('/api/mine', (req, res) => {
    // lets pull the data from request body of info
    const { data } = req.body;

    // now we have the block, we can call the addblock function with this data

    blockchain.addBlock({ data });

    pubsub.broadcastChain();

    // but we need to add it to blockchain. Lets send them to the same blockchain as a receive request but instead, we'll add a block to it
    res.redirect('/api/blocks');

});

// set api request to officially create transaction using their applications wallets. can specify the recipient and the amount body. this will all get put in the transaction pool api and then get a JSON response
    // endpoint is transact with req and res and callback
    // this then pulls the amount and recipient from the request body
    // then create a transaction via local wallets method of create transaction that creates recipient and amount
app.post('/api/transact', (req, res) => {
    const {amount, recipient } = req.body;

    // set transaction to results of existing transaction. this checks that any transactions inputAddress of this wallet public key. if it does, then its update the transaction
    let transaction = transactionPool.existingTransaction({inputAddress: wallet.publicKey});
    try {
        // create if around our create transaction in case tranascation already exists. if it does, then update it to the new details of the sender. If it doesn't create a new one
        if (transaction) {
            transaction.update({ senderWallet: wallet, recipient, amount })
        } else {
            transaction = wallet.createTransaction({ 
                recipient, 
                amount, 
                chain: blockchain.chain 
            })

        }

    } catch(error) {
        return res.status(400).json({ type: 'error', message: error.message })
    }
    
    transactionPool.setTransaction(transaction);

    // they won't get the local wallet, but they will get transaction ID in updated transsaction pool
    pubsub.broadcastTransaction(transaction);
    // create response from 
    res.json({ type: 'success', transaction})
})

app.get('/api/transaction-pool-map', (req, res) => {
    res.json(transactionPool.transactionMap);
})

// add api to call method to add blcok to blockchain
app.get('/api/mine-transactions', (req, res) => {
    transactionMiner.mineTransaction();
    // direct people to specific blocks request
    res.redirect('/api/blocks')
})

app.get('/api/wallet-info', (req, res) => {

    const address = wallet.publicKey;
    // what this api request to return the request and the balance set in the wallet.indexjs
    res.json({
        address: address,
        balance:  Wallet.calculateBalance({ 
            chain: blockchain.chain, 
            address: address
        })

    })
})
// backend will serve front end application at any endpoint not defined above
app.get('*', (req, res) => {
    // send a file from project to requester
    // get current dirctory with __dirname
    res.sendFile(path.join(__dirname, 'client/dist/index.html'));
        
})

// sync peers to the root blockchain called at the top
const syncWithRootState = () => {
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
            console.log('replace chain on a sync with', rootChain);
            blockchain.replaceChain(rootChain);
        }
    })
    // second step get request to sync root transaction mpa with the peer created
    request({ url: `${ROOT_NODE_ADDRESS}/api/transaction-pool-map` }, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            const rootTransactionPoolMap = JSON.parse(body);
            console.log('replace transaction pool map on sync with', rootTransactionPoolMap)
            // set map everytime it syncs. Create this in 
            transactionPool.setMap(rootTransactionPoolMap)
        }
    })
}

// fake wallet for testing
const walletFoo = new Wallet();
const walletBar = new Wallet();

// function to allow fake transactions
const generateWalletTransaction = ({wallet, recipient, amount }) => {
    const transaction = wallet.createTransaction({
        recipient, amount, chain: blockchain.chain
    })

    transactionPool.setTransaction(transaction)
}

const walletAction = () => generateWalletTransaction({
    // transaction from main wallet to foo wallet
    wallet, recipient: walletFoo.publicKey, amount: 5
})

const walletFooAction = () => generateWalletTransaction({
    // transaction from foo wallet to bar wallet
    wallet: walletFoo, recipient: walletBar.publicKey, amount: 10
})

const walletBarAction = () => generateWalletTransaction({
    // transaction from main wallet to another wallet
    wallet: walletBar, recipient: wallet.publicKey, amount: 15
})

// run loop to automate transactions
for (let i=0; i<10; i++) {
    if (i%3 === 0) {
        walletAction();
        walletFooAction();
    } else if (i%3 ===1) {
        walletAction();
        walletBarAction();
    } else {
        walletFooAction();
        walletBarAction();
    }

    transactionMiner.mineTransaction();
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
    console.log(`worked at ${PORT}`)
    // run sync chains we created above to make sure new peers are updated to historic blockchian

    //remove redundant messages between root and itself
    if (PORT !== DEFAULT_PORT) {
        syncWithRootState();
    }

});


// TWO ERRORS - i) POST ISN"T SENDING (error) ii) generate of peer environment not working