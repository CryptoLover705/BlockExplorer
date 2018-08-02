var request = require('request');

var base_url = 'https://api.crypto-bridge.org/api/v1/ticker'

function get_summary(coin, exchange, cb) {
  var req_url = base_url;
  request({uri: req_url, json: true}, function (error, response, body) {
    if (error) {
      return cb(error, null);
    } else {
      if (body.message) {
        return cb(body.message, null);
      } else {
        var data = body.filter(function (obj) {
          return obj.id == 'GRV_BTC';
        });
        return cb(null, data[0]);
      }
    }
  });
}

module.exports = {
  get_data: function(coin, exchange, cb) {
    var error = null;
    get_summary(coin, exchange, function(err, stats) {
      if (err) { error = err; }
      return cb(error, {buys: [], sells: [], chartdata: [], trades: [], stats: stats});
    });
  }
};
