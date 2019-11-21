const crypto = require('crypto');
// import hexto binary we just installed
// const hexToBinary = require('hex-to-binary');

const cryptoHash = (... inputs) => {
    // use ... spread  operator to make sure we take arguments regardless of how many there are (e..g 2 or 100)
    // create hash object that result of crypto.createHash(with argument sha)
    const hash = crypto.createHash('sha256')
    //  update function that takes the string of the data then creates new hash. Use update() to update data 
    // use .join(to make sure all the data (in form of strings) get concatenated). .sort() makes sure that the data is pulled in the right order
    // extra add map()- stringify array of inputs. Lets make sure objects properties changes, the stringify form also changes.// make array stringify of the array
    hash.update(inputs.map(input => JSON.stringify(input)).sort().join(' '));
    // digest is a term in cryptography that takes a result of a hash. Want the digest in hex form

    return hash.digest('hex');

    

};

module.exports = cryptoHash;