var express = require('express')
  , router = express.Router()
  , settings = require('../lib/settings')
  , locale = require('../lib/locale')
  , db = require('../lib/database')
  , lib = require('../lib/explorer')
  , qr = require('qr-image')
  , formatCurrency = require('format-currency')
  , formatNum = require('format-num')
  , BigNumber = require('bignumber.js')
  , BigInteger = require('big-integer')
;

function route_get_block(res, blockhash) {
  lib.get_block(blockhash, function (block) {
    if (block != 'There was an error. Check your console.') {
      if (blockhash == settings.genesis_block) {
        res.render('block', { active: 'block', block: block, confirmations: settings.confirmations, txs: 'GENESIS'});
      } else {
        db.get_txs(block, function(txs) {
          if (txs.length > 0) {
            res.render('block', { active: 'block', block: block, confirmations: settings.confirmations, txs: txs});
          } else {
            db.create_txs(block, function(){
              db.get_txs(block, function(ntxs) {
                if (ntxs.length > 0) {
                  res.render('block', { active: 'block', block: block, confirmations: settings.confirmations, txs: ntxs});
                } else {
                  route_get_index(res, 'Block not found: ' + blockhash);
                }
              });
            });
          }
        });
      }
    } else {
      route_get_index(res, 'Block not found: ' + blockhash);
    }
  });
}
/* GET functions */

function route_get_tx_details(res, txid) {
  if (txid == settings.genesis_tx) {
    route_get_block(res, settings.genesis_block);
  } else {
    db.get_tx(txid, function(tx) {
      if (tx) {
        lib.get_blockcount(function(blockcount) {
          res.json({ active: 'tx', tx: tx, confirmations: settings.confirmations, blockcount: blockcount});
        });
      }
      else {
        lib.get_rawtransaction(txid, function(rtx) {
          if (rtx.txid) {
            lib.prepare_vin(rtx, function(vin) {
              lib.prepare_vout(rtx.vout, rtx.txid, vin, function(rvout, rvin) {
                lib.calculate_total(rvout, function(total){
                  if (!rtx.confirmations > 0) {
                    var utx = {
                      txid: rtx.txid,
                      vin: rvin,
                      vout: rvout,
                      total: total.toFixed(8),
                      timestamp: rtx.time,
                      blockhash: '-',
                      blockindex: -1,
                    };
                    res.json({ active: 'tx', tx: utx, confirmations: settings.confirmations, blockcount:-1});
                  } else {
                    var utx = {
                      txid: rtx.txid,
                      vin: rvin,
                      vout: rvout,
                      total: total.toFixed(8),
                      timestamp: rtx.time,
                      blockhash: rtx.blockhash,
                      blockindex: rtx.blockheight,
                    };
                    lib.get_blockcount(function(blockcount) {
                      res.json({ active: 'tx', tx: utx, confirmations: settings.confirmations, blockcount: blockcount});
                    });
                  }
                });
              });
            });
          } else {
            route_get_index2(res, null);
          }
        });
      }
    });
  }
}


function route_get_index2(res, error) {
  res.json({ active: 'home', error: error, warning: null});
}

/* GET functions */

function route_get_tx(res, txid) {
  if (txid == settings.genesis_tx) {
    route_get_block(res, settings.genesis_block);
  } else {
    db.get_tx(txid, function(tx) {
      if (tx) {
        lib.get_blockcount(function(blockcount) {
          res.render('tx', { active: 'tx', tx: tx, confirmations: settings.confirmations, blockcount: blockcount});
        });
      }
      else {
        lib.get_rawtransaction(txid, function(rtx) {
          if (rtx.txid) {
            lib.prepare_vin(rtx, function(vin) {
              lib.prepare_vout(rtx.vout, rtx.txid, vin, function(rvout, rvin) {
                lib.calculate_total(rvout, function(total){
                  if (!rtx.confirmations > 0) {
                    var utx = {
                      txid: rtx.txid,
                      vin: rvin,
                      vout: rvout,
                      total: total.toFixed(8),
                      timestamp: rtx.time,
                      blockhash: '-',
                      blockindex: -1,
                    };
                    res.render('tx', { active: 'tx', tx: utx, confirmations: settings.confirmations, blockcount:-1});
                  } else {
                    var utx = {
                      txid: rtx.txid,
                      vin: rvin,
                      vout: rvout,
                      total: total.toFixed(8),
                      timestamp: rtx.time,
                      blockhash: rtx.blockhash,
                      blockindex: rtx.blockheight,
                    };
                    lib.get_blockcount(function(blockcount) {
                      res.render('tx', { active: 'tx', tx: utx, confirmations: settings.confirmations, blockcount: blockcount});
                    });
                  }
                });
              });
            });
          } else {
            route_get_index(res, null);
          }
        });
      }
    });
  }
}

