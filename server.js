require('dotenv').config();

const express = require('express');
const app = express();
const http = require('http').Server(app)
const io = require("socket.io")(http);
const MongoClient = require("mongodb").MongoClient

let userCount = io.engine.clientsCount

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
        if (guess == process.env.SECRET_PASSWORD){
            console.log("pass guess success")
            io.to(socket.id).emit("user-count update", userCount)
        } else {
            io.to(socket.id).emit("failed password")
        }
    })
}

MongoClient.connect(process.env.DATABASE_URL, (err, db) => {
    if (err) throw err
    const mmsDB = db.db("mmsDB")

    io.on('connection', (socket) => {
        let room = socket.handshake.query.room
        console.log(room)
        socket.join(room)
        handleSocketConnection(socket, mmsDB)
    });
})

app.get('/', (req, res) => {
    res.redirect('/rooms/public')
});

app.get('/rooms/:room', (req, res) => {
    res.sendFile(__dirname + '/src/main.html');
})

app.get('/rooms', (req, res) => {
    res.sendFile(__dirname + '/src/room.html')
})

app.get('/deadend', (req, res) => {
    res.sendFile(__dirname + '/src/deadend.html')
})

var port = Number(process.env.PORT)
http.listen(port, () => {
    console.log(`listening on port ${port}`);
});
