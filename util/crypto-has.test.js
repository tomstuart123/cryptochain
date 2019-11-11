const cryptoHash = require('./crypto-hash')

describe('cryptoHash()', () => {
 
    // check that the hash created is accurate
    it('generates a SHA-256 hashed output', () => {
        expect(cryptoHash('foo')).toEqual('2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae');
    });
    // add more to function. We want the same hash with multiple arguments and even if the arguments are in different order (e.g. like our blocks)

    it('produces the same hash with the same arguments in any order', () => {
        expect(cryptoHash('one', 'two', 'three')).toEqual(cryptoHash('three', 'one', 'two'));
    })
})