<template>
  <div class="weather-card">
      <div class="weather-head">
        <div class="weather-city">
            北京
        </div>
        <div class="weather-date">
            {{date}}
        </div>
      </div>
      <div class="weather-body">
        <div class="inline-block">
          <div class="weather-temperature" v-text="pm25 | pmExponent">

          </div>
          <div class="weather-pm">
              {{pm25}}
          </div>
        </div>
      </div>
      <div class="weather-footer">
        <div class="column">
          {{tempMin}} &#8451; - {{tempMax}} &#8451;
        </div>
        <div class="column">
          {{weather}}
        </div>
        <div class="column">
          {{wind}}
        </div>
      </div>
  </div>
</template>
<script lang="coffee">
  module.exports = Vue.extend {
    data: () ->
      return {
        date: do () ->
          week = ['Sun', 'Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat'];
          date = new Date()
          month = date.getMonth() + 1
          day = week[date.getDay()]
          return day + ' ' + month + ' ' + date.getDate()
        city: '北京'
        weather: ''
        tempMin: 0
        tempMax: 0
        wind: ''
        pm25: 0
      }
    asyncData: (resolve) ->
      res = $.ajax {
        url: '/api/weather/' + this.city
      }
      res.done (data) ->
        resolve data
    filters:
      pmExponent: (value) ->
        if value >= 0 and value < 50
          return '优'
        else if value >= 50 and value < 100
          return '良'
        else if value >= 100 and value < 150
          return '轻度污染'
        else if value >= 150 and value < 200
          return '中度污染'
        else if value >= 200 and value < 300
          return '重度污染'
        else if value >= 300 and value < 500
          return '严重污染'

  }
</script>