function route_get_index(res, error) {
  res.render('index', { active: 'home', error: error, warning: null});
}

function route_get_address(res, hash, count) {
  db.get_address(hash, function(address) {
    if (address) {
      var txs = [];
      var hashes = address.txs.reverse();
      if (address.txs.length < count) {
        count = address.txs.length;
      }
      lib.syncLoop(count, function (loop) {
        var i = loop.iteration();
        db.get_tx(hashes[i].addresses, function(tx) {
          if (tx) {
            txs.push(tx);
            loop.next();
          } else {
            loop.next();
          }
        });
      }, function(){

        // hack to support numbers longer than 15 digits.
        var balance = new BigInteger(address.balance);
        var viewBalance = balance.divide(100000000);
        var balanceRemain = new BigNumber(balance.toString().substr(
          viewBalance.toString().length));

        res.render('address', {
          active: 'address',
          address: address,
          balance: viewBalance.toString()+'.'+balanceRemain.toString(),
          txs: txs
        });
      });

    } else {
      route_get_index(res, hash + ' not found');
    }
  });
}

/* GET home page. */
router.get('/', function(req, res) {
  route_get_index(res, null);
});

router.get('/info', function(req, res) {
  res.render('info', { active: 'info', address: settings.address, hashes: settings.api });
});

router.get('/markets/:market', function(req, res) {
  var market = req.params['market'];
  if (settings.markets.enabled.indexOf(market) != -1) {
    db.get_market(market, function(data) {
      /*if (market === 'bittrex') {
        data = JSON.parse(data);
      }*/
      console.log(data);
      res.render('./markets/' + market, {
        active: 'markets',
        marketdata: {
          coin: settings.markets.coin,
          exchange: settings.markets.exchange,
          data: data,
        },
        market: market
      });
    });
  } else {
    route_get_index(res, null);
  }
});

router.get('/richlist', function(req, res) {
  if (settings.display.richlist == true ) {
    db.get_stats(settings.coin, function (stats) {
      db.get_richlist(settings.coin, function(richlist){
        //console.log(richlist);
        if (richlist) {
          db.get_distribution(richlist, stats, function(distribution) {
            //console.log(distribution);
            res.render('richlist', {
              active: 'richlist',
              balance: richlist.balance,
              received: richlist.received,
              stats: stats,
              coin_supply: new BigNumber(stats.supply).toFixed(8),
              dista: distribution.t_1_25,
              distb: distribution.t_26_50,
              distc: distribution.t_51_75,
              distd: distribution.t_76_100,
              diste: distribution.t_101plus,
              show_dist: settings.richlist.distribution,
              show_coin_supply: settings.richlist.coin_supply,
              show_received: settings.richlist.received,
              show_balance: settings.richlist.balance,
            });
          });
        } else {
          route_get_index(res, null);
        }
      });
    });
  } else {
    route_get_index(res, null);
  }
});

router.get('/masternodes', function(req, res) {
  res.render('masternodes', {active: 'masternodes'});
});

