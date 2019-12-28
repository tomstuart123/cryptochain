const Blockchain = require('.');
const Block = require('./block');
const { GENESIS_DATA } = require('../config'); 
//connects to config.js
const { cryptoHash } = require('../util');
const Wallet = require('../wallet');
const Transaction = require('../wallet/transaction')




describe('Blockchain', () => {
    let blockchain;
    let newChain;
    let originalChain;
    let errorMock;
    // unsure we can test blockchain multiple times in the 
    beforeEach(() => {
        blockchain = new Blockchain();
        newChain = new Blockchain();
        errorMock = jest.fn();
        originalChain = blockchain.chain;
        global.console.error = errorMock;

    })

    it('contains a `chain` array', () => {
        expect(blockchain.chain instanceof Array).toBe(true)
    })

    it('starts with a genesis block', () => {
        expect(blockchain.chain[0]).toEqual(Block.genesis());
    })

    it('adds a new block to the chain', () => {
        const newData = 'foo bar';
        blockchain.addBlock({ data: newData });
        
        expect(blockchain.chain[blockchain.chain.length-1].data).toEqual(newData)
    })


    describe('isValidChain()', () => {
        
        describe('when the chain does not start with the genesis block', () =>{
            it('returns false', () => {
                blockchain.chain[0] = { data: 'fake-genesis' }; 

                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);

            });
        });

        describe('when the chain starts with the genesis block and has multiple blocks', () =>{

            beforeEach(() => {
                blockchain.addBlock({ data: 'bears' });
                blockchain.addBlock({ data: 'bulls' });
                blockchain.addBlock({ data: 'hacks' });
            })
            
            describe('and a lastHash reference has changed', () => {
                it('returns false', () => {

                    blockchain.chain[2].lastHash = 'broken-lastHash'

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);

                })
            })

            describe('chain contains block with an invalid field', () => {
                it('returns false', () => {

                    blockchain.chain[2].data = 'dummy-data';

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);

                })
            })

            describe('and the chain contains a block with a jumped difficulty', () => { 
                it('returns false', () => {
                    // start with low difficulty that is obviously wrong
                    const lastBlock = blockchain.chain[blockchain.chain.length-1];

                    const lastHash = lastBlock.hash;

                    const timestamp = Date.now();
                    const nonce = 0;
                    const data = [];
        
                    const difficulty = lastBlock.difficulty - 3;
                  
                    const hash = cryptoHash(timestamp, lastHash, difficulty, nonce, data)

                    const badBlock = new Block({ 
                        timestamp, lastHash, hash, nonce, difficulty, data 
                    })
                    blockchain.chain.push(badBlock);
                    

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                })

            })

            describe('and the chain does not contain any invalid blocks', () => {
                it('returns true', () => {

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
                    
                })
            })

        })

    })

    
    describe('replaceChain()', () => {
        // add stub console to quieten what is loaded to console in tests
        let logMock;
        // set above variables to instances. These are temp methods for tests. The key track to see if certain methods were called during coding. Replace global console method with temporary mock

        beforeEach(() => {
            logMock = jest.fn();
            global.console.log = logMock;
        })
        
        describe('when the new chain is not longer', () => {
            // share set up between each test
            beforeEach(()=> {
                // add dummy data to the new chain so we know it is different from blockchain
                newChain.chain[0] = { new: 'chain' }

                // use new chain to check vs the chain. 
                blockchain.replaceChain(newChain.chain);
            })

            it('does not replace the chain', () => {
                
                expect(blockchain.chain).toEqual(originalChain);
            
            });

            it('logs an error', () => {
                expect(errorMock).toHaveBeenCalled();
            })

        })

        describe('when the new chain is longer', () => {
            beforeEach(() => {
                // repaste some data to ensure new chain is longer
                newChain.addBlock({ data: 'bears' });
                newChain.addBlock({ data: 'bulls' });
                newChain.addBlock({ data: 'hacks' });
            })

            describe('and the chain is invalid', () => {
                
                beforeEach(() => {
                    // we want a hash to be incorrect
                    newChain.chain[2].hash = 'some-fake-hash';

                    blockchain.replaceChain(newChain.chain);
                })
                
                
                it('does not replace the chain', () => {
                    
                    expect(blockchain.chain).toEqual(originalChain);

                });

                it('logs an error', () => {
                    expect(errorMock).toHaveBeenCalled();
                })

            })

            describe('and the chain is valid', () => {

                beforeEach(() => {
                    blockchain.replaceChain(newChain.chain);
                })

                it('replaces the chain', () => {
    
                    expect(blockchain.chain).toEqual(newChain.chain);

                });

                it('logs about the chain replacement', () => {
                    expect(logMock).toHaveBeenCalled();

                });

            })

        })

        describe('and the validateTransactions flag is true', () => {
            it('calls validTransactionData', () => {
                const validTransactionDataMock = jest.fn();
                blockchain.validTransactionData = validTransactionDataMock;
                newChain.addBlock({ data: 'foo' })
                blockchain.replaceChain(newChain.chain, true);

                expect(validTransactionDataMock).toHaveBeenCalled();
            })
        })


    })

    describe('validTransactionData()', () => {
        let transaction, rewardTransaction, wallet;
        
        beforeEach( ()=> {
            wallet = new Wallet();
            transaction = wallet.createTransaction({ recipient: 'foo-address', amount: 65 });
            rewardTransaction = Transaction.rewardTransaction({minerWallet: wallet});
        })

        describe('and the transaction data is valid', () => {
            it('returns true', () => {
                // idea is we want a main blockchian instance to check that a new blockchain is valid via valid transaction method
                newChain.addBlock({data: [transaction, rewardTransaction]});
                expect(
                    blockchain.validTransactionData({ chain: newChain.chain })
                ).toBe(true);
                expect(errorMock).not.toHaveBeenCalled();

                

            })
        })

        describe('and the transaction data has multiple rewards (invalid)', () => {
            it('returns false and logs error', () => {
                newChain.addBlock({ data: [transaction, rewardTransaction, rewardTransaction]})

                expect(
                    blockchain.validTransactionData({ chain: newChain.chain })
                ).toBe(false);
                expect(errorMock).toHaveBeenCalled();
            })
        })

        describe('and the transaction data has at least one malformed output map', () => {
            describe('and the transaction is not a reward transaction', () => {
                it('returns false and logs error', () => {
                    transaction.outputMap[wallet.publicKey] = 999999;

                    newChain.addBlock({ data: [transaction, rewardTransaction]})
                    expect(
                        blockchain.validTransactionData({ chain: newChain.chain })
                    ).toBe(false);
                    expect(errorMock).toHaveBeenCalled();

                })
            })

            describe('and the transaction is a reward transaction', () => {
                it('returns false and logs error', () => {
                    rewardTransaction.outputMap[wallet.publicKey] = 999999;

                    newChain.addBlock({ data: [transaction, rewardTransaction]})

                    expect(
                        blockchain.validTransactionData({ chain: newChain.chain })
                    ).toBe(false);
                    expect(errorMock).toHaveBeenCalled();

                })
            })
        })

        describe('and the transaction data has at least one malformed input', () => {
            // attacker could pretend to have a lot more balance than actual
            it('returns false and logs error', () => {
                // create fake output map with more money
                 wallet.balance = 9000;
                const evilOutputMap = {
                    [wallet.publicKey]: 8900, 
                    fooRecipient: 100
                };

                const evilTransaction = {
                    input: {
                        timestamp: Date.now(),
                        amount: wallet.balance,
                        address: wallet.publicKey,
                        signature: wallet.sign(evilOutputMap)
                    },
                    outputMap: evilOutputMap,
                }
                newChain.addBlock({ data: [evilTransaction, rewardTransaction ]})
                expect(
                    blockchain.validTransactionData({ chain: newChain.chain })
                ).toBe(false);
                expect(errorMock).toHaveBeenCalled();
            })
        })

        describe('and a block contains muliple, duplicated transactions ', () => {
            it('returns false and logs error', () => {
                // replicate test for identical transactions
                newChain.addBlock({
                    data: [transaction, transaction, transaction, rewardTransaction]
                });
                expect(
                    blockchain.validTransactionData({ chain: newChain.chain })
                ).toBe(false);
                expect(errorMock).toHaveBeenCalled();
            })
        })


    })
})