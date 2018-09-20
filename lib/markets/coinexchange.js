var request = require('request');

var base_url = 'https://www.coinexchange.io/api/v1';

var coin = "XCG";

function coinexchange_marketid(coin) {
  var req_url = base_url + '/getmarkets';

  request({ uri: req_url, json: true }, function (error, response, body) {
    if (error) {
      return cb(error, null);
    } else {
      var market_id =  body.result.find(market => market.MarketAssetCode === coin);
      return market_id['MarketID'];
    }
  });
}

console.log(coinexchange_marketid(coin));
