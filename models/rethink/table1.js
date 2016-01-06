'use strict';

(function () {
  module.exports = function (thinky) {
    var type   = thinky.type;
    var Table1 = thinky.createModel("Table1", {
      id: type.string(),
      num: type.number().required(),
      firstName: type.string().default(smallData),
      lastName: type.string().default(largeData),
      addrLine1: type.string().default(largeData),
      addrLine2: type.string().default(largeData),
      addrCity: type.string().default(smallData),
      addrState: type.string().default(smallData),
      addrZip: type.string().default(smallData)
    });
    //Table1.config().update({write_acks: 'single', durability: 'soft'}).run();
    return Table1;
  };

  function largeData() {
    return randomString(40);
  }

  function smallData() {
    return randomString(6);
  }

  function randomString(length) {
    return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
  }
})();