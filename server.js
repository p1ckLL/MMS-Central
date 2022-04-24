require('dotenv').config();

const express = require('express');
const app = express();
const http = require('http').Server(app)
const io = require("socket.io")(http);

app.use(express.json())
app.use(express.static("./routes/website"))

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('disconnect', () => {
        console.log('a user disconnected');
    });

    socket.on('message', (msgData) => {
        io.emit('message', msgData)
    })
});

app.get('/', (req, res) => {
    res.send(__dirname + '/routes/website/index.html');
});

var port = Number(process.env.PORT)
http.listen(port, () => {
    console.log(`listening on port ${port}`);
});