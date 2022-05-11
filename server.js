require('dotenv').config();

const express = require('express');
const app = express();
const http = require('http').Server(app)
const io = require("socket.io")(http);
const MongoClient = require("mongodb").MongoClient

let userCount = 0

app.use(express.json())
app.use(express.static("static"))

function handleMessage(socket, msgData, mmsDB){
    let currentRoom = socket.handshake.query.room
    
    io.to(currentRoom).emit('message', msgData)
    msgObj = {message : msgData[0], author : msgData[1], room : currentRoom}
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

var port = Number(process.env.PORT)
http.listen(port, () => {
    console.log(`listening on port ${port}`);
});
