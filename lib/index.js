var bindings = require('./bindings');

var SID_PATTERN = /S-\d-\d+-(\d+-){1,14}\d+/;
var IS_SUPPORTED_PLATFORM = /^win/.test(process.platform);

function getSidForUser(user, cb) {
    if (typeof cb !== 'function') {
        throw new TypeError("callback must be a function");
    }
    return bindings.getSidForUser(user, cb);
};

module.exports = {};
module.exports.SID_PATTERN = SID_PATTERN;
module.exports.IS_SUPPORTED_PLATFORM = IS_SUPPORTED_PLATFORM;
module.exports.getSidForUser = getSidForUser;
