import { Component, OnInit } from '@angular/core';
import { BoardsService } from '../../shared/services/boards.service';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { BoardModule } from '../board.module';
import { BoardService } from '../services/board.service';
import { Observable, combineLatest, filter, map } from 'rxjs';
import { BoardInterface } from '../../shared/types/board.interface';
import { SocketService } from '../../shared/services/socket.service';
import { SocketEventEnum } from '../../shared/types/socketEvents.enum';
import { ColumnsService } from '../../shared/services/columns.service';
import { ColumnInterface } from '../../shared/types/columns.interface';
import { ColumnInputInterface } from '../../shared/types/columnInput.interface';
import { TaskInterface } from '../../shared/types/tasks.interface';
import { TasksService } from '../../shared/services/tasks.service';
import { TaskInputInterface } from '../../shared/types/taskInput.interface';

@Component({
  selector: 'board',
  templateUrl: './board.component.html',
})
export class BoardComponent implements OnInit {
  boardId: string;
  data$: Observable<{
    board: BoardInterface;
    columns: ColumnInterface[];
    tasks: TaskInterface[];
  }>;

  constructor(
    private boardsService: BoardsService,
    private route: ActivatedRoute,
    private router: Router,
    private boardService: BoardService,
    private socketService: SocketService,
    private columnsService: ColumnsService,
    private tasksService: TasksService
  ) {
    const boardId = this.route.snapshot.paramMap.get('boardId');

    if (!boardId) {
      throw new Error('Cant get Board Id from URL');
    }

    this.boardId = boardId;
    this.data$ = combineLatest([
      this.boardService.board$.pipe(filter(Boolean)),
      this.boardService.columns$,
      this.boardService.tasks$,
    ]).pipe(
      map(([board, columns, tasks]) => ({
        board,
        columns,
        tasks,
      }))
    );
  }

  ngOnInit(): void {
    this.socketService.emit(SocketEventEnum.boardsJoin, {
      boardId: this.boardId,
    });
    this.fetchData();
    this.initializeListeners();
  }

  initializeListeners(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        console.log('leaving a page');
        this.boardService.leaveBoard(this.boardId);
      }
    });

    this.socketService
      .listen<ColumnInterface>(SocketEventEnum.columnsCreateSuccess)
      .subscribe((column) => {
        console.log('column', column);
        this.boardService.addColumn(column);
      });

    this.socketService
      .listen<TaskInterface>(SocketEventEnum.tasksCreateSuccess)
      .subscribe((task) => {
        console.log('task', task);
        this.boardService.addTask(task);
      });

    this.socketService
      .listen<BoardInterface>(SocketEventEnum.boardsUpdateSuccess)
      .subscribe((updatedBoard) => {
        console.log('board', updatedBoard);
        this.boardService.updateBoard(updatedBoard);
      });

    this.socketService
      .listen<ColumnInterface>(SocketEventEnum.columnsUpdateSuccess)
      .subscribe((updatedColumn) => {
        this.boardService.updateColumn(updatedColumn);
      });

    this.socketService
      .listen<void>(SocketEventEnum.boardsDeleteSuccess)
      .subscribe(() => {
        this.router.navigateByUrl('/boards');
      });

    this.socketService
      .listen<string>(SocketEventEnum.columnsDeleteSuccess)
      .subscribe((columnId) => {
        this.boardService.deleteColumn(columnId);
      });
  }

  fetchData(): void {
    this.boardsService.getBoard(this.boardId).subscribe((board) => {
      this.boardService.setBoard(board);
    });
    this.columnsService.getColumns(this.boardId).subscribe((columns) => {
      this.boardService.setColumns(columns);
    });
    this.tasksService.getTasks(this.boardId).subscribe((tasks) => {
      this.boardService.setTasks(tasks);
    });
  }

  createColumn(title: string) {
    console.log('create column: ', title);
    const columnInput: ColumnInputInterface = {
      title,
      boardId: this.boardId,
    };

    this.columnsService.createColumn(columnInput);
  }

  getTasksByColumn(columnId: string, tasks: TaskInterface[]): TaskInterface[] {
    return tasks.filter((task) => task.columnId === columnId);
  }

  createTask(title: string, columnId: string) {
    console.log('create task: ', title);
    const taskInput: TaskInputInterface = {
      title,
      boardId: this.boardId,
      columnId,
    };

    this.tasksService.createTask(taskInput);
  }

  updateBoardName(boardName: string): void {
    this.boardsService.updateBoard(this.boardId, { title: boardName });
  }

  deleteboard(): void {
    if (confirm('Are you sure you want to delete the board?')) {
      this.boardsService.deleteBoard(this.boardId);
    }
  }

  deleteColumn(columnId: string): void {
    if (confirm('Are you sure you want to delete the column?')) {
      this.columnsService.deleteColumn(this.boardId, columnId);
    }
  }

  updateColumnName(columnName: string, columnId: string): void {
    this.columnsService.updateColumn(this.boardId, columnId, {
      title: columnName,
    });
  }
}
