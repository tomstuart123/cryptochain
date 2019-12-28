const Transaction = require('./transaction');
const Wallet = require('./index');
const { verifySignature } = require('../util');
const {REWARD_INPUT, MINING_REWARD } = require('../config')

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

    // update function will add new amount for new recipient but in existing transaction output map
    describe('update()', () => {
        let originalSignature, originalSenderOutput, nextRecipient, nextAmount;

        describe(' and the amount is invalid', () => {
            it('throws an error', () => {
                expect(() => {
                    transaction.update({
                        senderWallet, receipient: 'foo', amount: 999999
                    })
                }).toThrow('Amount exceeds balance')
                
            })
        })

        describe('and the amount is valid', () => { 
            beforeEach(() => {
                originalSignature = transaction.input.signature;
                originalSenderOutput = transaction.outputMap[senderWallet.publicKey];
                nextRecipient = 'next-recipient';
                nextAmount = 50;

                // update function receives senderWallet, recipient and amount
                transaction.update({ senderWallet, recipient: nextRecipient, amount: nextAmount })
            })

            it('outputs the amount to the next recipient', () => {
                expect(transaction.outputMap[nextRecipient]).toEqual(nextAmount);
            });

            // new amount needs to take money from sender wallet

            it('subtracts amount from original sender wallet output amount (or balnace)', () => {
                expect(transaction.outputMap[senderWallet.publicKey]).toEqual(originalSenderOutput - nextAmount);
            })

            it('maintains a total output value that matches the input amount', () => {
                // use reduce to get total from outputMap then add it to the total
                expect(
                    Object.values(transaction.outputMap)
                        .reduce((total, outputAmount) => total + outputAmount)
                ).toEqual(transaction.input.amount);
            });

            it('re-signs the transaction', () => {
                expect(transaction.input.signature).not.toEqual(originalSignature);
            })

            describe('and another update for the same receipient', () => {
                let addedAmount;

                beforeEach(() => {
                    addedAmount = 80;
                    transaction.update({
                        senderWallet, recipient: nextRecipient, amount: addedAmount
                    })
                })

                it('adds to the recipient amount', () => {
                    expect(transaction.outputMap[nextRecipient])
                    .toEqual(nextAmount + addedAmount)
                })

                it('subtracts the amount from the original sender output amount', () => {
                    expect(transaction.outputMap[senderWallet.publicKey])
                        .toEqual(originalSenderOutput - nextAmount - addedAmount)
                })

            })
        });
        
    })

    describe('rewardTransaction()', () => {
        let rewardTransaction, minerWallet;
        beforeEach(() => {
            // use new wallet class for minerWallet
            minerWallet = new Wallet();
            rewardTransaction = Transaction.rewardTransaction({ minerWallet })
        })
        it('creates a transaction with a reward it in', () => {
            // check reward transaction should equal reward input
            expect(rewardTransaction.input).toEqual(REWARD_INPUT)
        })
        it('creates one transaction for the miner with the `MINING_REWARD`', () => {
            expect(rewardTransaction.outputMap[minerWallet.publicKey]).toEqual(MINING_REWARD);
        })
    })
});