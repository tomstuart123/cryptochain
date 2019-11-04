// install the relevent  pubnub module
const PubNub = require('pubnub')

// store pubnum keys
const credentials = {
    publishKey: "pub-c-6ff19ff4-9c11-43f1-a0ec-39fc6ed8aad4",
    subscribeKey: "sub-c-a9824076-faa5-11e9-a301-7a3b1591b90a",
    secretKey: "sec-c-OThjMmU4ZWYtZWI1Yi00ZmVhLWJhYmMtMTEyYTY1ZmJhZjVm",
};
 
// define channels for publishers in channel map
const CHANNELS = {
    TEST: 'TEST',
    // add blockchain channel so that each user has a duty to update blockchain when any changes
    BLOCKCHAIN: 'BLOCKCHAIN'
};

// pull the pubnub class installed above and add our credentials
// this enables us to interact with pub sub services based on channels
class PubSub {
    constructor( { blockchain } ) {
        // beef up pubsub class. Now every pubsub instance will have a local blockchain with it
        this.blockchain = blockchain;

        this.pubnub = new PubNub(credentials);

        // use surbscriber method from pubnub
        // to stop us continually going into channels object to pull data, lets programmatically pull this with object.values(channles). This pulls all the values from channels when needed
        // so this pulls both channels.test & channels.blockchain
        this.pubnub.subscribe({ channels: Object.values(CHANNELS) });

        // this.subscribeToChannels();


       
        // listen for message events in the network
        // take object as arbument with keys that we can handle
        
        this.pubnub.addListener(this.listener());
               
        
    }

    broadcastChain() {
        this.publish({
            channel: CHANNELS.BLOCKCHAIN,
            message: JSON.stringify(this.blockchain.chain)
        });
    }

    // subscribe function. Allows people to subscribe to our channels and receive data from the blockchain channel
    subscribeToChannels() {
        this.pubnub.subscribe({
            channels: [Object.values(CHANNELS)]
        });
    }


        // see above listeners
    listener() {
        return {
            // main keys = messageobject with info of message, what channel it was in, and timestamp / other meta
            message: (messageObject) => {
                // pull the channel and the message specifically
                const { channel, message } = messageObject;

                // makes usre we know that message has been received
                console.log(`Message received. Channel: ${channel}. Message ${message}`);
                
                // pubsub needs to handle blockchain messages. Update it so it can replace a chain when it receives a blockchain message on the blockchain channel
                const parsedMessage = JSON.parse(message);

                // only replace a chain if the parsed message is a valid chain & Longer
                if (channel === CHANNELS.BLOCKCHAIN) {
                  this.blockchain.replaceChain(parsedMessage);
                }

            }
        }
    }

    // publish helper method to the class.
    // takes the channel (where it should send)
    // takes a message - what it should send
     // to actually publish, use the pub sub in-built method. 

    publish({ channel, message }) {
        // there is an unsubscribe function in pubnub
        // but it doesn't have a callback that fires after success
        // therefore, redundant publishes to the same local subscriber will be accepted as noisy no-ops
        this.pubnub.publish({ message, channel });
    }

    // allow us to share blockchains on the network
    // broadcastChain() {
    //     // local pubsub method for broadcasting
    //     this.publish({
    //         // highligh which channel we are broadcasting on. 
    //         channels: CHANNELS.BLOCKCHAIN,
    //         // make this array a string. pubsub can only broadcast in strings. so use json.stringify
    //         message: JSON.stringify(this.blockchain.chain)
    //     })
    // }
    broadcastChain() {
        this.publish({
            channel: CHANNELS.BLOCKCHAIN,
            message: JSON.stringify(this.blockchain.chain)
        });
    }
}

// TESTING PUBSUB
// const testPubSub = new PubSub();

// testPubSub.publish({ channel: CHANNELS.TEST, message: 'hello pubnub'})
    // OR
// setTimeout(() => testPubSub.publisher.publish(CHANNELS.TEST, 'hello pubnub', 1000))



// this class is now shared across all our files
module.exports = PubSub;


