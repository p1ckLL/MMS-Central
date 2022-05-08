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

msgForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (input.value && author.value) {
    socket.emit('message', [input.value, author.value]);
    input.value = '';
  }
});

socket.on('message', (msgData) => {
  console.log("client received message")
  var item = document.createElement('li');
  item.textContent = msgData[1] + ": " + msgData[0];
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});

socket.on("user-count update", (userCount) => {
  userCountUI.innerHTML = `${userCount} users online`
})
