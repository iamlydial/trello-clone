import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose, { Mongoose, mongo } from "mongoose";
import * as usersControllers from "./controllers/users";
import * as boardControllers from "./controllers/boards";
import bodyParser from "body-parser";
import authMiddleware from "./middlewares/auth";
import cors from "cors";
import { SocketEventEnum } from "./types/socketEvents.enum";

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

//socket io
io.on("connection", (socket) => {
  socket.on(SocketEventEnum.boardsJoin, (data) => {
    boardControllers.joinBoard(io, socket, data);
  });
  socket.on(SocketEventEnum.boardsLeave, (data) => {
    boardControllers.leaveBoard(io, socket, data);
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
