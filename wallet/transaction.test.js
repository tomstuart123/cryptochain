const Transaction = require('./transaction');
const Wallet = require('./index');
const { verifySignature } = require('../util');

describe('Transaction', () => {
    let transaction, senderWallet, recipient, amount;
    
    //only wallets should be able to create transactions

    beforeEach(() => {
        // assign senderWallet which is new instance of the wallet class
        senderWallet = new Wallet();
        //fake recipient public key. not real but allow us to debug failure
        recipient = 'recipient-public-key';
        // reasonable value within the 1000 starting balance
        amount = 50

        // new transaction constructor will hold senderWallet, recipient and amount 
        transaction = new Transaction({ senderWallet, recipient, amount })
    });

    it('has an ID', () => {
        // check transaction has an id
        expect(transaction).toHaveProperty('id')
        
    });

    // need transactions to be able to go to more than one recipient. Key for each recipient in the transaction in an output map with value of $
    // outputMap object - will hold a key for each recipient and a value for how much they should receive
    describe('outputMap', () => {
        it('has an `outputMap`', () => {
            expect(transaction).toHaveProperty('outputMap')
        })
        // right amount given to each recipient
        it('outputs the amount to the recipient', () => {
            expect(transaction.outputMap[recipient]).toEqual(amount);
        });

        // needs sender wallets own public key in output map. Value is the amount remaining in balance post sending money to recipient. Need transaction 
        it('outputs the remaining balance for the `senderWallet`', () => {
            expect(transaction.outputMap[senderWallet.publicKey]).toEqual(senderWallet.balance - amount)
        })
    });

    describe('input', () => {
        it('has an `input`', () => {
            expect(transaction).toHaveProperty('input');
        })

        it('has a `timestamp` in the input', () => {
            // has a timpestamp from uuid
            expect(transaction.input).toHaveProperty(`timestamp`)

        })

        it('sets the `amount` to the `senderWallet` balance', () => {
            // needs to contain the original balance
            expect(transaction.input.amount).toEqual(senderWallet.balance)
        })

        it('sets the `address` to the `senderWallet` public key', () => {
            // needs address of input to be the senderwallet public key
            expect(transaction.input.address).toEqual(senderWallet.publicKey)
        })

        it('signs the input', () => {
            expect(verifySignature({
                    publicKey: senderWallet.publicKey,
                    data: transaction.outputMap,
                    signature: transaction.input.signature
                })
            ).toBe(true);
            
            })

    });

    describe('validTransaction()', () => {
        // logs what has gone wrong
        let errorMock;

        beforeEach(() => {
            // use jest method. check if global error was in this code.
            errorMock = jest.fn();
            global.console.error = errorMock;
        })

        describe('when the transaction is valid', () => {
            it('returns true', () => {
                expect(Transaction.validTransaction(transaction)).toBe(true);
            });
        })

        describe('when the transaction is invalid', () => {
            describe('and a transaction output map is invalid', () => {
                it('returns false and logs an error', () => {
                    transaction.outputMap[senderWallet.publicKey] = 999999;

                    expect(Transaction.validTransaction(transaction)).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                })
            });
            describe('and the transaction input signature is invalid', () => {
                it('returns false and logs an error', () => {
                    transaction.input.signature = new Wallet().sign('data');

                    expect(Transaction.validTransaction(transaction)).toBe(false);
                    expect(errorMock).toHaveBeenCalled(); 

                })
            });

        })
    });

    
});