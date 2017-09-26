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
function attachBubbleClickListener () {
  console.log('attach event')
  var reRTMP = /rtmp:\/\/(\S+)/
  var viewerURL = '/viewer.html?url='

  $('body').on('click', '.qcw-comment__message', function (event) {
    event.stopPropagation()
    var text = $(this).find('.qcw-comment__content').text()
    var isRTMP = text.match(reRTMP)
    if (isRTMP) {
      var rtmpURL = isRTMP[0]
      var fullURL = viewerURL + rtmpURL
      window.open(fullURL, 'Viewer', 'modal=1,status=0,height=600,width=800,location=0')
      return false
    }
  })
}
function handleRequestButtonClick (event) {
  event.preventDefault()
  const uniqueId = new Date().getTime()
  const payload = {
    text: 'Hi, I requested a video streaming',
    buttons: [
      {
        label: 'Open',
        type: 'link',
        payload: {
          method: '',
          url: 'qiscus://com.android.streamer/' + qiscus.selected.id
        }
      }
    ]
  }
  var stringifiedPayload = JSON.stringify(payload)
  qiscus.submitComment(
    qiscus.selected.id,
    'Hi aku request video streaming',
    uniqueId,
    'buttons',
    stringifiedPayload
  )
}

$(document).ready(function () {
  init()
  attachBubbleClickListener()
  $('body').on('click', '.request-btn', handleRequestButtonClick)
})
