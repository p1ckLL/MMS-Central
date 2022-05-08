const socket = io();

const roomForm = document.getElementById("roomForm")
//const private = document.getElementById("private");
//const joinButton = document.getElementById("joinBtn");

roomForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const roomName = document.getElementById("roomName").value
    window.location = `/rooms/${roomName}`
})