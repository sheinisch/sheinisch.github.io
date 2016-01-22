function resetSPT() {
  localStorage.removeItem('steve_personal_tracker')
}

$(document).ready(function() {

  function checkIfNameExists(temp_user_obj, temp_name) {
    if(temp_user_obj.name == temp_name) {
      return true
    } else {
      return false
    }
  }

  var dataString = localStorage.getItem("steve_personal_tracker")
  var SPT, USER

  if(dataString !== null) {
    SPT = JSON.parse(dataString)
  } else {
    localStorage.setItem("steve_personal_tracker", "[]")
    SPT = []
  }

  $("#addUser").on("submit", function(e) {
    e.preventDefault();

    var flags = 0

    var newName = $("#name").val()
    var newCity = $("#city").val()
    var newStocks = $("#stocks").val()
    var stockArr = []

    newStocks.split(",").forEach(function(temp_stock) {
      stockArr.push($.trim(temp_stock))
    })

    if(newName.length < 1 && newCity.length < 2) {
      $('#error-message').text('All fields required.')
      $('#add-user-alert').addClass('alert-danger').removeClass('alert-warning').fadeIn()
      flags++
    }

    SPT.forEach(function(temp_obj) {
      if(checkIfNameExists(temp_obj, newName)) {
        $('#error-message').text('Username is taken.')
        $('#add-user-alert').addClass('alert-warning').removeClass('alert-danger').fadeIn()
        flags++
        return
      }
    })

    if(flags === 0) {
      var temp_user = {
        name: newName,
        stocks: stockArr,
        city: newCity,
        notes: []
      }
      SPT.push(temp_user)
      localStorage.setItem('steve_personal_tracker', JSON.stringify(SPT))
      $(".user-list").append('<div class="col-sm-12 user-choice">' + newName + '</div>')
    }
  })



SPT.forEach(function(temp_obj, i) {
  $(".user-list").append('<div class="col-sm-12 user-choice" id="user-' + i + '">' + temp_obj.name + '</div>')
})


$('.user-choice').on('click', function(e) {
  USER = SPT[$(this).index()]
  $('.content').empty()
  $('.content').html('<div class="row personal-page"></div>')
  $('.content-heading').text("Welcome back, " + USER.name)
  // $('.content').css({height: ''})

  $.ajax({
    url : 'http://query.yahooapis.com/v1/public/yql?env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys',
    jsonp: 'callback',
    dataType : 'jsonp',
    data : {
      q: 'select * from yahoo.finance.quotes where symbol in ("' + USER.stocks.join('","') + '")',
      format: "json"
    },

    success : function(data) {
      if(data.query.count > 1) {
        data.query.results.quote.forEach(function(stock_obj) {
          $('.personal-page').append('<div class="col-sm-12">' + stock_obj.Name + ' (' + stock_obj.symbol + '):  ' + stock_obj.LastTradePriceOnly + ' ' + stock_obj.Currency + '</div>')
        })
      } else {
        var stock_obj = data.query.results.quote
        $('.personal-page').append('<div class="col-sm-12">' + stock_obj.Name + ' (' + stock_obj.symbol + '):  ' + stock_obj.LastTradePriceOnly + ' ' + stock_obj.Currency + '</div>')
      }
  }})

  $.ajax({
    url : 'http://query.yahooapis.com/v1/public/yql?env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys',
    jsonp: 'callback',
    dataType : 'jsonp',
    data : {
      q: "select * from weather.forecast where woeid IN (select woeid from geo.places where text='" + USER.city + "')",
      format: "json"
    },

    success : function(data) {
      console.log(data)
      $('.personal-page').append('<div class="col-sm-12>' + data.query.results.channel[0].item.description + '</div>')
    }
  })

})

});
