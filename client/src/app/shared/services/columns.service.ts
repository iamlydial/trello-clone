import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ColumnInterface } from '../types/columns.interface';
import { environment } from '../../../environments/environment';
import { ColumnInputInterface } from '../types/columnInput.interface';
import { SocketService } from './socket.service';
import { SocketEventEnum } from '../types/socketEvents.enum';

@Injectable()
export class ColumnsService {
  constructor(private http: HttpClient, private socketService: SocketService) {}

  getColumns(boardId: string): Observable<ColumnInterface[]> {
    const url = `${environment.apiUrl}/boards/${boardId}/columns`;
    return this.http.get<ColumnInterface[]>(url);
  }

  createColumn(columnInput: ColumnInputInterface): void {
    this.socketService.emit(SocketEventEnum.columnsCreate, columnInput);
  }
  
  updateColumn(boardId: string, columnId: string, fields: { title: string }) {
    this.socketService.emit(SocketEventEnum.columnsUpdate, {
      boardId,
      columnId,
      fields,
    });
  }

  deleteColumn(boardId: string, columnId: string): void {
    this.socketService.emit(SocketEventEnum.columnsDelete, {
      boardId,
      columnId,
    });
  }
}
