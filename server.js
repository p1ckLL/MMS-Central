require('dotenv').config();

const express = require('express');
const { get } = require('express/lib/response');
const app = express();
const http = require('http').Server(app)
const io = require("socket.io")(http);
const MongoClient = require("mongodb").MongoClient

let userCount = io.engine.clientsCount
let backupMode = false
let shutdown = false

app.use(express.json())
app.use(express.static("static"))

function handleMessage(socket, msgData, mmsDB){
    let currentRoom = socket.handshake.query.room
    let msgObj = {message : msgData[0], author : msgData[1], room : currentRoom, isOfficial : false}
    
    if (msgObj.author == process.env.PICKLE) {
        msgObj.author = "pickle [OFFICIAL USER]"
        msgObj.isOfficial = true
    }
    if (msgObj.author == process.env.BRANDON) {
        msgObj.author = "Brandon [OFFICIAL USER]"
        msgObj.isOfficial = true
    }
    if (msgObj.author == process.env.ATTICUS) {
        msgObj.author = "atticus [OFFICIAL USER]"
        msgObj.isOfficial = true
    }
    if (msgObj.author == process.env.JEAN) {
        msgObj.author = "jean-carlo [OFFICIAL USER]"
        msgObj.isOfficial = true
    }

    if (msgObj.author == process.env.EDEN) {
        msgObj.author = "Eden [OFFICIAL USER]"
        msgObj.isOfficial = true
    }

    if (msgObj.author == process.env.NIKA) {
        msgObj.author = "nika<3 [OFFICIAL USER]"
        msgObj.isOfficial = true
    }

    io.to(currentRoom).emit('message', msgObj)
    mmsDB.collection("msgCollection").insertOne(msgObj, (err, res) => {
        if (err) throw err
    })
}

function handleSocketDisconnection(){
    console.log('a user disconnected');
    userCount--
    io.emit("user-count update", userCount)
}

function handleSocketConnection(socket, mmsDB){ 
    console.log('a user connected');
    userCount++
    io.emit("user-count update", userCount)

    socket.on('disconnect', () => {
        handleSocketDisconnection()
    })
    socket.on('message', (msgData) => {
        handleMessage(socket, msgData, mmsDB)
    })
    socket.on('password attempt', (guess) => {
        if (backupMode == false && guess == process.env.SECRET_PASSWORD || backupMode == true && guess == process.env.FALLBACK_PASSWORD || guess == process.env.DEV_PASSWORD){
            io.to(socket.id).emit("user-count update", userCount)
        } else {
            io.to(socket.id).emit("failed password")
        }
    })
    socket.on('code attempt', (code) => {
        if (code == process.env.BACKUP_CODE){
            backupMode = !backupMode
            io.emit('refresh')
        }
        if (code == process.env.SHUTDOWN_CODE) {
            shutdown = !shutdown
            io.emit('refresh')
        }
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
