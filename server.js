require('dotenv').config();

const express = require('express');
const app = express();
const http = require('http').Server(app)
const io = require("socket.io")(http);
const MongoClient = require("mongodb").MongoClient

let userCount = 0
let backupMode = false
let shutdown = false
let announcement = ''

app.use(express.json())
app.use(express.static("static"))

const officialUsers = {"pickle" : process.env.PICKLE, "Brandon" : process.env.BRANDON, "atticus" : process.env.ATTICUS, "jean-carlo" : process.env.JEAN, "Eden" : process.env.EDEN, "nika<3" : process.env.NIKA, "Pearson" : process.env.PEARSON, "Truman" : process.env.TRUMAN}

function handleCodeAttempt(code) {
    if (code == process.env.BACKUP_CODE){
        backupMode = !backupMode
        io.emit('refresh')
    }
    if (code == process.env.SHUTDOWN_CODE) {
        shutdown = !shutdown
        io.emit('refresh')
    }
    if (code.split("=")[0] == process.env.ANNOUNCE_CODE) {
        announcement = code.split("=")[1]
    }
}

function handlePasswordAttempt(socket, guess) {
    if (backupMode == false && guess == process.env.SECRET_PASSWORD || backupMode == true && guess == process.env.FALLBACK_PASSWORD || guess == process.env.DEV_PASSWORD){
        io.to(socket.id).emit("pwd success")
        socket.loggedIn = true
        userCount++
        io.emit("user-count update", userCount)
    } else {
        io.to(socket.id).emit("failed password")
    }
}

function handleMessage(socket, msgData, mmsDB){
    let currentRoom = socket.handshake.query.room
    let msgObj = {message : msgData[0], author : msgData[1], room : currentRoom, isOfficial : false}
    
    const keys = Object.keys(officialUsers)
    keys.forEach( (key, i) => {
        if (msgObj.author == officialUsers[key]) {
            msgObj.author = key + " [OFFICIAL]"
            msgObj.isOfficial = true
        }
    })

    io.to(currentRoom).emit('message', msgObj)
    mmsDB.collection("msgCollection").insertOne(msgObj, (err, res) => {
        if (err) throw err
    })
}

function handleSocketDisconnection(socket){
    console.log('a user disconnected')
    if (socket.loggedIn) {
        userCount--
        io.emit("user-count update", userCount)
    }
}

function handleSocketConnection(socket, mmsDB){ 
    console.log('a user connected');
    io.to(socket.id).emit("announcement", announcement)
    socket.loggedIn = false

    socket.on('disconnect', () => {
        handleSocketDisconnection(socket)
    })
    socket.on('message', (msgData) => {
        handleMessage(socket, msgData, mmsDB)
    })
    socket.on('password attempt', (guess) => {
        handlePasswordAttempt(socket, guess)
    })
    socket.on('code attempt', (code) => {
        handleCodeAttempt(code)
    })
}

MongoClient.connect(process.env.DATABASE_URL, (err, db) => {
    if (err) throw err
    const mmsDB = db.db("mmsDB")

    io.on('connection', (socket) => {
        let room = socket.handshake.query.room
        socket.join(room)
        handleSocketConnection(socket, mmsDB)
    });
})

app.get('/', (req, res) => {
    if (shutdown == false) {
        res.redirect('/rooms/public')
    } else {
        res.sendFile(__dirname + '/src/shutdown.html')
    }
});

app.get('/rooms/:room', (req, res) => {
    if (shutdown == false){
        res.sendFile(__dirname + '/src/main.html')
    } else {
        res.sendFile(__dirname + '/src/shutdown.html')
    }
})

app.get('/rooms', (req, res) => {
    if (shutdown == false){
        res.sendFile(__dirname + '/src/room.html')
    } else {
        res.sendFile(__dirname + '/src/shutdown.html')
    }
})

app.get('/deadend', (req, res) => {
    if (shutdown == false){
        res.sendFile(__dirname + '/src/deadend.html')
    } else {
        res.sendFile(__dirname + '/src/shutdown.html')
    }
})

app.get('/deadpage/devcontrol', (req, res) => {
    res.sendFile(__dirname + '/src/devcontrol.html')
})

var port = Number(process.env.PORT)
http.listen(port, () => {
    console.log(`listening on port ${port}`);
});
