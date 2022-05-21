const socket = io()

let password = prompt("What is the password")
socket.emit("password attempt", password)

const devcmdForm = document.getElementById('devcmdForm')
const devcode = document.getElementById('devcode')
const devcodetarget = document.getElementById('devcodetarget')

socket.on("failed password", () => {
    window.location = "/deadend"
})

devcmdForm.addEventListener('submit', (e) => {
    e.preventDefault()
    console.log(devcode)
    socket.emit("code attempt", [devcode.value, devcodetarget.value])
})