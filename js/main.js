function init() {
  QiscusSDK.core.init({
    AppId: 'sdksample',
    mode: 'wide',
    options: {
      loginSuccessCallback: function (data) {
        loadRoomList()
      },
      newMessageCallback: function (data) {
        console.log('new-message-callback', data)
      }
    }
  })
  QiscusSDK.core.setUser('guest2@gg.com', 'password', 'Guest 2')
  QiscusSDK.render()
}
function createRoomDOM (room) {
  var anchor = document.createElement('a')
  anchor.href = 'javascript:void(0)'
  anchor.dataset['id'] = room.id
  anchor.dataset['name'] = room.name
  anchor.text = room.name
  anchor.onclick = function (event) {
    event.preventDefault()
    QiscusSDK.core.getRoomById(room.id)
    $('.request-btn').removeClass('hidden')
  }
  var dom = document.createElement('li')
  dom.appendChild(anchor)
  return dom
}
function mapRoomData (room) {
  return {
    id: room.id,
    name: room.room_name
  }
}
function loadRoomList () {
  var url = 'https://sdksample.qiscus.com/api/v2/sdk/user_rooms'
  var token = QiscusSDK.core.userData.token
  var $roomList = $('.room-list')
  $.get(url + '?token=' + token)
    .done(function (res) {
      var rooms = res.results.rooms_info
      var roomsDOM = rooms
        .map(mapRoomData)
        .map(createRoomDOM)
      roomsDOM.forEach(function (dom) {
        $roomList.append(dom)
      })
      removeOverlay()
    })
    .fail(function (err) {
      console.log('failure getting rooms', err)
    })
}
function removeOverlay () {
  $('.overlay').css({display: 'none'})
}
// Here we attach event listener on the chat bubble
// to prevent the default behavior of it, instead of
// opening new tab based on the link
// it will open a new "mini" window
function attachBubbleClickListener () {
  // Regexp to filter if the chat bubble is really something
  // that we want to prevent
  // url comming from android "deep-link":
  // qiscus://com.android.streamer/ROOM_NAME
  var reRoomName = /^qiscus:\/\/com\.android\.streamer\/([a-zA-Z0-9]+)/i
  // "mini" window video viewer url
  var viewerURL = window.location.href + '/viewer.html?url=rtmp://rtc.qiscus.com:2935/live360p/'

  // Here we attach the click event listener to link
  // that href attribute start with `qiscus`
  $('body').on('click', 'a[href^=qiscus]', function (event) {
    event.preventDefault()
    event.stopPropagation()
    // here we get the real href from chat bubble
    var text = $(this).attr('href')
    // ... then get the real url
    var isRTMP = text.match(reRoomName)
    // ... if it is the url we want continue, else skip
    if (isRTMP) {
      // ... get the room name from the url, because that what we only needed
      var roomName = isRTMP[1]
      // ... if it was a request stream bubble prevent the user
      // and show a modal, about why it is being prevented
      if (roomName === 'request') {
        $('.modal-container').toggleClass('hidden')
        return
      }
      // ... build the full url, and open the "mini" window,
      // to show the video previewer
      var fullURL = viewerURL + roomName
      window.open(fullURL, 'Viewer', 'modal=1,status=0,height=600,width=800,location=0')
      return false
    }
  })
}
// This function is used to send a request stream to the other participants
function handleRequestButtonClick (event) {
  event.preventDefault()
  // ... here we generate a uniqueId for the message
  // hence I just using timestamp, because it is always different, and
  // easy to get.
  var uniqueId = new Date().getTime()
  // ... room name for the requested stream
  // here we use "request" as room name as requested by android developer
  var roomName = 'request'
  // here is the "payload" for posting postback comment / message
  var payload = {
    // text to appear inside the bubble
    text: 'Hi, I requested a video streaming',
    // button configuration as array (yep, you can have more than 1 button)
    buttons: [
      {
        // button label
        label: 'Start stream',
        type: 'link',
        payload: {
          // android "deep-link" scheme
          url: 'qiscus://com.android.streamer/' + roomName
        }
      }
    ]
  }
  var stringifiedPayload = JSON.stringify(payload)
  qiscus.submitComment(
    // Current roomId
    qiscus.selected.id,
    // Comment text
    'Hi aku request video streaming',
    // uniqueId
    uniqueId,
    // comment type (default to "text")
    'buttons',
    // payload (optional, only used when posting non-text comment)
    stringifiedPayload
  )
}

$(document).ready(function () {
  init()
  attachBubbleClickListener()
  $('body').on('click', '.request-btn', handleRequestButtonClick)
  $('body').on('click', '.modal-container .close-btn', function (event) {
    event.preventDefault()
    $('.modal-container').addClass('hidden')
  })
})
