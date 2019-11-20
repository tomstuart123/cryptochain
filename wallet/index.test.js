// create wallet class we will create
const Wallet = require('./index');
const Transaction = require('./transaction');

//pull verify signature in util directory
const { verifySignature } = require('../util');

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
    })

});