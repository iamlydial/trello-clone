import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BoardInterface } from '../../shared/types/board.interface';
import { SocketService } from '../../shared/services/socket.service';
import { SocketEventEnum } from '../../shared/types/socketEvents.enum';

@Injectable()
export class BoardService {
  board$ = new BehaviorSubject<BoardInterface | null>(null);

  constructor(private socketService: SocketService){}

  setBoard(board: BoardInterface): void {
    this.board$.next(board);
  }

  leaveBoard(boardId: string): void {
    this.board$.next(null);
    this.socketService.emit(SocketEventEnum.boardsLeave, {
      boardId
    })
  }
}
