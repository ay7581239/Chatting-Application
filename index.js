const http = require('http');
const path = require('path');
const express= require('express');
const app = express();
const {Server}= require('socket.io');

const server = http.createServer(app);
const io = new Server(server);
const users = {};
//Server-side socket.io setup
io.on("connection", (socket)=>{
     socket.on("register-user", (userId) => {
        users[userId] = socket.id;
        //console.log(`User ${userId} registered with socket ID ${socket.id}`);
    });
    socket.on("user-message",({targetUserIds,message})=>{
        targetUserIds.forEach(targetUserId => {
            const targetSocketId = users[targetUserId];
            if(targetSocketId){
                io.to(targetSocketId).emit('server-message', message);
                //console.log(`Message sent to ${targetUserId}: ${message}`);
            }
        });
    
    })
});
io.on("disconnect", (socket)=>{
    for (const userId in users) {
        if (users[userId] === socket.id) {
            delete users[userId];
            //console.log(`User ${userId} disconnected.`);
            break;
        }
    }
});

app.use(express.static(path.resolve('public')));
app.get(('/'),(req,res)=>{
    res.sendFile('./public/index.html');
});
server.listen(3000,()=>{console.log('Server is running on port 3000')});