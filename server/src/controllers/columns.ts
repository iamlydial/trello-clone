import { NextFunction, Response } from "express";
import { ExpressRequestInterface } from "../types/expressRequest.interface";
import ColumnModel from "../models/column";

import { SocketEventEnum } from "../types/socketEvents.enum";
import { getErrorMessage } from "../helpers";
import { Server } from "socket.io";
import { Socket } from "../types/socket.interface";

export const getColumns = async (
  req: ExpressRequestInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }

    console.log("User LLL:", req.user);
    console.log("Board ID:", req.params.boardId);

    const columns = await ColumnModel.find({
      boardId: req.params.boardId,
    });
    res.send(columns);
  } catch (err) {
    next(err);
  }
};

export const createColumn = async (
  io: Server,
  socket: Socket,
  data: { boardId: string; title: string }
) => {
  try {
    if (!socket.user) {
      socket.emit(
        SocketEventEnum.columnsCreateFailure,
        "User is not authorized"
      );
      return;
    }
    const newColumn = new ColumnModel({
      title: data.title,
      boardId: data.boardId,
      userId: socket.user.id,
    });
    const savedColumn = await newColumn.save();
    io.to(data.boardId).emit(SocketEventEnum.columnsCreateSuccess, savedColumn);
    console.log("savedColumn", savedColumn);
  } catch (err) {
    socket.emit(SocketEventEnum.columnsCreateFailure, getErrorMessage(err));
  }
};

export const deleteColumn = async (
  io: Server,
  socket: Socket,
  data: { boardId: string; columnId: string }
) => {
  try {
    if (!socket.user) {
      socket.emit(
        SocketEventEnum.columnsDeleteFailure,
        "User is not authorized"
      );
      return;
    }
    await ColumnModel.deleteOne({ _id: data.columnId });
    io.to(data.boardId).emit(
      SocketEventEnum.columnsDeleteSuccess,
      data.columnId
    );
  } catch (err) {
    socket.emit(SocketEventEnum.boardsDeleteFailure, getErrorMessage(err));
  }
};
