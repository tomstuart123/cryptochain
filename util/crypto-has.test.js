const cryptoHash = require('./crypto-hash')

describe('cryptoHash()', () => {
 
    // check that the hash created is accurate
    it('generates a SHA-256 hashed output', () => {
        expect(cryptoHash('foo')).toEqual('b2213295d564916f89a6a42455567c87c3f480fcd7a1c15e220f17d7169a790b');
    });
    // add more to function. We want the same hash with multiple arguments and even if the arguments are in different order (e.g. like our blocks)

    it('produces the same hash with the same arguments in any order', () => {
        expect(cryptoHash('one', 'two', 'three')).toEqual(cryptoHash('three', 'one', 'two'));
    })
    // ensure new hash is generated when new object comes in (even if new variable object is the same)
    it('produces a unique hash when th epropertiers have changed on an input', () => {
        const foo = {};
        const originalHash = cryptoHash(foo);
        foo['a'] = 'a';
        expect(cryptoHash(foo)).not.toEqual(originalHash);
    })
})