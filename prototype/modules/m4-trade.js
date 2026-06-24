/**
 * M4: 交易系统
 * 负责：买入、卖出、T+1锁定、手续费、资金管理
 * 依赖: M1 (数据层), M2 (股价引擎)
 */
var M4 = (function() {

  /**
   * 计算买入费用
   * @param {number} price - 当前股价
   * @param {number} amount - 股数（需是TRADE_UNIT的倍数）
   * @returns {Object} { cost, fee, total }
   */
  function calcBuyCost(price, amount) {
    var fee = Math.round(price * amount * M1.CONFIG.FEE_RATE * 100) / 100;
    return {
      price: price,
      amount: amount,
      cost: price * amount,
      fee: fee,
      total: price * amount + fee
    };
  }

  /**
   * 执行买入操作
   * @param {Object} game - 游戏状态
   * @param {Array} shops - 店铺数组
   * @param {string} shopId - 店铺ID
   * @param {number} amount - 股数
   * @returns {Object} { success, error, result }
   */
  function buy(game, shops, shopId, amount) {
    /* 验证 */
    if (!shopId || !amount || amount <= 0) {
      return { success: false, error: '参数无效' };
    }
    if (amount % M1.CONFIG.TRADE_UNIT !== 0) {
      return { success: false, error: '必须按' + M1.CONFIG.TRADE_UNIT + '股的整数倍买入' };
    }

    var shop = null;
    for (var i = 0; i < shops.length; i++) {
      if (shops[i].id === shopId) { shop = shops[i]; break; }
    }
    if (!shop) return { success: false, error: '店铺不存在' };

    var calc = calcBuyCost(shop.price, amount);
    if (calc.total > game.money) {
      return { success: false, error: '余额不足，需要 $' + calc.total.toFixed(2) + '，当前 $' + game.money.toFixed(2) };
    }

    /* 执行：扣钱、加持仓、加T+1锁定 */
    game.money -= calc.total;
    game.money = Math.round(game.money * 100) / 100;
    shop.shares += amount;
    shop.lockedShares += amount;
    game.pendingT1.push({
      shopId: shopId,
      shares: amount,
      unlockDay: game.day + M1.CONFIG.T_PLUS_1_DAYS,
      buyPrice: shop.price
    });

    return { success: true, error: null, result: calc };
  }

  /**
   * 计算卖出收入
   * @param {number} price - 当前股价
   * @param {number} amount - 股数
   * @returns {Object} { revenue, fee, net }
   */
  function calcSellRevenue(price, amount) {
    var revenue = price * amount;
    var fee = Math.round(revenue * M1.CONFIG.FEE_RATE * 100) / 100;
    return {
      price: price,
      amount: amount,
      revenue: revenue,
      fee: fee,
      net: revenue - fee
    };
  }

  /**
   * 执行卖出操作
   * @param {Object} game - 游戏状态
   * @param {Array} shops - 店铺数组
   * @param {string} shopId - 店铺ID
   * @param {number} amount - 股数
   * @returns {Object} { success, error, result }
   */
  function sell(game, shops, shopId, amount) {
    if (!shopId || !amount || amount <= 0) {
      return { success: false, error: '参数无效' };
    }
    if (amount % M1.CONFIG.TRADE_UNIT !== 0) {
      return { success: false, error: '必须按' + M1.CONFIG.TRADE_UNIT + '股的整数倍卖出' };
    }

    var shop = null;
    for (var i = 0; i < shops.length; i++) {
      if (shops[i].id === shopId) { shop = shops[i]; break; }
    }
    if (!shop) return { success: false, error: '店铺不存在' };

    var sellable = shop.shares - shop.lockedShares;
    if (sellable <= 0) {
      return { success: false, error: '所有股份在T+1锁定期中' };
    }
    if (amount > sellable) {
      return { success: false, error: '可卖数量不足，最多可卖 ' + sellable + ' 股' };
    }

    var calc = calcSellRevenue(shop.price, amount);

    /* 执行：减持仓、加钱 */
    shop.shares -= amount;
    game.money += calc.net;
    game.money = Math.round(game.money * 100) / 100;

    return { success: true, error: null, result: calc };
  }

  /**
   * 获取店铺的可交易状态
   * @param {Object} shop - 店铺对象
   * @param {Object} game - 游戏状态
   * @returns {Object} { canBuy, canSell, sellable, locked, maxSell }
   */
  function getTradeStatus(shop, game) {
    var sellable = shop.shares - shop.lockedShares;
    if (sellable < 0) sellable = 0;
    return {
      canBuy: true,
      canSell: sellable > 0,
      sellable: sellable,
      locked: shop.lockedShares,
      totalShares: shop.shares,
      maxSell: sellable - (sellable % M1.CONFIG.TRADE_UNIT)
    };
  }

  /**
   * 检查T+1并解锁到期的股份
   * 此函数由 M2.tickDays 内部调用
   * 这里提供独立调用接口
   */
  function unlockExpired(game, shops) {
    var curDay = game.day;
    var unlocked = [];
    for (var i = game.pendingT1.length - 1; i >= 0; i--) {
      if (game.pendingT1[i].unlockDay <= curDay) {
        var p = game.pendingT1.splice(i, 1)[0];
        for (var j = 0; j < shops.length; j++) {
          if (shops[j].id === p.shopId && shops[j].lockedShares >= p.shares) {
            shops[j].lockedShares -= p.shares;
            unlocked.push(p);
            break;
          } else if (shops[j].id === p.shopId) {
            shops[j].lockedShares = 0;
            unlocked.push(p);
            break;
          }
        }
      }
    }
    return unlocked;
  }

  return {
    calcBuyCost: calcBuyCost,
    buy: buy,
    calcSellRevenue: calcSellRevenue,
    sell: sell,
    getTradeStatus: getTradeStatus,
    unlockExpired: unlockExpired
  };

})();
