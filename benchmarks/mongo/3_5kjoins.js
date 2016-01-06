'use strict';

(function () {
  var mongoose = require('mongoose');
  var _        = require('lodash');
  var NUM_RUNS = 5000; //2 documents are read per run: 10k
  var Test = function (settings) {
    this.connectUrl   = settings;
    this.db           = null;
    this.conn         = null;
    this.Table1       = null;
    this.Table2       = null;
    this.doneCallback = null;
  };

  Test.prototype.setup = function (callback) {
    var self = this;
    var conn = mongoose.createConnection(self.connectUrl);
    conn.on('error', function () {
      callback('Connect Error');
    });
    conn.once('open', function () {
      self.db   = mongoose;
      self.conn = conn;
      require(__dirname + '/../../models/mongo/table1')(self.db, conn);
      require(__dirname + '/../../models/mongo/table2')(self.db, conn);
      setTimeout(callback, 2000);
    });
  };

  Test.prototype.run = function (callback) {
    var self          = this;
    self.doneCallback = callback;
    var Table1        = self.conn.model('Table1');
    var Table2        = self.conn.model('Table2');

    for (var i = 0; i < NUM_RUNS; i++) {
      (function (num) {
        Table2.findOne({num: num}).populate('table1').exec(function (err, doc1) {
          if (err) {
            callback('Error doc1');
            return;
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
    self.db.disconnect(function () {
      callback();
    });
  };

  module.exports = function (settings) {
    return new Test(settings);
  }
})();