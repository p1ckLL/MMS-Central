let windowPath = window.location.pathname
let roomName = windowPath.startsWith('/rooms/') ? windowPath.split('/rooms/')[1] : null
console.log(roomName)

let socket = io('/', {
  query : {
    room : roomName
  }
});

const messages = document.getElementById('messages');
const msgForm = document.getElementById('msgForm');
const input = document.getElementById('msgInput');
const author = document.getElementById('authorInput')
const sendButton = document.getElementById('sendButton')

const userCountUI = document.getElementById("usercount")

<<<<<<< HEAD
pwdForm.addEventListener('submit', (e) => {
  e.preventDefault()

  socket.emit("password attempt", pwd.value)

  socket.on("pwd success", () => {
    pwdForm.style.display = "none"
    msgForm.style.display = "flex"

    msgForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (input.value && author.value.trim() != '') {
        socket.emit('message', [input.value, author.value]);
        input.value = '';
        sendButton.disabled = true
        setTimeout(() => {
          sendButton.disabled = false
        }, 700)
      } else {
        author.value = 'stop using an invisible name nerd'
      }
    });
    
    socket.on("failed password", () => {
      window.location = "/deadend"
    })
    
    socket.on('message', (msgObj) => {
      var item = document.createElement('li');
      item.id = "sentMsgText"
      item.textContent = msgObj.author + ": " + msgObj.message;
      if (msgObj.isOfficial == true) {
        item.style.color = 'red'
      }
      messages.appendChild(item);
      item.scrollIntoView(false)
    });
    
    socket.on("user-count update", (userCount) => {
      userCountUI.innerHTML = `${userCount} users online`
    })
    
    socket.on("refresh", () => {
      window.location.reload()
    })
  })
})
=======
let password = prompt("What is the password")
socket.emit("password attempt", password)

msgForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (input.value && author.value.trim() != '') {
    socket.emit('message', [input.value, author.value]);
    input.value = '';
    sendButton.disabled = true
    setTimeout(() => {
      sendButton.disabled = false
    }, 700)
  } else {
    author.value = 'stop using an invisible name nerd'
  }
});

socket.on("failed password", () => {
  window.location = "/deadend"
})

socket.on('message', (msgObj) => {
  var item = document.createElement('li');
  item.id = "sentMsgText"
  item.textContent = msgObj.author + ": " + msgObj.message;
  if (msgObj.isOfficial == true) {
    item.style.color = 'red'
  }
  messages.appendChild(item);
  item.scrollIntoView(false)
});

socket.on("user-count update", (userCount) => {
  userCountUI.innerHTML = `${userCount} users online`
})

socket.on("refresh", () => {
  window.location.reload()
})
>>>>>>> parent of 7a33406 (hidden password system)
