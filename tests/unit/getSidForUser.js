var assert = require('assert');

var username = require('username');
var wmic = require('ms-wmic');

var SID = require('../../');

describe('SID', function() {
    if (!SID.IS_SUPPORTED_PLATFORM) {
      return;
    }

    describe('getSidForUser', function() {

        var currentUser;
        var sidForCurrentUser;
        before(function(cb) {
            currentUser = username.sync();
            getSidForUserViaWmic(currentUser, function(err, sid) {
                if (err) { return cb(err); }
                sidForCurrentUser = sid;
                return cb();
            });
        });

        it('should return some sid', function(cb) {
            SID.getSidForUser(currentUser, function(err, sid) {
                assert.ifError(err);
                assert.strictEqual(sid, sidForCurrentUser);
                return cb();
            });
        });
    });
});

function getSidForUserViaWmic(username, cb) {
    var query = "useraccount where name='" + username + "' get sid";
    wmic.execute(query, function (err, output) {
      if (err) { return cb(err); }

      var m = (output || "").match(SID.SID_PATTERN);
      return cb(null, m && m[0]);
    });
}
