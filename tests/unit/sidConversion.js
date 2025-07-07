var assert = require('assert');

var SID = require('../../');

describe('SID', function() {
    describe('Parser', function() {
        var hex1 = '01050000000000051500000041dc8ebf627643f1926d41434f040000';
        var buf1 = Buffer.from(hex1, 'hex');
        var str1 = 'S-1-5-21-3213810753-4047730274-1128361362-1103';

        it ('should convert binary sid to string sid', function() {
          assert.strictEqual(SID.binarySidToStringSid(buf1), str1);
        });

        it ('should convert string sid to binary sid', function() {
          assert.strictEqual(SID.stringSidToBinarySid(str1).toString('hex'), hex1);
        });

        var hex2 = '110111111111111188888888';
        var buf2 = Buffer.from(hex2, 'hex');
        var str2 = 'S-17-18764998447377-2290649224';

        it ('should parse 48bit BE authority', function() {
          assert.strictEqual(SID.binarySidToStringSid(buf2), str2);
        });

        it ('should serialize 48bit BE authority', function() {
          assert.strictEqual(SID.stringSidToBinarySid(str2).toString('hex'), hex2);
        });
    });
});
