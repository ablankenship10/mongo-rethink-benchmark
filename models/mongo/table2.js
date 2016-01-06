'use strict';

(function () {
  module.exports = function (db, conn) {
    var Schema = db.Schema;
    conn.model('Table2', new Schema({
      num: {type: Number, required: true},
      table1: {type: Schema.Types.ObjectId, ref: 'Table1'},
      firstName: {type: String, default: smallData},
      lastName: {type: String, default: largeData},
      addrLine1: {type: String, default: largeData},
      addrLine2: {type: String, default: largeData},
      addrCity: {type: String, default: smallData},
      addrState: {type: String, default: smallData},
      addrZip: {type: String, default: smallData}
    }));

    function largeData() {
      return randomString(40);
    }

    function smallData() {
      return randomString(6);
    }

    function randomString(length) {
      return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
    }
  };
})();