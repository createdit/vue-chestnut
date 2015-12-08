<template lang="jade">
.ui.icon.message.trantison.update-message(v-bind:class="{'hidden': isShow == 0}")
    i.close.icon
    .content
        .header 更新啦！！！
        .ui.list
            .item
                .header 2015年11月30日
                | 修复无法连续发信息bug。
            .item
                | 增加
                .ui.mini.label 排序
                | 按钮
            .item
                | 增加
                .ui.mini.label 过滤
            .item
                .header 2015年11月13日
                | 手机号支持模糊搜索，输入三位以上数字。e.g.
                span.italic 0452
                | ,
                span.italic 137
            .item
                | 更新通知只会在第一次访问时显示，如需查看请点右上角
                .ui.mini.label 通知
                | 按钮
            .item
                | 点击发送短信后，右上会显示发送状态。
            .item
                .header 2015年11月12日
                | 新增来访日期，默认为登记日期，如需更改请点
                .ui.mini.label 编辑
                | -
                .ui.mini.label 修改
                | 。
            .item
                |新增搜索功能，暂时只支持严格匹配(全名或完整的手机号)。e.g.
                span.italic 王大锤
                | ,
                span.italic 13804528888
</template>
<script lang="coffee">
    module.exports = {
        data: () ->
            return {
                isShow: 1
            }
        events:
            toggle: () ->
                this.isShow = !this.isShow
                return
        ready: () ->
            if $.cookie('notice')
                this.isShow = parseInt($.cookie('notice'), 10)
            $(this.$el).find('.close').on 'click', () ->
                $(this).closest('.message')
                    .transition('fade')
                    $.cookie('notice', 0)
            this.$on 'toggleNotice', () ->
                this.$emit('toggle')
                return
    }
</script>
