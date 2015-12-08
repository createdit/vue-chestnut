ref = new Wilddog "https://vue.wilddogio.com/"
database = ref.child('web')
usersRef = database.child('users')
Vue = require 'Vue'
VueAsyncData = require 'VueAsyncData'
Vue.use VueAsyncData
VueRouter = require 'VueRouter'
Vue.use VueRouter
router = new VueRouter()
Vue.config.debug = true
# APIID = '183843b1b23f52a7cf28eeefa88b6dff'
APIID = 'FAGwmONQ2v9RAFPS3IM4if9wcJp7s2i15hOVabFy'
# debug off
$.fn.modal.settings.debug = false
$.fn.dimmer.settings.debug = false
$.fn.dropdown.settings.debug = false
$.fn.popup.settings.debug = false
$.fn.checkbox.settings.debug = false
# pubcli
bz = () ->
  unless this instanceof bz
    return new bz()
bz.prototype.getToken = () ->
  authData = ref.getAuth()
  token = ''
  if authData
    token = authData.token
  return token
bz.prototype.auth = () ->
  token = this.getToken()
  unless token
    router.replace('/auth')
  ref.authWithCustomToken token, (error, authData) ->
    if error
      router.replace('/auth')
    else
      router.replace('/')
bz.prototype.cancel = () ->
  ref.unauth()
  router.replace('/auth')
bzInstance = bz()
# vue generator
mainTpl = require('../tpl/main.jade')()
main = Vue.extend {
  template: mainTpl
  data: () ->
    return {
      form:
        name: ''
        tel: ''
        desc: ''
      list: {}
      info:
        sms: 0
      search: ''
      msg: {
        status: 0
        text: ''
      }
      sort: -1,
      filter: {
        send: '',
        arrived: ''
      },
      pages: 10
    }
  computed:
    validate: () ->
      this.form.name && this.form.tel && this.isTel
    isTel: () ->
      /^\d{11}$/.test(this.form.tel)
    searching: () ->
      /^\d{3,10}$/.test(this.search)
    page: () ->
      return 10
  events:
    closeMsg: () ->
      $('.bz-message').transition {
        animation: 'fade down'
        duration: 300
      }
  methods:
    submit: () ->
      self = this
      date = new Date()
      year = date.getFullYear()
      month = date.getMonth() + 1
      day = year + '/' + month + '/' + date.getDate()
      usersRef.push {
        name: self.form.name
        tel: self.form.tel
        date: day
        visitDate: day
        desc: self.form.desc
        sent: false
        arrive: false
      }
      usersRef.once 'child_added', (snapshot) ->
        self.form.name = ''
        self.form.tel = ''
        self.form.desc = ''
    sms: (obj, id) ->
      self = this
      if this.disabled
        return false
      this.disabled = true
      $.ajax {
        method: 'POST'
        url: '/api/sendSMS'
        data:
          mobile: obj.tel
        dataType: 'json'
        success: (data) ->
          if data.code is 0
            self.info.sms = self.info.sms - 1
            row = usersRef.child(id)
            row.update {
              sent: true
            }
            self.msg.status = 1
          else
            self.msg.status = 0
            self.msg.text = data.msg
        error: () ->
          self.msg.status = 2
        complete: () ->
          self.disabled = false
          $('.bz-message').transition {
            animation: 'fade down'
            duration: 300
          }
          setTimeout () ->
            self.$emit 'closeMsg'
          , 3000
      }
    del: (id) ->
      $('.ui.modal').modal 'show'
      this.$once 'row-del', () ->
        row = usersRef.child(id)
        row.remove()

    confirm: () ->
      this.$emit 'row-del'

    modify: (obj, id) ->
      obj.editable = !obj.editable
      if obj.editable is false
        row = usersRef.child(id)
        row.update {
          name: obj.name
          tel: obj.tel
          desc: obj.desc
          visitDate: obj.visitDate
        }
    attendance: (obj, id, e) ->
      row = usersRef.child(id)
      row.update {
        arrive: true
      }
      $(e.target).parents('.ui.dropdown').dropdown('hide')
    messageClose: () ->
      this.$emit 'closeMsg'
    logout: () ->
      bzInstance.cancel()
    noticeCtrl: () ->
      this.$broadcast('toggleNotice')
    searchLike: () ->
      input = this.search
      if this.searching
        $.each this.list, (key, val) ->
          if val.tel.indexOf(input) >= 0
            match = val.tel.match(input)
            wrapTag = '<span class="searchSelect">' + match[0] + '</span>'
            val.telClone =  val.tel.replace(match[0], wrapTag)
          else
            val.telClone = ''
          return
        return
    sortList: () ->
      if this.sort is 1
        this.sort = -1
      else
        this.sort = 1
  asyncData: (resolve) ->
    self = this
    usersRef.on 'value', (snapshot) ->
      userlist = snapshot.val()
      if userlist and !$.isEmptyObject userlist
        $.each userlist, (index, item) ->
          item.editable = false
          item.telClone = ''
          item.disabled = false
          return true
      resolve {
        list: userlist
      }
      dropdownHide = () ->
        $('.ui.dropdown').dropdown {
          action: 'hide'
        }
      setTimeout dropdownHide, 0
  created: () ->
    bzInstance.auth()
    self = this
    $.ajax {
      url: '/api/account'
      dataType: 'json'
      success: (data) ->
        if data.code is 0
          self.info.sms = data.user.balance
    }
  ready: () ->
    self = this
    $('[data-content]').popup()
    $('#filterSend').checkbox {
      onChange: () ->
        if self.filter.send is false
          self.filter.send = ''
        else
          self.filter.send = false
    }
    $('#filterArrived').checkbox {
      onChange: () ->
        if self.filter.arrived is false
          self.filter.arrived = ''
        else
          self.filter.arrived = false
    }
  components:
    notice: require '../tpl/notice.vue'
}

loginTpl = require('../tpl/login.jade')()
login = Vue.extend {
  template: loginTpl
  data: () ->
    return {
      loginError: false,
      email: '',
      password: ''
    }
  methods:
    login: () ->
      if !this.email or !this.password
        this.loginError = true
        return
      callback = (err, data) ->
        if err is null
          router.replace('/')
        else
          self.loginError = true
      self = this
      ref.authWithPassword {
        #907219900@qq.com
        email: self.email
        #4NA5AHUDKP9o
        password: self.password
        } , callback
  created: () ->
    bzInstance.auth()
}
router.map {
  '/':
    component: main

  '/auth':
    component: login
}
App = Vue.extend {}
router.start(App, '#app')
