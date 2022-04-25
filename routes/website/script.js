var socket = io();

var messages = document.getElementById('messages');
var form = document.getElementById('form');
var input = document.getElementById('input');
var author = document.getElementById('author')

form.addEventListener('submit', function (e) {
  e.preventDefault();
  if (input.value) {
    socket.emit('message', [input.value, author.value]);
    input.value = '';
  }
});

socket.on('message', function (msgData) {
  console.log("client received message")
  var item = document.createElement('li');
  item.textContent = msgData[1] + ": " + msgData[0];
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});
