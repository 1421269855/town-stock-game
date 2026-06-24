/**
 * M2: 股价引擎
 * 负责股价计算、波动、涨跌停、系数回归
 * 依赖: M1 (数据层)
 *
 * 时间系统：按天推进
 *   单日股价变化 = 基础波动 × vol × 速度倍率 + 经营系数影响
 *   经营系数每天微回归
 */
var M2 = (function() {

  /**
   * 推进 N 天（N=速度模式的 days）
   * @param {Array} shops - 店铺数组
   * @param {Object} game - 游戏状态
   * @param {Object} marketMood - 市场情绪 { up:0.5, down:0.5 }
   * @returns {Object} { changes, triggeredEvents, weeklySettlement, monthlySettlement }
   */
  function tickDays(shops, game, marketMood) {
    marketMood = marketMood || { up: 0.5, down: 0.5 };
    var cfg = M1.CONFIG;
    var speedKey = game.speed;
    var days = cfg.SPEED_MODES[speedKey].days;
    var allChanges = [];
    var triggeredEvents = [];

    /* 逐天推进（事件/结算需要按天判断） */
    for (var d = 0; d < days; d++) {
      var curDay = game.day + d;

      /* 当日股价波动（仅第一天波动大，后续可平滑） */
      for (var i = 0; i < shops.length; i++) {
        var s = shops[i];

        /* 1. 基础波动（带轻微正向偏移，长期向上） */
        var baseChange = (Math.random() - 0.48) * 2;

        /* 2. 市场情绪 */
        var mood = Math.random() < marketMood.up ? 1 : -1;
        var moodBoost = mood * Math.random() * 0.3;

        /* 3. 经营系数影响 */
        var coeffEffect = (s.coeff - 1.0) * 0.5;

        /* 4. 综合单日变化率 */
        var change = (baseChange + moodBoost) * s.vol + coeffEffect * s.vol;

        /* 5. 单日涨跌停 ±10% */
        if (change > cfg.LIMIT_UP - 1) change = cfg.LIMIT_UP - 1;
        if (change < cfg.LIMIT_DOWN - 1) change = cfg.LIMIT_DOWN - 1;

        s.price = Math.max(1, Math.round(s.price * (1 + change) * 100) / 100);
      }

      /* T+1 结算检查（每天检查） */
      settleT1(game, curDay);

      /* 周末结算：经营系数回归（每周日） */
      if (M1.getWeekDay(curDay) === 7) {
        for (var k = 0; k < shops.length; k++) {
          shops[k].coeff = shops[k].coeff * (1 - cfg.COEFF_REVERT) + 1.0 * cfg.COEFF_REVERT;
          shops[k].coeff = Math.round(shops[k].coeff * 1000) / 1000;
        }
      }

      /* 月末事件触发（每月最后一天） */
      var dateInfo = M1.dayToDate(curDay);
      var isLastDayOfMonth = (dateInfo.day === cfg.DAYS_PER_MONTH);
      if (isLastDayOfMonth && Math.random() < 0.5) {
        /* 50%概率在月末触发事件 */
        triggeredEvents.push({ day: curDay, type: 'monthly' });
      }
    }

    /* 推进总天数 */
    game.day += days;
    /* 更新年份 */
    var newDate = M1.dayToDate(game.day);
    game.year = newDate.year;

    return {
      days: days,
      endDay: game.day,
      triggeredEvents: triggeredEvents
    };
  }

  /**
   * T+1 结算：清除已过锁定期的股份
   */
  function settleT1(game, curDay) {
    var stillPending = [];
    for (var i = 0; i < game.pendingT1.length; i++) {
      var p = game.pendingT1[i];
      if (p.unlockDay <= curDay) {
        /* 锁定期满，清除锁定股数 */
        // 此处需要shop引用，但T1记录中只存了shopId
        // 实际清除逻辑在 M4 交易系统中处理
      } else {
        stillPending.push(p);
      }
    }
    game.pendingT1 = stillPending;
  }

  /**
   * 单只店铺强制涨跌（用于剧情/事件）
   */
  function tickShop(shop, changePct) {
    var cfg = M1.CONFIG;
    if (changePct > cfg.LIMIT_UP - 1) changePct = cfg.LIMIT_UP - 1;
    if (changePct < cfg.LIMIT_DOWN - 1) changePct = cfg.LIMIT_DOWN - 1;
    var oldPrice = shop.price;
    shop.price = Math.max(1, Math.round(shop.price * (1 + changePct) * 100) / 100);
    return { old: oldPrice, new: shop.price, change: changePct };
  }

  /**
   * 计算总资产
   */
  function calcTotalAssets(game, shops) {
    var portValue = 0;
    for (var i = 0; i < shops.length; i++) {
      portValue += shops[i].price * shops[i].shares;
    }
    return game.money + portValue;
  }

  /**
   * 推进后记录历史
   */
  function recordHistory(game, shops) {
    var ta = calcTotalAssets(game, shops);
    game.history.push(ta);
    if (game.history.length > 200) game.history.shift();
    return ta;
  }

  return {
    tickDays: tickDays,
    tickShop: tickShop,
    calcTotalAssets: calcTotalAssets,
    recordHistory: recordHistory,
    settleT1: settleT1
  };

})();
