var PEG = require('pegjs');
var assert = require('assert');
var fs = require('fs'); // for loading files

fs.readFile('my.peg', 'ascii', function(err, data) {
    // Show the PEG grammar file
    console.log(data);
    // Create my parser
    var parse = PEG.buildParser(data).parse;
    // Do a test
    assert.deepEqual( parse("(a b c)"), ["a", "b", "c"] );
});