router.get('/coininfo', function(req, res) {
  if (settings.display.coininfo === false) {
    route_get_index(res, null);
    return;
  }

  db.get_stats(settings.coin, function(stats){
    db.get_cmc(settings.coinmarketcap.ticker, function(cmc) {
      lib.get_masternodecount(function(totalMnCount) {
        lib.get_masternodeonlinecount(function(activeMnCount) {
          db.get_latest_masternodestats(settings.symbol, function(mnStats) {
            var blocksPerDay = (60*60*24)/settings.coininfo.block_time_sec;
            var totalMnRewardsDay = settings.coininfo.block_reward_mn * blocksPerDay;
            var mnRewardsPerDay = totalMnRewardsDay / activeMnCount;

            var priceBtc = (cmc.price_btc) ? cmc.price_btc : stats.last_price;
            var priceUsd = cmc.price_usd;

            var calculatedBasedOnRealData = false;
            if (mnStats) {
              calculatedBasedOnRealData = true;
              mnRewardsPerDay = mnStats.reward_coins_24h;
            }

            var mnRewardsPerYear = mnRewardsPerDay * 365;
            var mnRoi = ((mnRewardsPerYear / settings.coininfo.masternode_required) * 100).toFixed(2);
            var coinsLocked = totalMnCount * settings.coininfo.masternode_required;
            var coinsLockedPerc = coinsLocked / (stats.supply/100);
            var nodeWorthBtc = (settings.coininfo.masternode_required * priceBtc).toFixed(8);
            var nodeWorthUsd = (cmc.price_usd) ? (settings.coininfo.masternode_required * cmc.price_usd).toFixed(2) : null;

            var dailyCoin = formatNum(mnRewardsPerDay, { maxFraction: 4});
            var dailyBtc = formatNum(mnRewardsPerDay * priceBtc, { maxFraction: 8 });
            var dailyUsd = formatCurrency(mnRewardsPerDay * cmc.price_usd, { maxFraction: 2 });
            var weeklyCoin = formatNum(mnRewardsPerDay * 7, { maxFraction: 4});
            var weeklyBtc = formatNum(mnRewardsPerDay * priceBtc* 7, { maxFraction: 8 });
            var weeklyUsd = formatCurrency(mnRewardsPerDay * cmc.price_usd * 7, { maxFraction: 2 });
            var monthlyCoin = formatNum(mnRewardsPerDay * (365/12), { maxFraction: 4});
            var monthlyBtc = formatNum(mnRewardsPerDay * priceBtc * (365/12), { maxFraction: 8 });
            var monthlyUsd = formatCurrency(mnRewardsPerDay * cmc.price_usd * (365/12), { maxFraction: 2 });
            var yearlyCoin = formatNum(mnRewardsPerDay * 365, { maxFraction: 4});
            var yearlyBtc = formatNum(mnRewardsPerDay * priceBtc * 365, { maxFraction: 8 });
            var yearlyUsd = formatCurrency(mnRewardsPerDay * cmc.price_usd * 365, { maxFraction: 2 });

            var data = {
              active: 'coininfo',
              coininfo: settings.coininfo,
              lastPriceBtc: formatCurrency(stats.last_price, { maxFraction: 8 }),
              lastPriceUsd: cmc.price_usd ? formatCurrency(cmc.price_usd, { maxFraction: 6 }) : null,
              pricePercChange24h: cmc.percent_change_24h,
              marketCapUsd: formatCurrency(cmc.market_cap_usd, { maxFraction: 2 }),
              cmc: cmc,
              blockCount24h: -1,
              avgBlockTime: -1,
              totalMasternodes: totalMnCount,
              activeMasternodes: activeMnCount,
              mnRoi: mnRoi,
              supply: formatNum(stats.supply, { maxFraction: 4 }),
              coinsLocked: formatNum(coinsLocked, { maxFraction: 8 }),
              coinsLockedPerc: formatNum(coinsLockedPerc, { maxFraction: 2 }),
              mnRequiredCoins: settings.coininfo.masternode_required,
              nodeWorthBtc: formatCurrency(nodeWorthBtc, { maxFraction: 8 }),
              nodeWorthUsd: nodeWorthUsd ? formatCurrency(nodeWorthUsd, { maxFraction: 2 }) : null,
              dailyCoin: dailyCoin,
              dailyBtc: dailyBtc,
              dailyUsd: dailyUsd,
              weeklyCoin: weeklyCoin,
              weeklyBtc: weeklyBtc,
              weeklyUsd: weeklyUsd,
              monthlyCoin: monthlyCoin,
              monthlyBtc: monthlyBtc,
              monthlyUsd: monthlyUsd,
              yearlyCoin: yearlyCoin,
              yearlyBtc: yearlyBtc,
              yearlyUsd: yearlyUsd,
              calculatedBasedOnRealData: calculatedBasedOnRealData
            };

            if (mnStats) {
              data.blockCount24h = mnStats.block_count_24h;
              data.avgBlockTime = mnStats.block_avg_time;
            }

            res.render('coininfo', data);
          });
        });
      });
    });
  });

});

