let windowPath = window.location.pathname
let roomName = windowPath.startsWith('/rooms/') ? windowPath.split('/rooms/')[1] : null
console.log(roomName)

const socket = io('/', {
  query : {
    room : roomName
  }
});

const messages = document.getElementById('messages');
const msgForm = document.getElementById('msgForm');
const input = document.getElementById('msgInput');
const author = document.getElementById('authorInput')

const userCountUI = document.getElementById("usercount")

let password = prompt("What is the password")
socket.emit("password attempt", password)

msgForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (input.value && author.value) {
    socket.emit('message', [input.value, author.value]);
    input.value = '';
  }
});

socket.on("failed password", () => {
  window.location = "/deadend"
})

socket.on('message', (msgData) => {
  var item = document.createElement('li');
  item.id = "sentMsgText"
  item.textContent = msgData[1] + ": " + msgData[0];
  messages.appendChild(item);
  item.scrollIntoView(false)
});

socket.on("user-count update", (userCount) => {
  userCountUI.innerHTML = `${userCount} users online`
})
