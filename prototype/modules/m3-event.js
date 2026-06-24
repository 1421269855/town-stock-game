/**
 * M3: 事件系统
 * 随机事件触发、效果应用
 * 依赖: M1 (数据层)
 */
var M3 = (function() {

  /* ===== 事件库 ===== */
  /* 每个事件: { id, name, type, desc, condition?, effect } */
  var EVENTS = [
    /* ===== 全镇事件 ===== */
    {
      id: 'evt_food_fest',
      name: '美食节',
      type: 'global',
      desc: '镇上举办美食节，餐饮类店铺生意火爆！',
      effect: function(shops) {
        var targets = ['laowang', 'zhangji'];
        for (var i = 0; i < shops.length; i++) {
          if (targets.indexOf(shops[i].id) >= 0) {
            M2.tickShop(shops[i], 0.12);
          }
        }
        return { affected: targets, type: 'positive' };
      }
    },
    {
      id: 'evt_rain_storm',
      name: '连日暴雨',
      type: 'global',
      desc: '暴雨持续一周，户外行业受到严重影响。',
      effect: function(shops) {
        var targets = ['zhouyu', 'linxiao'];
        for (var i = 0; i < shops.length; i++) {
          if (targets.indexOf(shops[i].id) >= 0) {
            M2.tickShop(shops[i], -0.10);
          }
        }
        return { affected: targets, type: 'negative' };
      }
    },
    {
      id: 'evt_internet_fame',
      name: '网红打卡',
      type: 'global',
      desc: '某网红在小店打卡，订单暴增！',
      effect: function(shops) {
        var target = shops[Math.floor(Math.random() * shops.length)];
        M2.tickShop(target, 0.15);
        return { affected: [target.id], type: 'positive' };
      }
    },
    {
      id: 'evt_economic_crisis',
      name: '经济下行',
      type: 'global',
      desc: '宏观经济下行，消费萎缩，全行业受影响。',
      effect: function(shops) {
        for (var i = 0; i < shops.length; i++) {
          M2.tickShop(shops[i], -0.05);
        }
        return { affected: 'all', type: 'negative' };
      }
    },
    {
      id: 'evt_policy_bonus',
      name: '政策红利',
      type: 'global',
      desc: '政府发布扶持小微企业的政策，全行业受益。',
      effect: function(shops) {
        for (var i = 0; i < shops.length; i++) {
          M2.tickShop(shops[i], 0.08);
        }
        return { affected: 'all', type: 'positive' };
      }
    },
    {
      id: 'evt_logistics_park',
      name: '物流园区扩建',
      type: 'global',
      desc: '镇外新建大型物流园区，相关行业受益。',
      effect: function(shops) {
        var targets = ['liqiao'];
        for (var i = 0; i < shops.length; i++) {
          if (targets.indexOf(shops[i].id) >= 0) {
            M2.tickShop(shops[i], 0.15);
          }
        }
        return { affected: targets, type: 'positive' };
      }
    },
    {
      id: 'evt_tech_expo',
      name: '科技展会',
      type: 'global',
      desc: '镇上举办科技展会，科技公司受到资本关注。',
      effect: function(shops) {
        var targets = ['meng'];
        for (var i = 0; i < shops.length; i++) {
          if (targets.indexOf(shops[i].id) >= 0) {
            M2.tickShop(shops[i], 0.20);
          }
        }
        return { affected: targets, type: 'positive' };
      }
    },
    {
      id: 'evt_health_crisis',
      name: '流感爆发',
      type: 'global',
      desc: '流感爆发，医药需求激增。',
      effect: function(shops) {
        var targets = ['chenyao'];
        for (var i = 0; i < shops.length; i++) {
          if (targets.indexOf(shops[i].id) >= 0) {
            M2.tickShop(shops[i], 0.18);
          }
        }
        return { affected: targets, type: 'positive' };
      }
    },
    {
      id: 'evt_ecom_impact',
      name: '电商冲击',
      type: 'global',
      desc: '电商平台大促销，线下零售受到冲击。',
      effect: function(shops) {
        var targets = ['linxiao', 'amei'];
        for (var i = 0; i < shops.length; i++) {
          if (targets.indexOf(shops[i].id) >= 0) {
            M2.tickShop(shops[i], -0.12);
          }
        }
        return { affected: targets, type: 'negative' };
      }
    },
    {
      id: 'evt_tourist_season',
      name: '旅游旺季',
      type: 'global',
      desc: '旅游旺季到来，特色小店生意兴隆。',
      effect: function(shops) {
        var targets = ['zhouyu', 'zhangji', 'amei'];
        for (var i = 0; i < shops.length; i++) {
          if (targets.indexOf(shops[i].id) >= 0) {
            M2.tickShop(shops[i], 0.10);
          }
        }
        return { affected: targets, type: 'positive' };
      }
    }
  ];

  /* ===== 触发概率 ===== */
  var TRIGGER_PROB = 0.30; // 每季30%概率触发事件

  /**
   * 尝试触发一个随机事件
   * @returns {Object|null} 触发的事件对象，未触发返回null
   */
  function tryTrigger() {
    if (Math.random() > TRIGGER_PROB) return null;
    return EVENTS[Math.floor(Math.random() * EVENTS.length)];
  }

  /**
   * 应用事件效果
   * @param {Object} event - 事件对象
   * @param {Array} shops - 店铺数组
   * @returns {Object} 应用结果
   */
  function applyEvent(event, shops) {
    if (!event || !event.effect) return null;
    return event.effect(shops);
  }

  /**
   * 获取所有事件（用于UI展示）
   * 使用深拷贝，避免外部修改影响原数据
   */
  function getAllEvents() {
    return EVENTS.map(function(e){
      return {
        id: e.id,
        name: e.name,
        type: e.type,
        desc: e.desc,
        effect: e.effect
      };
    });
  }

  /**
   * 根据ID查找事件
   */
  function findEvent(id) {
    for (var i = 0; i < EVENTS.length; i++) {
      if (EVENTS[i].id === id) return EVENTS[i];
    }
    return null;
  }

  return {
    EVENTS: EVENTS,
    TRIGGER_PROB: TRIGGER_PROB,
    tryTrigger: tryTrigger,
    applyEvent: applyEvent,
    getAllEvents: getAllEvents,
    findEvent: findEvent
  };

})();
