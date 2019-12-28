// create wallet class we will create
const Wallet = require('./index');
const Transaction = require('./transaction');
//pull verify signature in util directory
const { verifySignature } = require('../util');

const Blockchain = require('../blockchain')
const { STARTING_BALANCE } = require('../config')

describe('Wallet', () => {
    let wallet;
    
    // now before each test, set the wallet to reset each time so each test is seperate
    beforeEach(() => {
        wallet = new Wallet();
    })

    // check wallet has a balance 
    it('has a `balance`', () => { 
        expect(wallet).toHaveProperty('balance')
    })

    it('has a `publicKey`', () => {
        expect(wallet).toHaveProperty('publicKey')
    })

    describe('signing data', () => {
        const data = 'foobar';

        it('verifies a signature', () => {
            expect(
                verifySignature({
                    publicKey: wallet.publicKey,
                    data,
                    signature: wallet.sign(data)
                })
            ).toBe(true);
            
        });

        it('does not verify an invalid signatures', () => {
            expect(
                verifySignature({
                    publicKey: wallet.publicKey,
                    data,
                    // try to make signature based off another wallet's signature so that it fails. We need this to fail for wrong destination
                    signature: new Wallet().sign(data),
                })
            ).toBe(false);
        });
    });

    describe('createTransaction()', () => {
        describe('and the amount exceeds the balance', () => {
            it('throws an error', () => {
                expect(() => wallet.createTransaction({ amount: 999999, recipient: 'foo-recipient' })).toThrow('Amount exceeds balance');
            })
        })

        describe('and the amount is valid', () => {
            let transaction, amount, recipient;

            beforeEach(() => {
                amount = 50;
                recipient = 'foo-recipient';
                transaction = wallet.createTransaction({ amount, recipient })
            })
            it('creates an instance of `Transaction`', () => {
                expect(transaction instanceof Transaction).toBe(true);
            });

            it ('matches the transaction input with the wallet', () => {
                expect(transaction.input.address).toEqual(wallet.publicKey);
            })

            it('outputs the amount to the recipient', () => {
                expect(transaction.outputMap[recipient]).toEqual(amount);
            })
        })

        describe('and a chain is passed', () => {
            it('calls `Wallet.calculateBalance`', () => {
                const calculateBalanceMock = jest.fn();

                const originalCalculateBalance = Wallet.calculateBalance;

                Wallet.calculateBalance = calculateBalanceMock;

                wallet.createTransaction({
                    recipient: 'foo',
                    amount: 10,
                    chain: new Blockchain().chain
                });

                expect(calculateBalanceMock).toHaveBeenCalled();

                Wallet.calculateBalance = originalCalculateBalance;
            });
        });
    })

    describe('calculateBalance()', () => {
        let blockchain;

        beforeEach(() => {
            blockchain = new Blockchain();
        })

        describe('and there are no outputs for the wallet', () => {
            it('returns the `STARTING_BALANCE`', () => {
                expect(
                    Wallet.calculateBalance({
                        chain: blockchain.chain,
                        address: wallet.publicKey,

                    })
                ).toEqual(STARTING_BALANCE)

               
            })
        })

        describe('and there are outputs for the wallet', () => {
            let transactionOne, transactionTwo;

            beforeEach(() => {
                transactionOne = new Wallet().createTransaction({
                    recipient: wallet.publicKey,
                    amount: 50
                })
                transactionTwo = new Wallet().createTransaction({
                    recipient: wallet.publicKey,
                    amount: 60
                })
                blockchain.addBlock({ data: [transactionOne, transactionTwo] })

            })

            it('adds the sum of all outputs to the wallet balance', () => {
                expect(
                    Wallet.calculateBalance({
                        chain: blockchain.chain,
                        address: wallet.publicKey,
                    })
                ).toEqual(
                    STARTING_BALANCE + transactionOne.outputMap[wallet.publicKey] + transactionTwo.outputMap[wallet.publicKey]
                )

            })

            describe('and the wallet has made a transaction', () => {
                let recentTransaction;
                // before each test, make sure wallet makes transaction
                beforeEach(() => {
                    recentTransaction = wallet.createTransaction({
                        recipient: 'foo-address',
                        amount: 30,
                    })
                    blockchain.addBlock({
                        data: [recentTransaction]
                    })
                })
                it('returns the output amount of the recent transaction', () => {
                    // absolute blanaca should be blandce at end of transasction
                    expect(
                        Wallet.calculateBalance({
                            chain: blockchain.chain,
                            address: wallet.publicKey,
                        })
                    ).toEqual(recentTransaction.outputMap[wallet.publicKey]);
                    
                })

                describe('and there are outputs next to and after the recent transaction', () => {
                    let sameBlockTransaction, nextBlockTransaction;
                    // cover transactions in the same block and transacctions after in the chain
                    beforeEach(() => {
                        recentTransaction = wallet.createTransaction({
                            recipient: 'later-foo-address',
                            amount: 60
                        });
                        // same blocks are likely to be i) miner rewards.
                        // lets ensure the balance includes the miner reward + transaction difference
                        sameBlockTransaction = Transaction.rewardTransaction({ minerWallet: wallet })

                        blockchain.addBlock({ data: [recentTransaction, sameBlockTransaction ]})

                        nextBlockTransaction = new Wallet().createTransaction({
                            recipient: wallet.publicKey,
                            amount: 75
                        });
                        // then at end of loop, add block of the next transaction. This gives us a set up of a transaction, a miner reward transaction and a block further down
                        blockchain.addBlock({data: [nextBlockTransaction ]})

                    });

                    it('includes the output amounts in the returned balance', () => {
                        expect (
                            Wallet.calculateBalance({
                                chain: blockchain.chain,
                                address: wallet.publicKey
                            })
                        ).toEqual(
                            // makes sure balance is the same as the recent transaction + (miner reward + transaction) + later transactions
                            recentTransaction.outputMap[wallet.publicKey] + sameBlockTransaction.outputMap[wallet.publicKey] + nextBlockTransaction.outputMap[wallet.publicKey]
                        )
                    })
                });

            });

        });

        
    });

});