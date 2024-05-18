const http = require("http");
const express = require("express");
const socketIO = require("socket.io");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 4500; // Correct order for port selection
const users = {}; // Changed to an object for better user management

app.use(cors());

app.get("/", (req, res) => {
    res.send("Hello ITS WORKING");
});

const server = http.createServer(app);
const io = socketIO(server);

io.on("connection", (socket) => {
    console.log("New connection");

    socket.on('joined', ({ user }) => {
        users[socket.id] = user; // Use socket.id to map the user
        console.log(`${user} has joined`);
        socket.emit('welcome', { user: "Admin", message: `Welcome to the chat, ${user}` });
        socket.broadcast.emit('userJoined', { user: "Admin", message: `${user} has joined` });
    });

    socket.on('message', ({ message, id }) => {
        io.emit('sendMessage', { user: users[id], message, id });
    });

    socket.on('disconnect', () => {
        socket.broadcast.emit('leave', { user: "Admin", message: `${users[socket.id]} has left` });
        console.log(`${users[socket.id]} has left`);
        delete users[socket.id]; // Remove user from the list when they disconnect
    });
});

server.listen(port, () => {
    console.log(`Server is working on http://localhost:${port}`);
});
