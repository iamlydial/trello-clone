import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { Socket } from "./types/socket.interface";
import mongoose, { Mongoose, mongo } from "mongoose";
import * as usersControllers from "./controllers/users";
import * as boardControllers from "./controllers/boards";
import * as columnsControllers from "./controllers/columns";
import * as tasksControllers from "./controllers/tasks";

import bodyParser from "body-parser";
import authMiddleware from "./middlewares/auth";
import cors from "cors";
import jwt from "jsonwebtoken";
import { SocketEventEnum } from "./types/socketEvents.enum";
import { secret } from "./config";
import User from "./models/user";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.set("toJSON", {
  virtuals: true,
  transform: (_, converted) => {
    delete converted._id;
  },
});

//express
app.get("/", (req, res) => {
  res.send("API is up");
});

app.post("/api/users", usersControllers.register);
app.post("/api/users/login", usersControllers.login);
app.get("/api/user", authMiddleware, usersControllers.currentUser);
app.get("/api/boards", authMiddleware, boardControllers.getBoards);
app.post("/api/boards", authMiddleware, boardControllers.createBoard);
app.get("/api/boards/:boardId", authMiddleware, boardControllers.getBoard);
app.get(
  "/api/boards/:boardId/columns",
  authMiddleware,
  columnsControllers.getColumns
);
app.get(
  "/api/boards/:boardId/tasks",
  authMiddleware,
  tasksControllers.getTasks
);

//socket io
io.use(async (socket: Socket, next) => {
  try {
    const token = (socket.handshake.auth.token as string) ?? "";
    const data = jwt.verify(token.split(" ")[1], secret) as {
      id: string;
      email: string;
    };
    const user = await User.findById(data.id);

    if (!user) {
      return next(new Error("Authentication Error"));
    }
    socket.user = user;
    next();
  } catch (err) {
    next(new Error("Authentication Error"));
  }
}).on("connection", (socket) => {
  socket.on(SocketEventEnum.boardsJoin, (data) => {
    boardControllers.joinBoard(io, socket, data);
  });
  socket.on(SocketEventEnum.boardsLeave, (data) => {
    boardControllers.leaveBoard(io, socket, data);
  });
  socket.on(SocketEventEnum.columnsCreate, (data) => {
    columnsControllers.createColumn(io, socket, data);
  });
  socket.on(SocketEventEnum.tasksCreate, (data) => {
    tasksControllers.createTask(io, socket, data);
  });
  socket.on(SocketEventEnum.boardsUpdate, (data) => {
    boardControllers.updateBoard(io, socket, data);
  });
});

//mongoose
mongoose.connect("mongodb://localhost:27017/trello-clone").then(() => {
  console.log("connected to mongo db");
  //http to start server
  httpServer.listen(4001, () => {
    console.log("API is listening on port 4001");
  });
});
