// create wallet class we will create
const Wallet = require('./index');

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


});