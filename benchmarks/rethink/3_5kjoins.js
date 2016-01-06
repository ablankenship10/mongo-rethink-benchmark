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
    var Table2        = self.Table2;
    var num           = 0;

    for (var i = 0; i < NUM_RUNS; i++) {
      (function (num) {
        Table2.filter({num: num}).getJoin({table1: true}).run(function (err, doc) {
          if (err) {
            console.log(err);
            callback('Error doc1');
            return;
          }
          if (num == 3) {
            console.log(doc);
          }
          self.count();
        });
      })(i);
    }
  };

  Test.prototype.count = _.after(NUM_RUNS, function () {
    var self = this;
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