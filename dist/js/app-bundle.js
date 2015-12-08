(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
var APIID, App, Vue, VueAsyncData, VueRouter, bz, bzInstance, database, login, loginTpl, main, mainTpl, ref, router, usersRef;

ref = new Wilddog("https://vue.wilddogio.com/");

database = ref.child('web');

usersRef = database.child('users');

Vue = (typeof window !== "undefined" ? window['Vue'] : typeof global !== "undefined" ? global['Vue'] : null);

VueAsyncData = (typeof window !== "undefined" ? window['VueAsyncData'] : typeof global !== "undefined" ? global['VueAsyncData'] : null);

Vue.use(VueAsyncData);

VueRouter = (typeof window !== "undefined" ? window['VueRouter'] : typeof global !== "undefined" ? global['VueRouter'] : null);

Vue.use(VueRouter);

router = new VueRouter();

Vue.config.debug = true;

APIID = 'FAGwmONQ2v9RAFPS3IM4if9wcJp7s2i15hOVabFy';

$.fn.modal.settings.debug = false;

$.fn.dimmer.settings.debug = false;

$.fn.dropdown.settings.debug = false;

$.fn.popup.settings.debug = false;

$.fn.checkbox.settings.debug = false;

bz = function() {
  if (!(this instanceof bz)) {
    return new bz();
  }
};

bz.prototype.getToken = function() {
  var authData, token;
  authData = ref.getAuth();
  token = '';
  if (authData) {
    token = authData.token;
  }
  return token;
};

bz.prototype.auth = function() {
  var token;
  token = this.getToken();
  if (!token) {
    router.replace('/auth');
  }
  return ref.authWithCustomToken(token, function(error, authData) {
    if (error) {
      return router.replace('/auth');
    } else {
      return router.replace('/');
    }
  });
};

bz.prototype.cancel = function() {
  ref.unauth();
  return router.replace('/auth');
};

bzInstance = bz();

mainTpl = require('../tpl/main.jade')();

main = Vue.extend({
  template: mainTpl,
  data: function() {
    return {
      form: {
        name: '',
        tel: '',
        desc: ''
      },
      list: {},
      info: {
        sms: 0
      },
      search: '',
      msg: {
        status: 0,
        text: ''
      },
      sort: -1,
      filter: {
        send: '',
        arrived: ''
      },
      pages: 10
    };
  },
  computed: {
    validate: function() {
      return this.form.name && this.form.tel && this.isTel;
    },
    isTel: function() {
      return /^\d{11}$/.test(this.form.tel);
    },
    searching: function() {
      return /^\d{3,10}$/.test(this.search);
    },
    page: function() {
      return 10;
    }
  },
  events: {
    closeMsg: function() {
      return $('.bz-message').transition({
        animation: 'fade down',
        duration: 300
      });
    }
  },
  methods: {
    submit: function() {
      var date, day, month, self, year;
      self = this;
      date = new Date();
      year = date.getFullYear();
      month = date.getMonth() + 1;
      day = year + '/' + month + '/' + date.getDate();
      usersRef.push({
        name: self.form.name,
        tel: self.form.tel,
        date: day,
        visitDate: day,
        desc: self.form.desc,
        sent: false,
        arrive: false
      });
      return usersRef.once('child_added', function(snapshot) {
        self.form.name = '';
        self.form.tel = '';
        return self.form.desc = '';
      });
    },
    sms: function(obj, id) {
      var self;
      self = this;
      if (this.disabled) {
        return false;
      }
      this.disabled = true;
      return $.ajax({
        method: 'POST',
        url: '/api/sendSMS',
        data: {
          mobile: obj.tel
        },
        dataType: 'json',
        success: function(data) {
          var row;
          if (data.code === 0) {
            self.info.sms = self.info.sms - 1;
            row = usersRef.child(id);
            row.update({
              sent: true
            });
            return self.msg.status = 1;
          } else {
            self.msg.status = 0;
            return self.msg.text = data.msg;
          }
        },
        error: function() {
          return self.msg.status = 2;
        },
        complete: function() {
          self.disabled = false;
          $('.bz-message').transition({
            animation: 'fade down',
            duration: 300
          });
          return setTimeout(function() {
            return self.$emit('closeMsg');
          }, 3000);
        }
      });
    },
    del: function(id) {
      $('.ui.modal').modal('show');
      return this.$once('row-del', function() {
        var row;
        row = usersRef.child(id);
        return row.remove();
      });
    },
    confirm: function() {
      return this.$emit('row-del');
    },
    modify: function(obj, id) {
      var row;
      obj.editable = !obj.editable;
      if (obj.editable === false) {
        row = usersRef.child(id);
        return row.update({
          name: obj.name,
          tel: obj.tel,
          desc: obj.desc,
          visitDate: obj.visitDate
        });
      }
    },
    attendance: function(obj, id, e) {
      var row;
      row = usersRef.child(id);
      row.update({
        arrive: true
      });
      return $(e.target).parents('.ui.dropdown').dropdown('hide');
    },
    messageClose: function() {
      return this.$emit('closeMsg');
    },
    logout: function() {
      return bzInstance.cancel();
    },
    noticeCtrl: function() {
      return this.$broadcast('toggleNotice');
    },
    searchLike: function() {
      var input;
      input = this.search;
      if (this.searching) {
        $.each(this.list, function(key, val) {
          var match, wrapTag;
          if (val.tel.indexOf(input) >= 0) {
            match = val.tel.match(input);
            wrapTag = '<span class="searchSelect">' + match[0] + '</span>';
            val.telClone = val.tel.replace(match[0], wrapTag);
          } else {
            val.telClone = '';
          }
        });
      }
    },
    sortList: function() {
      if (this.sort === 1) {
        return this.sort = -1;
      } else {
        return this.sort = 1;
      }
    }
  },
  asyncData: function(resolve) {
    var self;
    self = this;
    return usersRef.on('value', function(snapshot) {
      var dropdownHide, userlist;
      userlist = snapshot.val();
      if (userlist && !$.isEmptyObject(userlist)) {
        $.each(userlist, function(index, item) {
          item.editable = false;
          item.telClone = '';
          item.disabled = false;
          return true;
        });
      }
      resolve({
        list: userlist
      });
      dropdownHide = function() {
        return $('.ui.dropdown').dropdown({
          action: 'hide'
        });
      };
      return setTimeout(dropdownHide, 0);
    });
  },
  created: function() {
    var self;
    bzInstance.auth();
    self = this;
    return $.ajax({
      url: '/api/account',
      dataType: 'json',
      success: function(data) {
        if (data.code === 0) {
          return self.info.sms = data.user.balance;
        }
      }
    });
  },
  ready: function() {
    var self;
    self = this;
    $('[data-content]').popup();
    $('#filterSend').checkbox({
      onChange: function() {
        if (self.filter.send === false) {
          return self.filter.send = '';
        } else {
          return self.filter.send = false;
        }
      }
    });
    return $('#filterArrived').checkbox({
      onChange: function() {
        if (self.filter.arrived === false) {
          return self.filter.arrived = '';
        } else {
          return self.filter.arrived = false;
        }
      }
    });
  },
  components: {
    notice: require('../tpl/notice.vue')
  }
});

loginTpl = require('../tpl/login.jade')();

login = Vue.extend({
  template: loginTpl,
  data: function() {
    return {
      loginError: false,
      email: '',
      password: ''
    };
  },
  methods: {
    login: function() {
      var callback, self;
      if (!this.email || !this.password) {
        this.loginError = true;
        return;
      }
      callback = function(err, data) {
        if (err === null) {
          return router.replace('/');
        } else {
          return self.loginError = true;
        }
      };
      self = this;
      return ref.authWithPassword({
        email: self.email,
        password: self.password
      }, callback);
    }
  },
  created: function() {
    return bzInstance.auth();
  }
});

router.map({
  '/': {
    component: main
  },
  '/auth': {
    component: login
  }
});

App = Vue.extend({});

router.start(App, '#app');


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../tpl/login.jade":2,"../tpl/main.jade":3,"../tpl/notice.vue":4}],2:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

buf.push("<style>body {\n    background-color: #DADADA;\n}\nbody > .grid {\n    height: 100%;\n}\n.column {\n    max-width: 450px;\n}</style><div class=\"ui middle aligned center aligned grid\"><div class=\"column\"><h2 class=\"ui teal header\"><div class=\"content\">验证你的身份</div></h2><form v-bind:class=\"{'error': loginError}\" class=\"ui large form\"><div class=\"ui stacked segment\"><div class=\"field\"><div class=\"ui left icon input\"><div class=\"user icon\"></div><input type=\"text\" placeholder=\"邮箱\" v-model=\"email\"/></div></div><div class=\"field\"><div class=\"ui left icon input\"><div class=\"lock icon\"></div><input type=\"password\" placeholder=\"密码\" v-model=\"password\"/></div></div><div v-on:click=\"login\" class=\"ui fluid large teal submit button\">登录</div></div><div class=\"ui error message\">账号或密码有误</div></form></div></div>");;return buf.join("");
};
},{"jade/runtime":6}],3:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

