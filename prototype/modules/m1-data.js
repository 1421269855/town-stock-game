/**
 * M1: 数据层
 * 定义店铺数据、游戏状态常量
 * 不依赖任何其他模块
 *
 * 时间系统：
 *   day=天, week=周(7天), month=月(30天), year=年(365天)
 *   速度模式：1天/7天/30天/365天
 */
var M1 = (function() {

  var SHOPS = [
    { id:'laowang', name:'老王面馆', icon:'🍜', base:35, vol:0.02, risk:'保守', sector:'餐饮' },
    { id:'meng',    name:'萌科技',   icon:'💻', base:80, vol:0.06, risk:'激进', sector:'科技' },
    { id:'amei',    name:'阿美花店', icon:'🌸', base:50, vol:0.03, risk:'稳健', sector:'零售' },
    { id:'liqiao',  name:'李桥物流', icon:'🚛', base:45, vol:0.025, risk:'稳健', sector:'物流' },
    { id:'chenyao', name:'陈药师',   icon:'💊', base:60, vol:0.022, risk:'保守', sector:'医疗' },
    { id:'zhangji', name:'张家烘焙', icon:'🍞', base:40, vol:0.015, risk:'保守', sector:'餐饮' },
    { id:'zhouyu',  name:'周渔庄',   icon:'🐟', base:55, vol:0.04, risk:'激进', sector:'农业' },
    { id:'linxiao', name:'林小超市', icon:'🏪', base:30, vol:0.022, risk:'稳健', sector:'零售' }
  ];

  var CONFIG = {
    /* 资金与交易 */
    START_MONEY: 100000,
    FEE_RATE: 0.005,           // 手续费 0.5%（更真实）
    TRADE_UNIT: 100,
    LIMIT_UP: 1.10,            // 单日涨停 10%
    LIMIT_DOWN: 0.90,          // 单日跌停 10%

    /* 时间系统 */
    DAYS_PER_WEEK: 7,
    DAYS_PER_MONTH: 30,
    DAYS_PER_YEAR: 365,

    /* 速度模式：每次"推进"跳过的天数 */
    SPEED_MODES: {
      day:    { label:'🐢 慢速', days: 1,   key:'day'    },
      week:   { label:'🚶 正常', days: 7,   key:'week'   },
      month:  { label:'🏃 快速', days: 30,  key:'month'  },
      year:   { label:'⏩ 跃进', days: 365, key:'year'   }
    },

    /* T+1 结算：买入后1天才能卖出 */
    T_PLUS_1_DAYS: 1,

    /* 经营系数回归速率 (每天回归) */
    COEFF_REVERT: 0.005,

    /* 事件触发频率：按月计算 */
    EVENT_PROB_PER_DAY: 0.02  // 每天2%概率触发 ≈ 每月50%
  };

  function createShops() {
    var arr = [];
    for (var i = 0; i < SHOPS.length; i++) {
      var s = SHOPS[i];
      arr.push({
        id: s.id, name: s.name, icon: s.icon,
        base: s.base, vol: s.vol, risk: s.risk, sector: s.sector,
        price: s.base, coeff: 1.0, rel: 50,
        shares: 0, costAvg: 0,
        /* 锁定股份：T+1期间不能卖 */
        lockedShares: 0, lockedUntilDay: 0
      });
    }
    return arr;
  }

  function createGame() {
    return {
      money: CONFIG.START_MONEY,
      day: 1,                  /* 当前是第几天 */
      year: 1,                 /* 当前是第几年 */
      speed: 'week',           /* 默认速度模式：每周推进 */
      log: [],
      history: [CONFIG.START_MONEY],
      /* 交易记录：用于T+1判断 [{shopId, shares, day}] */
      pendingT1: []
    };
  }

  /**
   * 把"第N天"换算为"第X年第Y月第Z天"
   */
  function dayToDate(day) {
    var year = Math.floor((day - 1) / CONFIG.DAYS_PER_YEAR) + 1;
    var dayInYear = (day - 1) % CONFIG.DAYS_PER_YEAR;
    var rawMonth = Math.floor(dayInYear / CONFIG.DAYS_PER_MONTH);
    if (rawMonth >= 12) {
      return { year: year, month: 12, day: dayInYear - 360 + 1 };
    }
    return { year: year, month: rawMonth + 1, day: (dayInYear % CONFIG.DAYS_PER_MONTH) + 1 };
  }
  function formatDate(day) {
    var d = dayToDate(day);
    return 'Y' + d.year + ' M' + d.month + ' D' + d.day;
  }

  /**
   * 获取当前是星期几 (1-7)
   */
  function getWeekDay(day) {
    return ((day - 1) % CONFIG.DAYS_PER_WEEK) + 1;
  }

  return {
    SHOP_TEMPLATES: SHOPS,
    CONFIG: CONFIG,
    createShops: createShops,
    createGame: createGame,
    dayToDate: dayToDate,
    formatDate: formatDate,
    getWeekDay: getWeekDay
  };

})();
