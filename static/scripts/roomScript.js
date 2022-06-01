const socket = io();

const roomForm = document.getElementById("roomForm")

roomForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const roomName = document.getElementById("roomName").value
    window.location = `/rooms/${roomName}`
})