// Here, we prepare target user by hardcode them
// name is user for display name for the suer
// email is used for their "id" inside qiscus
// isRegistered is used for hepler, so the user will be registered first
// ... before we can chat to them.
var users = Array.from(new Array(5).keys())
  .map(function (id) { return id + 1 })
  .map(function (id) {
    return {
      name: 'User ' + id,
      email: 'user-' + id + '@email.com',
      isRegistered: false
    }
  })
window.users = users

function init() {
  QiscusSDK.core.init({
    AppId: 'sdksample',
    mode: 'wide',
    options: {
      loginSuccessCallback: function (data) {
        var email = data.results.user.email
        // patch user data, so its `isRegistered` is set to true
        var userIndex = _.findIndex(users, {email: email})
        if (email === 'user-0@email.com') {
          $('.overlay').css({display: 'none'})
          loadRoomList()
          return
        }
        users[userIndex].isRegistered = true

        // if all hardcoded user is registered
        // set the "main" user, so we can start the application
        var isAllUserRegistered = _.every(users, 'isRegistered')
        if (isAllUserRegistered) {
          QiscusSDK.core.setUser('user-0@email.com', 'password', 'User 0')
        }
      }
    }
  })
  users.forEach(user => QiscusSDK.core.setUser(user.email, 'password', user.name))
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
      console.log('roomsDOM', roomsDOM)
    })
    .fail(function (err) {
      console.log('failure getting rooms', err)
    })
}

$(document).ready(function () {
  init()
})