router.get('/movement', function(req, res) {
  res.render('movement', {active: 'movement', flaga: settings.movement.low_flag, flagb: settings.movement.high_flag, min_amount:settings.movement.min_amount});
});

router.get('/network', function(req, res) {
  res.render('network', {active: 'network'});
});

router.get('/reward', function(req, res){
  //db.get_stats(settings.coin, function (stats) {
    console.log(stats);
    db.get_heavy(settings.coin, function (heavy) {
      //heavy = heavy;
      var votes = heavy.votes;
      votes.sort(function (a,b) {
        if (a.count < b.count) {
          return -1;
        } else if (a.count > b.count) {
          return 1;
        } else {
         return 0;
        }
      });

      res.render('reward', { active: 'reward', stats: stats, heavy: heavy, votes: heavy.votes });
    });
  //});
});

router.get('/txDetail/:txid', function(req, res) {
  route_get_tx_details(res, req.param('txid'));
});

router.get('/tx/:txid', function(req, res) {
  route_get_tx(res, req.param('txid'));
});

router.get('/block/:hash', function(req, res) {
  route_get_block(res, req.param('hash'));
});

router.get('/address/:hash', function(req, res) {
  route_get_address(res, req.param('hash'), settings.txcount);
});

router.get('/address/:hash/:count', function(req, res) {
  route_get_address(res, req.param('hash'), req.param('count'));
});

router.post('/search', function(req, res) {
  var query = req.body.search;
  if (query.length === 64) {
    if (query === settings.genesis_tx) {
      res.redirect('/block/' + settings.genesis_block);
    } else {
      db.get_tx(query, function(tx) {
        if (tx) {
          res.redirect('/tx/' +tx.txid);
        } else {
          lib.get_block(query, function(block) {
            if (block && block !== 'There was an error. Check your console.') {
              res.redirect('/block/' + query);
            } else {
              route_get_index(res, locale.ex_search_error + query );
            }
          });
        }
      });
    }
  } else {
    db.get_address(query, function(address) {
      if (address) {
        res.redirect('/address/' + address.a_id);
      } else {
        lib.get_blockhash(query, function(hash) {
          if (hash && hash !== 'There was an error. Check your console.') {
            res.redirect('/block/' + hash);
          } else {
            route_get_index(res, locale.ex_search_error + query );
          }
        });
      }
    });
  }
});

router.get('/qr/:string', function(req, res) {
  if (req.param('string')) {
    var address = qr.image(req.param('string'), {
      type: 'png',
      size: 4,
      margin: 1,
      ec_level: 'M'
    });
    res.type('png');
    address.pipe(res);
  }
});

router.get('/ext/summary', function(req, res) {
  lib.get_difficulty(function(difficulty) {
    difficultyHybrid = ''
    if (difficulty['proof-of-work']) {
            if (settings.index.difficulty == 'Hybrid') {
              difficultyHybrid = 'POS: ' + difficulty['proof-of-stake'];
              difficulty = 'POW: ' + difficulty['proof-of-work'];
            } else if (settings.index.difficulty == 'POW') {
              difficulty = difficulty['proof-of-work'];
            } else {
        difficulty = difficulty['proof-of-stake'];
      }
    }
    lib.get_hashrate(function(hashrate) {
      lib.get_connectioncount(function(connections){
        lib.get_blockcount(function(blockcount) {
          lib.get_masternodecount(function(masternodecount){
            lib.get_masternodeonlinecount(function(masternodeonlinecount){
              db.get_cmc(settings.coinmarketcap.ticker, function(cmc){
                db.get_stats(settings.coin, function (stats) {
                  if (hashrate == 'There was an error. Check your console.') {
                    hashrate = 0;
                  }
                  res.send({ data: [{
                    difficulty: difficulty,
                    difficultyHybrid: difficultyHybrid,
                    masternodeCount: masternodecount,
                    masternodeOnlineCount: masternodeonlinecount,
                    supply: formatNum(stats.supply, { maxFraction: 0 }),
                    hashrate: hashrate,
                    lastPriceBtc: formatNum(stats.last_price, { maxFraction: 8 }),
                    lastPriceUsd: formatCurrency(cmc.price_usd, { maxFraction: 6 }),
                    marketCapUsd: formatCurrency(cmc.market_cap_usd, { maxFraction: 2 }),
                    marketVolumeUsd: formatCurrency(cmc.volume_24h_usd, { maxFraction: 2 }),
                    connections: connections,
                    blockcount: blockcount,
                    cmc: cmc,
                  }]});
                });
              });
            });
          });
        });
      });
    });
  });
});

