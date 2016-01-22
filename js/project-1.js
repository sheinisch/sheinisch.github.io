$(document).ready(function(){
  var name = localStorage.getItem("name");

  var users = [
    {
        name: "Steve",

    }
  ];
    if(localStorage.getItem("name") !== null) {
      $(".welcome").hide();

      $('#pageHeader').text('Welcome to your homepage, ' + name + '!');

    }


  $("#addUser").on("submit", function(e){
    e.preventDefault();

    var newName = $("#name").val();

    localStorage.setItem("name", newName);

    //var oldName = localStorage.getItem("name");

    //console.log(oldName);
  });

});
