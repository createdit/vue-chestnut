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


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvc2NyaXB0cy9hcHAuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBLElBQUE7O0FBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxLQUFSOztBQUNOLFlBQUEsR0FBZSxPQUFBLENBQVEsY0FBUjs7QUFDZixHQUFHLENBQUMsR0FBSixDQUFRLFlBQVI7O0FBQ0EsU0FBQSxHQUFZLE9BQUEsQ0FBUSxXQUFSOztBQUNaLEdBQUcsQ0FBQyxHQUFKLENBQVEsU0FBUjs7QUFDQSxNQUFBLEdBQWEsSUFBQSxTQUFBLENBQUE7O0FBQ2IsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFYLEdBQW1COztBQUNuQixXQUFBLEdBQWM7O0FBQ2QsSUFBQSxHQUFXLElBQUEsR0FBQSxDQUFJO0VBQ2IsRUFBQSxFQUFJLE1BRFM7RUFFYixJQUFBLEVBQ0U7SUFBQSxHQUFBLEVBQUssRUFBTDtJQUNBLFNBQUEsRUFBVyxLQURYO0lBRUEsUUFBQSxFQUFVLEtBRlY7SUFHQSxRQUFBLEVBQVUsS0FIVjtJQUlBLE1BQUEsRUFBUSxFQUpSO0lBS0EsUUFBQSxFQUFVO01BQ1I7UUFDRSxJQUFBLEVBQU0sTUFEUjtPQURRLEVBSVI7UUFDRSxJQUFBLEVBQU0sU0FEUjtPQUpRLEVBT1I7UUFDRSxJQUFBLEVBQU0sTUFEUjtPQVBRLEVBVVI7UUFDRSxJQUFBLEVBQU0sT0FEUjtPQVZRO0tBTFY7R0FIVztFQXNCYixRQUFBLEVBQ0U7SUFBQSxVQUFBLEVBQVksU0FBQTtBQUNWLFVBQUE7TUFBQSxNQUFBLEdBQVM7TUFFVCxTQUFBLEdBQVksQ0FBQyxNQUFELEVBQVMsU0FBVCxFQUFvQixNQUFwQixFQUE0QixPQUE1QjtNQUNaLENBQUMsQ0FBQyxJQUFGLENBQU8sSUFBSSxDQUFDLFFBQVosRUFBc0IsU0FBQyxDQUFELEVBQUksSUFBSjtBQUNwQixZ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QUFDaEIsVUFBQTtNQUFBLElBQUEsR0FBTztNQUVQLGNBQUEsR0FBaUIsQ0FBQSxDQUFFLHlCQUFGO2FBQ2pCLGNBQWMsQ0FBQyxRQUFmLENBQXdCO1FBQ3RCLFNBQUEsRUFBVyxTQUFBO0FBQ1QsY0FBQTtVQUFBLEtBQUEsR0FBUSxDQUFBLENBQUUsSUFBRixDQUFPLENBQUMsSUFBUixDQUFhLE9BQWI7aUJBQ1IsSUFBSSxDQUFDLFVBQVcsQ0FBQSxLQUFBLENBQU0sQ0FBQyxPQUF2QixHQUFpQztRQUZ4QixDQURXO1FBSXRCLFdBQUEsRUFBYSxTQUFBO0FBQ1gsY0FBQTtVQUFBLEtBQUEsR0FBUSxDQUFBLENBQUUsSUFBRixDQUFPLENBQUMsSUFBUixDQUFhLE9BQWI7aUJBQ1IsSUFBSSxDQUFDLFVBQVcsQ0FBQSxLQUFBLENBQU0sQ0FBQyxPQUF2QixHQUFpQztRQUZ0QixDQUpTO09BQXhCO0lBSmdCLENBQWxCO0dBcEZXO0VBZ0diLEtBQUEsRUFBTyxTQUFBO0FBQ0wsUUFBQTtJQUFBLElBQUEsR0FBTztJQUNQLElBQUksQ0FBQyxLQUFMLENBQVcsa0JBQVg7SUFDQSxDQUFBLENBQUUsYUFBRixDQUFnQixDQUFDLFFBQWpCLENBQTBCO01BQ3hCLFNBQUEsRUFBVyxTQUFBO1FBQ1QsSUFBSSxDQUFDLFNBQUwsR0FBaUI7UUFFakIsQ0FBQSxDQUFFLHlCQUFGLENBQTRCLENBQUMsUUFBN0IsQ0FBc0MsYUFBdEM7TUFIUyxDQURhO01BTXhCLFdBQUEsRUFBYSxTQUFBO1FBQ1gsSUFBSSxDQUFDLFNBQUwsR0FBaUI7UUFDakIsQ0FBQSxDQUFFLHlCQUFGLENBQTRCLENBQUMsUUFBN0IsQ0FBc0MsZUFBdEM7TUFGVyxDQU5XO0tBQTFCO0VBSEssQ0FoR007Q0FBSiIsImZpbGUiOiJhcHAtYnVuZGxlLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJWdWUgPSByZXF1aXJlICdWdWUnXHJcblZ1ZUFzeW5jRGF0YSA9IHJlcXVpcmUgJ1Z1ZUFzeW5jRGF0YSdcclxuVnVlLnVzZSBWdWVBc3luY0RhdGFcclxuVnVlUm91dGVyID0gcmVxdWlyZSAnVnVlUm91dGVyJ1xyXG5WdWUudXNlIFZ1ZVJvdXRlclxyXG5yb3V0ZXIgPSBuZXcgVnVlUm91dGVyKClcclxuVnVlLmNvbmZpZy5kZWJ1ZyA9IHRydWVcclxuU1RBVElDX1BBVEggPSAnaW1hZ2VzLydcclxuVXNlciA9IG5ldyBWdWUge1xyXG4gIGVsOiAnYm9keSdcclxuICBkYXRhOlxyXG4gICAgYWRkOiAnJ1xyXG4gICAgc2VsZWN0QWxsOiBmYWxzZVxyXG4gICAgZGVsU2hvd246IGZhbHNlXHJcbiAgICBhZGRTaG93bjogZmFsc2VcclxuICAgIHNlYXJjaDogJydcclxuICAgIHVzZXJMaXN0OiBbXHJcbiAgICAgIHtcclxuICAgICAgICBuYW1lOiAnTGVuYSdcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIG5hbWU6ICdMaW5kc2F5J1xyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgbmFtZTogJ01hcmsnXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBuYW1lOiAnTW9sbHknXHJcbiAgICAgIH1cclxuICAgIF1cclxuICBjb21wdXRlZDpcclxuICAgIHJlbmRlckxpc3Q6ICgpIC0+XHJcbiAgICAgIHJlc3VsdCA9IFtdXHJcbiAgICAgICMgZ2l2ZSB0aGUgbmV3IHVzZXIgYSByYW5kb20gZGVmYXVsdCBhdmF0YXJcclxuICAgICAgYXZhdGFyQXJyID0gWydMZW5hJywgJ0xpbmRzYXknLCAnTWFyaycsICdNb2xseSddXHJcbiAgICAgICQuZWFjaCB0aGlzLnVzZXJMaXN0LCAoaSwgaXRlbSkgLT5cclxuICAgICAgICBjbG9uZSA9ICQuZXh0ZW5kKHRydWUsIHt9LCBpdGVtKVxyXG4gICAgICAgIGlmICQuaW5BcnJheShpdGVtLm5hbWUsIGF2YXRhckFycikgaXNudCAtMVxyXG4gICAgICAgICAgYXZhdGFyTmFtZSA9IGl0ZW0ubmFtZVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgIGluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMylcclxuICAgICAgICAgIGF2YXRhck5hbWUgPSBhdmF0YXJBcnJbaW5kZXhdXHJcbiAgICAgICAgY2xvbmUuYXZhdGFyID0gU1RBVElDX1BBVEggKyBhdmF0YXJOYW1lICsgJy5wbmcnXHJcbiAgICAgICAgcmVzdWx0LnB1c2ggY2xvbmVcclxuICAgICAgcmV0dXJuIHJlc3VsdFxyXG4gIHdhdGNoOlxyXG4gICAgc2VsZWN0QWxsOiAodmFsKSAtPlxyXG4gICAgICAjIHVwZGF0ZSBfY2hlY2tlZF8ga2V5IGluIG9iamVjdCBfcmVuZGVyTGlzdF9cclxuICAgICAgaWYgdmFsXHJcbiAgICAgICAgJC5lYWNoIHRoaXMucmVuZGVyTGlzdCwgKGksIGl0ZW0pIC0+XHJcbiAgICAgICAgICBpdGVtLmNoZWNrZWQgPSB0cnVlXHJcbiAgICAgICAgICByZXR1cm5cclxuICAgICAgZWxzZVxyXG4gICAgICAgICQuZWFjaCB0aGlzLnVzZXJMaXN0LCAoaSwgaXRlbSkgLT5cclxuICAgICAgICAgIGl0ZW0uY2hlY2tlZCA9IGZhbHNlXHJcbiAgICAgICAgICByZXR1cm5cclxuICAgIHVzZXJMaXN0OlxyXG4gICAgICBoYW5kbGVyOiAoKSAtPlxyXG4gICAgICAgICMgVGhlIFVJIG1ldGhvZCB3aWxsIGJlIGNhbGxlZCB3aGVuIGRhdGEgY2hhbmdlc1xyXG4gICAgICAgIHRoaXMuJG5leHRUaWNrICgpIC0+XHJcbiAgICAgICAgICB0aGlzLiRlbWl0KCdpbml0TGlzdENoZWNrYm94JylcclxuICAgICAgICByZXR1cm5cclxuICAgICAgZGVlcDogdHJ1ZVxyXG4gIG1ldGhvZHM6XHJcbiAgICBzaG93Q3RybDogKHR5cGUpIC0+XHJcbiAgICAgIGlmIHR5cGUgaXMgJ2FkZCdcclxuICAgICAgICB0aGlzLmFkZFNob3duID0gIXRoaXMuYWRkU2hvd25cclxuICAgICAgICB0aGlzLmRlbFNob3duID0gZmFsc2VcclxuICAgICAgZWxzZSBpZiB0eXBlIGlzICdkZWwnXHJcbiAgICAgICAgdGhpcy5kZWxTaG93biA9ICF0aGlzLmRlbFNob3duXHJcbiAgICAgICAgdGhpcy5hZGRTaG93biA9IGZhbHNlXHJcbiAgICBoaWRlQ3RybDogKCkgLT5cclxuICAgICAgdGhpcy5hZGRTaG93biA9IGZhbHNlXHJcbiAgICAgIHRoaXMuZGVsU2hvd24gPSBmYWxzZVxyXG4gICAgYWRkVXNlcjogKCkgLT5cclxuICAgICAgdGhpcy51c2VyTGlzdC5wdXNoIHtcclxuICAgICAgICBuYW1lOiB0aGlzLmFkZFxyXG4gICAgICB9XHJcbiAgICBkZWxVc2VyOiAoaW5kZXgpIC0+XHJcbiAgICAgIHRoaXMudXNlckxpc3Quc3BsaWNlKGluZGV4LCAxKVxyXG4gICAgZGVsU2VsZWN0OiAoKSAtPlxyXG4gICAgICBzZWxmID0gdGhpc1xyXG4gICAgICByZXN1bHQgPSBbXVxyXG4gICAgICAkLmVhY2ggdGhpcy5yZW5kZXJMaXN0LCAoaSwgaXRlbSkgLT5cclxuICAgICAgICBjb25zb2xlLmxvZyBpdGVtLmNoZWNrZWRcclxuICAgICAgICBpZiBub3QgaXRlbS5jaGVja2VkXHJcbiAgICAgICAgICBjbG9uZSA9ICQuZXh0ZW5kKHRydWUsIHt9LCBpdGVtKVxyXG4gICAgICAgICAgZGVsZXRlIGNsb25lLmNoZWNrZWRcclxuICAgICAgICAgIHJlc3VsdC5wdXNoIGNsb25lXHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICAgIHRoaXMudXNlckxpc3QgPSByZXN1bHRcclxuICBldmVudHM6XHJcbiAgICBpbml0TGlzdENoZWNrYm94OiAoKSAtPlxyXG4gICAgICBzZWxmID0gdGhpc1xyXG4gICAgICAjIEluaXQgY2hlY2tib3ggVUlcclxuICAgICAgY2hlY2tib3hJbkxpc3QgPSAkKCcudXNlci1saXN0IC51aS5jaGVja2JveCcpXHJcbiAgICAgIGNoZWNrYm94SW5MaXN0LmNoZWNrYm94IHtcclxuICAgICAgICBvbkNoZWNrZWQ6ICgpIC0+XHJcbiAgICAgICAgICBpbmRleCA9ICQodGhpcykuZGF0YSgnaW5kZXgnKVxyXG4gICAgICAgICAgc2VsZi5yZW5kZXJMaXN0W2luZGV4XS5jaGVja2VkID0gdHJ1ZVxyXG4gICAgICAgIG9uVW5jaGVja2VkOiAoKSAtPlxyXG4gICAgICAgICAgaW5kZXggPSAkKHRoaXMpLmRhdGEoJ2luZGV4JylcclxuICAgICAgICAgIHNlbGYucmVuZGVyTGlzdFtpbmRleF0uY2hlY2tlZCA9IGZhbHNlXHJcbiAgICAgIH1cclxuICByZWFkeTogKCkgLT5cclxuICAgIHNlbGYgPSB0aGlzXHJcbiAgICB0aGlzLiRlbWl0KCdpbml0TGlzdENoZWNrYm94JylcclxuICAgICQoJy5zZWxlY3QtYWxsJykuY2hlY2tib3gge1xyXG4gICAgICBvbkNoZWNrZWQ6ICgpIC0+XHJcbiAgICAgICAgc2VsZi5zZWxlY3RBbGwgPSB0cnVlXHJcbiAgICAgICAgIyBDYXVzZSB0aGUgbGlzdCB3aWxsIGJlIGNoYW5nZWQgYnkgZGVsZXRlIG9yIGFkZFxyXG4gICAgICAgICQoJy51c2VyLWxpc3QgLnVpLmNoZWNrYm94JykuY2hlY2tib3goJ3NldCBjaGVja2VkJylcclxuICAgICAgICByZXR1cm5cclxuICAgICAgb25VbmNoZWNrZWQ6ICgpIC0+XHJcbiAgICAgICAgc2VsZi5zZWxlY3RBbGwgPSBmYWxzZVxyXG4gICAgICAgICQoJy51c2VyLWxpc3QgLnVpLmNoZWNrYm94JykuY2hlY2tib3goJ3NldCB1bmNoZWNrZWQnKVxyXG4gICAgICAgIHJldHVyblxyXG4gICAgfVxyXG4gICAgcmV0dXJuXHJcbn1cclxuIl19
