var request = require('request');
var base_url = 'https://api.coinmarketcap.com/v2';

function get_ticker(coin, cb) {
  coin_id = 3308;

  var req_url = base_url + '/ticker/' + coin_id + '?convert=BTC';
  request({ uri: req_url, json: true }, function (error, response, body) {
    if (body.length < 1) {
      return cb('Pair not found ' + coin + '-' + exchange, null)
    } else {
      return cb (null, body);
    }
  })
}

module.exports = {
  get_data: function(coin, cb) {
    get_ticker(coin, function(err, body) {
      return cb(err, body);
    });
  }
};
