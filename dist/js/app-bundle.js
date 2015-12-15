(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
var STATIC_PATH, User, Vue, VueAsyncData, VueRouter, router;

Vue = (typeof window !== "undefined" ? window['Vue'] : typeof global !== "undefined" ? global['Vue'] : null);

VueAsyncData = (typeof window !== "undefined" ? window['VueAsyncData'] : typeof global !== "undefined" ? global['VueAsyncData'] : null);

Vue.use(VueAsyncData);

VueRouter = (typeof window !== "undefined" ? window['VueRouter'] : typeof global !== "undefined" ? global['VueRouter'] : null);

Vue.use(VueRouter);

router = new VueRouter();

Vue.config.debug = true;

STATIC_PATH = 'images/';

User = new Vue({
  el: 'body',
  data: {
    add: '',
    selectAll: false,
    delShown: false,
    addShown: false,
    search: '',
    editable: false,
    userList: [
      {
        name: 'Lena'
      }, {
        name: 'Lindsay'
      }, {
        name: 'Mark'
      }, {
        name: 'Molly'
      }
    ]
  },
  computed: {
    renderList: function() {
      var avatarArr, result;
      result = [];
      avatarArr = ['Lena', 'Lindsay', 'Mark', 'Molly'];
      $.each(this.userList, function(i, item) {
        var avatarName, clone, index;
        clone = $.extend(true, {}, item);
        if ($.inArray(item.name, avatarArr) !== -1) {
          avatarName = item.name;
        } else {
          index = Math.floor(Math.random() * 3);
          avatarName = avatarArr[index];
        }
        clone.avatar = STATIC_PATH + avatarName + '.png';
        return result.push(clone);
      });
      return result;
    }
  },
  watch: {
    selectAll: function(val) {
      if (val) {
        return $.each(this.renderList, function(i, item) {
          item.checked = true;
        });
      } else {
        return $.each(this.userList, function(i, item) {
          item.checked = false;
        });
      }
    },
    userList: {
      handler: function() {
        this.$nextTick(function() {
          return this.$emit('initListCheckbox');
        });
      },
      deep: true
    }
  },
  methods: {
    showCtrl: function(type) {
      if (type === 'add') {
        this.addShown = !this.addShown;
        return this.delShown = false;
      } else if (type === 'del') {
        this.delShown = !this.delShown;
        return this.addShown = false;
      }
    },
    hideCtrl: function() {
      this.addShown = false;
      return this.delShown = false;
    },
    addUser: function() {
      return this.userList.push({
        name: this.add
      });
    },
    delUser: function(index) {
      return this.userList.splice(index, 1);
    },
    delSelect: function() {
      var result, self;
      self = this;
      result = [];
      $.each(this.renderList, function(i, item) {
        var clone;
        console.log(item.checked);
        if (!item.checked) {
          clone = $.extend(true, {}, item);
          delete clone.checked;
          result.push(clone);
        }
      });
      return this.userList = result;
    },
    edit: function() {
      return this.editable = !this.editable;
    }
  },
  events: {
    initListCheckbox: function() {
      var checkboxInList, self;
      self = this;
      checkboxInList = $('.user-list .ui.checkbox');
      return checkboxInList.checkbox({
        onChecked: function() {
          var index;
          index = $(this).data('index');
          return self.renderList[index].checked = true;
        },
        onUnchecked: function() {
          var index;
          index = $(this).data('index');
          return self.renderList[index].checked = false;
        }
      });
    }
  },
  ready: function() {
    var self;
    self = this;
    this.$emit('initListCheckbox');
    $('.select-all').checkbox({
      onChecked: function() {
        self.selectAll = true;
        $('.user-list .ui.checkbox').checkbox('set checked');
      },
      onUnchecked: function() {
        self.selectAll = false;
        $('.user-list .ui.checkbox').checkbox('set unchecked');
      }
    });
  }
});


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}]},{},[1])


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvc2NyaXB0cy9hcHAuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBLElBQUE7O0FBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxLQUFSOztBQUNOLFlBQUEsR0FBZSxPQUFBLENBQVEsY0FBUjs7QUFDZixHQUFHLENBQUMsR0FBSixDQUFRLFlBQVI7O0FBQ0EsU0FBQSxHQUFZLE9BQUEsQ0FBUSxXQUFSOztBQUNaLEdBQUcsQ0FBQyxHQUFKLENBQVEsU0FBUjs7QUFDQSxNQUFBLEdBQWEsSUFBQSxTQUFBLENBQUE7O0FBQ2IsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFYLEdBQW1COztBQUNuQixXQUFBLEdBQWM7O0FBQ2QsSUFBQSxHQUFXLElBQUEsR0FBQSxDQUFJO0VBQ2IsRUFBQSxFQUFJLE1BRFM7RUFFYixJQUFBLEVBQ0U7SUFBQSxHQUFBLEVBQUssRUFBTDtJQUNBLFNBQUEsRUFBVyxLQURYO0lBRUEsUUFBQSxFQUFVLEtBRlY7SUFHQSxRQUFBLEVBQVUsS0FIVjtJQUlBLE1BQUEsRUFBUSxFQUpSO0lBS0EsUUFBQSxFQUFVLEtBTFY7SUFNQSxRQUFBLEVBQVU7TUFDUjtRQUNFLElBQUEsRUFBTSxNQURSO09BRFEsRUFJUjtRQUNFLElBQUEsRUFBTSxTQURSO09BSlEsRUFPUjtRQUNFLElBQUEsRUFBTSxNQURSO09BUFEsRUFVUjtRQUNFLElBQUEsRUFBTSxPQURSO09BVlE7S0FOVjtHQUhXO0VBdUJiLFFBQUEsRUFDRTtJQUFBLFVBQUEsRUFBWSxTQUFBO0FBQ1YsVUFBQTtNQUFBLE1BQUEsR0FBUztNQUVULFNBQUEsR0FBWSxDQUFDLE1BQUQsRUFBUyxTQUFULEVBQW9CLE1BQXBCLEVBQTRCLE9BQTVCO01BQ1osQ0FBQyxDQUFDLElBQUYsQ0FBTyxJQUFJLENBQUMsUUFBWixFQUFzQixTQUFDLENB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c291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiVnVlID0gcmVxdWlyZSAnVnVlJ1xyXG5WdWVBc3luY0RhdGEgPSByZXF1aXJlICdWdWVBc3luY0RhdGEnXHJcblZ1ZS51c2UgVnVlQXN5bmNEYXRhXHJcblZ1ZVJvdXRlciA9IHJlcXVpcmUgJ1Z1ZVJvdXRlcidcclxuVnVlLnVzZSBWdWVSb3V0ZXJcclxucm91dGVyID0gbmV3IFZ1ZVJvdXRlcigpXHJcblZ1ZS5jb25maWcuZGVidWcgPSB0cnVlXHJcblNUQVRJQ19QQVRIID0gJ2ltYWdlcy8nXHJcblVzZXIgPSBuZXcgVnVlIHtcclxuICBlbDogJ2JvZHknXHJcbiAgZGF0YTpcclxuICAgIGFkZDogJydcclxuICAgIHNlbGVjdEFsbDogZmFsc2VcclxuICAgIGRlbFNob3duOiBmYWxzZVxyXG4gICAgYWRkU2hvd246IGZhbHNlXHJcbiAgICBzZWFyY2g6ICcnXHJcbiAgICBlZGl0YWJsZTogZmFsc2VcclxuICAgIHVzZXJMaXN0OiBbXHJcbiAgICAgIHtcclxuICAgICAgICBuYW1lOiAnTGVuYSdcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIG5hbWU6ICdMaW5kc2F5J1xyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgbmFtZTogJ01hcmsnXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBuYW1lOiAnTW9sbHknXHJcbiAgICAgIH1cclxuICAgIF1cclxuICBjb21wdXRlZDpcclxuICAgIHJlbmRlckxpc3Q6ICgpIC0+XHJcbiAgICAgIHJlc3VsdCA9IFtdXHJcbiAgICAgICMgZ2l2ZSB0aGUgbmV3IHVzZXIgYSByYW5kb20gZGVmYXVsdCBhdmF0YXJcclxuICAgICAgYXZhdGFyQXJyID0gWydMZW5hJywgJ0xpbmRzYXknLCAnTWFyaycsICdNb2xseSddXHJcbiAgICAgICQuZWFjaCB0aGlzLnVzZXJMaXN0LCAoaSwgaXRlbSkgLT5cclxuICAgICAgICBjbG9uZSA9ICQuZXh0ZW5kKHRydWUsIHt9LCBpdGVtKVxyXG4gICAgICAgIGlmICQuaW5BcnJheShpdGVtLm5hbWUsIGF2YXRhckFycikgaXNudCAtMVxyXG4gICAgICAgICAgYXZhdGFyTmFtZSA9IGl0ZW0ubmFtZVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgIGluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMylcclxuICAgICAgICAgIGF2YXRhck5hbWUgPSBhdmF0YXJBcnJbaW5kZXhdXHJcbiAgICAgICAgY2xvbmUuYXZhdGFyID0gU1RBVElDX1BBVEggKyBhdmF0YXJOYW1lICsgJy5wbmcnXHJcbiAgICAgICAgcmVzdWx0LnB1c2ggY2xvbmVcclxuICAgICAgcmV0dXJuIHJlc3VsdFxyXG4gIHdhdGNoOlxyXG4gICAgc2VsZWN0QWxsOiAodmFsKSAtPlxyXG4gICAgICAjIHVwZGF0ZSBfY2hlY2tlZF8ga2V5IGluIG9iamVjdCBfcmVuZGVyTGlzdF9cclxuICAgICAgaWYgdmFsXHJcbiAgICAgICAgJC5lYWNoIHRoaXMucmVuZGVyTGlzdCwgKGksIGl0ZW0pIC0+XHJcbiAgICAgICAgICBpdGVtLmNoZWNrZWQgPSB0cnVlXHJcbiAgICAgICAgICByZXR1cm5cclxuICAgICAgZWxzZVxyXG4gICAgICAgICQuZWFjaCB0aGlzLnVzZXJMaXN0LCAoaSwgaXRlbSkgLT5cclxuICAgICAgICAgIGl0ZW0uY2hlY2tlZCA9IGZhbHNlXHJcbiAgICAgICAgICByZXR1cm5cclxuICAgIHVzZXJMaXN0OlxyXG4gICAgICBoYW5kbGVyOiAoKSAtPlxyXG4gICAgICAgICMgVGhlIFVJIG1ldGhvZCB3aWxsIGJlIGNhbGxlZCB3aGVuIGRhdGEgY2hhbmdlc1xyXG4gICAgICAgIHRoaXMuJG5leHRUaWNrICgpIC0+XHJcbiAgICAgICAgICB0aGlzLiRlbWl0KCdpbml0TGlzdENoZWNrYm94JylcclxuICAgICAgICByZXR1cm5cclxuICAgICAgZGVlcDogdHJ1ZVxyXG4gIG1ldGhvZHM6XHJcbiAgICBzaG93Q3RybDogKHR5cGUpIC0+XHJcbiAgICAgIGlmIHR5cGUgaXMgJ2FkZCdcclxuICAgICAgICB0aGlzLmFkZFNob3duID0gIXRoaXMuYWRkU2hvd25cclxuICAgICAgICB0aGlzLmRlbFNob3duID0gZmFsc2VcclxuICAgICAgZWxzZSBpZiB0eXBlIGlzICdkZWwnXHJcbiAgICAgICAgdGhpcy5kZWxTaG93biA9ICF0aGlzLmRlbFNob3duXHJcbiAgICAgICAgdGhpcy5hZGRTaG93biA9IGZhbHNlXHJcbiAgICBoaWRlQ3RybDogKCkgLT5cclxuICAgICAgdGhpcy5hZGRTaG93biA9IGZhbHNlXHJcbiAgICAgIHRoaXMuZGVsU2hvd24gPSBmYWxzZVxyXG4gICAgYWRkVXNlcjogKCkgLT5cclxuICAgICAgdGhpcy51c2VyTGlzdC5wdXNoIHtcclxuICAgICAgICBuYW1lOiB0aGlzLmFkZFxyXG4gICAgICB9XHJcbiAgICBkZWxVc2VyOiAoaW5kZXgpIC0+XHJcbiAgICAgIHRoaXMudXNlckxpc3Quc3BsaWNlKGluZGV4LCAxKVxyXG4gICAgZGVsU2VsZWN0OiAoKSAtPlxyXG4gICAgICBzZWxmID0gdGhpc1xyXG4gICAgICByZXN1bHQgPSBbXVxyXG4gICAgICAkLmVhY2ggdGhpcy5yZW5kZXJMaXN0LCAoaSwgaXRlbSkgLT5cclxuICAgICAgICBjb25zb2xlLmxvZyBpdGVtLmNoZWNrZWRcclxuICAgICAgICBpZiBub3QgaXRlbS5jaGVja2VkXHJcbiAgICAgICAgICBjbG9uZSA9ICQuZXh0ZW5kKHRydWUsIHt9LCBpdGVtKVxyXG4gICAgICAgICAgZGVsZXRlIGNsb25lLmNoZWNrZWRcclxuICAgICAgICAgIHJlc3VsdC5wdXNoIGNsb25lXHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICAgIHRoaXMudXNlckxpc3QgPSByZXN1bHRcclxuICAgIGVkaXQ6ICgpIC0+XHJcbiAgICAgIHRoaXMuZWRpdGFibGUgPSAhdGhpcy5lZGl0YWJsZVxyXG4gIGV2ZW50czpcclxuICAgIGluaXRMaXN0Q2hlY2tib3g6ICgpIC0+XHJcbiAgICAgIHNlbGYgPSB0aGlzXHJcbiAgICAgICMgSW5pdCBjaGVja2JveCBVSVxyXG4gICAgICBjaGVja2JveEluTGlzdCA9ICQoJy51c2VyLWxpc3QgLnVpLmNoZWNrYm94JylcclxuICAgICAgY2hlY2tib3hJbkxpc3QuY2hlY2tib3gge1xyXG4gICAgICAgIG9uQ2hlY2tlZDogKCkgLT5cclxuICAgICAgICAgIGluZGV4ID0gJCh0aGlzKS5kYXRhKCdpbmRleCcpXHJcbiAgICAgICAgICBzZWxmLnJlbmRlckxpc3RbaW5kZXhdLmNoZWNrZWQgPSB0cnVlXHJcbiAgICAgICAgb25VbmNoZWNrZWQ6ICgpIC0+XHJcbiAgICAgICAgICBpbmRleCA9ICQodGhpcykuZGF0YSgnaW5kZXgnKVxyXG4gICAgICAgICAgc2VsZi5yZW5kZXJMaXN0W2luZGV4XS5jaGVja2VkID0gZmFsc2VcclxuICAgICAgfVxyXG4gIHJlYWR5OiAoKSAtPlxyXG4gICAgc2VsZiA9IHRoaXNcclxuICAgIHRoaXMuJGVtaXQoJ2luaXRMaXN0Q2hlY2tib3gnKVxyXG4gICAgJCgnLnNlbGVjdC1hbGwnKS5jaGVja2JveCB7XHJcbiAgICAgIG9uQ2hlY2tlZDogKCkgLT5cclxuICAgICAgICBzZWxmLnNlbGVjdEFsbCA9IHRydWVcclxuICAgICAgICAjIENhdXNlIHRoZSBsaXN0IHdpbGwgYmUgY2hhbmdlZCBieSBkZWxldGUgb3IgYWRkXHJcbiAgICAgICAgJCgnLnVzZXItbGlzdCAudWkuY2hlY2tib3gnKS5jaGVja2JveCgnc2V0IGNoZWNrZWQnKVxyXG4gICAgICAgIHJldHVyblxyXG4gICAgICBvblVuY2hlY2tlZDogKCkgLT5cclxuICAgICAgICBzZWxmLnNlbGVjdEFsbCA9IGZhbHNlXHJcbiAgICAgICAgJCgnLnVzZXItbGlzdCAudWkuY2hlY2tib3gnKS5jaGVja2JveCgnc2V0IHVuY2hlY2tlZCcpXHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICB9XHJcbiAgICByZXR1cm5cclxufVxyXG4iXX0=
