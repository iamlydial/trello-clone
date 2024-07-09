import { NextFunction, Response } from "express";
import { ExpressRequestInterface } from "../types/expressRequest.interface";
import TaskModel from "../models/task";

import { SocketEventEnum } from "../types/socketEvents.enum";
import { getErrorMessage } from "../helpers";
import { Server } from "socket.io";
import { Socket } from "../types/socket.interface";

export const getTasks = async (
  req: ExpressRequestInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }

    console.log("User:", req.user);
    console.log("Task ID:", req.params.taskId);

    const tasks = await TaskModel.find({
      boardId: req.params.boardId,
    });
    res.send(tasks);
  } catch (err) {
    next(err);
  }
};

export const createTask = async (
  io: Server,
  socket: Socket,
  data: { boardId: string; title: string; columnId: string }
) => {
  try {
    if (!socket.user) {
      socket.emit(SocketEventEnum.tasksCreateFailure, "User is not authorized");
      return;
    }
    const newTask = new TaskModel({
      title: data.title,
      boardId: data.boardId,
      userId: socket.user.id,
      columnId: data.columnId,
    });
    const savedTask = await newTask.save();
    io.to(data.boardId).emit(SocketEventEnum.tasksCreateSuccess, savedTask);
    console.log("savedTask", savedTask);
  } catch (err) {
    socket.emit(SocketEventEnum.columnsCreateFailure, getErrorMessage(err));
  }
};

export const updateTask = async (
  io: Server,
  socket: Socket,
  data: {
    boardId: string;
    taskId: string;
    fields: { title?: string; description?: string; columnId?: string };
  }
) => {
  try {
    if (!socket.user) {
      socket.emit(SocketEventEnum.tasksUpdateFailure, "User is not authorized");
      return;
    }
    const updatedTask = await TaskModel.findByIdAndUpdate(
      data.taskId,
      data.fields,
      {
        new: true,
      }
    );
    io.to(data.boardId).emit(SocketEventEnum.tasksUpdateSuccess, updatedTask);
  } catch (err) {
    socket.emit(SocketEventEnum.tasksUpdateFailure, getErrorMessage(err));
  }
};

export const deleteTask = async (
  io: Server,
  socket: Socket,
  data: { boardId: string; taskId: string }
) => {
  try {
    if (!socket.user) {
      socket.emit(SocketEventEnum.tasksDeleteFailure, "User is not authorized");
      return;
    }
    await TaskModel.deleteOne({ _id: data.taskId });
    io.to(data.boardId).emit(SocketEventEnum.tasksDeleteSuccess, data.taskId);
  } catch (err) {
    socket.emit(SocketEventEnum.tasksDeleteFailure, getErrorMessage(err));
  }
};
