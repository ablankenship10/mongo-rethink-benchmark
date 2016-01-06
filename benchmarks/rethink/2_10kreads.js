'use strict';

(function () {
  var Thinky   = require('thinky');
  var _        = require('lodash');
  var NUM_RUNS = 5000; //2 documents are read per run: 10k
  var Test = function (settings) {
    this.settings     = settings;
    this.db           = null;
    this.Table1       = null;
    this.Table2       = null;
    this.doneCallback = null;
  };

  Test.prototype.setup = function (callback) {
    var self    = this;
    self.db     = Thinky(self.settings);
    self.Table1 = require(__dirname + '/../../models/rethink/table1')(self.db);
    self.Table2 = require(__dirname + '/../../models/rethink/table2')(self.db);
    self.Table2.belongsTo(self.Table1, "table1", "table1Id", "id");
    setTimeout(callback, 2000);
  };

  Test.prototype.run = function (callback) {
    var self          = this;
    self.doneCallback = callback;
    var Table1        = self.Table1;
    var Table2        = self.Table2;

    for (var i = 0; i < NUM_RUNS; i++) {
      (function (num) {
        Table1.filter({num: num}).execute(function (err, docs) {
          if (err) {
            callback('Error doc1');
            return;
          }
          self.count();
        });

        Table2.filter({num: num}).execute(function (err, docs) {
          if (err) {
            callback('Error doc2');
            return;
          }
          self.count();
        });
      })(i);
    }
  };

  Test.prototype.count = _.after(NUM_RUNS * 2, function () {
    var self = this;
    console.log('Count');
    self.doneCallback();
  });

  Test.prototype.cleanup = function (callback) {
    var self = this;
    callback();
  };

  module.exports = function (settings) {
    return new Test(settings);
  }
})();