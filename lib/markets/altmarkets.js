var request = require('request');

var base_url = 'https://altmarkets.io/api/v2/';

function get_summary(coin, exchange, cb) {
  var req_url = base_url + "tickers/" + coin + "" + exchange;
  request({uri: req_url, json: true}, function (error, response, body) {
    if (error) {
      return cb(error, null);
    } else {
      if (body.message) {
        return cb(body.message, null)
      } else {
        body['last'] = body.ticker['last'];
        return cb (null, body);
      }
    }
  });
}

function get_trades(coin, exchange, cb) {
  var req_url = base_url + "trades?market=" + coin + "" + exchange + "&limit=50&order_by=desc";
  request({uri: req_url, json: true}, function (error, response, body) {
    if (body.message) {
      return cb(body.message, null);
    } else {
      return cb (null, body);
    }
  });
}

function get_orders(coin, exchange, cb) {
  var req_url = base_url + "order_book?market="  + coin + "" + exchange + "&asks_limit=50&bids_limit=50";
  request({uri: req_url, json: true}, function (error, response, body) {
    if (body) {
      var orders = body;
      var buys = [];
      var sells = [];
      if (body['bids'].length > 0){
          for (var i = 0; i < body['bids'].length; i++) {
            var order = {
              amount: parseFloat(body['bids'][i].volume).toFixed(8),
              price: parseFloat(body['bids'][i].price).toFixed(8),
              //  total: parseFloat(orders.buy[i].Total).toFixed(8)
              // Necessary because API will return 0.00 for small volume transactions
              total: (parseFloat(body['bids'][i].volume).toFixed(8) * parseFloat(body['bids'][i].price)).toFixed(8)
            }
            buys.push(order);
          }
      }
      if (body['asks'].length > 0) {
        for (var x = 0; x < body['asks'].length; x++) {
            var order = {
                amount: parseFloat(body['asks'][x].volume).toFixed(8),
                price: parseFloat(body['asks'][x].price).toFixed(8),
                //    total: parseFloat(orders.sell[x].Total).toFixed(8)
                // Necessary because API will return 0.00 for small volume transactions
                total: (parseFloat(body['asks'][x].volume).toFixed(8) * parseFloat(body['asks'][x].price)).toFixed(8)
            }
            sells.push(order);
        }
      }
      return cb(null, buys, sells);
    } else {
      return cb(body.message, [], []);
    }
  });
}

module.exports = {
  get_data: function(coin, exchange, cb) {
    var error = null;
    get_orders(coin, exchange, function(err, buys, sells) {
      if (err) { error = err; }
      get_trades(coin, exchange, function(err, trades) {
        if (err) { error = err; }
        get_summary(coin, exchange, function(err, stats) {
          if (err) { error = err; }
          return cb(error, {buys: buys, sells: sells, chartdata: [], trades: trades, stats: stats});
        });
      });
    });
  }
};
