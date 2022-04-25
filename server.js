require('dotenv').config();

const express = require('express');
const app = express();
const http = require('http').Server(app)
const io = require("socket.io")(http);
const MongoClient = require("mongodb").MongoClient

const userCountUI = document.getElementById("usercount")

let userCount = 0

app.use(express.json())
app.use(express.static("./routes/website"))

MongoClient.connect(process.env.DATABASE_URL, function(err, db){
    if (err) throw err
    const msgDB = db.db("msgDB")

    io.on('connection', (socket) => {
        console.log('a user connected');
        userCount++
        userCountUI.innerHTML = `${userCount} users online`
    
        socket.on('disconnect', () => {
            console.log('a user disconnected');
            userCount--
            userCountUI.innerHTML = `${userCount} users online`
        });
    
        socket.on('message', (msgData) => {
            io.emit('message', msgData)
            msgObj = {message : msgData[0], author : msgData[1]}
            msgDB.collection("chatroom").insertOne(msgObj,function(err, res){
                if (err) throw err
                console.log("message uploaded to db")
                db.close()
            })
        })
    });
})

app.get('/', (req, res) => {
    res.send(__dirname + '/routes/website/index.html');
});

var port = Number(process.env.PORT)
http.listen(port, () => {
    console.log(`listening on port ${port}`);
});
