var assert = require('assert');

var bindings = require('./bindings');

var SID_PATTERN = /S-\d-\d+-(\d+-){1,14}\d+/;
var IS_SUPPORTED_PLATFORM = /^win/.test(process.platform);

function getSidForUser(user, cb) {
    if (typeof cb !== 'function') {
        throw new TypeError("callback must be a function");
    }
    return bindings.getSidForUser(user, cb);
};

var _32bit = 0x100000000;
var _48bit = 0x1000000000000;
var _64bitLow = 0xFFFFFFFF;
var _64bitHigh = 0xFFFFFFFF00000000;

function binarySidToStringSid(sid) {
    var revision =sid.readUInt8(0);
    // ignored, will just parse until end of buffer
    //var numSubauthorities = sid.readUInt8(1);
    var authority = _32bit * sid.readUInt16BE(2) + sid.readUInt32BE(4);
    var parts = ['S', revision, authority];
    for (var i = 8; i < sid.length; i += 4) {
        parts.push(sid.readUInt32LE(i)); // subauthorities
    }
    return parts.join('-');
}

function stringSidToBinarySid(sid) {
    var parts = sid.split('-');
    assert(parts[0] == 'S');
    var len = 8 + 4 * (parts.length - 3);
    var buf = Buffer.alloc(len);
    buf.writeUInt8(Number(parts[1]), 0); // revision
    buf.writeUInt8(parts.length - 3, 1); // num subauthorities
    var authority = Number(parts[2]);
    buf.writeUInt16BE(Math.round(authority / _32bit), 2); // authority high
    buf.writeUInt32BE(authority & _64bitLow, 4); // authority low
    for (var i = 3; i < parts.length; ++i) {
        var offset = 8 + (i - 3) * 4;
        var subauthority = Number(parts[i]);
        buf.writeUInt32LE(subauthority, offset);
    }
    return buf;
}

module.exports = {};
module.exports.SID_PATTERN = SID_PATTERN;
module.exports.IS_SUPPORTED_PLATFORM = IS_SUPPORTED_PLATFORM;
module.exports.getSidForUser = getSidForUser;
module.exports.binarySidToStringSid = binarySidToStringSid;
module.exports.stringSidToBinarySid = stringSidToBinarySid;
