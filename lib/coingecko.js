var request = require('request');

var base_url = 'https://api.coingecko.com/api/v3/coins/';


function get_ticker(coin, cb) {
    var req_url = base_url + coin;
    request({ uri: req_url, json: true }, function (error, response, body) {
        if (body.error) {
            return cb('coingecko ' + coin + ' - ' + body.error, null)
        } else {
            var tickers = {
                rank: 0,
                price_usd: body.market_data.current_price.usd.toString(),
                price_btc: body.market_data.current_price.btc.toString(),
                '24h_volume_usd': body.market_data.total_volume.usd.toString(),
                market_cap_usd: body.market_data.market_cap.usd,
                available_supply: 0,
                total_supply: body.market_data.total_supply,
                percent_change_1h: body.market_data.price_change_percentage_1h,
                percent_change_24h: body.market_data.price_change_percentage_24h,
                percent_change_7d: body.market_data.price_change_percentage_7h,
                last_updated: (new Date(body.tickers[0].timestamp).getTime()/1000)
            }
            // var obj = {
            //     "base": "TWINS",
            //     "target": "BTC",
            //     "market": {
            //         "name": "Bitsane",
            //         "identifier": "bitsane",
            //         "has_trading_incentive": false
            //     },
            //     "last": 3.3e-7,
            //     "converted_last": {
            //         "btc": "0.00000033",
            //         "eth": "0.000010187047691578824",
            //         "usd": "0.0011714238916711848"
            //     },
            //     "volume": 22158728.145066,
            //     "converted_volume": {
            //         "btc": "7.31238028787178",
            //         "eth": "225.732020398517312002445682384",
            //         "usd": "25957.2635581770276901064941968"
            //     },
            //     "timestamp": "2019-01-25T19:43:48+00:00",
            //     "is_anomaly": false,
            //     "is_stale": false,
            //     "coin_id": "win-win"
            // }
            return cb (null, tickers);
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
