'use strict';

(function () {
  var fs             = require('fs');
  var mongoTests     = [];
  var rethinkTests   = [];
  var mongoResults   = {};
  var rethinkResults = {};

  var mongoSettings   = 'mongodb://192.168.99.100:32806/benchmarks';
  var rethinkSettings = {
    host: '192.168.99.100',
    port: 32817,
    db: 'benchmarks'
  };

  //Load Mongo Tests
  var mongoFiles = fs.readdirSync(__dirname + '/benchmarks/mongo');
  mongoFiles.sort(function (a, b) {
    return a < b ? -1 : 1;
  });
  mongoFiles.forEach(function (file) {
    if (file.match(/\.js$/) !== null) {
      var name = file.replace('.js', '').replace(/\d+_/, '');
      mongoTests.push({name: name, test: require(__dirname + '/benchmarks/mongo/' + file)(mongoSettings)});
    }
  });

  //Load Rethink Tests
  var rethinkFiles = fs.readdirSync(__dirname + '/benchmarks/rethink');
  rethinkFiles.sort(function (a, b) {
    return a < b ? -1 : 1;
  });
  rethinkFiles.forEach(function (file) {
    if (file.match(/\.js$/) !== null) {
      var name = file.replace('.js', '').replace(/\d+_/, '');
      rethinkTests.push({name: name, test: require(__dirname + '/benchmarks/rethink/' + file)(rethinkSettings)});
    }
  });

  //Loop through tests for both mongo and rethink, one at a time
  var current = 0;
  console.log('Starting Mongo Tests');
  loop(mongoTests, mongoResults, function () {
    current = 0;
    console.log('Starting Rethink Tests');
    loop(rethinkTests, rethinkResults, function () {
      printResults();
    });
  });

  function loop(tests, results, done) {
    if (current < tests.length) {
      var test = tests[current];
      console.log("Running test:", test.name);
      runTest(test.test, function (err, time) {
        if (err) {
          results[test.name] = 'Failed';
          console.log("Test", test.name, 'Failed', err);
        } else {
          results[test.name] = time;
          console.log("Test", test.name, 'Complete in ', time);
        }
        current++;
        loop(tests, results, done);
      });
    } else {
      done();
    }
  }

  function runTest(test, callback) {
    test.setup(function (err) {
      if (err) {
        callback(err);
        return;
      }
      var startTime = new Date().getTime();
      test.run(function (err) {
        if (err) {
          callback(err);
          return;
        }
        var endTime   = new Date().getTime();
        var totalTime = endTime - startTime;
        test.cleanup(function (err) {
          if (err) {
            callback(err);
          } else {
            callback(null, prettyTime(totalTime));
          }
        });
      });
    });
  }

  function printResults() {
    var str     = 'Test Results';
    var matched = [];
    for (var i in mongoResults) {
      str += '\n' + i + ' - Mongo: ' + mongoResults[i];
      if (typeof rethinkResults[i] !== 'undefined') {
        str += ' | Rethink: ' + rethinkResults[i];
        matched.push(i);
      }
    }

    for (var i in rethinkResults) {
      if (matched.indexOf(i) === -1) {
        str += '\n' + i + ' - Rethink: ' + rethinkResults[i];
      }
    }
    console.info(str);
    process.exit();
  }

  function prettyTime(time) {
    if (time > 1000) {
      return (time / 1000) + 's';
    }
    return (time) + 'ms';
  }
})();