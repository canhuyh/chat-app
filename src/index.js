// phía server
const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const Filter = require("bad-words");

//utils
const { generateMessage, generateLocationMessage } = require("../utils");
//
const { createUser, getUserInfo, getUsersInRoom, removeUser } = require("../db/user");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectory = path.join(__dirname, "../public");

app.use(express.static(publicDirectory));

io.on("connection", (socket) => {
  //
  console.log("New websocket connection");
  //create room
  socket.on("joinRoom", function ({ username, room }, callback) {
    //create
    if (!createUser(socket.id, username, room)) {
      return callback("Username is exists!");
    }
    socket.join(room);
    socket.emit("message", generateMessage(`Welcome ${username}`, "Admin"));
    io.to(room).emit("roomData", {
      room: room,
      users: getUsersInRoom(room),
    });

    socket.broadcast.to(room).emit("message", generateMessage(`${username} has come!`, "Admin"));
  });

  // chỉ gửi đến client đang kết nối với socket và thực hiện sự kiện
  //socket.emit("countUpdate", count);
  // gửi đến toàn độ client kết nối với socket khi có sự kiện xảy ra từ 1 client bất kỳ

  //gửi mess
  //socket.emit("message", generateMessage("Wellcome!!!"));

  //socket.broadcast.emit("message", generateMessage("A new user has joined!"));

  //message
  socket.on("sendMessage", (message, callback) => {
    const filter = new Filter();
    //Validate không cho chữi bậy
    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed!!!");
    }
    const user_info = getUserInfo(socket.id);

    io.to(user_info.room).emit("message", generateMessage(message, user_info.username, user_info._id));
    callback();
  });
  //Location
  socket.on("sendLocation", (coords, callback) => {
    const user_info = getUserInfo(socket.id);
    io.to(user_info.room).emit("locationMessage", generateLocationMessage(coords.lat, coords.long, user_info.username, user_info._id));

    callback();
  });

  socket.on("disconnect", () => {
    const user = getUserInfo(socket.id);
    if (user) {
      io.to(user.room).emit("message", generateMessage(`${user.username} has left!`, "Admin"));
      removeUser(socket.id);
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(port, () => {
  console.log("LISTENING: " + port);
});
