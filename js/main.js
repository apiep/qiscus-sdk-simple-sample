function init() {
  QiscusSDK.core.init({
    AppId: 'sdksample',
    mode: 'wide',
    options: {
      loginSuccessCallback: function (data) {
        loadRoomList()
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

$(document).ready(function () {
  init()
})