router.get('/ext/masternodes', function(req, res) {
  lib.get_masternodelist(function(list) {
    var mnList = [];

    for (var key in list) {
      if (settings.baseType === 'pivx')
      {
        var mn = list[key];
        var mnItem = {
          address: mn.addr,
          status: mn.status,
          lastseen: mn.lastseen,
          lastpaid: mn.lastpaid,
//          ip: ""
        };
        mnList.push(mnItem);

        continue;
      }

      if (list.hasOwnProperty(key)) {
        var mnData = list[key].split(/(\s+)/).filter( function(e) { return e.trim().length > 0; } );
        var mnItem = {
          address: "",
          status: "",
          lastseen: "",
          lastpaid: null,
          ip: ""
        };

        // Address
        if (settings.masternodes.list_format.address === 0)
          mnItem.address = key;
        else if (settings.masternodes.list_format.address > -1)
          mnItem.address = mnData[settings.masternodes.list_format.address - 1];

        // Status
        if (settings.masternodes.list_format.status > -1)
          mnItem.status = mnData[settings.masternodes.list_format.status - 1];

        // last seen
        if (settings.masternodes.list_format.lastseen > -1)
          mnItem.lastseen = mnData[settings.masternodes.list_format.lastseen - 1];

        // last paid
        if (settings.masternodes.list_format.lastpaid > -1)
          mnItem.lastpaid = mnData[settings.masternodes.list_format.lastpaid - 1];

        // IP
        if (settings.masternodes.list_format.ip === 0)
          mnItem.ip = key.trim().replace(':'+settings.masternodes.default_port, '');
        else if (settings.masternodes.list_format.ip > -1)
          mnItem.ip = mnData[settings.masternodes.list_format.ip - 1].trim().replace(':'+settings.masternodes.default_port, '');

        mnList.push(mnItem);
      }
    }

    res.send({ data: mnList });
  });
});

router.get('/ext/coindetails', function(req, res) {
  lib.get_blockcount(function(blockcount) {
    lib.get_masternodecount(function(masternodecount){
      lib.get_masternodeonlinecount(function(masternodeonlinecount){
        db.get_cmc(settings.coinmarketcap.ticker, function(cmc){
          db.get_stats(settings.coin, function (stats) {
            db.get_latest_masternodestats(settings.symbol, function(mnStats) {
              var blocks_24h = (24*3600)/settings.coininfo.block_time_sec;

              var data = {
                coin_name: settings.coin,
                symbol: settings.symbol,
                logo: settings.logo,
                mobile_app_v: 1,
                supply: stats.supply,
                last_price_btc: stats.last_price,
                last_price_usd: cmc.price_usd,
                market_cap_usd: cmc.market_cap_usd,
                market_volume_24h_usd: cmc.volume_24h_usd,
                price_perc_change_1h: cmc.percent_change_1h,
                price_perc_change_24h: cmc.percent_change_24h,
                price_perc_change_7d: cmc.percent_change_7d,
                price_last_updated: cmc.last_updated,
                block_count_24h: (24*3600) / settings.coininfo.block_time_sec,
                block_time: settings.coininfo.block_time_sec,
                masternode_count_total: masternodecount,
                masternode_count_enabled: masternodeonlinecount,
                masternode_required_coins: settings.coininfo.masternode_required,
                masternode_coin_rewards_24h: (blocks_24h * settings.coininfo.block_reward_mn)/masternodeonlinecount,
                block_mn_reward: settings.coininfo.block_reward_mn,
                info_links: settings.coininfo.basic_info_links,
                calculations_bases_on_real_data: false
              };

              if (mnStats) {
                data.calculations_bases_on_real_data = true;
                data.masternode_coin_rewards_24h = mnStats.reward_coins_24h;
                data.block_count_24h = mnStats.block_count_24h;
                data.block_time = mnStats.block_avg_time;
              }

              res.send(data);
            });
          });
        });
      });
    });
  });
});

module.exports = router;
