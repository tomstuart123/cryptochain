// // 
const TransactionPool = require('./transaction-pool');
// // we need to pool transaction objects ready to be sorted in transaction pool
const Transaction = require('./transaction');
// // get wallet class for create transaction method
const Wallet = require('./index')
const Blockchain = require('../blockchain')



describe('TransactionPool', () => {
    let transactionPool, transaction, senderWallet;

    beforeEach(() => {
        transactionPool = new TransactionPool();
        senderWallet = new Wallet();
        transaction = new Transaction({
            senderWallet,
            recipient: 'fake-recipient',
            amount: 50
        });
    });

    describe('setTransaction()', () => {
        // this method will make sure we add a transaction from inside transaction pool
        it('adds a transaction', () => {
            transactionPool.setTransaction(transaction);

            expect(transactionPool.transactionMap[transaction.id])
                .toBe(transaction);
        });
    })

    describe('existingTransaction()', () => {
        it('returns an existing transaction given an input address', () => {
            transactionPool.setTransaction(transaction);
            expect(
                
                transactionPool.existingTransaction({ inputAddress: senderWallet.publicKey })

            ).toBe(transaction);
        });
    });
    describe('validTransactions()', () => {
        let validTransactions, erroMock;
        // set validTransactions in an array
        beforeEach(()=> {
            validTransactions = [];
            // remove the errors in red for each invalid transaction
            errorMock = jest.fn();
            global.console.error = errorMock;
                    // loop to add transactions(if valid) to array above

            for (let i=0; i<10; i++) {
                transaction = new Transaction ({
                    senderWallet,
                    recipient: 'any-recipient',
                    amount: 30,
                })

                // in loop, if multiple of 3, make the amount of transaction invalid.
                // in loop, if multiple of 1, 4 etc, make the signature invalid
                // otherwise make it fine (e.g. 2, 5, 8) and push to valid transaction array
                // this also covers output map not equallying input as the amounts won't equal
                if (i%3===0) {
                    transaction.input.amount = 999999;
                } else if (i % 3 === 1){
                    transaction.input.signature = new Wallet().sign('foo');
                } else {
                    validTransactions.push(transaction)
                }
                // then pushh transactions into pool whether invalid or valid
                transactionPool.setTransaction(transaction);

            }

        })

        it('returns valid transaction', () => {
            expect(transactionPool.validTransactions()).toEqual(validTransactions)
        })

        it ('logs errors for the invalid transaction', () => {
            transactionPool.validTransactions();
            expect(errorMock).toHaveBeenCalled();
        })

    })

    describe('clear()', () => {
        it('clears the transactions', () => {
            transactionPool.clear();

            expect(transactionPool.transactionMap).toEqual({});
        })
    })
    describe('clearBlockchainTransactions()', () => {
        it('clears the the pool of any existing blockchain transactions', () => {
            // make local blockcahin and expected tranasction
            const blockchain = new Blockchain();
            const expectedTransactionMap = {};
            for (let i = 0; i < 6; i++) {
                // create transaction
                const transaction = new Wallet().createTransaction({
                    recipient:'foo', 
                    amount: 20
                })
                // set it in the pool
                transactionPool.setTransaction(transaction)
                // half time add block to local blockcahain
                if (i % 2 === 0) {
                    blockchain.addBlock({data: [transaction]})
                    // half loops add the block of transaation to the blockchain
                } else {
                    // or expected transcation map contain transaction 
                    expectedTransactionMap[transaction.id] = transaction;

                }
                

            }


            transactionPool.clearBlockchainTransactions({chain:blockchain.chain});

            expect(transactionPool.transactionMap).toEqual(expectedTransactionMap)
        })
    })
})