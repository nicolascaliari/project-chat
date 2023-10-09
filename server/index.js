import express from "express";
import http from "http";
import morgan from "morgan";
import { Server as SocketServer } from "socket.io";
import { resolve, dirname } from "path";

import { PORT } from "./config.js";
import cors from "cors";

const app = express();
const server = http.createServer(app);
const io = new SocketServer(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(resolve("client/dist")));

const users = {};
const typingUsers = {};

/**
 * se ejecuta cada vez que un cliente se conecta al servidor
 */
io.on("connection", (socket) => {
  console.log(`new connection ${socket.id}`);
  socket.on("join", (username) => {
    users[socket.id] = username;
    console.log(`${username} joined the chat`);
    socket.broadcast.emit("message", {
      body: `${username} joined the chat`,
      from: "System",
    });
  });

  socket.on("message", (body) => {
    const username = users[socket.id];
    if (username) {
      socket.broadcast.emit("message", {
        body,
        from: username,
      });
    }
  });

  socket.on("typing", () => {
    const username = users[socket.id];
    if (username) {
      typingUsers[socket.id] = true;
      socket.broadcast.emit("typing", username);
    }
  });

  socket.on("stopTyping", () => {
    const username = users[socket.id];
    if (username) {
      delete typingUsers[socket.id];
      socket.broadcast.emit("stopTyping", username);
    }
  });

  socket.on("disconnect", () => {
    const username = users[socket.id];
    if (username) {
      delete users[socket.id];
      delete typingUsers[socket.id];
      console.log(`${username} left the chat`);
      socket.broadcast.emit("message", {
        body: `${username} left the chat`,
        from: "System",
      });
    }
  });
});

server.listen(PORT);
console.log(`server on port ${PORT}`);
