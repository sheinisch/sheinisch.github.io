// When the page is ready to be manipulated
$(document).ready(function() {
  // Grab our user from localStorage, if they exist
  var user = localStorage.getItem("steve_forum_user")

  // Link up to the firebase posts object cloud
  var ref = new Firebase("https://glowing-fire-4623.firebaseio.com/posts")

  // Create an empty object to store all POSTS in
  var posts = {}
  var current = {
    type: "forum",
    forum: "sports",
    name: "-1"
  }

  // If there is no user in localStorage, temporarily
  //  set them as anonymous
  if(user === null || user == "anonymous") {
    user = "anonymous"
    $(".forum_content").hide()
    $("#addUser").on("submit", function(e) {
      e.preventDefault()
      var new_name = $("#name").val()
      localStorage.setItem("steve_forum_user", new_name)
      user = new_name
      $(".login_content").slideUp(100)
      $(".forum_content").slideDown(100)
    })
  } else {
    $(".login_content").hide()
  }

  // We set one forum as the main forum, the rest we
  //  hide from view
  $('#politics').css("display", "none")
  $('#general').css("display", "none")


  // Retrieve new posts as they are added to our database
  ref.on("child_added", function(snapshot, prevChildKey) {
    // This is the post object
    var newPost = snapshot.val()

    // Add the newly fetched post to our post object
    //  and use the key/id as the key for the post object
    posts[snapshot.key()] = newPost

    // If it does not have a parent (IS a thread)
    if(parseInt(newPost.parent) === -1) {
      // If the post content is longer than 137
      //  characters we will trim it down and add
      //  '...' to make it look nice
      var dots = ''
      if(newPost.content.length > 137) {
        dots = '...'
      }

      // Add the thread to the page
      $("#" + newPost.fid.toLowerCase()).prepend('<a href="#" id="' + snapshot.key() + '" class="list-group-item thread_bit"><span class="author">' + newPost.author + '</span><span class="post_time">' + moment.unix(parseInt(newPost.time)).fromNow() + '</span><span class="thread_post">' + newPost.content.substring(0, 136) + dots + '</span></a><div class="thread_content"></div>')


      // This event fires when any thread is clicked
      $('#' + snapshot.key()).on("click", function(e) {
        // Hide all others thread_contents (posts)
        $('.thread_content').css("display", "none")

        // Sometimes jQuery captures click events weird..
        //  make sure we have the right id
        if(e.target.id.length < 2) {
          e.target.id = $(e.target).parent().prop("id")
        }

        // Change our current location details in the app
        current.type = "thread"
        current.forum = posts[e.target.id].fid
        current.name = e.target.id

        // Store a jQuery object in the $thread variable
        var $thread = $("#" + current.name)

        // Hide all other posts except the main posts and all replies
        $('.thread_bit').css("display", "none")
        $thread.css("display", "block")
        $thread.next().css("display", "block")
      })
    } else {
      // Store posts in the HTML that is by default hidden from view
      $("#" + newPost.parent).next().prepend('<blockquote class="post_bit"><p>' + newPost.content + '</p><footer><span class="author">' + newPost.author + '</span>' + moment.unix(parseInt(newPost.time)).fromNow() + '</footer></blockquote>')
    }
  })


// When a navigation tab is clicked
  $(".forum").on("click", function(e) {
    var color
    var forum_name = e.target.innerHTML.toLowerCase()

    // Quick switch logic to determine info_bar color
    switch(forum_name) {
      case "sports":
        color = "#5cb85c"
        break
      case "politics":
        color = "#d9534f"
        break
      case "general":
        color = "#f0ad4e"
        break
    }

    // Set the info bar to the new tab color
    $(".info-bar").css("backgroundColor", color)
    $(e.target).css("backgroundColor", color)

    // Hide all posts again (not threads) just in case
    $('.thread_content').css("display", "none")

    // Check if the clicked is different from the current view
    if(forum_name != current.forum) {
      $("#" + current.forum).css("display", "none")
      $("#" + forum_name).css("display", "block")
      current.forum = forum_name
      current.type = "forum"
      current.name = -1
    }
  })

  // This is when the new thread/post button is click
  $(".new_response").on("click", function(e) {
    // Deciding on the text for the prompt
    var prompt_text = "Comment on this post"
    if(current.type == "forum") {
      prompt_text = "Create a new post..."
    }

    // Simple window.prompt to get input from the user
    var new_input = prompt(prompt_text)

    // Push our data to the firebase object
    ref.push({
      author: user,
      content: new_input,
      fid: current.forum,
      parent: current.name,
      time: Math.floor(Date.now() / 1000)
    })

  })
})
