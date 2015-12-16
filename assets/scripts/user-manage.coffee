STATIC_PATH = 'images/'
tpl = require '../templates/user-manage.html'
User = Vue.extend {
  template: tpl
  data: () ->
    return {
      add: ''
      selectAll: false
      delShown: false
      addShown: false
      search: ''
      editable: false
      submitData: false
      userList: [
        {
          name: 'Lena'
        },
        {
          name: 'Lindsay'
        },
        {
          name: 'Mark'
        },
        {
          name: 'Molly'
        }
      ]
    }
  computed:
    renderList: () ->
      result = []
      # give the new user a random default avatar
      avatarArr = ['Lena', 'Lindsay', 'Mark', 'Molly']
      $.each this.userList, (i, item) ->
        clone = $.extend(true, {}, item)
        if $.inArray(item.name, avatarArr) isnt -1
          avatarName = item.name
        else
          index = Math.floor(Math.random() * 3)
          avatarName = avatarArr[index]
        clone.avatar = STATIC_PATH + avatarName + '.png'
        result.push clone
      return result
  watch:
    selectAll: (val) ->
      # update _checked_ key in object _renderList_
      if val
        $.each this.renderList, (i, item) ->
          item.checked = true
          return
      else
        $.each this.userList, (i, item) ->
          item.checked = false
          return
    userList:
      handler: () ->
        # The UI method will be called when data changes
        this.$nextTick () ->
          this.$emit('initListCheckbox')
        return
      deep: true
  methods:
    showCtrl: (type) ->
      if type is 'add'
        this.addShown = !this.addShown
        this.delShown = false
      else if type is 'del'
        this.delShown = !this.delShown
        this.addShown = false
    hideCtrl: () ->
      this.addShown = false
      this.delShown = false
    addUser: () ->
      this.userList.push {
        name: this.add
      }
    delUser: (index) ->
      this.userList.splice(index, 1)
    delSelect: () ->
      self = this
      result = []
      $.each this.renderList, (i, item) ->
        console.log item.checked
        if not item.checked
          clone = $.extend(true, {}, item)
          delete clone.checked
          result.push clone
        return
      this.userList = result
    edit: () ->
      this.editable = !this.editable
  events:
    initListCheckbox: () ->
      self = this
      # Init checkbox UI
      checkboxInList = $('.user-list .ui.checkbox')
      checkboxInList.checkbox {
        onChecked: () ->
          index = $(this).data('index')
          self.renderList[index].checked = true
        onUnchecked: () ->
          index = $(this).data('index')
          self.renderList[index].checked = false
      }
  ready: () ->
    self = this
    this.$emit('initListCheckbox')
    $('.select-all').checkbox {
      onChecked: () ->
        self.selectAll = true
        # Cause the list will be changed by delete or add
        $('.user-list .ui.checkbox').checkbox('set checked')
        return
      onUnchecked: () ->
        self.selectAll = false
        $('.user-list .ui.checkbox').checkbox('set unchecked')
        return
    }
    return
}
module.exports = User