buf.push("<div v-on:click=\"messageClose\" v-bind:class=\"{'positive': msg.status == 1, 'negative': msg.status == 0, 'transition': true, 'hidden': true}\" class=\"ui compact message bz-message\"><i class=\"close icon\"></i><p v-if=\"msg.status == 0\">{{msg.text}}！</p><p v-if=\"msg.status == 1\">短信发送成功！</p><p v-if=\"msg.status == 2\">网络错误，请稍后再试！</p></div><div class=\"ui container\"><header><div class=\"ui grid\"><div class=\"twelve wide column\"><h1 class=\"ui header\"> <i class=\"doctor icon\"></i>百忠牙科</h1></div><div class=\"four wide column\"><div v-on:click=\"logout\" data-content=\"登出\" class=\"ui icon button bz-logout\"><i class=\"sign out icon\"></i></div><div v-on:click=\"noticeCtrl\" data-content=\"消息\" class=\"ui icon button bz-notice-btn\"><i class=\"announcement icon\"></i></div></div></div></header><div class=\"ui green label sms-count\">可用短信<div class=\"detail\">{{info.sms}}</div></div><notice></notice><div class=\"section\"><h3 class=\"ui dividing header\">新增客户资料</h3><div v-bind:class=\"{'error': !validate}\" class=\"ui form\"><div class=\"two fields\"><div class=\"field\"><label>姓名</label><input type=\"text\" v-model=\"form.name\"/></div><div class=\"field\"><label>电话</label><input type=\"text\" v-model=\"form.tel\"/></div></div><div class=\"field\"><label>备注</label><textarea rows=\"2\" v-model=\"form.desc\"></textarea></div><div v-on:click=\"submit\" v-bind:class=\"{'disabled':!validate}\" class=\"button ui blue button\">提交</div><div class=\"ui error message\"><ul class=\"list\"><li v-if=\"!form.name\">请输入姓名</li><li v-if=\"!form.tel\">请输入手机号码</li><li v-if=\"!isTel &amp;&amp; form.tel\">你输入的手机号码有误</li></ul></div></div></div><div class=\"section\"><h3 class=\"ui dividing header\">客户列表</h3><div class=\"table-control\"><div class=\"ui left icon input user-search\"><input type=\"text\" placeholder=\"搜索姓名或手机号码...\" v-model=\"search\" v-on:input=\"searchLike\" v-on:blur=\"search = ''\"/><i class=\"users icon\"></i></div><button v-on:click=\"sortList\" data-content=\"排序\" class=\"ui icon button sort-button\"><i v-show=\"sort == 1\" class=\"sort numeric ascending icon\"></i><i v-show=\"sort == -1\" class=\"sort numeric descending icon\"></i></button><div id=\"filterSend\" class=\"ui checkbox\"><input type=\"checkbox\" name=\"send\" tabindex=\"0\" class=\"hidden\"/><label>未通知</label></div><div id=\"filterArrived\" class=\"ui checkbox\"><input type=\"checkbox\" name=\"arrived\" tabindex=\"0\" class=\"hidden\"/><label>未到诊</label></div></div><table class=\"ui very basic right aligned table user-list\"><thead><tr><th> <span class=\"date-tags\">登记/来访</span></th><th>姓名</th><th>电话</th><th>备注</th><th>编辑</th><th>功能</th><th>通知</th><th>到诊</th></tr></thead><tbody><tr v-for=\"item in list | orderBy 'visitDate' sort | filterBy filter.send in 'sent' | filterBy filter.arrived in 'arrive' | limitBy pages 0\" v-bind:class=\"{'positive':item.name == search || item.tel == search}\"><td> <div class=\"date-tags\">{{item.date}}</div><div v-show=\"!item.editable\">{{item.visitDate}}</div><div v-show=\"item.editable\" class=\"ui input\"><input type=\"text\" v-model=\"item.visitDate\"/></div></td><td><div v-show=\"item.editable\" class=\"ui input\"><input type=\"text\" v-model=\"item.name\"/></div><div v-show=\"!item.editable\">{{item.name}}</div></td><td><div v-show=\"item.editable\" class=\"ui input\"><input type=\"text\" v-model=\"item.tel\"/></div><div v-show=\"!item.editable\"><span v-show=\"!item.telClone || !searching\">{{item.tel}}</span><div v-html=\"item.telClone\" v-show=\"item.telClone &amp;&amp; searching\"></div></div></td><td><div v-show=\"!item.editable\"><template v-if=\"!item.desc\">...</template><template v-else=\"v-else\">{{item.desc}}</template></div><div v-show=\"item.editable\" class=\"ui form\"><div class=\"field\"><textarea rows=\"2\" v-model=\"item.desc\"></textarea></div></div></td><td><div class=\"ui icon bottom left pointing dropdown button\"><i class=\"write icon\"></i><div class=\"menu\"><div v-on:click=\"del($key)\" class=\"item\"> <i class=\"remove icon\"></i><span class=\"text\">删除</span></div><div v-on:click=\"modify(item, $key)\" class=\"item\"><i class=\"edit icon\"></i><span v-if=\"!item.editable\" class=\"text\">修改</span><span v-else=\"v-else\" class=\"text\">保存</span></div></div></div></td><td><div class=\"ui icon bottom left pointing dropdown button\"><i class=\"wrench icon\"></i><div class=\"menu\"><div v-on:click=\"sms(item, $key)\" class=\"item\"><i class=\"mail outline icon\"></i><span class=\"text\">短信</span></div><div v-on:click=\"attendance(item, $key, $event)\" class=\"item\"><i class=\"flag icon\"></i><span class=\"text\">到诊</span></div></div></div></td><td><i v-if=\"item.sent\" class=\"checkmark green icon\"></i><i v-else=\"v-else\" class=\"remove red icon\"></i></td><td><i v-if=\"item.arrive\" class=\"checkmark green icon\"></i><i v-else=\"v-else\" class=\"remove red icon\"></i></td></tr></tbody><tfoot><tr><th colspan=\"8\"><div class=\"ui right floated pagination menu\"><a class=\"item icon\"><i class=\"left chevron icon\"></i></a><a class=\"item\">1</a><a class=\"item active\">2</a><a class=\"item\">3</a><a class=\"item\">4</a><a class=\"item\">5</a><a class=\"item icon\"><i class=\"right chevron icon\"></i></a></div></th></tr></tfoot></table></div><div class=\"ui small basic modal\"><div class=\"ui icon header\"><i class=\"archive icon\"></i>删除数据？</div><div class=\"content\"><p>数据删除不可恢复，是否要删除本条数据？</p></div><div class=\"actions\"><div class=\"ui red basic cancel inverted button\"><i class=\"remove icon\"></i>No</div><div v-on:click=\"confirm\" class=\"ui green ok inverted button\"><i class=\"checkmark icon\"></i>Yes</div></div></div></div>");;return buf.join("");
};
},{"jade/runtime":6}],4:[function(require,module,exports){
var __vue_template__ = "<div v-bind:class=\"{'hidden': isShow == 0}\" class=\"ui icon message trantison update-message\"><i class=\"close icon\"></i><div class=\"content\"><div class=\"header\">更新啦！！！</div><div class=\"ui list\"><div class=\"item\"><div class=\"header\">2015年11月30日</div>修复无法连续发信息bug。</div><div class=\"item\">增加<div class=\"ui mini label\">排序</div>按钮</div><div class=\"item\">增加<div class=\"ui mini label\">过滤</div></div><div class=\"item\"><div class=\"header\">2015年11月13日</div>手机号支持模糊搜索，输入三位以上数字。e.g.<span class=\"italic\">0452</span>,<span class=\"italic\">137</span></div><div class=\"item\">更新通知只会在第一次访问时显示，如需查看请点右上角<div class=\"ui mini label\">通知</div>按钮</div><div class=\"item\">点击发送短信后，右上会显示发送状态。</div><div class=\"item\"><div class=\"header\">2015年11月12日</div>新增来访日期，默认为登记日期，如需更改请点<div class=\"ui mini label\">编辑</div>-<div class=\"ui mini label\">修改</div>。</div><div class=\"item\">新增搜索功能，暂时只支持严格匹配(全名或完整的手机号)。e.g.<span class=\"italic\">王大锤</span>,<span class=\"italic\">13804528888</span></div></div></div></div>";
module.exports = {
  data: function() {
    return {
      isShow: 1
    };
  },
  events: {
    toggle: function() {
      this.isShow = !this.isShow;
    }
  },
  ready: function() {
    if ($.cookie('notice')) {
      this.isShow = parseInt($.cookie('notice'), 10);
    }
    $(this.$el).find('.close').on('click', function() {
      $(this).closest('.message').transition('fade');
      return $.cookie('notice', 0);
    });
    return this.$on('toggleNotice', function() {
      this.$emit('toggle');
    });
  }
};

;(typeof module.exports === "function"? module.exports.options: module.exports).template = __vue_template__;

},{}],5:[function(require,module,exports){

},{}],6:[function(require,module,exports){
(function (global){
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.jade = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

/**
 * Merge two attribute objects giving precedence
 * to values in object `b`. Classes are special-cased
 * allowing for arrays and merging/joining appropriately
 * resulting in a string.
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object} a
 * @api private
 */

exports.merge = function merge(a, b) {
  if (arguments.length === 1) {
    var attrs = a[0];
    for (var i = 1; i < a.length; i++) {
      attrs = merge(attrs, a[i]);
    }
    return attrs;
  }
  var ac = a['class'];
  var bc = b['class'];

  if (ac || bc) {
    ac = ac || [];
    bc = bc || [];
    if (!Array.isArray(ac)) ac = [ac];
    if (!Array.isArray(bc)) bc = [bc];
    a['class'] = ac.concat(bc).filter(nulls);
  }

  for (var key in b) {
    if (key != 'class') {
      a[key] = b[key];
    }
  }

  return a;
};

/**
 * Filter null `val`s.
 *
 * @param {*} val
 * @return {Boolean}
 * @api private
 */

function nulls(val) {
  return val != null && val !== '';
}

/**
 * join array as classes.
 *
 * @param {*} val
 * @return {String}
 */
exports.joinClasses = joinClasses;
function joinClasses(val) {
  return (Array.isArray(val) ? val.map(joinClasses) :
    (val && typeof val === 'object') ? Object.keys(val).filter(function (key) { return val[key]; }) :
    [val]).filter(nulls).join(' ');
}

/**
 * Render the given classes.
 *
 * @param {Array} classes
 * @param {Array.<Boolean>} escaped
 * @return {String}
 */
exports.cls = function cls(classes, escaped) {
  var buf = [];
  for (var i = 0; i < classes.length; i++) {
    if (escaped && escaped[i]) {
      buf.push(exports.escape(joinClasses([classes[i]])));
    } else {
      buf.push(joinClasses(classes[i]));
    }
  }
  var text = joinClasses(buf);
  if (text.length) {
    return ' class="' + text + '"';
  } else {
    return '';
  }
};


exports.style = function (val) {
  if (val && typeof val === 'object') {
    return Object.keys(val).map(function (style) {
      return style + ':' + val[style];
    }).join(';');
  } else {
    return val;
  }
};
/**
 * Render the given attribute.
 *
 * @param {String} key
 * @param {String} val
 * @param {Boolean} escaped
 * @param {Boolean} terse
 * @return {String}
 */
exports.attr = function attr(key, val, escaped, terse) {
  if (key === 'style') {
    val = exports.style(val);
  }
  if ('boolean' == typeof val || null == val) {
    if (val) {
      return ' ' + (terse ? key : key + '="' + key + '"');
    } else {
      return '';
    }
  } else if (0 == key.indexOf('data') && 'string' != typeof val) {
    if (JSON.stringify(val).indexOf('&') !== -1) {
      console.warn('Since Jade 2.0.0, ampersands (`&`) in data attributes ' +
                   'will be escaped to `&amp;`');
    };
    if (val && typeof val.toISOString === 'function') {
      console.warn('Jade will eliminate the double quotes around dates in ' +
                   'ISO form after 2.0.0');
    }
    return ' ' + key + "='" + JSON.stringify(val).replace(/'/g, '&apos;') + "'";
  } else if (escaped) {
    if (val && typeof val.toISOString === 'function') {
      console.warn('Jade will stringify dates in ISO form after 2.0.0');
    }
    return ' ' + key + '="' + exports.escape(val) + '"';
  } else {
    if (val && typeof val.toISOString === 'function') {
      console.warn('Jade will stringify dates in ISO form after 2.0.0');
    }
    return ' ' + key + '="' + val + '"';
  }
};

/**
 * Render the given attributes object.
 *
 * @param {Object} obj
 * @param {Object} escaped
 * @return {String}
 */
exports.attrs = function attrs(obj, terse){
  var buf = [];

  var keys = Object.keys(obj);

  if (keys.length) {
    for (var i = 0; i < keys.length; ++i) {
      var key = keys[i]
        , val = obj[key];

      if ('class' == key) {
        if (val = joinClasses(val)) {
          buf.push(' ' + key + '="' + val + '"');
        }
      } else {
        buf.push(exports.attr(key, val, false, terse));
      }
    }
  }

  return buf.join('');
};

/**
 * Escape the given string of `html`.
 *
 * @param {String} html
 * @return {String}
 * @api private
 */

var jade_encode_html_rules = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;'
};
var jade_match_html = /[&<>"]/g;

function jade_encode_char(c) {
  return jade_encode_html_rules[c] || c;
}

exports.escape = jade_escape;
function jade_escape(html){
  var result = String(html).replace(jade_match_html, jade_encode_char);
  if (result === '' + html) return html;
  else return result;
};

/**
 * Re-throw the given `err` in context to the
 * the jade in `filename` at the given `lineno`.
 *
 * @param {Error} err
 * @param {String} filename
 * @param {String} lineno
 * @api private
 */

exports.rethrow = function rethrow(err, filename, lineno, str){
  if (!(err instanceof Error)) throw err;
  if ((typeof window != 'undefined' || !filename) && !str) {
    err.message += ' on line ' + lineno;
    throw err;
  }
  try {
    str = str || require('fs').readFileSync(filename, 'utf8')
  } catch (ex) {
    rethrow(err, null, lineno)
  }
  var context = 3
    , lines = str.split('\n')
    , start = Math.max(lineno - context, 0)
    , end = Math.min(lines.length, lineno + context);

  // Error context
  var context = lines.slice(start, end).map(function(line, i){
    var curr = i + start + 1;
    return (curr == lineno ? '  > ' : '    ')
      + curr
      + '| '
      + line;
  }).join('\n');

  // Alter exception message
  err.path = filename;
  err.message = (filename || 'Jade') + ':' + lineno
    + '\n' + context + '\n\n' + err.message;
  throw err;
};

exports.DebugItem = function DebugItem(lineno, filename) {
  this.lineno = lineno;
  this.filename = filename;
}

},{"fs":2}],2:[function(require,module,exports){

},{}]},{},[1])(1)
});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"fs":5}]},{},[1])


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvc2NyaXB0cy9hcHAuY29mZmVlIiwiYXNzZXRzL3RwbC9sb2dpbi5qYWRlIiwiYXNzZXRzL3RwbC9tYWluLmphZGUiLCJhc3NldHMvdHBsL25vdGljZS52dWUiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1yZXNvbHZlL2VtcHR5LmpzIiwibm9kZV9tb2R1bGVzL2phZGUvcnVudGltZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQSxJQUFBOztBQUFBLEdBQUEsR0FBVSxJQUFBLE9BQUEsQ0FBUSw0QkFBUjs7QUFDVixRQUFBLEdBQVcsR0FBRyxDQUFDLEtBQUosQ0FBVSxLQUFWOztBQUNYLFFBQUEsR0FBVyxRQUFRLENBQUMsS0FBVCxDQUFlLE9BQWY7O0FBQ1gsR0FBQSxHQUFNLE9BQUEsQ0FBUSxLQUFSOztBQUNOLFlBQUEsR0FBZSxPQUFBLENBQVEsY0FBUjs7QUFDZixHQUFHLENBQUMsR0FBSixDQUFRLFlBQVI7O0FBQ0EsU0FBQSxHQUFZLE9BQUEsQ0FBUSxXQUFSOztBQUNaLEdBQUcsQ0FBQyxHQUFKLENBQVEsU0FBUjs7QUFDQSxNQUFBLEdBQWEsSUFBQSxTQUFBLENBQUE7O0FBQ2IsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFYLEdBQW1COztBQUVuQixLQUFBLEdBQVE7O0FBRVIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQXBCLEdBQTRCOztBQUM1QixDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBckIsR0FBNkI7O0FBQzdCLENBQUMsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUF2QixHQUErQjs7QUFDL0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsUUFBUSxD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R0FBQSxFQUNFO0lBQUEsU0FBQSxFQUFXLElBQVg7R0FGTztFQUlULE9BQUEsRUFDRTtJQUFBLFNBQUEsRUFBVyxLQUFYO0dBTE87Q0FBWDs7QUFPQSxHQUFBLEdBQU0sR0FBRyxDQUFDLE1BQUosQ0FBVyxFQUFYOztBQUNOLE1BQU0sQ0FBQyxLQUFQLENBQWEsR0FBYixFQUFrQixNQUFsQjs7Ozs7O0FDN1FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBOzs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYXBwLWJ1bmRsZS5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwicmVmID0gbmV3IFdpbGRkb2cgXCJodHRwczovL3Z1ZS53aWxkZG9naW8uY29tL1wiXG5kYXRhYmFzZSA9IHJlZi5jaGlsZCgnd2ViJylcbnVzZXJzUmVmID0gZGF0YWJhc2UuY2hpbGQoJ3VzZXJzJylcblZ1ZSA9IHJlcXVpcmUgJ1Z1ZSdcblZ1ZUFzeW5jRGF0YSA9IHJlcXVpcmUgJ1Z1ZUFzeW5jRGF0YSdcblZ1ZS51c2UgVnVlQXN5bmNEYXRhXG5WdWVSb3V0ZXIgPSByZXF1aXJlICdWdWVSb3V0ZXInXG5WdWUudXNlIFZ1ZVJvdXRlclxucm91dGVyID0gbmV3IFZ1ZVJvdXRlcigpXG5WdWUuY29uZmlnLmRlYnVnID0gdHJ1ZVxuIyBBUElJRCA9ICcxODM4NDNiMWIyM2Y1MmE3Y2YyOGVlZWZhODhiNmRmZidcbkFQSUlEID0gJ0ZBR3dtT05RMnY5UkFGUFMzSU00aWY5d2NKcDdzMmkxNWhPVmFiRnknXG4jIGRlYnVnIG9mZlxuJC5mbi5tb2RhbC5zZXR0aW5ncy5kZWJ1ZyA9IGZhbHNlXG4kLmZuLmRpbW1lci5zZXR0aW5ncy5kZWJ1ZyA9IGZhbHNlXG4kLmZuLmRyb3Bkb3duLnNldHRpbmdzLmRlYnVnID0gZmFsc2VcbiQuZm4ucG9wdXAuc2V0dGluZ3MuZGVidWcgPSBmYWxzZVxuJC5mbi5jaGVja2JveC5zZXR0aW5ncy5kZWJ1ZyA9IGZhbHNlXG4jIHB1YmNsaVxuYnogPSAoKSAtPlxuICB1bmxlc3MgdGhpcyBpbnN0YW5jZW9mIGJ6XG4gICAgcmV0dXJuIG5ldyBieigpXG5iei5wcm90b3R5cGUuZ2V0VG9rZW4gPSAoKSAtPlxuICBhdXRoRGF0YSA9IHJlZi5nZXRBdXRoKClcbiAgdG9rZW4gPSAnJ1xuICBpZiBhdXRoRGF0YVxuICAgIHRva2VuID0gYXV0aERhdGEudG9rZW5cbiAgcmV0dXJuIHRva2VuXG5iei5wcm90b3R5cGUuYXV0aCA9ICgpIC0+XG4gIHRva2VuID0gdGhpcy5nZXRUb2tlbigpXG4gIHVubGVzcyB0b2tlblxuICAgIHJvdXRlci5yZXBsYWNlKCcvYXV0aCcpXG4gIHJlZi5hdXRoV2l0aEN1c3RvbVRva2VuIHRva2VuLCAoZXJyb3IsIGF1dGhEYXRhKSAtPlxuICAgIGlmIGVycm9yXG4gICAgICByb3V0ZXIucmVwbGFjZSgnL2F1dGgnKVxuICAgIGVsc2VcbiAgICAgIHJvdXRlci5yZXBsYWNlKCcvJylcbmJ6LnByb3RvdHlwZS5jYW5jZWwgPSAoKSAtPlxuICByZWYudW5hdXRoKClcbiAgcm91dGVyLnJlcGxhY2UoJy9hdXRoJylcbmJ6SW5zdGFuY2UgPSBieigpXG4jIHZ1ZSBnZW5lcmF0b3Jcbm1haW5UcGwgPSByZXF1aXJlKCcuLi90cGwvbWFpbi5qYWRlJykoKVxubWFpbiA9IFZ1ZS5leHRlbmQge1xuICB0ZW1wbGF0ZTogbWFpblRwbFxuICBkYXRhOiAoKSAtPlxuICAgIHJldHVybiB7XG4gICAgICBmb3JtOlxuICAgICAgICBuYW1lOiAnJ1xuICAgICAgICB0ZWw6ICcnXG4gICAgICAgIGRlc2M6ICcnXG4gICAgICBsaXN0OiB7fVxuICAgICAgaW5mbzpcbiAgICAgICAgc21zOiAwXG4gICAgICBzZWFyY2g6ICcnXG4gICAgICBtc2c6IHtcbiAgICAgICAgc3RhdHVzOiAwXG4gICAgICAgIHRleHQ6ICcnXG4gICAgICB9XG4gICAgICBzb3J0OiAtMSxcbiAgICAgIGZpbHRlcjoge1xuICAgICAgICBzZW5kOiAnJyxcbiAgICAgICAgYXJyaXZlZDogJydcbiAgICAgIH0sXG4gICAgICBwYWdlczogMTBcbiAgICB9XG4gIGNvbXB1dGVkOlxuICAgIHZhbGlkYXRlOiAoKSAtPlxuICAgICAgdGhpcy5mb3JtLm5hbWUgJiYgdGhpcy5mb3JtLnRlbCAmJiB0aGlzLmlzVGVsXG4gICAgaXNUZWw6ICgpIC0+XG4gICAgICAvXlxcZHsxMX0kLy50ZXN0KHRoaXMuZm9ybS50ZWwpXG4gICAgc2VhcmNoaW5nOiAoKSAtPlxuICAgICAgL15cXGR7MywxMH0kLy50ZXN0KHRoaXMuc2VhcmNoKVxuICAgIHBhZ2U6ICgpIC0+XG4gICAgICByZXR1cm4gMTBcbiAgZXZlbnRzOlxuICAgIGNsb3NlTXNnOiAoKSAtPlxuICAgICAgJCgnLmJ6LW1lc3NhZ2UnKS50cmFuc2l0aW9uIHtcbiAgICAgICAgYW5pbWF0aW9uOiAnZmFkZSBkb3duJ1xuICAgICAgICBkdXJhdGlvbjogMzAwXG4gICAgICB9XG4gIG1ldGhvZHM6XG4gICAgc3VibWl0OiAoKSAtPlxuICAgICAgc2VsZiA9IHRoaXNcbiAgICAgIGRhdGUgPSBuZXcgRGF0ZSgpXG4gICAgICB5ZWFyID0gZGF0ZS5nZXRGdWxsWWVhcigpXG4gICAgICBtb250aCA9IGRhdGUuZ2V0TW9udGgoKSArIDFcbiAgICAgIGRheSA9IHllYXIgKyAnLycgKyBtb250aCArICcvJyArIGRhdGUuZ2V0RGF0ZSgpXG4gICAgICB1c2Vyc1JlZi5wdXNoIHtcbiAgICAgICAgbmFtZTogc2VsZi5mb3JtLm5hbWVcbiAgICAgICAgdGVsOiBzZWxmLmZvcm0udGVsXG4gICAgICAgIGRhdGU6IGRheVxuICAgICAgICB2aXNpdERhdGU6IGRheVxuICAgICAgICBkZXNjOiBzZWxmLmZvcm0uZGVzY1xuICAgICAgICBzZW50OiBmYWxzZVxuICAgICAgICBhcnJpdmU6IGZhbHNlXG4gICAgICB9XG4gICAgICB1c2Vyc1JlZi5vbmNlICdjaGlsZF9hZGRlZCcsIChzbmFwc2hvdCkgLT5cbiAgICAgICAgc2VsZi5mb3JtLm5hbWUgPSAnJ1xuICAgICAgICBzZWxmLmZvcm0udGVsID0gJydcbiAgICAgICAgc2VsZi5mb3JtLmRlc2MgPSAnJ1xuICAgIHNtczogKG9iaiwgaWQpIC0+XG4gICAgICBzZWxmID0gdGhpc1xuICAgICAgaWYgdGhpcy5kaXNhYmxlZFxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIHRoaXMuZGlzYWJsZWQgPSB0cnVlXG4gICAgICAkLmFqYXgge1xuICAgICAgICBtZXRob2Q6ICdQT1NUJ1xuICAgICAgICB1cmw6ICcvYXBpL3NlbmRTTVMnXG4gICAgICAgIGRhdGE6XG4gICAgICAgICAgbW9iaWxlOiBvYmoudGVsXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgICAgc3VjY2VzczogKGRhdGEpIC0+XG4gICAgICAgICAgaWYgZGF0YS5jb2RlIGlzIDBcbiAgICAgICAgICAgIHNlbGYuaW5mby5zbXMgPSBzZWxmLmluZm8uc21zIC0gMVxuICAgICAgICAgICAgcm93ID0gdXNlcnNSZWYuY2hpbGQoaWQpXG4gICAgICAgICAgICByb3cudXBkYXRlIHtcbiAgICAgICAgICAgICAgc2VudDogdHJ1ZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2VsZi5tc2cuc3RhdHVzID0gMVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHNlbGYubXNnLnN0YXR1cyA9IDBcbiAgICAgICAgICAgIHNlbGYubXNnLnRleHQgPSBkYXRhLm1zZ1xuICAgICAgICBlcnJvcjogKCkgLT5cbiAgICAgICAgICBzZWxmLm1zZy5zdGF0dXMgPSAyXG4gICAgICAgIGNvbXBsZXRlOiAoKSAtPlxuICAgICAgICAgIHNlbGYuZGlzYWJsZWQgPSBmYWxzZVxuICAgICAgICAgICQoJy5iei1tZXNzYWdlJykudHJhbnNpdGlvbiB7XG4gICAgICAgICAgICBhbmltYXRpb246ICdmYWRlIGRvd24nXG4gICAgICAgICAgICBkdXJhdGlvbjogMzAwXG4gICAgICAgICAgfVxuICAgICAgICAgIHNldFRpbWVvdXQgKCkgLT5cbiAgICAgICAgICAgIHNlbGYuJGVtaXQgJ2Nsb3NlTXNnJ1xuICAgICAgICAgICwgMzAwMFxuICAgICAgfVxuICAgIGRlbDogKGlkKSAtPlxuICAgICAgJCgnLnVpLm1vZGFsJykubW9kYWwgJ3Nob3cnXG4gICAgICB0aGlzLiRvbmNlICdyb3ctZGVsJywgKCkgLT5cbiAgICAgICAgcm93ID0gdXNlcnNSZWYuY2hpbGQoaWQpXG4gICAgICAgIHJvdy5yZW1vdmUoKVxuXG4gICAgY29uZmlybTogKCkgLT5cbiAgICAgIHRoaXMuJGVtaXQgJ3Jvdy1kZWwnXG5cbiAgICBtb2RpZnk6IChvYmosIGlkKSAtPlxuICAgICAgb2JqLmVkaXRhYmxlID0gIW9iai5lZGl0YWJsZVxuICAgICAgaWYgb2JqLmVkaXRhYmxlIGlzIGZhbHNlXG4gICAgICAgIHJvdyA9IHVzZXJzUmVmLmNoaWxkKGlkKVxuICAgICAgICByb3cudXBkYXRlIHtcbiAgICAgICAgICBuYW1lOiBvYmoubmFtZVxuICAgICAgICAgIHRlbDogb2JqLnRlbFxuICAgICAgICAgIGRlc2M6IG9iai5kZXNjXG4gICAgICAgICAgdmlzaXREYXRlOiBvYmoudmlzaXREYXRlXG4gICAgICAgIH1cbiAgICBhdHRlbmRhbmNlOiAob2JqLCBpZCwgZSkgLT5cbiAgICAgIHJvdyA9IHVzZXJzUmVmLmNoaWxkKGlkKVxuICAgICAgcm93LnVwZGF0ZSB7XG4gICAgICAgIGFycml2ZTogdHJ1ZVxuICAgICAgfVxuICAgICAgJChlLnRhcmdldCkucGFyZW50cygnLnVpLmRyb3Bkb3duJykuZHJvcGRvd24oJ2hpZGUnKVxuICAgIG1lc3NhZ2VDbG9zZTogKCkgLT5cbiAgICAgIHRoaXMuJGVtaXQgJ2Nsb3NlTXNnJ1xuICAgIGxvZ291dDogKCkgLT5cbiAgICAgIGJ6SW5zdGFuY2UuY2FuY2VsKClcbiAgICBub3RpY2VDdHJsOiAoKSAtPlxuICAgICAgdGhpcy4kYnJvYWRjYXN0KCd0b2dnbGVOb3RpY2UnKVxuICAgIHNlYXJjaExpa2U6ICgpIC0+XG4gICAgICBpbnB1dCA9IHRoaXMuc2VhcmNoXG4gICAgICBpZiB0aGlzLnNlYXJjaGluZ1xuICAgICAgICAkLmVhY2ggdGhpcy5saXN0LCAoa2V5LCB2YWwpIC0+XG4gICAgICAgICAgaWYgdmFsLnRlbC5pbmRleE9mKGlucHV0KSA+PSAwXG4gICAgICAgICAgICBtYXRjaCA9IHZhbC50ZWwubWF0Y2goaW5wdXQpXG4gICAgICAgICAgICB3cmFwVGFnID0gJzxzcGFuIGNsYXNzPVwic2VhcmNoU2VsZWN0XCI+JyArIG1hdGNoWzBdICsgJzwvc3Bhbj4nXG4gICAgICAgICAgICB2YWwudGVsQ2xvbmUgPSAgdmFsLnRlbC5yZXBsYWNlKG1hdGNoWzBdLCB3cmFwVGFnKVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHZhbC50ZWxDbG9uZSA9ICcnXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIHJldHVyblxuICAgIHNvcnRMaXN0OiAoKSAtPlxuICAgICAgaWYgdGhpcy5zb3J0IGlzIDFcbiAgICAgICAgdGhpcy5zb3J0ID0gLTFcbiAgICAgIGVsc2VcbiAgICAgICAgdGhpcy5zb3J0ID0gMVxuICBhc3luY0RhdGE6IChyZXNvbHZlKSAtPlxuICAgIHNlbGYgPSB0aGlzXG4gICAgdXNlcnNSZWYub24gJ3ZhbHVlJywgKHNuYXBzaG90KSAtPlxuICAgICAgdXNlcmxpc3QgPSBzbmFwc2hvdC52YWwoKVxuICAgICAgaWYgdXNlcmxpc3QgYW5kICEkLmlzRW1wdHlPYmplY3QgdXNlcmxpc3RcbiAgICAgICAgJC5lYWNoIHVzZXJsaXN0LCAoaW5kZXgsIGl0ZW0pIC0+XG4gICAgICAgICAgaXRlbS5lZGl0YWJsZSA9IGZhbHNlXG4gICAgICAgICAgaXRlbS50ZWxDbG9uZSA9ICcnXG4gICAgICAgICAgaXRlbS5kaXNhYmxlZCA9IGZhbHNlXG4gICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIHJlc29sdmUge1xuICAgICAgICBsaXN0OiB1c2VybGlzdFxuICAgICAgfVxuICAgICAgZHJvcGRvd25IaWRlID0gKCkgLT5cbiAgICAgICAgJCgnLnVpLmRyb3Bkb3duJykuZHJvcGRvd24ge1xuICAgICAgICAgIGFjdGlvbjogJ2hpZGUnXG4gICAgICAgIH1cbiAgICAgIHNldFRpbWVvdXQgZHJvcGRvd25IaWRlLCAwXG4gIGNyZWF0ZWQ6ICgpIC0+XG4gICAgYnpJbnN0YW5jZS5hdXRoKClcbiAgICBzZWxmID0gdGhpc1xuICAgICQuYWpheCB7XG4gICAgICB1cmw6ICcvYXBpL2FjY291bnQnXG4gICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICBzdWNjZXNzOiAoZGF0YSkgLT5cbiAgICAgICAgaWYgZGF0YS5jb2RlIGlzIDBcbiAgICAgICAgICBzZWxmLmluZm8uc21zID0gZGF0YS51c2VyLmJhbGFuY2VcbiAgICB9XG4gIHJlYWR5OiAoKSAtPlxuICAgIHNlbGYgPSB0aGlzXG4gICAgJCgnW2RhdGEtY29udGVudF0nKS5wb3B1cCgpXG4gICAgJCgnI2ZpbHRlclNlbmQnKS5jaGVja2JveCB7XG4gICAgICBvbkNoYW5nZTogKCkgLT5cbiAgICAgICAgaWYgc2VsZi5maWx0ZXIuc2VuZCBpcyBmYWxzZVxuICAgICAgICAgIHNlbGYuZmlsdGVyLnNlbmQgPSAnJ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgc2VsZi5maWx0ZXIuc2VuZCA9IGZhbHNlXG4gICAgfVxuICAgICQoJyNmaWx0ZXJBcnJpdmVkJykuY2hlY2tib3gge1xuICAgICAgb25DaGFuZ2U6ICgpIC0+XG4gICAgICAgIGlmIHNlbGYuZmlsdGVyLmFycml2ZWQgaXMgZmFsc2VcbiAgICAgICAgICBzZWxmLmZpbHRlci5hcnJpdmVkID0gJydcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHNlbGYuZmlsdGVyLmFycml2ZWQgPSBmYWxzZVxuICAgIH1cbiAgY29tcG9uZW50czpcbiAgICBub3RpY2U6IHJlcXVpcmUgJy4uL3RwbC9ub3RpY2UudnVlJ1xufVxuXG5sb2dpblRwbCA9IHJlcXVpcmUoJy4uL3RwbC9sb2dpbi5qYWRlJykoKVxubG9naW4gPSBWdWUuZXh0ZW5kIHtcbiAgdGVtcGxhdGU6IGxvZ2luVHBsXG4gIGRhdGE6ICgpIC0+XG4gICAgcmV0dXJuIHtcbiAgICAgIGxvZ2luRXJyb3I6IGZhbHNlLFxuICAgICAgZW1haWw6ICcnLFxuICAgICAgcGFzc3dvcmQ6ICcnXG4gICAgfVxuICBtZXRob2RzOlxuICAgIGxvZ2luOiAoKSAtPlxuICAgICAgaWYgIXRoaXMuZW1haWwgb3IgIXRoaXMucGFzc3dvcmRcbiAgICAgICAgdGhpcy5sb2dpbkVycm9yID0gdHJ1ZVxuICAgICAgICByZXR1cm5cbiAgICAgIGNhbGxiYWNrID0gKGVyciwgZGF0YSkgLT5cbiAgICAgICAgaWYgZXJyIGlzIG51bGxcbiAgICAgICAgICByb3V0ZXIucmVwbGFjZSgnLycpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBzZWxmLmxvZ2luRXJyb3IgPSB0cnVlXG4gICAgICBzZWxmID0gdGhpc1xuICAgICAgcmVmLmF1dGhXaXRoUGFzc3dvcmQge1xuICAgICAgICAjOTA3MjE5OTAwQHFxLmNvbVxuICAgICAgICBlbWFpbDogc2VsZi5lbWFpbFxuICAgICAgICAjNE5BNUFIVURLUDlvXG4gICAgICAgIHBhc3N3b3JkOiBzZWxmLnBhc3N3b3JkXG4gICAgICAgIH0gLCBjYWxsYmFja1xuICBjcmVhdGVkOiAoKSAtPlxuICAgIGJ6SW5zdGFuY2UuYXV0aCgpXG59XG5yb3V0ZXIubWFwIHtcbiAgJy8nOlxuICAgIGNvbXBvbmVudDogbWFpblxuXG4gICcvYXV0aCc6XG4gICAgY29tcG9uZW50OiBsb2dpblxufVxuQXBwID0gVnVlLmV4dGVuZCB7fVxucm91dGVyLnN0YXJ0KEFwcCwgJyNhcHAnKVxuIiwidmFyIGphZGUgPSByZXF1aXJlKFwiamFkZS9ydW50aW1lXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG5cbmJ1Zi5wdXNoKFwiPHN0eWxlPmJvZHkge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjREFEQURBO1xcbn1cXG5ib2R5ID4gLmdyaWQge1xcbiAgICBoZWlnaHQ6IDEwMCU7XFxufVxcbi5jb2x1bW4ge1xcbiAgICBtYXgtd2lkdGg6IDQ1MHB4O1xcbn08L3N0eWxlPjxkaXYgY2xhc3M9XFxcInVpIG1pZGRsZSBhbGlnbmVkIGNlbnRlciBhbGlnbmVkIGdyaWRcXFwiPjxkaXYgY2xhc3M9XFxcImNvbHVtblxcXCI+PGgyIGNsYXNzPVxcXCJ1aSB0ZWFsIGhlYWRlclxcXCI+PGRpdiBjbGFzcz1cXFwiY29udGVudFxcXCI+6aqM6K+B5L2g55qE6Lqr5Lu9PC9kaXY+PC9oMj48Zm9ybSB2LWJpbmQ6Y2xhc3M9XFxcInsnZXJyb3InOiBsb2dpbkVycm9yfVxcXCIgY2xhc3M9XFxcInVpIGxhcmdlIGZvcm1cXFwiPjxkaXYgY2xhc3M9XFxcInVpIHN0YWNrZWQgc2VnbWVudFxcXCI+PGRpdiBjbGFzcz1cXFwiZmllbGRcXFwiPjxkaXYgY2xhc3M9XFxcInVpIGxlZnQgaWNvbiBpbnB1dFxcXCI+PGRpdiBjbGFzcz1cXFwidXNlciBpY29uXFxcIj48L2Rpdj48aW5wdXQgdHlwZT1cXFwidGV4dFxcXCIgcGxhY2Vob2xkZXI9XFxcIumCrueusVxcXCIgdi1tb2RlbD1cXFwiZW1haWxcXFwiLz48L2Rpdj48L2Rpdj48ZGl2IGNsYXNzPVxcXCJmaWVsZFxcXCI+PGRpdiBjbGFzcz1cXFwidWkgbGVmdCBpY29uIGlucHV0XFxcIj48ZGl2IGNsYXNzPVxcXCJsb2NrIGljb25cXFwiPjwvZGl2PjxpbnB1dCB0eXBlPVxcXCJwYXNzd29yZFxcXCIgcGxhY2Vob2xkZXI9XFxcIuWvhueggVxcXCIgdi1tb2RlbD1cXFwicGFzc3dvcmRcXFwiLz48L2Rpdj48L2Rpdj48ZGl2IHYtb246Y2xpY2s9XFxcImxvZ2luXFxcIiBjbGFzcz1cXFwidWkgZmx1aWQgbGFyZ2UgdGVhbCBzdWJtaXQgYnV0dG9uXFxcIj7nmbvlvZU8L2Rpdj48L2Rpdj48ZGl2IGNsYXNzPVxcXCJ1aSBlcnJvciBtZXNzYWdlXFxcIj7otKblj7fmiJblr4bnoIHmnInor688L2Rpdj48L2Zvcm0+PC9kaXY+PC9kaXY+XCIpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuXG5idWYucHVzaChcIjxkaXYgdi1vbjpjbGljaz1cXFwibWVzc2FnZUNsb3NlXFxcIiB2LWJpbmQ6Y2xhc3M9XFxcInsncG9zaXRpdmUnOiBtc2cuc3RhdHVzID09IDEsICduZWdhdGl2ZSc6IG1zZy5zdGF0dXMgPT0gMCwgJ3RyYW5zaXRpb24nOiB0cnVlLCAnaGlkZGVuJzogdHJ1ZX1cXFwiIGNsYXNzPVxcXCJ1aSBjb21wYWN0IG1lc3NhZ2UgYnotbWVzc2FnZVxcXCI+PGkgY2xhc3M9XFxcImNsb3NlIGljb25cXFwiPjwvaT48cCB2LWlmPVxcXCJtc2cuc3RhdHVzID09IDBcXFwiPnt7bXNnLnRleHR9fe+8gTwvcD48cCB2LWlmPVxcXCJtc2cuc3RhdHVzID09IDFcXFwiPuefreS/oeWPkemAgeaIkOWKn++8gTwvcD48cCB2LWlmPVxcXCJtc2cuc3RhdHVzID09IDJcXFwiPue9kee7nOmUmeivr++8jOivt+eojeWQjuWGjeivle+8gTwvcD48L2Rpdj48ZGl2IGNsYXNzPVxcXCJ1aSBjb250YWluZXJcXFwiPjxoZWFkZXI+PGRpdiBjbGFzcz1cXFwidWkgZ3JpZFxcXCI+PGRpdiBjbGFzcz1cXFwidHdlbHZlIHdpZGUgY29sdW1uXFxcIj48aDEgY2xhc3M9XFxcInVpIGhlYWRlclxcXCI+IDxpIGNsYXNzPVxcXCJkb2N0b3IgaWNvblxcXCI+PC9pPueZvuW/oOeJmeenkTwvaDE+PC9kaXY+PGRpdiBjbGFzcz1cXFwiZm91ciB3aWRlIGNvbHVtblxcXCI+PGRpdiB2LW9uOmNsaWNrPVxcXCJsb2dvdXRcXFwiIGRhdGEtY29udGVudD1cXFwi55m75Ye6XFxcIiBjbGFzcz1cXFwidWkgaWNvbiBidXR0b24gYnotbG9nb3V0XFxcIj48aSBjbGFzcz1cXFwic2lnbiBvdXQgaWNvblxcXCI+PC9pPjwvZGl2PjxkaXYgdi1vbjpjbGljaz1cXFwibm90aWNlQ3RybFxcXCIgZGF0YS1jb250ZW50PVxcXCLmtojmga9cXFwiIGNsYXNzPVxcXCJ1aSBpY29uIGJ1dHRvbiBiei1ub3RpY2UtYnRuXFxcIj48aSBjbGFzcz1cXFwiYW5ub3VuY2VtZW50IGljb25cXFwiPjwvaT48L2Rpdj48L2Rpdj48L2Rpdj48L2hlYWRlcj48ZGl2IGNsYXNzPVxcXCJ1aSBncmVlbiBsYWJlbCBzbXMtY291bnRcXFwiPuWPr+eUqOefreS/oTxkaXYgY2xhc3M9XFxcImRldGFpbFxcXCI+e3tpbmZvLnNtc319PC9kaXY+PC9kaXY+PG5vdGljZT48L25vdGljZT48ZGl2IGNsYXNzPVxcXCJzZWN0aW9uXFxcIj48aDMgY2xhc3M9XFxcInVpIGRpdmlkaW5nIGhlYWRlclxcXCI+5paw5aKe5a6i5oi36LWE5paZPC9oMz48ZGl2IHYtYmluZDpjbGFzcz1cXFwieydlcnJvcic6ICF2YWxpZGF0ZX1cXFwiIGNsYXNzPVxcXCJ1aSBmb3JtXFxcIj48ZGl2IGNsYXNzPVxcXCJ0d28gZmllbGRzXFxcIj48ZGl2IGNsYXNzPVxcXCJmaWVsZFxcXCI+PGxhYmVsPuWnk+WQjTwvbGFiZWw+PGlucHV0IHR5cGU9XFxcInRleHRcXFwiIHYtbW9kZWw9XFxcImZvcm0ubmFtZVxcXCIvPjwvZGl2PjxkaXYgY2xhc3M9XFxcImZpZWxkXFxcIj48bGFiZWw+55S16K+dPC9sYWJlbD48aW5wdXQgdHlwZT1cXFwidGV4dFxcXCIgdi1tb2RlbD1cXFwiZm9ybS50ZWxcXFwiLz48L2Rpdj48L2Rpdj48ZGl2IGNsYXNzPVxcXCJmaWVsZFxcXCI+PGxhYmVsPuWkh+azqDwvbGFiZWw+PHRleHRhcmVhIHJvd3M9XFxcIjJcXFwiIHYtbW9kZWw9XFxcImZvcm0uZGVzY1xcXCI+PC90ZXh0YXJlYT48L2Rpdj48ZGl2IHYtb246Y2xpY2s9XFxcInN1Ym1pdFxcXCIgdi1iaW5kOmNsYXNzPVxcXCJ7J2Rpc2FibGVkJzohdmFsaWRhdGV9XFxcIiBjbGFzcz1cXFwiYnV0dG9uIHVpIGJsdWUgYnV0dG9uXFxcIj7mj5DkuqQ8L2Rpdj48ZGl2IGNsYXNzPVxcXCJ1aSBlcnJvciBtZXNzYWdlXFxcIj48dWwgY2xhc3M9XFxcImxpc3RcXFwiPjxsaSB2LWlmPVxcXCIhZm9ybS5uYW1lXFxcIj7or7fovpPlhaXlp5PlkI08L2xpPjxsaSB2LWlmPVxcXCIhZm9ybS50ZWxcXFwiPuivt+i+k+WFpeaJi+acuuWPt+eggTwvbGk+PGxpIHYtaWY9XFxcIiFpc1RlbCAmYW1wOyZhbXA7IGZvcm0udGVsXFxcIj7kvaDovpPlhaXnmoTmiYvmnLrlj7fnoIHmnInor688L2xpPjwvdWw+PC9kaXY+PC9kaXY+PC9kaXY+PGRpdiBjbGFzcz1cXFwic2VjdGlvblxcXCI+PGgzIGNsYXNzPVxcXCJ1aSBkaXZpZGluZyBoZWFkZXJcXFwiPuWuouaIt+WIl+ihqDwvaDM+PGRpdiBjbGFzcz1cXFwidGFibGUtY29udHJvbFxcXCI+PGRpdiBjbGFzcz1cXFwidWkgbGVmdCBpY29uIGlucHV0IHVzZXItc2VhcmNoXFxcIj48aW5wdXQgdHlwZT1cXFwidGV4dFxcXCIgcGxhY2Vob2xkZXI9XFxcIuaQnOe0ouWnk+WQjeaIluaJi+acuuWPt+eggS4uLlxcXCIgdi1tb2RlbD1cXFwic2VhcmNoXFxcIiB2LW9uOmlucHV0PVxcXCJzZWFyY2hMaWtlXFxcIiB2LW9uOmJsdXI9XFxcInNlYXJjaCA9ICcnXFxcIi8+PGkgY2xhc3M9XFxcInVzZXJzIGljb25cXFwiPjwvaT48L2Rpdj48YnV0dG9uIHYtb246Y2xpY2s9XFxcInNvcnRMaXN0XFxcIiBkYXRhLWNvbnRlbnQ9XFxcIuaOkuW6j1xcXCIgY2xhc3M9XFxcInVpIGljb24gYnV0dG9uIHNvcnQtYnV0dG9uXFxcIj48aSB2LXNob3c9XFxcInNvcnQgPT0gMVxcXCIgY2xhc3M9XFxcInNvcnQgbnVtZXJpYyBhc2NlbmRpbmcgaWNvblxcXCI+PC9pPjxpIHYtc2hvdz1cXFwic29ydCA9PSAtMVxcXCIgY2xhc3M9XFxcInNvcnQgbnVtZXJpYyBkZXNjZW5kaW5nIGljb25cXFwiPjwvaT48L2J1dHRvbj48ZGl2IGlkPVxcXCJmaWx0ZXJTZW5kXFxcIiBjbGFzcz1cXFwidWkgY2hlY2tib3hcXFwiPjxpbnB1dCB0eXBlPVxcXCJjaGVja2JveFxcXCIgbmFtZT1cXFwic2VuZFxcXCIgdGFiaW5kZXg9XFxcIjBcXFwiIGNsYXNzPVxcXCJoaWRkZW5cXFwiLz48bGFiZWw+5pyq6YCa55+lPC9sYWJlbD48L2Rpdj48ZGl2IGlkPVxcXCJmaWx0ZXJBcnJpdmVkXFxcIiBjbGFzcz1cXFwidWkgY2hlY2tib3hcXFwiPjxpbnB1dCB0eXBlPVxcXCJjaGVja2JveFxcXCIgbmFtZT1cXFwiYXJyaXZlZFxcXCIgdGFiaW5kZXg9XFxcIjBcXFwiIGNsYXNzPVxcXCJoaWRkZW5cXFwiLz48bGFiZWw+5pyq5Yiw6K+KPC9sYWJlbD48L2Rpdj48L2Rpdj48dGFibGUgY2xhc3M9XFxcInVpIHZlcnkgYmFzaWMgcmlnaHQgYWxpZ25lZCB0YWJsZSB1c2VyLWxpc3RcXFwiPjx0aGVhZD48dHI+PHRoPiA8c3BhbiBjbGFzcz1cXFwiZGF0ZS10YWdzXFxcIj7nmbvorrAv5p2l6K6/PC9zcGFuPjwvdGg+PHRoPuWnk+WQjTwvdGg+PHRoPueUteivnTwvdGg+PHRoPuWkh+azqDwvdGg+PHRoPue8lui+kTwvdGg+PHRoPuWKn+iDvTwvdGg+PHRoPumAmuefpTwvdGg+PHRoPuWIsOivijwvdGg+PC90cj48L3RoZWFkPjx0Ym9keT48dHIgdi1mb3I9XFxcIml0ZW0gaW4gbGlzdCB8IG9yZGVyQnkgJ3Zpc2l0RGF0ZScgc29ydCB8IGZpbHRlckJ5IGZpbHRlci5zZW5kIGluICdzZW50JyB8IGZpbHRlckJ5IGZpbHRlci5hcnJpdmVkIGluICdhcnJpdmUnIHwgbGltaXRCeSBwYWdlcyAwXFxcIiB2LWJpbmQ6Y2xhc3M9XFxcInsncG9zaXRpdmUnOml0ZW0ubmFtZSA9PSBzZWFyY2ggfHwgaXRlbS50ZWwgPT0gc2VhcmNofVxcXCI+PHRkPiA8ZGl2IGNsYXNzPVxcXCJkYXRlLXRhZ3NcXFwiPnt7aXRlbS5kYXRlfX08L2Rpdj48ZGl2IHYtc2hvdz1cXFwiIWl0ZW0uZWRpdGFibGVcXFwiPnt7aXRlbS52aXNpdERhdGV9fTwvZGl2PjxkaXYgdi1zaG93PVxcXCJpdGVtLmVkaXRhYmxlXFxcIiBjbGFzcz1cXFwidWkgaW5wdXRcXFwiPjxpbnB1dCB0eXBlPVxcXCJ0ZXh0XFxcIiB2LW1vZGVsPVxcXCJpdGVtLnZpc2l0RGF0ZVxcXCIvPjwvZGl2PjwvdGQ+PHRkPjxkaXYgdi1zaG93PVxcXCJpdGVtLmVkaXRhYmxlXFxcIiBjbGFzcz1cXFwidWkgaW5wdXRcXFwiPjxpbnB1dCB0eXBlPVxcXCJ0ZXh0XFxcIiB2LW1vZGVsPVxcXCJpdGVtLm5hbWVcXFwiLz48L2Rpdj48ZGl2IHYtc2hvdz1cXFwiIWl0ZW0uZWRpdGFibGVcXFwiPnt7aXRlbS5uYW1lfX08L2Rpdj48L3RkPjx0ZD48ZGl2IHYtc2hvdz1cXFwiaXRlbS5lZGl0YWJsZVxcXCIgY2xhc3M9XFxcInVpIGlucHV0XFxcIj48aW5wdXQgdHlwZT1cXFwidGV4dFxcXCIgdi1tb2RlbD1cXFwiaXRlbS50ZWxcXFwiLz48L2Rpdj48ZGl2IHYtc2hvdz1cXFwiIWl0ZW0uZWRpdGFibGVcXFwiPjxzcGFuIHYtc2hvdz1cXFwiIWl0ZW0udGVsQ2xvbmUgfHwgIXNlYXJjaGluZ1xcXCI+e3tpdGVtLnRlbH19PC9zcGFuPjxkaXYgdi1odG1sPVxcXCJpdGVtLnRlbENsb25lXFxcIiB2LXNob3c9XFxcIml0ZW0udGVsQ2xvbmUgJmFtcDsmYW1wOyBzZWFyY2hpbmdcXFwiPjwvZGl2PjwvZGl2PjwvdGQ+PHRkPjxkaXYgdi1zaG93PVxcXCIhaXRlbS5lZGl0YWJsZVxcXCI+PHRlbXBsYXRlIHYtaWY9XFxcIiFpdGVtLmRlc2NcXFwiPi4uLjwvdGVtcGxhdGU+PHRlbXBsYXRlIHYtZWxzZT1cXFwidi1lbHNlXFxcIj57e2l0ZW0uZGVzY319PC90ZW1wbGF0ZT48L2Rpdj48ZGl2IHYtc2hvdz1cXFwiaXRlbS5lZGl0YWJsZVxcXCIgY2xhc3M9XFxcInVpIGZvcm1cXFwiPjxkaXYgY2xhc3M9XFxcImZpZWxkXFxcIj48dGV4dGFyZWEgcm93cz1cXFwiMlxcXCIgdi1tb2RlbD1cXFwiaXRlbS5kZXNjXFxcIj48L3RleHRhcmVhPjwvZGl2PjwvZGl2PjwvdGQ+PHRkPjxkaXYgY2xhc3M9XFxcInVpIGljb24gYm90dG9tIGxlZnQgcG9pbnRpbmcgZHJvcGRvd24gYnV0dG9uXFxcIj48aSBjbGFzcz1cXFwid3JpdGUgaWNvblxcXCI+PC9pPjxkaXYgY2xhc3M9XFxcIm1lbnVcXFwiPjxkaXYgdi1vbjpjbGljaz1cXFwiZGVsKCRrZXkpXFxcIiBjbGFzcz1cXFwiaXRlbVxcXCI+IDxpIGNsYXNzPVxcXCJyZW1vdmUgaWNvblxcXCI+PC9pPjxzcGFuIGNsYXNzPVxcXCJ0ZXh0XFxcIj7liKDpmaQ8L3NwYW4+PC9kaXY+PGRpdiB2LW9uOmNsaWNrPVxcXCJtb2RpZnkoaXRlbSwgJGtleSlcXFwiIGNsYXNzPVxcXCJpdGVtXFxcIj48aSBjbGFzcz1cXFwiZWRpdCBpY29uXFxcIj48L2k+PHNwYW4gdi1pZj1cXFwiIWl0ZW0uZWRpdGFibGVcXFwiIGNsYXNzPVxcXCJ0ZXh0XFxcIj7kv67mlLk8L3NwYW4+PHNwYW4gdi1lbHNlPVxcXCJ2LWVsc2VcXFwiIGNsYXNzPVxcXCJ0ZXh0XFxcIj7kv53lrZg8L3NwYW4+PC9kaXY+PC9kaXY+PC9kaXY+PC90ZD48dGQ+PGRpdiBjbGFzcz1cXFwidWkgaWNvbiBib3R0b20gbGVmdCBwb2ludGluZyBkcm9wZG93biBidXR0b25cXFwiPjxpIGNsYXNzPVxcXCJ3cmVuY2ggaWNvblxcXCI+PC9pPjxkaXYgY2xhc3M9XFxcIm1lbnVcXFwiPjxkaXYgdi1vbjpjbGljaz1cXFwic21zKGl0ZW0sICRrZXkpXFxcIiBjbGFzcz1cXFwiaXRlbVxcXCI+PGkgY2xhc3M9XFxcIm1haWwgb3V0bGluZSBpY29uXFxcIj48L2k+PHNwYW4gY2xhc3M9XFxcInRleHRcXFwiPuefreS/oTwvc3Bhbj48L2Rpdj48ZGl2IHYtb246Y2xpY2s9XFxcImF0dGVuZGFuY2UoaXRlbSwgJGtleSwgJGV2ZW50KVxcXCIgY2xhc3M9XFxcIml0ZW1cXFwiPjxpIGNsYXNzPVxcXCJmbGFnIGljb25cXFwiPjwvaT48c3BhbiBjbGFzcz1cXFwidGV4dFxcXCI+5Yiw6K+KPC9zcGFuPjwvZGl2PjwvZGl2PjwvZGl2PjwvdGQ+PHRkPjxpIHYtaWY9XFxcIml0ZW0uc2VudFxcXCIgY2xhc3M9XFxcImNoZWNrbWFyayBncmVlbiBpY29uXFxcIj48L2k+PGkgdi1lbHNlPVxcXCJ2LWVsc2VcXFwiIGNsYXNzPVxcXCJyZW1vdmUgcmVkIGljb25cXFwiPjwvaT48L3RkPjx0ZD48aSB2LWlmPVxcXCJpdGVtLmFycml2ZVxcXCIgY2xhc3M9XFxcImNoZWNrbWFyayBncmVlbiBpY29uXFxcIj48L2k+PGkgdi1lbHNlPVxcXCJ2LWVsc2VcXFwiIGNsYXNzPVxcXCJyZW1vdmUgcmVkIGljb25cXFwiPjwvaT48L3RkPjwvdHI+PC90Ym9keT48dGZvb3Q+PHRyPjx0aCBjb2xzcGFuPVxcXCI4XFxcIj48ZGl2IGNsYXNzPVxcXCJ1aSByaWdodCBmbG9hdGVkIHBhZ2luYXRpb24gbWVudVxcXCI+PGEgY2xhc3M9XFxcIml0ZW0gaWNvblxcXCI+PGkgY2xhc3M9XFxcImxlZnQgY2hldnJvbiBpY29uXFxcIj48L2k+PC9hPjxhIGNsYXNzPVxcXCJpdGVtXFxcIj4xPC9hPjxhIGNsYXNzPVxcXCJpdGVtIGFjdGl2ZVxcXCI+MjwvYT48YSBjbGFzcz1cXFwiaXRlbVxcXCI+MzwvYT48YSBjbGFzcz1cXFwiaXRlbVxcXCI+NDwvYT48YSBjbGFzcz1cXFwiaXRlbVxcXCI+NTwvYT48YSBjbGFzcz1cXFwiaXRlbSBpY29uXFxcIj48aSBjbGFzcz1cXFwicmlnaHQgY2hldnJvbiBpY29uXFxcIj48L2k+PC9hPjwvZGl2PjwvdGg+PC90cj48L3Rmb290PjwvdGFibGU+PC9kaXY+PGRpdiBjbGFzcz1cXFwidWkgc21hbGwgYmFzaWMgbW9kYWxcXFwiPjxkaXYgY2xhc3M9XFxcInVpIGljb24gaGVhZGVyXFxcIj48aSBjbGFzcz1cXFwiYXJjaGl2ZSBpY29uXFxcIj48L2k+5Yig6Zmk5pWw5o2u77yfPC9kaXY+PGRpdiBjbGFzcz1cXFwiY29udGVudFxcXCI+PHA+5pWw5o2u5Yig6Zmk5LiN5Y+v5oGi5aSN77yM5piv5ZCm6KaB5Yig6Zmk5pys5p2h5pWw5o2u77yfPC9wPjwvZGl2PjxkaXYgY2xhc3M9XFxcImFjdGlvbnNcXFwiPjxkaXYgY2xhc3M9XFxcInVpIHJlZCBiYXNpYyBjYW5jZWwgaW52ZXJ0ZWQgYnV0dG9uXFxcIj48aSBjbGFzcz1cXFwicmVtb3ZlIGljb25cXFwiPjwvaT5ObzwvZGl2PjxkaXYgdi1vbjpjbGljaz1cXFwiY29uZmlybVxcXCIgY2xhc3M9XFxcInVpIGdyZWVuIG9rIGludmVydGVkIGJ1dHRvblxcXCI+PGkgY2xhc3M9XFxcImNoZWNrbWFyayBpY29uXFxcIj48L2k+WWVzPC9kaXY+PC9kaXY+PC9kaXY+PC9kaXY+XCIpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBfX3Z1ZV90ZW1wbGF0ZV9fID0gXCI8ZGl2IHYtYmluZDpjbGFzcz1cXFwieydoaWRkZW4nOiBpc1Nob3cgPT0gMH1cXFwiIGNsYXNzPVxcXCJ1aSBpY29uIG1lc3NhZ2UgdHJhbnRpc29uIHVwZGF0ZS1tZXNzYWdlXFxcIj48aSBjbGFzcz1cXFwiY2xvc2UgaWNvblxcXCI+PC9pPjxkaXYgY2xhc3M9XFxcImNvbnRlbnRcXFwiPjxkaXYgY2xhc3M9XFxcImhlYWRlclxcXCI+5pu05paw5ZWm77yB77yB77yBPC9kaXY+PGRpdiBjbGFzcz1cXFwidWkgbGlzdFxcXCI+PGRpdiBjbGFzcz1cXFwiaXRlbVxcXCI+PGRpdiBjbGFzcz1cXFwiaGVhZGVyXFxcIj4yMDE15bm0MTHmnIgzMOaXpTwvZGl2PuS/ruWkjeaXoOazlei/nue7reWPkeS/oeaBr2J1Z+OAgjwvZGl2PjxkaXYgY2xhc3M9XFxcIml0ZW1cXFwiPuWinuWKoDxkaXYgY2xhc3M9XFxcInVpIG1pbmkgbGFiZWxcXFwiPuaOkuW6jzwvZGl2PuaMiemSrjwvZGl2PjxkaXYgY2xhc3M9XFxcIml0ZW1cXFwiPuWinuWKoDxkaXYgY2xhc3M9XFxcInVpIG1pbmkgbGFiZWxcXFwiPui/h+a7pDwvZGl2PjwvZGl2PjxkaXYgY2xhc3M9XFxcIml0ZW1cXFwiPjxkaXYgY2xhc3M9XFxcImhlYWRlclxcXCI+MjAxNeW5tDEx5pyIMTPml6U8L2Rpdj7miYvmnLrlj7fmlK/mjIHmqKHns4rmkJzntKLvvIzovpPlhaXkuInkvY3ku6XkuIrmlbDlrZfjgIJlLmcuPHNwYW4gY2xhc3M9XFxcIml0YWxpY1xcXCI+MDQ1Mjwvc3Bhbj4sPHNwYW4gY2xhc3M9XFxcIml0YWxpY1xcXCI+MTM3PC9zcGFuPjwvZGl2PjxkaXYgY2xhc3M9XFxcIml0ZW1cXFwiPuabtOaWsOmAmuefpeWPquS8muWcqOesrOS4gOasoeiuv+mXruaXtuaYvuekuu+8jOWmgumcgOafpeeci+ivt+eCueWPs+S4iuinkjxkaXYgY2xhc3M9XFxcInVpIG1pbmkgbGFiZWxcXFwiPumAmuefpTwvZGl2PuaMiemSrjwvZGl2PjxkaXYgY2xhc3M9XFxcIml0ZW1cXFwiPueCueWHu+WPkemAgeefreS/oeWQju+8jOWPs+S4iuS8muaYvuekuuWPkemAgeeKtuaAgeOAgjwvZGl2PjxkaXYgY2xhc3M9XFxcIml0ZW1cXFwiPjxkaXYgY2xhc3M9XFxcImhlYWRlclxcXCI+MjAxNeW5tDEx5pyIMTLml6U8L2Rpdj7mlrDlop7mnaXorr/ml6XmnJ/vvIzpu5jorqTkuLrnmbvorrDml6XmnJ/vvIzlpoLpnIDmm7TmlLnor7fngrk8ZGl2IGNsYXNzPVxcXCJ1aSBtaW5pIGxhYmVsXFxcIj7nvJbovpE8L2Rpdj4tPGRpdiBjbGFzcz1cXFwidWkgbWluaSBsYWJlbFxcXCI+5L+u5pS5PC9kaXY+44CCPC9kaXY+PGRpdiBjbGFzcz1cXFwiaXRlbVxcXCI+5paw5aKe5pCc57Si5Yqf6IO977yM5pqC5pe25Y+q5pSv5oyB5Lil5qC85Yy56YWNKOWFqOWQjeaIluWujOaVtOeahOaJi+acuuWPtynjgIJlLmcuPHNwYW4gY2xhc3M9XFxcIml0YWxpY1xcXCI+546L5aSn6ZSkPC9zcGFuPiw8c3BhbiBjbGFzcz1cXFwiaXRhbGljXFxcIj4xMzgwNDUyODg4ODwvc3Bhbj48L2Rpdj48L2Rpdj48L2Rpdj48L2Rpdj5cIjtcbm1vZHVsZS5leHBvcnRzID0ge1xuICBkYXRhOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaXNTaG93OiAxXG4gICAgfTtcbiAgfSxcbiAgZXZlbnRzOiB7XG4gICAgdG9nZ2xlOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuaXNTaG93ID0gIXRoaXMuaXNTaG93O1xuICAgIH1cbiAgfSxcbiAgcmVhZHk6IGZ1bmN0aW9uKCkge1xuICAgIGlmICgkLmNvb2tpZSgnbm90aWNlJykpIHtcbiAgICAgIHRoaXMuaXNTaG93ID0gcGFyc2VJbnQoJC5jb29raWUoJ25vdGljZScpLCAxMCk7XG4gICAgfVxuICAgICQodGhpcy4kZWwpLmZpbmQoJy5jbG9zZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgJCh0aGlzKS5jbG9zZXN0KCcubWVzc2FnZScpLnRyYW5zaXRpb24oJ2ZhZGUnKTtcbiAgICAgIHJldHVybiAkLmNvb2tpZSgnbm90aWNlJywgMCk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXMuJG9uKCd0b2dnbGVOb3RpY2UnLCBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuJGVtaXQoJ3RvZ2dsZScpO1xuICAgIH0pO1xuICB9XG59O1xuXG47KHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gXCJmdW5jdGlvblwiPyBtb2R1bGUuZXhwb3J0cy5vcHRpb25zOiBtb2R1bGUuZXhwb3J0cykudGVtcGxhdGUgPSBfX3Z1ZV90ZW1wbGF0ZV9fO1xuIiwiIiwiKGZ1bmN0aW9uKGYpe2lmKHR5cGVvZiBleHBvcnRzPT09XCJvYmplY3RcIiYmdHlwZW9mIG1vZHVsZSE9PVwidW5kZWZpbmVkXCIpe21vZHVsZS5leHBvcnRzPWYoKX1lbHNlIGlmKHR5cGVvZiBkZWZpbmU9PT1cImZ1bmN0aW9uXCImJmRlZmluZS5hbWQpe2RlZmluZShbXSxmKX1lbHNle3ZhciBnO2lmKHR5cGVvZiB3aW5kb3chPT1cInVuZGVmaW5lZFwiKXtnPXdpbmRvd31lbHNlIGlmKHR5cGVvZiBnbG9iYWwhPT1cInVuZGVmaW5lZFwiKXtnPWdsb2JhbH1lbHNlIGlmKHR5cGVvZiBzZWxmIT09XCJ1bmRlZmluZWRcIil7Zz1zZWxmfWVsc2V7Zz10aGlzfWcuamFkZSA9IGYoKX19KShmdW5jdGlvbigpe3ZhciBkZWZpbmUsbW9kdWxlLGV4cG9ydHM7cmV0dXJuIChmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pKHsxOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBNZXJnZSB0d28gYXR0cmlidXRlIG9iamVjdHMgZ2l2aW5nIHByZWNlZGVuY2VcbiAqIHRvIHZhbHVlcyBpbiBvYmplY3QgYGJgLiBDbGFzc2VzIGFyZSBzcGVjaWFsLWNhc2VkXG4gKiBhbGxvd2luZyBmb3IgYXJyYXlzIGFuZCBtZXJnaW5nL2pvaW5pbmcgYXBwcm9wcmlhdGVseVxuICogcmVzdWx0aW5nIGluIGEgc3RyaW5nLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBhXG4gKiBAcGFyYW0ge09iamVjdH0gYlxuICogQHJldHVybiB7T2JqZWN0fSBhXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5leHBvcnRzLm1lcmdlID0gZnVuY3Rpb24gbWVyZ2UoYSwgYikge1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgIHZhciBhdHRycyA9IGFbMF07XG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhdHRycyA9IG1lcmdlKGF0dHJzLCBhW2ldKTtcbiAgICB9XG4gICAgcmV0dXJuIGF0dHJzO1xuICB9XG4gIHZhciBhYyA9IGFbJ2NsYXNzJ107XG4gIHZhciBiYyA9IGJbJ2NsYXNzJ107XG5cbiAgaWYgKGFjIHx8IGJjKSB7XG4gICAgYWMgPSBhYyB8fCBbXTtcbiAgICBiYyA9IGJjIHx8IFtdO1xuICAgIGlmICghQXJyYXkuaXNBcnJheShhYykpIGFjID0gW2FjXTtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoYmMpKSBiYyA9IFtiY107XG4gICAgYVsnY2xhc3MnXSA9IGFjLmNvbmNhdChiYykuZmlsdGVyKG51bGxzKTtcbiAgfVxuXG4gIGZvciAodmFyIGtleSBpbiBiKSB7XG4gICAgaWYgKGtleSAhPSAnY2xhc3MnKSB7XG4gICAgICBhW2tleV0gPSBiW2tleV07XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGE7XG59O1xuXG4vKipcbiAqIEZpbHRlciBudWxsIGB2YWxgcy5cbiAqXG4gKiBAcGFyYW0geyp9IHZhbFxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIG51bGxzKHZhbCkge1xuICByZXR1cm4gdmFsICE9IG51bGwgJiYgdmFsICE9PSAnJztcbn1cblxuLyoqXG4gKiBqb2luIGFycmF5IGFzIGNsYXNzZXMuXG4gKlxuICogQHBhcmFtIHsqfSB2YWxcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuZXhwb3J0cy5qb2luQ2xhc3NlcyA9IGpvaW5DbGFzc2VzO1xuZnVuY3Rpb24gam9pbkNsYXNzZXModmFsKSB7XG4gIHJldHVybiAoQXJyYXkuaXNBcnJheSh2YWwpID8gdmFsLm1hcChqb2luQ2xhc3NlcykgOlxuICAgICh2YWwgJiYgdHlwZW9mIHZhbCA9PT0gJ29iamVjdCcpID8gT2JqZWN0LmtleXModmFsKS5maWx0ZXIoZnVuY3Rpb24gKGtleSkgeyByZXR1cm4gdmFsW2tleV07IH0pIDpcbiAgICBbdmFsXSkuZmlsdGVyKG51bGxzKS5qb2luKCcgJyk7XG59XG5cbi8qKlxuICogUmVuZGVyIHRoZSBnaXZlbiBjbGFzc2VzLlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGNsYXNzZXNcbiAqIEBwYXJhbSB7QXJyYXkuPEJvb2xlYW4+fSBlc2NhcGVkXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmV4cG9ydHMuY2xzID0gZnVuY3Rpb24gY2xzKGNsYXNzZXMsIGVzY2FwZWQpIHtcbiAgdmFyIGJ1ZiA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGNsYXNzZXMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoZXNjYXBlZCAmJiBlc2NhcGVkW2ldKSB7XG4gICAgICBidWYucHVzaChleHBvcnRzLmVzY2FwZShqb2luQ2xhc3NlcyhbY2xhc3Nlc1tpXV0pKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJ1Zi5wdXNoKGpvaW5DbGFzc2VzKGNsYXNzZXNbaV0pKTtcbiAgICB9XG4gIH1cbiAgdmFyIHRleHQgPSBqb2luQ2xhc3NlcyhidWYpO1xuICBpZiAodGV4dC5sZW5ndGgpIHtcbiAgICByZXR1cm4gJyBjbGFzcz1cIicgKyB0ZXh0ICsgJ1wiJztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cbn07XG5cblxuZXhwb3J0cy5zdHlsZSA9IGZ1bmN0aW9uICh2YWwpIHtcbiAgaWYgKHZhbCAmJiB0eXBlb2YgdmFsID09PSAnb2JqZWN0Jykge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyh2YWwpLm1hcChmdW5jdGlvbiAoc3R5bGUpIHtcbiAgICAgIHJldHVybiBzdHlsZSArICc6JyArIHZhbFtzdHlsZV07XG4gICAgfSkuam9pbignOycpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB2YWw7XG4gIH1cbn07XG4vKipcbiAqIFJlbmRlciB0aGUgZ2l2ZW4gYXR0cmlidXRlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAqIEBwYXJhbSB7U3RyaW5nfSB2YWxcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gZXNjYXBlZFxuICogQHBhcmFtIHtCb29sZWFufSB0ZXJzZVxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5leHBvcnRzLmF0dHIgPSBmdW5jdGlvbiBhdHRyKGtleSwgdmFsLCBlc2NhcGVkLCB0ZXJzZSkge1xuICBpZiAoa2V5ID09PSAnc3R5bGUnKSB7XG4gICAgdmFsID0gZXhwb3J0cy5zdHlsZSh2YWwpO1xuICB9XG4gIGlmICgnYm9vbGVhbicgPT0gdHlwZW9mIHZhbCB8fCBudWxsID09IHZhbCkge1xuICAgIGlmICh2YWwpIHtcbiAgICAgIHJldHVybiAnICcgKyAodGVyc2UgPyBrZXkgOiBrZXkgKyAnPVwiJyArIGtleSArICdcIicpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuICB9IGVsc2UgaWYgKDAgPT0ga2V5LmluZGV4T2YoJ2RhdGEnKSAmJiAnc3RyaW5nJyAhPSB0eXBlb2YgdmFsKSB7XG4gICAgaWYgKEpTT04uc3RyaW5naWZ5KHZhbCkuaW5kZXhPZignJicpICE9PSAtMSkge1xuICAgICAgY29uc29sZS53YXJuKCdTaW5jZSBKYWRlIDIuMC4wLCBhbXBlcnNhbmRzIChgJmApIGluIGRhdGEgYXR0cmlidXRlcyAnICtcbiAgICAgICAgICAgICAgICAgICAnd2lsbCBiZSBlc2NhcGVkIHRvIGAmYW1wO2AnKTtcbiAgICB9O1xuICAgIGlmICh2YWwgJiYgdHlwZW9mIHZhbC50b0lTT1N0cmluZyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY29uc29sZS53YXJuKCdKYWRlIHdpbGwgZWxpbWluYXRlIHRoZSBkb3VibGUgcXVvdGVzIGFyb3VuZCBkYXRlcyBpbiAnICtcbiAgICAgICAgICAgICAgICAgICAnSVNPIGZvcm0gYWZ0ZXIgMi4wLjAnKTtcbiAgICB9XG4gICAgcmV0dXJuICcgJyArIGtleSArIFwiPSdcIiArIEpTT04uc3RyaW5naWZ5KHZhbCkucmVwbGFjZSgvJy9nLCAnJmFwb3M7JykgKyBcIidcIjtcbiAgfSBlbHNlIGlmIChlc2NhcGVkKSB7XG4gICAgaWYgKHZhbCAmJiB0eXBlb2YgdmFsLnRvSVNPU3RyaW5nID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ0phZGUgd2lsbCBzdHJpbmdpZnkgZGF0ZXMgaW4gSVNPIGZvcm0gYWZ0ZXIgMi4wLjAnKTtcbiAgICB9XG4gICAgcmV0dXJuICcgJyArIGtleSArICc9XCInICsgZXhwb3J0cy5lc2NhcGUodmFsKSArICdcIic7XG4gIH0gZWxzZSB7XG4gICAgaWYgKHZhbCAmJiB0eXBlb2YgdmFsLnRvSVNPU3RyaW5nID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ0phZGUgd2lsbCBzdHJpbmdpZnkgZGF0ZXMgaW4gSVNPIGZvcm0gYWZ0ZXIgMi4wLjAnKTtcbiAgICB9XG4gICAgcmV0dXJuICcgJyArIGtleSArICc9XCInICsgdmFsICsgJ1wiJztcbiAgfVxufTtcblxuLyoqXG4gKiBSZW5kZXIgdGhlIGdpdmVuIGF0dHJpYnV0ZXMgb2JqZWN0LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEBwYXJhbSB7T2JqZWN0fSBlc2NhcGVkXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmV4cG9ydHMuYXR0cnMgPSBmdW5jdGlvbiBhdHRycyhvYmosIHRlcnNlKXtcbiAgdmFyIGJ1ZiA9IFtdO1xuXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMob2JqKTtcblxuICBpZiAoa2V5cy5sZW5ndGgpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyArK2kpIHtcbiAgICAgIHZhciBrZXkgPSBrZXlzW2ldXG4gICAgICAgICwgdmFsID0gb2JqW2tleV07XG5cbiAgICAgIGlmICgnY2xhc3MnID09IGtleSkge1xuICAgICAgICBpZiAodmFsID0gam9pbkNsYXNzZXModmFsKSkge1xuICAgICAgICAgIGJ1Zi5wdXNoKCcgJyArIGtleSArICc9XCInICsgdmFsICsgJ1wiJyk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJ1Zi5wdXNoKGV4cG9ydHMuYXR0cihrZXksIHZhbCwgZmFsc2UsIHRlcnNlKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGJ1Zi5qb2luKCcnKTtcbn07XG5cbi8qKlxuICogRXNjYXBlIHRoZSBnaXZlbiBzdHJpbmcgb2YgYGh0bWxgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBodG1sXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG52YXIgamFkZV9lbmNvZGVfaHRtbF9ydWxlcyA9IHtcbiAgJyYnOiAnJmFtcDsnLFxuICAnPCc6ICcmbHQ7JyxcbiAgJz4nOiAnJmd0OycsXG4gICdcIic6ICcmcXVvdDsnXG59O1xudmFyIGphZGVfbWF0Y2hfaHRtbCA9IC9bJjw+XCJdL2c7XG5cbmZ1bmN0aW9uIGphZGVfZW5jb2RlX2NoYXIoYykge1xuICByZXR1cm4gamFkZV9lbmNvZGVfaHRtbF9ydWxlc1tjXSB8fCBjO1xufVxuXG5leHBvcnRzLmVzY2FwZSA9IGphZGVfZXNjYXBlO1xuZnVuY3Rpb24gamFkZV9lc2NhcGUoaHRtbCl7XG4gIHZhciByZXN1bHQgPSBTdHJpbmcoaHRtbCkucmVwbGFjZShqYWRlX21hdGNoX2h0bWwsIGphZGVfZW5jb2RlX2NoYXIpO1xuICBpZiAocmVzdWx0ID09PSAnJyArIGh0bWwpIHJldHVybiBodG1sO1xuICBlbHNlIHJldHVybiByZXN1bHQ7XG59O1xuXG4vKipcbiAqIFJlLXRocm93IHRoZSBnaXZlbiBgZXJyYCBpbiBjb250ZXh0IHRvIHRoZVxuICogdGhlIGphZGUgaW4gYGZpbGVuYW1lYCBhdCB0aGUgZ2l2ZW4gYGxpbmVub2AuXG4gKlxuICogQHBhcmFtIHtFcnJvcn0gZXJyXG4gKiBAcGFyYW0ge1N0cmluZ30gZmlsZW5hbWVcbiAqIEBwYXJhbSB7U3RyaW5nfSBsaW5lbm9cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmV4cG9ydHMucmV0aHJvdyA9IGZ1bmN0aW9uIHJldGhyb3coZXJyLCBmaWxlbmFtZSwgbGluZW5vLCBzdHIpe1xuICBpZiAoIShlcnIgaW5zdGFuY2VvZiBFcnJvcikpIHRocm93IGVycjtcbiAgaWYgKCh0eXBlb2Ygd2luZG93ICE9ICd1bmRlZmluZWQnIHx8ICFmaWxlbmFtZSkgJiYgIXN0cikge1xuICAgIGVyci5tZXNzYWdlICs9ICcgb24gbGluZSAnICsgbGluZW5vO1xuICAgIHRocm93IGVycjtcbiAgfVxuICB0cnkge1xuICAgIHN0ciA9IHN0ciB8fCByZXF1aXJlKCdmcycpLnJlYWRGaWxlU3luYyhmaWxlbmFtZSwgJ3V0ZjgnKVxuICB9IGNhdGNoIChleCkge1xuICAgIHJldGhyb3coZXJyLCBudWxsLCBsaW5lbm8pXG4gIH1cbiAgdmFyIGNvbnRleHQgPSAzXG4gICAgLCBsaW5lcyA9IHN0ci5zcGxpdCgnXFxuJylcbiAgICAsIHN0YXJ0ID0gTWF0aC5tYXgobGluZW5vIC0gY29udGV4dCwgMClcbiAgICAsIGVuZCA9IE1hdGgubWluKGxpbmVzLmxlbmd0aCwgbGluZW5vICsgY29udGV4dCk7XG5cbiAgLy8gRXJyb3IgY29udGV4dFxuICB2YXIgY29udGV4dCA9IGxpbmVzLnNsaWNlKHN0YXJ0LCBlbmQpLm1hcChmdW5jdGlvbihsaW5lLCBpKXtcbiAgICB2YXIgY3VyciA9IGkgKyBzdGFydCArIDE7XG4gICAgcmV0dXJuIChjdXJyID09IGxpbmVubyA/ICcgID4gJyA6ICcgICAgJylcbiAgICAgICsgY3VyclxuICAgICAgKyAnfCAnXG4gICAgICArIGxpbmU7XG4gIH0pLmpvaW4oJ1xcbicpO1xuXG4gIC8vIEFsdGVyIGV4Y2VwdGlvbiBtZXNzYWdlXG4gIGVyci5wYXRoID0gZmlsZW5hbWU7XG4gIGVyci5tZXNzYWdlID0gKGZpbGVuYW1lIHx8ICdKYWRlJykgKyAnOicgKyBsaW5lbm9cbiAgICArICdcXG4nICsgY29udGV4dCArICdcXG5cXG4nICsgZXJyLm1lc3NhZ2U7XG4gIHRocm93IGVycjtcbn07XG5cbmV4cG9ydHMuRGVidWdJdGVtID0gZnVuY3Rpb24gRGVidWdJdGVtKGxpbmVubywgZmlsZW5hbWUpIHtcbiAgdGhpcy5saW5lbm8gPSBsaW5lbm87XG4gIHRoaXMuZmlsZW5hbWUgPSBmaWxlbmFtZTtcbn1cblxufSx7XCJmc1wiOjJ9XSwyOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcblxufSx7fV19LHt9LFsxXSkoMSlcbn0pOyJdfQ==
